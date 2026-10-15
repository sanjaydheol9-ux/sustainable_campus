import random
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.models import Zone, SensorReading
from app.core.db import engine

def simulate_event(scenario: str):
    """Deterministically mutate telemetry for a given scenario.
    Supported scenarios (matching PRD):
    - "after_hours_water": increase water flow in a random zone after hours
    - "energy_waste": raise energy usage while occupancy is zero in a zone
    - "waste_fill": push waste level above 85% in a zone
    """
    with Session(engine) as session:
        zones = session.exec(select(Zone)).all()
        now = datetime.utcnow()
        if scenario == "after_hours_water":
            # pick the Hostel Block (zone name contains "Hostel")
            zone = next((z for z in zones if "Hostel" in z.name), None)
            if zone:
                reading = SensorReading(
                    zone_id=zone.id,
                    metric="water_lpm",
                    value=zone.after_hours_water_lpm * 2.0,  # clear breach
                    unit="L/min",
                    timestamp=now,
                    source="simulated",
                )
                session.add(reading)
        elif scenario == "energy_waste":
            zone = next((z for z in zones if "Library" in z.name), None)
            if zone:
                # zero occupancy reading
                occ = SensorReading(
                    zone_id=zone.id,
                    metric="occupancy_count",
                    value=0,
                    unit="people",
                    timestamp=now,
                    source="simulated",
                )
                # elevated energy reading
                energy = SensorReading(
                    zone_id=zone.id,
                    metric="energy_kw",
                    value=zone.baseline_energy_kw * 1.5,
                    unit="kW",
                    timestamp=now,
                    source="simulated",
                )
                session.add_all([occ, energy])
        elif scenario == "waste_fill":
            zone = next((z for z in zones if "Canteen" in z.name), None)
            if zone:
                waste = SensorReading(
                    zone_id=zone.id,
                    metric="waste_level_pct",
                    value=92.0,
                    unit="%",
                    timestamp=now,
                    source="simulated",
                )
                session.add(waste)
        else:
            raise ValueError(f"Unknown scenario: {scenario}")
        session.commit()
        print(f"✅ Simulated scenario '{scenario}' for zone {zone.name if zone else 'N/A'}")

def reset_demo():
    """Clear all telemetry and alerts and reseed initial data.
    This makes the demo repeatable.
    """
    from app.seed import seed_zones_and_readings
    from app.services.rules import run_rule_engine
    # Drop all tables and recreate
    from app.core.db import engine as db_engine
    from sqlmodel import SQLModel
    SQLModel.metadata.drop_all(db_engine)
    SQLModel.metadata.create_all(db_engine)
    # Seed fresh data
    seed_zones_and_readings()
    # Run rule engine once to generate initial alerts
    run_rule_engine()
    print("✅ Demo reset complete – fresh seed and alerts generated")

if __name__ == "__main__":
    # Simple CLI for manual testing
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["simulate", "reset"])
    parser.add_argument("scenario", nargs="?", default="after_hours_water")
    args = parser.parse_args()
    if args.action == "simulate":
        simulate_event(args.scenario)
    else:
        reset_demo()
