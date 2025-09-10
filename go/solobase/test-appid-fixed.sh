#!/bin/bash

# Test script to verify app_id is set correctly on My Files folder

echo "Testing app_id on My Files folder creation..."

# Clean up
rm -f test-appid.db

# Start solobase server with a specific app_id
echo "Starting solobase server with APP_ID=testapp..."
env DATABASE_TYPE=sqlite DATABASE_URL=file:./test-appid.db APP_ID=testapp DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=8096 ./solobase 2>&1 | tee server.log &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Login to get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8096/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Test123456789!\"}")

echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "Failed to login"
  echo "Response: $LOGIN_RESPONSE"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

echo "Login successful, token received."

# Get root folders
echo "Getting root folders..."
FOLDERS_RESPONSE=$(curl -s -X GET "http://localhost:8096/api/storage/buckets/int_storage/objects?parent_folder_id=" \
  -H "Authorization: Bearer $TOKEN")

echo "Root folders response: $FOLDERS_RESPONSE"

# Check if My Files folder exists
if echo "$FOLDERS_RESPONSE" | grep -q '"name":"My Files"'; then
  echo "✓ My Files folder found"
  
  # Extract folder ID
  FOLDER_ID=$(echo "$FOLDERS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
  echo "Folder ID: $FOLDER_ID"
  
  # Check the database directly using Go
  echo "Checking app_id in database..."
  go run tests/check-appid-db.go
else
  echo "✗ My Files folder not found"
fi

# Check server logs
echo ""
echo "=== Server logs for hook execution ==="
grep -E "PostLogin|setupUserResourcesHook|appID|My Files" server.log || echo "No relevant logs found"

# Clean up
echo ""
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null
sleep 1

echo "Test complete!"