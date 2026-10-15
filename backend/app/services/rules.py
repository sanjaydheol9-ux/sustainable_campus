from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.models import Zone, SensorReading, Alert
from app.core.db import get_session, engine

# Default thresholds – can be overridden via env later
ENERGY_THRESHOLD_FACTOR = 1.1  # 10% above baseline
WATER_AFTER_HOURS_MULTIPLIER = 1.5
WASTE_FILL_THRESHOLD = 85  # percent

def evaluate_zone_rules(session: Session, zone: Zone) -> List[Alert]:
    """Evaluate deterministic rules for a single zone and return any new alerts.
    Existing open alerts of the same type are not duplicated.
    """
    alerts_to_create: List[Alert] = []
    # Get latest readings per metric for this zone
    latest = {}
    stmt = select(SensorReading).where(SensorReading.zone_id == zone.id).order_by(SensorReading.timestamp.desc())
    for reading in session.exec(stmt):
        if reading.metric not in latest:
            latest[reading.metric] = reading
        if len(latest) == 4:  # we care about 4 metrics
            break

    # --- Energy waste rule ---
    occ = latest.get("occupancy_count")
    energy = latest.get("energy_kw")
    if occ and energy:
        if occ.value == 0 and energy.value > zone.baseline_energy_kw * ENERGY_THRESHOLD_FACTOR:
            alerts_to_create.append(
                Alert(
                    zone_id=zone.id,
                    alert_type="energy_waste",
                    severity="watch",
                    title="Possible energy waste (occupancy zero)",
                    description="Energy consumption exceeds baseline while no occupants are detected.",
                    evidence_json={"energy_kw": energy.value, "occupancy": occ.value},
                    status="open",
                )
            )
    # --- Water leak rule (after‑hours) ---
    water = latest.get("water_lpm")
    if water:
        # Determine if current hour is outside 8‑18 (after‑hours)
        hour = water.timestamp.hour
        after_hours = hour < 8 or hour > 18
        if after_hours and water.value > zone.after_hours_water_lpm * WATER_AFTER_HOURS_MULTIPLIER:
            alerts_to_create.append(
                Alert(
                    zone_id=zone.id,
                    alert_type="water_leak",
                    severity="watch",
                    title="After‑hours water flow detected",
                    description="Water flow exceeds expected after‑hours threshold.",
                    evidence_json={"water_lpm": water.value, "hour": hour},
                    status="open",
                )
            )
    # --- Waste accumulation rule ---
    waste = latest.get("waste_level_pct")
    if waste and waste.value >= WASTE_FILL_THRESHOLD:
        alerts_to_create.append(
            Alert(
                zone_id=zone.id,
                alert_type="waste_fill",
                severity="critical",
                title="Waste bin near capacity",
                description="Waste level exceeds 85% of bin capacity.",
                evidence_json={"waste_pct": waste.value},
                status="open",
            )
        )
    return alerts_to_create

def run_rule_engine():
    """Iterate over all zones, evaluate rules, and upsert alerts.
    Duplicate open alerts of the same type are not created.
    """
    with Session(engine) as session:
        zones = session.exec(select(Zone)).all()
        for zone in zones:
            new_alerts = evaluate_zone_rules(session, zone)
            for alert in new_alerts:
                # Check for existing open alert of same type for this zone
                exists = session.exec(
                    select(Alert)
                    .where(Alert.zone_id == zone.id)
                    .where(Alert.alert_type == alert.alert_type)
                    .where(Alert.status == "open")
                ).first()
                if not exists:
                    session.add(alert)
        session.commit()
        print(f"✅ Rule engine run – processed {len(zones)} zones")
