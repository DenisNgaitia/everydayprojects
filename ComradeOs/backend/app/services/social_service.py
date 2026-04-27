"""
ComradeOS — Social Service Layer
Database operations for Guilds, Group Pools, and Encrypted Messages.
"""

import uuid as _uuid

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.social import Guild, GroupPool, EncryptedMessage


# ───────────────────────── Guild ─────────────────────────

def create_guild(db: Session, name: str) -> Guild:
    existing = db.query(Guild).filter(Guild.name == name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A guild named '{name}' already exists.",
        )
    invite_code = str(_uuid.uuid4())[:8].upper()
    guild = Guild(name=name, invite_code=invite_code)
    db.add(guild)
    db.commit()
    db.refresh(guild)
    return guild


def get_guild_by_id(db: Session, guild_id) -> Guild:
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found.")
    return guild


def get_all_guilds(db: Session, skip: int = 0, limit: int = 50) -> list[Guild]:
    return db.query(Guild).offset(skip).limit(limit).all()


def update_guild(db: Session, guild: Guild, updates: dict) -> Guild:
    update_data = {k: v for k, v in updates.items() if v is not None}
    if "name" in update_data:
        existing = db.query(Guild).filter(
            Guild.name == update_data["name"],
            Guild.id != guild.id,
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Guild name already taken.")
    for key, value in update_data.items():
        setattr(guild, key, value)
    db.commit()
    db.refresh(guild)
    return guild


def delete_guild(db: Session, guild: Guild) -> None:
    db.delete(guild)
    db.commit()


# ───────────────────────── Group Pool ─────────────────────────

def create_pool(db: Session, guild_id, target_amount: float) -> GroupPool:
    # Verify the guild exists
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found.")
    pool = GroupPool(guild_id=guild_id, target_amount=target_amount)
    db.add(pool)
    db.commit()
    db.refresh(pool)
    return pool


def get_pool_by_id(db: Session, pool_id) -> GroupPool:
    pool = db.query(GroupPool).filter(GroupPool.id == pool_id).first()
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found.")
    return pool


def get_pools_for_guild(db: Session, guild_id) -> list[GroupPool]:
    return db.query(GroupPool).filter(GroupPool.guild_id == guild_id).all()


def contribute_to_pool(db: Session, pool: GroupPool, amount: float) -> GroupPool:
    pool.current_amount = (pool.current_amount or 0.0) + amount
    db.commit()
    db.refresh(pool)
    return pool


def delete_pool(db: Session, pool: GroupPool) -> None:
    db.delete(pool)
    db.commit()


# ───────────────────────── Encrypted Messages ─────────────────────────

def create_message(db: Session, sender_id, encrypted_blob: str, guild_id=None) -> EncryptedMessage:
    msg = EncryptedMessage(
        sender_id=sender_id,
        guild_id=guild_id,
        encrypted_blob=encrypted_blob,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_messages_for_guild(db: Session, guild_id, limit: int = 50) -> list[EncryptedMessage]:
    return (
        db.query(EncryptedMessage)
        .filter(EncryptedMessage.guild_id == guild_id)
        .order_by(EncryptedMessage.timestamp.desc())
        .limit(limit)
        .all()
    )


def get_personal_vents(db: Session, user_id, limit: int = 50) -> list[EncryptedMessage]:
    return (
        db.query(EncryptedMessage)
        .filter(
            EncryptedMessage.sender_id == user_id,
            EncryptedMessage.guild_id.is_(None),
        )
        .order_by(EncryptedMessage.timestamp.desc())
        .limit(limit)
        .all()
    )


def delete_message(db: Session, msg: EncryptedMessage) -> None:
    db.delete(msg)
    db.commit()
