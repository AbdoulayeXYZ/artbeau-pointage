#!/bin/bash

echo "🛑 Arrêt d'Art'Beau-Pointage..."
echo "==============================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Arrêter les processus sur les ports utilisés
if lsof -ti:3001 > /dev/null; then
    echo -e "${YELLOW}🔧 Arrêt du backend (port 3001)...${NC}"
    kill $(lsof -ti:3001) 2>/dev/null
    echo -e "${GREEN}✅ Backend arrêté${NC}"
else
    echo -e "${YELLOW}ℹ️  Aucun processus backend en cours${NC}"
fi

if lsof -ti:4028 > /dev/null; then
    echo -e "${YELLOW}🎨 Arrêt du frontend (port 4028)...${NC}"
    kill $(lsof -ti:4028) 2>/dev/null
    echo -e "${GREEN}✅ Frontend arrêté${NC}"
else
    echo -e "${YELLOW}ℹ️  Aucun processus frontend en cours${NC}"
fi

# Nettoyer les processus node restants liés au projet
pkill -f "artbeau-pointage" 2>/dev/null || true
pkill -f "qr-timesheet-pro" 2>/dev/null || true

echo -e "${GREEN}🎉 Tous les serveurs ont été arrêtés !${NC}"
