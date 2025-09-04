#!/bin/bash

# Simple script to run SortedStorage with Solobase backend

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting SortedStorage${NC}"
echo ""

# Check if executable exists
if [ ! -f "./sortedstorage" ]; then
    echo -e "${YELLOW}Building SortedStorage...${NC}"
    ./build.sh
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start Solobase if not already running
SOLOBASE_PORT=8090
if ! lsof -i:$SOLOBASE_PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting Solobase on port $SOLOBASE_PORT...${NC}"
    (cd ../go/solobase && DATABASE_TYPE=sqlite DATABASE_URL=file:./.data/solobase.db DEFAULT_ADMIN_EMAIL=admin@example.com DEFAULT_ADMIN_PASSWORD=admin123 PORT=$SOLOBASE_PORT go run .) &
    sleep 3
else
    echo -e "${GREEN}✓ Solobase already running on port $SOLOBASE_PORT${NC}"
fi

# Run SortedStorage
echo -e "${GREEN}Starting SortedStorage...${NC}"
./sortedstorage --port 8080 --solobase http://localhost:$SOLOBASE_PORT &

echo -e "\n${GREEN}✅ SortedStorage is ready!${NC}"
echo ""
echo "  🌐 Open: http://localhost:8080"
echo "  📧 Login: admin@example.com"
echo "  🔑 Password: admin123"
echo ""
echo "Press Ctrl+C to stop"

# Wait for all background jobs
wait