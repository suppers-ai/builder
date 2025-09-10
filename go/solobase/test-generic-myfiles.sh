#!/bin/bash

# Test script for generic My Files folder implementation

echo "Testing generic My Files folder creation..."

# Start solobase server
echo "Starting solobase server..."
DATABASE_TYPE=sqlite DATABASE_URL=file:./test-generic.db DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=8094 timeout 3 ./solobase &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Login to get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8094/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Test123456789!"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "Failed to login"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Login successful. Token obtained."

# Get root folders (parent_folder_id is null)
echo "Getting root folders..."
FOLDERS_RESPONSE=$(curl -s -X GET "http://localhost:8094/api/storage/buckets/int_storage/objects?parent_folder_id=" \
  -H "Authorization: Bearer $TOKEN")

echo "Root folders response: $FOLDERS_RESPONSE"

# Check if My Files folder exists
if echo "$FOLDERS_RESPONSE" | grep -q '"name":"My Files"'; then
  echo "✓ My Files folder found in root folders"
  
  # Extract the ID
  MY_FILES_ID=$(echo "$FOLDERS_RESPONSE" | grep -o '"id":"[^"]*".*"name":"My Files"' | grep -o '"id":"[^"]*' | sed 's/"id":"//')
  echo "✓ My Files folder ID: $MY_FILES_ID"
else
  echo "✗ My Files folder not found in root folders"
fi

# Test that the old my-files endpoint doesn't exist
echo "Checking that special my-files endpoint is removed..."
OLD_ROUTE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:8094/api/storage/my-files \
  -H "Authorization: Bearer $TOKEN")

if [ "$OLD_ROUTE_RESPONSE" = "404" ]; then
  echo "✓ Special /api/storage/my-files endpoint correctly returns 404"
else
  echo "✗ Special endpoint still exists (returned HTTP $OLD_ROUTE_RESPONSE)"
fi

# Clean up
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null
rm -f test-generic.db

echo "Test complete!"