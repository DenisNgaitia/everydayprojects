import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Uuid
from datetime import datetime
from app.models import Base

class Subscription(Base):
    """Tracks Comrade Pro Status"""
    __tablename__ = "subscriptions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), unique=True)
    tier = Column(String(20), default="free") # 'free' or 'pro'
    is_active = Column(Boolean, default=True)
    billing_cycle_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
