#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Set default ports if not provided
export API_PORT=${API_PORT:-8080}
export FRONTEND_PORT=${FRONTEND_PORT:-5173}

echo -e "${GREEN}=== Starting Solobase ===${NC}"
echo -e "${YELLOW}API Port: $API_PORT${NC}"
echo -e "${YELLOW}Frontend Port: $FRONTEND_PORT${NC}"
echo ""
echo "To use different ports, set environment variables:"
echo "  API_PORT=8090 FRONTEND_PORT=3000 ./start.sh"
echo ""

# Run the dev server with the configured ports
./run-dev.sh "$@"