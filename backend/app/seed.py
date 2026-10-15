from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.core.db import get_session, engine
from app.models import Zone, SensorReading

# Predefined zones matching the PRD
ZONE_DEFINITIONS = [
    {
        "name": "Library Block",
        "zone_type": "academic",
        "x": 50,
        "y": 50,
        "width": 120,
        "height": 80,
        "baseline_energy_kw": 5.0,
        "after_hours_water_lpm": 0.2,
    },
    {
        "name": "Canteen",
        "zone_type": "food",
        "x": 200,
        "y": 50,
        "width": 120,
        "height": 80,
        "baseline_energy_kw": 3.5,
        "after_hours_water_lpm": 0.5,
    },
    {
        "name": "Academic Block A",
        "zone_type": "academic",
        "x": 350,
        "y": 50,
        "width": 120,
        "height": 80,
        "baseline_energy_kw": 4.5,
        "after_hours_water_lpm": 0.3,
    },
    {
        "name": "Hostel Block",
        "zone_type": "residence",
        "x": 50,
        "y": 180,
        "width": 120,
        "height": 80,
        "baseline_energy_kw": 6.0,
        "after_hours_water_lpm": 1.0,
    },
    {
        "name": "Parking Area",
        "zone_type": "facility",
        "x": 200,
        "y": 180,
        "width": 120,
        "height": 80,
        "baseline_energy_kw": 2.0,
        "after_hours_water_lpm": 0.1,
    },
    {
        "name": "Garden / Irrigation",
        "zone_type": "outdoor",
        "x": 350,
        "y": 180,
        "width": 120,
        "height": 80,
        "baseline_energy_kw": 1.0,
        "after_hours_water_lpm": 0.8,
    },
]

def seed_zones_and_readings():
    """Create zones and a 24‑hour window of seeded telemetry.
    All timestamps are UTC and spaced 15 minutes apart.
    """
    with Session(engine) as session:
        # Clear existing data (for repeatable demos)
        session.exec(select(Zone)).delete()
        session.commit()

        zones = []
        for idx, defn in enumerate(ZONE_DEFINITIONS, start=1):
            zone = Zone(
                name=defn["name"],
                zone_type=defn["zone_type"],
                x=defn["x"],
                y=defn["y"],
                width=defn["width"],
                height=defn["height"],
                baseline_energy_kw=defn["baseline_energy_kw"],
                after_hours_water_lpm=defn["after_hours_water_lpm"],
                status="unknown",
            )
            session.add(zone)
            zones.append(zone)
        session.commit()

        # Generate readings for the past 24h (96 points per metric)
        now = datetime.utcnow()
        start = now - timedelta(hours=24)
        interval = timedelta(minutes=15)
        metrics = [
            {"metric": "energy_kw", "unit": "kW", "baseline_factor": 1.0, "source": "simulated"},
            {"metric": "water_lpm", "unit": "L/min", "baseline_factor": 1.0, "source": "simulated"},
            {"metric": "occupancy_count", "unit": "people", "baseline_factor": 0.1, "source": "simulated"},
            {"metric": "waste_level_pct", "unit": "%", "baseline_factor": 0.4, "source": "simulated"},
        ]
        for zone in zones:
            ts = start
            while ts <= now:
                for m in metrics:
                    # simple deterministic variation around baseline
                    if m["metric"] == "energy_kw":
                        value = zone.baseline_energy_kw * (0.9 + 0.2 * ((ts.hour % 4) / 4))
                    elif m["metric"] == "water_lpm":
                        # low flow during day, slight increase after hours
                        value = zone.after_hours_water_lpm * (1.0 if 8 <= ts.hour <= 18 else 1.5)
                    elif m["metric"] == "occupancy_count":
                        # occupancy peaks 9‑12 and 14‑17
                        if 9 <= ts.hour <= 12 or 14 <= ts.hour <= 17:
                            value = 20 * m["baseline_factor"]
                        else:
                            value = 0
                    elif m["metric"] == "waste_level_pct":
                        # slowly rises during the day, resets at midnight
                        value = (ts.hour * 4) % 100
                    else:
                        value = 0
                    reading = SensorReading(
                        zone_id=zone.id,
                        metric=m["metric"],
                        value=round(value, 2),
                        unit=m["unit"],
                        timestamp=ts,
                        source=m["source"],
                    )
                    session.add(reading)
                ts += interval
        session.commit()
        print("✅ Seeded zones and telemetry")

if __name__ == "__main__":
    seed_zones_and_readings()
