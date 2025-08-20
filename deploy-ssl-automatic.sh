#!/bin/bash

# Script de déploiement automatique avec SSL pour Art'Beau Pointage
# Domaine: pointage.artbeaurescence.sn

set -e

echo "🚀 Déploiement Art'Beau Pointage avec SSL automatique"
echo "=================================================="

# Variables
DOMAIN="pointage.artbeaurescence.sn"
EMAIL="admin@artbeaurescence.sn"  # Changez cette adresse email
PROJECT_DIR=$(pwd)

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que Docker et Docker Compose sont installés
check_dependencies() {
    log_info "Vérification des dépendances..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    log_success "Dépendances vérifiées"
}

# Créer les répertoires nécessaires
create_directories() {
    log_info "Création des répertoires..."
    
    mkdir -p ./logs
    mkdir -p ./backend/data
    mkdir -p ./backend/logs
    
    log_success "Répertoires créés"
}

# Arrêter les conteneurs existants
stop_containers() {
    log_info "Arrêt des conteneurs existants..."
    
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    
    log_success "Conteneurs arrêtés"
}

# Démarrer les conteneurs en mode HTTP pour validation SSL
start_http_containers() {
    log_info "Démarrage des conteneurs en mode HTTP..."
    
    # Démarrer seulement le backend et nginx en mode HTTP
    docker-compose -f docker-compose.prod.yml up -d backend frontend
    
    # Attendre que les conteneurs soient prêts
    log_info "Attente du démarrage des conteneurs..."
    sleep 10
    
    # Vérifier que le backend répond
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
        log_success "Conteneurs démarrés avec succès"
    else
        log_error "Les conteneurs ne répondent pas"
        exit 1
    fi
}

# Obtenir les certificats SSL
obtain_ssl_certificates() {
    log_info "Obtention des certificats SSL..."
    
    # Vérifier si les certificats existent déjà
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        log_warning "Certificats SSL existants détectés"
        read -p "Voulez-vous les renouveler ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Utilisation des certificats existants"
            return 0
        fi
    fi
    
    # Créer le conteneur certbot
    docker run --rm \
        -v "$(pwd)/ssl_certs:/etc/letsencrypt" \
        -v "$(pwd)/ssl_www:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --domains "$DOMAIN" \
        --force-renewal
    
    if [ $? -eq 0 ]; then
        log_success "Certificats SSL obtenus avec succès"
    else
        log_error "Échec de l'obtention des certificats SSL"
        exit 1
    fi
}

# Redémarrer les conteneurs avec SSL
restart_with_ssl() {
    log_info "Redémarrage avec SSL activé..."
    
    # Redémarrer les conteneurs
    docker-compose -f docker-compose.prod.yml restart frontend
    
    # Attendre le redémarrage
    sleep 5
    
    # Vérifier que HTTPS fonctionne
    if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
        log_success "HTTPS fonctionne correctement"
    else
        log_warning "HTTPS ne répond pas encore, vérifiez dans quelques minutes"
    fi
}

# Configurer le renouvellement automatique des certificats
setup_auto_renewal() {
    log_info "Configuration du renouvellement automatique..."
    
    # Créer le script de renouvellement
    cat > renew-ssl.sh << 'EOF'
#!/bin/bash
docker run --rm \
    -v "$(pwd)/ssl_certs:/etc/letsencrypt" \
    -v "$(pwd)/ssl_www:/var/www/certbot" \
    certbot/certbot renew --quiet

# Redémarrer nginx si les certificats ont été renouvelés
if [ $? -eq 0 ]; then
    docker-compose -f docker-compose.prod.yml restart frontend
fi
EOF
    
    chmod +x renew-ssl.sh
    
    # Ajouter au crontab pour renouvellement automatique
    (crontab -l 2>/dev/null; echo "0 12 * * * $(pwd)/renew-ssl.sh") | crontab -
    
    log_success "Renouvellement automatique configuré"
}

# Vérifier la configuration finale
verify_deployment() {
    log_info "Vérification du déploiement..."
    
    echo "🔍 Tests de connectivité:"
    
    # Test HTTP (doit rediriger vers HTTPS)
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)
    echo "   HTTP ($DOMAIN): $HTTP_STATUS"
    
    # Test HTTPS
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
    echo "   HTTPS ($DOMAIN): $HTTPS_STATUS"
    
    # Test API
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api)
    echo "   API ($DOMAIN/api): $API_STATUS"
    
    # Test Health
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/health)
    echo "   Health ($DOMAIN/health): $HEALTH_STATUS"
    
    if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
        log_success "Déploiement réussi !"
    else
        log_warning "Le déploiement semble incomplet, vérifiez les logs"
    fi
}

# Afficher les informations finales
show_final_info() {
    echo ""
    echo "🎉 Déploiement terminé !"
    echo "========================"
    echo ""
    echo "📱 Application:"
    echo "   Frontend: https://$DOMAIN"
    echo "   API: https://$DOMAIN/api"
    echo "   Health: https://$DOMAIN/health"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   Voir les logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Redémarrer: docker-compose -f docker-compose.prod.yml restart"
    echo "   Arrêter: docker-compose -f docker-compose.prod.yml down"
    echo "   Renouveler SSL: ./renew-ssl.sh"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Configurez votre DNS pour pointer vers $DOMAIN"
    echo "   2. Testez l'application"
    echo "   3. Configurez les sauvegardes si nécessaire"
    echo ""
}

# Fonction principale
main() {
    check_dependencies
    create_directories
    stop_containers
    start_http_containers
    obtain_ssl_certificates
    restart_with_ssl
    setup_auto_renewal
    verify_deployment
    show_final_info
}

# Exécuter le script principal
main "$@"
