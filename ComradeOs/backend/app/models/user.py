import uuid
from sqlalchemy import Column, String, Integer, DateTime, Uuid
from datetime import datetime
from app.models import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, index=True)
    phone_number = Column(String(15), unique=True, index=True)
    password_hash = Column(String(255))
    rep_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
