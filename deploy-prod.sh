#!/bin/bash
set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Déploiement Art'Beau Pointage - Production${NC}"

# Vérifier si le fichier .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erreur: Le fichier .env.production est introuvable${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Chargement des variables d'environnement...${NC}"

# Charger les variables d'environnement depuis .env.production
export $(grep -v '^#' .env.production | grep -v '^$' | xargs)

# Vérifier que les variables critiques sont définies
if [ -z "$JWT_SECRET" ] || [ -z "$CORS_ORIGIN" ]; then
    echo -e "${RED}❌ Erreur: Variables d'environnement critiques manquantes (JWT_SECRET, CORS_ORIGIN)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variables d'environnement chargées${NC}"
echo -e "${BLUE}🔑 JWT_SECRET: ${JWT_SECRET:0:10}...${NC}"
echo -e "${BLUE}🌐 CORS_ORIGIN: $CORS_ORIGIN${NC}"

# Arrêter les anciens conteneurs
echo -e "${YELLOW}🛑 Arrêt des anciens conteneurs...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Construire et démarrer les conteneurs
echo -e "${YELLOW}🏗️  Construction des images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}🚀 Démarrage des conteneurs...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Vérifier le statut des conteneurs
echo -e "${YELLOW}⏱️  Attente du démarrage des services...${NC}"
sleep 10

echo -e "${GREEN}📊 Statut des conteneurs:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Test de santé
echo -e "${YELLOW}🔍 Tests de santé...${NC}"
sleep 5

# Vérifier le backend
if docker exec artbeau_backend curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: OK${NC}"
else
    echo -e "${RED}❌ Backend: KO${NC}"
fi

# Vérifier le frontend
if curl -f -s -k https://localhost:443 >/dev/null 2>&1 || curl -f -s http://localhost:80 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend: OK${NC}"
else
    echo -e "${RED}❌ Frontend: KO${NC}"
fi

echo -e "${GREEN}🎉 Déploiement terminé!${NC}"
echo -e "${BLUE}🌐 Application accessible sur: https://pointage.artbeaurescence.sn${NC}"

# Afficher les logs en temps réel si demandé
read -p "Voulez-vous voir les logs en temps réel ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose -f docker-compose.prod.yml logs -f
fi
