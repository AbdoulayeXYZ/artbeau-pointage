#!/bin/bash

# Script intelligent pour démarrer le système avec auto-configuration ngrok

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Démarrage intelligent Art'Beau-Pointage avec ngrok...${NC}"

# Nettoyer d'abord
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "http-server" 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true
sleep 2

# Étape 1: Démarrer le backend
echo -e "${BLUE}🔧 Démarrage du backend...${NC}"
cd /Users/abdoulayexyz/Documents/PROJECTS/DEV/qr_timesheet_pro/backend
CORS_ORIGIN="*" node server.js &
BACKEND_PID=$!

sleep 3
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${RED}❌ Backend non accessible${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend démarré${NC}"

# Étape 2: Démarrer le frontend
echo -e "${BLUE}🌐 Démarrage du frontend...${NC}"
cd ../frontend
npm run build > /dev/null 2>&1
http-server build -p 8080 -c-1 --proxy 'http://localhost:8080?' > /dev/null 2>&1 &
FRONTEND_PID=$!
sleep 2
echo -e "${GREEN}✅ Frontend démarré${NC}"

# Étape 3: Créer les tunnels ngrok
echo -e "${BLUE}🌍 Création des tunnels ngrok...${NC}"
cd ..
ngrok http 3001 > /dev/null 2>&1 &
NGROK_BACKEND_PID=$!
sleep 1
ngrok http 8080 > /dev/null 2>&1 &
NGROK_FRONTEND_PID=$!

echo -e "${YELLOW}⏳ Attente de l'initialisation ngrok...${NC}"
sleep 8

# Étape 4: Récupérer et configurer automatiquement les URLs
echo -e "${BLUE}🔍 Configuration automatique des URLs...${NC}"

# Fonction pour récupérer les URLs ngrok
get_ngrok_urls() {
    for port in 4040 4042 4045; do
        result=$(curl -s http://localhost:$port/api/tunnels 2>/dev/null | python3 -c "
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
        sys.exit(0)
except:
    pass
print('ERROR')
" 2>/dev/null)
        
        if [ "$result" != "ERROR" ] && [ ! -z "$result" ]; then
            echo "$result"
            return 0
        fi
    done
    return 1
}

# Récupérer les URLs
urls=$(get_ngrok_urls)
if [ $? -eq 0 ] && [ ! -z "$urls" ]; then
    BACKEND_URL=$(echo "$urls" | cut -d'|' -f1)
    FRONTEND_URL=$(echo "$urls" | cut -d'|' -f2)
    
    echo -e "${GREEN}✅ URLs ngrok détectées:${NC}"
    echo -e "   🔧 Backend:  $BACKEND_URL"
    echo -e "   🌐 Frontend: $FRONTEND_URL"
    
    # Reconfigurer le frontend
    echo -e "${BLUE}🔄 Configuration automatique...${NC}"
    cd frontend
    cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL
VITE_SOCKET_URL=$BACKEND_URL
EOF
    
    # Rebuild frontend avec nouvelle config
    npm run build > /dev/null 2>&1
    
    # Redémarrer le frontend
    kill $FRONTEND_PID 2>/dev/null || true
    sleep 1
    http-server build -p 8080 -c-1 --proxy 'http://localhost:8080?' > /dev/null 2>&1 &
    FRONTEND_PID=$!
    
    # Redémarrer le backend avec CORS correct
    cd ../backend
    kill $BACKEND_PID 2>/dev/null || true
    sleep 1
    CORS_ORIGIN="$FRONTEND_URL,http://localhost:8080" node server.js &
    BACKEND_PID=$!
    
    sleep 3
    
    # Vérification finale
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo -e "${GREEN}🎉 Système configuré automatiquement !${NC}"
        echo -e "\n${BLUE}📱 Accès public:${NC}"
        echo -e "   Frontend: $FRONTEND_URL"
        echo -e "   Backend:  $BACKEND_URL"
        echo -e "\n${BLUE}👥 Comptes de test:${NC}"
        echo -e "   Employé: Alice Martin / artbeaurescence"
        echo -e "   Admin: admin / artbeaurescence"
        echo -e "\n${YELLOW}💡 Le système est prêt à utiliser !${NC}"
    else
        echo -e "${RED}❌ Problème lors de la reconfiguration${NC}"
    fi
else
    echo -e "${RED}❌ Impossible de récupérer les URLs ngrok${NC}"
    echo -e "${YELLOW}💡 Système démarré en local seulement${NC}"
fi

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt en cours...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $NGROK_BACKEND_PID 2>/dev/null || true
    kill $NGROK_FRONTEND_PID 2>/dev/null || true
    pkill -f "ngrok" 2>/dev/null || true
    pkill -f "http-server" 2>/dev/null || true
    pkill -f "node.*server.js" 2>/dev/null || true
    echo -e "${GREEN}✅ Arrêté proprement${NC}"
    exit 0
}

trap cleanup INT TERM

echo -e "\n${RED}🛑 Appuyez sur Ctrl+C pour arrêter${NC}"
wait
