"""
ComradeOS — Subscription (Comrade Pro) API
Full CRUD for subscription management.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.subscription import SubscriptionCreate, SubscriptionOut, SubscriptionUpdate
from app.services import subscription_service as svc

router = APIRouter()


@router.post("/", response_model=dict, status_code=201, summary="Subscribe to Comrade Pro")
def create_subscription(
    data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = svc.create_subscription(
        db,
        user_id=current_user.id,
        tier=data.tier,
        billing_cycle_end=data.billing_cycle_end,
    )
    return {
        "id": str(sub.id),
        "user_id": str(sub.user_id),
        "tier": sub.tier,
        "is_active": sub.is_active,
        "billing_cycle_end": sub.billing_cycle_end.isoformat() if sub.billing_cycle_end else None,
        "message": f"Comrade Pro ({sub.tier}) activated!",
    }


@router.get("/me", summary="Get My Subscription")
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = svc.get_subscription_for_user(db, current_user.id)
    if not sub:
        return {
            "tier": "free",
            "is_active": False,
            "message": "No active subscription. You're on the free tier, comrade.",
        }
    return {
        "id": str(sub.id),
        "tier": sub.tier,
        "is_active": sub.is_active,
        "billing_cycle_end": sub.billing_cycle_end.isoformat() if sub.billing_cycle_end else None,
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
    }


@router.patch("/me", summary="Update My Subscription")
def update_my_subscription(
    data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = svc.get_subscription_for_user(db, current_user.id)
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found. Create one first.")
    updated = svc.update_subscription(db, sub, data.model_dump())
    return {
        "id": str(updated.id),
        "tier": updated.tier,
        "is_active": updated.is_active,
        "message": "Subscription updated.",
    }


@router.delete("/me", status_code=204, summary="Cancel My Subscription")
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = svc.get_subscription_for_user(db, current_user.id)
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription to cancel.")
    svc.delete_subscription(db, sub)
