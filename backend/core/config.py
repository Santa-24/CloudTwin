"""
CloudTwin Core Configuration Module
"""
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List

# Load environment variables from .env file
load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "CloudTwin API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # Database Configuration (AWS RDS PostgreSQL / Amazon Aurora)
    DATABASE_URL: str = os.getenv("DATABASE_URL", os.getenv("AWS_RDS_DATABASE_URL", "postgresql://cloudtwin:cloudtwin_pass@localhost:5432/cloudtwin"))
    
    # AWS Storage & Credentials
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "cloudtwin-architecture-vault")
    AWS_REGION: str = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "ap-south-1"))
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_MOCK_MODE: bool = os.getenv("AWS_MOCK_MODE", "true").lower() in ("true", "1", "yes")

    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "cloudtwin-super-secure-jwt-secret-key-prod-2026")
    

    # AI & LLM Provider
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://cloudtwin.vercel.app",
        "*"
    ]

settings = Settings()
