#!/bin/bash

# Simple development script for SortedStorage with integrated backend

set -e

# Kill any existing processes on port 3000 or 8080
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
pkill -f "go run.*backend" 2>/dev/null || true
sleep 1

echo "Building frontend..."
npm run build

echo "Copying frontend to backend..."
rm -rf backend/build
cp -r build backend/

echo "Starting integrated backend..."
cd backend

env DATABASE_TYPE=sqlite \
    DATABASE_URL=file:./test.db \
    PORT=3000 \
    DEFAULT_ADMIN_EMAIL=admin@example.com \
    DEFAULT_ADMIN_PASSWORD=admin123 \
    go run .