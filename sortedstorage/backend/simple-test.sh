#!/bin/bash
API_URL="http://localhost:8097"
EMAIL="admin@example.com" 
PASSWORD='Test123456789!'

# Login
echo "Logging in..."
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Create folder
echo "Creating folder..."
FOLDER=$(curl -s -X POST "$API_URL/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"TestFolder","path":""}')

FOLDER_ID=$(echo "$FOLDER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Folder ID: $FOLDER_ID"

# Create subfolder
echo "Creating subfolder..."
SUBFOLDER=$(curl -s -X POST "$API_URL/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"SubFolder\",\"parent_folder_id\":\"$FOLDER_ID\"}")

SUBFOLDER_ID=$(echo "$SUBFOLDER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Subfolder ID: $SUBFOLDER_ID"

# Upload file to subfolder
echo "Test content" > test.txt
echo "Uploading file to subfolder..."
UPLOAD=$(curl -s -X POST "$API_URL/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "parent_folder_id=$SUBFOLDER_ID")

echo "Upload response: $UPLOAD"

FILE_ID=$(echo "$UPLOAD" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "File ID: $FILE_ID"

# List files in subfolder
echo "Files in subfolder:"
curl -s "$API_URL/api/storage/buckets/int_storage/objects?parent_folder_id=$SUBFOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Clean up
rm -f test.txt
