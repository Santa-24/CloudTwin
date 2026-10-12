"""
CloudTwin Data Store
Maintains application state with pre-populated production-grade AWS architectures,
projects, scenarios, versions, and simulation history.
Ensures zero-friction development and immediate demo capabilities.
"""
from typing import Dict, List, Optional, Any
from backend.models.architecture import ArchitectureSchema, ArchitectureNode, ArchitectureConnection, NodePosition, NodeConfig
from backend.models.project import ProjectResponse
from backend.models.simulation import SimulationScenario, SimulationResult, CostEstimate, SecurityOverview, ArchitectureRecommendation, UnifiedAnalysisResult
from backend.core.config import settings
from backend.core.db import db_service
import datetime
import uuid

class InMemoryStore:
    def __init__(self):
        self.projects: Dict[str, Dict[str, Any]] = {}
        self.architectures: Dict[str, ArchitectureSchema] = {}
        self.architecture_versions: Dict[str, List[Dict[str, Any]]] = {}
        self.scenarios: Dict[str, SimulationScenario] = {}
        self.simulation_results: Dict[str, SimulationResult] = {}
        self.cost_estimates: Dict[str, CostEstimate] = {}
        self.security_overviews: Dict[str, SecurityOverview] = {}
        self.recommendations: Dict[str, List[ArchitectureRecommendation]] = {}
        self.reports: Dict[str, List[Dict[str, Any]]] = {}
        self._init_seed_data()
        self._sync_with_database()

    def _sync_with_database(self):
        """If database connection is available, synchronize state with RDS PostgreSQL."""
        if settings.DEMO_MODE:
            return

        db_service.init_database()
        
        # 1. Sync projects
        rds_projects = db_service.get_projects()
        if rds_projects:
            for p in rds_projects:
                self.projects[p["id"]] = p
        else:
            for p in self.projects.values():
                db_service.save_project(p)

        # 2. Sync architectures
        rds_archs = db_service.get_architectures()
        if rds_archs:
            for a in rds_archs:
                try:
                    self.architectures[a["id"]] = ArchitectureSchema(**a)
                except Exception:
                    pass
        else:
            for a in self.architectures.values():
                db_service.save_architecture(a.model_dump())

    def _init_seed_data(self):
        # 1. Default Scenarios
        scenarios_list = [
            SimulationScenario(
                id="scenario-traffic-2x",
                name="2× Traffic Surge",
                scenario_type="traffic_surge",
                description="Simulate double normal request load across ingress and API gateways",
                parameters={"multiplier": 2.0, "duration_minutes": 30, "p99_latency_threshold_ms": 250}
            ),
            SimulationScenario(
                id="scenario-traffic-5x",
                name="5× Traffic Surge",
                scenario_type="traffic_surge",
                description="Simulate sustained 500% surge during peak sales or product launch",
                parameters={"multiplier": 5.0, "duration_minutes": 60, "p99_latency_threshold_ms": 500}
            ),
            SimulationScenario(
                id="scenario-traffic-10x",
                name="10× Flash Crowd Event",
                scenario_type="traffic_surge",
                description="Stress test compute auto-scaling, database connection pools, and caching tiers",
                parameters={"multiplier": 10.0, "duration_minutes": 15, "p99_latency_threshold_ms": 1000}
            ),
            SimulationScenario(
                id="scenario-ec2-fail",
                name="Primary Compute Worker Failure",
                scenario_type="node_failure",
                description="Terminate 50% of EC2 backend worker instances abruptly",
                parameters={"target_service": "EC2", "failure_percentage": 50, "recovery_target_sec": 120}
            ),
            SimulationScenario(
                id="scenario-db-failover",
                name="Primary RDS Multi-AZ Failover",
                scenario_type="database_failover",
                description="Simulate primary database crash and test failover latency to standby replica",
                parameters={"target_service": "RDS", "failover_type": "forced_switchover", "expected_downtime_sec": 45}
            ),
            SimulationScenario(
                id="scenario-az-outage",
                name="Availability Zone ap-south-1a Outage",
                scenario_type="zone_outage",
                description="Complete loss of ap-south-1a data center facility",
                parameters={"zone": "ap-south-1a", "simulate_blackhole": True, "duration_minutes": 120}
            ),
            SimulationScenario(
                id="scenario-network-choke",
                name="NAT Gateway & Egress Chokepoint",
                scenario_type="network_congestion",
                description="Simulate 80% packet drop and throttling on egress NAT Gateway",
                parameters={"target_service": "NAT Gateway", "bandwidth_cap_mbps": 100, "packet_loss_rate": 0.08}
            )
        ]
        for sc in scenarios_list:
            self.scenarios[sc.id] = sc

        # 2. Default Project
        proj_id = "proj-cloudtwin-001"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.projects[proj_id] = {
            "id": proj_id,
            "user_id": "user-demo-01",
            "name": "FinTech Core Banking Twin",
            "description": "High-throughput real-time payment processing and ledger architecture on AWS",
            "cloud_provider": "aws",
            "default_region": "ap-south-1",
            "tags": ["Production", "PCI-DSS", "High-Availability"],
            "status": "active",
            "created_at": now,
            "updated_at": now
        }

        # 3. Default Production Architecture
        arch_id = "arch-fintech-prod"
        nodes = [
            ArchitectureNode(
                id="node-cf-1",
                type="CloudFront",
                name="Global Edge CDN",
                category="network",
                position=NodePosition(x=100, y=260),
                config=NodeConfig(ssl_policy="TLSv1.2_2021", memory_mb=0),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-alb-1",
                type="ALB",
                name="Ingress Public ALB",
                category="network",
                position=NodePosition(x=340, y=260),
                config=NodeConfig(multi_az=True, ssl_policy="ELBSecurityPolicy-TLS13-1-2-2021-06", publicly_accessible=True),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ec2-api",
                type="EC2",
                name="API Gateway Workers",
                category="compute",
                position=NodePosition(x=580, y=160),
                config=NodeConfig(
                    instance_type="t3.large",
                    count=3,
                    auto_scaling=True,
                    min_instances=2,
                    max_instances=8,
                    multi_az=True,
                    publicly_accessible=False
                ),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ec2-ledger",
                type="EC2",
                name="Ledger Processing Engine",
                category="compute",
                position=NodePosition(x=580, y=380),
                config=NodeConfig(
                    instance_type="c6i.xlarge",
                    count=2,
                    auto_scaling=False,
                    min_instances=2,
                    max_instances=4,
                    multi_az=False,
                    publicly_accessible=False
                ),
                status="warning"
            ),
            ArchitectureNode(
                id="node-rds-primary",
                type="RDS",
                name="Core PostgreSQL Ledger",
                category="database",
                position=NodePosition(x=840, y=260),
                config=NodeConfig(
                    instance_type="db.r6g.large",
                    engine="postgres",
                    storage_gb=250,
                    multi_az=True,
                    encrypted=True,
                    publicly_accessible=False,
                    backup_retention_days=14
                ),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-s3-statements",
                type="S3",
                name="Statement Archive Vault",
                category="storage",
                position=NodePosition(x=840, y=440),
                config=NodeConfig(storage_gb=800, encrypted=True, publicly_accessible=False),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-nat-gw",
                type="NAT_Gateway",
                name="Egress NAT Gateway",
                category="network",
                position=NodePosition(x=340, y=440),
                config=NodeConfig(multi_az=False, availability_zone="ap-south-1a"),
                status="healthy"
            )
        ]

        connections = [
            ArchitectureConnection(id="conn-cf-alb", source="node-cf-1", target="node-alb-1", protocol="HTTPS", port=443),
            ArchitectureConnection(id="conn-alb-api", source="node-alb-1", target="node-ec2-api", protocol="HTTP", port=8080),
            ArchitectureConnection(id="conn-alb-ledger", source="node-alb-1", target="node-ec2-ledger", protocol="HTTP", port=9000),
            ArchitectureConnection(id="conn-api-rds", source="node-ec2-api", target="node-rds-primary", protocol="TCP", port=5432),
            ArchitectureConnection(id="conn-ledger-rds", source="node-ec2-ledger", target="node-rds-primary", protocol="TCP", port=5432),
            ArchitectureConnection(id="conn-ledger-s3", source="node-ec2-ledger", target="node-s3-statements", protocol="HTTPS", port=443),
            ArchitectureConnection(id="conn-api-nat", source="node-ec2-api", target="node-nat-gw", protocol="TCP", port=443)
        ]

        arch = ArchitectureSchema(
            id=arch_id,
            project_id=proj_id,
            name="FinTech Real-time Architecture v2.3",
            description="Production topology with CloudFront edge caching, ALB, Auto-scaling API pool, and Multi-AZ RDS",
            version="2.3.0",
            schema_version="1.0",
            region="ap-south-1",
            nodes=nodes,
            connections=connections,
            metadata={"environment": "production", "slo_uptime": "99.99%"}
        )

        self.architectures[arch_id] = arch

        # 4. Enterprise 11-Service Cloud Twin Architecture
        ent_arch_id = "arch-enterprise-cloudtwin"
        ent_nodes = [
            ArchitectureNode(
                id="node-ent-cf",
                type="CloudFront",
                name="Amazon CloudFront CDN",
                category="network",
                position=NodePosition(x=60, y=280),
                config=NodeConfig(ssl_policy="TLSv1.2_2021", waf_enabled=True, publicly_accessible=True),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-apigw",
                type="API_Gateway",
                name="Amazon API Gateway",
                category="network",
                position=NodePosition(x=280, y=180),
                config=NodeConfig(api_type="REST", rate_limit_rps=10000, burst_limit=5000, waf_enabled=True, publicly_accessible=True),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-alb",
                type="ALB",
                name="Application Load Balancer",
                category="network",
                position=NodePosition(x=280, y=380),
                config=NodeConfig(multi_az=True, ssl_policy="ELBSecurityPolicy-TLS13-1-2-2021-06", waf_enabled=True, publicly_accessible=True),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-vpc",
                type="VPC",
                name="Enterprise VPC (10.0.0.0/16)",
                category="network",
                position=NodePosition(x=520, y=80),
                config=NodeConfig(cidr_block="10.0.0.0/16", flow_logs_enabled=True),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-nat",
                type="NAT_Gateway",
                name="NAT Gateway (AZ-1a & 1b)",
                category="network",
                position=NodePosition(x=520, y=520),
                config=NodeConfig(multi_az=True, availability_zone="ap-south-1a"),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-lambda",
                type="Lambda",
                name="Serverless Event Worker",
                category="compute",
                position=NodePosition(x=520, y=180),
                config=NodeConfig(runtime="python3.12", memory_mb=512, timeout_sec=30, concurrency_limit=1000, encrypted=True),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-ec2",
                type="EC2",
                name="Core Microservices Fleet",
                category="compute",
                position=NodePosition(x=520, y=320),
                config=NodeConfig(instance_type="t3.large", count=3, auto_scaling=True, min_instances=2, max_instances=8, multi_az=True),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-ecs",
                type="ECS",
                name="ECS Fargate Container Cluster",
                category="compute",
                position=NodePosition(x=520, y=420),
                config=NodeConfig(launch_type="FARGATE", desired_tasks=4, count=4, cpu_units=1024, memory_mb=2048),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-dynamo",
                type="DynamoDB",
                name="DynamoDB Fast State Table",
                category="database",
                position=NodePosition(x=780, y=180),
                config=NodeConfig(billing_mode="PAY_PER_REQUEST", pitr_enabled=True, encrypted=True),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-rds",
                type="RDS",
                name="Amazon RDS Multi-AZ PostgreSQL",
                category="database",
                position=NodePosition(x=780, y=360),
                config=NodeConfig(instance_type="db.r6g.large", engine="postgres", storage_gb=500, multi_az=True, encrypted=True, backup_retention_days=14),
                status="healthy"
            ),
            ArchitectureNode(
                id="node-ent-s3",
                type="S3",
                name="Amazon S3 Enterprise Bucket",
                category="storage",
                position=NodePosition(x=780, y=500),
                config=NodeConfig(storage_gb=1500, versioning_enabled=True, block_public_access=True, encrypted=True),
                status="healthy"
            )
        ]

        ent_connections = [
            ArchitectureConnection(id="conn-e1", source="node-ent-cf", target="node-ent-apigw", protocol="HTTPS", port=443),
            ArchitectureConnection(id="conn-e2", source="node-ent-cf", target="node-ent-alb", protocol="HTTPS", port=443),
            ArchitectureConnection(id="conn-e3", source="node-ent-cf", target="node-ent-s3", protocol="HTTPS", port=443),
            ArchitectureConnection(id="conn-e4", source="node-ent-apigw", target="node-ent-lambda", protocol="HTTPS", port=443),
            ArchitectureConnection(id="conn-e5", source="node-ent-alb", target="node-ent-ec2", protocol="HTTP", port=8080),
            ArchitectureConnection(id="conn-e6", source="node-ent-alb", target="node-ent-ecs", protocol="HTTP", port=80),
            ArchitectureConnection(id="conn-e7", source="node-ent-lambda", target="node-ent-dynamo", protocol="HTTPS", port=443),
            ArchitectureConnection(id="conn-e8", source="node-ent-ec2", target="node-ent-rds", protocol="TCP", port=5432),
            ArchitectureConnection(id="conn-e9", source="node-ent-ecs", target="node-ent-rds", protocol="TCP", port=5432),
            ArchitectureConnection(id="conn-e10", source="node-ent-ecs", target="node-ent-s3", protocol="HTTPS", port=443),
            ArchitectureConnection(id="conn-e11", source="node-ent-ec2", target="node-ent-nat", protocol="TCP", port=443)
        ]

        ent_arch = ArchitectureSchema(
            id=ent_arch_id,
            project_id=proj_id,
            name="Enterprise 11-Service AWS Cloud Twin",
            description="Complete reference architecture integrating all 11 core AWS services: EC2, S3, RDS, Lambda, API Gateway, CloudFront, ALB, VPC, NAT Gateway, DynamoDB, and ECS.",
            version="1.0.0",
            schema_version="1.0",
            region="ap-south-1",
            nodes=ent_nodes,
            connections=ent_connections,
            metadata={"environment": "production", "slo_uptime": "99.995%", "compliance": ["PCI-DSS", "SOC2", "HIPAA"]}
        )

        self.architectures[ent_arch_id] = ent_arch

        # Seed Versions
        self.architecture_versions[arch_id] = [
            {
                "id": "ver-001",
                "architecture_id": arch_id,
                "version_number": 1,
                "change_summary": "Initial prototype with single EC2 worker and standalone RDS",
                "snapshot_json": arch.model_dump(),
                "created_at": "2026-09-10T10:00:00Z"
            },
            {
                "id": "ver-002",
                "architecture_id": arch_id,
                "version_number": 2,
                "change_summary": "Introduced Application Load Balancer and S3 statement vault",
                "snapshot_json": arch.model_dump(),
                "created_at": "2026-09-18T14:30:00Z"
            },
            {
                "id": "ver-003",
                "architecture_id": arch_id,
                "version_number": 3,
                "change_summary": "Enabled Multi-AZ RDS replication and CloudFront edge distribution",
                "snapshot_json": arch.model_dump(),
                "created_at": now
            }
        ]
        self.architecture_versions[ent_arch_id] = [
            {
                "id": "ver-ent-001",
                "architecture_id": ent_arch_id,
                "version_number": 1,
                "change_summary": "Complete 11-Service Digital Twin baseline with zero-trust networking and Multi-AZ resilience",
                "snapshot_json": ent_arch.model_dump(),
                "created_at": now
            }
        ]

store = InMemoryStore()
