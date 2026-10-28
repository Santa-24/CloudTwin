<div align="center">

# ☁️ CloudTwin

**AI-powered digital twin & what-if simulation platform for AWS architectures.**
Model it. Break it. Price it. Secure it. Fix it — *before* it hits production.

[![CI/CD](https://github.com/Santa-24/CloudTwin/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Santa-24/CloudTwin/actions/workflows/ci-cd.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-RDS%20%7C%20S3%20%7C%20DynamoDB-FF9900?logo=amazonaws&logoColor=white)

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Testing](#-testing) · [Deployment](#-deployment) · [Docs](#-documentation) · [Team](#-team)

<!-- 📸 Add a hero screenshot or demo GIF here: docs/assets/demo.gif -->
<!-- <img src="docs/assets/demo.gif" alt="CloudTwin demo" width="90%"> -->

</div>

---

## 🎯 What is CloudTwin?

Changing cloud infrastructure is risky, and cost or security surprises usually show up only after deployment. **CloudTwin** lets cloud architects and DevOps engineers draw an AWS architecture on an interactive canvas, then stress-test it virtually:

- 💥 **Simulate** traffic surges, Availability Zone outages, and node crashes
- 💸 **Analyze** costs per service in both **USD ($)** and **INR (₹)**
- 🛡️ **Audit** the design against **CIS AWS Foundations Benchmark** controls
- 🤖 **Get AI recommendations** with a concrete **topology diff** showing what to change

All of it runs against a model of your design, so nothing touches real infrastructure.

---

## ✨ Features

| | Capability | Details |
|---|---|---|
| 🎨 | **Visual architecture builder** | Drag-and-drop canvas built on React Flow. State persists via LocalStorage and URL hash. |
| 🧱 | **11 supported AWS services** | EC2, S3, RDS, Lambda, API Gateway, CloudFront, ALB, VPC, NAT Gateway, DynamoDB, ECS |
| 💥 | **What-if simulation** | Monte Carlo failure injection, 10× traffic surge, multi-AZ outage, latency and queue dynamics |
| 💸 | **FinOps cost intelligence** | Service-level cost projections, baseline vs. simulated cost deltas, aligned with AWS Pricing Calculator |
| 🛡️ | **Security & compliance** | CIS AWS Foundations v1.4.0 scanner, Security Hub mapping, zero-trust ingress audit, IAM and port risk scoring |
| 🤖 | **AI cloud architect** | Google Gemini-powered root-cause analysis and Well-Architected recommendations, with a machine-readable `suggested_topology_diff` |

---

## 🏗️ Architecture

```
┌─────────────────────────┐        ┌──────────────────────────────────────┐
│  Frontend (Next.js 14)  │  REST  │        Backend (FastAPI)             │
│  React Flow canvas      │◄──────►│  Orchestrator + canonical schema     │
│  Recharts dashboards    │        │                                      │
└─────────────────────────┘        │  ┌────────────┐  ┌────────────────┐  │
                                   │  │ Simulation │  │ Cost (FinOps)  │  │
                                   │  └────────────┘  └────────────────┘  │
                                   │  ┌────────────┐  ┌────────────────┐  │
                                   │  │  Security  │  │ AI Advisor     │  │
                                   │  │  (CIS)     │  │ (Gemini)       │  │
                                   │  └────────────┘  └────────────────┘  │
                                   └───────────────┬──────────────────────┘
                                                   │
                         ┌─────────────────────────┼───────────────────────┐
                         ▼                         ▼                       ▼
                  AWS RDS PostgreSQL         Amazon DynamoDB          Amazon S3
                  (core data)                (simulation telemetry)   (architecture &
                                                                       report vaults)
```

### Tech stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, React Flow (`@xyflow/react`), Framer Motion, Recharts, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy, Boto3, PyJWT, HTTPX, Pytest |
| **Data** | AWS RDS PostgreSQL / Aurora, Amazon DynamoDB, Amazon S3 |
| **DevOps** | Docker, Docker Compose, Nginx (TLS 1.3), GitHub Actions |

---

## 📁 Project Structure

```
CloudTwin/
├── backend/            # FastAPI app, simulation / cost / security / AI engines, tests
├── frontend/           # Next.js 14 app (canvas, dashboards)
├── database/aws_rds/   # PostgreSQL DDL + DynamoDB schema
├── infrastructure/     # AWS infrastructure definitions (VPC, subnets, SGs, etc.)
├── docs/               # Additional documentation
├── .github/workflows/  # CI/CD pipeline
├── docker-compose.yml  # Multi-container stack
├── .env.example        # Environment variable template
└── start.bat / start.ps1   # One-click Windows launchers
```

---

## 🚀 Quick Start

### Prerequisites

- Python **3.11+**
- Node.js **18+** and npm
- Docker & Docker Compose *(optional, for the containerized stack)*
- AWS credentials and a Gemini API key *(only needed for live AWS and AI features)*

### 1. Clone and configure

```bash
git clone https://github.com/Santa-24/CloudTwin.git
cd CloudTwin
cp .env.example .env      # then fill in your values
```

> ⚠️ Never commit `.env`. It is already covered by `.gitignore`.

### 2. Choose how to run

<details open>
<summary><b>Option A: Docker Compose (recommended)</b></summary>

```bash
docker-compose up --build
```

</details>

<details>
<summary><b>Option B: Run services manually</b></summary>

**Backend**

```bash
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

**Frontend** (new terminal)

```bash
cd frontend
npm install
npm run dev
```

</details>

<details>
<summary><b>Option C: Windows one-click</b></summary>

```powershell
.\start.bat     # or: .\start.ps1
```

</details>

### 3. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger / OpenAPI docs | http://localhost:8000/docs |

---

## 🧪 Testing

```bash
python -m pytest backend/tests/ -v
```

Tests also run automatically on every push through GitHub Actions.

---

## 🗄️ Database & Storage

Schemas live in [`database/aws_rds/`](database/aws_rds):

| File / Resource | Purpose |
|---|---|
| `001_rds_postgres_schema.sql` | Core RDS / Aurora PostgreSQL DDL, foreign keys, indexes |
| `002_dynamodb_schema.json` | DynamoDB table and GSI for simulation telemetry |
| `cloudtwin-architecture-vault` (S3) | Saved architecture states |
| `cloudtwin-reports-vault` (S3) | Exported audit and cost reports |

---

## ☁️ Deployment

A full AWS EC2 walkthrough is in [`docs/AWS_DEPLOYMENT_GUIDE.md`](docs/AWS_DEPLOYMENT_GUIDE.md). The target deployment includes:

- Dual-AZ VPC with chained security groups
- RDS PostgreSQL and DynamoDB for persistence
- Nginx reverse proxy with TLS 1.3
- Docker Compose multi-container stack
- Zero-cost teardown governance to avoid idle AWS spend

---

## 📚 Documentation

| Document | Description |
|---|---|
| [System Architecture](docs/architecture.md) | Deep dive into system topology, services, and schemas |
| [AWS Deployment Guide](docs/AWS_DEPLOYMENT_GUIDE.md) | Step-by-step production deployment on AWS EC2 & RDS |
| [Engine Integration Guide](docs/integration.md) | Integration contracts for simulation, FinOps, and security engines |
| [API Documentation](docs/api.md) | REST API endpoints and data models |

---

## 👥 Team

| Member | Domain | Ownership |
|---|---|---|
| **Santanu** *(Lead)* | Full-stack platform & orchestration | Next.js 14 app, React Flow canvas, FastAPI core, canonical schema contract, state persistence, cross-engine bridge |
| **Member 2** | Simulation & behavioral modeling | AWS behavior models, Monte Carlo failure injection, traffic surge and multi-AZ outage scenarios |
| **Member 3** | Cloud FinOps | AWS Pricing API integration ($ / ₹), service-level cost projections, cost deltas |
| **Member 4** | Security & compliance | CIS v1.4.0 scanner, Security Hub mapping, zero-trust ingress audit, IAM and port risk scoring |
| **Member 5** | AI architect & advisor | Gemini integration, `suggested_topology_diff` generator, root-cause mitigation |
| **Member 6** | Infrastructure, DevOps & SRE | VPC and subnets, RDS / DynamoDB / S3, Docker Compose, Nginx TLS, teardown governance |

---

## 🗺️ Roadmap

- [ ] Support for additional AWS services
- [ ] Import existing architectures from Terraform / CloudFormation
- [ ] Exportable PDF reports for cost and compliance results
- [ ] Multi-user workspaces and shareable simulations

*(Edit this list to match your real plans.)*

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes and add tests
3. Run `python -m pytest backend/tests/ -v`
4. Open a pull request describing what and why

---

## 📄 License

Distributed under the **Apache License 2.0**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

If CloudTwin helps you, consider giving it a ⭐

</div>
