#!/bin/bash

echo "🏭 Art'Beau-Pointage - Système de Pointage"
echo "=========================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction de nettoyage
cleanup() {
    print_warning "\n⚠️  Arrêt des services en cours..."
    
    if [[ $BACKEND_PID ]]; then
        print_status "Arrêt du backend..."
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [[ $FRONTEND_PID ]]; then
        print_status "Arrêt du frontend..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    print_success "🛑 Art'Beau-Pointage arrêté"
    exit 0
}

# Intercepter Ctrl+C
trap cleanup SIGINT SIGTERM

print_status "🚀 Démarrage d'Art'Beau-Pointage..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

print_success "✅ Node.js $(node --version) détecté"

# Installation des dépendances backend
if [ ! -d "backend/node_modules" ]; then
    print_status "📦 Installation des dépendances backend..."
    cd backend && npm install --silent
    if [ $? -ne 0 ]; then
        print_error "Erreur lors de l'installation des dépendances backend"
        exit 1
    fi
    cd ..
else
    print_success "✅ Dépendances backend déjà installées"
fi

# Installation des dépendances frontend
if [ ! -d "node_modules" ]; then
    print_status "📦 Installation des dépendances frontend..."
    npm install --silent
    if [ $? -ne 0 ]; then
        print_error "Erreur lors de l'installation des dépendances frontend"
        exit 1
    fi
else
    print_success "✅ Dépendances frontend déjà installées"
fi

# Initialisation de la base de données
print_status "💾 Initialisation de la base de données..."
cd backend && npm run init-db
if [ $? -ne 0 ]; then
    print_error "Erreur lors de l'initialisation de la base de données"
    exit 1
fi
cd ..

print_success "✅ Base de données initialisée"

# Démarrage du backend
print_status "🔧 Démarrage du serveur backend (port 3001)..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

sleep 3

# Vérifier si le backend est démarré
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_error "Le backend n'a pas pu démarrer"
    exit 1
fi

print_success "✅ Backend démarré (PID: $BACKEND_PID)"

# Démarrage du frontend
print_status "🎨 Démarrage du serveur frontend (port 3000)..."
# S'assurer qu'on est dans le bon répertoire du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
npm start &
FRONTEND_PID=$!

sleep 3

# Vérifier si le frontend est démarré
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_error "Le frontend n'a pas pu démarrer"
    cleanup
    exit 1
fi

print_success "✅ Frontend démarré (PID: $FRONTEND_PID)"

echo ""
print_success "🎉 Art'Beau-Pointage est maintenant opérationnel !"
echo ""
echo "🌐 ============= URLS D'ACCÈS ============="
echo ""
print_success "📱 Application employés: http://localhost:3000"
print_success "🖥️  Dashboard superviseur: http://localhost:3000/dashboard"
print_success "🔐 Page de connexion: http://localhost:3000/login"
print_success "📊 API Backend: http://localhost:3001"
print_success "🔗 QR Codes: http://localhost:3001/api/workstations/qr/print"
echo ""
echo "👥 Comptes de test:"
echo "   - Superviseur: abdoulayeniasse / artbeaurescence"
echo "   - Employé: mariamafall / artbeaurescence"
echo "   - (Tous les autres utilisateurs ont le même mot de passe)"
echo ""
echo "📋 Postes de travail: A1 à A7, B1 à B7"
echo ""
print_warning "⚠️  Appuyez sur Ctrl+C pour arrêter tous les services"
echo ""

# Attente infinie
while true; do
    # Vérifier que les processus sont toujours actifs
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Le backend s'est arrêté de manière inattendue"
        cleanup
        exit 1
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Le frontend s'est arrêté de manière inattendue"
        cleanup
        exit 1
    fi
    
    sleep 5
done
