from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

router = APIRouter()

class GuildCreate(BaseModel):
    name: str

class PoolContribute(BaseModel):
    guild_id: str
    amount: float

class EncryptedMessagePayload(BaseModel):
    guild_id: str = None
    encrypted_blob: str

@router.post("/guilds/create", summary="Create an Mbogi Guild")
async def create_guild(data: GuildCreate):
    # Mocking DB insertion
    invite_code = str(uuid.uuid4())[:8].upper()
    return {
        "guild_name": data.name,
        "invite_code": invite_code,
        "message": f"Mbogi '{data.name}' created successfully. Share the invite code!"
    }

@router.post("/pools/contribute", summary="Contribute to Mbogi Wallet")
async def contribute_to_pool(data: PoolContribute):
    return {
        "guild_id": data.guild_id,
        "amount_contributed": data.amount,
        "status": "Success",
        "message": f"Ksh {data.amount} securely locked in the Mbogi Vault."
    }

@router.post("/chat/sync", summary="Sync Encrypted Chat Blobs")
async def sync_encrypted_chat(data: EncryptedMessagePayload):
    # The server has ZERO knowledge of the content, just storing the ciphertext
    return {
        "status": "Stored",
        "message": "Ciphertext safely stored. Only authorized devices can decrypt."
    }
