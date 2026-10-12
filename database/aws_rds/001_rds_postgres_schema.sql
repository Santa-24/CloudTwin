-- ==============================================================================
-- CloudTwin AWS RDS PostgreSQL / Amazon Aurora DDL Schema
-- Production Relational Database for Multi-Tenant Cloud Architectures
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Profiles & AWS IAM Mappings
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'architect',
    company VARCHAR(255) DEFAULT 'Enterprise Cloud',
    tier VARCHAR(50) DEFAULT 'enterprise',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects (AWS Digital Twin Workspaces)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cloud_provider VARCHAR(50) DEFAULT 'aws',
    default_region VARCHAR(50) DEFAULT 'ap-south-1',
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Architectures (Canonical CloudTwin Topology Graph)
CREATE TABLE IF NOT EXISTS architectures (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0.0',
    schema_version VARCHAR(50) DEFAULT '1.0',
    region VARCHAR(50) DEFAULT 'ap-south-1',
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    connections JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Architecture Snapshots / Version History
CREATE TABLE IF NOT EXISTS architecture_versions (
    id VARCHAR(64) PRIMARY KEY,
    architecture_id VARCHAR(64) REFERENCES architectures(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    change_summary TEXT NOT NULL,
    snapshot_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Simulation Scenarios & Results (Member 2 What-If Runs)
CREATE TABLE IF NOT EXISTS simulations (
    id VARCHAR(64) PRIMARY KEY,
    architecture_id VARCHAR(64) REFERENCES architectures(id) ON DELETE CASCADE,
    scenario_id VARCHAR(64) NOT NULL,
    scenario_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    execution_duration_ms INT DEFAULT 0,
    health_score NUMERIC(5,2),
    performance_score NUMERIC(5,2),
    scalability_score NUMERIC(5,2),
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    bottlenecks JSONB NOT NULL DEFAULT '[]'::jsonb,
    scaling_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    time_series_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Cost Estimates (Member 3 AWS Pricing Projections)
CREATE TABLE IF NOT EXISTS cost_estimates (
    id VARCHAR(64) PRIMARY KEY,
    architecture_id VARCHAR(64) REFERENCES architectures(id) ON DELETE CASCADE,
    simulation_id VARCHAR(64) REFERENCES simulations(id) ON DELETE SET NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    currency_symbol VARCHAR(5) DEFAULT '$',
    baseline_monthly_cost NUMERIC(12,2) NOT NULL,
    simulated_monthly_cost NUMERIC(12,2) NOT NULL,
    delta_monthly_cost NUMERIC(12,2) NOT NULL,
    delta_percentage NUMERIC(6,2) NOT NULL,
    breakdown_by_service JSONB NOT NULL DEFAULT '[]'::jsonb,
    major_cost_drivers TEXT[],
    is_estimated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Security Audits (Member 3 CIS Benchmark Findings)
CREATE TABLE IF NOT EXISTS security_audits (
    id VARCHAR(64) PRIMARY KEY,
    architecture_id VARCHAR(64) REFERENCES architectures(id) ON DELETE CASCADE,
    simulation_id VARCHAR(64) REFERENCES simulations(id) ON DELETE SET NULL,
    overall_risk_level VARCHAR(20) DEFAULT 'LOW',
    security_score NUMERIC(5,2) DEFAULT 100.0,
    critical_count INT DEFAULT 0,
    high_count INT DEFAULT 0,
    medium_count INT DEFAULT 0,
    low_count INT DEFAULT 0,
    findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Architecture Recommendations (Member 3 AI Topology Proposals)
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    architecture_id VARCHAR(64) REFERENCES architectures(id) ON DELETE CASCADE,
    simulation_id VARCHAR(64) REFERENCES simulations(id) ON DELETE SET NULL,
    priority VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    impact TEXT NOT NULL,
    suggested_topology_diff JSONB DEFAULT '{}'::jsonb,
    cost_impact TEXT,
    security_impact TEXT,
    scalability_impact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Reports (Compiled Architecture Documents)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    architecture_id VARCHAR(64) REFERENCES architectures(id) ON DELETE CASCADE,
    simulation_id VARCHAR(64) REFERENCES simulations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    format VARCHAR(20) DEFAULT 'markdown',
    file_url TEXT NOT NULL,
    summary_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-throughput queries
CREATE INDEX IF NOT EXISTS idx_architectures_project ON architectures(project_id);
CREATE INDEX IF NOT EXISTS idx_simulations_arch ON simulations(architecture_id);
CREATE INDEX IF NOT EXISTS idx_cost_arch ON cost_estimates(architecture_id);
CREATE INDEX IF NOT EXISTS idx_security_arch ON security_audits(architecture_id);
