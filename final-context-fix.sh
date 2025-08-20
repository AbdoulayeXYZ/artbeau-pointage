#!/bin/bash

echo "🔧 Déploiement FINAL avec Dockerfile et contexte corrigés..."

SERVER_IP="51.68.45.161"
SERVER_USER="ubuntu"
PROJECT_PATH="/opt/artbeau-pointage/current"

echo "📤 Envoi des fichiers de configuration au bon endroit..."
scp .env.production.frontend ${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/.env.production
scp nginx-ssl.conf ${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/
scp Dockerfile.frontend ${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/frontend/

echo "🚀 Reconstruction avec le contexte frontend corrigé..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /opt/artbeau-pointage/current

echo "🛑 Arrêt des services..."
docker compose -f docker-compose.prod.yml down

echo "🧹 Nettoyage des images..."
docker image rm -f current-frontend 2>/dev/null || true

echo "🔨 Reconstruction avec le contexte corrigé..."

# Changer le contexte dans docker-compose.yml dynamiquement
sed -i 's|context: .|context: ./frontend|g' docker-compose.prod.yml

docker compose -f docker-compose.prod.yml build --no-cache frontend

# Remettre le contexte à la normale
sed -i 's|context: ./frontend|context: .|g' docker-compose.prod.yml

echo "🚀 Démarrage des services..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Attente du démarrage (25s)..."
sleep 25

echo "🔍 Vérification finale:"
docker compose -f docker-compose.prod.yml ps

echo "🧪 Test des URLs HTTPS dans le build:"
if docker exec artbeau_frontend grep -r "https://pointage.artbeaurescence.sn" /usr/share/nginx/html/assets/*.js > /dev/null 2>&1; then
    echo "✅ SUCCÈS! Les URLs HTTPS sont maintenant intégrées!"
    echo "🎯 URLs trouvées:"
    docker exec artbeau_frontend grep -h "https://pointage.artbeaurescence.sn" /usr/share/nginx/html/assets/*.js | head -2
else
    echo "❌ ÉCHEC: URLs HTTPS toujours non intégrées"
    echo "🔍 Debug - contenu trouvé:"
    docker exec artbeau_frontend grep -E -h "localhost:3001|API_URL" /usr/share/nginx/html/assets/*.js 2>/dev/null | head -3
fi

EOF

echo "🎯 Déploiement terminé!"
echo "🔄 Videz le cache de votre navigateur (CTRL+F5 ou Cmd+Shift+R)"
echo "🧪 Testez: https://pointage.artbeaurescence.sn/login"
