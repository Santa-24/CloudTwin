"""
CloudTwin Cost, Security & Recommendation API Routes
Member 3 Integration Endpoints
"""
from fastapi import APIRouter, Query
from typing import Optional
from backend.core.store import store
from backend.models.simulation import CostEstimate, SecurityOverview
from backend.integrations.cost_engine.adapter import cost_adapter
from backend.integrations.security_engine.adapter import security_adapter
from backend.integrations.recommendation_engine.adapter import recommendation_adapter
from backend.schemas.response import success_response, CloudTwinException

cost_router = APIRouter(prefix="/cost", tags=["Cost Intelligence"])
security_router = APIRouter(prefix="/security", tags=["Security Intelligence"])
rec_router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])

# --- Cost Routes ---
@cost_router.get("/{architecture_id}")
async def get_cost_estimate(architecture_id: str, currency: str = Query("USD", pattern="^(USD|INR|EUR|GBP)$")):
    arch = store.architectures.get(architecture_id)
    if not arch:
        raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", "Architecture not found.")
    
    # Check if cached or calculate fresh
    estimate = await cost_adapter.calculate_cost(arch, None, currency=currency)
    store.cost_estimates[architecture_id] = estimate
    return success_response(estimate)

# --- Security Routes ---
@security_router.get("/{architecture_id}")
async def get_security_analysis(architecture_id: str):
    arch = store.architectures.get(architecture_id)
    if not arch:
        raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", "Architecture not found.")
    
    security_eval = await security_adapter.analyze_security(arch, None)
    store.security_overviews[architecture_id] = security_eval
    return success_response(security_eval)

# --- Recommendation Routes ---
@rec_router.get("/{architecture_id}")
async def get_recommendations(architecture_id: str):
    arch = store.architectures.get(architecture_id)
    if not arch:
        raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", "Architecture not found.")
    
    cost_eval = store.cost_estimates.get(architecture_id)
    sec_eval = store.security_overviews.get(architecture_id)
    recs = await recommendation_adapter.generate_recommendations(arch, None, cost_eval, sec_eval)
    store.recommendations[architecture_id] = recs
    return success_response(recs)
