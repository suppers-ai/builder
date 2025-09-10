#!/bin/bash

# Test script to verify app_id is set correctly on My Files folder

echo "Testing app_id on My Files folder creation..."

# Start solobase server with a specific app_id
echo "Starting solobase server with APP_ID=testapp..."
DATABASE_TYPE=sqlite DATABASE_URL=file:./test-appid.db APP_ID=testapp DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=8094 timeout 3 ./solobase 2>&1 | tee server.log &
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

echo "Login successful."

# Get root folders
echo "Getting root folders..."
FOLDERS_RESPONSE=$(curl -s -X GET "http://localhost:8094/api/storage/buckets/int_storage/objects?parent_folder_id=" \
  -H "Authorization: Bearer $TOKEN")

echo "Root folders response: $FOLDERS_RESPONSE"

# Check if My Files folder exists and has correct app_id
if echo "$FOLDERS_RESPONSE" | grep -q '"name":"My Files"'; then
  echo "✓ My Files folder found"
  
  # Check the database directly to verify app_id
  echo "Checking app_id in database..."
  sqlite3 test-appid.db "SELECT app_id, object_name, user_id FROM storage_objects WHERE object_name='My Files';" | head -1
  
  APP_ID_IN_DB=$(sqlite3 test-appid.db "SELECT app_id FROM storage_objects WHERE object_name='My Files';" | head -1)
  
  if [ "$APP_ID_IN_DB" = "testapp" ]; then
    echo "✓ App ID correctly set to 'testapp'"
  else
    echo "✗ App ID is '$APP_ID_IN_DB' instead of 'testapp'"
  fi
else
  echo "✗ My Files folder not found"
fi

# Clean up
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null
rm -f test-appid.db

echo "Test complete!"