"""
ComradeOS — User Profile API
CRUD operations for user profile management.
Auth endpoints (register/login) remain in auth.py.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.services import user_service as svc

router = APIRouter()


@router.get("/me", summary="Get My Profile")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "phone_number": current_user.phone_number,
        "rep_score": current_user.rep_score,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.patch("/me", summary="Update My Profile")
def update_my_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = svc.update_user(db, current_user, data.model_dump())
    return {
        "id": str(updated.id),
        "username": updated.username,
        "phone_number": updated.phone_number,
        "message": "Profile updated, comrade.",
    }


@router.delete("/me", status_code=204, summary="Delete My Account")
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc.delete_user(db, current_user)


@router.get("/{user_id}", summary="Get User by ID (Public Profile)")
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = svc.get_user_by_id(db, user_id)
    return {
        "id": str(user.id),
        "username": user.username,
        "rep_score": user.rep_score,
    }


@router.get("/", summary="List Users")
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    users = svc.get_all_users(db, skip=skip, limit=limit)
    return {
        "users": [
            {
                "id": str(u.id),
                "username": u.username,
                "rep_score": u.rep_score,
            }
            for u in users
        ],
        "total": len(users),
    }
