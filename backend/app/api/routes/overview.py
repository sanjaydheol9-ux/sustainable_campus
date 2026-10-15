from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.models import Zone, Alert, SensorReading
from app.core.db import get_session
from datetime import datetime
from typing import List

router = APIRouter()

@router.get("/campus/overview")
def get_overview(session: Session = Depends(get_session)):
    # KPI calculations
    total_energy = session.exec(
        select(SensorReading).where(SensorReading.metric == "energy_kw")
    ).all()
    energy_total = sum(r.value for r in total_energy)

    total_water = session.exec(
        select(SensorReading).where(SensorReading.metric == "water_lpm")
    ).all()
    water_total = sum(r.value for r in total_water)

    open_alerts = session.exec(select(Alert).where(Alert.status == "open")).all()
    critical_alerts = [a for a in open_alerts if a.severity == "critical"]
    watch_alerts = [a for a in open_alerts if a.severity == "watch"]

    zone_counts = {
        "healthy": 0,
        "watch": len(watch_alerts),
        "critical": len(critical_alerts),
    }
    # simple health status count (zones without open alerts considered healthy)
    zones = session.exec(select(Zone)).all()
    zones_with_alert = {a.zone_id for a in open_alerts}
    zone_counts["healthy"] = len([z for z in zones if z.id not in zones_with_alert])

    return {
        "data_mode": "demo",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "kpis": {
            "open_alerts": len(open_alerts),
            "critical_alerts": len(critical_alerts),
            "energy_kw_total": round(energy_total, 2),
            "water_lpm_total": round(water_total, 2),
            "zones_monitored": len(zones),
        },
        "zone_status_counts": zone_counts,
        "recent_alerts": [],
    }
