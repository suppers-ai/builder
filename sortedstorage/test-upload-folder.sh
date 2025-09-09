#!/bin/bash

# Test upload and folder creation

echo "Testing folder creation and file upload..."

# Login first
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:8093/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to login"
  exit 1
fi

echo "Got token: ${TOKEN:0:20}..."

# Test folder creation
echo -e "\n2. Creating a test folder..."
FOLDER_RESPONSE=$(curl -s -X POST "http://localhost:8093/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "TestFolder"}')

echo "Folder creation response: $FOLDER_RESPONSE"

# Test file upload
echo -e "\n3. Uploading a test file..."
echo "Test file content" > /tmp/test-upload.txt

UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:8093/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-upload.txt" \
  -F "path=")

echo "Upload response: $UPLOAD_RESPONSE"

# List files to verify
echo -e "\n4. Listing files..."
curl -s -X GET "http://localhost:8093/api/storage/buckets/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

rm /tmp/test-upload.txt