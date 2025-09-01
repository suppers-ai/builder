#!/bin/bash

echo "Testing CloudStorage Extension Compilation and Registration"
echo "============================================================"

# Clean up previous test files
rm -f test.db test.db-shm test.db-wal

# Start the server in background
echo "Starting server with CloudStorage extension..."
env DATABASE_TYPE=sqlite DATABASE_URL=file:./test.db \
    DEFAULT_ADMIN_EMAIL="admin@example.com" \
    DEFAULT_ADMIN_PASSWORD="Test123456789!" \
    PORT=8094 \
    ./solobase > /tmp/solobase.log 2>&1 &

SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "ERROR: Server failed to start"
    echo "Last 50 lines of log:"
    tail -50 /tmp/solobase.log
    exit 1
fi

# Check if CloudStorage routes are available
echo "Checking CloudStorage API endpoints..."

# Test buckets endpoint
echo -n "Testing /api/buckets endpoint: "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8094/api/buckets)
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo "✓ Endpoint exists (HTTP $RESPONSE)"
else
    echo "✗ Failed (HTTP $RESPONSE)"
fi

# Test stats endpoint
echo -n "Testing /api/stats endpoint: "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8094/api/stats)
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo "✓ Endpoint exists (HTTP $RESPONSE)"
else
    echo "✗ Failed (HTTP $RESPONSE)"
fi

# Check logs for CloudStorage initialization
echo ""
echo "Checking logs for CloudStorage messages:"
grep -i cloudstorage /tmp/solobase.log | head -5

# Clean up
echo ""
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
rm -f test.db test.db-shm test.db-wal

echo ""
echo "Test complete!"