#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting SortedStorage Development Environment${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# SINGLE SOURCE OF TRUTH FOR PORTS
FRONTEND_PORT=5174
BACKEND_PORT=8093  # Solobase port

echo -e "${YELLOW}Configuration:${NC}"
echo "  Frontend (Vite): port $FRONTEND_PORT"
echo "  Backend (Solobase): port $BACKEND_PORT"
echo ""

# Step 1: Check if SortedStorage backend is running, start if not
if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SortedStorage backend already running on port $BACKEND_PORT${NC}"
else
    echo -e "${YELLOW}Starting SortedStorage backend on port $BACKEND_PORT...${NC}"
    
    # Check if sortedstorage-backend binary exists
    if [ -f "./sortedstorage-backend" ]; then
        DATABASE_TYPE=sqlite DATABASE_URL=file:./.data/sortedstorage.db DEFAULT_ADMIN_EMAIL=admin@example.com DEFAULT_ADMIN_PASSWORD=admin123 PORT=$BACKEND_PORT ./sortedstorage-backend &
    # Fallback to building if not exists
    elif [ -f "./backend/main.go" ]; then
        echo -e "${YELLOW}Building SortedStorage backend...${NC}"
        cd backend
        go build -o ../sortedstorage-backend .
        cd ..
        DATABASE_TYPE=sqlite DATABASE_URL=file:./.data/sortedstorage.db DEFAULT_ADMIN_EMAIL=admin@example.com DEFAULT_ADMIN_PASSWORD=admin123 PORT=$BACKEND_PORT ./sortedstorage-backend &
    else
        echo -e "${RED}Error: SortedStorage backend not found${NC}"
        echo "Please build the backend first by running:"
        echo "  cd backend && go build -o ../sortedstorage-backend ."
        exit 1
    fi
    
    # Wait for backend to start
    echo -n "Waiting for backend to start..."
    for i in {1..10}; do
        if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
            echo -e " ${GREEN}ready!${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
fi

# Step 2: Start frontend dev server
echo -e "${YELLOW}Starting SortedStorage frontend on port $FRONTEND_PORT...${NC}"
npm run dev -- --port $FRONTEND_PORT --no-open &

# Wait a moment for the frontend to start
sleep 2

echo -e "\n${GREEN}✅ Development environment ready!${NC}"
echo ""
echo -e "${BLUE}URLs:${NC}"
echo "  🌐 SortedStorage: http://localhost:$FRONTEND_PORT"
echo "  🔐 Login:         http://localhost:$FRONTEND_PORT/auth/login"
echo "  👤 Profile:       http://localhost:$FRONTEND_PORT/profile"
echo "  🛠️  Admin:         http://localhost:$FRONTEND_PORT/admin"
echo ""
echo -e "${BLUE}Direct Solobase access:${NC}"
echo "  📡 API:           http://localhost:$BACKEND_PORT/api"
echo "  🎛️  Admin UI:      http://localhost:$BACKEND_PORT/admin"
echo ""
echo "  Login: admin@example.com / admin123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background jobs
wait