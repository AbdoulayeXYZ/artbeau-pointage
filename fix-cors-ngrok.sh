#!/bin/bash

# Script pour corriger automatiquement les problèmes CORS avec ngrok

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Correction automatique des URLs ngrok et CORS...${NC}"

# Fonction pour récupérer les URLs ngrok
get_ngrok_urls() {
    local dashboard_ports=("4040" "4042" "4045")
    
    for port in "${dashboard_ports[@]}"; do
        local result=$(curl -s http://localhost:$port/api/tunnels 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    backend_url = None
    frontend_url = None
    for tunnel in tunnels:
        if tunnel['config']['addr'] == 'http://localhost:3001':
            backend_url = tunnel['public_url']
        elif tunnel['config']['addr'] == 'http://localhost:8080':
            frontend_url = tunnel['public_url']
    if backend_url and frontend_url:
        print(f'{backend_url}|{frontend_url}')
    else:
        print('ERROR')
except:
    print('ERROR')
" 2>/dev/null)
        
        if [ "$result" != "ERROR" ] && [ ! -z "$result" ]; then
            echo "$result"
            return 0
        fi
    done
    
    return 1
}

# Récupérer les URLs ngrok
echo -e "${YELLOW}🔍 Recherche des URLs ngrok...${NC}"
urls=$(get_ngrok_urls)

if [ $? -eq 0 ] && [ ! -z "$urls" ]; then
    BACKEND_URL=$(echo "$urls" | cut -d'|' -f1)
    FRONTEND_URL=$(echo "$urls" | cut -d'|' -f2)
    
    echo -e "${GREEN}✅ URLs trouvées:${NC}"
    echo -e "   Backend:  $BACKEND_URL"
    echo -e "   Frontend: $FRONTEND_URL"
    
    # Mettre à jour la configuration frontend
    echo -e "${BLUE}📝 Mise à jour de la configuration frontend...${NC}"
    cd /Users/abdoulayexyz/Documents/PROJECTS/DEV/qr_timesheet_pro/frontend
    
    cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL
VITE_SOCKET_URL=$BACKEND_URL
EOF
    
    echo -e "${GREEN}✅ Configuration frontend mise à jour${NC}"
    
    # Rebuilder le frontend
    echo -e "${BLUE}🔨 Reconstruction du frontend...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend reconstruit avec succès${NC}"
        
        # Redémarrer le serveur frontend
        echo -e "${BLUE}🔄 Redémarrage du serveur frontend...${NC}"
        pkill -f "http-server" 2>/dev/null || true
        sleep 1
        http-server build -p 8080 -c-1 --proxy 'http://localhost:8080?' &
        
        echo -e "${GREEN}✅ Serveur frontend redémarré${NC}"
        
        # Redémarrer le backend avec le bon CORS
        echo -e "${BLUE}🔄 Redémarrage du backend avec CORS corrigé...${NC}"
        cd ../backend
        pkill -f "node.*server.js" 2>/dev/null || true
        sleep 1
        CORS_ORIGIN="$FRONTEND_URL,http://localhost:8080" node server.js &
        
        sleep 2
        
        if curl -s http://localhost:3001/api/health > /dev/null; then
            echo -e "${GREEN}✅ Backend redémarré avec CORS corrigé${NC}"
            echo -e "\n${GREEN}🎉 Correction terminée avec succès !${NC}"
            echo -e "${BLUE}📱 Testez maintenant: $FRONTEND_URL${NC}"
        else
            echo -e "${RED}❌ Problème avec le redémarrage du backend${NC}"
        fi
    else
        echo -e "${RED}❌ Erreur lors de la reconstruction du frontend${NC}"
    fi
    
else
    echo -e "${RED}❌ Impossible de récupérer les URLs ngrok${NC}"
    echo -e "${YELLOW}💡 Assurez-vous que ngrok est actif et que les tunnels fonctionnent${NC}"
fi
