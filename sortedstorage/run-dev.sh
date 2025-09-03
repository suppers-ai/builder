#!/bin/bash

# Development script for SortedStorage with Solobase backend
# This runs both the backend and frontend in development mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT="${BACKEND_PORT:-8090}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
DATABASE_TYPE="${DATABASE_TYPE:-sqlite}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    # Kill the background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on the ports
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}Services stopped${NC}"
    exit 0
}

# Trap exit signals
trap cleanup EXIT INT TERM

echo -e "${BLUE}=========================================="
echo -e "SortedStorage Development Environment"
echo -e "==========================================${NC}"
echo ""

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All dependencies found${NC}\n"

# Kill any existing processes on our ports
echo -e "${YELLOW}Checking for existing processes...${NC}"
if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "Killing existing process on port $BACKEND_PORT"
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "Killing existing process on port $FRONTEND_PORT"
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo -e "${GREEN}✓ Ports are available${NC}\n"

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}\n"
fi

# Create necessary directories
mkdir -p storage .data

# Start Solobase backend
echo -e "${BLUE}Starting Solobase backend on port $BACKEND_PORT...${NC}"

cd ../go/solobase

# Create a temporary env file for the backend
cat > .env.dev.tmp << EOF
PORT=$BACKEND_PORT
DATABASE_TYPE=$DATABASE_TYPE
DATABASE_URL=file:./.data/solobase.db
DEFAULT_ADMIN_EMAIL=admin@sortedstorage.com
DEFAULT_ADMIN_PASSWORD=AdminSecurePass2024!
STORAGE_TYPE=local
STORAGE_PATH=./storage
JWT_SECRET=dev-secret-key-not-for-production
CORS_ORIGINS=http://localhost:$FRONTEND_PORT,http://localhost:3000
EOF

# Start the backend
if [ "$DATABASE_TYPE" = "sqlite" ]; then
    echo -e "${YELLOW}Using SQLite database${NC}"
    (
        export $(cat .env.dev.tmp | xargs)
        ./solobase 2>&1 | sed 's/^/[BACKEND] /' &
    )
    BACKEND_PID=$!
else
    echo -e "${YELLOW}Using PostgreSQL database${NC}"
    (
        export $(cat .env.dev.tmp | xargs)
        ./solobase 2>&1 | sed 's/^/[BACKEND] /' &
    )
    BACKEND_PID=$!
fi

cd - > /dev/null

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready${NC}\n"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Backend failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Start SvelteKit frontend
echo -e "${BLUE}Starting SvelteKit frontend on port $FRONTEND_PORT...${NC}"

# Create/update .env for frontend
cat > .env << EOF
PUBLIC_API_URL=http://localhost:$BACKEND_PORT
VITE_API_URL=http://localhost:$BACKEND_PORT
VITE_WS_URL=ws://localhost:$BACKEND_PORT
VITE_APP_URL=http://localhost:$FRONTEND_PORT
EOF

# Start the frontend
(
    npm run dev 2>&1 | sed 's/^/[FRONTEND] /' &
)
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend is ready${NC}\n"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Frontend failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Display access information
echo -e "${GREEN}=========================================="
echo -e "Development environment is ready!"
echo -e "==========================================${NC}"
echo -e ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:$BACKEND_PORT${NC}"
echo -e "  API:       ${GREEN}http://localhost:$BACKEND_PORT/api${NC}"
echo -e ""
echo -e "${BLUE}Default Admin Credentials:${NC}"
echo -e "  Email:     admin@sortedstorage.com"
echo -e "  Password:  AdminSecurePass2024!"
echo -e ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo -e ""

# Keep the script running and show logs
wait $BACKEND_PID $FRONTEND_PID