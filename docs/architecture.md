# CloudTwin Architecture Documentation

## 1. Executive Summary
**CloudTwin** is an AI-powered digital twin and what-if simulation platform designed for AWS cloud architectures. It allows cloud architects, platform engineers, and DevOps leads to model topologies visually, stress-test configurations against simulated failure scenarios, calculate precise cost differentials, enforce CIS AWS security benchmarks, and receive architectural improvements prior to production deployment.

## 2. System Topology

```
+-------------------------------------------------------------------+
|                        Client Layer (Browser)                     |
| Next.js 14 App Router | React Flow Canvas | Lucide | Recharts     |
+---------------------------------+---------------------------------+
                                  |
                   HTTP/REST + JWT Bearer Auth
                                  v
+---------------------------------+---------------------------------+
|                    FastAPI Orchestration Core                     |
|                                                                   |
|  +-------------------+  +-------------------+  +---------------+  |
|  | Architecture Svc  |  | Simulation Runner |  | Report Engine |  |
|  +-------------------+  +-------------------+  +---------------+  |
|                                 |                                 |
|  +------------------------------+------------------------------+  |
|  |                      Integration Adapters                   |  |
|  |  +----------------+  +-------------+  +------------------+  |  |
|  |  | Member 2 Sim   |  | Member 3    |  | Member 3 AI      |  |  |
|  |  | Engine Adapter |  | Cost/Sec    |  | Recommendations  |  |  |
|  |  +----------------+  +-------------+  +------------------+  |  |
|  +-------------------------------------------------------------+  |
+---------------------------------+---------------------------------+
                                  |
              +-------------------+-------------------+
              v                                       v
+-----------------------------+     +-------------------------------+
|   AWS RDS / DynamoDB Engine |     |       Amazon S3 Vault         |
|  - Profiles & Projects      |     |  - avatars/                   |
|  - Canonical Architecture   |     |  - project-assets/            |
|  - Simulation Telemetry     |     |  - architecture-exports/      |
|  - Relational & NoSQL Store |     |  - reports/                   |
+-----------------------------+     +-------------------------------+
```

## 3. Core Principles
1. **Canonical Schema Contract**: A single normalized schema for nodes, connections, and configurations guarantees seamless interchange across frontend, backend, Member 2 simulation engine, and Member 3 cost/security engines.
2. **Tenant Isolation & Security**: Every database table is guarded by AWS IAM, encrypted with AWS KMS, and enforces organization-level isolation.
3. **Resilient Offline/Demo Mode**: The application operates gracefully in both live AWS cloud environments (with RDS & S3) and isolated demo environments.
