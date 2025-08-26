#!/bin/bash

# Start development services
echo "Starting development services..."
docker compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

# Set environment variables
export DATABASE_HOST=localhost
export DATABASE_PORT=5434
export DATABASE_NAME=dufflebagbase
export DATABASE_USER=dufflebag
export DATABASE_PASSWORD=dufflebag123
export DATABASE_SSL_MODE=disable

export S3_ENDPOINT=http://localhost:9002
export S3_ACCESS_KEY=minioadmin
export S3_SECRET_KEY=minioadmin123
export S3_BUCKET=dufflebagbase
export S3_REGION=us-east-1
export S3_USE_SSL=false

export SMTP_HOST=localhost
export SMTP_PORT=1026
export SMTP_FROM=noreply@dufflebagbase.local

export PORT=8090
export JWT_SECRET="164c51780de8b817b300447c4b4fb81c"
export SESSION_SECRET="164c51780de8b817b300447c4b4fb81c"
export LOG_LEVEL=DEBUG

export ADMIN_EMAIL=admin@dufflebagbase.local
export ADMIN_PASSWORD=admin123

# Build and run the application
echo "Building application..."
go build -o dufflebag .

echo "Starting application..."
./dufflebag