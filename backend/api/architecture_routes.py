"""
CloudTwin Architecture API Routes
Handles canonical architecture CRUD, version control, graph validation, and auto-layout.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
import datetime
import uuid
from backend.core.store import store
from backend.core.db import db_service
from backend.models.architecture import (
    ArchitectureSchema,
    ArchitectureCreate,
    ArchitectureUpdate,
    ArchitectureNode,
    ArchitectureConnection,
    VersionCreate
)
from backend.schemas.response import success_response, error_response, CloudTwinException

router = APIRouter(prefix="/architectures", tags=["Architectures"])

@router.get("")
async def list_architectures(project_id: Optional[str] = None):
    results = list(store.architectures.values())
    if project_id:
        results = [a for a in results if a.project_id == project_id]
    return success_response(results)

@router.post("")
async def create_architecture(payload: ArchitectureCreate):
    arch_id = f"arch-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.utcnow().isoformat()
    
    arch = ArchitectureSchema(
        id=arch_id,
        project_id=payload.project_id,
        name=payload.name,
        description=payload.description or "AWS Cloud Architecture Twin",
        version="1.0.0",
        schema_version="1.0",
        region=payload.region or "ap-south-1",
        nodes=payload.nodes or [],
        connections=payload.connections or [],
        metadata=payload.metadata or {}
    )
    store.architectures[arch_id] = arch
    
    # Persist to AWS RDS PostgreSQL
    arch_dict = arch.model_dump()
    arch_dict["created_at"] = now
    arch_dict["updated_at"] = now
    db_service.save_architecture(arch_dict)
    
    # Create initial version
    store.architecture_versions[arch_id] = [
        {
            "id": f"ver-{uuid.uuid4().hex[:6]}",
            "architecture_id": arch_id,
            "version_number": 1,
            "change_summary": "Initial architecture baseline created",
            "snapshot_json": arch.model_dump(),
            "created_at": now
        }
    ]
    
    return success_response(arch)

@router.get("/{architecture_id}")
async def get_architecture(architecture_id: str):
    arch = store.architectures.get(architecture_id)
    if not arch:
        raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", f"Architecture '{architecture_id}' was not found.")
    return success_response(arch)

@router.put("/{architecture_id}")
async def update_architecture(architecture_id: str, updates: ArchitectureUpdate):
    arch = store.architectures.get(architecture_id)
    if not arch:
        raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", f"Architecture '{architecture_id}' was not found.")
    
    if updates.name is not None:
        arch.name = updates.name
    if updates.description is not None:
        arch.description = updates.description
    if updates.region is not None:
        arch.region = updates.region
    if updates.version is not None:
        arch.version = updates.version
    if updates.nodes is not None:
        arch.nodes = updates.nodes
    if updates.connections is not None:
        arch.connections = updates.connections
    if updates.metadata is not None:
        arch.metadata = updates.metadata

    store.architectures[architecture_id] = arch
    
    # Persist updates to AWS RDS PostgreSQL
    arch_dict = arch.model_dump()
    arch_dict["updated_at"] = datetime.datetime.utcnow().isoformat()
    db_service.save_architecture(arch_dict)
    
    return success_response(arch)

@router.delete("/{architecture_id}")
async def delete_architecture(architecture_id: str):
    if architecture_id in store.architectures:
        del store.architectures[architecture_id]
        if architecture_id in store.architecture_versions:
            del store.architecture_versions[architecture_id]
        return success_response({"deleted_id": architecture_id})
    raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", "Architecture not found.")

@router.post("/{architecture_id}/validate")
async def validate_architecture(architecture_id: str):
    arch = store.architectures.get(architecture_id)
    if not arch:
        raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", f"Architecture '{architecture_id}' was not found.")
    
    issues = []
    # Check 1: Nodes exist
    if not arch.nodes:
        issues.append({"level": "error", "message": "Architecture has no components on canvas."})

    # Check 2: Orphan nodes
    node_ids = {n.id for n in arch.nodes}
    connected_ids = set()
    for c in arch.connections:
        connected_ids.add(c.source)
        connected_ids.add(c.target)
    
    for n in arch.nodes:
        if n.id not in connected_ids and len(arch.nodes) > 1:
            issues.append({
                "level": "warning",
                "node_id": n.id,
                "message": f"Component '{n.name}' ({n.type}) is disconnected from the architecture graph."
            })

    # Check 3: Check ingress path
    ingress_types = {"ALB", "ELB", "CLOUDFRONT", "ROUTE53", "API_GATEWAY"}
    has_ingress = any(n.type.upper() in ingress_types for n in arch.nodes)
    if not has_ingress and len(arch.nodes) > 1:
        issues.append({
            "level": "warning",
            "message": "Architecture does not have an edge ingress tier (ALB, CloudFront, or API Gateway)."
        })

    is_valid = not any(i["level"] == "error" for i in issues)
    return success_response({
        "valid": is_valid,
        "total_nodes": len(arch.nodes),
        "total_connections": len(arch.connections),
        "issues": issues
    })

# --- Versioning Endpoints ---

@router.get("/{architecture_id}/versions")
async def list_versions(architecture_id: str):
    versions = store.architecture_versions.get(architecture_id, [])
    return success_response(versions)

@router.post("/{architecture_id}/versions")
async def create_version(architecture_id: str, payload: VersionCreate):
    arch = store.architectures.get(architecture_id)
    if not arch:
        raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", "Architecture not found.")
    
    versions = store.architecture_versions.get(architecture_id, [])
    next_num = len(versions) + 1
    new_version_id = f"ver-{uuid.uuid4().hex[:6]}"
    
    version_record = {
        "id": new_version_id,
        "architecture_id": architecture_id,
        "version_number": next_num,
        "change_summary": payload.change_summary or f"Version {next_num} snapshot",
        "snapshot_json": arch.model_dump(),
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    if architecture_id not in store.architecture_versions:
        store.architecture_versions[architecture_id] = []
    store.architecture_versions[architecture_id].append(version_record)
    
    # Update current architecture version string
    arch.version = f"1.{next_num}.0"
    
    return success_response(version_record)

@router.post("/{architecture_id}/versions/{version_id}/restore")
async def restore_version(architecture_id: str, version_id: str):
    versions = store.architecture_versions.get(architecture_id, [])
    match = next((v for v in versions if v["id"] == version_id), None)
    if not match:
        raise CloudTwinException(404, "VERSION_NOT_FOUND", "Version snapshot not found.")
    
    snapshot = match["snapshot_json"]
    restored = ArchitectureSchema(**snapshot)
    store.architectures[architecture_id] = restored
    return success_response(restored)
