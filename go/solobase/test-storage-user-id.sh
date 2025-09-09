#!/bin/bash

# Test storage user_id functionality

PORT=8095
BASE_URL="http://localhost:$PORT"

echo "Testing storage user_id functionality in solobase..."

# Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Test123456789!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to login"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Logged in successfully. User ID: $USER_ID"

# Create the default bucket first
echo -e "\n2. Creating default bucket..."
BUCKET_RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "default",
    "public": false
  }')

echo "Bucket creation response: $BUCKET_RESPONSE"

# Create a test folder
echo -e "\n3. Creating a test folder..."
FOLDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/buckets/default/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "test-folder-with-userid"
  }')

echo "Folder creation response: $FOLDER_RESPONSE"

# Upload a test file
echo -e "\n4. Uploading a test file..."
echo "This is a test file" > /tmp/test-upload.txt

UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/buckets/default/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-upload.txt")

echo "Upload response: $UPLOAD_RESPONSE"

# Check storage_objects table for user_id
echo -e "\n5. Checking storage_objects table for user_id..."
QUERY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT id, bucket_name, object_key, user_id FROM storage_objects ORDER BY created_at DESC LIMIT 5"
  }')

echo "Storage objects with user_id:"
echo "$QUERY_RESPONSE" | jq '.'

# Check if user_id is set
echo -e "\n6. Verifying user_id is set..."
# The response format is rows array, not data object
ACTUAL_USER_ID=$(echo "$QUERY_RESPONSE" | jq -r '.rows[0][3]' 2>/dev/null)
if [ "$ACTUAL_USER_ID" = "$USER_ID" ]; then
  echo "✅ user_id is properly set to: $USER_ID"
else
  echo "❌ user_id is NOT set or doesn't match expected value"
  echo "Expected: $USER_ID"
  echo "Got: $ACTUAL_USER_ID"
fi

# Clean up
rm -f /tmp/test-upload.txt

echo -e "\nDone!"