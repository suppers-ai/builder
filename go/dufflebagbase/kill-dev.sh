#!/bin/bash

echo "Stopping all dufflebag processes..."

# Kill all dufflebag processes
pkill -9 -f "dufflebag"

# Check if any are still running
if pgrep -f "dufflebag" > /dev/null; then
    echo "Some processes still running, force killing..."
    killall -9 dufflebag 2>/dev/null
fi

echo "Stopping Docker services..."
docker compose -f docker-compose.dev.yml down

echo "All services stopped."