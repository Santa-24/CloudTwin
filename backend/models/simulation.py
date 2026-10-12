"""
CloudTwin Simulation, Cost, Security, Recommendation & Report Models
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid

# --- Simulation Models (Member 2 Contract) ---

class SimulationScenario(BaseModel):
    id: str
    name: str
    scenario_type: str  # traffic_surge, node_failure, database_failover, zone_outage, network_congestion
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)

class SimulationRequest(BaseModel):
    architecture_id: str
    scenario_id: str
    custom_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class MetricPoint(BaseModel):
    timestamp_sec: int
    time_offset_seconds: Optional[int] = None
    requests_per_sec: float
    latency_p95_ms: float
    cpu_utilization_pct: float
    error_rate_pct: float

    def model_post_init(self, __context: Any) -> None:
        if self.time_offset_seconds is None:
            self.time_offset_seconds = self.timestamp_sec

class Bottleneck(BaseModel):
    resource_id: str
    resource_name: str
    component_type: str
    metric: str
    threshold_value: float
    observed_value: float
    severity: str  # CRITICAL, HIGH, MEDIUM
    summary: str

class ScalingRequirement(BaseModel):
    resource_id: str
    resource_name: str
    current_capacity: str
    recommended_capacity: str
    reason: str

class SimulationResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    architecture_id: str
    scenario_id: str
    scenario_name: str
    status: str = "completed"
    execution_duration_ms: int = 1420
    health_score: float = 84.5
    performance_score: float = 78.0
    scalability_score: float = 88.0
    metrics: Dict[str, Any] = Field(default_factory=dict)
    bottlenecks: List[Bottleneck] = Field(default_factory=list)
    scaling_requirements: List[ScalingRequirement] = Field(default_factory=list)
    time_series_metrics: List[MetricPoint] = Field(default_factory=list)
    raw_engine_output: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None

# --- Cost Models (Member 3 Contract) ---

class ServiceCostItem(BaseModel):
    service_type: str
    resource_id: str
    name: str
    units: str
    unit_price: float
    baseline_cost: float
    simulated_cost: float
    delta_cost: float

class CostEstimate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    architecture_id: str
    simulation_id: Optional[str] = None
    currency: str = "USD"
    currency_symbol: str = "$"
    baseline_monthly_cost: float
    simulated_monthly_cost: float
    delta_monthly_cost: float
    delta_percentage: float
    breakdown_by_service: List[ServiceCostItem] = Field(default_factory=list)
    major_cost_drivers: List[str] = Field(default_factory=list)
    is_estimated: bool = True
    created_at: Optional[str] = None

# --- Security Models (Member 3 Contract) ---

class SecurityFinding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    architecture_id: str
    simulation_id: Optional[str] = None
    title: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    category: str  # Identity, Network, Data Protection, Incident Response
    affected_resource_id: str
    affected_resource_name: str
    description: str
    recommendation: str
    remediation_steps: List[str] = Field(default_factory=list)
    compliance_frameworks: List[str] = Field(default_factory=lambda: ["CIS AWS v3.0", "AWS Well-Architected"])
    created_at: Optional[str] = None

class SecurityOverview(BaseModel):
    overall_risk_level: str  # CRITICAL, HIGH, MEDIUM, LOW
    security_score: float  # 0 to 100
    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0
    findings: List[SecurityFinding] = Field(default_factory=list)

# --- AI Recommendation Models (Member 3 Contract) ---

class ArchitectureRecommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    architecture_id: str
    simulation_id: Optional[str] = None
    priority: str  # critical, high, medium, low
    category: str  # Reliability, Performance Efficiency, Cost Optimization, Security
    title: str
    reason: str
    impact: str
    suggested_topology_diff: Dict[str, Any] = Field(default_factory=dict)
    cost_impact: str
    security_impact: str
    scalability_impact: str
    created_at: Optional[str] = None

# --- Unified Analysis Result ---

class UnifiedAnalysisResult(BaseModel):
    architecture_id: str
    simulation: SimulationResult
    cost: CostEstimate
    security: SecurityOverview
    recommendations: List[ArchitectureRecommendation]
    health_score: float
    summary: str

# --- Report Models ---

class ReportCreate(BaseModel):
    project_id: str
    architecture_id: str
    simulation_id: Optional[str] = None
    title: str
    format: str = "pdf"  # pdf, html, json, markdown
