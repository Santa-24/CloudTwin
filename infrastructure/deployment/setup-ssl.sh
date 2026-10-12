#!/bin/bash
# ==============================================================================
# CloudTwin Platform — Free Automated HTTPS / SSL Setup (Let's Encrypt & Nginx)
# ==============================================================================
# This script provisions a free SSL certificate for your CloudTwin subdomain
# (e.g. from DuckDNS: yourname.duckdns.org, or any custom domain).
# ==============================================================================
set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ]; then
    echo "================================================================="
    echo " CloudTwin HTTPS & Subdomain Provisioning Setup"
    echo "================================================================="
    echo "Tip: You can use a 100% free DuckDNS subdomain (e.g. cloudtwin-santosh.duckdns.org)"
    echo "pointing to your EC2 IP (13.127.253.31), or your own domain name."
    echo ""
    read -p "Enter your domain / subdomain (e.g., cloudtwin.duckdns.org): " DOMAIN
fi

if [ -z "$EMAIL" ]; then
    read -p "Enter your email for Let's Encrypt renewal alerts: " EMAIL
fi

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Error: Domain and Email are required to provision SSL."
    exit 1
fi

echo ""
echo "=== Step 1: Requesting Let's Encrypt SSL Certificate for $DOMAIN ==="

# Obtain certificate using certbot container
docker run -it --rm --name certbot \
    -v "docker_certbot_etc:/etc/letsencrypt" \
    -v "docker_certbot_var:/var/lib/letsencrypt" \
    -v "docker_certbot_www:/var/www/certbot" \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" --agree-tos --no-eff-email \
    -d "$DOMAIN"

echo ""
echo "=== Step 2: Configuring Nginx with TLS 1.3 & HTTP->HTTPS Redirection ==="

cat <<EOF > infrastructure/docker/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout 65;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    upstream frontend_upstream {
        server frontend:3000;
    }

    upstream backend_upstream {
        server backend:8000;
    }

    # Redirect all HTTP (port 80) to HTTPS (port 443)
    server {
        listen 80;
        server_name $DOMAIN;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    # Secure HTTPS Server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        # Modern SSL configuration (A+ rating)
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:10m;
        ssl_session_tickets off;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "upgrade-insecure-requests; default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:;" always;

        client_max_body_size 25M;

        # Route API requests to FastAPI backend
        location /api {
            proxy_pass http://backend_upstream;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_read_timeout 120s;
        }

        # OpenAPI / Swagger Docs
        location /docs {
            proxy_pass http://backend_upstream/docs;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-Proto https;
        }

        location /openapi.json {
            proxy_pass http://backend_upstream/openapi.json;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-Proto https;
        }

        # Route all other web traffic to Next.js frontend
        location / {
            proxy_pass http://frontend_upstream;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
    }
}
EOF

echo ""
echo "=== Step 3: Reloading Nginx Container ==="
docker compose -f infrastructure/docker/docker-compose.prod.yml restart nginx

echo ""
echo "================================================================="
echo " SUCCESS! CloudTwin is now live over HTTPS!"
echo " Access URL: https://$DOMAIN"
echo "================================================================="
