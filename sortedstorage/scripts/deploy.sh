#!/bin/bash

# SortedStorage Deployment Script
# This script handles deployment to various environments

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}

# Configuration
PROJECT_NAME="sortedstorage"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

check_requirements() {
    print_status "Checking requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check environment file
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        if [ ! -f ".env" ]; then
            print_warning "No environment file found. Creating from example..."
            cp .env.example .env
        fi
    fi
    
    print_status "Requirements check passed"
}

build_images() {
    print_status "Building Docker images..."
    
    # Build frontend
    docker build -t ${PROJECT_NAME}:${IMAGE_TAG} .
    
    if [ -n "$DOCKER_REGISTRY" ]; then
        docker tag ${PROJECT_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}
    fi
    
    print_status "Images built successfully"
}

push_images() {
    if [ -z "$DOCKER_REGISTRY" ]; then
        print_warning "No Docker registry configured. Skipping push..."
        return
    fi
    
    print_status "Pushing images to registry..."
    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}
    print_status "Images pushed successfully"
}

deploy_local() {
    print_status "Deploying to local environment..."
    
    # Stop existing containers
    docker-compose down
    
    # Start with new configuration
    docker-compose up -d
    
    # Wait for health checks
    print_status "Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    if docker-compose ps | grep -q "unhealthy"; then
        print_error "Some services are unhealthy"
        docker-compose ps
        exit 1
    fi
    
    print_status "Local deployment completed"
    print_status "Application available at: http://localhost:3000"
}

deploy_production() {
    print_status "Deploying to production environment..."
    
    # Load production environment
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    # Use production compose file if exists
    COMPOSE_FILE="docker-compose.yml"
    if [ -f "docker-compose.production.yml" ]; then
        COMPOSE_FILE="docker-compose.production.yml"
    fi
    
    # Deploy with production profile
    docker-compose -f ${COMPOSE_FILE} --profile production down
    docker-compose -f ${COMPOSE_FILE} --profile production up -d
    
    print_status "Production deployment completed"
}

deploy_staging() {
    print_status "Deploying to staging environment..."
    
    # Load staging environment
    if [ -f ".env.staging" ]; then
        export $(cat .env.staging | grep -v '^#' | xargs)
    fi
    
    # Deploy
    docker-compose down
    docker-compose up -d
    
    print_status "Staging deployment completed"
}

rollback() {
    print_status "Rolling back deployment..."
    
    # Get previous tag
    PREVIOUS_TAG=${PREVIOUS_TAG:-"previous"}
    
    # Retag images
    docker tag ${PROJECT_NAME}:${PREVIOUS_TAG} ${PROJECT_NAME}:${IMAGE_TAG}
    
    # Redeploy
    case $ENVIRONMENT in
        production)
            deploy_production
            ;;
        staging)
            deploy_staging
            ;;
        local)
            deploy_local
            ;;
    esac
    
    print_status "Rollback completed"
}

cleanup() {
    print_status "Cleaning up..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    print_status "Cleanup completed"
}

# Main execution
print_status "Starting deployment process..."
print_status "Environment: $ENVIRONMENT"
print_status "Action: $ACTION"

# Check requirements
check_requirements

# Execute action
case $ACTION in
    deploy)
        build_images
        push_images
        
        case $ENVIRONMENT in
            production)
                deploy_production
                ;;
            staging)
                deploy_staging
                ;;
            local)
                deploy_local
                ;;
            *)
                print_error "Unknown environment: $ENVIRONMENT"
                exit 1
                ;;
        esac
        ;;
    
    build)
        build_images
        ;;
    
    push)
        push_images
        ;;
    
    rollback)
        rollback
        ;;
    
    cleanup)
        cleanup
        ;;
    
    *)
        print_error "Unknown action: $ACTION"
        echo "Usage: $0 [environment] [action]"
        echo "Environments: local, staging, production"
        echo "Actions: deploy, build, push, rollback, cleanup"
        exit 1
        ;;
esac

print_status "Deployment process completed successfully"