# CloudTwin — Comprehensive AWS Deployment Guide

This guide provides end-to-end instructions for deploying the **CloudTwin** multi-tenant platform to Amazon Web Services (AWS).

---

## 1. Cloud Architecture Overview

```
                                  [ Users & Web Browsers ]
                                             │
                                             ▼
                             [ Route 53 / Elastic IP / DNS ]
                                             │
                        HTTPS (443) / HTTP (80)
                                             │
                                             ▼
                     ┌────────────────────────────────────────────────┐
                     │          Nginx Reverse Proxy                   │
                     │          (Port 80 / Port 443 with SSL)         │
                     └───────────────────────┬────────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
            [ Next.js Frontend ]                          [ FastAPI Backend ]
               (Port 3000)                                   (Port 8000)
                                                                    │
                           ┌────────────────────────────────────────┼───────────────────────┐
                           ▼                                        ▼                       ▼
            [ AWS RDS PostgreSQL (ap-south-1) ]           [ Amazon S3 Vaults ]      [ DynamoDB Events ]
                 Users & Twin Topologies                   Architecture JSONs        Simulation Logs
```

---

## 2. Prerequisites Checklist

Before beginning deployment, verify the following:
- [x] AWS Account with Administrative access in `ap-south-1` (Asia Pacific - Mumbai) or your preferred region.
- [x] Live **AWS RDS PostgreSQL** instance running (e.g. `cloudtwin-rds-postgres.c5aqg8keklz4.ap-south-1.rds.amazonaws.com`).
- [x] **Amazon S3 Buckets** created (`cloudtwin-architecture-vault-...` and `cloudtwin-reports-vault-...`).
- [x] An AWS EC2 Key Pair (`.pem`) created to SSH into the instance.

---

## 3. Recommended Deployment: AWS EC2 with Docker & Nginx (15 Minutes)

This is the most cost-effective and reliable deployment option for single-instance or staging/production environments.

### Step 1: Launch an AWS EC2 Instance

1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2).
2. Click **Launch instance** in region `ap-south-1` (Mumbai):
   - **Name**: `CloudTwin-Production-Server`
   - **AMI**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type (64-bit x86)
   - **Instance type**: `t3.medium` (2 vCPU, 4 GiB Memory) or `t3.large` (recommended for smooth Docker builds).
   - **Key pair**: Select your existing `.pem` key pair or create a new one (e.g. `cloudtwin-key.pem`).
   - **Network settings**:
     - Auto-assign public IP: **Enable**
     - Create Security Group `cloudtwin-web-sg`:
       - `SSH` (Port 22) -> My IP (or `0.0.0.0/0`)
       - `HTTP` (Port 80) -> Anywhere (`0.0.0.0/0`)
       - `HTTPS` (Port 443) -> Anywhere (`0.0.0.0/0`)
   - **Configure Storage**: 30 GiB gp3 General Purpose SSD.
3. Click **Launch instance**.

---

### Step 2: Configure RDS Security Group Inbound Rule

Your FastAPI backend running on EC2 needs network access to port `5432` of your AWS RDS PostgreSQL database.

1. Open the [AWS RDS Console](https://console.aws.amazon.com/rds).
2. Click **Databases** -> Select your database (`cloudtwin-rds-postgres`).
3. Under **Connectivity & security**, click the **VPC security groups** link.
4. Click **Inbound rules** -> **Edit inbound rules**:
   - **Type**: `PostgreSQL` (Port 5432)
   - **Source**: Select the security group of your EC2 instance (`cloudtwin-web-sg`) or your EC2 Public Elastic IP.
5. Click **Save rules**.

---

### Step 3: Connect to EC2 via SSH

From your local machine terminal:

```bash
# Set secure permissions on your key
chmod 400 cloudtwin-key.pem

# Connect to the EC2 instance (replace with your EC2 public IP or DNS)
ssh -i "cloudtwin-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

### Step 4: Clone Repository & Run Automated Setup

Once connected to your Ubuntu EC2 terminal, run:

```bash
# Clone the repository
git clone https://github.com/<YOUR_GITHUB_USER>/CloudTwin.git
cd CloudTwin

# Make the setup script executable and run it
chmod +x infrastructure/deployment/setup-ec2.sh
./infrastructure/deployment/setup-ec2.sh
```

The script will automatically install Docker, Docker Compose, system dependencies, and set up user permissions.

---

### Step 5: Configure Production Environment Variables

Create the production `.env` file on the EC2 server:

```bash
nano .env
```

Paste your live credentials:

```ini
# Core Configuration
PORT=8000
ENVIRONMENT=production
DEMO_MODE=false

# AWS Live Database Connection
DATABASE_URL=postgresql://cloudtwin_admin:Santanu2414@cloudtwin-rds-postgres.c5aqg8keklz4.ap-south-1.rds.amazonaws.com:5432/cloudtwin

# S3 & DynamoDB Configuration
DYNAMODB_TABLE_SIMULATIONS=CloudTwinSimulationEvents
AWS_S3_BUCKET=cloudtwin-architecture-vault-santanu-8831
AWS_S3_REPORTS_BUCKET=cloudtwin-reports-vault-santanu-8831

# JWT Secret
JWT_SECRET_KEY=cloudtwin-super-secure-jwt-secret-key-prod-2026

# AWS Region & Credentials
AWS_DEFAULT_REGION=ap-south-1
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
AWS_MOCK_MODE=false
```

Save and exit with `Ctrl + O`, `Enter`, then `Ctrl + X`.

---

### Step 6: Launch CloudTwin Production Containers

Launch the production stack using Docker Compose:

```bash
# Build and start all 3 services in the background (Backend, Frontend, Nginx)
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build

# Verify container status
docker compose -f infrastructure/docker/docker-compose.prod.yml ps
```

You should see 3 containers running:
- `cloudtwin-nginx`: Port 80, 443
- `cloudtwin-backend`: Port 8000 (Internal)
- `cloudtwin-frontend`: Port 3000 (Internal)

---

### Step 7: Allocate an Elastic IP (Static Public IP)

1. In the EC2 Console, navigate to **Network & Security** -> **Elastic IPs**.
2. Click **Allocate Elastic IP address** -> **Allocate**.
3. Select the allocated IP -> **Actions** -> **Associate Elastic IP address**.
4. Choose your `CloudTwin-Production-Server` instance and click **Associate**.

Now open `http://<YOUR_ELASTIC_IP>` in your browser. You will see the **CloudTwin Landing Page** live!

---

### Step 8: (Optional) Configure Custom Domain & Free SSL (HTTPS)

If you have a domain name (e.g. `cloudtwin.yourdomain.com`):

1. In your DNS provider (Route 53, GoDaddy, Cloudflare), add an **A Record** pointing your domain to the **Elastic IP**.
2. Install Certbot on EC2:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   ```
3. Stop the Docker Nginx temporarily to issue the SSL certificate:
   ```bash
   docker compose -f infrastructure/docker/docker-compose.prod.yml stop nginx
   sudo certbot certonly --standalone -d cloudtwin.yourdomain.com
   ```
4. Restart your Docker containers:
   ```bash
   docker compose -f infrastructure/docker/docker-compose.prod.yml start nginx
   ```

---

## 4. Alternative Method: AWS App Runner / ECS Fargate (Serverless Containers)

For automated horizontal autoscaling without managing virtual machines:

### Step 1: Create Amazon ECR Repositories

```bash
# Create repositories
aws ecr create-repository --repository-name cloudtwin-backend --region ap-south-1
aws ecr create-repository --repository-name cloudtwin-frontend --region ap-south-1

# Login Docker to AWS ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
```

### Step 2: Build & Push Images

```bash
# Backend Image
docker build -t cloudtwin-backend -f infrastructure/docker/Dockerfile.backend .
docker tag cloudtwin-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/cloudtwin-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/cloudtwin-backend:latest

# Frontend Image
docker build -t cloudtwin-frontend -f infrastructure/docker/Dockerfile.frontend .
docker tag cloudtwin-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/cloudtwin-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/cloudtwin-frontend:latest
```

### Step 3: Deploy via AWS App Runner

1. Open the [AWS App Runner Console](https://console.aws.amazon.com/apprunner).
2. Click **Create service**:
   - **Repository type**: Container registry -> Amazon ECR
   - **Container image URI**: Select `cloudtwin-backend:latest`
   - **Port**: `8000`
   - **Environment variables**: Add `DATABASE_URL`, `AWS_S3_BUCKET`, etc.
   - **VPC connector**: Attach to the VPC of your RDS database so the container can resolve the RDS private endpoint.
3. Repeat the steps for `cloudtwin-frontend:latest` on Port `3000`.

---

## 5. Maintenance & Useful Commands

| Task | Command |
| :--- | :--- |
| **View Live Logs** | `docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f` |
| **Inspect Backend Logs** | `docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f backend` |
| **Restart Services** | `docker compose -f infrastructure/docker/docker-compose.prod.yml restart` |
| **Pull & Deploy Updates** | `git pull && docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build` |
| **Check Docker Resources** | `docker stats` |

---

## 6. Troubleshooting Common Issues

1. **RDS Connection Timeout**:
   - *Cause*: Security group on AWS RDS is not permitting inbound traffic on port `5432`.
   - *Fix*: Go to RDS Security Group -> Inbound Rules -> Add `PostgreSQL (5432)` with source set to EC2 instance security group or Elastic IP.

2. **CORS / API 404 in Browser**:
   - *Cause*: Next.js attempting to contact `localhost:8000` rather than the server's public IP or domain.
   - *Fix*: The provided `nginx.conf` proxies `/api/` directly to `backend:8000`, so requests from the browser go to `http://<SERVER_IP>/api/` seamlessly without CORS.

3. **Disk Space Full during Docker Build**:
   - *Cause*: Build cache exhaustion on smaller disks.
   - *Fix*: Run `docker system prune -a --volumes` to clean up temporary build layers.
