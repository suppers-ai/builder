#!/bin/bash

# Development script for SortedStorage with integrated backend
# This runs the integrated Go backend that serves both API and frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT="${PORT:-3000}"
DATABASE_TYPE="${DATABASE_TYPE:-sqlite}"
HOT_RELOAD="${HOT_RELOAD:-true}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down integrated server...${NC}"
    
    # Kill the background process
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on the port
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}Server stopped${NC}"
    exit 0
}

# Trap exit signals
trap cleanup EXIT INT TERM

echo -e "${BLUE}=========================================="
echo -e "SortedStorage Integrated Development"
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

# Kill any existing processes on our port and related ports
echo -e "${YELLOW}Checking for existing processes...${NC}"

# Kill processes on main port
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "Killing existing process on port $PORT"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Also check common development ports
for port in 3000 3001 3002 3003 8080 8090 8091; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "Killing existing process on port $port"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

# Kill any running go processes in backend directory
pkill -f "go run.*backend" 2>/dev/null || true

echo -e "${GREEN}✓ Ports cleaned up${NC}\n"

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}\n"
fi

# Build the frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built${NC}\n"

# Copy build to backend
echo -e "${YELLOW}Copying frontend build to backend...${NC}"
rm -rf backend/build
cp -r build backend/
echo -e "${GREEN}✓ Frontend copied${NC}\n"

# Create necessary directories
mkdir -p backend/storage backend/.data

# Setup backend environment
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
PORT=$PORT
DATABASE_TYPE=$DATABASE_TYPE
DATABASE_URL=file:./.data/sortedstorage.db
DEFAULT_ADMIN_EMAIL=admin@sortedstorage.com
DEFAULT_ADMIN_PASSWORD=AdminSecurePass2024!
STORAGE_TYPE=local
STORAGE_PATH=./storage
JWT_SECRET=dev-secret-key-not-for-production
CORS_ORIGINS=http://localhost:$PORT
EOF
    echo -e "${GREEN}✓ .env file created${NC}\n"
fi

# Download Go dependencies if needed
if [ ! -f "go.sum" ] || [ ! -d "vendor" ]; then
    echo -e "${YELLOW}Downloading Go dependencies...${NC}"
    go mod download
    go mod tidy
    echo -e "${GREEN}✓ Dependencies downloaded${NC}\n"
fi

# Function to rebuild and restart server
rebuild_and_restart() {
    echo -e "${YELLOW}Changes detected, rebuilding...${NC}"
    
    # Kill existing server
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
    
    # Rebuild frontend if needed
    if [ "$1" = "frontend" ]; then
        echo -e "${YELLOW}Rebuilding frontend...${NC}"
        cd ..
        npm run build
        rm -rf backend/build
        cp -r build backend/
        cd backend
    fi
    
    # Start the server
    echo -e "${YELLOW}Starting server...${NC}"
    go run . 2>&1 &
    SERVER_PID=$!
    
    echo -e "${GREEN}✓ Server restarted${NC}"
}

# Start the integrated server
echo -e "${BLUE}Starting integrated server on port $PORT...${NC}"

if [ "$HOT_RELOAD" = "true" ] && command -v fswatch &> /dev/null; then
    echo -e "${YELLOW}Hot reload enabled (requires fswatch)${NC}"
    
    # Initial start
    go run . 2>&1 &
    SERVER_PID=$!
    
    # Watch for changes
    (
        # Watch Go files
        fswatch -o *.go ../go/solobase/**/*.go ../go/packages/**/*.go 2>/dev/null | while read change; do
            rebuild_and_restart "backend"
        done
    ) &
    
    (
        # Watch frontend files
        cd ..
        fswatch -o src/**/* static/**/* 2>/dev/null | while read change; do
            rebuild_and_restart "frontend"
        done
    ) &
    
elif [ "$HOT_RELOAD" = "true" ]; then
    echo -e "${YELLOW}Note: Install fswatch for hot reload support${NC}"
    echo -e "${YELLOW}Running without hot reload${NC}"
    go run . 2>&1 &
    SERVER_PID=$!
else
    go run . 2>&1 &
    SERVER_PID=$!
fi

# Wait for server to start
echo -e "${YELLOW}Waiting for server to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server is ready${NC}\n"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Server failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Display access information
echo -e "${GREEN}=========================================="
echo -e "Integrated development server is ready!"
echo -e "==========================================${NC}"
echo -e ""
echo -e "${BLUE}Access URL:${NC}"
echo -e "  ${GREEN}http://localhost:$PORT${NC}"
echo -e ""
echo -e "${BLUE}API Endpoints:${NC}"
echo -e "  ${GREEN}http://localhost:$PORT/api${NC}"
echo -e ""
echo -e "${BLUE}Default Admin Credentials:${NC}"
echo -e "  Email:     admin@sortedstorage.com"
echo -e "  Password:  AdminSecurePass2024!"
echo -e ""
if [ "$HOT_RELOAD" = "true" ] && command -v fswatch &> /dev/null; then
    echo -e "${YELLOW}Hot reload is active - changes will auto-rebuild${NC}"
fi
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo -e ""

# Keep the script running
wait $SERVER_PID