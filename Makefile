# Makefile pour Art'Beau Pointage
# Simplifie les commandes de développement et déploiement

.PHONY: help dev build deploy deploy-server clean status logs backup restore

# Variables
COMPOSE_FILE = docker-compose.prod.yml
SERVER_IP = 51.68.45.161
SERVER_USER = ubuntu
REPOSITORY_PATH = /home/ubuntu/artbeau-pointage

help: ## Affiche cette aide
	@echo "Art'Beau Pointage - Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Lance l'environnement de développement
	@echo "🚀 Lancement en mode développement..."
	cd frontend && npm start &
	cd backend && npm run dev

build: ## Construit les images Docker
	@echo "🔨 Construction des images Docker..."
	docker-compose -f $(COMPOSE_FILE) build --no-cache

deploy: ## Déploie localement
	@echo "🚀 Déploiement local..."
	./deploy.sh

deploy-prod: ## Déploie localement avec variables d'environnement
	@echo "🚀 Déploiement local en production..."
	./deploy-prod.sh

deploy-server: ## Déploie sur le serveur
	@echo "🌐 Déploiement sur le serveur..."
	./deploy-to-server.sh

status: ## Affiche le statut des conteneurs
	@echo "📊 Statut des conteneurs:"
	docker-compose -f $(COMPOSE_FILE) ps

logs: ## Affiche les logs
	@echo "📋 Logs des conteneurs:"
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## Affiche les logs du backend
	docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## Affiche les logs du frontend
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

stop: ## Arrête tous les conteneurs
	@echo "🛑 Arrêt des conteneurs..."
	docker-compose -f $(COMPOSE_FILE) down

restart: ## Redémarre tous les conteneurs
	@echo "🔄 Redémarrage des conteneurs..."
	docker-compose -f $(COMPOSE_FILE) restart

clean: ## Nettoie les conteneurs et images
	@echo "🧹 Nettoyage..."
	docker-compose -f $(COMPOSE_FILE) down --remove-orphans
	docker image prune -f
	docker container prune -f

deep-clean: ## Nettoyage complet (ATTENTION: supprime tout)
	@echo "⚠️  Nettoyage complet..."
	@read -p "Êtes-vous sûr? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker system prune -af

backup: ## Sauvegarde la base de données
	@echo "💾 Sauvegarde de la base de données..."
	mkdir -p ./backups
	docker exec artbeau_backend node scripts/backup.js ./backups/backup-$(shell date +%Y%m%d-%H%M%S).json

server-status: ## Vérifie le statut sur le serveur
	@echo "📊 Statut du serveur:"
	ssh $(SERVER_USER)@$(SERVER_IP) "cd $(REPOSITORY_PATH) && docker-compose -f $(COMPOSE_FILE) ps"

server-logs: ## Affiche les logs du serveur
	ssh $(SERVER_USER)@$(SERVER_IP) "cd $(REPOSITORY_PATH) && docker-compose -f $(COMPOSE_FILE) logs -f"

server-restart: ## Redémarre l'application sur le serveur
	@echo "🔄 Redémarrage sur le serveur..."
	ssh $(SERVER_USER)@$(SERVER_IP) "cd $(REPOSITORY_PATH) && docker-compose -f $(COMPOSE_FILE) restart"

update-server: ## Met à jour le code sur le serveur
	@echo "📦 Mise à jour du serveur..."
	rsync -avz --progress \
		--exclude 'node_modules/' \
		--exclude '.git/' \
		--exclude 'frontend/node_modules/' \
		--exclude 'backend/node_modules/' \
		--exclude 'frontend/build/' \
		--exclude 'backend/data/' \
		--exclude 'backend/logs/' \
		./ $(SERVER_USER)@$(SERVER_IP):$(REPOSITORY_PATH)/

ssl-renew: ## Renouvelle le certificat SSL
	ssh $(SERVER_USER)@$(SERVER_IP) "cd $(REPOSITORY_PATH) && ./deploy-ssl.sh"

install: ## Installe les dépendances
	@echo "📦 Installation des dépendances..."
	cd frontend && npm install
	cd backend && npm install

test: ## Lance les tests
	@echo "🧪 Lancement des tests..."
	cd backend && npm test

check-health: ## Vérifie la santé de l'application
	@echo "🏥 Vérification de la santé..."
	curl -f http://localhost/health || echo "❌ Application non accessible"

quick-deploy: update-server server-restart ## Déploiement rapide (update + restart)
	@echo "✅ Déploiement rapide terminé!"
