#!/bin/sh

# Script de démarrage Nginx avec SSL automatique
# Domaine: pointage.artbeaurescence.sn

set -e

echo "🚀 Démarrage d'Art'Beau Pointage avec SSL..."

# Créer le répertoire pour les challenges Let's Encrypt
mkdir -p /var/www/certbot

# Vérifier si les certificats SSL existent
if [ ! -f "/etc/letsencrypt/live/pointage.artbeaurescence.sn/fullchain.pem" ]; then
    echo "📜 Certificats SSL non trouvés. Configuration initiale..."
    
    # Démarrer Nginx en mode HTTP pour permettre la validation
    echo "🔧 Démarrage de Nginx en mode HTTP pour validation SSL..."
    nginx -g "daemon off;" &
    NGINX_PID=$!
    
    # Attendre que Nginx démarre
    sleep 5
    
    # Obtenir le certificat SSL avec Certbot
    echo "🔐 Obtention du certificat SSL avec Let's Encrypt..."
    certbot certonly --webroot \
        --non-interactive \
        --agree-tos \
        --email admin@artbeaurescence.sn \
        --domains pointage.artbeaurescence.sn \
        --webroot-path /var/www/certbot
    
    # Arrêter Nginx temporaire
    kill $NGINX_PID || true
    sleep 2
    
    # Créer la configuration SSL
    echo "🔧 Création de la configuration SSL..."
    cat > /etc/nginx/conf.d/default.conf << 'EOF'
# Configuration Nginx avec SSL pour Art'Beau Pointage
# Domaine: pointage.artbeaurescence.sn

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name pointage.artbeaurescence.sn;
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS principale
server {
    listen 443 ssl http2;
    server_name pointage.artbeaurescence.sn;
    
    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/pointage.artbeaurescence.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pointage.artbeaurescence.sn/privkey.pem;
    
    # Configuration SSL sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Root directory
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        application/javascript
        application/json
        text/css
        text/javascript
        text/xml
        text/plain;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://backend:3001/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    # Redémarrer Nginx avec SSL
    echo "🌐 Redémarrage de Nginx avec SSL..."
    exec nginx -g "daemon off;"
else
    echo "✅ Certificats SSL trouvés"
    
    # Vérifier la validité du certificat
    echo "🔍 Vérification de la validité du certificat SSL..."
    if certbot certificates | grep -q "VALID"; then
        echo "✅ Certificat SSL valide"
    else
        echo "⚠️  Certificat SSL expiré ou invalide. Renouvellement..."
        certbot renew --quiet
    fi
    
    # Démarrer Nginx en mode production
    echo "🌐 Démarrage de Nginx en mode production..."
    exec nginx -g "daemon off;"
fi
