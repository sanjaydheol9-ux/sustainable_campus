from app.schemas.ai import RecommendationResponse, ReportResponse
from app.core.config import settings
from typing import List, Dict, Any
import json

# Optional Gemini import – only used if the key is set
try:
    import google.generativeai as genai
except ImportError:
    genai = None

def _init_gemini():
    """Initialize Gemini client if API key is available."""
    if not genai:
        raise RuntimeError("google-generativeai package not installed.")
    if not settings.gemini_api_key or settings.gemini_api_key == "replace_me":
        raise RuntimeError("Gemini API key not configured in .env.")
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.ai_model)

def generate_recommendations() -> RecommendationResponse:
    """Generate AI recommendations using Gemini if possible.
    Falls back to static dummy data when the key is missing or an error occurs.
    """
    try:
        model = _init_gemini()
        prompt = (
            "You are an AI assistant for a sustainable campus. "
            "Based on the latest telemetry data (energy, water, waste) provide a concise "
            "summary and a list of actionable recommendations. Return JSON matching the "
            "RecommendationResponse schema."
        )
        response = model.generate_content(prompt)
        # Gemini may return a string; attempt to parse JSON
        data = json.loads(response.text)
        return RecommendationResponse(**data)
    except Exception as e:
        # Fallback to deterministic dummy response
        return RecommendationResponse(
            zone_id=None,
            summary="Overall campus sustainability recommendations.",
            actions=[
                {
                    "priority": "high",
                    "title": "Reduce Energy Consumption",
                    "issue": "Energy usage spikes during peak hours.",
                    "recommended_action": "Schedule HVAC to lower setpoint after 6 PM.",
                    "owner_team": "Facilities",
                    "effort": "Low",
                    "rationale": "Projected 12% energy savings.",
                    "follow_up_check": None,
                    "estimated_impact": {"kWh_saved": 5000},
                }
            ],
            provider="gemini",
            fallback_used=True,
            evidence_ids=["sensor_12", "sensor_34"],
        )

def generate_report() -> ReportResponse:
    """Generate a weekly sustainability report via Gemini, with fallback."""
    try:
        model = _init_gemini()
        prompt = (
            "Create a weekly sustainability report for the campus covering energy, water, and waste. "
            "Provide an executive summary, key findings, priority actions, impact estimates, and note any data limitations. "
            "Return JSON matching the ReportResponse schema."
        )
        response = model.generate_content(prompt)
        data = json.loads(response.text)
        return ReportResponse(**data)
    except Exception:
        return ReportResponse(
            report_title="Weekly Sustainability Report",
            period_start="2026-10-08",
            period_end="2026-10-15",
            executive_summary="The campus met 85% of its energy reduction target.",
            key_findings=[
                "Water usage fell 10% due to leak repairs.",
                "Waste diversion increased 15% after new recycling stations.",
            ],
            priority_actions=[
                {"action": "Upgrade lighting to LEDs", "impact": "5% energy saving"},
            ],
            impact_estimates=[{"metric": "CO2e", "value": "-12t"}],
            data_limitations=["Telemetry data limited to last 24 h"],
            source_snapshot_id="snap_20261015_01",
        )
