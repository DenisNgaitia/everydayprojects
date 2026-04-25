from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import finance, forge, social, vybe, gcode
from app.core.database import engine
from app.models import Base

# Import all model modules so their tables are registered on the shared Base
import app.models.user
import app.models.transaction
import app.models.social
import app.models.marketplace
import app.models.subscription

# Create all database tables from the single shared Base
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ComradeOS API",
    description="The core engine for the Kenyan Campus Ecosystem.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify Next.js and Flutter domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(finance.router, prefix="/api/v1/finance", tags=["Finance"])
app.include_router(forge.router, prefix="/api/v1/forge", tags=["The Forge"])
app.include_router(social.router, prefix="/api/v1/social", tags=["Mbogi Network"])
app.include_router(vybe.router, prefix="/api/v1/vybe", tags=["Vybe Map & Marketplace"])
app.include_router(gcode.router, prefix="/api/v1/gcode", tags=["G-Code CV Builder"])

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "ComradeOS Engine is running. Vipi comrade?",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
