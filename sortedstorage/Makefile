.PHONY: help build dev prod stop clean logs shell test

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev       - Start development environment with hot reload"
	@echo "  make prod      - Start production environment"
	@echo "  make build     - Build Docker images"
	@echo "  make stop      - Stop all containers"
	@echo "  make clean     - Stop containers and remove volumes"
	@echo "  make logs      - Show container logs"
	@echo "  make shell     - Open shell in frontend container"
	@echo "  make test      - Run tests"

# Build Docker images
build:
	docker-compose build

# Start development environment
dev:
	docker-compose -f docker-compose.dev.yml up

# Start production environment
prod:
	docker-compose --profile production up -d

# Stop all containers
stop:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Clean everything (including volumes)
clean:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
	rm -rf dev-data dev-storage

# Show logs
logs:
	docker-compose logs -f

# Open shell in frontend container
shell:
	docker exec -it sortedstorage sh

# Run tests
test:
	npm test

# Build production application locally
build-local:
	npm run build

# Run production build locally
start-local:
	npm run preview