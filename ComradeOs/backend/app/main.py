"""
ComradeOS — FastAPI Application Entry Point
Uses a lifespan context manager to ensure PostgreSQL is ready
before creating tables or serving any requests.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, wait_for_db, check_db_health
from app.models import Base

# Import all model modules so their tables are registered on the shared Base
import app.models.user
import app.models.transaction
import app.models.social
import app.models.marketplace
import app.models.subscription
import app.models.forge

logger = logging.getLogger("comradeos.startup")
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(name)s | %(levelname)s | %(message)s")


from app.core.security import decode_access_token
from app.core.websocket_server import manager
from fastapi import WebSocket, WebSocketDisconnect

# ---------------------------------------------------------------------------
# Lifespan — replaces the old top-level Base.metadata.create_all()
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: wait for Postgres with exponential backoff, then create tables.
    Start the Redis Pub/Sub background listener for real-time WebSockets.
    """
    logger.info("ComradeOS Engine starting up…")
    await wait_for_db(max_retries=10, base_delay=1.0)
    Base.metadata.create_all(bind=engine)
    logger.info("All database tables verified/created.")
    
    # Start Real-Time Redis Pub/Sub Listener
    manager.start_redis_listener()
    logger.info("WebSocket Redis listener started. Ready to serve.")
    
    yield
    logger.info("ComradeOS Engine shutting down.")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ComradeOS API",
    description="The core engine for the Kenyan Campus Ecosystem.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify Next.js and Flutter domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Route registration (deferred imports to avoid circular deps) ---
from app.api.v1 import auth, finance, forge, social, vybe, gcode, users, subscriptions, sanctuary  # noqa: E402

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(finance.router, prefix="/api/v1/finance", tags=["Finance"])
app.include_router(forge.router, prefix="/api/v1/forge", tags=["The Forge"])
app.include_router(social.router, prefix="/api/v1/social", tags=["Mbogi Network"])
app.include_router(vybe.router, prefix="/api/v1/vybe", tags=["Vybe Map & Marketplace"])
app.include_router(gcode.router, prefix="/api/v1/gcode", tags=["G-Code CV Builder"])
app.include_router(subscriptions.router, prefix="/api/v1/subscriptions", tags=["Subscriptions"])
app.include_router(sanctuary.router, prefix="/api/v1/sanctuary", tags=["The Sanctuary"])

# ---------------------------------------------------------------------------
# WebSocket Endpoint
# ---------------------------------------------------------------------------
@app.websocket("/api/v1/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    # Authenticate via JWT
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=1008)
        return
        
    user_id = payload["sub"]
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive, listen for any pings or messages if needed
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


# ---------------------------------------------------------------------------
# Health & root endpoints
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "ComradeOS Engine is running. Vipi comrade?",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/health/db", summary="Database Health Check")
async def db_health_check():
    """
    Probes the PostgreSQL connection and returns status + latency.
    Useful for container orchestration liveness/readiness probes.
    """
    result = check_db_health()
    if result["status"] == "unhealthy":
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content=result)
    return result
