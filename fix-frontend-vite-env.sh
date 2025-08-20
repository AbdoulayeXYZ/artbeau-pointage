#!/bin/bash

echo "🔧 Correction finale des variables VITE pour le frontend..."

# Configuration du serveur
SERVER_IP="51.68.45.161"
SERVER_USER="ubuntu"
PROJECT_PATH="/opt/artbeau-pointage/current"

echo "📍 IP du serveur: $SERVER_IP"

echo "📤 Envoi des fichiers d'environnement..."
# Envoyer le fichier .env.production à la racine ET dans le dossier frontend
scp .env.production.frontend ${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/.env.production
scp .env.production.frontend ${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/.env.production

echo "🚀 Reconstruction du frontend avec variables VITE correctes..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /opt/artbeau-pointage/current

echo "📋 Vérification de la structure des fichiers .env:"
echo "=== .env.production (racine) ==="
head -10 .env.production

echo "=== frontend/.env.production ==="
head -10 frontend/.env.production

echo "🔄 Arrêt et nettoyage des conteneurs..."
docker compose -f docker-compose.prod.yml down
docker image rm current-frontend || true
docker system prune -f

echo "🔨 Reconstruction avec variables d'environnement VITE..."
# Construire avec des variables d'environnement explicites
VITE_API_URL=https://pointage.artbeaurescence.sn \
VITE_SOCKET_URL=https://pointage.artbeaurescence.sn \
VITE_APP_NAME=Art\'Beau-Pointage \
VITE_APP_VERSION=1.0.0 \
docker compose -f docker-compose.prod.yml build --no-cache frontend

echo "🚀 Redémarrage des services..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Attendre le démarrage (25 secondes)..."
sleep 25

echo "🔍 Vérification des conteneurs:"
docker compose -f docker-compose.prod.yml ps

echo "🧪 Test du frontend:"
curl -k -s -o /dev/null -w "Frontend HTTPS: %{http_code}\n" https://pointage.artbeaurescence.sn/

echo "🧪 Test de l'API:"
curl -k -s -o /dev/null -w "API Login: %{http_code}\n" https://pointage.artbeaurescence.sn/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'

echo "🔍 Recherche des URLs HTTPS dans le frontend build:"
docker exec artbeau_frontend find /usr/share/nginx/html -name "*.js" -exec grep -l "https://pointage.artbeaurescence.sn" {} \; 2>/dev/null | head -3
if [ $? -eq 0 ]; then
    echo "✅ URLs HTTPS trouvées dans les fichiers JS!"
    echo "🔍 Contenu trouvé:"
    docker exec artbeau_frontend grep -h "https://pointage.artbeaurescence.sn" /usr/share/nginx/html/assets/*.js 2>/dev/null | head -2
else
    echo "❌ URLs HTTPS non trouvées - vérification des variables d'environnement par défaut:"
    docker exec artbeau_frontend grep -h "localhost:3001\|127.0.0.1" /usr/share/nginx/html/assets/*.js 2>/dev/null | head -2
fi

EOF

echo "✅ Correction finale appliquée!"
echo "🧪 Testez maintenant l'authentification sur: https://pointage.artbeaurescence.sn/"
