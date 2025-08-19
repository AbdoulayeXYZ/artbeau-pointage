# 🚀 Guide de Déploiement - Art'Beau Pointage

Ce guide vous accompagne pour déployer votre application Art'Beau Pointage sur un serveur avec une IP fixe.

## 📋 Prérequis

- Une machine locale avec SSH configuré
- Accès à un serveur Ubuntu 20.04+ (VPS/Cloud)
- Nom de domaine (optionnel mais recommandé)

## 🎯 Étape 1: Créer un serveur

### Option A: DigitalOcean (Recommandé pour débuter)

1. **Créer un compte sur DigitalOcean**
   - Aller sur [digitalocean.com](https://digitalocean.com)
   - Créer un compte et ajouter un moyen de paiement

2. **Créer un Droplet**
   - Cliquer sur "Create" → "Droplets"
   - **Image**: Ubuntu 22.04 (LTS) x64
   - **Plan**: Basic ($4-6/mois)
     - 1 GB RAM / 1 vCPU
     - 25 GB SSD Disk
     - 1000 GB Transfer
   - **Region**: Choisir le plus proche de vos utilisateurs
   - **Authentication**: 
     - SSH Keys (recommandé) ou Password
   - **Hostname**: `artbeau-pointage`
   - Cliquer sur "Create Droplet"

3. **Noter l'IP du serveur**
   ```
   IP fixe attribuée automatiquement: XXX.XXX.XXX.XXX
   ```

### Option B: Autres fournisseurs

| Fournisseur | Prix/mois | Avantages |
|-------------|-----------|-----------|
| **Vultr** | ~$3.50 | Moins cher, bonnes performances |
| **Hetzner** | ~$3.00 | Excellent rapport qualité/prix |
| **AWS EC2** | Gratuit 1 an | Plateforme complète (plus complexe) |
| **Google Cloud** | Crédit gratuit | Integration avec autres services Google |

## 🔧 Étape 2: Configuration du serveur

### 2.1 Connexion initiale au serveur

```bash
# Remplacez YOUR_SERVER_IP par votre vraie IP
ssh root@YOUR_SERVER_IP
```

### 2.2 Configuration automatique

Copiez le script `server-setup.sh` sur votre serveur et exécutez-le :

```bash
# Sur le serveur
curl -fsSL https://raw.githubusercontent.com/your-repo/server-setup.sh | bash
# OU
wget -O - server-setup.sh | bash
```

**Ou manuellement :**
```bash
scp server-setup.sh root@YOUR_SERVER_IP:/tmp/
ssh root@YOUR_SERVER_IP 'bash /tmp/server-setup.sh'
```

## 📝 Étape 3: Configuration de l'application

### 3.1 Configurer les variables d'environnement

1. **Éditer le fichier `.env.production` localement :**

```bash
# Générer une clé JWT sécurisée
openssl rand -base64 32

# Éditer le fichier
nano .env.production
```

2. **Remplacer les valeurs :**
```env
JWT_SECRET=VotreCléSécuriséeIci
CORS_ORIGIN=http://YOUR_SERVER_IP,https://YOUR_DOMAIN.com
```

### 3.2 Configuration pour domaine personnalisé (optionnel)

Si vous avez un nom de domaine :

1. **Configurer le DNS :**
   - Type A: `your-domain.com` → `YOUR_SERVER_IP`
   - Type A: `www.your-domain.com` → `YOUR_SERVER_IP`

2. **Attendre la propagation DNS (5-60 minutes)**

## 🚀 Étape 4: Déploiement

### 4.1 Déploiement automatique

```bash
# Depuis votre machine locale
./deploy.sh YOUR_SERVER_IP root

# Exemple:
./deploy.sh 167.71.45.123 root
```

### 4.2 Déploiement manuel

Si le script automatique ne fonctionne pas :

```bash
# 1. Créer l'archive
tar -czf artbeau-pointage.tar.gz \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude="backend/data/*.db" \
    .

# 2. Copier sur le serveur
scp artbeau-pointage.tar.gz root@YOUR_SERVER_IP:/tmp/

# 3. Se connecter et déployer
ssh root@YOUR_SERVER_IP

# Sur le serveur :
mkdir -p /opt/artbeau-pointage/current
cd /opt/artbeau-pointage/current
tar -xzf /tmp/artbeau-pointage.tar.gz
cp .env.production .env
mkdir -p backend/data backend/logs

# Construire et lancer
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## ✅ Étape 5: Vérification

### 5.1 Vérifier que l'application fonctionne

```bash
# Test de l'API
curl http://YOUR_SERVER_IP/health

# Réponse attendue :
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "uptime": XX,
  "database": "connected"
}
```

### 5.2 Accéder à l'application

- **Application**: `http://YOUR_SERVER_IP`
- **API Health**: `http://YOUR_SERVER_IP/health`
- **API Documentation**: `http://YOUR_SERVER_IP/api`

## 🔒 Étape 6: SSL/HTTPS (Optionnel mais recommandé)

Si vous avez un nom de domaine :

```bash
# Sur le serveur
# 1. Arrêter l'application temporairement
cd /opt/artbeau-pointage/current
docker-compose -f docker-compose.prod.yml down

# 2. Obtenir le certificat SSL
certbot --nginx -d your-domain.com -d www.your-domain.com

# 3. Configurer Nginx pour HTTPS
cp nginx-ssl.conf /etc/nginx/sites-available/artbeau-pointage
# Éditer et remplacer 'your-domain.com'
nano /etc/nginx/sites-available/artbeau-pointage

# 4. Activer le site
ln -sf /etc/nginx/sites-available/artbeau-pointage /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 5. Modifier docker-compose pour ne pas utiliser le port 80
# Éditer docker-compose.prod.yml et changer les ports à "127.0.0.1:3000:80"
nano docker-compose.prod.yml

# 6. Relancer l'application
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Étape 7: Monitoring et maintenance

### 7.1 Commands utiles

```bash
# Statut du serveur
server-status

# Voir les logs
cd /opt/artbeau-pointage/current
docker-compose -f docker-compose.prod.yml logs -f

# Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart

# Sauvegarder manuellement
backup-artbeau
```

### 7.2 Surveillance

- **Logs d'application**: `/opt/artbeau-pointage/current/backend/logs/`
- **Sauvegardes**: `/opt/backups/` (automatique tous les jours à 2h)
- **Monitoring**: Commande `server-status`

## 🔧 Dépannage

### Problèmes courants

1. **L'application ne démarre pas**
   ```bash
   docker-compose -f docker-compose.prod.yml logs backend
   ```

2. **Problème de permissions**
   ```bash
   chown -R artbeau:artbeau /opt/artbeau-pointage
   ```

3. **Port déjà utilisé**
   ```bash
   sudo lsof -i :80
   sudo lsof -i :3001
   ```

4. **Mémoire insuffisante**
   ```bash
   free -h
   # Ajouter plus de swap ou upgrade le serveur
   ```

### Logs importants

- **Application**: `docker-compose -f docker-compose.prod.yml logs`
- **Nginx**: `tail -f /var/log/nginx/error.log`
- **Système**: `journalctl -f`
- **Sauvegardes**: `tail -f /var/log/artbeau-backup.log`

## 🎉 Félicitations !

Votre application Art'Beau Pointage est maintenant déployée avec une IP fixe !

### Récapitulatif des URLs

- **Application**: `http://YOUR_SERVER_IP` (ou `https://your-domain.com`)
- **API Health**: `http://YOUR_SERVER_IP/health`
- **Admin SSH**: `ssh root@YOUR_SERVER_IP`

### Prochaines étapes recommandées

1. **Configurer un nom de domaine** et HTTPS
2. **Mettre en place une surveillance** (Uptime Robot, etc.)
3. **Configurer des alertes** par email
4. **Planifier des sauvegardes** régulières
5. **Documenter** les procédures pour votre équipe

---

**⚠️ Important**: 
- Changez tous les mots de passe par défaut
- Mettez à jour régulièrement le système
- Surveillez l'usage des ressources
- Testez vos sauvegardes régulièrement

**📞 Besoin d'aide ?** 
Consultez les logs avec les commandes ci-dessus ou contactez votre administrateur système.
