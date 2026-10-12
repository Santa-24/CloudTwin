"""
Member 3 Integration Adapter: Security Intelligence Engine
Analyzes architecture topology against CIS AWS Foundations Benchmark
and AWS Well-Architected Security Pillar. Connects to external Member 3
engine or executes rule-based scanner.
"""
import httpx
import logging
from typing import Dict, Any, List, Optional
from backend.core.config import settings
from backend.models.architecture import ArchitectureSchema
from backend.models.simulation import SecurityFinding, SecurityOverview, SimulationResult
import uuid
import datetime

logger = logging.getLogger(__name__)

class SecurityEngineAdapter:
    def __init__(self):
        self.endpoint_url = getattr(settings, "SECURITY_ENGINE_URL", None)
        self.timeout = 25.0

    async def analyze_security(self, architecture: ArchitectureSchema, simulation: Optional[SimulationResult] = None) -> SecurityOverview:
        payload = {
            "architecture": architecture.model_dump(),
            "simulation": simulation.model_dump() if simulation else None
        }

        if self.endpoint_url:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(f"{self.endpoint_url}/api/security", json=payload)
                    if response.status_code == 200:
                        return SecurityOverview(**response.json())
                    else:
                        logger.warning(f"External security engine returned {response.status_code}. Using built-in security scanner.")
            except Exception as e:
                logger.warning(f"Failed to connect to security engine at {self.endpoint_url}: {e}. Running fallback security scanner.")

        return self._execute_security_scanner(architecture, simulation)

    def _execute_security_scanner(self, architecture: ArchitectureSchema, simulation: Optional[SimulationResult]) -> SecurityOverview:
        findings: List[SecurityFinding] = []
        nodes = architecture.nodes
        connections = architecture.connections

        # Rule 1: Public Database Exposure
        for node in nodes:
            if node.type.upper() in ("RDS", "AURORA", "DATABASE"):
                if node.config.publicly_accessible:
                    findings.append(SecurityFinding(
                        id=f"sec-{uuid.uuid4().hex[:8]}",
                        architecture_id=architecture.id or "arch-default",
                        simulation_id=simulation.id if simulation else None,
                        title="Public Database Exposure",
                        severity="CRITICAL",
                        category="Network Protection",
                        affected_resource_id=node.id,
                        affected_resource_name=node.name,
                        description=f"Database '{node.name}' has 'publicly_accessible' enabled, exposing PostgreSQL/MySQL ports directly to the internet.",
                        recommendation="Place the RDS instance in a private isolated subnet with no internet route table and restrict security group ingress to backend application instances only.",
                        remediation_steps=[
                            "Modify DB Instance network configuration and set PubliclyAccessible to false.",
                            "Associate instance with a DB Subnet Group consisting exclusively of private subnets.",
                            "Update Security Group ingress rules to allow traffic only from application security group."
                        ],
                        compliance_frameworks=["CIS AWS 2.3", "AWS Well-Architected SEC-05", "SOC 2 CC6.6"]
                    ))

        # Rule 2: Unencrypted Storage (S3 / EBS)
        for node in nodes:
            if node.type.upper() == "S3" and not node.config.encrypted:
                findings.append(SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    architecture_id=architecture.id or "arch-default",
                    simulation_id=simulation.id if simulation else None,
                    title="S3 Bucket Default Encryption Disabled",
                    severity="HIGH",
                    category="Data Protection",
                    affected_resource_id=node.id,
                    affected_resource_name=node.name,
                    description=f"Bucket '{node.name}' is missing server-side default encryption (SSE-KMS or SSE-S3).",
                    recommendation="Enable default SSE-KMS encryption with customer managed keys (CMK) and enforce bucket policy denying non-encrypted PutObject actions.",
                    remediation_steps=[
                        "Enable default encryption using aws:kms algorithm on bucket properties.",
                        "Add bucket policy condition 's3:x-amz-server-side-encryption' check.",
                        "Enable S3 Block Public Access at the bucket and account level."
                    ],
                    compliance_frameworks=["CIS AWS 3.7", "HIPAA 164.312", "PCI-DSS 3.4"]
                ))

        # Rule 3: Single Availability Zone Resilience Flaw
        for node in nodes:
            if node.type.upper() in ("RDS", "AURORA") and not node.config.multi_az:
                findings.append(SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    architecture_id=architecture.id or "arch-default",
                    simulation_id=simulation.id if simulation else None,
                    title="Missing Multi-AZ High Availability on Production DB",
                    severity="HIGH",
                    category="Incident Response & Resilience",
                    affected_resource_id=node.id,
                    affected_resource_name=node.name,
                    description=f"Database '{node.name}' is provisioned in a single Availability Zone without automatic failover standby.",
                    recommendation="Enable Multi-AZ deployment to maintain synchronous replication to a secondary data center for zero-data-loss failover.",
                    remediation_steps=[
                        "Modify DB instance and enable Multi-AZ Deployment.",
                        "Schedule modification during next maintenance window or apply immediately.",
                        "Test automated failover using AWS CLI reboot-db-instance --force-failover."
                    ],
                    compliance_frameworks=["AWS Well-Architected REL-07", "ISO 27001 A.17"]
                ))

        # Rule 4: Compute Direct Exposure without ALB/WAF
        ec2_nodes = [n for n in nodes if n.type.upper() in ("EC2", "ECS")]
        has_alb = any(n.type.upper() in ("ALB", "ELB") for n in nodes)
        for ec2 in ec2_nodes:
            if ec2.config.publicly_accessible and not has_alb:
                findings.append(SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    architecture_id=architecture.id or "arch-default",
                    simulation_id=simulation.id if simulation else None,
                    title="Direct Compute Ingress Without Reverse Proxy or WAF",
                    severity="HIGH",
                    category="Network Protection",
                    affected_resource_id=ec2.id,
                    affected_resource_name=ec2.name,
                    description=f"Compute node '{ec2.name}' is directly exposed to public traffic with no Application Load Balancer or Web Application Firewall (AWS WAF).",
                    recommendation="Place compute nodes in private subnets behind an Application Load Balancer (ALB) with an AWS WAF WebACL attached to filter SQL injection, XSS, and bot floods.",
                    remediation_steps=[
                        "Provision Application Load Balancer across two public subnets.",
                        "Route incoming traffic through ALB target groups.",
                        "Disable public IPv4 address assignment on compute instances."
                    ],
                    compliance_frameworks=["CIS AWS 4.1", "OWASP Top 10", "AWS Well-Architected SEC-06"]
                ))

        # Rule 5: Missing TLS / Plaintext Communication
        for conn in connections:
            if (conn.protocol or "").upper() in ("HTTP", "TCP") and conn.port in (80, 8080):
                findings.append(SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    architecture_id=architecture.id or "arch-default",
                    simulation_id=simulation.id if simulation else None,
                    title="Insecure Plaintext HTTP Ingress Connection",
                    severity="MEDIUM",
                    category="Data Protection in Transit",
                    affected_resource_id=conn.id,
                    affected_resource_name=f"Connection {conn.source} -> {conn.target}",
                    description=f"Traffic from {conn.source} to {conn.target} uses plaintext HTTP (Port {conn.port}). Data is transmitted unencrypted.",
                    recommendation="Enforce HTTPS with TLS 1.3 certificate managed by AWS Certificate Manager (ACM) and configure ALB HTTP-to-HTTPS 301 redirection.",
                    remediation_steps=[
                        "Request or import public SSL/TLS certificate in AWS Certificate Manager.",
                        "Add HTTPS listener on Port 443 with TLS 1.3 security policy.",
                        "Add HTTP listener rule on Port 80 redirecting all requests to HTTPS."
                    ],
                    compliance_frameworks=["CIS AWS 1.2", "PCI-DSS 4.1", "AWS Well-Architected SEC-09"]
                ))

        # Rule 6: Single Point of Failure (SPOF)
        if len(ec2_nodes) == 1 and not ec2_nodes[0].config.auto_scaling:
            findings.append(SecurityFinding(
                id=f"sec-{uuid.uuid4().hex[:8]}",
                architecture_id=architecture.id or "arch-default",
                simulation_id=simulation.id if simulation else None,
                title="Single Point of Failure (SPOF) in Compute Tier",
                severity="MEDIUM",
                category="Infrastructure Resilience",
                affected_resource_id=ec2_nodes[0].id,
                affected_resource_name=ec2_nodes[0].name,
                description="Only 1 instance provisioned with Auto-Scaling disabled. A hardware fault or crashed container causes immediate complete outage.",
                recommendation="Configure Auto Scaling Group with Min=2 across at least two Availability Zones.",
                remediation_steps=[
                    "Create Launch Template with golden AMI and user data bootstrap script.",
                    "Create Auto Scaling Group spanning at least 2 Availability Zones.",
                    "Attach Target Tracking Scaling Policy targeting 60% average CPU."
                ],
                compliance_frameworks=["AWS Well-Architected REL-06"]
            ))

        # Rule 7: API Gateway Unprotected by AWS WAF
        api_gw_nodes = [n for n in nodes if n.type.upper() in ("API_GATEWAY", "APIGATEWAY")]
        for apig in api_gw_nodes:
            if not apig.config.waf_enabled:
                findings.append(SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    architecture_id=architecture.id or "arch-default",
                    simulation_id=simulation.id if simulation else None,
                    title="API Gateway Missing AWS WAF WebACL Protection",
                    severity="HIGH",
                    category="Application Security",
                    affected_resource_id=apig.id,
                    affected_resource_name=apig.name,
                    description=f"API Gateway stage '{apig.name}' is directly exposed to public HTTP clients without AWS WAF WebACL inspection.",
                    recommendation="Attach AWS WAF WebACL with AWSManagedRulesCommonRuleSet and rate-based IP rule to mitigate DDoS and credential stuffing.",
                    remediation_steps=[
                        "Create AWS WAF WebACL in regional scope.",
                        "Add AWSManagedRulesCommonRuleSet and Amazon IP Reputation list.",
                        "Associate WebACL with API Gateway production stage."
                    ],
                    compliance_frameworks=["CIS AWS 4.8", "OWASP API Security Top 10", "SOC 2 CC6.6"]
                ))

        # Rule 8: DynamoDB Missing Continuous Backups (PITR)
        dynamo_nodes = [n for n in nodes if n.type.upper() == "DYNAMODB"]
        for ddb in dynamo_nodes:
            if not ddb.config.pitr_enabled:
                findings.append(SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    architecture_id=architecture.id or "arch-default",
                    simulation_id=simulation.id if simulation else None,
                    title="DynamoDB Point-in-Time Recovery (PITR) Disabled",
                    severity="MEDIUM",
                    category="Business Continuity & Data Protection",
                    affected_resource_id=ddb.id,
                    affected_resource_name=ddb.name,
                    description=f"Table '{ddb.name}' lacks continuous Point-in-Time Recovery. Accidental writes or ransomware cannot be restored to a past second.",
                    recommendation="Enable Point-in-Time Recovery on all production DynamoDB tables for automated 35-day backup windows.",
                    remediation_steps=[
                        "Open DynamoDB Console -> Tables -> Backups tab.",
                        "Enable Point-in-time recovery (PITR).",
                        "Audit backup restoration procedure."
                    ],
                    compliance_frameworks=["AWS Well-Architected SEC-09", "PCI-DSS 10.5"]
                ))

        # Rule 9: S3 Bucket Versioning Disabled
        s3_nodes = [n for n in nodes if n.type.upper() == "S3"]
        for s3 in s3_nodes:
            if s3.config.versioning_enabled is False:
                findings.append(SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    architecture_id=architecture.id or "arch-default",
                    simulation_id=simulation.id if simulation else None,
                    title="S3 Bucket Versioning Disabled",
                    severity="LOW",
                    category="Data Protection",
                    affected_resource_id=s3.id,
                    affected_resource_name=s3.name,
                    description=f"S3 Bucket '{s3.name}' has versioning disabled, risking permanent unrecoverable object overwrite or deletion.",
                    recommendation="Enable S3 bucket versioning and MFA delete protection for audit archives.",
                    remediation_steps=[
                        "Enable Versioning on S3 Bucket Properties.",
                        "Configure S3 Lifecycle Rule to expire noncurrent versions after 90 days."
                    ],
                    compliance_frameworks=["CIS AWS 3.3"]
                ))

        # Rule 10: VPC Flow Logs Disabled
        vpc_nodes = [n for n in nodes if n.type.upper() == "VPC"]
        for vpc in vpc_nodes:
            if vpc.config.flow_logs_enabled is False:
                findings.append(SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    architecture_id=architecture.id or "arch-default",
                    simulation_id=simulation.id if simulation else None,
                    title="VPC Flow Logs Disabled",
                    severity="MEDIUM",
                    category="Logging & Incident Response",
                    affected_resource_id=vpc.id,
                    affected_resource_name=vpc.name,
                    description=f"VPC '{vpc.name}' does not record network traffic metadata. Network forensics and anomaly detection are impaired.",
                    recommendation="Enable VPC Flow Logs delivering all accepted and rejected traffic to Amazon CloudWatch Logs or S3.",
                    remediation_steps=[
                        "Create IAM Role with permissions to publish to CloudWatch Logs.",
                        "Enable VPC Flow Logs targeting CloudWatch Logs log group with 30-day retention."
                    ],
                    compliance_frameworks=["CIS AWS 2.9", "NIST CSF DE.AE-3"]
                ))

        crit = sum(1 for f in findings if f.severity == "CRITICAL")
        high = sum(1 for f in findings if f.severity == "HIGH")
        med = sum(1 for f in findings if f.severity == "MEDIUM")
        low = sum(1 for f in findings if f.severity == "LOW")

        if crit > 0:
            risk = "CRITICAL"
            score = max(25.0, 100.0 - (crit * 30.0 + high * 15.0 + med * 5.0))
        elif high > 0:
            risk = "HIGH"
            score = max(45.0, 100.0 - (high * 16.0 + med * 6.0))
        elif med > 0:
            risk = "MEDIUM"
            score = max(65.0, 100.0 - (med * 8.0 + low * 3.0))
        else:
            risk = "LOW"
            score = 96.0

        return SecurityOverview(
            overall_risk_level=risk,
            security_score=round(score, 1),
            critical_count=crit,
            high_count=high,
            medium_count=med,
            low_count=low,
            findings=findings
        )

security_adapter = SecurityEngineAdapter()
