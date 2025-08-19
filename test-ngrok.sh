#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Test ngrok - Art'Beau-Pointage${NC}"
echo "===================================="

# Aller dans le répertoire du projet
cd "$(dirname "$0")"

echo -e "${YELLOW}📋 Instructions:${NC}"
echo "1. Dans un premier terminal, lancez: cd backend && npm start"
echo "2. Dans un second terminal, lancez: npm run dev"
echo "3. Une fois les deux services démarrés, lancez ce script"
echo ""

read -p "Les services backend (3001) et frontend (4028) sont-ils démarrés ? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Veuillez d'abord démarrer les services${NC}"
    exit 1
fi

# Vérifier les ports
echo -e "${BLUE}🔍 Vérification des services...${NC}"

if ! curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${RED}❌ Backend non accessible sur port 3001${NC}"
    exit 1
fi

if ! curl -s http://localhost:4028 > /dev/null; then
    echo -e "${RED}❌ Frontend non accessible sur port 4028${NC}"
    echo -e "${YELLOW}💡 Le frontend peut prendre du temps à démarrer${NC}"
fi

echo -e "${GREEN}✅ Services vérifiés${NC}"

# Lancer ngrok pour le backend uniquement en premier
echo -e "${BLUE}🌐 Test ngrok pour le backend (port 3001)...${NC}"
echo -e "${YELLOW}⏳ Démarrage de ngrok...${NC}"

# Démarrer ngrok en arrière-plan
ngrok http 3001 --log=stdout > /tmp/ngrok-backend.log 2>&1 &
NGROK_PID=$!

# Attendre que ngrok soit prêt
sleep 8

# Vérifier si ngrok fonctionne
if ! curl -s http://localhost:4040/api/tunnels > /dev/null; then
    echo -e "${RED}❌ Ngrok non accessible${NC}"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

# Récupérer l'URL
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)

if [ -z "$BACKEND_URL" ] || [ "$BACKEND_URL" = "null" ]; then
    echo -e "${RED}❌ Impossible de récupérer l'URL ngrok${NC}"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Ngrok configuré !${NC}"
echo ""
echo -e "${BLUE}🔗 URL publique du backend:${NC}"
echo -e "   ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${BLUE}🧪 Test de l'API publique:${NC}"

# Tester l'API via ngrok
if curl -s "$BACKEND_URL/health" | grep -q "OK"; then
    echo -e "${GREEN}✅ API accessible via ngrok !${NC}"
else
    echo -e "${RED}❌ Problème d'accès à l'API via ngrok${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Dashboard ngrok: ${BLUE}http://localhost:4040${NC}"
echo -e "${YELLOW}📱 Testez votre API: ${BLUE}$BACKEND_URL/health${NC}"
echo ""
echo -e "${RED}🛑 Appuyez sur Ctrl+C pour arrêter ngrok${NC}"

# Attendre l'interruption
trap 'echo -e "\n${YELLOW}🛑 Arrêt de ngrok...${NC}"; kill $NGROK_PID 2>/dev/null; exit' INT

wait $NGROK_PID
