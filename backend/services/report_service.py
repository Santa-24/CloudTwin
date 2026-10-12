"""
CloudTwin Report Service
Generates professional architecture audit and simulation reports.
Supports HTML, Markdown, and JSON export with download URLs.
"""
from typing import Dict, Any, Optional
from backend.core.store import store
from backend.models.simulation import ReportCreate
from backend.services.storage_service import storage_service
from backend.schemas.response import CloudTwinException
import datetime
import uuid

class ReportService:
    async def generate_report(self, request: ReportCreate) -> Dict[str, Any]:
        architecture = store.architectures.get(request.architecture_id)
        if not architecture:
            raise CloudTwinException(404, "ARCHITECTURE_NOT_FOUND", "Architecture not found for report generation.")

        cost = store.cost_estimates.get(request.architecture_id)
        security = store.security_overviews.get(request.architecture_id)
        recs = store.recommendations.get(request.architecture_id, [])
        sim = store.simulation_results.get(request.simulation_id) if request.simulation_id else None

        generated_at = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Build comprehensive Markdown content
        md_lines = [
            f"# CloudTwin Architecture Intelligence Report: {request.title}",
            f"**Generated:** {generated_at} | **Region:** {architecture.region} | **Architecture Version:** {architecture.version}",
            f"**Architecture ID:** `{architecture.id}` | **Project ID:** `{request.project_id}`",
            "",
            "## 1. Executive Summary",
            f"This digital twin report evaluates the resilience, operational cost, and security posture of **{architecture.name}**.",
            f"Total Nodes: **{len(architecture.nodes)}** | Total Connections: **{len(architecture.connections)}**",
            "",
            "## 2. Infrastructure Topology Snapshot",
            "| Service Name | AWS Type | Category | Key Configuration | Status |",
            "| :--- | :--- | :--- | :--- | :--- |"
        ]

        for n in architecture.nodes:
            cfg = f"{n.config.instance_type or ''} (Count: {n.config.count or 1}){' [Auto-Scaling]' if n.config.auto_scaling else ''}{' [Multi-AZ]' if n.config.multi_az else ''}"
            md_lines.append(f"| {n.name} | `{n.type}` | {n.category} | {cfg} | {n.status.upper()} |")

        if sim:
            md_lines.extend([
                "",
                f"## 3. What-If Simulation: {sim.scenario_name}",
                f"- **Overall Health Score:** {sim.health_score}%",
                f"- **Performance Score:** {sim.performance_score}%",
                f"- **Scalability Score:** {sim.scalability_score}%",
                f"- **Simulated Throughput:** {sim.metrics.get('simulated_rps', 'N/A')} req/s",
                f"- **P95 Latency:** {sim.metrics.get('p95_latency_ms', 'N/A')} ms",
                f"- **Peak Error Rate:** {sim.metrics.get('error_rate_pct', 'N/A')}%",
                "",
                "### Detected Bottlenecks",
            ])
            if sim.bottlenecks:
                for b in sim.bottlenecks:
                    md_lines.append(f"- **[{b.severity}] {b.resource_name} ({b.component_type}):** {b.summary}")
            else:
                md_lines.append("- *No saturation bottlenecks detected.*")

        if cost:
            md_lines.extend([
                "",
                "## 4. Cloud Cost Intelligence",
                f"- **Baseline Spend:** {cost.currency_symbol}{cost.baseline_monthly_cost:,.2f} / month",
                f"- **Simulated Spend:** {cost.currency_symbol}{cost.simulated_monthly_cost:,.2f} / month",
                f"- **Cost Delta:** {cost.currency_symbol}{cost.delta_monthly_cost:,.2f} / month (+{cost.delta_percentage}%)",
                "",
                "### Cost Breakdown by Service",
                "| Service | Units | Baseline Monthly | Simulated Monthly | Delta |",
                "| :--- | :--- | :--- | :--- | :--- |"
            ])
            for item in cost.breakdown_by_service:
                md_lines.append(f"| {item.name} | {item.units} | {cost.currency_symbol}{item.baseline_cost:,.2f} | {cost.currency_symbol}{item.simulated_cost:,.2f} | +{cost.currency_symbol}{item.delta_cost:,.2f} |")

        if security:
            md_lines.extend([
                "",
                f"## 5. Security & Compliance (Risk Level: {security.overall_risk_level})",
                f"- **Security Score:** {security.security_score}/100",
                f"- **Critical Findings:** {security.critical_count} | **High:** {security.high_count} | **Medium:** {security.medium_count}",
                "",
                "### Key Security Findings"
            ])
            for f in security.findings:
                md_lines.extend([
                    f"#### [{f.severity}] {f.title} ({f.affected_resource_name})",
                    f"- **Issue:** {f.description}",
                    f"- **Recommendation:** {f.recommendation}",
                    f"- **Remediation Steps:** {'; '.join(f.remediation_steps)}"
                ])

        if recs:
            md_lines.extend([
                "",
                "## 6. AI Architectural Recommendations",
            ])
            for r in recs:
                md_lines.extend([
                    f"### [{r.priority.upper()}] {r.title}",
                    f"- **Why:** {r.reason}",
                    f"- **Impact:** {r.impact}",
                    f"- **Cost Impact:** {r.cost_impact}",
                    f"- **Security Impact:** {r.security_impact}",
                    f"- **Scalability Impact:** {r.scalability_impact}"
                ])

        md_content = "\n".join(md_lines)
        report_id = f"rep-{uuid.uuid4().hex[:8]}"
        filename = f"report_{request.architecture_id}_{report_id}.md"

        # Upload report file to storage
        upload_result = await storage_service.upload_file(
            bucket="reports",
            path=filename,
            content=md_content.encode("utf-8"),
            content_type="text/markdown"
        )

        report_record = {
            "id": report_id,
            "project_id": request.project_id,
            "architecture_id": request.architecture_id,
            "simulation_id": request.simulation_id,
            "title": request.title,
            "format": request.format,
            "file_url": upload_result.get("url", f"/api/storage/reports/{filename}"),
            "markdown_content": md_content,
            "summary_json": {
                "generated_at": generated_at,
                "node_count": len(architecture.nodes),
                "health_score": sim.health_score if sim else 85.0,
                "monthly_cost": cost.baseline_monthly_cost if cost else 0.0,
                "risk_level": security.overall_risk_level if security else "LOW"
            },
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        if request.project_id not in store.reports:
            store.reports[request.project_id] = []
        store.reports[request.project_id].append(report_record)

        return report_record

report_service = ReportService()
