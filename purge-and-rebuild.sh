#!/bin/bash

echo "💥 Purge complète et reconstruction du frontend..."

# Configuration
SERVER_IP="51.68.45.161"
SERVER_USER="ubuntu"
PROJECT_PATH="/opt/artbeau-pointage/current"

echo "📤 Envoi des fichiers d'environnement..."
scp .env.production.frontend ${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/.env.production
scp .env.production.frontend ${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/.env.production

echo "🚀 Exécution de la purge et de la reconstruction..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /opt/artbeau-pointage/current

echo "🛑 Arrêt complet de tous les services..."
docker compose -f docker-compose.prod.yml down

echo "🧹 Purge complète des images et volumes Docker..."
docker image rm -f $(docker images -q "*artbeau*") 2>/dev/null || echo "Aucune image artbeau trouvée"
docker image rm -f $(docker images -q "*current*") 2>/dev/null || echo "Aucune image current trouvée"
docker system prune -af
docker volume prune -f

echo "📋 Vérification des variables d'environnement..."
cat frontend/.env.production

echo "🔨 Reconstruction complète sans cache..."
docker compose -f docker-compose.prod.yml build --no-cache --pull

echo "🚀 Démarrage des services..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Attente du démarrage (30s)..."
sleep 30

echo "🔍 Vérification des conteneurs:"
docker compose -f docker-compose.prod.yml ps

echo "🔍 Vérification des variables d'environnement dans le build:"
if docker exec artbeau_frontend grep -r "https://pointage.artbeaurescence.sn" /usr/share/nginx/html/assets/*.js > /dev/null 2>&1; then
    echo "✅ Les URLs HTTPS sont bien intégrées!"
else
    echo "❌ Problème: les URLs HTTPS ne sont PAS intégrées."
    echo "🔍 Contenu trouvé:"
    docker exec artbeau_frontend grep -E -h "http://localhost:3001|VITE_API_URL" /usr/share/nginx/html/assets/*.js 2>/dev/null || echo "Aucune URL trouvée"
fi

EOF

echo "🎉 Purge et reconstruction terminées!"
echo "Videz le cache de votre navigateur (CTRL+F5) et testez maintenant:"
echo "https://pointage.artbeaurescence.sn/login"
