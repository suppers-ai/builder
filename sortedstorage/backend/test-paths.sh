#!/bin/bash

# Test script to verify userId/appId in storage paths

API_URL="http://localhost:8097"
EMAIL="admin@example.com"
PASSWORD="Test123456789!"

echo "Testing storage path structure with userId and appId..."

# Start the server
echo "Starting server..."
rm -f test.db
DATABASE_TYPE=sqlite DATABASE_URL=file:./test.db DEFAULT_ADMIN_EMAIL="$EMAIL" DEFAULT_ADMIN_PASSWORD="$PASSWORD" PORT=8097 ./sortedstorage-test &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Get auth token
echo "Getting auth token..."
TOKEN=$(curl -s -X POST "$API_URL/auth/token" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r .token)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to get auth token"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

echo "Token obtained successfully"

# Get user ID from token (decode JWT)
USER_ID=$(echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq -r .user_id)
echo "User ID: $USER_ID"

# Create a test folder
echo "Creating test folder..."
FOLDER_RESPONSE=$(curl -s -X POST "$API_URL/api/storage/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"testfolder","path":""}')
echo "Folder response: $FOLDER_RESPONSE"

# Upload a test file
echo "Uploading test file..."
echo "Test content" > test.txt
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/storage/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "path=testfolder")
echo "Upload response: $UPLOAD_RESPONSE"

# Check the database to see what paths were stored
echo "Checking database for stored paths..."
sqlite3 test.db "SELECT id, object_path, object_name, user_id FROM storage_objects;" | column -t -s '|'

# Get objects to verify path filtering
echo "Getting objects from API..."
OBJECTS=$(curl -s -X GET "$API_URL/api/storage/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN")
echo "Objects: $OBJECTS"

# Clean up
kill $SERVER_PID 2>/dev/null
rm -f test.txt test.db

echo "Test completed"