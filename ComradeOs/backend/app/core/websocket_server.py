import asyncio
import json
import logging
import os
from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect
import redis.asyncio as aioredis

logger = logging.getLogger("comradeos.websocket")

# In Docker, the redis service is named 'redis'
REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")
REDIS_CHANNEL = "comradeos:notifications"

class ConnectionManager:
    def __init__(self):
        # Maps user_id to a list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.redis = aioredis.from_url(REDIS_URL, decode_responses=True)
        self.pubsub = self.redis.pubsub()

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected for user: {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected for user: {user_id}")

    async def send_personal_message(self, message: dict, user_id: str):
        """Send a JSON message to all active sockets for a specific user."""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending ws message to user {user_id}: {e}")

    async def broadcast(self, message: dict):
        """Send a JSON message to all connected clients."""
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def _listen_to_redis(self):
        """Background task that listens to Redis Pub/Sub and dispatches to sockets."""
        await self.pubsub.subscribe(REDIS_CHANNEL)
        logger.info(f"Subscribed to Redis channel: {REDIS_CHANNEL}")
        
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        target_user = data.get("user_id")
                        payload = data.get("payload", {})
                        
                        if target_user:
                            await self.send_personal_message(payload, target_user)
                        else:
                            await self.broadcast(payload)
                    except json.JSONDecodeError:
                        logger.error("Failed to decode Redis pubsub message")
        except asyncio.CancelledError:
            logger.info("Redis listener task cancelled.")
        finally:
            await self.pubsub.unsubscribe(REDIS_CHANNEL)

    def start_redis_listener(self):
        """Spawns the Redis listener loop as an asyncio background task."""
        asyncio.create_task(self._listen_to_redis())

manager = ConnectionManager()
