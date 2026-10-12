#!/bin/bash
# ==============================================================================
# CloudTwin Platform — AWS EC2 Automated Deployment Script (Ubuntu 22.04/24.04)
# ==============================================================================
set -e

echo "=== 1. Updating System Packages ==="
sudo apt-get update -y
sudo apt-get upgrade -y

echo "=== 2. Installing Prerequisites & Docker ==="
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# Install Docker GPG key & Repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

echo "=== 3. Verification ==="
docker --version
docker compose version

echo "=== 4. Starting CloudTwin Containers ==="
# Run from repository root
if [ -f "infrastructure/docker/docker-compose.prod.yml" ]; then
    docker compose -f infrastructure/docker/docker-compose.prod.yml up -d --build
    echo "CloudTwin successfully started on port 80!"
else
    echo "Warning: Run this script from the CloudTwin root directory."
fi
