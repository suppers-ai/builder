#!/bin/bash

echo "Testing Solobase Storage API with User Filtering"
echo "================================================="

# Use an existing solobase instance (you need to have one running)
# Or run: DATABASE_TYPE=sqlite DATABASE_URL=file:./test.db DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=8094 go run cmd/server/main.go

API_URL="http://localhost:8094"
EMAIL="admin@example.com"
PASSWORD="Test123456789!"

# Login to get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to login. Response:"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "Successfully logged in"
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')
echo "User ID: $USER_ID"
echo ""

# Create test folders
echo "2. Creating test folders..."
TIMESTAMP=$(date +%s)

# Create root folder
curl -s -X POST "$API_URL/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"TestFolder${TIMESTAMP}\",\"path\":\"\"}" | jq -r '.message'

# Create subfolder
curl -s -X POST "$API_URL/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"SubFolder\",\"path\":\"TestFolder${TIMESTAMP}\"}" | jq -r '.message'

echo ""

# Upload test files
echo "3. Uploading test files..."
echo "Test content for root" > /tmp/root-file.txt
echo "Test content for folder" > /tmp/folder-file.txt

# Upload to root
curl -s -X POST "$API_URL/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/root-file.txt" \
  -F "path=" | jq -r '.message // "File uploaded to root"'

# Upload to folder
curl -s -X POST "$API_URL/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/folder-file.txt" \
  -F "path=TestFolder${TIMESTAMP}" | jq -r '.message // "File uploaded to folder"'

echo ""

# Test listing
echo "4. Testing storage listing..."
echo ""
echo "Root listing (should show only items for this user):"
curl -s -X GET "$API_URL/api/storage/buckets/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | "  - \(.name) (\(.type))"'

echo ""
echo "Folder listing (should show SubFolder and folder-file.txt):"
curl -s -X GET "$API_URL/api/storage/buckets/int_storage/objects?path=TestFolder${TIMESTAMP}" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | "  - \(.name) (\(.type))"'

# Cleanup
rm -f /tmp/root-file.txt /tmp/folder-file.txt

echo ""
echo "Test complete! Check if:"
echo "1. Root listing shows only items created by this user"
echo "2. Folder navigation works correctly"
echo "3. User isolation is maintained (no items from other users)"