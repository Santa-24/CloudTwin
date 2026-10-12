"""
CloudTwin Project Models
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cloud_provider: str = "aws"
    default_region: str = "ap-south-1"
    template: Optional[str] = "enterprise_11_service"
    tags: List[str] = Field(default_factory=list)

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    default_region: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    cloud_provider: str = "aws"
    default_region: str = "ap-south-1"
    tags: List[str] = Field(default_factory=list)
    status: str = "active"
    architecture_count: int = 0
    simulation_count: int = 0
    health_score: float = 100.0
    created_at: str
    updated_at: str
