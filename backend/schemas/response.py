"""
CloudTwin API Standard Response Schemas & Exceptions
"""
from typing import Any, Optional, Dict
from pydantic import BaseModel, Field
from fastapi import HTTPException

class APIResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None
    meta: Dict[str, Any] = Field(default_factory=dict)

class APIErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

def success_response(data: Any = None, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "success": True,
        "data": data,
        "error": None,
        "meta": meta or {}
    }

def error_response(code: str, message: str, details: Any = None, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "success": False,
        "data": None,
        "error": {
            "code": code,
            "message": message,
            "details": details
        },
        "meta": meta or {}
    }

class CloudTwinException(HTTPException):
    def __init__(self, status_code: int, code: str, message: str, details: Any = None):
        self.code = code
        self.error_message = message
        self.details = details
        super().__init__(status_code=status_code, detail={"code": code, "message": message, "details": details})
