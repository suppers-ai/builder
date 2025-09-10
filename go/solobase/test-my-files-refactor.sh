#!/bin/bash

# Test script for "My Files" folder refactoring

echo "Testing My Files folder creation through CloudStorage extension..."

# Start solobase server
echo "Starting solobase server..."
DATABASE_TYPE=sqlite DATABASE_URL=file:./test-myfiles.db DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=8094 timeout 3 ./solobase &
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

# Test the new CloudStorage extension endpoint
echo "Testing CloudStorage extension my-files endpoint..."
MY_FILES_RESPONSE=$(curl -s -X GET http://localhost:8094/ext/cloudstorage/api/my-files \
  -H "Authorization: Bearer $TOKEN")

echo "CloudStorage response: $MY_FILES_RESPONSE"

# Check if we got a folder_id
if echo "$MY_FILES_RESPONSE" | grep -q "folder_id"; then
  echo "✓ CloudStorage extension successfully returned My Files folder ID"
else
  echo "✗ Failed to get My Files folder from CloudStorage extension"
fi

# Test that the old route no longer exists
echo "Checking that old route is removed..."
OLD_ROUTE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:8094/api/storage/my-files \
  -H "Authorization: Bearer $TOKEN")

if [ "$OLD_ROUTE_RESPONSE" = "404" ]; then
  echo "✓ Old /api/storage/my-files route correctly returns 404"
else
  echo "✗ Old route still exists (returned HTTP $OLD_ROUTE_RESPONSE)"
fi

# Clean up
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null
rm -f test-myfiles.db

echo "Test complete!"