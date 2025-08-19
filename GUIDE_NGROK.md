# 🚀 Guide de test ngrok - Art'Beau-Pointage

## ✅ Oui, ngrok fonctionne !

Ngrok est installé et configuré correctement sur votre machine. L'erreur que vous avez vue dans le navigateur est normale - c'est parce que le service backend n'était pas en cours d'exécution sur le port 3001.

## 🎯 Test rapide (méthode simple)

### Étape 1 : Démarrer le backend
Dans un terminal :
```bash
cd backend
npm start
```

Vous devriez voir :
```
🎉 Art'Beau-Pointage Server Started!
🌐 Serveur: http://localhost:3001
```

### Étape 2 : Tester ngrok (dans un nouveau terminal)
```bash
ngrok http 3001
```

### Étape 3 : Récupérer l'URL
Ngrok va afficher quelque chose comme :
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3001
```

### Étape 4 : Tester l'accès
Ouvrez `https://abc123.ngrok-free.app/health` dans votre navigateur.

## 🔄 Test complet avec script automatisé

### Option A : Démarrage manuel des services

1. **Terminal 1** - Backend :
```bash
cd backend
npm start
```

2. **Terminal 2** - Frontend :
```bash
npm run dev
```

3. **Terminal 3** - Test ngrok :
```bash
./test-ngrok.sh
```

### Option B : Script tout-en-un

```bash
./start-ngrok.sh
```

Ce script va :
- ✅ Installer les dépendances
- ✅ Démarrer le backend (port 3001)
- ✅ Démarrer le frontend (port 4028)  
- ✅ Configurer ngrok pour les deux services
- ✅ Afficher les URLs publiques

## 🌐 URLs attendues

Une fois lancé avec succès, vous obtiendrez :

### URLs publiques (accessibles depuis internet)
- **Application** : `https://xyz.ngrok-free.app` (frontend)
- **API** : `https://abc.ngrok-free.app` (backend)

### URLs locales (votre machine uniquement)
- **Application** : `http://localhost:4028`
- **API** : `http://localhost:3001`
- **Dashboard ngrok** : `http://localhost:4040`

## 🔧 Configuration automatique

Le script met automatiquement à jour :

1. **Backend CORS** (backend/.env) :
   ```
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:4028,https://xyz.ngrok-free.app
   ```

2. **Frontend API URL** (.env.local) :
   ```
   VITE_API_URL=https://abc.ngrok-free.app
   ```

## 📱 Partage avec les employés

Partagez simplement l'URL de l'application :
```
https://xyz.ngrok-free.app
```

Instructions pour les employés :
1. Ouvrir l'URL dans le navigateur (mobile ou desktop)
2. Se connecter avec :
   - **Nom d'utilisateur** : employé1, employé2, employé3, etc.
   - **Mot de passe** : artbeaurescence

## ⚠️ Points importants

### URLs temporaires (gratuit)
- Les URLs ngrok **changent à chaque redémarrage**
- Format : `https://random123.ngrok-free.app`

### URLs fixes (payant)
Pour des URLs permanentes, voir `DOMAIN_SETUP.md`

### Limitations version gratuite
- 20 connexions/minute max
- Tunnel inactif après 2h
- URLs aléatoires

## 🐛 Résolution de problèmes

### Erreur "connection refused"
```bash
# Vérifier que le backend tourne
curl http://localhost:3001/health

# Si non, le démarrer
cd backend && npm start
```

### Erreur "tunnel not found"
```bash
# Redémarrer ngrok
pkill ngrok
./start-ngrok.sh
```

### Frontend ne charge pas
```bash
# Vérifier le port 4028
curl http://localhost:4028

# Si non, démarrer le frontend
npm run dev
```

## ✨ Test de validation

Pour valider que tout fonctionne :

1. ✅ Backend health check : `curl http://localhost:3001/health`
2. ✅ Frontend accessible : `curl http://localhost:4028`
3. ✅ Ngrok dashboard : `curl http://localhost:4040/api/tunnels`
4. ✅ API publique : `curl https://your-ngrok-url.ngrok-free.app/health`

## 🎉 Prochaines étapes

Une fois que ngrok fonctionne :

1. **Tester l'application** avec les employés
2. **Configurer un domaine personnalisé** (voir DOMAIN_SETUP.md)
3. **Déployer en production** si nécessaire

---

**Statut** : ✅ Ngrok est installé et fonctionnel
**Prochaine étape** : Démarrer les services et tester l'accès public
