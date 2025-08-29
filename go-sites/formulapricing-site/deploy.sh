#!/bin/bash

# Formula Pricing Site Deployment Script
# This script handles building and deploying the Formula Pricing Site

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="formulapricing-site"
DOCKER_IMAGE="formulapricing-site:latest"
CONTAINER_NAME="formulapricing_site"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Generate templ files
generate_templates() {
    log_info "Generating templ templates..."
    if command -v templ > /dev/null 2>&1; then
        templ generate
        log_success "Templates generated successfully"
    elif [ -f "$HOME/go/bin/templ" ]; then
        $HOME/go/bin/templ generate
        log_success "Templates generated successfully"
    else
        log_warning "templ command not found. Installing..."
        go install github.com/a-h/templ/cmd/templ@latest
        if [ -f "$HOME/go/bin/templ" ]; then
            $HOME/go/bin/templ generate
        else
            templ generate
        fi
        log_success "Templates generated successfully"
    fi
}

# Build the application
build_app() {
    log_info "Building Go application..."
    go mod tidy
    go build -o $APP_NAME .
    log_success "Application built successfully"
}

# Build Docker image
build_docker() {
    log_info "Building Docker image..."
    docker build -t $DOCKER_IMAGE .
    log_success "Docker image built successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    if [ -f "run-tests.sh" ]; then
        chmod +x run-tests.sh
        ./run-tests.sh
        log_success "All tests passed"
    else
        go test ./...
        log_success "Tests completed"
    fi
}

# Deploy with Docker Compose
deploy_compose() {
    log_info "Deploying with Docker Compose..."
    
    # Stop existing containers
    if docker-compose ps | grep -q $CONTAINER_NAME; then
        log_info "Stopping existing containers..."
        docker-compose down
    fi
    
    # Start new containers
    docker-compose up -d
    
    # Wait for health check
    log_info "Waiting for application to be healthy..."
    sleep 10
    
    # Check if container is running
    if docker-compose ps | grep -q "Up"; then
        log_success "Application deployed successfully"
        log_info "Application is running at: http://localhost:8080"
    else
        log_error "Deployment failed"
        docker-compose logs
        exit 1
    fi
}

# Deploy standalone Docker container
deploy_docker() {
    log_info "Deploying standalone Docker container..."
    
    # Stop and remove existing container
    if docker ps -a | grep -q $CONTAINER_NAME; then
        log_info "Stopping existing container..."
        docker stop $CONTAINER_NAME || true
        docker rm $CONTAINER_NAME || true
    fi
    
    # Run new container
    docker run -d \
        --name $CONTAINER_NAME \
        -p 8080:8080 \
        -e PORT=8080 \
        -e ENVIRONMENT=production \
        -e LOG_LEVEL=INFO \
        -e STATIC_PATH=./static \
        --restart unless-stopped \
        $DOCKER_IMAGE
    
    # Wait for container to start
    sleep 5
    
    # Check if container is running
    if docker ps | grep -q $CONTAINER_NAME; then
        log_success "Container deployed successfully"
        log_info "Application is running at: http://localhost:8080"
    else
        log_error "Container deployment failed"
        docker logs $CONTAINER_NAME
        exit 1
    fi
}

# Production build
build_production() {
    log_info "Building for production..."
    generate_templates
    
    log_info "Building optimized binary..."
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
        -ldflags="-w -s" \
        -a -installsuffix cgo \
        -o $APP_NAME .
    
    log_success "Production build completed"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build       Build the application locally"
    echo "  test        Run tests"
    echo "  docker      Build Docker image"
    echo "  deploy      Deploy with Docker Compose"
    echo "  deploy-docker Deploy standalone Docker container"
    echo "  production  Build for production deployment"
    echo "  clean       Clean up Docker resources"
    echo "  logs        Show application logs"
    echo "  health      Check application health"
    echo "  verify      Run deployment verification tests"
    echo ""
}

# Clean up Docker resources
clean_docker() {
    log_info "Cleaning up Docker resources..."
    
    # Stop and remove containers
    docker-compose down || true
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
    
    # Remove image
    docker rmi $DOCKER_IMAGE || true
    
    log_success "Docker resources cleaned up"
}

# Show logs
show_logs() {
    if docker-compose ps | grep -q $CONTAINER_NAME; then
        docker-compose logs -f
    elif docker ps | grep -q $CONTAINER_NAME; then
        docker logs -f $CONTAINER_NAME
    else
        log_error "No running containers found"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Checking application health..."
    
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        log_success "Application is healthy"
    else
        log_error "Application health check failed"
        exit 1
    fi
}

# Main script logic
case "${1:-}" in
    "build")
        check_docker
        generate_templates
        build_app
        ;;
    "test")
        generate_templates
        run_tests
        ;;
    "docker")
        check_docker
        generate_templates
        build_docker
        ;;
    "deploy")
        check_docker
        generate_templates
        build_docker
        run_tests
        deploy_compose
        ;;
    "deploy-docker")
        check_docker
        generate_templates
        build_docker
        run_tests
        deploy_docker
        ;;
    "production")
        build_production
        ;;
    "clean")
        check_docker
        clean_docker
        ;;
    "logs")
        show_logs
        ;;
    "health")
        health_check
        ;;
    "verify")
        if [ -f "./verify-deployment.sh" ]; then
            ./verify-deployment.sh
        else
            log_error "Verification script not found"
            exit 1
        fi
        ;;
    *)
        show_usage
        exit 1
        ;;
esac