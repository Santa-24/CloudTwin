"""
CloudTwin Canonical Architecture Schema Model
This schema is the single source of truth contract between:
Frontend <-> Backend <-> Member 2 (Simulation Engine) <-> Member 3 (Cost/Security/AI Engines)
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid

class NodePosition(BaseModel):
    x: float = 0.0
    y: float = 0.0

class NodeConfig(BaseModel):
    instance_type: Optional[str] = "t3.medium"
    count: Optional[int] = 1
    engine: Optional[str] = "postgres"
    storage_gb: Optional[int] = 50
    multi_az: Optional[bool] = False
    auto_scaling: Optional[bool] = False
    min_instances: Optional[int] = 1
    max_instances: Optional[int] = 5
    publicly_accessible: Optional[bool] = False
    encrypted: Optional[bool] = True
    backup_retention_days: Optional[int] = 7
    availability_zone: Optional[str] = "ap-south-1a"
    subnets: Optional[List[str]] = Field(default_factory=lambda: ["subnet-private-1a"])
    memory_mb: Optional[int] = 512
    concurrency_limit: Optional[int] = 1000
    ssl_policy: Optional[str] = "ELBSecurityPolicy-TLS13-1-2-2021-06"
    waf_enabled: Optional[bool] = False
    # API Gateway properties
    api_type: Optional[str] = "REST"  # REST, HTTP, WEBSOCKET
    rate_limit_rps: Optional[int] = 10000
    burst_limit: Optional[int] = 5000
    # Lambda properties
    timeout_sec: Optional[int] = 30
    runtime: Optional[str] = "python3.12"
    # ECS properties
    launch_type: Optional[str] = "FARGATE"  # FARGATE, EC2
    desired_tasks: Optional[int] = 2
    cpu_units: Optional[int] = 512
    # DynamoDB properties
    billing_mode: Optional[str] = "PAY_PER_REQUEST"  # PAY_PER_REQUEST, PROVISIONED
    rcu: Optional[int] = 5
    wcu: Optional[int] = 5
    pitr_enabled: Optional[bool] = True
    # VPC properties
    cidr_block: Optional[str] = "10.0.0.0/16"
    flow_logs_enabled: Optional[bool] = True
    # S3 properties
    versioning_enabled: Optional[bool] = True
    block_public_access: Optional[bool] = True
    custom_props: Dict[str, Any] = Field(default_factory=dict)

class ArchitectureNode(BaseModel):
    id: str = Field(default_factory=lambda: f"node-{uuid.uuid4().hex[:8]}")
    type: str  # EC2, Lambda, ECS, RDS, DynamoDB, S3, ALB, CloudFront, VPC, NAT_Gateway, Route53
    name: str = "AWS Component"
    category: str = "compute"  # compute, network, database, storage
    position: NodePosition = Field(default_factory=NodePosition)
    config: NodeConfig = Field(default_factory=NodeConfig)
    status: str = "configured"  # healthy, warning, critical, configured

class ArchitectureConnection(BaseModel):
    id: str = Field(default_factory=lambda: f"edge-{uuid.uuid4().hex[:8]}")
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None
    protocol: Optional[str] = "TCP"  # HTTP, HTTPS, TCP, UDP, TLS
    port: Optional[int] = 443
    connection_type: Optional[str] = "network"
    config: Dict[str, Any] = Field(default_factory=dict)

class ArchitectureSchema(BaseModel):
    id: Optional[str] = None
    project_id: Optional[str] = None
    name: str = "Production Cloud Twin Architecture"
    description: Optional[str] = "High-availability AWS cloud topology"
    version: str = "1.0.0"
    schema_version: str = "1.0"
    region: str = "ap-south-1"
    nodes: List[ArchitectureNode] = Field(default_factory=list)
    connections: List[ArchitectureConnection] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ArchitectureCreate(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None
    region: Optional[str] = "ap-south-1"
    nodes: Optional[List[ArchitectureNode]] = Field(default_factory=list)
    connections: Optional[List[ArchitectureConnection]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ArchitectureUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    region: Optional[str] = None
    version: Optional[str] = None
    nodes: Optional[List[ArchitectureNode]] = None
    connections: Optional[List[ArchitectureConnection]] = None
    metadata: Optional[Dict[str, Any]] = None

class VersionCreate(BaseModel):
    change_summary: str
    snapshot_json: Optional[Dict[str, Any]] = None
