"""
ComradeOS — Authentication Endpoints
Handles user registration and login with JWT token issuance.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User

router = APIRouter()


# --- Request / Response Schemas ---

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, examples=["comrade_doe"])
    phone_number: str = Field(..., min_length=10, max_length=15, examples=["0712345678"])
    password: str = Field(..., min_length=6, examples=["strong_password"])


class LoginRequest(BaseModel):
    phone_number: str = Field(..., examples=["0712345678"])
    password: str = Field(..., examples=["strong_password"])


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    message: str


# --- Endpoints ---

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, summary="Register a new Comrade")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new user account.
    Returns a JWT access token on successful registration.
    """
    # Check if phone number is already taken
    existing_phone = db.query(User).filter(User.phone_number == data.phone_number).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This phone number is already registered. Login instead, comrade.",
        )

    # Check if username is already taken
    existing_username = db.query(User).filter(User.username == data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken. Try another one, comrade.",
        )

    # Create the new user
    new_user = User(
        username=data.username,
        phone_number=data.phone_number,
        password_hash=hash_password(data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue JWT token
    access_token = create_access_token(data={"sub": str(new_user.id)})

    return AuthResponse(
        access_token=access_token,
        username=new_user.username,
        message=f"Welcome to ComradeOS, {new_user.username}! Your journey begins now.",
    )


@router.post("/login", response_model=AuthResponse, summary="Login as an existing Comrade")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate with phone number and password.
    Returns a JWT access token on successful login.
    """
    user = db.query(User).filter(User.phone_number == data.phone_number).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password. Try again, comrade.",
        )

    # Issue JWT token
    access_token = create_access_token(data={"sub": str(user.id)})

    return AuthResponse(
        access_token=access_token,
        username=user.username,
        message=f"Welcome back, {user.username}! Vipi comrade?",
    )
