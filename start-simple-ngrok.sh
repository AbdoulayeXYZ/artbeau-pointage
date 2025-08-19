#!/bin/bash

# Script simplifié pour démarrer le système avec un seul tunnel ngrok

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Démarrage simplifié du système Art'Beau-Pointage...${NC}"

# Arrêter les processus existants
echo -e "${YELLOW}🛑 Arrêt des processus existants...${NC}"
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true

# Attendre que les ports se libèrent
sleep 2

# Démarrer le backend
echo -e "${BLUE}🔧 Démarrage du backend...${NC}"
cd /Users/abdoulayexyz/Documents/PROJECTS/DEV/qr_timesheet_pro/backend

# Vérifier les dépendances backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances backend...${NC}"
    npm install
fi

# Initialiser la base de données si nécessaire
if [ ! -f "artbeau_pointage.db" ]; then
    echo -e "${YELLOW}🗄️  Initialisation de la base de données...${NC}"
    node init-db.js
fi

# Démarrer le backend en arrière-plan avec CORS élargi
CORS_ORIGIN="*" node server.js &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"

# Attendre que le backend soit prêt
sleep 3

# Vérifier que le backend est bien lancé
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${RED}❌ Le backend ne répond pas${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Créer le tunnel ngrok pour le backend seulement
echo -e "${BLUE}🌍 Création du tunnel ngrok pour le backend...${NC}"
ngrok http 3001 --log=stdout &
NGROK_PID=$!

# Attendre que ngrok s'initialise
sleep 5

# Fonction pour nettoyer à l'arrêt
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt en cours...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
    pkill -f "ngrok" 2>/dev/null || true
    echo -e "${GREEN}✅ Arrêté proprement${NC}"
    exit 0
}

# Intercepter Ctrl+C
trap cleanup INT TERM

echo -e "\n${GREEN}🎉 Backend démarré avec ngrok !${NC}"
echo -e "${BLUE}📱 Accès local backend:${NC} http://localhost:3001"
echo -e "${BLUE}🌍 URL publique ngrok:${NC} Visitez http://localhost:4040 pour voir l'URL"
echo -e "${BLUE}💻 Frontend local:${NC} Utilisez './frontend/build' avec http-server ou serveur local"

echo -e "\n${YELLOW}💡 Instructions pour utiliser le frontend:${NC}"
echo -e "1. Récupérez l'URL ngrok à http://localhost:4040"
echo -e "2. Mettez à jour frontend/.env.production avec cette URL"
echo -e "3. Rebuilder le frontend: cd frontend && npm run build"
echo -e "4. Servir le frontend: http-server build -p 8080"

echo -e "\n${RED}🛑 Appuyez sur Ctrl+C pour arrêter${NC}"

# Attendre indéfiniment
wait
