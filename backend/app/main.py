from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, overview, zones, telemetry, alerts, demo, ai

app = FastAPI(title="Sustainable Campus API", version="0.1.0")

# CORS middleware – allow frontend origin during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.api_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(overview.router, prefix="/api/v1")
app.include_router(zones.router, prefix="/api/v1")
app.include_router(telemetry.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(demo.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

# Root health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "app_version": "0.1.0",
        "ai_enabled": settings.ai_enabled,
    }
