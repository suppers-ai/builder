#!/bin/bash
API_URL="http://localhost:8099"
EMAIL="admin@example.com" 
PASSWORD="admin123"

# Get token
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token obtained successfully"

# Create folder
FOLDER=$(curl -s -X POST "$API_URL/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"TestFolder","path":""}')

FOLDER_ID=$(echo "$FOLDER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Created folder: $FOLDER_ID"

# Create subfolder  
SUBFOLDER=$(curl -s -X POST "$API_URL/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"SubFolder\",\"parent_folder_id\":\"$FOLDER_ID\"}")

SUBFOLDER_ID=$(echo "$SUBFOLDER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Created subfolder: $SUBFOLDER_ID"

# Upload file to subfolder
echo "Test content for subfolder" > test.txt
UPLOAD=$(curl -s -X POST "$API_URL/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "parent_folder_id=$SUBFOLDER_ID")

FILE_ID=$(echo "$UPLOAD" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
FILE_PATH=$(echo "$UPLOAD" | grep -o '"object_path":"[^"]*' | cut -d'"' -f4)
PARENT_ID=$(echo "$UPLOAD" | grep -o '"parent_folder_id":"[^"]*' | cut -d'"' -f4)

echo "Uploaded file: $FILE_ID"
echo "  Object path: $FILE_PATH"
echo "  Parent ID: $PARENT_ID"

# List files in subfolder - should find the file
echo -e "\nFiles in subfolder (should find file):"
SUBFOLDER_LIST=$(curl -s "$API_URL/api/storage/buckets/int_storage/objects?parent_folder_id=$SUBFOLDER_ID" \
  -H "Authorization: Bearer $TOKEN")
if echo "$SUBFOLDER_LIST" | grep -q "$FILE_ID"; then
  echo "✓ File found in subfolder"
else
  echo "✗ File NOT found in subfolder"
fi

# List files in root - should NOT find the file
echo -e "\nFiles in root (should NOT find file):"
ROOT_LIST=$(curl -s "$API_URL/api/storage/buckets/int_storage/objects?path=" \
  -H "Authorization: Bearer $TOKEN")
if echo "$ROOT_LIST" | grep -q "$FILE_ID"; then
  echo "✗ File incorrectly appears in root"
else
  echo "✓ File correctly NOT in root"
fi

# Test download
echo -e "\nTesting download:"
HTTP_CODE=$(curl -s -w "%{http_code}" -o downloaded.txt "$API_URL/api/storage/buckets/int_storage/objects/$FILE_ID/download" \
  -H "Authorization: Bearer $TOKEN")
  
if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ Download successful (HTTP $HTTP_CODE)"
  if diff test.txt downloaded.txt > /dev/null; then
    echo "✓ Content matches"
  else
    echo "✗ Content differs"
  fi
else
  echo "✗ Download failed (HTTP $HTTP_CODE)"
fi

# Clean up
rm -f test.txt downloaded.txt
