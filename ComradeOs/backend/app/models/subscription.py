import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .user import Base

class Subscription(Base):
    """Tracks Comrade Pro Status"""
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    tier = Column(String(20), default="free") # 'free' or 'pro'
    is_active = Column(Boolean, default=True)
    billing_cycle_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
