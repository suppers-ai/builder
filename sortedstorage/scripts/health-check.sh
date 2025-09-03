#!/bin/bash

# SortedStorage Health Check Script
# Monitors the health of all services

set -e

# Configuration
CHECK_INTERVAL=${CHECK_INTERVAL:-30}
MAX_RETRIES=${MAX_RETRIES:-3}
ALERT_WEBHOOK=${ALERT_WEBHOOK:-""}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Service endpoints
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
BACKEND_URL=${BACKEND_URL:-"http://localhost:8090"}
DATABASE_HOST=${DATABASE_HOST:-"localhost"}
DATABASE_PORT=${DATABASE_PORT:-"5432"}

# Functions
print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Send alert
send_alert() {
    local service=$1
    local status=$2
    local message=$3
    
    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"service\":\"$service\",\"status\":\"$status\",\"message\":\"$message\"}" \
            2>/dev/null || true
    fi
}

# Check frontend health
check_frontend() {
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -sf "${FRONTEND_URL}/health" > /dev/null 2>&1; then
            print_status "Frontend is healthy"
            return 0
        fi
        retries=$((retries + 1))
        sleep 2
    done
    
    print_error "Frontend is not responding"
    send_alert "frontend" "down" "Frontend health check failed"
    return 1
}

# Check backend health
check_backend() {
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -sf "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
            print_status "Backend is healthy"
            return 0
        fi
        retries=$((retries + 1))
        sleep 2
    done
    
    print_error "Backend is not responding"
    send_alert "backend" "down" "Backend health check failed"
    return 1
}

# Check database
check_database() {
    if nc -z "$DATABASE_HOST" "$DATABASE_PORT" 2>/dev/null; then
        print_status "Database is accessible"
        
        # Try to connect with psql if available
        if command -v psql &> /dev/null; then
            if PGPASSWORD="${DATABASE_PASSWORD:-solobase-password}" \
               psql -h "$DATABASE_HOST" -p "$DATABASE_PORT" \
                    -U "${DATABASE_USER:-solobase}" \
                    -d "${DATABASE_NAME:-solobase}" \
                    -c "SELECT 1" > /dev/null 2>&1; then
                print_status "Database connection successful"
            else
                print_warning "Database is up but connection failed"
                return 1
            fi
        fi
        return 0
    else
        print_error "Database is not accessible"
        send_alert "database" "down" "Database not accessible on ${DATABASE_HOST}:${DATABASE_PORT}"
        return 1
    fi
}

# Check Docker containers
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not installed, skipping container checks"
        return 0
    fi
    
    local unhealthy=0
    
    # Check container status
    while IFS= read -r line; do
        container=$(echo "$line" | awk '{print $1}')
        status=$(echo "$line" | awk '{print $2}')
        
        if [[ "$status" == *"unhealthy"* ]]; then
            print_error "Container $container is unhealthy"
            unhealthy=$((unhealthy + 1))
        elif [[ "$status" == *"healthy"* ]]; then
            print_status "Container $container is healthy"
        fi
    done < <(docker ps --format "table {{.Names}}\t{{.Status}}" | tail -n +2)
    
    if [ $unhealthy -gt 0 ]; then
        send_alert "docker" "unhealthy" "$unhealthy containers are unhealthy"
        return 1
    fi
    
    return 0
}

# Check disk space
check_disk_space() {
    local threshold=90
    local usage=$(df -h / | awk 'NR==2 {print int($5)}')
    
    if [ $usage -gt $threshold ]; then
        print_error "Disk usage is at ${usage}% (threshold: ${threshold}%)"
        send_alert "disk" "critical" "Disk usage at ${usage}%"
        return 1
    else
        print_status "Disk usage is at ${usage}%"
        return 0
    fi
}

# Check memory usage
check_memory() {
    if command -v free &> /dev/null; then
        local total=$(free -m | awk 'NR==2 {print $2}')
        local used=$(free -m | awk 'NR==2 {print $3}')
        local percent=$((used * 100 / total))
        
        if [ $percent -gt 90 ]; then
            print_error "Memory usage is at ${percent}%"
            send_alert "memory" "critical" "Memory usage at ${percent}%"
            return 1
        else
            print_status "Memory usage is at ${percent}%"
            return 0
        fi
    else
        print_warning "Cannot check memory usage"
        return 0
    fi
}

# Check API endpoints
check_api_endpoints() {
    local endpoints=(
        "/api/auth/session"
        "/api/storage/quota"
        "/api/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -sf "${BACKEND_URL}${endpoint}" > /dev/null 2>&1; then
            print_status "API endpoint ${endpoint} is responding"
        else
            print_warning "API endpoint ${endpoint} is not responding"
        fi
    done
}

# Check SSL certificates
check_ssl_certificates() {
    if [ ! -d "certs" ]; then
        print_warning "No SSL certificates found"
        return 0
    fi
    
    if [ -f "certs/server.crt" ]; then
        local expiry=$(openssl x509 -enddate -noout -in certs/server.crt | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry" +%s)
        local current_epoch=$(date +%s)
        local days_left=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        if [ $days_left -lt 30 ]; then
            print_warning "SSL certificate expires in ${days_left} days"
            send_alert "ssl" "warning" "SSL certificate expires in ${days_left} days"
        else
            print_status "SSL certificate valid for ${days_left} days"
        fi
    fi
}

# Generate report
generate_report() {
    local report_file="health_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "checks": {
        "frontend": $(check_frontend > /dev/null 2>&1 && echo "true" || echo "false"),
        "backend": $(check_backend > /dev/null 2>&1 && echo "true" || echo "false"),
        "database": $(check_database > /dev/null 2>&1 && echo "true" || echo "false"),
        "docker": $(check_docker > /dev/null 2>&1 && echo "true" || echo "false"),
        "disk": $(check_disk_space > /dev/null 2>&1 && echo "true" || echo "false"),
        "memory": $(check_memory > /dev/null 2>&1 && echo "true" || echo "false")
    },
    "metrics": {
        "disk_usage": "$(df -h / | awk 'NR==2 {print $5}')",
        "memory_usage": "$(free -m | awk 'NR==2 {printf "%.1f%%", $3/$2*100}' 2>/dev/null || echo "N/A")",
        "containers": $(docker ps -q | wc -l 2>/dev/null || echo 0)
    }
}
EOF
    
    echo "Report saved to: $report_file"
}

# Main health check
run_health_check() {
    echo "========================================="
    echo "SortedStorage Health Check"
    echo "Time: $(date)"
    echo "========================================="
    
    local failed=0
    
    # Run all checks
    check_frontend || failed=$((failed + 1))
    check_backend || failed=$((failed + 1))
    check_database || failed=$((failed + 1))
    check_docker || failed=$((failed + 1))
    check_disk_space || failed=$((failed + 1))
    check_memory || failed=$((failed + 1))
    check_api_endpoints
    check_ssl_certificates
    
    echo "========================================="
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}All health checks passed${NC}"
        return 0
    else
        echo -e "${RED}$failed health checks failed${NC}"
        return 1
    fi
}

# Continuous monitoring
monitor() {
    echo "Starting continuous health monitoring..."
    echo "Check interval: ${CHECK_INTERVAL} seconds"
    echo "Press Ctrl+C to stop"
    
    while true; do
        clear
        run_health_check
        sleep $CHECK_INTERVAL
    done
}

# Main execution
case ${1:-check} in
    check)
        run_health_check
        ;;
    
    monitor)
        monitor
        ;;
    
    report)
        generate_report
        ;;
    
    *)
        echo "Usage: $0 [check|monitor|report]"
        echo "  check   - Run health check once"
        echo "  monitor - Continuous monitoring"
        echo "  report  - Generate health report"
        exit 1
        ;;
esac