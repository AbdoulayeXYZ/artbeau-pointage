#!/bin/bash

# Script de déploiement SSL local pour Art'Beau Pointage
# Version pour test local (sans vérification de domaine externe)

set -e

echo "🔐 Déploiement SSL local pour Art'Beau Pointage..."

# Vérifier que Docker et Docker Compose sont installés
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down

# Reconstruire les images
echo "🔨 Reconstruction des images..."
docker-compose -f docker-compose.prod.yml build

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services démarrent
echo "⏳ Attente du démarrage des services..."
sleep 15

# Vérifier que le frontend est accessible
echo "🔍 Vérification de l'accessibilité du frontend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo "✅ Frontend accessible localement"
else
    echo "❌ Frontend non accessible localement"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Installer Certbot
echo "📦 Installation de Certbot..."
docker-compose -f docker-compose.prod.yml exec -T frontend apk add --no-cache certbot certbot-nginx

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Configuration SSL locale terminée!"
echo ""
echo "🌐 Votre application est accessible localement sur:"
echo "   HTTP:  http://localhost:80"
echo "   HTTPS: http://localhost:443 (une fois les certificats obtenus)"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Assurez-vous que votre tunnel Cloudflare est actif"
echo "   2. Exécutez ce script sur votre serveur distant"
echo "   3. Ou obtenez manuellement les certificats SSL"
echo ""
echo "🔍 Pour obtenir les certificats SSL manuellement:"
echo "   docker-compose -f docker-compose.prod.yml exec frontend certbot certonly --webroot \\"
echo "       --non-interactive \\"
echo "       --agree-tos \\"
echo "       --email admin@artbeaurescence.sn \\"
echo "       --domains pointage.artbeaurescence.sn \\"
echo "       --webroot-path /var/www/certbot"
echo ""
echo "🔍 Pour vérifier les logs:"
echo "   docker-compose -f docker-compose.prod.yml logs frontend"
