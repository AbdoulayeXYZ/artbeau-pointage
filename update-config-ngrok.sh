#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Mise à jour des configurations avec les URLs ngrok${NC}"

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

# Attendre que ngrok soit prêt
echo -e "${YELLOW}⏳ Attente de ngrok...${NC}"
sleep 3

# Récupérer les URLs
BACKEND_URL=$(get_ngrok_url "backend")
FRONTEND_URL=$(get_ngrok_url "frontend")

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Impossible de récupérer les URLs ngrok${NC}"
    echo -e "${YELLOW}Vérifiez que ngrok est démarré et accessible sur http://localhost:4040${NC}"
    exit 1
fi

echo -e "${GREEN}✅ URLs récupérées :${NC}"
echo -e "   Backend: ${BLUE}$BACKEND_URL${NC}"
echo -e "   Frontend: ${BLUE}$FRONTEND_URL${NC}"

# Mettre à jour le backend .env
echo -e "${YELLOW}🔧 Mise à jour du backend .env...${NC}"
BACKEND_ENV_FILE="backend/.env"

# Créer une sauvegarde
cp "$BACKEND_ENV_FILE" "$BACKEND_ENV_FILE.backup"

# Mettre à jour CORS_ORIGIN
sed -i.tmp "s|CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:4028,$FRONTEND_URL|g" "$BACKEND_ENV_FILE"
rm "$BACKEND_ENV_FILE.tmp"

echo -e "${GREEN}✅ Backend .env mis à jour${NC}"

# Créer un fichier .env.local pour le frontend avec l'URL ngrok
echo -e "${YELLOW}🔧 Création du .env.local frontend...${NC}"
cat > .env.local << EOF
# Configuration ngrok - Généré automatiquement
VITE_API_URL=$BACKEND_URL
VITE_NGROK_FRONTEND_URL=$FRONTEND_URL
VITE_NGROK_BACKEND_URL=$BACKEND_URL
EOF

echo -e "${GREEN}✅ .env.local frontend créé${NC}"

# Afficher les informations finales
echo ""
echo "=================================================="
echo -e "${GREEN}🌍 Configuration mise à jour !${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}URLs à partager :${NC}"
echo -e "   Application: ${GREEN}$FRONTEND_URL${NC}"
echo -e "   API:         ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}💡 Les employés peuvent maintenant accéder à :${NC}"
echo -e "   ${GREEN}$FRONTEND_URL${NC}"
echo ""
