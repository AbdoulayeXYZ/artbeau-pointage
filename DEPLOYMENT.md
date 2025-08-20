# Guide de Déploiement - Art'Beau Pointage

Ce document décrit tous les outils et processus de déploiement disponibles pour Art'Beau Pointage.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Configuration initiale](#configuration-initiale)
- [Déploiement local](#déploiement-local)
- [Déploiement serveur](#déploiement-serveur)
- [Commandes utiles](#commandes-utiles)
- [Monitoring et maintenance](#monitoring-et-maintenance)
- [CI/CD automatique](#cicd-automatique)
- [Dépannage](#dépannage)

## 🎯 Vue d'ensemble

Le projet dispose de plusieurs outils pour faciliter le déploiement :

- **Scripts Bash** : Déploiement automatisé local et distant
- **Makefile** : Commandes simplifiées pour le développement
- **Scripts NPM** : Intégration avec package.json
- **Docker Compose** : Orchestration des conteneurs
- **GitHub Actions** : CI/CD automatique
- **Monitoring** : Scripts de surveillance et d'alertes

## ⚙️ Configuration initiale

### 1. Variables d'environnement

Créez le fichier `.env.production` :

```bash
# Configuration serveur
JWT_SECRET=votre_jwt_secret_super_secret_ici
CORS_ORIGIN=https://pointage.artbeaurescence.sn

# Configuration base de données (optionnel)
POSTGRES_USER=artbeau_user
POSTGRES_PASSWORD=votre_mot_de_passe_postgres
```

### 2. Configuration SSH

Pour le déploiement distant, configurez l'accès SSH sans mot de passe :

```bash
# Générer une clé SSH si nécessaire
ssh-keygen -t ed25519 -C "votre@email.com"

# Copier la clé publique sur le serveur
ssh-copy-id ubuntu@votre_serveur
```

### 3. Configuration du serveur

Assurez-vous que le serveur dispose de :
- Docker et Docker Compose
- Node.js (pour les scripts de sauvegarde)
- Nginx (géré par Docker)
- Certbot (pour SSL)

## 🚀 Déploiement local

### Avec le Makefile (recommandé)

```bash
# Voir toutes les commandes disponibles
make help

# Déploiement local complet
make deploy

# Construction des images
make build

# Voir les logs
make logs

# Redémarrer l'application
make restart
```

### Avec les scripts NPM

```bash
# Déploiement local
npm run deploy

# Construction Docker
npm run docker:build

# Démarrage des conteneurs
npm run docker:up

# Voir les logs
npm run docker:logs
```

### Avec les scripts Bash

```bash
# Déploiement local
./deploy.sh
```

## 🌐 Déploiement serveur

### Déploiement complet

```bash
# Avec le Makefile
make deploy-server

# Avec NPM
npm run deploy:server

# Avec le script Bash
./deploy-to-server.sh
```

### Déploiement rapide (mise à jour code uniquement)

```bash
# Mise à jour rapide du code + redémarrage
make quick-deploy

# Ou manuellement
make update-server
make server-restart
```

## 📝 Commandes utiles

### Gestion locale

```bash
# Développement
make dev                    # Lance les serveurs de dev
make install               # Installe les dépendances
make test                  # Lance les tests
make backup               # Sauvegarde la base de données

# Docker
make build                # Construit les images
make status               # Statut des conteneurs
make stop                 # Arrête les conteneurs
make clean                # Nettoyage léger
make deep-clean           # Nettoyage complet (ATTENTION)
```

### Gestion serveur

```bash
# Monitoring
make server-status        # Statut sur le serveur
make server-logs          # Logs du serveur
make server-restart       # Redémarrage sur le serveur

# Maintenance
make ssl-renew           # Renouvelle le certificat SSL
make update-server       # Met à jour le code sur le serveur
```

## 📊 Monitoring et maintenance

### Script de monitoring

Le script `scripts/monitor.sh` effectue des vérifications automatiques :

```bash
# Vérification complète
./scripts/monitor.sh check

# Nettoyage automatique
./scripts/monitor.sh cleanup

# Redémarrage d'urgence
./scripts/monitor.sh restart

# Ou avec Make
make monitor
```

### Vérifications effectuées

- ✅ Statut des conteneurs Docker
- ✅ Santé de l'application (endpoint /health)
- ✅ Espace disque disponible
- ✅ Utilisation mémoire
- ✅ Validité du certificat SSL
- ✅ Redémarrage automatique en cas de problème

### Configuration des alertes

Editez `scripts/monitor.sh` et définissez `WEBHOOK_URL` pour recevoir des notifications :

```bash
# Exemple pour Slack
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Exemple pour Discord
WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK"
```

### Cron automatique

Pour un monitoring continu, ajoutez une tâche cron :

```bash
# Éditer le crontab
crontab -e

# Ajouter (vérification toutes les 5 minutes)
*/5 * * * * /path/to/your/project/scripts/monitor.sh check >> /var/log/artbeau-monitor.log 2>&1

# Nettoyage quotidien à 2h du matin
0 2 * * * /path/to/your/project/scripts/monitor.sh cleanup >> /var/log/artbeau-monitor.log 2>&1
```

### Sauvegardes automatiques

```bash
# Sauvegarde manuelle
npm run backup

# Avec le Makefile
make backup

# Restauration
node backend/scripts/backup.js restore ./backups/backup-20240101-120000.json
```

## 🔄 CI/CD automatique

### GitHub Actions

Le workflow `.github/workflows/deploy.yml` effectue automatiquement :

1. **Tests** : Vérification du code, construction, tests
2. **Déploiement** : Transfer et déploiement sur le serveur
3. **Vérification** : Test de santé post-déploiement
4. **Nettoyage** : Suppression des fichiers temporaires

### Configuration des secrets GitHub

Dans les paramètres de votre dépôt GitHub, ajoutez :

```
SERVER_HOST=votre_ip_serveur
SERVER_USER=ubuntu
SERVER_SSH_KEY=votre_clé_privée_ssh_complète
```

### Déclenchement

Le déploiement se lance automatiquement sur :
- Push sur la branche `main` ou `master`
- Déclenchement manuel depuis l'interface GitHub

## 🔧 Dépannage

### Problèmes courants

#### Application non accessible

```bash
# Vérifier les conteneurs
make status

# Voir les logs
make logs

# Redémarrer
make restart

# Vérification complète
make monitor
```

#### Problème SSL

```bash
# Renouveler le certificat
make ssl-renew

# Ou sur le serveur
ssh ubuntu@votre_serveur "cd /path/to/project && ./deploy-ssl-automatic.sh"
```

#### Espace disque insuffisant

```bash
# Nettoyage automatique
make clean

# Nettoyage complet (ATTENTION)
make deep-clean

# Sur le serveur
./scripts/monitor.sh cleanup
```

#### Base de données corrompue

```bash
# Restaurer depuis une sauvegarde
node backend/scripts/backup.js restore ./backups/backup-latest.json

# Ou réinitialiser (ATTENTION : perte de données)
rm backend/data/database.sqlite
make restart
```

### Logs utiles

```bash
# Logs application
make logs

# Logs système (sur le serveur)
sudo journalctl -u docker -f

# Logs monitoring
tail -f /var/log/artbeau-monitor.log

# Logs nginx (dans le conteneur)
docker exec artbeau_frontend tail -f /var/log/nginx/access.log
```

### Performance

```bash
# Vérifier l'utilisation des ressources
docker stats

# Analyser les performances
make check-health

# Monitoring complet
./scripts/monitor.sh check
```

## 📚 Ressources additionnelles

- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Guide Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

Pour toute question ou problème, consultez les logs ou créez une issue sur le dépôt GitHub.
