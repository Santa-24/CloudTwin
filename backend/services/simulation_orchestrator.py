"""
CloudTwin Simulation Orchestrator
Coordinates the end-to-end simulation lifecycle across:
Member 2 (Simulation Engine) -> Member 3 (Cost, Security, Recommendations)
and returns a unified analysis result.
"""
import logging
from typing import Dict, Any, Optional
from backend.core.store import store
from backend.models.architecture import ArchitectureSchema
from backend.models.simulation import (
    SimulationRequest,
    SimulationResult,
    CostEstimate,
    SecurityOverview,
    UnifiedAnalysisResult
)
from backend.integrations.simulation_engine.adapter import simulation_adapter
from backend.integrations.cost_engine.adapter import cost_adapter
from backend.integrations.security_engine.adapter import security_adapter
from backend.integrations.recommendation_engine.adapter import recommendation_adapter
from backend.schemas.response import CloudTwinException
import datetime

logger = logging.getLogger(__name__)

class SimulationOrchestrator:
    async def run_scenario(self, request: SimulationRequest) -> UnifiedAnalysisResult:
        # 1. Fetch Architecture
        architecture = store.architectures.get(request.architecture_id)
        if not architecture:
            raise CloudTwinException(
                status_code=404,
                code="ARCHITECTURE_NOT_FOUND",
                message=f"Architecture with id '{request.architecture_id}' was not found."
            )

        if not architecture.nodes:
            raise CloudTwinException(
                status_code=400,
                code="EMPTY_ARCHITECTURE",
                message="Cannot run simulation on an empty architecture. Add at least one AWS component."
            )

        # 2. Invoke Member 2 Simulation Engine
        try:
            simulation_result: SimulationResult = await simulation_adapter.run_simulation(
                architecture=architecture,
                scenario_id=request.scenario_id,
                custom_params=request.custom_parameters
            )
        except Exception as e:
            logger.error(f"Error invoking simulation adapter: {e}")
            raise CloudTwinException(
                status_code=502,
                code="SIMULATION_ENGINE_ERROR",
                message="The simulation engine did not return a result. Your architecture has been saved, so you can retry without losing work.",
                details=str(e)
            )

        # 3. Invoke Member 3 Cost Engine
        try:
            cost_result: CostEstimate = await cost_adapter.calculate_cost(
                architecture=architecture,
                simulation=simulation_result,
                currency="USD"
            )
        except Exception as e:
            logger.error(f"Error calculating cost: {e}")
            cost_result = await cost_adapter.calculate_cost(architecture, None, "USD")

        # 4. Invoke Member 3 Security Scanner
        try:
            security_result: SecurityOverview = await security_adapter.analyze_security(
                architecture=architecture,
                simulation=simulation_result
            )
        except Exception as e:
            logger.error(f"Error scanning security: {e}")
            security_result = await security_adapter.analyze_security(architecture, None)

        # 5. Invoke Member 3 AI Recommendation Engine
        try:
            recommendations = await recommendation_adapter.generate_recommendations(
                architecture=architecture,
                simulation=simulation_result,
                cost=cost_result,
                security=security_result
            )
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            recommendations = []

        # 6. Calculate Unified Health Score
        # Composite score weighting: 40% Simulation Performance/Resilience, 35% Security, 25% Scalability
        overall_health = (
            (simulation_result.health_score * 0.40) +
            (security_result.security_score * 0.35) +
            (simulation_result.scalability_score * 0.25)
        )
        overall_health = round(max(10.0, min(100.0, overall_health)), 1)

        summary_text = (
            f"Under the '{simulation_result.scenario_name}' simulation, the architecture achieved a composite "
            f"health rating of {overall_health}%. {len(simulation_result.bottlenecks)} bottleneck(s) and "
            f"{security_result.critical_count + security_result.high_count} critical/high security risk(s) were flagged. "
            f"Estimated monthly spend increases by {cost_result.currency_symbol}{cost_result.delta_monthly_cost:,.2f} "
            f"(+{cost_result.delta_percentage}%)."
        )

        unified = UnifiedAnalysisResult(
            architecture_id=architecture.id,
            simulation=simulation_result,
            cost=cost_result,
            security=security_result,
            recommendations=recommendations,
            health_score=overall_health,
            summary=summary_text
        )

        # 7. Store results for history & retrieval
        store.simulation_results[simulation_result.id] = simulation_result
        store.cost_estimates[architecture.id] = cost_result
        store.security_overviews[architecture.id] = security_result
        store.recommendations[architecture.id] = recommendations

        return unified

orchestrator = SimulationOrchestrator()
