#!/bin/bash

echo "🚀 Démarrage d'Art'Beau-Pointage..."
echo "=================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour nettoyer les processus en cas d'interruption
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt des serveurs...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C
trap cleanup INT

# Vérifier si les ports sont déjà utilisés
if lsof -ti:3001 > /dev/null; then
    echo -e "${RED}❌ Port 3001 déjà utilisé. Arrêt du processus existant...${NC}"
    kill $(lsof -ti:3001) 2>/dev/null
    sleep 2
fi

if lsof -ti:4028 > /dev/null; then
    echo -e "${RED}❌ Port 4028 déjà utilisé. Arrêt du processus existant...${NC}"
    kill $(lsof -ti:4028) 2>/dev/null
    sleep 2
fi

echo -e "${BLUE}🔧 Démarrage du backend sur le port 3001...${NC}"
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"

# Attendre que le backend soit prêt
echo -e "${YELLOW}⏳ Attente du démarrage du backend...${NC}"
sleep 3

# Vérifier si le backend fonctionne
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}❌ Échec du démarrage du backend${NC}"
    echo -e "${RED}Consultez les logs: tail -f logs/backend.log${NC}"
    exit 1
fi

echo -e "${BLUE}🎨 Démarrage du frontend sur le port 4028...${NC}"
npm start > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend démarré (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}🎉 Art'Beau-Pointage est maintenant en cours d'exécution !${NC}"
echo -e "${GREEN}=================================="
echo -e "📱 Frontend: ${BLUE}http://localhost:4028${NC}"
echo -e "🔧 Backend API: ${BLUE}http://localhost:3001${NC}"
echo -e "🔍 QR Codes: ${BLUE}http://localhost:3001/workstations/qr-print${NC}"
echo -e "📊 Dashboard: ${BLUE}http://localhost:4028/dashboard${NC}"
echo ""
echo -e "${YELLOW}💡 Comptes de test:${NC}"
echo -e "   👑 Superviseur: ${BLUE}abdoulayeniasse${NC} / ${BLUE}artbeaurescence${NC}"
echo -e "   👤 Employé: ${BLUE}mariamafall${NC} / ${BLUE}artbeaurescence${NC}"
echo ""
echo -e "${YELLOW}📝 Logs en temps réel:${NC}"
echo -e "   Backend: ${BLUE}tail -f logs/backend.log${NC}"
echo -e "   Frontend: ${BLUE}tail -f logs/frontend.log${NC}"
echo ""
echo -e "${RED}Appuyez sur Ctrl+C pour arrêter les serveurs${NC}"

# Attendre indéfiniment
wait
