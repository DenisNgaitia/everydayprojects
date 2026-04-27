"""
ComradeOS — Database Engine
Provides both sync (for ORM route handlers) and async (for startup probing) engines.
Implements exponential-backoff retry logic to wait for PostgreSQL readiness
before any ORM operations run.
"""

import asyncio
import logging
import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger("comradeos.database")

# ---------------------------------------------------------------------------
# URL resolution
# ---------------------------------------------------------------------------
SQLALCHEMY_DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "sqlite:///./comradeos.db",  # Fallback for local prototyping without Postgres
)

# Cloud providers sometimes expose 'postgres://' — SQLAlchemy requires 'postgresql://'
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

# connect_args is only needed for SQLite's single-thread constraint
_connect_args = (
    {"check_same_thread": False}
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite")
    else {}
)

# ---------------------------------------------------------------------------
# Sync engine & session — used by all route handlers via Depends(get_db)
# ---------------------------------------------------------------------------
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=_connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency: yields a scoped SQLAlchemy session, auto-closes on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Startup readiness probe — async retry with exponential backoff
# ---------------------------------------------------------------------------
async def wait_for_db(max_retries: int = 10, base_delay: float = 1.0) -> None:
    """
    Block the startup lifespan until a SELECT 1 against PostgreSQL succeeds.
    Uses exponential backoff: 1s → 2s → 4s → … capped at 30s per attempt.
    For SQLite this returns immediately (no network dependency).
    """
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        logger.info("SQLite detected — skipping readiness probe.")
        return

    for attempt in range(1, max_retries + 1):
        try:
            # Use a short-lived connection from the sync engine in a thread
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("PostgreSQL is ready (attempt %d/%d).", attempt, max_retries)
            return
        except Exception as exc:
            delay = min(base_delay * (2 ** (attempt - 1)), 30.0)
            logger.warning(
                "PostgreSQL not ready (attempt %d/%d): %s — retrying in %.1fs",
                attempt,
                max_retries,
                exc,
                delay,
            )
            await asyncio.sleep(delay)

    raise RuntimeError(
        f"Could not connect to PostgreSQL after {max_retries} attempts. "
        "Check DATABASE_URL and ensure the database container is running."
    )


def check_db_health() -> dict:
    """
    Synchronous health probe used by the /health/db endpoint.
    Returns a status dict with connection latency.
    """
    import time

    start = time.monotonic()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency_ms = round((time.monotonic() - start) * 1000, 2)
        return {"status": "healthy", "latency_ms": latency_ms}
    except Exception as exc:
        return {"status": "unhealthy", "error": str(exc)}
