#!/bin/bash

# This script prepares the build context for Docker by vendoring dependencies

echo "Vendoring dependencies..."
go mod vendor

echo "Building Docker image..."
docker build -t solobase:latest .

echo "Cleaning up vendor directory..."
rm -rf vendor

echo "Docker image built successfully!"