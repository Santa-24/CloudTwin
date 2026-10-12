"""
CloudTwin Projects API Routes
"""
from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional, Dict, Any
import datetime
import uuid
import jwt
from backend.core.config import settings
from backend.core.store import store
from backend.core.db import db_service
from backend.models.project import ProjectCreate, ProjectUpdate, ProjectResponse
from backend.models.architecture import ArchitectureSchema, ArchitectureNode, ArchitectureConnection, NodePosition, NodeConfig
from backend.schemas.response import success_response, error_response, CloudTwinException

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("")
async def list_projects():
    projects_list = []
    for p in store.projects.values():
        arch_count = sum(1 for a in store.architectures.values() if a.project_id == p["id"])
        sim_count = sum(1 for s in store.simulation_results.values())
        created_str = p.get("created_at")
        updated_str = p.get("updated_at")
        if hasattr(created_str, "isoformat"):
            created_str = created_str.isoformat()
        if hasattr(updated_str, "isoformat"):
            updated_str = updated_str.isoformat()
            
        projects_list.append(ProjectResponse(
            id=p["id"],
            user_id=p.get("user_id", "user-demo-01"),
            name=p["name"],
            description=p.get("description"),
            cloud_provider=p.get("cloud_provider", "aws"),
            default_region=p.get("default_region", "ap-south-1"),
            tags=p.get("tags", []),
            status=p.get("status", "active"),
            architecture_count=arch_count,
            simulation_count=sim_count,
            health_score=88.5,
            created_at=str(created_str or datetime.datetime.now(datetime.timezone.utc).isoformat()),
            updated_at=str(updated_str or datetime.datetime.now(datetime.timezone.utc).isoformat())
        ))
    return success_response(projects_list)

@router.post("")
async def create_project(project: ProjectCreate, authorization: Optional[str] = Header(None)):
    user_id = "user-demo-01"
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
            if decoded.get("sub"):
                user_id = decoded["sub"]
        except Exception:
            pass

    proj_id = f"proj-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    record = {
        "id": proj_id,
        "user_id": user_id,
        "name": project.name,
        "description": project.description or "Dynamic AWS CloudTwin Workspace",
        "cloud_provider": project.cloud_provider,
        "default_region": project.default_region,
        "tags": project.tags or ["Architecture", "Production"],
        "status": "active",
        "created_at": now,
        "updated_at": now
    }
    store.projects[proj_id] = record
    db_service.save_project(record)

    # Auto-provision initial digital twin architecture for this new project based on chosen template
    arch_id = f"arch-{uuid.uuid4().hex[:8]}"
    template = getattr(project, "template", "enterprise_11_service") or "enterprise_11_service"

    nodes = []
    connections = []

    if template == "enterprise_11_service":
        # 11 AWS Services Topology
        n_cf = f"node-cf-{uuid.uuid4().hex[:4]}"
        n_apigw = f"node-apigw-{uuid.uuid4().hex[:4]}"
        n_alb = f"node-alb-{uuid.uuid4().hex[:4]}"
        n_ec2 = f"node-ec2-{uuid.uuid4().hex[:4]}"
        n_ecs = f"node-ecs-{uuid.uuid4().hex[:4]}"
        n_lambda = f"node-lambda-{uuid.uuid4().hex[:4]}"
        n_rds = f"node-rds-{uuid.uuid4().hex[:4]}"
        n_dynamo = f"node-dynamo-{uuid.uuid4().hex[:4]}"
        n_s3 = f"node-s3-{uuid.uuid4().hex[:4]}"
        n_vpc = f"node-vpc-{uuid.uuid4().hex[:4]}"
        n_nat = f"node-nat-{uuid.uuid4().hex[:4]}"

        nodes = [
            ArchitectureNode(id=n_cf, type="CloudFront", name="Amazon CloudFront CDN", category="network", position=NodePosition(x=60, y=260), config=NodeConfig(ssl_policy="TLSv1.2_2021", memory_mb=0, publicly_accessible=True), status="healthy"),
            ArchitectureNode(id=n_alb, type="ALB", name="Application Load Balancer", category="network", position=NodePosition(x=280, y=180), config=NodeConfig(multi_az=True, ssl_policy="ELBSecurityPolicy-TLS13-1-2-2021-06", publicly_accessible=True), status="healthy"),
            ArchitectureNode(id=n_apigw, type="API_GATEWAY", name="Amazon API Gateway", category="network", position=NodePosition(x=280, y=360), config=NodeConfig(publicly_accessible=True), status="healthy"),
            ArchitectureNode(id=n_ec2, type="EC2", name="API Worker Fleet", category="compute", position=NodePosition(x=520, y=100), config=NodeConfig(instance_type="t3.large", count=3, auto_scaling=True, min_instances=2, max_instances=8, multi_az=True), status="healthy"),
            ArchitectureNode(id=n_ecs, type="ECS", name="ECS Fargate Cluster", category="compute", position=NodePosition(x=520, y=240), config=NodeConfig(desired_tasks=2, cpu=1024, memory_mb=2048), status="healthy"),
            ArchitectureNode(id=n_lambda, type="LAMBDA", name="Event Processor Lambda", category="compute", position=NodePosition(x=520, y=380), config=NodeConfig(runtime="python3.11", memory_mb=512, timeout_seconds=15), status="healthy"),
            ArchitectureNode(id=n_rds, type="RDS", name="PostgreSQL Multi-AZ", category="database", position=NodePosition(x=780, y=160), config=NodeConfig(instance_type="db.t3.medium", count=1, engine="postgres", storage_gb=100, multi_az=True), status="healthy"),
            ArchitectureNode(id=n_dynamo, type="DYNAMODB", name="DynamoDB Fast State", category="database", position=NodePosition(x=780, y=320), config=NodeConfig(billing_mode="PAY_PER_REQUEST", point_in_time_recovery=True), status="healthy"),
            ArchitectureNode(id=n_s3, type="S3", name="Secure S3 Data Vault", category="storage", position=NodePosition(x=780, y=460), config=NodeConfig(storage_gb=350, versioning_enabled=True, block_public_access=True), status="healthy"),
            ArchitectureNode(id=n_vpc, type="VPC", name="Primary Production VPC", category="network", position=NodePosition(x=1020, y=180), config=NodeConfig(cidr_block="10.0.0.0/16", multi_az=True), status="healthy"),
            ArchitectureNode(id=n_nat, type="NAT_GATEWAY", name="High-Availability NAT GW", category="network", position=NodePosition(x=1020, y=340), config=NodeConfig(multi_az=True), status="healthy"),
        ]

        connections = [
            ArchitectureConnection(id=f"c1-{uuid.uuid4().hex[:4]}", source=n_cf, target=n_alb, protocol="HTTPS", port=443, connection_type="network"),
            ArchitectureConnection(id=f"c2-{uuid.uuid4().hex[:4]}", source=n_cf, target=n_apigw, protocol="HTTPS", port=443, connection_type="network"),
            ArchitectureConnection(id=f"c3-{uuid.uuid4().hex[:4]}", source=n_alb, target=n_ec2, protocol="HTTP", port=80, connection_type="network"),
            ArchitectureConnection(id=f"c4-{uuid.uuid4().hex[:4]}", source=n_alb, target=n_ecs, protocol="HTTP", port=8080, connection_type="network"),
            ArchitectureConnection(id=f"c5-{uuid.uuid4().hex[:4]}", source=n_apigw, target=n_lambda, protocol="HTTPS", port=443, connection_type="network"),
            ArchitectureConnection(id=f"c6-{uuid.uuid4().hex[:4]}", source=n_ec2, target=n_rds, protocol="TCP", port=5432, connection_type="network"),
            ArchitectureConnection(id=f"c7-{uuid.uuid4().hex[:4]}", source=n_ecs, target=n_rds, protocol="TCP", port=5432, connection_type="network"),
            ArchitectureConnection(id=f"c8-{uuid.uuid4().hex[:4]}", source=n_lambda, target=n_dynamo, protocol="HTTPS", port=443, connection_type="network"),
            ArchitectureConnection(id=f"c9-{uuid.uuid4().hex[:4]}", source=n_ec2, target=n_s3, protocol="HTTPS", port=443, connection_type="network"),
            ArchitectureConnection(id=f"c10-{uuid.uuid4().hex[:4]}", source=n_nat, target=n_vpc, protocol="TCP", port=0, connection_type="network")
        ]
    elif template == "serverless":
        n_cf = f"node-cf-{uuid.uuid4().hex[:4]}"
        n_apigw = f"node-apigw-{uuid.uuid4().hex[:4]}"
        n_lambda = f"node-lambda-{uuid.uuid4().hex[:4]}"
        n_dynamo = f"node-dynamo-{uuid.uuid4().hex[:4]}"
        n_s3 = f"node-s3-{uuid.uuid4().hex[:4]}"

        nodes = [
            ArchitectureNode(id=n_cf, type="CloudFront", name="Edge Distribution", category="network", position=NodePosition(x=100, y=260), config=NodeConfig(publicly_accessible=True), status="healthy"),
            ArchitectureNode(id=n_apigw, type="API_GATEWAY", name="Serverless API Gateway", category="network", position=NodePosition(x=340, y=260), config=NodeConfig(publicly_accessible=True), status="healthy"),
            ArchitectureNode(id=n_lambda, type="LAMBDA", name="Core Lambda Microservice", category="compute", position=NodePosition(x=580, y=260), config=NodeConfig(runtime="python3.11", memory_mb=512), status="healthy"),
            ArchitectureNode(id=n_dynamo, type="DYNAMODB", name="DynamoDB High-Speed DB", category="database", position=NodePosition(x=820, y=180), config=NodeConfig(billing_mode="PAY_PER_REQUEST"), status="healthy"),
            ArchitectureNode(id=n_s3, type="S3", name="S3 Assets & Vault", category="storage", position=NodePosition(x=820, y=360), config=NodeConfig(storage_gb=150), status="healthy")
        ]
        connections = [
            ArchitectureConnection(id=f"c1-{uuid.uuid4().hex[:4]}", source=n_cf, target=n_apigw, protocol="HTTPS", port=443, connection_type="network"),
            ArchitectureConnection(id=f"c2-{uuid.uuid4().hex[:4]}", source=n_apigw, target=n_lambda, protocol="HTTPS", port=443, connection_type="network"),
            ArchitectureConnection(id=f"c3-{uuid.uuid4().hex[:4]}", source=n_lambda, target=n_dynamo, protocol="HTTPS", port=443, connection_type="network"),
            ArchitectureConnection(id=f"c4-{uuid.uuid4().hex[:4]}", source=n_lambda, target=n_s3, protocol="HTTPS", port=443, connection_type="network")
        ]
    elif template == "blank":
        n_vpc = f"node-vpc-{uuid.uuid4().hex[:4]}"
        n_nat = f"node-nat-{uuid.uuid4().hex[:4]}"
        nodes = [
            ArchitectureNode(id=n_vpc, type="VPC", name="Default Custom VPC", category="network", position=NodePosition(x=200, y=250), config=NodeConfig(cidr_block="10.0.0.0/16"), status="healthy"),
            ArchitectureNode(id=n_nat, type="NAT_GATEWAY", name="NAT Gateway", category="network", position=NodePosition(x=480, y=250), config=NodeConfig(multi_az=True), status="healthy")
        ]
        connections = [
            ArchitectureConnection(id=f"c1-{uuid.uuid4().hex[:4]}", source=n_nat, target=n_vpc, protocol="TCP", port=0, connection_type="network")
        ]
    else:
        # Default High-Availability 3-tier
        n_alb = f"node-alb-{uuid.uuid4().hex[:4]}"
        n_ec2 = f"node-ec2-{uuid.uuid4().hex[:4]}"
        n_rds = f"node-rds-{uuid.uuid4().hex[:4]}"
        n_s3 = f"node-s3-{uuid.uuid4().hex[:4]}"
        nodes = [
            ArchitectureNode(id=n_alb, type="ALB", name="Application Load Balancer", category="network", position=NodePosition(x=150, y=260), config=NodeConfig(multi_az=True, publicly_accessible=True), status="healthy"),
            ArchitectureNode(id=n_ec2, type="EC2", name="EC2 Auto-Scaling Cluster", category="compute", position=NodePosition(x=420, y=260), config=NodeConfig(instance_type="t3.large", count=3, auto_scaling=True), status="healthy"),
            ArchitectureNode(id=n_rds, type="RDS", name="PostgreSQL Multi-AZ", category="database", position=NodePosition(x=700, y=180), config=NodeConfig(engine="postgres", storage_gb=100, multi_az=True), status="healthy"),
            ArchitectureNode(id=n_s3, type="S3", name="Encrypted S3 Storage", category="storage", position=NodePosition(x=700, y=360), config=NodeConfig(storage_gb=200), status="healthy")
        ]
        connections = [
            ArchitectureConnection(id=f"c1-{uuid.uuid4().hex[:4]}", source=n_alb, target=n_ec2, protocol="HTTP", port=80, connection_type="network"),
            ArchitectureConnection(id=f"c2-{uuid.uuid4().hex[:4]}", source=n_ec2, target=n_rds, protocol="TCP", port=5432, connection_type="network"),
            ArchitectureConnection(id=f"c3-{uuid.uuid4().hex[:4]}", source=n_ec2, target=n_s3, protocol="HTTPS", port=443, connection_type="network")
        ]

    initial_arch = ArchitectureSchema(
        id=arch_id,
        project_id=proj_id,
        name=f"{project.name} Architecture Twin",
        description=f"Auto-provisioned {template.replace('_', ' ').title()} for {project.name}",
        version="1.0.0",
        schema_version="1.0",
        region=project.default_region or "ap-south-1",
        nodes=nodes,
        connections=connections,
        metadata={"environment": "production", "creator": user_id, "template": template}
    )

    store.architectures[arch_id] = initial_arch
    arch_dict = initial_arch.model_dump()
    arch_dict["created_at"] = now
    arch_dict["updated_at"] = now
    db_service.save_architecture(arch_dict)

    return success_response(record)

@router.get("/{project_id}")
async def get_project(project_id: str):
    p = store.projects.get(project_id)
    if not p:
        raise CloudTwinException(404, "PROJECT_NOT_FOUND", f"Project with ID '{project_id}' was not found.")
    
    architectures = [a for a in store.architectures.values() if a.project_id == project_id]
    reports = store.reports.get(project_id, [])
    
    return success_response({
        "project": p,
        "architectures": architectures,
        "reports": reports
    })

@router.put("/{project_id}")
async def update_project(project_id: str, updates: ProjectUpdate):
    p = store.projects.get(project_id)
    if not p:
        raise CloudTwinException(404, "PROJECT_NOT_FOUND", f"Project with ID '{project_id}' was not found.")
    
    if updates.name is not None:
        p["name"] = updates.name
    if updates.description is not None:
        p["description"] = updates.description
    if updates.default_region is not None:
        p["default_region"] = updates.default_region
    if updates.tags is not None:
        p["tags"] = updates.tags
    if updates.status is not None:
        p["status"] = updates.status
    p["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    return success_response(p)

@router.delete("/{project_id}")
async def delete_project(project_id: str):
    if project_id in store.projects:
        del store.projects[project_id]
        to_del = [aid for aid, a in store.architectures.items() if a.project_id == project_id]
        for aid in to_del:
            del store.architectures[aid]
        db_service.delete_project(project_id)
        return success_response({"deleted_id": project_id})
    raise CloudTwinException(404, "PROJECT_NOT_FOUND", "Project not found.")
