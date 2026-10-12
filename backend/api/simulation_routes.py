"""
CloudTwin Simulation API Routes
Orchestrates Member 2 Simulation Engine runs and provides scenario definitions.
"""
from fastapi import APIRouter
from typing import List, Optional
from backend.core.store import store
from backend.models.simulation import SimulationRequest, SimulationScenario
from backend.services.simulation_orchestrator import orchestrator
from backend.schemas.response import success_response, CloudTwinException

router = APIRouter(prefix="/simulations", tags=["Simulations"])

@router.get("/scenarios")
async def list_scenarios():
    return success_response(list(store.scenarios.values()))

@router.post("/run")
async def run_simulation(request: SimulationRequest):
    unified_result = await orchestrator.run_scenario(request)
    return success_response(unified_result)

@router.get("/results/{simulation_id}")
async def get_simulation_result(simulation_id: str):
    res = store.simulation_results.get(simulation_id)
    if not res:
        raise CloudTwinException(404, "SIMULATION_NOT_FOUND", f"Simulation '{simulation_id}' not found.")
    return success_response(res)

@router.get("/history/{architecture_id}")
async def list_architecture_simulations(architecture_id: str):
    results = [s for s in store.simulation_results.values() if s.architecture_id == architecture_id]
    return success_response(results)
