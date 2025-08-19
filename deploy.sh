#!/bin/bash

# Script de déploiement pour Art'Beau Pointage
# Usage: ./deploy.sh [server_ip] [user]

set -e  # Arrêter en cas d'erreur

# Configuration
SERVER_IP=${1:-"YOUR_SERVER_IP"}
USER=${2:-"root"}
APP_NAME="artbeau-pointage"
REMOTE_DIR="/opt/$APP_NAME"

echo "🚀 Déploiement de $APP_NAME sur $SERVER_IP"

# Vérifier que les fichiers nécessaires existent
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ docker-compose.prod.yml introuvable"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production introuvable"
    exit 1
fi

# Créer l'archive du projet
echo "📦 Création de l'archive..."
tar -czf "${APP_NAME}.tar.gz" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude="backend/data/*.db" \
    --exclude="dist" \
    --exclude="build" \
    .

# Copier les fichiers sur le serveur
echo "📤 Copie des fichiers sur le serveur..."
scp "${APP_NAME}.tar.gz" $USER@$SERVER_IP:/tmp/

# Se connecter au serveur et déployer
echo "🔧 Déploiement sur le serveur..."
ssh $USER@$SERVER_IP << EOF
    # Arrêter les conteneurs existants
    cd $REMOTE_DIR 2>/dev/null && docker-compose -f docker-compose.prod.yml down || true
    
    # Créer le répertoire de déploiement
    mkdir -p $REMOTE_DIR
    cd $REMOTE_DIR
    
    # Sauvegarder l'ancien déploiement
    if [ -d "current" ]; then
        mv current backup-\$(date +%Y%m%d-%H%M%S) || true
    fi
    
    # Extraire la nouvelle version
    mkdir current
    cd current
    tar -xzf /tmp/${APP_NAME}.tar.gz
    
    # Copier le fichier d'environnement (à personnaliser)
    cp .env.production .env
    
    # Créer les répertoires nécessaires
    mkdir -p backend/data backend/logs
    chmod 755 backend/data backend/logs
    
    # Construire et lancer les conteneurs
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    # Attendre que les services démarrent
    echo "⏳ Attente du démarrage des services..."
    sleep 30
    
    # Vérifier que l'application fonctionne
    if curl -f -s http://localhost/health > /dev/null; then
        echo "✅ Application déployée avec succès!"
        echo "🌐 Accessible sur: http://$SERVER_IP"
    else
        echo "❌ Problème lors du démarrage"
        docker-compose -f docker-compose.prod.yml logs --tail=50
        exit 1
    fi
    
    # Nettoyer les anciennes images Docker
    docker image prune -f || true
    
    # Supprimer l'archive temporaire
    rm /tmp/${APP_NAME}.tar.gz
EOF

# Nettoyer localement
rm "${APP_NAME}.tar.gz"

echo ""
echo "🎉 Déploiement terminé!"
echo "📱 Votre application est accessible sur: http://$SERVER_IP"
echo "📊 Health check: http://$SERVER_IP/health"
echo ""
echo "Commands utiles pour le serveur:"
echo "  • Voir les logs: ssh $USER@$SERVER_IP 'cd $REMOTE_DIR/current && docker-compose -f docker-compose.prod.yml logs -f'"
echo "  • Redémarrer: ssh $USER@$SERVER_IP 'cd $REMOTE_DIR/current && docker-compose -f docker-compose.prod.yml restart'"
echo "  • Arrêter: ssh $USER@$SERVER_IP 'cd $REMOTE_DIR/current && docker-compose -f docker-compose.prod.yml down'"
