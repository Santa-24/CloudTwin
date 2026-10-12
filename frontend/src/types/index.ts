export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeConfig {
  instance_type?: string;
  count?: number;
  engine?: string;
  storage_gb?: number;
  multi_az?: boolean;
  auto_scaling?: boolean;
  min_instances?: number;
  max_instances?: number;
  publicly_accessible?: boolean;
  encrypted?: boolean;
  backup_retention_days?: number;
  availability_zone?: string;
  subnets?: string[];
  memory_mb?: number;
  concurrency_limit?: number;
  ssl_policy?: string;
  waf_enabled?: boolean;
  api_type?: string;
  rate_limit_rps?: number;
  burst_limit?: number;
  timeout_sec?: number;
  runtime?: string;
  launch_type?: string;
  desired_tasks?: number;
  cpu_units?: number;
  billing_mode?: string;
  rcu?: number;
  wcu?: number;
  pitr_enabled?: boolean;
  cidr_block?: string;
  flow_logs_enabled?: boolean;
  versioning_enabled?: boolean;
  block_public_access?: boolean;
  custom_props?: Record<string, any>;
}

export interface ArchitectureNode {
  id: string;
  type: string;
  name: string;
  category: 'compute' | 'network' | 'database' | 'storage';
  position: NodePosition;
  config: NodeConfig;
  status: 'healthy' | 'warning' | 'critical' | 'configured';
}

export interface ArchitectureConnection {
  id: string;
  source: string;
  target: string;
  source_handle?: string;
  target_handle?: string;
  protocol?: string;
  port?: number;
  connection_type?: string;
  config?: Record<string, any>;
}

export interface ArchitectureSchema {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  version: string;
  schema_version: string;
  region: string;
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
  metadata?: Record<string, any>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  scenario_type: string;
  description: string;
  parameters: Record<string, any>;
}

export interface MetricPoint {
  timestamp_sec: number;
  time_offset_seconds?: number;
  requests_per_sec: number;
  latency_p95_ms: number;
  cpu_utilization_pct: number;
  error_rate_pct: number;
}

export interface Bottleneck {
  resource_id: string;
  resource_name: string;
  component_type: string;
  metric: string;
  threshold_value: number;
  observed_value: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
}

export interface ScalingRequirement {
  resource_id: string;
  resource_name: string;
  current_capacity: string;
  recommended_capacity: string;
  reason: string;
}

export interface SimulationResult {
  id: string;
  architecture_id: string;
  scenario_id: string;
  scenario_name: string;
  status: string;
  execution_duration_ms: number;
  health_score: number;
  performance_score: number;
  scalability_score: number;
  metrics: {
    baseline_rps?: number;
    simulated_rps?: number;
    p95_latency_ms?: number;
    p99_latency_ms?: number;
    max_cpu_pct?: number;
    error_rate_pct?: number;
    saturation_point_rps?: number;
    total_instances_evaluated?: number;
  };
  bottlenecks: Bottleneck[];
  scaling_requirements: ScalingRequirement[];
  time_series_metrics: MetricPoint[];
  raw_engine_output?: Record<string, any>;
  created_at?: string;
}

export interface ServiceCostItem {
  service_type: string;
  resource_id: string;
  name: string;
  units: string;
  unit_price: number;
  baseline_cost: number;
  simulated_cost: number;
  delta_cost: number;
}

export interface CostEstimate {
  id: string;
  architecture_id: string;
  simulation_id?: string;
  currency: 'USD' | 'INR' | string;
  currency_symbol: string;
  baseline_monthly_cost: number;
  simulated_monthly_cost: number;
  delta_monthly_cost: number;
  delta_percentage: number;
  breakdown_by_service: ServiceCostItem[];
  major_cost_drivers: string[];
  is_estimated: boolean;
  created_at?: string;
}

export interface SecurityFinding {
  id: string;
  architecture_id: string;
  simulation_id?: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  affected_resource_id: string;
  affected_resource_name: string;
  description: string;
  recommendation: string;
  remediation_steps: string[];
  compliance_frameworks: string[];
  created_at?: string;
}

export interface SecurityOverview {
  overall_risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  security_score: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  findings: SecurityFinding[];
}

export interface ArchitectureRecommendation {
  id: string;
  architecture_id: string;
  simulation_id?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  reason: string;
  impact: string;
  suggested_topology_diff?: Record<string, any>;
  cost_impact: string;
  security_impact: string;
  scalability_impact: string;
  created_at?: string;
}

export interface UnifiedAnalysisResult {
  architecture_id: string;
  simulation: SimulationResult;
  cost: CostEstimate;
  security: SecurityOverview;
  recommendations: ArchitectureRecommendation[];
  health_score: number;
  summary: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cloud_provider: string;
  default_region: string;
  tags: string[];
  status: string;
  architecture_count?: number;
  simulation_count?: number;
  health_score?: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company: string;
  tier: string;
  avatar_url?: string;
}
