from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.simulator import simulate_event, reset_demo
from app.services.rules import run_rule_engine

router = APIRouter()

class SimulateRequest(BaseModel):
    scenario: str

@router.post("/demo/simulate")
def simulate(req: SimulateRequest):
    try:
        simulate_event(req.scenario)
        # Re‑run rule engine after new readings
        run_rule_engine()
        return {"detail": f"Scenario '{req.scenario}' simulated and alerts updated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/demo/reset")
def reset():
    reset_demo()
    return {"detail": "Demo data reset to seeded baseline"}
