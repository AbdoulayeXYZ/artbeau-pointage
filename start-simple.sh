#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Art'Beau-Pointage - Démarrage simple${NC}"
echo "=========================================="

# Nettoyer les processus existants
echo -e "${YELLOW}🧹 Nettoyage des processus existants...${NC}"
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill ngrok 2>/dev/null || true
sleep 2

cd "$(dirname "$0")"

# Étape 1: Démarrer le backend
echo -e "${BLUE}🔧 Démarrage du backend...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
echo -e "${YELLOW}⏳ Attente du backend...${NC}"
for i in {1..15}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend prêt !${NC}"
        break
    fi
    echo -e "${YELLOW}   Tentative $i/15...${NC}"
    sleep 2
done

# Vérifier que le backend fonctionne
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Impossible de démarrer le backend${NC}"
    exit 1
fi

# Étape 2: Démarrer ngrok pour le backend
echo -e "${BLUE}🌐 Démarrage de ngrok pour le backend...${NC}"
ngrok http 3001 --log=stdout > /tmp/ngrok-backend.log 2>&1 &
NGROK_PID=$!

# Attendre que ngrok soit prêt
echo -e "${YELLOW}⏳ Attente de ngrok...${NC}"
for i in {1..15}; do
    if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ngrok prêt !${NC}"
        break
    fi
    echo -e "${YELLOW}   Tentative $i/15...${NC}"
    sleep 2
done

# Récupérer l'URL ngrok
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null)

if [ -z "$BACKEND_URL" ] || [ "$BACKEND_URL" = "null" ]; then
    echo -e "${RED}❌ Impossible de récupérer l'URL ngrok${NC}"
    echo -e "${YELLOW}Vérifiez http://localhost:4040${NC}"
    kill $BACKEND_PID $NGROK_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}🎉 Système prêt !${NC}"
echo ""
echo "=================================================="
echo -e "${BLUE}🔗 URLs accessibles :${NC}"
echo -e "   Backend local:  ${YELLOW}http://localhost:3001${NC}"
echo -e "   Backend public: ${GREEN}$BACKEND_URL${NC}"
echo -e "   Ngrok dashboard: ${YELLOW}http://localhost:4040${NC}"
echo ""
echo -e "${BLUE}🧪 Tests rapides :${NC}"
echo -e "   Health check:    ${GREEN}$BACKEND_URL/health${NC}"
echo -e "   API Info:        ${GREEN}$BACKEND_URL/${NC}"
echo ""
echo -e "${YELLOW}📱 Partage avec vos employés :${NC}"
echo -e "   URL: ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${RED}🛑 Appuyez sur Ctrl+C pour arrêter${NC}"

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}🧹 Arrêt des services...${NC}"
    kill $BACKEND_PID $NGROK_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Test automatique
echo -e "${BLUE}🧪 Test de l'API publique...${NC}"
if curl -s "$BACKEND_URL/health" | grep -q "healthy"; then
    echo -e "${GREEN}✅ API accessible depuis internet !${NC}"
else
    echo -e "${YELLOW}⚠️  API peut-être en cours de démarrage...${NC}"
fi

# Attendre indéfiniment
wait
