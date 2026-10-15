from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.models import SensorReading
from app.core.db import get_session
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/telemetry")
def get_telemetry(
    zone_id: int = Query(None),
    metric: str = Query(None),
    limit: int = Query(20),
    session: Session = Depends(get_session),
):
    stmt = select(SensorReading)
    if zone_id is not None:
        stmt = stmt.where(SensorReading.zone_id == zone_id)
    if metric is not None:
        stmt = stmt.where(SensorReading.metric == metric)
    stmt = stmt.order_by(SensorReading.timestamp.desc()).limit(limit)
    readings = session.exec(stmt).all()
    return {
        "readings": [
            {
                "id": r.id,
                "zone_id": r.zone_id,
                "metric": r.metric,
                "value": r.value,
                "unit": r.unit,
                "timestamp": r.timestamp.isoformat() + "Z",
                "source": r.source,
            }
            for r in readings
        ]
    }
