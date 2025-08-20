#!/bin/bash

# Charger les variables d'environnement
if [ -f .env.production ]; then
    set -a
    source .env.production
    set +a
fi

# Script de déploiement simple pour Art'Beau Pointage
echo "🚀 Déploiement Art'Beau Pointage..."

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Reconstruire les images
echo "🔨 Reconstruction des images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services démarrent
echo "⏳ Attente du démarrage des services..."
sleep 15

# Vérifier que le frontend est accessible
echo "🔍 Vérification de l'accessibilité..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo "✅ Application accessible sur http://localhost:80"
    echo "✅ Application accessible sur http://51.68.45.161"
    echo "✅ Application accessible sur http://pointage.artbeaurescence.sn"
else
    echo "❌ Application non accessible"
    echo "📋 Logs:"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

echo ""
echo "🎉 Déploiement terminé !"
echo "========================"
echo ""
echo "📱 Application accessible sur:"
echo "   http://localhost:80"
echo "   http://51.68.45.161"
echo "   http://pointage.artbeaurescence.sn"
echo ""
echo "🔧 Commandes utiles:"
echo "   Voir les logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Redémarrer: docker-compose -f docker-compose.prod.yml restart"
echo "   Arrêter: docker-compose -f docker-compose.prod.yml down"
echo ""
