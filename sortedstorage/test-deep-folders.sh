#!/bin/bash

# Test script to verify deep folder structure support

PORT=8093
API_URL="http://localhost:$PORT/api"
EMAIL="admin@example.com"
PASSWORD="admin123"

echo "=== Testing Deep Folder Structure ==="
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

# 2. Create Level 1 folder
echo "2. Creating Level 1 folder..."
FOLDER1_NAME="level1-$(date +%s)"
CREATE_RESP=$(curl -s -X POST "$API_URL/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$FOLDER1_NAME\"}")

FOLDER1_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$FOLDER1_ID" ]; then
  echo "❌ Failed to create Level 1 folder"
  echo "Response: $CREATE_RESP"
  exit 1
fi

echo "✅ Created Level 1: $FOLDER1_NAME (ID: $FOLDER1_ID)"
echo

# 3. Create Level 2 folder inside Level 1
echo "3. Creating Level 2 folder inside Level 1..."
FOLDER2_NAME="level2-$(date +%s)"
CREATE_RESP=$(curl -s -X POST "$API_URL/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$FOLDER2_NAME\",\"parent_folder_id\":\"$FOLDER1_ID\"}")

FOLDER2_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$FOLDER2_ID" ]; then
  echo "❌ Failed to create Level 2 folder"
  echo "Response: $CREATE_RESP"
  exit 1
fi

echo "✅ Created Level 2: $FOLDER2_NAME (ID: $FOLDER2_ID)"
echo

# 4. Create Level 3 folder inside Level 2
echo "4. Creating Level 3 folder inside Level 2..."
FOLDER3_NAME="level3-$(date +%s)"
CREATE_RESP=$(curl -s -X POST "$API_URL/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$FOLDER3_NAME\",\"parent_folder_id\":\"$FOLDER2_ID\"}")

FOLDER3_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$FOLDER3_ID" ]; then
  echo "❌ Failed to create Level 3 folder"
  echo "Response: $CREATE_RESP"
  exit 1
fi

echo "✅ Created Level 3: $FOLDER3_NAME (ID: $FOLDER3_ID)"
echo

# 5. Create Level 4 folder inside Level 3
echo "5. Creating Level 4 folder inside Level 3..."
FOLDER4_NAME="level4-$(date +%s)"
CREATE_RESP=$(curl -s -X POST "$API_URL/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$FOLDER4_NAME\",\"parent_folder_id\":\"$FOLDER3_ID\"}")

FOLDER4_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$FOLDER4_ID" ]; then
  echo "❌ Failed to create Level 4 folder"
  echo "Response: $CREATE_RESP"
  exit 1
fi

echo "✅ Created Level 4: $FOLDER4_NAME (ID: $FOLDER4_ID)"
echo

# 6. Upload a file to Level 4 folder
echo "6. Uploading file to Level 4 folder..."
TEST_FILE="/tmp/test-deep-$(date +%s).txt"
echo "Test file in deep folder structure at level 4" > "$TEST_FILE"

UPLOAD_RESP=$(curl -s -X POST "$API_URL/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_FILE" \
  -F "parent_folder_id=$FOLDER4_ID")

FILE_ID=$(echo "$UPLOAD_RESP" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
PARENT_ID=$(echo "$UPLOAD_RESP" | grep -o '"parent_folder_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$FILE_ID" ]; then
  echo "❌ Upload failed"
  echo "Response: $UPLOAD_RESP"
  rm "$TEST_FILE"
  exit 1
fi

echo "✅ File uploaded to Level 4 (ID: $FILE_ID)"
echo

# 7. Verify parent_folder_id is correct
echo "7. Verifying parent_folder_id..."
if [ "$PARENT_ID" = "$FOLDER4_ID" ]; then
  echo "✅ parent_folder_id correctly set to Level 4 folder: $PARENT_ID"
else
  echo "❌ parent_folder_id mismatch!"
  echo "   Expected: $FOLDER4_ID"
  echo "   Got: $PARENT_ID"
  rm "$TEST_FILE"
  exit 1
fi
echo

# 8. List files in each folder level to verify structure
echo "8. Verifying folder structure..."

echo "  Level 1 contents:"
LIST_RESP=$(curl -s -X GET "$API_URL/storage/buckets/int_storage/objects?parent_folder_id=$FOLDER1_ID" \
  -H "Authorization: Bearer $TOKEN")
if echo "$LIST_RESP" | grep -q "$FOLDER2_ID"; then
  echo "  ✅ Level 2 folder found in Level 1"
else
  echo "  ❌ Level 2 folder not found in Level 1"
fi

echo "  Level 2 contents:"
LIST_RESP=$(curl -s -X GET "$API_URL/storage/buckets/int_storage/objects?parent_folder_id=$FOLDER2_ID" \
  -H "Authorization: Bearer $TOKEN")
if echo "$LIST_RESP" | grep -q "$FOLDER3_ID"; then
  echo "  ✅ Level 3 folder found in Level 2"
else
  echo "  ❌ Level 3 folder not found in Level 2"
fi

echo "  Level 3 contents:"
LIST_RESP=$(curl -s -X GET "$API_URL/storage/buckets/int_storage/objects?parent_folder_id=$FOLDER3_ID" \
  -H "Authorization: Bearer $TOKEN")
if echo "$LIST_RESP" | grep -q "$FOLDER4_ID"; then
  echo "  ✅ Level 4 folder found in Level 3"
else
  echo "  ❌ Level 4 folder not found in Level 3"
fi

echo "  Level 4 contents:"
LIST_RESP=$(curl -s -X GET "$API_URL/storage/buckets/int_storage/objects?parent_folder_id=$FOLDER4_ID" \
  -H "Authorization: Bearer $TOKEN")
if echo "$LIST_RESP" | grep -q "$FILE_ID"; then
  echo "  ✅ File found in Level 4"
else
  echo "  ❌ File not found in Level 4"
fi

# Cleanup
rm "$TEST_FILE"

echo
echo "=== Deep Folder Structure Test Complete ==="
echo "Successfully created 4-level deep folder structure with file upload!"