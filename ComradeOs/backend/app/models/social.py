import uuid
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .user import Base

class Guild(Base):
    __tablename__ = "guilds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True)
    invite_code = Column(String(10), unique=True)
    total_xp = Column(Integer, default=0)

class GroupPool(Base):
    """Mbogi Wallet for group budget pools"""
    __tablename__ = "group_pools"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    guild_id = Column(UUID(as_uuid=True), ForeignKey("guilds.id"))
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)

class EncryptedMessage(Base):
    """Stores zero-knowledge encrypted blobs for Sanctuary/Vent"""
    __tablename__ = "encrypted_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    guild_id = Column(UUID(as_uuid=True), ForeignKey("guilds.id"), nullable=True) # Null if it's a personal vent
    encrypted_blob = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
