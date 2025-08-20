#!/bin/bash

# Script de monitoring pour Art'Beau Pointage
# Vérifie la santé de l'application et envoie des alertes si nécessaire

set -e

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_URL="http://localhost/health"
WEBHOOK_URL=""  # URL webhook pour notifications (Slack, Discord, etc.)
LOG_FILE="/var/log/artbeau-monitor.log"
MAX_RETRIES=3
RETRY_DELAY=30

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "${BLUE}$@${NC}"
}

log_warn() {
    log "WARN" "${YELLOW}$@${NC}"
}

log_error() {
    log "ERROR" "${RED}$@${NC}"
}

log_success() {
    log "SUCCESS" "${GREEN}$@${NC}"
}

# Fonction d'envoi de notification
send_notification() {
    local title="$1"
    local message="$2"
    local level="$3"
    
    if [ -n "$WEBHOOK_URL" ]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"**${title}**\\n${message}\"}" > /dev/null 2>&1
    fi
}

# Vérification de la santé de l'application
check_health() {
    local url="$1"
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s -f --max-time 10 "$url" > /dev/null 2>&1; then
            return 0
        fi
        
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            log_warn "Tentative $retries/$MAX_RETRIES échouée, nouvelle tentative dans ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    done
    
    return 1
}

# Vérification des conteneurs Docker
check_containers() {
    log_info "🐳 Vérification des conteneurs Docker..."
    
    local containers=(
        "artbeau_frontend"
        "artbeau_backend"
    )
    
    local failed_containers=()
    
    for container in "${containers[@]}"; do
        if ! docker inspect "$container" > /dev/null 2>&1; then
            failed_containers+=("$container (n'existe pas)")
            continue
        fi
        
        local status=$(docker inspect --format='{{.State.Status}}' "$container")
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-health-check")
        
        if [ "$status" != "running" ]; then
            failed_containers+=("$container (status: $status)")
        elif [ "$health" = "unhealthy" ]; then
            failed_containers+=("$container (unhealthy)")
        else
            log_success "✅ $container: OK ($status)"
        fi
    done
    
    if [ ${#failed_containers[@]} -gt 0 ]; then
        log_error "❌ Conteneurs en erreur:"
        for container in "${failed_containers[@]}"; do
            log_error "  - $container"
        done
        return 1
    fi
    
    return 0
}

# Vérification de l'espace disque
check_disk_space() {
    log_info "💾 Vérification de l'espace disque..."
    
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    local threshold=85
    
    if [ "$usage" -gt "$threshold" ]; then
        log_error "❌ Espace disque critique: ${usage}% utilisé (seuil: ${threshold}%)"
        send_notification "🚨 Alerte Espace Disque" "Utilisation: ${usage}% (seuil: ${threshold}%)" "critical"
        return 1
    else
        log_success "✅ Espace disque: ${usage}% utilisé"
    fi
    
    return 0
}

# Vérification de la mémoire
check_memory() {
    log_info "🧠 Vérification de la mémoire..."
    
    local mem_info=$(free | grep Mem)
    local total=$(echo $mem_info | awk '{print $2}')
    local used=$(echo $mem_info | awk '{print $3}')
    local usage=$((used * 100 / total))
    local threshold=90
    
    if [ "$usage" -gt "$threshold" ]; then
        log_error "❌ Utilisation mémoire élevée: ${usage}% (seuil: ${threshold}%)"
        send_notification "⚠️ Alerte Mémoire" "Utilisation: ${usage}% (seuil: ${threshold}%)" "warning"
        return 1
    else
        log_success "✅ Mémoire: ${usage}% utilisé"
    fi
    
    return 0
}

# Vérification des certificats SSL
check_ssl_certificates() {
    local domain="pointage.artbeaurescence.sn"
    
    log_info "🔒 Vérification du certificat SSL pour $domain..."
    
    if ! command -v openssl > /dev/null 2>&1; then
        log_warn "OpenSSL non trouvé, ignorer la vérification SSL"
        return 0
    fi
    
    local cert_info=$(echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        local expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
        local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
        local current_timestamp=$(date +%s)
        local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ "$days_until_expiry" -lt 30 ]; then
            log_error "❌ Certificat SSL expire dans $days_until_expiry jours"
            send_notification "🔒 Alerte Certificat SSL" "Expire dans $days_until_expiry jours" "warning"
            return 1
        else
            log_success "✅ Certificat SSL valide ($days_until_expiry jours restants)"
        fi
    else
        log_error "❌ Impossible de vérifier le certificat SSL"
        return 1
    fi
    
    return 0
}

# Fonction de redémarrage automatique
auto_restart() {
    log_warn "🔄 Tentative de redémarrage automatique..."
    
    # Redémarrer les conteneurs
    if docker-compose -f "$COMPOSE_FILE" restart; then
        log_success "✅ Redémarrage effectué"
        
        # Attendre un peu et revérifier
        sleep 30
        if check_health "$HEALTH_URL"; then
            log_success "✅ Application fonctionnelle après redémarrage"
            send_notification "🔄 Redémarrage Automatique" "Application restaurée avec succès" "info"
            return 0
        fi
    fi
    
    log_error "❌ Échec du redémarrage automatique"
    send_notification "🚨 Échec Redémarrage" "Intervention manuelle requise" "critical"
    return 1
}

# Nettoyage automatique
cleanup() {
    log_info "🧹 Nettoyage automatique..."
    
    # Nettoyer les logs Docker anciens
    docker system prune -f --filter "until=72h" > /dev/null 2>&1
    
    # Nettoyer les logs applicatifs anciens (garder 7 jours)
    find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Nettoyer les sauvegardes anciennes (garder 30 jours)
    find ./backups -name "backup-*.json" -mtime +30 -delete 2>/dev/null || true
    
    log_success "✅ Nettoyage terminé"
}

# Fonction principale de monitoring
main() {
    local mode="${1:-check}"
    
    case "$mode" in
        "check")
            log_info "🔍 Démarrage du monitoring Art'Beau Pointage..."
            
            local failed_checks=0
            
            # Vérifications
            check_containers || failed_checks=$((failed_checks + 1))
            check_disk_space || failed_checks=$((failed_checks + 1))
            check_memory || failed_checks=$((failed_checks + 1))
            check_ssl_certificates || failed_checks=$((failed_checks + 1))
            
            # Vérification de la santé de l'application
            log_info "🏥 Vérification de la santé de l'application..."
            if check_health "$HEALTH_URL"; then
                log_success "✅ Application accessible et fonctionnelle"
            else
                log_error "❌ Application non accessible"
                failed_checks=$((failed_checks + 1))
                
                # Tentative de redémarrage automatique
                auto_restart || failed_checks=$((failed_checks + 1))
            fi
            
            # Résultat final
            if [ "$failed_checks" -eq 0 ]; then
                log_success "🎉 Tous les contrôles sont passés avec succès"
                exit 0
            else
                log_error "❌ $failed_checks contrôle(s) ont échoué"
                exit 1
            fi
            ;;
            
        "cleanup")
            cleanup
            ;;
            
        "restart")
            auto_restart
            ;;
            
        *)
            echo "Usage: $0 [check|cleanup|restart]"
            echo "  check   - Effectue tous les contrôles (défaut)"
            echo "  cleanup - Nettoie les fichiers temporaires"
            echo "  restart - Redémarre l'application"
            exit 1
            ;;
    esac
}

# Créer le fichier de log s'il n'existe pas
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/artbeau-monitor.log"

# Exécuter le script
main "$@"
