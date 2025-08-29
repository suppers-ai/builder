#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down application..."
    
    # Kill the dufflebag process if it's running
    if [ ! -z "$APP_PID" ]; then
        # First try graceful shutdown with SIGTERM
        kill -TERM $APP_PID 2>/dev/null
        
        # Wait up to 5 seconds for graceful shutdown
        for i in {1..5}; do
            if ! kill -0 $APP_PID 2>/dev/null; then
                echo "Application stopped gracefully"
                break
            fi
            echo "Waiting for application to stop... ($i/5)"
            sleep 1
        done
        
        # Force kill if still running
        if kill -0 $APP_PID 2>/dev/null; then
            echo "Force stopping application..."
            kill -9 $APP_PID 2>/dev/null
        fi
    fi
    
    # Also kill any remaining dufflebag processes
    pkill -f "dufflebag" 2>/dev/null
    
    echo "Stopping development services..."
    docker compose -f docker-compose.dev.yml down
    
    echo "Cleanup complete"
    exit 0
}

# Trap signals for cleanup
trap cleanup INT TERM EXIT

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

export PORT=8091
export JWT_SECRET="164c51780de8b817b300447c4b4fb81c"
export SESSION_SECRET="164c51780de8b817b300447c4b4fb81c"
export LOG_LEVEL=DEBUG

export DEFAULT_ADMIN_EMAIL=admin@example.com
export DEFAULT_ADMIN_PASSWORD=solobaseadmin123

# Build and run the application
echo "Building application..."
go build -o dufflebag .

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Starting application..."
echo "Press Ctrl+C to stop the application and services"
echo "----------------------------------------"

# Run the application in foreground and capture its PID
./dufflebag &
APP_PID=$!

# Wait for the application to finish
wait $APP_PID