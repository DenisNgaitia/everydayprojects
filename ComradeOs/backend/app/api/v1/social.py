"""
ComradeOS — Social (Mbogi Network) API
Full CRUD for Guilds, Group Pools, and Encrypted Messages.
All mock data eliminated — every operation persists to PostgreSQL.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.social import (
    GuildCreate, GuildOut, GuildUpdate,
    GroupPoolCreate, GroupPoolOut, PoolContribute,
    EncryptedMessageCreate, EncryptedMessageOut,
)
from app.services import social_service as svc

router = APIRouter()


# ═══════════════════════════ GUILDS ═══════════════════════════

@router.post("/guilds", response_model=dict, status_code=201, summary="Create an Mbogi Guild")
def create_guild(
    data: GuildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    guild = svc.create_guild(db, name=data.name)
    return {
        "id": str(guild.id),
        "name": guild.name,
        "invite_code": guild.invite_code,
        "total_xp": guild.total_xp,
        "message": f"Mbogi '{guild.name}' created. Share code: {guild.invite_code}",
    }


@router.get("/guilds", summary="List all Guilds")
def list_guilds(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    guilds = svc.get_all_guilds(db, skip=skip, limit=limit)
    return {
        "guilds": [
            {
                "id": str(g.id),
                "name": g.name,
                "invite_code": g.invite_code,
                "total_xp": g.total_xp,
            }
            for g in guilds
        ],
        "total": len(guilds),
    }


@router.get("/guilds/{guild_id}", summary="Get Guild by ID")
def get_guild(guild_id: str, db: Session = Depends(get_db)):
    guild = svc.get_guild_by_id(db, guild_id)
    return {
        "id": str(guild.id),
        "name": guild.name,
        "invite_code": guild.invite_code,
        "total_xp": guild.total_xp,
    }


@router.patch("/guilds/{guild_id}", summary="Update Guild")
def update_guild(
    guild_id: str,
    data: GuildUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    guild = svc.get_guild_by_id(db, guild_id)
    updated = svc.update_guild(db, guild, data.model_dump())
    return {
        "id": str(updated.id),
        "name": updated.name,
        "message": "Guild updated successfully.",
    }


@router.delete("/guilds/{guild_id}", status_code=204, summary="Delete Guild")
def delete_guild(
    guild_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    guild = svc.get_guild_by_id(db, guild_id)
    svc.delete_guild(db, guild)


# ═══════════════════════ GROUP POOLS ═══════════════════════

@router.post("/pools", response_model=dict, status_code=201, summary="Create a Group Pool")
def create_pool(
    data: GroupPoolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pool = svc.create_pool(db, guild_id=data.guild_id, target_amount=data.target_amount)
    return {
        "id": str(pool.id),
        "guild_id": str(pool.guild_id),
        "target_amount": pool.target_amount,
        "current_amount": pool.current_amount,
        "message": f"Pool created with target Ksh {pool.target_amount}.",
    }


@router.get("/pools/{guild_id}", summary="Get Pools for a Guild")
def get_guild_pools(guild_id: str, db: Session = Depends(get_db)):
    pools = svc.get_pools_for_guild(db, guild_id)
    return {
        "pools": [
            {
                "id": str(p.id),
                "guild_id": str(p.guild_id),
                "target_amount": p.target_amount,
                "current_amount": p.current_amount,
            }
            for p in pools
        ],
        "total": len(pools),
    }


@router.post("/pools/{pool_id}/contribute", summary="Contribute to Mbogi Wallet")
def contribute_to_pool(
    pool_id: str,
    data: PoolContribute,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pool = svc.get_pool_by_id(db, pool_id)
    updated = svc.contribute_to_pool(db, pool, data.amount)
    return {
        "id": str(updated.id),
        "current_amount": updated.current_amount,
        "target_amount": updated.target_amount,
        "message": f"Ksh {data.amount} locked in the Mbogi Vault.",
    }


@router.delete("/pools/{pool_id}", status_code=204, summary="Delete a Pool")
def delete_pool(
    pool_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pool = svc.get_pool_by_id(db, pool_id)
    svc.delete_pool(db, pool)


# ═══════════════════ ENCRYPTED MESSAGES ═══════════════════

@router.post("/chat/send", response_model=dict, status_code=201, summary="Send Encrypted Message")
def send_message(
    data: EncryptedMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = svc.create_message(
        db,
        sender_id=current_user.id,
        encrypted_blob=data.encrypted_blob,
        guild_id=data.guild_id,
    )
    return {
        "id": str(msg.id),
        "sender_id": str(msg.sender_id),
        "guild_id": str(msg.guild_id) if msg.guild_id else None,
        "timestamp": msg.timestamp.isoformat(),
        "message": "Ciphertext safely stored. Zero-knowledge maintained.",
    }


@router.get("/chat/guild/{guild_id}", summary="Get Guild Messages")
def get_guild_messages(
    guild_id: str,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msgs = svc.get_messages_for_guild(db, guild_id, limit=limit)
    return {
        "messages": [
            {
                "id": str(m.id),
                "sender_id": str(m.sender_id),
                "encrypted_blob": m.encrypted_blob,
                "timestamp": m.timestamp.isoformat(),
            }
            for m in msgs
        ],
        "total": len(msgs),
    }


@router.get("/chat/vents", summary="Get Personal Vents")
def get_personal_vents(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msgs = svc.get_personal_vents(db, current_user.id, limit=limit)
    return {
        "vents": [
            {
                "id": str(m.id),
                "encrypted_blob": m.encrypted_blob,
                "timestamp": m.timestamp.isoformat(),
            }
            for m in msgs
        ],
        "total": len(msgs),
    }


@router.delete("/chat/{message_id}", status_code=204, summary="Delete a Message")
def delete_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.social import EncryptedMessage
    msg = db.query(EncryptedMessage).filter(EncryptedMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")
    if msg.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages.")
    svc.delete_message(db, msg)
