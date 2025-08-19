#!/bin/bash

# Script pour configurer automatiquement le frontend avec l'URL ngrok courante

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configuration automatique du frontend avec ngrok...${NC}"

# Fonction pour récupérer l'URL ngrok
get_ngrok_url() {
    local max_retries=5
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        # Essayer de récupérer l'URL via l'API ngrok
        local url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | \
                   python3 -c "import json,sys; data=json.load(sys.stdin); print([t['public_url'] for t in data.get('tunnels', []) if t['proto'] == 'https'][0] if data.get('tunnels') else '')" 2>/dev/null)
        
        if [ ! -z "$url" ] && [ "$url" != "" ]; then
            echo "$url"
            return 0
        fi
        
        retry=$((retry + 1))
        echo -e "${YELLOW}⏳ Tentative $retry/$max_retries - En attente de ngrok...${NC}"
        sleep 2
    done
    
    return 1
}

# Vérifier si ngrok est actif
if ! curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo -e "${RED}❌ ngrok ne semble pas être actif. Démarrez-le d'abord.${NC}"
    exit 1
fi

# Récupérer l'URL ngrok
echo -e "${BLUE}🌍 Récupération de l'URL ngrok...${NC}"
NGROK_URL=$(get_ngrok_url)

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ Impossible de récupérer l'URL ngrok${NC}"
    exit 1
fi

echo -e "${GREEN}✅ URL ngrok trouvée: $NGROK_URL${NC}"

# Aller dans le répertoire frontend
cd /Users/abdoulayexyz/Documents/PROJECTS/DEV/qr_timesheet_pro/frontend

# Mettre à jour le fichier .env.production
echo -e "${BLUE}📝 Mise à jour de .env.production...${NC}"
cat > .env.production << EOF
VITE_API_URL=$NGROK_URL
VITE_SOCKET_URL=$NGROK_URL
EOF

echo -e "${GREEN}✅ Configuration mise à jour${NC}"

# Rebuilder le frontend
echo -e "${BLUE}🔨 Rebuild du frontend...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend construit avec succès${NC}"
    
    # Vérifier si http-server est installé
    if ! command -v http-server &> /dev/null; then
        echo -e "${YELLOW}📦 Installation de http-server...${NC}"
        npm install -g http-server
    fi
    
    echo -e "${BLUE}🌐 Démarrage du serveur frontend...${NC}"
    echo -e "${YELLOW}💡 Le frontend sera accessible à: http://localhost:8080${NC}"
    echo -e "${YELLOW}💡 API backend via ngrok: $NGROK_URL${NC}"
    echo -e "\n${GREEN}🚀 Démarrage du serveur frontend...${NC}"
    
    # Démarrer le serveur frontend
    http-server build -p 8080 -c-1
    
else
    echo -e "${RED}❌ Erreur lors du build du frontend${NC}"
    exit 1
fi
