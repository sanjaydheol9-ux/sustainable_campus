from fastapi import APIRouter, Depends
from app.services.ai import generate_recommendations, generate_report
from app.schemas.ai import RecommendationResponse, ReportResponse

router = APIRouter()

@router.get("/ai/recommendation", response_model=RecommendationResponse)
def get_recommendation():
    # Placeholder deterministic recommendation logic
    return generate_recommendations()

@router.get("/ai/report", response_model=ReportResponse)
def get_report():
    # Placeholder report generation logic
    return generate_report()
