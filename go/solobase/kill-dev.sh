#!/bin/bash

echo "Stopping all solobase processes..."

# Kill all solobase processes
pkill -9 -f "solobase"

# Check if any are still running
if pgrep -f "solobase" > /dev/null; then
    echo "Some processes still running, force killing..."
    killall -9 solobase 2>/dev/null
fi

echo "Stopping Docker services..."
docker compose -f docker-compose.dev.yml down

echo "All services stopped."