# Configuration du nom de domaine avec ngrok

Ce guide explique comment configurer votre propre nom de domaine pour le système Art'Beau-Pointage en utilisant ngrok.

## 🌐 Étape 1 : Compte ngrok payant

Pour utiliser un domaine personnalisé, vous avez besoin d'un compte ngrok payant :

1. **Créer un compte** : [https://ngrok.com/pricing](https://ngrok.com/pricing)
2. **Choisir un plan** : 
   - Personal ($8/mois) : Permet 3 domaines personnalisés
   - Pro ($20/mois) : Permet 10 domaines personnalisés

## 🔧 Étape 2 : Configuration du token d'authentification

1. Obtenez votre authtoken depuis le dashboard ngrok
2. Configurez-le :
```bash
ngrok config add-authtoken VOTRE_TOKEN_ICI
```

## 🏷️ Étape 3 : Réserver un domaine

1. Dans le dashboard ngrok, allez dans "Cloud Edge" > "Domains"
2. Cliquez "Create Domain" ou "New Domain"
3. Choisissez un sous-domaine (ex: `artbeau-pointage.ngrok-free.app`)
4. Ou configurez votre propre domaine (voir étape 4)

## 🌍 Étape 4 : Utiliser votre propre domaine (optionnel)

Si vous avez un domaine existant (ex: `votre-domaine.com`) :

### A. Ajouter le domaine dans ngrok
1. Dashboard ngrok > "Cloud Edge" > "Domains"
2. Cliquer "Bring your own domain"
3. Entrer votre domaine : `pointage.votre-domaine.com`

### B. Configuration DNS
Ajoutez un enregistrement CNAME dans votre DNS :
```
Type: CNAME
Nom: pointage (ou api, app, etc.)
Valeur: 1.tcp.ngrok.io (ou la valeur fournie par ngrok)
```

## ⚙️ Étape 5 : Mettre à jour la configuration ngrok

Modifiez le fichier `ngrok.yml` :

```yaml
version: "2"
authtoken: VOTRE_TOKEN_ICI
tunnels:
  backend:
    addr: 3001
    proto: http
    hostname: api.votre-domaine.com  # Votre domaine API
    inspect: false
    bind_tls: true
  
  frontend:
    addr: 4028
    proto: http  
    hostname: pointage.votre-domaine.com  # Votre domaine App
    inspect: false
    bind_tls: true

log_level: info
web_addr: localhost:4040
```

## 🚀 Étape 6 : Démarrage avec domaines fixes

Une fois configuré, utilisez le script de démarrage :

```bash
./start-ngrok.sh
```

Vos URLs seront maintenant fixes :
- **Application** : `https://pointage.votre-domaine.com`
- **API** : `https://api.votre-domaine.com`

## 📱 Étape 7 : Partage avec les employés

Partagez simplement l'URL de l'application :
```
https://pointage.votre-domaine.com
```

Cette URL ne changera plus, même après redémarrage !

## 🔒 Étape 8 : Sécurisation (recommandé)

### A. HTTPS automatique
Ngrok active automatiquement HTTPS avec des certificats valides.

### B. Authentification ngrok (optionnel)
Ajoutez une authentification ngrok :

```yaml
tunnels:
  frontend:
    addr: 4028
    proto: http
    hostname: pointage.votre-domaine.com
    auth: "utilisateur:motdepasse"
    bind_tls: true
```

### C. IP whitelisting (optionnel)
Limitez l'accès à certaines IP :

```yaml
tunnels:
  frontend:
    addr: 4028
    proto: http
    hostname: pointage.votre-domaine.com
    ip_restriction:
      allow_cidrs:
        - "192.168.1.0/24"  # Réseau local
        - "203.0.113.0/24"  # IP bureau
    bind_tls: true
```

## 📊 Étape 9 : Monitoring

### Dashboard ngrok
- Accès : [https://dashboard.ngrok.com](https://dashboard.ngrok.com)
- Statistiques de trafic, logs, métriques

### Dashboard local
- Accès : `http://localhost:4040`
- Trafic en temps réel, requêtes, réponses

## 🔄 Scripts de démarrage automatisés

### Service systemd (Linux/macOS)
Créez un service pour démarrer automatiquement :

```bash
# Créer le fichier service
sudo nano /etc/systemd/system/artbeau-pointage.service
```

```ini
[Unit]
Description=Art'Beau-Pointage avec ngrok
After=network.target

[Service]
Type=simple
User=abdoulayexyz
WorkingDirectory=/Users/abdoulayexyz/Documents/PROJECTS/DEV/qr_timesheet_pro
ExecStart=/Users/abdoulayexyz/Documents/PROJECTS/DEV/qr_timesheet_pro/start-ngrok.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activer le service :
```bash
sudo systemctl enable artbeau-pointage
sudo systemctl start artbeau-pointage
```

## 💰 Coûts estimés

| Plan | Prix/mois | Domaines | Tunnels simultanés | Bandwidth |
|------|-----------|----------|-------------------|-----------|
| Personal | $8 | 3 | 10 | 1GB |
| Pro | $20 | 10 | 50 | 10GB |
| Business | $39 | 25 | 100 | 50GB |

## 🆘 Résolution de problèmes

### Problème : Domain not found
- Vérifiez que le domaine est correctement configuré dans le dashboard
- Vérifiez la propagation DNS (peut prendre 24-48h)

### Problème : Certificate error
- Les certificats HTTPS sont automatiques avec ngrok
- Redémarrez ngrok si nécessaire

### Problème : Connection refused
- Vérifiez que les services backend/frontend tournent
- Vérifiez les ports dans la configuration

### Outils de debug
```bash
# Vérifier la configuration DNS
nslookup pointage.votre-domaine.com

# Tester la connectivité
curl -I https://pointage.votre-domaine.com

# Logs ngrok
tail -f /tmp/ngrok.log
```

## 📞 Support

- **Documentation ngrok** : [https://ngrok.com/docs](https://ngrok.com/docs)
- **Support ngrok** : [https://ngrok.com/support](https://ngrok.com/support)
- **Community** : [https://stackoverflow.com/questions/tagged/ngrok](https://stackoverflow.com/questions/tagged/ngrok)
