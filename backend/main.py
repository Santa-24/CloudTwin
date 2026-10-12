"""
CloudTwin Core Backend Orchestration Service
Full-Stack & Integration Layer
"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings
from backend.schemas.response import CloudTwinException, error_response
from backend.api.auth_routes import router as auth_router
from backend.api.project_routes import router as project_router
from backend.api.architecture_routes import router as architecture_router
from backend.api.simulation_routes import router as simulation_router
from backend.api.cost_routes import cost_router, security_router, rec_router
from backend.api.report_routes import report_router, router_health
from backend.services.storage_service import LOCAL_STORAGE_DIR

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CloudTwin — AI-Powered Digital Twin & What-If Simulation Platform for AWS Cloud Architectures",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(CloudTwinException)
async def cloudtwin_exception_handler(request: Request, exc: CloudTwinException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(
            code=exc.code,
            message=exc.error_message,
            details=exc.details
        )
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=error_response(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred.",
            details=str(exc)
        )
    )

# Register API Routers
app.include_router(router_health, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(project_router, prefix=settings.API_V1_STR)
app.include_router(architecture_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)
app.include_router(cost_router, prefix=settings.API_V1_STR)
app.include_router(security_router, prefix=settings.API_V1_STR)
app.include_router(rec_router, prefix=settings.API_V1_STR)
app.include_router(report_router, prefix=settings.API_V1_STR)

# Serve local storage files
os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)
app.mount("/api/storage", StaticFiles(directory=LOCAL_STORAGE_DIR), name="storage")

@app.get("/")
async def root():
    return {
        "name": "CloudTwin API",
        "status": "online",
        "documentation": "/docs",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
