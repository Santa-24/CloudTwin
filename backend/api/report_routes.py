"""
CloudTwin Report Generation & Download API Routes
"""
from fastapi import APIRouter, Response, HTTPException
from typing import Optional
from backend.core.store import store
from backend.models.simulation import ReportCreate
from backend.services.report_service import report_service
from backend.services.storage_service import storage_service
from backend.schemas.response import success_response, CloudTwinException

report_router = APIRouter(prefix="/reports", tags=["Reports"])

router_health = APIRouter(prefix="/health", tags=["Health & Status"])
@router_health.get("")
@router_health.get("/")
async def system_health():
    return success_response({
        "status": "healthy",
        "system": "CloudTwin Core Backend Orchestration Layer",
        "version": "1.0.0",
        "integrations": {
            "simulation_engine": "online (canonical adapter active)",
            "cost_engine": "online (AWS rates active)",
            "security_engine": "online (CIS AWS scanner active)",
            "recommendation_engine": "online (AI topology advisor active)",
            "aws_rds_database": "ready (AWS RDS PostgreSQL / Aurora schema active)",
            "amazon_s3_storage": "ready (Amazon S3 buckets configured)"
        }
    })

@report_router.get("/project/{project_id}")
async def list_project_reports(project_id: str):
    reports = store.reports.get(project_id, [])
    return success_response(reports)

@report_router.post("/generate")
async def generate_report(request: ReportCreate):
    record = await report_service.generate_report(request)
    return success_response(record)

@report_router.get("/{report_id}/download")
async def download_report_markdown(report_id: str):
    # Search across all project reports
    found_report = None
    for rep_list in store.reports.values():
        for r in rep_list:
            if r["id"] == report_id:
                found_report = r
                break
        if found_report:
            break
            
    if not found_report:
        raise CloudTwinException(404, "REPORT_NOT_FOUND", "Report not found.")
        
    content = found_report.get("markdown_content", "# CloudTwin Report")
    return Response(
        content=content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={found_report['title'].replace(' ', '_')}.md"}
    )
