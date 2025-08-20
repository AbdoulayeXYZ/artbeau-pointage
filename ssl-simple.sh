#!/bin/bash

# Script SSL simplifié pour Let's Encrypt
# À exécuter sur le serveur

set -e

DOMAIN="pointage.artbeaurescence.sn"
EMAIL="artbeaurescence.sn@gmail.com"

echo "🔒 Configuration SSL simple pour $DOMAIN..."

# Vérifier que l'app HTTP fonctionne
if ! curl -s -f http://$DOMAIN >/dev/null; then
    echo "❌ L'application HTTP n'est pas accessible sur $DOMAIN"
    exit 1
fi

echo "✅ Application HTTP accessible"

# Créer répertoires SSL
mkdir -p ssl/certs ssl/www

# Obtenir certificat avec webroot (utilise l'app qui tourne déjà)
echo "📜 Obtention du certificat SSL..."

# Le conteneur frontend expose déjà le port 80, on peut utiliser --standalone
docker run --rm --name certbot \
    -p 80:80 \
    -v "$(pwd)/ssl/certs:/etc/letsencrypt" \
    certbot/certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN || {
    
    echo "⚠️  Échec avec --standalone, essayons avec webroot..."
    
    # Arrêter temporairement le frontend pour libérer le port 80
    docker-compose -f docker-compose.prod.yml stop frontend
    
    # Obtenir le certificat
    docker run --rm --name certbot \
        -p 80:80 \
        -v "$(pwd)/ssl/certs:/etc/letsencrypt" \
        certbot/certbot certonly --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN
    
    # Redémarrer le frontend
    docker-compose -f docker-compose.prod.yml start frontend
}

if [ -d "ssl/certs/live/$DOMAIN" ]; then
    echo "✅ Certificat SSL obtenu!"
    
    # Mettre à jour docker-compose pour SSL
    sed -i.bak 's|nginx-http.conf|nginx-ssl.conf|g' docker-compose.prod.yml
    
    # Redémarrer avec SSL
    echo "🔄 Activation SSL..."
    docker-compose -f docker-compose.prod.yml restart
    
    sleep 10
    
    # Test HTTPS
    if curl -k -s https://$DOMAIN >/dev/null; then
        echo "🎉 HTTPS activé avec succès!"
        echo "🌐 Application disponible sur https://$DOMAIN"
    else
        echo "⚠️  HTTPS configuré mais vérification échouée"
        echo "📋 Vérifiez les logs: docker-compose -f docker-compose.prod.yml logs frontend"
    fi
else
    echo "❌ Échec de l'obtention du certificat SSL"
fi
