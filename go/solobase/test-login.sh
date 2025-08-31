#!/bin/bash

# Start the server
DATABASE_TYPE=sqlite \
DATABASE_URL=file:./test.db \
DEFAULT_ADMIN_EMAIL="admin@example.com" \
DEFAULT_ADMIN_PASSWORD="Test123456789!" \
PORT=8092 \
./solobase > /tmp/server.log 2>&1 &

SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Test login
echo "Testing login API:"
curl -s -X POST http://localhost:8092/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Test123456789!"}'

echo ""
echo ""

# Test users endpoint
echo "Testing users API:"
curl -s http://localhost:8092/api/users

echo ""

# Kill the server
kill $SERVER_PID 2>/dev/null

echo "Test complete"
