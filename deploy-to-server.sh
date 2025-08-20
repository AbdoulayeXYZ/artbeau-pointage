#!/bin/bash

# Script pour déployer Art'Beau Pointage sur le serveur OVH et configurer SSL
# Ce script s'exécute depuis votre machine locale

set -e

# Configuration
SERVER_IP="51.68.45.161"  # Remplacez par l'IP réelle de votre serveur
SERVER_USER="ubuntu"
REPOSITORY_PATH="/home/ubuntu/artbeau-pointage"

echo "🚀 Déploiement Art'Beau Pointage sur le serveur..."

# Charger les variables d'environnement
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi

# Copier les fichiers sur le serveur
echo "📁 Copie des fichiers sur le serveur..."

# Créer le répertoire sur le serveur s'il n'existe pas
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REPOSITORY_PATH"

# Copier les fichiers essentiels
rsync -avz --progress \
    --exclude 'node_modules/' \
    --exclude '.git/' \
    --exclude 'frontend/node_modules/' \
    --exclude 'backend/node_modules/' \
    --exclude 'frontend/build/' \
    --exclude 'backend/data/' \
    --exclude 'backend/logs/' \
    ./ $SERVER_USER@$SERVER_IP:$REPOSITORY_PATH/

echo "✅ Fichiers copiés avec succès"

# Déployer l'application HTTP d'abord
echo "📦 Déploiement de l'application HTTP..."
ssh $SERVER_USER@$SERVER_IP "cd $REPOSITORY_PATH && ./deploy.sh"

echo "⏳ Attente de la stabilisation..."
sleep 10

# Vérifier que l'application HTTP fonctionne
echo "🔍 Vérification de l'application HTTP..."
if ssh $SERVER_USER@$SERVER_IP "curl -s -f http://localhost" >/dev/null; then
    echo "✅ Application HTTP fonctionnelle"
else
    echo "❌ Application HTTP non accessible"
    echo "📋 Logs:"
    ssh $SERVER_USER@$SERVER_IP "cd $REPOSITORY_PATH && docker-compose -f docker-compose.prod.yml logs --tail=10 frontend"
    exit 1
fi

# Configurer SSL
echo "🔒 Configuration SSL..."
ssh $SERVER_USER@$SERVER_IP "cd $REPOSITORY_PATH && chmod +x deploy-ssl.sh && ./deploy-ssl.sh"

echo ""
echo "🎉 Déploiement terminé!"
echo "========================"
echo ""
echo "🌐 Votre application est accessible sur:"
echo "   https://pointage.artbeaurescence.sn"
echo "   http://pointage.artbeaurescence.sn (redirigé vers HTTPS)"
echo ""
echo "🔧 Commandes utiles pour gérer l'application sur le serveur:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   cd $REPOSITORY_PATH"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo "   docker-compose -f docker-compose.prod.yml restart"
echo ""
