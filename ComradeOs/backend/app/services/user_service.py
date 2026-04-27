"""
ComradeOS — User Service Layer
All database operations for the User model.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.core.security import hash_password


def get_user_by_id(db: Session, user_id) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found, comrade.")
    return user


def get_all_users(db: Session, skip: int = 0, limit: int = 50) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def update_user(db: Session, user: User, updates: dict) -> User:
    """Apply partial updates to a user record."""
    update_data = {k: v for k, v in updates.items() if v is not None}

    if "username" in update_data:
        existing = db.query(User).filter(
            User.username == update_data["username"],
            User.id != user.id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This username is already taken.",
            )

    if "phone_number" in update_data:
        existing = db.query(User).filter(
            User.phone_number == update_data["phone_number"],
            User.id != user.id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This phone number is already registered.",
            )

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
