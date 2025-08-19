#!/bin/bash

# Script de configuration initiale du serveur Ubuntu
# À exécuter sur le serveur après la première connexion
# Usage: curl -fsSL https://raw.githubusercontent.com/your-repo/server-setup.sh | bash
# Ou: wget -O - https://raw.githubusercontent.com/your-repo/server-setup.sh | bash

set -e

echo "🔧 Configuration initiale du serveur pour Art'Beau Pointage"

# Mise à jour du système
echo "📦 Mise à jour du système..."
apt update && apt upgrade -y

# Installation des dépendances essentielles
echo "🛠️ Installation des dépendances..."
apt install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Installation de Docker
echo "🐳 Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
fi

# Installation de Docker Compose (version standalone)
echo "🐙 Installation de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Configuration du firewall
echo "🔥 Configuration du firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Configuration de Nginx (pour reverse proxy si nécessaire)
echo "🌐 Configuration de Nginx..."
systemctl enable nginx
systemctl stop nginx  # On l'arrête car Docker va utiliser le port 80

# Optimisation système
echo "⚙️ Optimisations système..."

# Augmenter les limites de fichiers ouverts
cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
EOF

# Optimisations réseau
cat >> /etc/sysctl.conf << EOF
# Optimisations réseau pour applications web
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 65536 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq
EOF

sysctl -p

# Création d'un utilisateur pour l'application (optionnel)
echo "👤 Création de l'utilisateur artbeau..."
if ! id "artbeau" &>/dev/null; then
    useradd -m -s /bin/bash artbeau
    usermod -aG docker artbeau
    mkdir -p /home/artbeau/.ssh
    # Copier les clés SSH du root si elles existent
    if [ -f /root/.ssh/authorized_keys ]; then
        cp /root/.ssh/authorized_keys /home/artbeau/.ssh/
        chown -R artbeau:artbeau /home/artbeau/.ssh
        chmod 700 /home/artbeau/.ssh
        chmod 600 /home/artbeau/.ssh/authorized_keys
    fi
fi

# Configuration de la swap (utile pour les petits serveurs)
echo "💾 Configuration de la swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Installation d'outils de monitoring simples
echo "📊 Installation d'outils de monitoring..."
cat > /usr/local/bin/server-status << 'EOF'
#!/bin/bash
echo "=== Statut du serveur Art'Beau ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Mémoire:"
free -h
echo "Espace disque:"
df -h /
echo "Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "Logs récents de l'application:"
if [ -d "/opt/artbeau-pointage/current" ]; then
    cd /opt/artbeau-pointage/current
    docker-compose -f docker-compose.prod.yml logs --tail=5 2>/dev/null || echo "Aucun log disponible"
fi
EOF
chmod +x /usr/local/bin/server-status

# Créer un script de sauvegarde simple
cat > /usr/local/bin/backup-artbeau << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
APP_DIR="/opt/artbeau-pointage/current"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

if [ -d "$APP_DIR" ]; then
    echo "Sauvegarde des données Art'Beau..."
    tar -czf "$BACKUP_DIR/artbeau_backup_$DATE.tar.gz" \
        -C "$APP_DIR" \
        backend/data \
        backend/logs \
        .env 2>/dev/null || true
    
    # Garder seulement les 7 dernières sauvegardes
    find $BACKUP_DIR -name "artbeau_backup_*.tar.gz" -type f -mtime +7 -delete
    
    echo "Sauvegarde terminée: $BACKUP_DIR/artbeau_backup_$DATE.tar.gz"
else
    echo "Application non trouvée dans $APP_DIR"
fi
EOF
chmod +x /usr/local/bin/backup-artbeau

# Ajouter une tâche cron pour la sauvegarde automatique
echo "0 2 * * * root /usr/local/bin/backup-artbeau >> /var/log/artbeau-backup.log 2>&1" >> /etc/crontab

# Redémarrer les services
systemctl restart cron

echo ""
echo "✅ Configuration du serveur terminée!"
echo ""
echo "📋 Récapitulatif:"
echo "  • Docker et Docker Compose installés"
echo "  • Firewall configuré (ports 22, 80, 443 ouverts)"
echo "  • Utilisateur 'artbeau' créé et ajouté au groupe docker"
echo "  • Swap de 2GB configurée"
echo "  • Scripts de monitoring et sauvegarde installés"
echo ""
echo "🔧 Commands utiles:"
echo "  • Statut du serveur: server-status"
echo "  • Sauvegarde manuelle: backup-artbeau"
echo "  • Voir les containers: docker ps"
echo ""
echo "🚀 Votre serveur est prêt pour le déploiement!"
echo "   Utilisez maintenant le script deploy.sh depuis votre machine locale"
