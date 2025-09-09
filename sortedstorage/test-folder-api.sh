#!/bin/bash

# Test script to check API response for folders

PORT=8093
API_URL="http://localhost:$PORT/api"
EMAIL="admin@example.com"
PASSWORD="admin123"

echo "=== Testing Folder API Response ==="
echo

# 1. Login
echo "1. Logging in..."
LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Logged in successfully"
echo

# 2. Create a test folder
echo "2. Creating test folder..."
FOLDER_NAME="test-folder-$(date +%s)"
CREATE_RESP=$(curl -s -X POST "$API_URL/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$FOLDER_NAME\"}")

FOLDER_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Created folder: $FOLDER_NAME (ID: $FOLDER_ID)"
echo "Full response: $CREATE_RESP"
echo

# 3. List objects and show raw response
echo "3. Listing objects (raw response)..."
echo "===================="
curl -s -X GET "$API_URL/storage/buckets/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo "===================="
echo

# 4. Get specific folder details if we have an ID
if [ ! -z "$FOLDER_ID" ]; then
  echo "4. Getting folder details for ID: $FOLDER_ID"
  echo "===================="
  curl -s -X GET "$API_URL/storage/buckets/int_storage/objects?parent_folder_id=$FOLDER_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
  echo "===================="
fi