"""
ComradeOS — User Schemas
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# --- Responses ---

class UserOut(BaseModel):
    id: str
    username: str
    phone_number: str
    rep_score: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileOut(BaseModel):
    id: str
    username: str
    rep_score: int


# --- Requests ---

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    phone_number: Optional[str] = Field(None, min_length=10, max_length=15)
