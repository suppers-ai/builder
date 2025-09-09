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
    
    # Kill all child processes
    kill $(jobs -p) 2>/dev/null
    
    # Kill by port number
    PID=$(lsof -t -i:$BACKEND_PORT 2>/dev/null)
    if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null
    fi
    
    # Kill any sortedstorage-backend processes
    pkill -f "sortedstorage-backend" 2>/dev/null
    
    # Give processes time to shut down
    sleep 1
    
    # Force kill if still running
    if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
        fuser -k $BACKEND_PORT/tcp 2>/dev/null
    fi
    
    exit
}

trap cleanup EXIT INT TERM

# SINGLE SOURCE OF TRUTH FOR PORTS
FRONTEND_PORT=5174
BACKEND_PORT=8095  # Solobase port - MUST match vite.config.js proxy setting

echo -e "${YELLOW}Configuration:${NC}"
echo "  Frontend (Vite): port $FRONTEND_PORT"
echo "  Backend (Solobase): port $BACKEND_PORT"
echo ""

# Step 1: Kill any existing process on the backend port
if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}Port $BACKEND_PORT is in use. Killing existing process...${NC}"
    
    # Get PID of process using the port and kill it
    PID=$(lsof -t -i:$BACKEND_PORT)
    if [ ! -z "$PID" ]; then
        echo "Killing process $PID on port $BACKEND_PORT"
        kill -9 $PID 2>/dev/null
        sleep 1
    fi
    
    # Double-check with pkill for any sortedstorage-backend processes
    pkill -f "sortedstorage-backend" 2>/dev/null
    sleep 1
    
    # Final check - if still in use, try fuser
    if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
        echo "Port still in use, using fuser to force kill..."
        fuser -k $BACKEND_PORT/tcp 2>/dev/null
        sleep 1
    fi
fi

# Now start the backend
if ! lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting SortedStorage backend on port $BACKEND_PORT...${NC}"
    
    # Always rebuild to ensure we have the latest changes
    if [ -f "./backend/main.go" ]; then
        echo -e "${YELLOW}Building SortedStorage backend...${NC}"
        # Remove extensions_generated.go if it exists to prevent package conflicts
        rm -f /home/joris/Projects/suppers-ai/builder/go/solobase/extensions_generated.go
        cd backend
        go build -o ../sortedstorage-backend .
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to build backend${NC}"
            exit 1
        fi
        cd ..
        DATABASE_TYPE=sqlite DATABASE_URL=file:./.data/sortedstorage.db DEFAULT_ADMIN_EMAIL=admin@example.com DEFAULT_ADMIN_PASSWORD=admin123 PORT=$BACKEND_PORT ./sortedstorage-backend &
    else
        echo -e "${RED}Error: SortedStorage backend source not found${NC}"
        echo "Please ensure backend/main.go exists"
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