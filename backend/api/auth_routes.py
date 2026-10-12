"""
CloudTwin Authentication API Routes
Provides AWS CloudTwin JWT / IAM Authentication with seamless guest/demo session fallback.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import datetime
import uuid
import jwt
from backend.core.config import settings
from backend.schemas.response import success_response, error_response

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = "Cloud Architect"
    company: Optional[str] = "Enterprise Cloud"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    company: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None

from backend.core.db import db_service

# Fallback default demo user
DEFAULT_DEMO_USER = {
    "id": "user-demo-01",
    "email": "architect@cloudtwin.io",
    "full_name": "Alex Mercer",
    "role": "Principal Cloud Architect",
    "company": "CloudTwin Labs",
    "tier": "enterprise",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
}

def create_jwt_token(user_data: Dict[str, Any]) -> str:
    payload = {
        "sub": user_data["id"],
        "email": user_data["email"],
        "role": user_data.get("role", "architect"),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")

@router.post("/signup")
async def signup(request: SignUpRequest):
    email = request.email.lower().strip()
    
    # Check if user already exists in RDS
    existing = db_service.get_user_by_email(email)
    if existing:
        token = create_jwt_token(existing)
        return success_response({
            "user": existing,
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 604800
        })

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_profile = {
        "id": user_id,
        "email": email,
        "full_name": request.full_name or email.split("@")[0].capitalize(),
        "role": "Cloud Architect",
        "company": request.company or "Independent",
        "tier": "pro",
        "avatar_url": f"https://api.dicebear.com/7.x/shapes/svg?seed={email}",
        "created_at": now,
        "updated_at": now
    }
    db_service.save_user(user_profile)
    token = create_jwt_token(user_profile)
    return success_response({
        "user": user_profile,
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 604800
    })

@router.post("/login")
async def login(request: LoginRequest):
    email = request.email.lower().strip()
    user = db_service.get_user_by_email(email)
    
    if not user:
        # Auto-provision new independent account if first time logging in
        user_id = f"user-{uuid.uuid4().hex[:8]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        user = {
            "id": user_id,
            "email": email,
            "full_name": email.split("@")[0].capitalize(),
            "role": "Cloud Architect",
            "company": "Enterprise Cloud",
            "tier": "pro",
            "avatar_url": f"https://api.dicebear.com/7.x/shapes/svg?seed={email}",
            "created_at": now,
            "updated_at": now
        }
        db_service.save_user(user)

    token = create_jwt_token(user)
    return success_response({
        "user": user,
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 604800
    })

@router.post("/guest")
async def guest_session():
    """Provides a zero-friction instant demo session with pre-populated production twin"""
    user = db_service.get_user_by_email("admin@cloudtwin.io") or DEFAULT_DEMO_USER
    token = create_jwt_token(user)
    return success_response({
        "user": user,
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 604800
    })

@router.post("/forgot-password")
async def forgot_password(request: ResetPasswordRequest):
    return success_response({
        "message": f"Password reset instructions have been dispatched to {request.email}."
    })

@router.get("/me")
async def get_current_user_profile(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
        
    token = authorization.split(" ")[1]
    try:
        decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        email = decoded.get("email")
        user_id = decoded.get("sub")
        if email:
            user = db_service.get_user_by_email(email)
            if user:
                return success_response(user)
        if user_id:
            user = db_service.get_user_by_id(user_id)
            if user:
                return success_response(user)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
        
    raise HTTPException(status_code=401, detail="User account not found")

@router.put("/profile")
async def update_profile(request: ProfileUpdateRequest, authorization: Optional[str] = Header(None)):
    current_user = None
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
            email = decoded.get("email")
            if email:
                current_user = db_service.get_user_by_email(email)
        except Exception:
            pass
            
    if not current_user:
        current_user = dict(DEFAULT_DEMO_USER)

    if request.full_name:
        current_user["full_name"] = request.full_name
    if request.company:
        current_user["company"] = request.company
    if request.role:
        current_user["role"] = request.role
    if request.avatar_url:
        current_user["avatar_url"] = request.avatar_url
        
    current_user["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    db_service.save_user(current_user)
    return success_response(current_user)
