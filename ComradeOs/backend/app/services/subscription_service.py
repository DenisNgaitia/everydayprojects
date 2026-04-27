"""
ComradeOS — Subscription Service Layer
Database operations for Comrade Pro subscriptions.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.subscription import Subscription


def get_subscription_for_user(db: Session, user_id) -> Subscription | None:
    return db.query(Subscription).filter(Subscription.user_id == user_id).first()


def create_subscription(db: Session, user_id, tier: str = "pro", billing_cycle_end=None) -> Subscription:
    existing = db.query(Subscription).filter(Subscription.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="User already has a subscription. Use PATCH to update.")
    sub = Subscription(
        user_id=user_id,
        tier=tier,
        billing_cycle_end=billing_cycle_end,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def update_subscription(db: Session, sub: Subscription, updates: dict) -> Subscription:
    for key, value in updates.items():
        if value is not None:
            setattr(sub, key, value)
    db.commit()
    db.refresh(sub)
    return sub


def delete_subscription(db: Session, sub: Subscription) -> None:
    db.delete(sub)
    db.commit()
