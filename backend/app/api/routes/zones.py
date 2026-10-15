from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models import Zone, SensorReading, Alert
from app.core.db import get_session
from typing import List

router = APIRouter()

@router.get("/zones")
def list_zones(session: Session = Depends(get_session)):
    zones = session.exec(select(Zone)).all()
    # Compute status per zone based on highest severity open alert
    result = []
    for zone in zones:
        alerts = session.exec(
            select(Alert).where(Alert.zone_id == zone.id).where(Alert.status == "open")
        ).all()
        severity_order = {"critical": 3, "watch": 2, "info": 1, None: 0}
        max_sev = max([severity_order.get(a.severity, 0) for a in alerts], default=0)
        status = "healthy"
        if max_sev == 3:
            status = "critical"
        elif max_sev == 2:
            status = "watch"
        result.append({
            "id": zone.id,
            "name": zone.name,
            "zone_type": zone.zone_type,
            "x": zone.x,
            "y": zone.y,
            "width": zone.width,
            "height": zone.height,
            "status": status,
        })
    return {"zones": result}

@router.get("/zones/{zone_id}")
def get_zone_detail(zone_id: int, session: Session = Depends(get_session)):
    zone = session.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    # recent readings (last 10 per metric)
    recent_readings = {}
    stmt = select(SensorReading).where(SensorReading.zone_id == zone_id).order_by(SensorReading.timestamp.desc())
    for reading in session.exec(stmt):
        if reading.metric not in recent_readings:
            recent_readings[reading.metric] = reading
        if len(recent_readings) == 4:
            break
    # active alerts
    alerts = session.exec(
        select(Alert).where(Alert.zone_id == zone_id).where(Alert.status == "open")
    ).all()
    return {
        "zone": {
            "id": zone.id,
            "name": zone.name,
            "zone_type": zone.zone_type,
            "x": zone.x,
            "y": zone.y,
            "width": zone.width,
            "height": zone.height,
            "status": zone.status,
        },
        "recent_readings": [
            {
                "metric": r.metric,
                "value": r.value,
                "unit": r.unit,
                "timestamp": r.timestamp.isoformat() + "Z",
                "source": r.source,
            }
            for r in recent_readings.values()
        ],
        "active_alerts": [
            {
                "id": a.id,
                "type": a.alert_type,
                "severity": a.severity,
                "title": a.title,
                "description": a.description,
                "created_at": a.created_at.isoformat() + "Z",
            }
            for a in alerts
        ],
    }
