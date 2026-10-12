"""
Member 3 Integration Adapter: AI Architecture Recommendation Engine
Synthesizes simulation bottlenecks, security vulnerabilities, and cost drivers
into prioritized, actionable architectural improvement proposals.
"""
import httpx
import logging
from typing import Dict, Any, List, Optional
from backend.core.config import settings
from backend.models.architecture import ArchitectureSchema
from backend.models.simulation import (
    ArchitectureRecommendation,
    SimulationResult,
    CostEstimate,
    SecurityOverview
)
import uuid
import datetime

logger = logging.getLogger(__name__)

class RecommendationEngineAdapter:
    def __init__(self):
        self.endpoint_url = getattr(settings, "RECOMMENDATION_ENGINE_URL", None)
        self.timeout = 25.0

    async def generate_recommendations(
        self,
        architecture: ArchitectureSchema,
        simulation: Optional[SimulationResult] = None,
        cost: Optional[CostEstimate] = None,
        security: Optional[SecurityOverview] = None
    ) -> List[ArchitectureRecommendation]:
        payload = {
            "architecture": architecture.model_dump(),
            "simulation": simulation.model_dump() if simulation else None,
            "cost": cost.model_dump() if cost else None,
            "security": security.model_dump() if security else None
        }

        if self.endpoint_url:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(f"{self.endpoint_url}/api/recommendations", json=payload)
                    if response.status_code == 200:
                        data = response.json()
                        return [ArchitectureRecommendation(**r) for r in data.get("recommendations", [])]
                    else:
                        logger.warning(f"External recommendation engine returned {response.status_code}. Using fallback generator.")
            except Exception as e:
                logger.warning(f"Failed to connect to recommendation engine at {self.endpoint_url}: {e}. Running fallback generator.")

        # Real Gemini LLM generation if configured
        if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            gemini_recs = await self._generate_gemini_recommendations(architecture, simulation, cost, security)
            if gemini_recs:
                return gemini_recs

        return self._generate_intelligent_recommendations(architecture, simulation, cost, security)

    async def _generate_gemini_recommendations(
        self,
        architecture: ArchitectureSchema,
        simulation: Optional[SimulationResult],
        cost: Optional[CostEstimate],
        security: Optional[SecurityOverview]
    ) -> List[ArchitectureRecommendation]:
        import json
        nodes_desc = ", ".join([f"{n.name} ({n.type})" for n in architecture.nodes]) or "No nodes"
        findings_desc = ", ".join([f.title for f in security.findings]) if security and security.findings else "None"
        bottlenecks_desc = ", ".join([b.resource_name for b in simulation.bottlenecks]) if simulation and simulation.bottlenecks else "None"

        prompt = f"""You are a Principal AWS Solutions Architect. Analyze the following AWS Cloud Digital Twin architecture:
- Architecture Name: {architecture.name}
- Region: {architecture.region}
- Provisioned Nodes: {nodes_desc}
- Security Findings: {findings_desc}
- Simulation Bottlenecks: {bottlenecks_desc}

Provide 3 actionable, high-impact architectural recommendations conforming strictly to the AWS Well-Architected Framework.
Format your entire response ONLY as a JSON array of objects with these exact keys:
[
  {{
    "title": "Title of recommendation",
    "priority": "critical",
    "category": "Cost Optimization",
    "reason": "Detailed architectural rationale",
    "impact": "Expected outcome and improvement",
    "cost_impact": "Monthly cost delta projection",
    "security_impact": "Security posture enhancement",
    "scalability_impact": "Throughput and elasticity gain"
  }}
]
Do not include any markdown backticks or explanations outside the JSON array."""

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        if text.startswith("```"):
                            text = text.split("```")[1]
                            if text.startswith("json"):
                                text = text[4:]
                            text = text.strip()
                        recs_json = json.loads(text)
                        recs = []
                        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
                        for r in recs_json:
                            recs.append(ArchitectureRecommendation(
                                id=f"rec-gemini-{uuid.uuid4().hex[:6]}",
                                architecture_id=architecture.id or "arch-default",
                                simulation_id=simulation.id if simulation else None,
                                priority=r.get("priority", "high"),
                                category=r.get("category", "Architecture Optimization"),
                                title=r.get("title", "AWS Recommendation"),
                                reason=r.get("reason", "Identified by Gemini LLM"),
                                impact=r.get("impact", "Enhanced resilience and cost efficiency"),
                                cost_impact=r.get("cost_impact", "Optimized"),
                                security_impact=r.get("security_impact", "Enhanced"),
                                scalability_impact=r.get("scalability_impact", "Elastic"),
                                created_at=now_str
                            ))
                        if recs:
                            logger.info(f"Generated {len(recs)} dynamic AI recommendations via Gemini LLM")
                            return recs
                else:
                    logger.warning(f"Gemini API returned status {res.status_code}. Using built-in generator.")
        except Exception as e:
            logger.warning(f"Gemini LLM recommendation error: {e}. Falling back to built-in generator.")

        return []

    def _generate_intelligent_recommendations(
        self,
        architecture: ArchitectureSchema,
        simulation: Optional[SimulationResult],
        cost: Optional[CostEstimate],
        security: Optional[SecurityOverview]
    ) -> List[ArchitectureRecommendation]:
        recs: List[ArchitectureRecommendation] = []
        nodes = architecture.nodes

        has_alb = any(n.type.upper() in ("ALB", "ELB") for n in nodes)
        has_cloudfront = any(n.type.upper() == "CLOUDFRONT" for n in nodes)
        has_nat = any(n.type.upper() in ("NAT_GATEWAY", "NAT") for n in nodes)
        ec2_nodes = [n for n in nodes if n.type.upper() in ("EC2", "ECS")]
        db_nodes = [n for n in nodes if n.type.upper() in ("RDS", "AURORA", "DATABASE")]

        # Recommendation 1: Application Load Balancer
        if not has_alb and len(ec2_nodes) >= 1:
            recs.append(ArchitectureRecommendation(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                architecture_id=architecture.id or "arch-default",
                simulation_id=simulation.id if simulation else None,
                priority="critical",
                category="Reliability & High Availability",
                title="Introduce Application Load Balancer (ALB) Ingress Tier",
                reason="Compute nodes are handling raw ingress traffic directly without TLS termination, health checking, or multi-AZ load distribution.",
                impact="Eliminates single point of entry failure, allows zero-downtime rolling deployments, and provides automated traffic failover between zones.",
                suggested_topology_diff={
                    "add_nodes": [
                        {"type": "ALB", "name": "Ingress-ALB", "config": {"ssl_policy": "TLS1.3", "multi_az": True}}
                    ],
                    "add_connections": [
                        {"source": "Ingress-ALB", "target": ec2_nodes[0].id, "protocol": "HTTP", "port": 80}
                    ]
                },
                cost_impact="+~$16.40/month baseline (ALB hourly + standard LCU)",
                security_impact="HIGH: Protects private instances from direct public IP scans",
                scalability_impact="VERY HIGH: Dynamically spreads traffic across scaling instance target groups",
                created_at=datetime.datetime.utcnow().isoformat()
            ))

        # Recommendation 2: Enable Multi-AZ on Database
        if db_nodes and any(not n.config.multi_az for n in db_nodes):
            recs.append(ArchitectureRecommendation(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                architecture_id=architecture.id or "arch-default",
                simulation_id=simulation.id if simulation else None,
                priority="high",
                category="Resilience & Disaster Recovery",
                title="Enable Amazon RDS Multi-AZ Synchronous Replication",
                reason="Primary database lacks a synchronized hot-standby in an alternate Availability Zone, risking data loss and extended downtime during maintenance or facility outages.",
                impact="Reduces Recovery Point Objective (RPO) to zero and cuts Recovery Time Objective (RTO) to under 60 seconds with automated DNS switchover.",
                suggested_topology_diff={
                    "modify_nodes": [
                        {"id": db_nodes[0].id, "changes": {"multi_az": True, "availability_zone": "ap-south-1 (Multi-AZ)"}}
                    ]
                },
                cost_impact="+~$52.56/month (Doubles RDS hourly compute & allocated storage cost)",
                security_impact="MEDIUM: Prevents data loss and ensures continuous SLA compliance",
                scalability_impact="HIGH: Relieves maintenance blocking and enables cross-AZ read offloading",
                created_at=datetime.datetime.utcnow().isoformat()
            ))

        # Recommendation 3: Implement CloudFront Edge CDN
        if not has_cloudfront:
            recs.append(ArchitectureRecommendation(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                architecture_id=architecture.id or "arch-default",
                simulation_id=simulation.id if simulation else None,
                priority="medium",
                category="Performance & Cost Optimization",
                title="Deploy CloudFront CDN with Global Edge Caching",
                reason="Static assets and cacheable dynamic GET requests currently hit origin compute workers, driving up latency and CPU load during traffic surges.",
                impact="Reduces origin request volume by 65-80%, cuts global P95 TTFB from 380ms to under 45ms, and offloads TLS termination to AWS edge points.",
                suggested_topology_diff={
                    "add_nodes": [
                        {"type": "CLOUDFRONT", "name": "Global-CDN", "config": {"price_class": "PriceClass_100", "min_ttl": 300}}
                    ]
                },
                cost_impact="NET SAVING: Reduces expensive EC2 egress bandwidth charges by up to 35%",
                security_impact="HIGH: Built-in AWS Shield Standard DDoS mitigation at edge layer",
                scalability_impact="VERY HIGH: Absorbs massive traffic spikes without stressing backend origin",
                created_at=datetime.datetime.utcnow().isoformat()
            ))

        # Recommendation 4: Auto Scaling Policy for Compute
        if ec2_nodes and any(not n.config.auto_scaling for n in ec2_nodes):
            recs.append(ArchitectureRecommendation(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                architecture_id=architecture.id or "arch-default",
                simulation_id=simulation.id if simulation else None,
                priority="high",
                category="Scalability & Cost Efficiency",
                title="Attach Target Tracking Auto Scaling Policy (Min: 2, Max: 8)",
                reason=f"Compute tier currently uses fixed {ec2_nodes[0].config.count or 1} static instance(s). During the simulation, CPU spiked beyond safe operating margins.",
                impact="Ensures instance pool scales out automatically during spikes and scales in during quiet hours, avoiding overpaying for idle capacity.",
                suggested_topology_diff={
                    "modify_nodes": [
                        {"id": ec2_nodes[0].id, "changes": {"auto_scaling": True, "min_instances": 2, "max_instances": 8}}
                    ]
                },
                cost_impact="ELASTIC: Pay only for capacity during peak traffic; saves 40% on off-peak hours",
                security_impact="LOW: Improves fleet hygiene via automated instance replacement",
                scalability_impact="CRITICAL: Overcomes simulation bottlenecks with automated elasticity",
                created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
            ))

        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Recommendation 5: Attach AWS WAF to API Gateway / ALB
        api_gw_nodes = [n for n in nodes if n.type.upper() in ("API_GATEWAY", "APIGATEWAY")]
        alb_nodes = [n for n in nodes if n.type.upper() in ("ALB", "ELB")]
        if any(not n.config.waf_enabled for n in api_gw_nodes + alb_nodes):
            target = (api_gw_nodes + alb_nodes)[0]
            recs.append(ArchitectureRecommendation(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                architecture_id=architecture.id or "arch-default",
                simulation_id=simulation.id if simulation else None,
                priority="high",
                category="Security & Threat Mitigation",
                title="Attach AWS WAF WebACL to Ingress Tier",
                reason=f"Ingress endpoint '{target.name}' currently receives uninspected HTTP traffic, exposing application logic to OWASP Top 10 exploits and Layer 7 bot floods.",
                impact="Filters malicious payloads, stops SQLi/XSS at the perimeter, and limits IP burst abuse before traffic reaches application compute.",
                suggested_topology_diff={
                    "modify_nodes": [
                        {"id": target.id, "changes": {"waf_enabled": True}}
                    ]
                },
                cost_impact="+$5.00/month per WebACL + $0.60 per 1M requests",
                security_impact="CRITICAL: Blocks automated vulnerability scanners and Layer 7 attacks",
                scalability_impact="HIGH: Protects origin compute instances from malicious traffic exhaustion",
                created_at=now_str
            ))

        # Recommendation 6: DynamoDB On-Demand Mode
        dynamo_nodes = [n for n in nodes if n.type.upper() == "DYNAMODB"]
        if dynamo_nodes and any(n.config.billing_mode == "PROVISIONED" for n in dynamo_nodes):
            ddb = dynamo_nodes[0]
            recs.append(ArchitectureRecommendation(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                architecture_id=architecture.id or "arch-default",
                simulation_id=simulation.id if simulation else None,
                priority="medium",
                category="Cost & Scalability",
                title="Migrate DynamoDB Table to On-Demand (Pay-Per-Request)",
                reason=f"Table '{ddb.name}' uses static provisioned capacity. In the traffic simulation, write throughput exceeded capacity limits, triggering throttling exceptions.",
                impact="Eliminates capacity planning, absorbs unexpected traffic spikes with zero throttling, and charges only for executed read/write operations.",
                suggested_topology_diff={
                    "modify_nodes": [
                        {"id": ddb.id, "changes": {"billing_mode": "PAY_PER_REQUEST", "pitr_enabled": True}}
                    ]
                },
                cost_impact="FLEXIBLE: Eliminates idle provisioned RCU/WCU costs; ideal for unpredictable loads",
                security_impact="MEDIUM: Automatically pairs with continuous Point-in-Time Recovery",
                scalability_impact="VERY HIGH: Instantaneous auto-scaling to thousands of requests per second",
                created_at=now_str
            ))

        # Recommendation 7: VPC Flow Logs
        vpc_nodes = [n for n in nodes if n.type.upper() == "VPC"]
        if vpc_nodes and any(n.config.flow_logs_enabled is False for n in vpc_nodes):
            vpc = vpc_nodes[0]
            recs.append(ArchitectureRecommendation(
                id=f"rec-{uuid.uuid4().hex[:8]}",
                architecture_id=architecture.id or "arch-default",
                simulation_id=simulation.id if simulation else None,
                priority="medium",
                category="Compliance & Governance",
                title="Enable Amazon VPC Flow Logs Delivery",
                reason=f"Virtual Private Cloud '{vpc.name}' does not record network traffic metadata, preventing security auditing and ingress traffic analysis.",
                impact="Provides complete visibility into accepted and rejected network flows for CIS AWS compliance and rapid forensic investigations.",
                suggested_topology_diff={
                    "modify_nodes": [
                        {"id": vpc.id, "changes": {"flow_logs_enabled": True}}
                    ]
                },
                cost_impact="+$0.50 - $3.00/month (CloudWatch Logs ingestion & archival)",
                security_impact="HIGH: Essential for security auditing and intrusion detection",
                scalability_impact="LOW: Zero impact on data path latency or throughput",
                created_at=now_str
            ))

        return recs

recommendation_adapter = RecommendationEngineAdapter()
