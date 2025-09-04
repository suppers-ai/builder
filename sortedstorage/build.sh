#!/bin/bash

set -e

echo "🔨 Building SortedStorage..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the SortedStorage root directory.${NC}"
    exit 1
fi

# Step 1: Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install --legacy-peer-deps

# Step 2: Build the frontend
echo -e "${YELLOW}🎨 Building frontend...${NC}"
npm run build

# Step 3: Copy built files to backend/static
echo -e "${YELLOW}📁 Preparing static files...${NC}"
rm -rf backend/static
mkdir -p backend/static

# Copy the built SvelteKit files
if [ -d "build" ]; then
    cp -r build/* backend/static/
else
    echo -e "${RED}Error: Build directory not found. Frontend build may have failed.${NC}"
    exit 1
fi

# Step 4: Build the Go backend with embedded files
echo -e "${YELLOW}🚀 Building Go backend...${NC}"
cd backend

# Build for current platform
go build -o ../sortedstorage -ldflags="-s -w" .

cd ..

# Make executable
chmod +x sortedstorage

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "To run SortedStorage:"
echo "  ./sortedstorage --port 8080 --solobase http://localhost:8090"
echo ""
echo "Available flags:"
echo "  --port       Port to run server on (default: 8080)"
echo "  --solobase   Solobase backend URL (default: http://localhost:8090)"
echo "  --dev        Development mode - proxy to Vite (default: false)"
echo "  --vite       Vite dev server URL for dev mode (default: http://localhost:5173)"