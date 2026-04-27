"""
ComradeOS — Subscription Schemas
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class SubscriptionCreate(BaseModel):
    tier: str = Field("pro", pattern="^(free|pro)$", examples=["pro"])
    billing_cycle_end: Optional[datetime] = Field(None, examples=["2026-05-25T00:00:00"])


class SubscriptionOut(BaseModel):
    id: str
    user_id: str
    tier: str
    is_active: bool
    billing_cycle_end: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriptionUpdate(BaseModel):
    tier: Optional[str] = Field(None, pattern="^(free|pro)$")
    is_active: Optional[bool] = None
    billing_cycle_end: Optional[datetime] = None
