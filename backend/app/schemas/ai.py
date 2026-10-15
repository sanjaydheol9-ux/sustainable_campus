from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RecommendationAction(BaseModel):
    priority: str = Field(..., description="critical | high | medium | low")
    title: str
    issue: str
    recommended_action: str
    owner_team: str
    effort: str
    rationale: str
    follow_up_check: Optional[str] = None
    estimated_impact: Dict[str, Any]

class RecommendationResponse(BaseModel):
    zone_id: Optional[int]
    summary: str
    actions: List[RecommendationAction]
    provider: str
    fallback_used: bool
    evidence_ids: List[str]

class ReportResponse(BaseModel):
    report_title: str
    period_start: str
    period_end: str
    executive_summary: str
    key_findings: List[str]
    priority_actions: List[Dict[str, Any]]
    impact_estimates: List[Dict[str, Any]]
    data_limitations: List[str]
    source_snapshot_id: str
