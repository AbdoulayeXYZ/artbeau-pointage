#!/bin/bash

# Script pour démarrer le système complet avec ngrok (backend + frontend)

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Démarrage du système Art'Beau-Pointage avec ngrok...${NC}"

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok n'est pas installé. Installez-le avec: brew install ngrok${NC}"
    exit 1
fi

# Arrêter les processus existants
echo -e "${YELLOW}🛑 Arrêt des processus existants...${NC}"
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "npx.*http-server" 2>/dev/null || true
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

# Démarrer le backend en arrière-plan
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

# Servir le frontend construit
echo -e "${BLUE}🌐 Préparation du serveur frontend...${NC}"
cd /Users/abdoulayexyz/Documents/PROJECTS/DEV/qr_timesheet_pro/frontend

# Vérifier les dépendances frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances frontend...${NC}"
    npm install
fi

# Construire le frontend
echo -e "${BLUE}🔨 Construction du frontend...${NC}"
npm run build

# Installer http-server globalement si nécessaire
if ! command -v http-server &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de http-server...${NC}"
    npm install -g http-server
fi

# Démarrer le serveur frontend en arrière-plan
echo -e "${BLUE}🚀 Démarrage du serveur frontend...${NC}"
http-server build -p 8080 -c-1 --proxy http://localhost:8080? &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend démarré sur le port 8080 (PID: $FRONTEND_PID)${NC}"

# Attendre que le frontend soit prêt
sleep 2

# Créer les tunnels ngrok
echo -e "${BLUE}🌍 Création des tunnels ngrok...${NC}"

# Tunnel pour le backend
ngrok http 3001 --log=stdout &
NGROK_BACKEND_PID=$!

# Tunnel pour le frontend
ngrok http 8080 --log=stdout &
NGROK_FRONTEND_PID=$!

echo -e "${GREEN}✅ Tunnels ngrok créés${NC}"

# Attendre un peu que ngrok s'initialise
sleep 5

# Récupérer les URLs ngrok
echo -e "${BLUE}🔍 Récupération des URLs publiques...${NC}"

# Fonction pour nettoyer à l'arrêt
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt en cours...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $NGROK_BACKEND_PID 2>/dev/null || true
    kill $NGROK_FRONTEND_PID 2>/dev/null || true
    pkill -f "ngrok" 2>/dev/null || true
    echo -e "${GREEN}✅ Arrêté proprement${NC}"
    exit 0
}

# Intercepter Ctrl+C
trap cleanup INT TERM

# Afficher les informations
echo -e "\n${GREEN}🎉 Système démarré avec succès !${NC}"
echo -e "${BLUE}📱 Accès local:${NC}"
echo -e "   Backend:  http://localhost:3001"
echo -e "   Frontend: http://localhost:8080"
echo -e "\n${BLUE}🌍 Pour récupérer les URLs publiques ngrok:${NC}"
echo -e "   Visitez: http://localhost:4040"
echo -e "\n${BLUE}👥 Comptes utilisateur:${NC}"
echo -e "   Employés: Noms de la liste (ex: 'Alice Martin')"
echo -e "   Superviseur: admin / artbeaurescence"
echo -e "\n${YELLOW}💡 Conseil: Gardez cette fenêtre ouverte pour maintenir ngrok actif${NC}"
echo -e "\n${RED}🛑 Appuyez sur Ctrl+C pour arrêter tous les services${NC}"

# Attendre indéfiniment
wait
