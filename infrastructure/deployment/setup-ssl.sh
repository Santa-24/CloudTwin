#!/bin/bash
# ==============================================================================
# CloudTwin Platform — Production HTTPS & SSL Automated Setup (Let's Encrypt)
# ==============================================================================
# Target Domain: cloudtwin.duckdns.org (or custom domain)
# ==============================================================================
set -e

DOMAIN="${1:-cloudtwin.duckdns.org}"
EMAIL="${2:-admin@cloudtwin.io}"

echo "================================================================="
echo " Configuring HTTPS for: $DOMAIN"
echo " Contact Email:         $EMAIL"
echo "================================================================="

# 1. Temporarily stop Nginx so Certbot standalone can bind to port 80
echo ""
echo "=== Step 1: Temporarily stopping Nginx container for ACME challenge ==="
docker compose -f infrastructure/docker/docker-compose.prod.yml stop nginx || true

# 2. Ensure Certbot is installed on the host
echo ""
echo "=== Step 2: Installing Certbot on host ==="
sudo apt-get update -y
sudo apt-get install -y certbot

# 3. Request Let's Encrypt SSL Certificate
echo ""
echo "=== Step 3: Requesting Let's Encrypt SSL Certificate for $DOMAIN ==="
sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    --keep-until-expiring

# 4. Set directory permissions so Nginx container can read certificate keys
echo ""
echo "=== Step 4: Setting certificate read permissions ==="
sudo chmod -R 755 /etc/letsencrypt/live/
sudo chmod -R 755 /etc/letsencrypt/archive/

# 5. Generate Production HTTPS Nginx Configuration
echo ""
echo "=== Step 5: Generating HTTPS Nginx Configuration ==="
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
        server_name $DOMAIN localhost 13.127.253.31;

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
        server_name $DOMAIN localhost;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        # Modern SSL configuration
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

# 6. Start Nginx with new SSL config
echo ""
echo "=== Step 6: Starting Nginx Container with SSL enabled ==="
docker compose -f infrastructure/docker/docker-compose.prod.yml up -d nginx

echo ""
echo "================================================================="
echo " SUCCESS! CloudTwin is now live over HTTPS!"
echo " Secure URL: https://$DOMAIN/"
echo " API Health: https://$DOMAIN/api/health"
echo "================================================================="
