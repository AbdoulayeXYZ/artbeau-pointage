#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Test direct ngrok${NC}"
echo "===================="

# Vérifier que le backend tourne
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Le backend n'est pas démarré sur le port 3001${NC}"
    echo -e "${YELLOW}💡 Démarrez d'abord le backend avec: cd backend && npm start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend détecté sur port 3001${NC}"

# Démarrer ngrok
echo -e "${BLUE}🌐 Démarrage de ngrok...${NC}"
ngrok http 3001 &
NGROK_PID=$!

# Attendre
echo -e "${YELLOW}⏳ Attente de ngrok (10 secondes)...${NC}"
sleep 10

# Récupérer l'URL
if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)
    
    if [ ! -z "$BACKEND_URL" ] && [ "$BACKEND_URL" != "null" ]; then
        echo -e "${GREEN}🎉 Ngrok configuré avec succès !${NC}"
        echo ""
        echo -e "${BLUE}URL publique : ${GREEN}$BACKEND_URL${NC}"
        echo ""
        echo -e "${BLUE}🧪 Test de l'API :${NC}"
        
        # Test de l'API publique
        if curl -s "$BACKEND_URL/health" | grep -q "healthy"; then
            echo -e "${GREEN}✅ API accessible depuis internet !${NC}"
            echo ""
            echo -e "${YELLOW}📱 Partagez cette URL avec vos employés :${NC}"
            echo -e "${GREEN}$BACKEND_URL${NC}"
        else
            echo -e "${RED}❌ Problème d'accès à l'API${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}🔗 Dashboard ngrok : ${YELLOW}http://localhost:4040${NC}"
        echo -e "${RED}🛑 Appuyez sur Ctrl+C pour arrêter${NC}"
        
        # Attendre l'arrêt
        trap 'echo -e "\n${YELLOW}🛑 Arrêt de ngrok...${NC}"; kill $NGROK_PID 2>/dev/null; exit' INT
        wait $NGROK_PID
    else
        echo -e "${RED}❌ Impossible de récupérer l'URL ngrok${NC}"
        kill $NGROK_PID 2>/dev/null
    fi
else
    echo -e "${RED}❌ Ngrok non accessible${NC}"
    kill $NGROK_PID 2>/dev/null
fi
