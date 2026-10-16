from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from datetime import datetime
from typing import Optional, List, Dict, Any

class Zone(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    zone_type: str
    x: int
    y: int
    width: int
    height: int
    baseline_energy_kw: float = 0.0
    after_hours_water_lpm: float = 0.0
    status: str = "unknown"
    readings: List["SensorReading"] = Relationship(back_populates="zone")
    alerts: List["Alert"] = Relationship(back_populates="zone")

class SensorReading(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    zone_id: int = Field(foreign_key="zone.id")
    metric: str
    value: float
    unit: str
    timestamp: datetime
    source: str  # simulated|sensor|manual|vision
    quality: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    zone: Zone = Relationship(back_populates="readings")

class Alert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    zone_id: int = Field(foreign_key="zone.id")
    alert_type: str
    severity: str  # critical|watch|info
    title: str
    description: str
    evidence_json: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    status: str = "open"  # open|acknowledged|resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)
    acknowledged_at: Optional[datetime] = None
    zone: Zone = Relationship(back_populates="alerts")

class VisionEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    zone_id: int = Field(foreign_key="zone.id")
    image_path: Optional[str] = None
    model_name: Optional[str] = None
    detections_json: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    source: str  # manual|sample|model
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Recommendation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    zone_id: Optional[int] = Field(default=None, foreign_key="zone.id")
    context_hash: str
    provider: str
    model: str
    result_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    fallback_used: bool = False

class SustainabilityReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    period_start: datetime
    period_end: datetime
    summary_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    source_snapshot_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
