#!/bin/bash

# Deployment Verification Script
# This script verifies that all deployment methods work correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_PORT=8082
HEALTH_ENDPOINT="http://localhost:$TEST_PORT/health"
HOME_ENDPOINT="http://localhost:$TEST_PORT/"

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

# Wait for service to be ready
wait_for_service() {
    local endpoint=$1
    local max_attempts=30
    local attempt=1
    
    log_info "Waiting for service to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$endpoint" > /dev/null 2>&1; then
            log_success "Service is ready"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    log_error "Service failed to start within $max_attempts seconds"
    return 1
}

# Test health endpoint
test_health_endpoint() {
    log_info "Testing health endpoint..."
    
    local response=$(curl -s "$HEALTH_ENDPOINT")
    
    if echo "$response" | grep -q '"status":"healthy"'; then
        log_success "Health endpoint is working correctly"
        return 0
    else
        log_error "Health endpoint test failed"
        echo "Response: $response"
        return 1
    fi
}

# Test home page
test_home_page() {
    log_info "Testing home page..."
    
    local response=$(curl -s "$HOME_ENDPOINT")
    
    if echo "$response" | grep -q "Formula Pricing"; then
        log_success "Home page is working correctly"
        return 0
    else
        log_error "Home page test failed"
        return 1
    fi
}

# Test static assets
test_static_assets() {
    log_info "Testing static assets..."
    
    # Test CSS
    if curl -f -s "http://localhost:$TEST_PORT/static/css/styles.css" > /dev/null; then
        log_success "CSS assets are accessible"
    else
        log_error "CSS assets test failed"
        return 1
    fi
    
    # Test JavaScript
    if curl -f -s "http://localhost:$TEST_PORT/static/js/professor-gopher.js" > /dev/null; then
        log_success "JavaScript assets are accessible"
    else
        log_error "JavaScript assets test failed"
        return 1
    fi
    
    # Test images
    if curl -f -s "http://localhost:$TEST_PORT/static/images/professor-gopher.png" > /dev/null; then
        log_success "Image assets are accessible"
    else
        log_error "Image assets test failed"
        return 1
    fi
    
    return 0
}

# Test binary deployment
test_binary_deployment() {
    log_info "Testing binary deployment..."
    
    # Build the binary
    ./build.sh > /dev/null 2>&1
    
    # Start the server in background
    PORT=$TEST_PORT ENVIRONMENT=production ./formulapricing-site > /dev/null 2>&1 &
    local pid=$!
    
    # Wait for service and test
    if wait_for_service "$HEALTH_ENDPOINT"; then
        test_health_endpoint && test_home_page && test_static_assets
        local result=$?
        
        # Stop the server
        kill $pid 2>/dev/null || true
        wait $pid 2>/dev/null || true
        
        if [ $result -eq 0 ]; then
            log_success "Binary deployment test passed"
            return 0
        else
            log_error "Binary deployment test failed"
            return 1
        fi
    else
        kill $pid 2>/dev/null || true
        log_error "Binary deployment test failed - service didn't start"
        return 1
    fi
}

# Test Docker deployment
test_docker_deployment() {
    log_info "Testing Docker deployment..."
    
    # Build Docker image
    docker build -t formulapricing-site:test . > /dev/null 2>&1
    
    # Run container
    docker run -d --name formulapricing-test -p $TEST_PORT:8080 \
        -e ENVIRONMENT=production formulapricing-site:test > /dev/null 2>&1
    
    # Wait for service and test
    if wait_for_service "$HEALTH_ENDPOINT"; then
        test_health_endpoint && test_home_page && test_static_assets
        local result=$?
        
        # Stop and remove container
        docker stop formulapricing-test > /dev/null 2>&1
        docker rm formulapricing-test > /dev/null 2>&1
        
        if [ $result -eq 0 ]; then
            log_success "Docker deployment test passed"
            return 0
        else
            log_error "Docker deployment test failed"
            return 1
        fi
    else
        docker stop formulapricing-test > /dev/null 2>&1
        docker rm formulapricing-test > /dev/null 2>&1
        log_error "Docker deployment test failed - service didn't start"
        return 1
    fi
}

# Test Docker Compose deployment
test_docker_compose_deployment() {
    log_info "Testing Docker Compose deployment..."
    
    # Create temporary docker-compose file for testing
    cat > docker-compose.test.yml << EOF
services:
  formulapricing-site:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: formulapricing_test_compose
    environment:
      PORT: "8080"
      ENVIRONMENT: "production"
      LOG_LEVEL: "INFO"
    ports:
      - "$TEST_PORT:8080"
    networks:
      - test_network

networks:
  test_network:
    driver: bridge
EOF
    
    # Start services
    docker compose -f docker-compose.test.yml up -d > /dev/null 2>&1
    
    # Wait for service and test
    if wait_for_service "$HEALTH_ENDPOINT"; then
        test_health_endpoint && test_home_page && test_static_assets
        local result=$?
        
        # Stop services
        docker compose -f docker-compose.test.yml down > /dev/null 2>&1
        rm -f docker-compose.test.yml
        
        if [ $result -eq 0 ]; then
            log_success "Docker Compose deployment test passed"
            return 0
        else
            log_error "Docker Compose deployment test failed"
            return 1
        fi
    else
        docker compose -f docker-compose.test.yml down > /dev/null 2>&1
        rm -f docker-compose.test.yml
        log_error "Docker Compose deployment test failed - service didn't start"
        return 1
    fi
}

# Main verification function
run_verification() {
    log_info "Starting deployment verification..."
    
    local tests_passed=0
    local tests_failed=0
    
    # Test binary deployment
    if test_binary_deployment; then
        tests_passed=$((tests_passed + 1))
    else
        tests_failed=$((tests_failed + 1))
    fi
    
    # Test Docker deployment
    if command -v docker > /dev/null 2>&1; then
        if test_docker_deployment; then
            tests_passed=$((tests_passed + 1))
        else
            tests_failed=$((tests_failed + 1))
        fi
        
        # Test Docker Compose deployment
        if test_docker_compose_deployment; then
            tests_passed=$((tests_passed + 1))
        else
            tests_failed=$((tests_failed + 1))
        fi
    else
        log_warning "Docker not available, skipping Docker tests"
    fi
    
    # Summary
    echo ""
    log_info "Verification Summary:"
    log_success "Tests passed: $tests_passed"
    
    if [ $tests_failed -gt 0 ]; then
        log_error "Tests failed: $tests_failed"
        return 1
    else
        log_success "All deployment methods verified successfully!"
        return 0
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up test resources..."
    
    # Kill any running processes
    pkill -f formulapricing-site 2>/dev/null || true
    
    # Remove test containers
    docker stop formulapricing-test 2>/dev/null || true
    docker rm formulapricing-test 2>/dev/null || true
    docker stop formulapricing_test_compose 2>/dev/null || true
    docker rm formulapricing_test_compose 2>/dev/null || true
    
    # Remove test compose file
    rm -f docker-compose.test.yml
    
    # Remove test image
    docker rmi formulapricing-site:test 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Trap cleanup on exit
trap cleanup EXIT

# Run verification
if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Verify that all deployment methods work correctly."
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo ""
    echo "This script will test:"
    echo "  - Binary deployment"
    echo "  - Docker deployment"
    echo "  - Docker Compose deployment"
    echo ""
    exit 0
fi

# Check prerequisites
if ! command -v curl > /dev/null 2>&1; then
    log_error "curl is required but not installed"
    exit 1
fi

if ! command -v go > /dev/null 2>&1; then
    log_error "Go is required but not installed"
    exit 1
fi

# Run the verification
run_verification