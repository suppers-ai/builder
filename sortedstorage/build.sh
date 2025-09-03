#!/bin/bash

set -e

echo "=========================================="
echo "Building SortedStorage with Integrated Backend"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing npm dependencies...${NC}"
npm install

echo -e "${YELLOW}Step 2: Building SvelteKit frontend...${NC}"
npm run build

echo -e "${YELLOW}Step 3: Copying build to backend directory...${NC}"
rm -rf backend/build
cp -r build backend/

echo -e "${YELLOW}Step 4: Downloading Go dependencies...${NC}"
cd backend
go mod download
go mod tidy

echo -e "${YELLOW}Step 5: Building Go backend with embedded frontend...${NC}"
CGO_ENABLED=1 go build -o ../sortedstorage-server .

cd ..

echo -e "${GREEN}=========================================="
echo -e "Build completed successfully!"
echo -e "Binary created: ./sortedstorage-server"
echo -e ""
echo -e "To run the server:"
echo -e "  ./sortedstorage-server"
echo -e ""
echo -e "Configuration via environment variables:"
echo -e "  PORT=3000"
echo -e "  DATABASE_TYPE=sqlite"
echo -e "  DATABASE_URL=file:./sortedstorage.db"
echo -e "  DEFAULT_ADMIN_EMAIL=admin@sortedstorage.com"
echo -e "  DEFAULT_ADMIN_PASSWORD=YourSecurePassword"
echo -e "==========================================${NC}"