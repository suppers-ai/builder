#!/bin/bash

# Default to SQLite, but allow override with command line argument
DATABASE_MODE=${1:-sqlite}

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
    
    if [ "$DATABASE_MODE" = "postgres" ] || [ "$DATABASE_MODE" = "postgresql" ]; then
        echo ""
        echo "Stopping Docker services..."
        docker compose down
    fi
    
    echo "Cleanup complete"
    exit 0
}

# Trap signals for cleanup
trap cleanup INT TERM EXIT

# Display mode
echo "========================================="
echo "DuffleBagBase Development Server"
echo "========================================="
echo "Database Mode: $DATABASE_MODE"
echo ""

# Set database environment variables based on mode
if [ "$DATABASE_MODE" = "postgres" ] || [ "$DATABASE_MODE" = "postgresql" ]; then
    echo "Using PostgreSQL database..."
    echo "Starting Docker services..."
    echo ""
    
    # Start docker compose services
    docker compose up -d postgres mailhog
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if docker compose exec -T postgres pg_isready -U dufflebag -d dufflebagbase &>/dev/null; then
            echo "PostgreSQL is ready!"
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    
    export DATABASE_TYPE=postgres
    export DATABASE_URL="postgresql://dufflebag:dufflebag123@localhost:5432/dufflebagbase?sslmode=disable"
    
elif [ "$DATABASE_MODE" = "sqlite" ]; then
    echo "Using SQLite database..."
    echo "Database file: ./.data/dufflebag.db"
    echo ""
    
    export DATABASE_TYPE=sqlite
    export DATABASE_URL="./.data/dufflebag.db"
    
    # Create .data directory if it doesn't exist
    mkdir -p ./.data
    
else
    echo "Invalid database mode: $DATABASE_MODE"
    echo "Usage: ./run-dev.sh [sqlite|postgres]"
    echo "Default: sqlite"
    exit 1
fi

# Common environment variables
export PORT=${PORT:-8091}
export ENVIRONMENT=development
export LOG_LEVEL=DEBUG

# Storage settings (local by default)
export STORAGE_TYPE=local
export LOCAL_STORAGE_PATH=./storage

# Mail settings (use MailHog if available)
export SMTP_HOST=localhost
export SMTP_PORT=1025
export SMTP_FROM=noreply@dufflebagbase.local

# Security - Generate secure secrets if not provided
if [ -z "$JWT_SECRET" ]; then
    export JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-jwt-secret-please-change-in-production")
fi

if [ -z "$SESSION_SECRET" ]; then
    export SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-session-secret-please-change-in-production")
fi

# Admin credentials with a secure default password
export DEFAULT_ADMIN_EMAIL=${DEFAULT_ADMIN_EMAIL:-admin@example.com}
export DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD:-AdminSecurePass2024!}

# Display configuration
echo "Configuration:"
echo "  Port: $PORT"
echo "  Admin Email: $DEFAULT_ADMIN_EMAIL"
echo "  Admin Password: $DEFAULT_ADMIN_PASSWORD"
echo "  Storage: $STORAGE_TYPE ($LOCAL_STORAGE_PATH)"
echo ""

# Check if templ is installed and generate templates
if command -v templ &> /dev/null; then
    echo "Generating templates..."
    templ generate
elif [ -f ~/go/bin/templ ]; then
    echo "Generating templates..."
    ~/go/bin/templ generate
else
    echo "Warning: templ not found. Skipping template generation."
    echo "Install with: go install github.com/a-h/templ/cmd/templ@latest"
fi

# Build and run the application
echo ""
echo "Building application..."
go build -o dufflebag .

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo ""
echo "========================================="
echo "Starting application..."
echo "========================================="
echo ""
echo "Dashboard URL: http://localhost:$PORT"
echo "Login URL: http://localhost:$PORT/auth/login"
echo ""
echo "Press Ctrl+C to stop the application"
echo "========================================="
echo ""

# Run the application in foreground and capture its PID
./dufflebag &
APP_PID=$!

# Wait for the application to finish
wait $APP_PID