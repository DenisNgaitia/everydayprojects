import json
import logging
from app.core.websocket_server import REDIS_URL, REDIS_CHANNEL
import redis.asyncio as aioredis

logger = logging.getLogger("comradeos.notifications")

# Create a dedicated redis client for publishing
publisher = aioredis.from_url(REDIS_URL, decode_responses=True)

async def publish_event(user_id: str, event_type: str, payload: dict):
    """
    Publishes an event to the global Redis notifications channel.
    The ConnectionManager will pick this up and route it to the specific user's WebSockets.
    """
    message = {
        "user_id": user_id,
        "payload": {
            "type": event_type,
            "data": payload
        }
    }
    try:
        await publisher.publish(REDIS_CHANNEL, json.dumps(message))
        logger.debug(f"Published {event_type} event to user {user_id}")
    except Exception as e:
        logger.error(f"Failed to publish event to Redis: {e}")

async def push_transaction_update(user_id: str, count: int):
    """Notify the frontend that transactions have been synced and the dashboard should refresh."""
    await publish_event(
        user_id=user_id,
        event_type="TRANSACTION_UPDATE",
        payload={
            "message": f"Successfully synced {count} transactions.",
            "action": "REFRESH_FINANCE"
        }
    )

async def push_crisis_alert(user_id: str, message: str):
    """Notify the frontend of an immediate crisis intervention."""
    await publish_event(
        user_id=user_id,
        event_type="CRISIS_ALERT",
        payload={
            "message": message,
            "level": "critical"
        }
    )
