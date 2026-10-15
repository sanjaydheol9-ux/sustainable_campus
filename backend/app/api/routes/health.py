from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "app_version": "0.1.0",
        "ai_enabled": settings.ai_enabled,
    }
