# 🚀 Guide de démarrage - Art'Beau-Pointage

## Méthodes de démarrage

### Méthode 1: Script automatique (Recommandé)

```bash
# Démarrer frontend + backend
./start-dev.sh

# Arrêter les serveurs
./stop-dev.sh
```

### Méthode 2: Démarrage manuel

#### Terminal 1 - Backend:
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend:
```bash
npm start
```

## 🌐 URLs d'accès

- **Application principale**: http://localhost:4028
- **Dashboard superviseur**: http://localhost:4028/dashboard  
- **API Backend**: http://localhost:3001
- **QR Codes à imprimer**: http://localhost:3001/workstations/qr-print

## 👥 Comptes de test

### Superviseur
- **Nom d'utilisateur**: `abdoulayeniasse`
- **Mot de passe**: `artbeaurescence`
- **Accès**: Dashboard + gestion

### Employé
- **Nom d'utilisateur**: `mariamafall`  
- **Mot de passe**: `artbeaurescence`
- **Accès**: Interface de pointage

## 📊 Fonctionnalités

### Pour les employés:
- ✅ Connexion sécurisée
- ✅ Commencer la journée de travail
- ✅ Prendre des pauses
- ✅ Reprendre le travail
- ✅ Terminer la journée
- ✅ Suivi du temps en temps réel

### Pour les superviseurs:
- ✅ Dashboard en temps réel
- ✅ Vue d'ensemble des employés actifs
- ✅ Statistiques des postes de travail
- ✅ Génération et impression des QR codes
- ✅ Monitoring des sessions de travail

## 🔧 Résolution des problèmes

### Port déjà utilisé
```bash
# Vérifier les ports
lsof -i :3001
lsof -i :4028

# Tuer un processus spécifique
kill [PID]

# Ou utiliser le script d'arrêt
./stop-dev.sh
```

### Erreurs CORS
- Vérifiez que le backend est démarré avant le frontend
- Assurez-vous que les ports correspondent dans la configuration

### Problème de base de données
```bash
# Réinitialiser la base de données
cd backend
npm run init-db
```

## 📝 Logs

```bash
# Logs du backend
tail -f logs/backend.log

# Logs du frontend  
tail -f logs/frontend.log
```

## 🚫 Arrêt des serveurs

```bash
# Méthode 1: Script
./stop-dev.sh

# Méthode 2: Ctrl+C dans chaque terminal

# Méthode 3: Forcer l'arrêt
pkill -f node
```

## 📱 Interface mobile

L'application est optimisée pour mobile et peut être utilisée sur smartphones et tablettes via le navigateur web.

## 🔄 Actualisation automatique

- Dashboard: Actualisation automatique toutes les 30 secondes
- Interface employé: Actualisation manuelle via boutons

## ⚙️ Configuration

Les fichiers de configuration se trouvent dans:
- `backend/.env` - Variables d'environnement
- `backend/config/` - Configuration serveur
- `src/services/` - Configuration API frontend
