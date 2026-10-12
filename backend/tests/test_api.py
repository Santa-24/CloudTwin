"""
CloudTwin Core Backend Unit & Integration Tests
Validates API routes, canonical schema, and Member 2 & 3 integration adapters.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"
    assert "simulation_engine" in data["data"]["integrations"]

def test_guest_auth():
    response = client.post("/api/auth/guest")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] in ["admin@cloudtwin.io", "architect@cloudtwin.io"]

def test_projects_flow():
    # List projects
    res = client.get("/api/projects")
    assert res.status_code == 200
    projects = res.json()["data"]
    assert len(projects) >= 1
    first_proj_id = projects[0]["id"]

    # Create new project
    res_create = client.post("/api/projects", json={
        "name": "E-Commerce Black Friday Twin",
        "description": "Peak shopping simulation testbed",
        "default_region": "ap-south-1",
        "tags": ["E-Commerce", "High-Volume"]
    })
    assert res_create.status_code == 200
    created = res_create.json()["data"]
    assert created["name"] == "E-Commerce Black Friday Twin"

def test_architecture_crud_and_validation():
    # Fetch default seeded architecture
    res = client.get("/api/architectures")
    assert res.status_code == 200
    archs = res.json()["data"]
    assert len(archs) >= 1
    arch_id = archs[0]["id"]

    # Validate architecture
    res_val = client.post(f"/api/architectures/{arch_id}/validate")
    assert res_val.status_code == 200
    val_data = res_val.json()["data"]
    assert val_data["valid"] is True
    assert val_data["total_nodes"] > 0

def test_simulation_workflow():
    # List scenarios
    res_sc = client.get("/api/simulations/scenarios")
    assert res_sc.status_code == 200
    scenarios = res_sc.json()["data"]
    assert len(scenarios) >= 5

    # Run 10x traffic spike simulation on seeded architecture
    res_sim = client.post("/api/simulations/run", json={
        "architecture_id": "arch-fintech-prod",
        "scenario_id": "scenario-traffic-10x",
        "custom_parameters": {"multiplier": 10.0}
    })
    assert res_sim.status_code == 200
    unified = res_sim.json()["data"]
    assert unified["health_score"] > 0
    assert "simulation" in unified
    assert "cost" in unified
    assert "security" in unified
    assert "recommendations" in unified

def test_all_11_services_architecture():
    # Fetch and validate seeded 11-service architecture
    res_val = client.post("/api/architectures/arch-enterprise-cloudtwin/validate")
    assert res_val.status_code == 200
    assert res_val.json()["data"]["valid"] is True
    assert res_val.json()["data"]["total_nodes"] == 11

    # Run simulation on 11-service architecture
    res_sim = client.post("/api/simulations/run", json={
        "architecture_id": "arch-enterprise-cloudtwin",
        "scenario_id": "scenario-traffic-5x",
        "custom_parameters": {"multiplier": 5.0}
    })
    assert res_sim.status_code == 200
    unified = res_sim.json()["data"]
    assert unified["health_score"] > 0
    # Check that cost breakdown includes multiple of the 11 services
    cost_items = unified["cost"]["breakdown_by_service"]
    service_types = {item["service_type"] for item in cost_items}
    assert "EC2" in service_types
    assert "RDS" in service_types
    assert "S3" in service_types
    assert "API_Gateway" in service_types
    assert "Lambda" in service_types
    assert "DynamoDB" in service_types
    assert "VPC" in service_types

def test_cost_intelligence():
    res = client.get("/api/cost/arch-fintech-prod?currency=USD")
    assert res.status_code == 200
    cost = res.json()["data"]
    assert cost["currency"] == "USD"
    assert cost["baseline_monthly_cost"] > 0
    assert len(cost["breakdown_by_service"]) > 0

    # Test INR toggle
    res_inr = client.get("/api/cost/arch-fintech-prod?currency=INR")
    assert res_inr.status_code == 200
    cost_inr = res_inr.json()["data"]
    assert cost_inr["currency"] == "INR"
    assert cost_inr["currency_symbol"] == "₹"

def test_security_findings():
    res = client.get("/api/security/arch-fintech-prod")
    assert res.status_code == 200
    sec = res.json()["data"]
    assert "security_score" in sec
    assert "findings" in sec

def test_ai_recommendations():
    res = client.get("/api/recommendations/arch-fintech-prod")
    assert res.status_code == 200
    recs = res.json()["data"]
    assert isinstance(recs, list)
    assert len(recs) > 0
    assert "title" in recs[0]

def test_report_generation_and_download():
    # Generate report
    res = client.post("/api/reports/generate", json={
        "project_id": "proj-cloudtwin-001",
        "architecture_id": "arch-fintech-prod",
        "title": "FinTech Core Banking Q4 Audit",
        "format": "markdown"
    })
    assert res.status_code == 200
    rep = res.json()["data"]
    rep_id = rep["id"]
    assert "file_url" in rep

    # Download report
    res_dl = client.get(f"/api/reports/{rep_id}/download")
    assert res_dl.status_code == 200
    assert "CloudTwin Architecture Intelligence Report" in res_dl.text
