# CloudTwin Team Integration Contracts

This document specifies the interface contracts connecting the core orchestration layer to Member 2 and Member 3 engines.

---

## 1. Member 2: AWS Architecture & What-If Simulation Engine

### Adapter Location
`backend/integrations/simulation_engine/adapter.py`

### Configuration
Set environment variable:
```env
SIMULATION_ENGINE_URL=http://<member-2-host>:8001
```

### Request Contract (`POST /api/simulate`)
```json
{
  "architecture": {
    "version": "1.0",
    "region": "ap-south-1",
    "nodes": [
      {
        "id": "node-ec2-api",
        "type": "EC2",
        "name": "API Workers",
        "category": "compute",
        "config": {
          "instance_type": "t3.large",
          "count": 3,
          "auto_scaling": true,
          "min_instances": 2,
          "max_instances": 8
        }
      }
    ],
    "connections": [
      {
        "id": "conn-alb-api",
        "source": "node-alb-1",
        "target": "node-ec2-api",
        "protocol": "HTTP",
        "port": 8080
      }
    ]
  },
  "scenario": {
    "id": "scenario-traffic-10x",
    "parameters": {
      "multiplier": 10.0
    }
  }
}
```

### Response Contract
```json
{
  "id": "sim-c83749bf",
  "status": "completed",
  "execution_duration_ms": 1280,
  "health_score": 84.5,
  "performance_score": 78.0,
  "scalability_score": 88.0,
  "metrics": {
    "baseline_rps": 1200.0,
    "simulated_rps": 12000.0,
    "p95_latency_ms": 182.4,
    "max_cpu_pct": 89.2,
    "error_rate_pct": 2.14
  },
  "bottlenecks": [
    {
      "resource_id": "node-ec2-api",
      "resource_name": "API Workers",
      "component_type": "EC2",
      "metric": "CPU_AND_CONCURRENCY",
      "threshold_value": 80.0,
      "observed_value": 89.2,
      "severity": "HIGH",
      "summary": "Worker pool saturated at 89.2% CPU."
    }
  ],
  "scaling_requirements": [
    {
      "resource_id": "node-ec2-api",
      "resource_name": "API Workers",
      "current_capacity": "3x t3.large",
      "recommended_capacity": "6x t3.large",
      "reason": "Absorb 10x traffic spike"
    }
  ]
}
```

---

## 2. Member 3: Cost, Security & AI Recommendations Engine

### Adapter Locations
- `backend/integrations/cost_engine/adapter.py`
- `backend/integrations/security_engine/adapter.py`
- `backend/integrations/recommendation_engine/adapter.py`

### Configuration
```env
COST_ENGINE_URL=http://<member-3-host>:8002
SECURITY_ENGINE_URL=http://<member-3-host>:8003
RECOMMENDATION_ENGINE_URL=http://<member-3-host>:8004
```

### Contracts
1. **Cost Engine**: Takes architecture graph and simulation metrics, outputs baseline vs simulated monthly spend and itemized breakdown.
2. **Security Engine**: Audits topology against CIS AWS Foundations Benchmark, outputs risk level and remediation steps.
3. **AI Recommendations**: Outputs prioritized architectural changes with structured diffs (`add_nodes`, `modify_nodes`, `add_connections`).
