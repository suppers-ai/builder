#!/bin/bash

# Simple build script for Formula Pricing Site

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building Formula Pricing Site...${NC}"

# Generate templates
echo "Generating templ templates..."
if command -v templ > /dev/null 2>&1; then
    templ generate
elif [ -f "$HOME/go/bin/templ" ]; then
    $HOME/go/bin/templ generate
else
    echo "Installing templ..."
    go install github.com/a-h/templ/cmd/templ@latest
    $HOME/go/bin/templ generate
fi

# Build the application
echo "Building Go application..."
go mod tidy
go build -o formulapricing-site .

echo -e "${GREEN}Build completed successfully!${NC}"
echo "Run with: ./formulapricing-site"