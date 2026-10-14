# CloudTwin

> **AI-Powered Digital Twin & What-If Simulation Platform for AWS Cloud Architectures**

[![CI/CD Pipeline](https://github.com/CloudTwin/cloudtwin/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/CloudTwin/cloudtwin/actions/workflows/ci-cd.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org)
[![AWS RDS](https://img.shields.io/badge/Database-AWS%20RDS%20Postgres-527FFF?logo=amazonrds)](https://aws.amazon.com/rds/)
[![Amazon S3](https://img.shields.io/badge/Storage-Amazon%20S3-569A31?logo=amazons3)](https://aws.amazon.com/s3/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## Overview

CloudTwin allows cloud architects and DevOps engineers to visually model AWS architectures across 11 core AWS services (EC2, S3, RDS, Lambda, API Gateway, CloudFront, ALB, VPC, NAT Gateway, DynamoDB, ECS), stress-test them with real-world what-if simulations (e.g. 10× traffic surge, Availability Zone outages, node crashes), analyze cloud costs down to the service level ($ and ₹), audit against CIS AWS security benchmarks, and receive architectural recommendations with topology diffs before deploying to production.

---

## Ownership & 6-Member Engineering Team Division

| Role | Engineering Domain | Ownership & Modules |
| :--- | :--- | :--- |
| **Member 1: Santanu** *(Lead)* | **Full-Stack Platform & Core Orchestrator** | Next.js 14 App Router, React Flow Interactive Canvas, FastAPI Orchestration Core, Canonical Schema Contract, LocalStorage & Hash State Persistence, API Gateway & Cross-Engine Bridge |
| **Member 2** | **Simulation & Behavioral Modeling** | AWS Behavioral Modeling, Monte Carlo Failure Injection, 10× Traffic Surge Modeling, Multi-AZ Outage Scenarios, Latency & Queue Dynamics |
| **Member 3** | **Cloud FinOps & Cost Intelligence** | AWS Pricing API Integration ($ and ₹), Granular Service-Level Cost Projections, Baseline vs. Simulated Cost Deltas, AWS Pricing Calculator Alignment |
| **Member 4** | **Cloud Security & Compliance** | CIS AWS Foundations Benchmark v1.4.0 Scanner, AWS Security Hub Mapping, Zero-Trust Ingress Audits, IAM Least-Privilege & Port Risk Scoring |
| **Member 5** | **AI Cloud Architect & Topology Advisor** | Google Gemini AI / LLM Integration, Automated Architecture Topology Diff Generator (`suggested_topology_diff`), Root Cause Failure Mitigation, Well-Architected Recommendations |
| **Member 6** | **Cloud Infrastructure, DevOps & SRE** | Dual-AZ AWS VPC & Subnets, Security Group Chaining, AWS RDS PostgreSQL Schema, Amazon DynamoDB Streams, S3 Vaults, Docker Compose Multi-Container Stack, Nginx TLS 1.3 & SSL Automation, Zero-Cost Teardown Governance |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, React Flow (`@xyflow/react`), Framer Motion, Lucide Icons, Recharts
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Pytest, HTTPX, PyJWT, Boto3, SQLAlchemy
- **Database & Storage**: AWS RDS PostgreSQL / Amazon Aurora & Amazon DynamoDB, Amazon S3 for Architecture & Report Vaults
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD

---

## Quick Start (Local Development)

### 1. Start Backend
```bash
# In project root
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend application will be live at `http://localhost:3000`.

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

---

## Running Test Suite

```bash
python -m pytest backend/tests/ -v
```

---

## Database Schemas (AWS RDS & DynamoDB)

All schema definitions are located in `database/aws_rds/`:
- `001_rds_postgres_schema.sql`: Core AWS RDS / Aurora PostgreSQL DDL, foreign keys, and indexes
- `002_dynamodb_schema.json`: Amazon DynamoDB schema definition and GSI for simulation telemetry
- S3 Buckets: `cloudtwin-architecture-vault` and `cloudtwin-reports-vault` for architecture states and audit exports
