#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Configuration
FRONTEND_PORT=${FRONTEND_PORT:-5174}  # Changed from 5173 to avoid conflict
BACKEND_PORT=${BACKEND_PORT:-8081}    # Changed from 8080 to avoid conflict

# Build frontend first
echo -e "${YELLOW}Building SortedStorage frontend...${NC}"
npm run build

# Start the integrated backend (includes both SortedStorage and Solobase)
echo -e "${YELLOW}Starting integrated SortedStorage+Solobase backend on port $BACKEND_PORT...${NC}"
cd backend
DATABASE_TYPE=sqlite DATABASE_URL=file:./.data/sortedstorage.db DEFAULT_ADMIN_EMAIL=admin@example.com DEFAULT_ADMIN_PASSWORD=admin123 PORT=$BACKEND_PORT go run . &
cd ..

# Also start frontend in dev mode for hot reload
echo -e "${YELLOW}Starting SortedStorage frontend dev server on port $FRONTEND_PORT...${NC}"
npm run dev -- --port $FRONTEND_PORT --open false &

echo -e "\n${GREEN}✅ Development environment ready!${NC}"
echo ""
echo "  🌐 SortedStorage: http://localhost:$BACKEND_PORT"
echo "  📁 Admin UI:      http://localhost:$BACKEND_PORT/admin/"
echo "  🔧 Vite Dev:      http://localhost:$FRONTEND_PORT (for hot reload)"
echo ""
echo "  Login: admin@example.com / admin123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background jobs
wait