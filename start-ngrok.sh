#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Art'Beau-Pointage - Démarrage avec ngrok${NC}"
echo "=================================================="

# Fonction pour nettoyer les processus à la sortie
cleanup() {
    echo -e "\n${YELLOW}🧹 Nettoyage des processus...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    if [ ! -z "$NGROK_PID" ]; then
        kill $NGROK_PID 2>/dev/null
    fi
    exit
}

# Configurer le signal de nettoyage
trap cleanup SIGINT SIGTERM

# Vérifier que ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok n'est pas installé. Installez-le avec: brew install ngrok/ngrok/ngrok${NC}"
    exit 1
fi

# Aller dans le répertoire du projet
cd "$(dirname "$0")"

echo -e "${BLUE}📦 Installation des dépendances...${NC}"

# Installer les dépendances backend
echo -e "${YELLOW}Backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Installer les dépendances frontend
echo -e "${YELLOW}Frontend...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
fi

echo -e "${GREEN}✅ Dépendances installées${NC}"

# Démarrer le backend en arrière-plan
echo -e "${BLUE}🔧 Démarrage du backend (port 3001)...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
sleep 3

# Démarrer le frontend en arrière-plan
echo -e "${BLUE}🎨 Démarrage du frontend (port 4028)...${NC}"
npm run start &
FRONTEND_PID=$!

# Attendre que le frontend soit prêt
sleep 5

# Démarrer ngrok avec la configuration
echo -e "${BLUE}🌐 Démarrage de ngrok...${NC}"
ngrok start --all --config=ngrok.yml &
NGROK_PID=$!

# Attendre que ngrok soit prêt
sleep 8

# Obtenir les URLs ngrok via l'API
echo -e "${GREEN}🌍 Récupération des URLs publiques...${NC}"
sleep 2

# Fonction pour obtenir l'URL ngrok
get_ngrok_url() {
    local name=$1
    local url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r ".tunnels[] | select(.name==\"$name\") | .public_url" 2>/dev/null)
    if [ "$url" = "null" ] || [ -z "$url" ]; then
        echo ""
    else
        echo $url
    fi
}

# Récupérer les URLs avec plusieurs tentatives
echo -e "${YELLOW}⏳ Récupération des URLs ngrok...${NC}"
for i in {1..10}; do
    BACKEND_URL=$(get_ngrok_url "backend")
    FRONTEND_URL=$(get_ngrok_url "frontend")
    
    if [ ! -z "$BACKEND_URL" ] && [ ! -z "$FRONTEND_URL" ]; then
        break
    fi
    
    echo -e "${YELLOW}   Tentative $i/10...${NC}"
    sleep 2
done

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Impossible de récupérer les URLs ngrok${NC}"
    echo -e "${YELLOW}Vérifiez le tableau de bord ngrok : http://localhost:4040${NC}"
    BACKEND_URL="[URL_NON_DISPONIBLE]"
    FRONTEND_URL="[URL_NON_DISPONIBLE]"
else
    # Mettre à jour les configurations
    echo -e "${BLUE}🔧 Mise à jour des configurations...${NC}"
    
    # Mettre à jour le backend .env
    BACKEND_ENV_FILE="backend/.env"
    cp "$BACKEND_ENV_FILE" "$BACKEND_ENV_FILE.backup" 2>/dev/null
    sed -i.tmp "s|CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:4028,$FRONTEND_URL|g" "$BACKEND_ENV_FILE"
    rm "$BACKEND_ENV_FILE.tmp" 2>/dev/null
    
    # Créer .env.local pour le frontend
    cat > .env.local << EOF
# Configuration ngrok - Généré automatiquement
VITE_API_URL=$BACKEND_URL
VITE_NGROK_FRONTEND_URL=$FRONTEND_URL
VITE_NGROK_BACKEND_URL=$BACKEND_URL
EOF
    
    echo -e "${GREEN}✅ Configurations mises à jour${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Art'Beau-Pointage est maintenant accessible !${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}🔗 URLs publiques :${NC}"
echo -e "   Frontend (App): ${GREEN}$FRONTEND_URL${NC}"
echo -e "   Backend (API):  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${BLUE}🔗 URLs locales :${NC}"
echo -e "   Frontend: ${YELLOW}http://localhost:4028${NC}"
echo -e "   Backend:  ${YELLOW}http://localhost:3001${NC}"
echo -e "   Ngrok Dashboard: ${YELLOW}http://localhost:4040${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT :${NC}"
echo "1. Partagez l'URL Frontend avec vos employés"
echo "2. Les URLs ngrok changent à chaque redémarrage (version gratuite)"
echo "3. Pour un domaine fixe, configurez un compte ngrok payant"
echo ""
echo -e "${GREEN}📱 Instructions pour les employés :${NC}"
echo "1. Ouvrir : $FRONTEND_URL"
echo "2. Se connecter avec :"
echo "   - Nom d'utilisateur : employé1, employé2, etc."
echo "   - Mot de passe : artbeaurescence"
echo ""
echo -e "${RED}🛑 Appuyez sur Ctrl+C pour arrêter tous les services${NC}"
echo ""

# Attendre indéfiniment (jusqu'à Ctrl+C)
wait
