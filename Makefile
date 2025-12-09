# ===================================
# AutoBooks-UI Makefile
# Docker Container Management Commands
# ===================================

.PHONY: help build up down restart logs shell test clean

# Default target
help:
	@echo "AutoBooks-UI Docker Commands"
	@echo "============================="
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build and start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build and start production environment"
	@echo "  make prod-down    - Stop production environment"
	@echo ""
	@echo "General:"
	@echo "  make build        - Build Docker images"
	@echo "  make up           - Start containers (default: dev)"
	@echo "  make down         - Stop all containers"
	@echo "  make restart      - Restart all containers"
	@echo "  make logs         - View container logs"
	@echo "  make shell        - Open shell in UI container"
	@echo ""
	@echo "Local Development (without Docker):"
	@echo "  make install      - Install dependencies"
	@echo "  make start        - Start local dev server"
	@echo "  make lint         - Run ESLint"
	@echo "  make format       - Format code with Prettier"
	@echo "  make type-check   - Run TypeScript type check"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean        - Remove containers and volumes"
	@echo "  make prune        - Remove unused Docker resources"

# ===================================
# Development Commands (Docker)
# ===================================
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

dev-build:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

dev-down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# ===================================
# Production Commands (Docker)
# ===================================
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# ===================================
# General Docker Commands
# ===================================
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

shell:
	docker compose exec ui /bin/sh

# ===================================
# Local Development Commands (without Docker)
# ===================================
install:
	pnpm install

start:
	pnpm dev

build-local:
	pnpm build

start-prod:
	pnpm start

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

format:
	pnpm format

format-check:
	pnpm format:check

type-check:
	pnpm exec tsc --noEmit

# ===================================
# Cleanup Commands
# ===================================
clean:
	docker compose down -v --remove-orphans
	docker compose rm -f

prune:
	docker system prune -f
	docker volume prune -f

clean-local:
	rm -rf node_modules
	rm -rf .next
	rm -rf out

# ===================================
# Health Check
# ===================================
health:
	curl -f http://localhost:3000/ || echo "Health check failed"

# ===================================
# Docker Hub Commands
# ===================================
docker-login:
	docker login

docker-push:
	docker compose build ui
	docker tag autobooks-ui:latest $(DOCKER_USERNAME)/autobooks-ui:latest
	docker push $(DOCKER_USERNAME)/autobooks-ui:latest

docker-pull:
	docker pull $(DOCKER_USERNAME)/autobooks-ui:latest
