#!/bin/bash

# Test script to verify parent_folder_id is correctly set when uploading files to subfolders

PORT=8093
API_URL="http://localhost:$PORT/api"
EMAIL="admin@example.com"
PASSWORD="admin123"

echo "=== Testing Parent Folder Upload ==="
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

if [ -z "$FOLDER_ID" ]; then
  echo "❌ Failed to create folder"
  echo "Response: $CREATE_RESP"
  exit 1
fi

echo "✅ Created folder: $FOLDER_NAME (ID: $FOLDER_ID)"
echo

# 3. Create a test file
echo "3. Creating test file..."
TEST_FILE="/tmp/test-upload-$(date +%s).txt"
echo "Test content for parent folder upload test" > "$TEST_FILE"

# 4. Upload file to the subfolder
echo "4. Uploading file to subfolder..."
UPLOAD_RESP=$(curl -s -X POST "$API_URL/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_FILE" \
  -F "parent_folder_id=$FOLDER_ID")

FILE_ID=$(echo "$UPLOAD_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
PARENT_ID=$(echo "$UPLOAD_RESP" | grep -o '"parent_folder_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$FILE_ID" ]; then
  echo "❌ Upload failed"
  echo "Response: $UPLOAD_RESP"
  rm "$TEST_FILE"
  exit 1
fi

echo "✅ File uploaded (ID: $FILE_ID)"
echo

# 5. Verify parent_folder_id was set correctly
echo "5. Verifying parent_folder_id..."
if [ "$PARENT_ID" = "$FOLDER_ID" ]; then
  echo "✅ parent_folder_id correctly set to: $PARENT_ID"
else
  echo "❌ parent_folder_id mismatch!"
  echo "   Expected: $FOLDER_ID"
  echo "   Got: $PARENT_ID"
  rm "$TEST_FILE"
  exit 1
fi
echo

# 6. List files in the folder to confirm
echo "6. Listing files in folder..."
LIST_RESP=$(curl -s -X GET "$API_URL/storage/buckets/int_storage/objects?parent_folder_id=$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LIST_RESP" | grep -q "$FILE_ID"; then
  echo "✅ File found in subfolder listing"
else
  echo "❌ File not found in subfolder listing"
  echo "Response: $LIST_RESP"
fi

# Cleanup
rm "$TEST_FILE"

echo
echo "=== Test Complete ==="