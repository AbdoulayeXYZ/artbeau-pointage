# Guide Complet - Art'Beau-Pointage avec ngrok

Ce guide explique comment exposer votre système de pointage Art'Beau sur Internet grâce à ngrok, permettant un accès externe depuis n'importe où.

## 📋 Options Disponibles

Vous avez maintenant **3 méthodes** pour démarrer le système avec ngrok :

### Option 1: Script Complet (Recommandé)
```bash
./start-full-ngrok.sh
```
- ✅ Démarre backend + frontend automatiquement
- ✅ Crée 2 tunnels ngrok (backend et frontend)
- ✅ Interface complète accessible publiquement
- ❌ Plus complexe à gérer

### Option 2: Script Simplifié 
```bash
./start-simple-ngrok.sh
```
- ✅ Démarre seulement le backend avec ngrok
- ✅ Plus simple et stable
- ✅ Moins de ressources utilisées
- ❌ Nécessite configuration manuelle du frontend

### Option 3: Configuration Manuelle (Flexible)
```bash
# Démarrer le backend avec ngrok
./start-simple-ngrok.sh

# Dans un autre terminal, configurer le frontend
./configure-frontend-ngrok.sh
```

## 🚀 Démarrage Rapide (Option 1 - Recommandée)

1. **Lancer le système complet :**
   ```bash
   ./start-full-ngrok.sh
   ```

2. **Récupérer les URLs publiques :**
   - Ouvrir http://localhost:4040 dans votre navigateur
   - Noter les URLs publiques ngrok affichées

3. **Accéder au système :**
   - **Frontend public :** URL ngrok du port 8080
   - **Backend public :** URL ngrok du port 3001

4. **Se connecter :**
   - **Employés :** Utiliser leur nom complet (ex: "Alice Martin")
   - **Superviseur :** admin / artbeaurescence

## 🛠️ Démarrage Avancé (Option 2 + 3)

Si vous préférez plus de contrôle ou si l'option 1 ne fonctionne pas :

### Étape 1: Démarrer le Backend
```bash
./start-simple-ngrok.sh
```

### Étape 2: Noter l'URL Backend
- Aller sur http://localhost:4040
- Noter l'URL ngrok du backend (ex: https://abc123.ngrok-free.app)

### Étape 3: Configurer le Frontend
Dans un **nouveau terminal** :
```bash
./configure-frontend-ngrok.sh
```

Ce script va :
- Récupérer automatiquement l'URL ngrok
- Reconfigurer le frontend pour utiliser cette URL
- Construire le frontend optimisé
- Démarrer le serveur frontend sur le port 8080

### Étape 4: Accès Final
- **Frontend :** http://localhost:8080 (accès local)
- **Backend :** URL ngrok de l'étape 2 (accès public)
- **Interface web complète :** Utiliser le frontend local qui se connecte au backend public

## 📱 Utilisation Mobile

Une fois le système démarré avec ngrok, vous pouvez :

1. **Scanner les QR codes des postes de travail** depuis n'importe quel appareil mobile
2. **Accéder à l'interface de pointage** via l'URL ngrok
3. **Utiliser le dashboard superviseur** pour monitoring en temps réel

## 🔧 Dépannage

### Problème : "ngrok n'est pas installé"
```bash
brew install ngrok
```

### Problème : "Backend ne répond pas"
```bash
# Arrêter tous les processus
pkill -f "node.*server.js"
pkill -f "ngrok"

# Redémarrer
./start-simple-ngrok.sh
```

### Problème : "Frontend ne se connecte pas au backend"
```bash
# Vérifier l'URL dans .env.production
cat frontend/.env.production

# Reconfigurer si nécessaire
./configure-frontend-ngrok.sh
```

### Problème : "Port déjà utilisé"
```bash
# Trouver et tuer le processus
lsof -ti :3001 | xargs kill -9  # Pour le backend
lsof -ti :8080 | xargs kill -9  # Pour le frontend
```

## 🌍 URLs Importantes

Pendant le fonctionnement, vous aurez accès à :

- **Dashboard ngrok :** http://localhost:4040
- **Backend local :** http://localhost:3001
- **Frontend local :** http://localhost:8080 (si configuré)
- **URLs publiques :** Visibles sur le dashboard ngrok

## 🔒 Sécurité et Bonnes Pratiques

1. **Ne partagez pas vos URLs ngrok** avec des personnes non autorisées
2. **Les tunnels ngrok changent** à chaque redémarrage (sauf avec compte payant)
3. **Surveillez le dashboard ngrok** pour voir qui accède au système
4. **Utilisez des mots de passe forts** pour les comptes superviseur

## 📊 Fonctionnalités Disponibles en Public

Avec ngrok, toutes les fonctionnalités du système sont accessibles :

- ✅ **Connexion employés/superviseurs**
- ✅ **Scan de QR codes de postes**
- ✅ **Pointage entrée/sortie/pause**
- ✅ **Dashboard superviseur en temps réel**
- ✅ **Historique et rapports**
- ✅ **Export CSV/PDF/Excel**
- ✅ **Génération de QR codes de postes**

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que ngrok est bien installé et configuré
2. Consultez les logs dans le terminal de démarrage
3. Visitez http://localhost:4040 pour diagnostiquer ngrok
4. Redémarrez le système avec les scripts fournis

---

## 🎯 Résumé des Commandes

```bash
# Démarrage complet (recommandé)
./start-full-ngrok.sh

# Démarrage simple (backend seulement)
./start-simple-ngrok.sh

# Configuration automatique du frontend
./configure-frontend-ngrok.sh

# Voir les URLs publiques
# Navigateur: http://localhost:4040
```

Le système est maintenant prêt pour un accès Internet complet ! 🚀
