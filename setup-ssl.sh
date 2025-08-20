#!/bin/bash

# Script de configuration SSL manuelle pour Art'Beau Pointage
# Domaine: pointage.artbeaurescence.sn

set -e

echo "🔐 Configuration SSL pour Art'Beau Pointage..."

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

# Démarrer seulement le frontend pour obtenir les certificats
echo "🚀 Démarrage du frontend pour configuration SSL..."
docker-compose -f docker-compose.prod.yml up -d frontend

# Attendre que le frontend démarre
echo "⏳ Attente du démarrage du frontend..."
sleep 10

# Vérifier que le frontend est accessible
echo "🔍 Vérification de l'accessibilité du frontend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend non accessible. Vérifiez les logs:"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Obtenir le certificat SSL avec Certbot
echo "🔐 Obtention du certificat SSL avec Let's Encrypt..."
docker-compose -f docker-compose.prod.yml exec -T frontend sh -c "
    apk add --no-cache certbot certbot-nginx
    certbot certonly --webroot \
        --non-interactive \
        --agree-tos \
        --email admin@artbeaurescence.sn \
        --domains pointage.artbeaurescence.sn \
        --webroot-path /var/www/certbot
"

# Vérifier que le certificat a été obtenu
echo "🔍 Vérification du certificat SSL..."
if docker-compose -f docker-compose.prod.yml exec -T frontend test -f /etc/letsencrypt/live/pointage.artbeaurescence.sn/fullchain.pem; then
    echo "✅ Certificat SSL obtenu avec succès"
else
    echo "❌ Échec de l'obtention du certificat SSL"
    echo "📋 Logs de Certbot:"
    docker-compose -f docker-compose.prod.yml exec -T frontend cat /var/log/letsencrypt/letsencrypt.log
    exit 1
fi

# Redémarrer le frontend pour appliquer la configuration SSL
echo "🔄 Redémarrage du frontend avec SSL..."
docker-compose -f docker-compose.prod.yml restart frontend

# Démarrer le backend
echo "🚀 Démarrage du backend..."
docker-compose -f docker-compose.prod.yml up -d backend

# Attendre que tous les services démarrent
echo "⏳ Attente du démarrage de tous les services..."
sleep 10

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs:"
docker-compose -f docker-compose.prod.yml ps

# Tester l'accès HTTPS
echo "🔍 Test de l'accès HTTPS..."
if curl -s -o /dev/null -w "%{http_code}" https://pointage.artbeaurescence.sn | grep -q "200\|301\|302"; then
    echo "✅ HTTPS accessible"
else
    echo "⚠️  HTTPS non accessible. Vérifiez la configuration."
fi

echo ""
echo "✅ Configuration SSL terminée!"
echo ""
echo "🌐 Votre application est maintenant accessible sur:"
echo "   HTTP:  http://pointage.artbeaurescence.sn"
echo "   HTTPS: https://pointage.artbeaurescence.sn"
echo ""
echo "📝 Notes importantes:"
echo "   - Les certificats Let's Encrypt se renouvellent automatiquement"
echo "   - Pour renouveler manuellement: docker-compose -f docker-compose.prod.yml exec frontend certbot renew"
echo "   - Vérifiez les logs avec: docker-compose -f docker-compose.prod.yml logs frontend"
echo ""
echo "🔍 Pour vérifier le statut SSL:"
echo "   docker-compose -f docker-compose.prod.yml exec frontend certbot certificates"
