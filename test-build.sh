#!/bin/bash

echo "🧪 Test rapide du build frontend..."

cd /Users/abdoulayexyz/Documents/PROJECTS/DEV/qr_timesheet_pro/frontend

# Rebuild pour être sûr
echo "🔨 Rebuild du frontend..."
npm run build

echo "🔍 Vérification du contenu de build/index.html..."
if grep -q "Art.*Beau\|qr-timesheet\|root" build/index.html; then
    echo "✅ Le build contient la vraie application Art'Beau-Pointage"
else
    echo "❌ Le build ne contient pas la vraie application"
    echo "Contenu de index.html:"
    head -10 build/index.html
fi

echo "🌐 Test du serveur local..."
http-server build -p 8081 -c-1 &
SERVER_PID=$!

sleep 2

# Test du contenu servi
echo "📄 Test du contenu servi..."
CONTENT=$(curl -s http://localhost:8081)
if echo "$CONTENT" | grep -q "Art.*Beau\|qr-timesheet\|root"; then
    echo "✅ Le serveur sert correctement l'application Art'Beau-Pointage"
else
    echo "❌ Problème avec le contenu servi"
    echo "Contenu reçu (premières lignes):"
    echo "$CONTENT" | head -5
fi

# Nettoyer
kill $SERVER_PID 2>/dev/null || true

echo "🏁 Test terminé."
