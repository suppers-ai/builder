#!/bin/bash

# Build script for SortedStorage with integrated Solobase backend

set -e

echo "Building SortedStorage with integrated backend..."

# Step 1: Build frontend
echo "Building frontend..."
npm run build

# Step 2: Copy build files to backend
echo "Copying frontend build to backend..."
rm -rf backend/build
cp -r build backend/

# Step 3: Build Go binary
echo "Building Go binary..."
cd backend
go build -o ../sortedstorage-app .
cd ..

echo "Build complete! Binary created: sortedstorage-app"
echo ""
echo "To run the application:"
echo "  DATABASE_TYPE=sqlite DATABASE_URL=file:./data.db ./sortedstorage-app"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@sortedstorage.com"
echo "  Password: AdminSecurePass2024!"