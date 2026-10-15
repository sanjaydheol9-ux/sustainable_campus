from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models import Alert
from app.core.db import get_session
from typing import List

router = APIRouter()

@router.get("/alerts")
def list_alerts(status: str = None, severity: str = None, session: Session = Depends(get_session)):
    stmt = select(Alert)
    if status:
        stmt = stmt.where(Alert.status == status)
    if severity:
        stmt = stmt.where(Alert.severity == severity)
    alerts = session.exec(stmt.order_by(Alert.created_at.desc())).all()
    return {
        "alerts": [
            {
                "id": a.id,
                "zone_id": a.zone_id,
                "type": a.alert_type,
                "severity": a.severity,
                "title": a.title,
                "description": a.description,
                "status": a.status,
                "created_at": a.created_at.isoformat() + "Z",
                "acknowledged_at": a.acknowledged_at.isoformat() + "Z" if a.acknowledged_at else None,
            }
            for a in alerts
        ]
    }

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, session: Session = Depends(get_session)):
    alert = session.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.status != "open":
        raise HTTPException(status_code=400, detail="Alert is not open")
    alert.status = "acknowledged"
    from datetime import datetime
    alert.acknowledged_at = datetime.utcnow()
    session.add(alert)
    session.commit()
    return {"detail": f"Alert {alert_id} acknowledged"}
