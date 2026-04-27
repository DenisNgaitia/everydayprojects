"""
ComradeOS — Social Schemas (Guilds, Pools, Encrypted Messages)
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# --- Guild ---

class GuildCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, examples=["DeFi Comrades"])


class GuildOut(BaseModel):
    id: str
    name: str
    invite_code: str
    total_xp: int

    class Config:
        from_attributes = True


class GuildUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)


# --- Group Pool ---

class GroupPoolCreate(BaseModel):
    guild_id: str = Field(..., examples=["<guild-uuid>"])
    target_amount: float = Field(..., gt=0, examples=[5000.0])


class GroupPoolOut(BaseModel):
    id: str
    guild_id: str
    target_amount: float
    current_amount: float

    class Config:
        from_attributes = True


class PoolContribute(BaseModel):
    amount: float = Field(..., gt=0, examples=[250.0])


# --- Encrypted Messages ---

class EncryptedMessageCreate(BaseModel):
    guild_id: Optional[str] = Field(None, examples=["<guild-uuid>"])
    encrypted_blob: str = Field(..., min_length=1)


class EncryptedMessageOut(BaseModel):
    id: str
    sender_id: str
    guild_id: Optional[str]
    encrypted_blob: str
    timestamp: datetime

    class Config:
        from_attributes = True
