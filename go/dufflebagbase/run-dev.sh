#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DATABASE_TYPE="${1:-sqlite}"
API_PORT=8080
FRONTEND_PORT=5173

echo -e "${GREEN}=== Dufflebag Development Server ===${NC}"
echo -e "${YELLOW}Database Type: $DATABASE_TYPE${NC}"

# Kill existing processes
echo -e "${YELLOW}Stopping any existing servers...${NC}"
pkill -f "go run ." 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 1

# Set database URL based on type
if [ "$DATABASE_TYPE" = "postgres" ]; then
    # Start PostgreSQL container if needed
    if ! docker ps | grep -q dufflebag-postgres; then
        echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
        docker run -d \
            --name dufflebag-postgres \
            -e POSTGRES_USER=dufflebag \
            -e POSTGRES_PASSWORD=dufflebag123 \
            -e POSTGRES_DB=dufflebagbase \
            -p 5432:5432 \
            postgres:15-alpine 2>/dev/null || docker start dufflebag-postgres
        
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
    fi
    DATABASE_URL="postgresql://dufflebag:dufflebag123@localhost:5432/dufflebagbase?sslmode=disable"
else
    DATABASE_URL="file:./dufflebag.db"
fi

# Start API server
echo -e "${YELLOW}Starting API server on port $API_PORT...${NC}"
DATABASE_TYPE=$DATABASE_TYPE \
DATABASE_URL=$DATABASE_URL \
DEFAULT_ADMIN_EMAIL=admin@example.com \
DEFAULT_ADMIN_PASSWORD=AdminSecurePass2024! \
PORT=$API_PORT \
go run . &
API_PID=$!

# Wait for API to start
echo "Waiting for API server to start..."
sleep 3

# Start frontend dev server
echo -e "${YELLOW}Starting frontend dev server on port $FRONTEND_PORT...${NC}"
cd admin && npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

echo ""
echo -e "${GREEN}=== Servers are running! ===${NC}"
echo -e "${YELLOW}Frontend:${NC} http://localhost:$FRONTEND_PORT"
echo -e "${YELLOW}API:${NC}      http://localhost:$API_PORT/api"
echo ""
echo -e "${YELLOW}Default Admin:${NC}"
echo "  Email:    admin@example.com"
echo "  Password: AdminSecurePass2024!"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop all servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    
    if [ "$DATABASE_TYPE" = "postgres" ]; then
        echo -e "${YELLOW}Stopping PostgreSQL container...${NC}"
        docker stop dufflebag-postgres
    fi
    
    echo -e "${GREEN}Goodbye!${NC}"
    exit 0
}

# Set up trap to cleanup on Ctrl+C
trap cleanup INT

# Keep script running
wait
