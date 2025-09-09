#!/bin/bash

echo "Full Navigation Test with Files"
echo "================================"

# Get auth token
TOKEN=$(curl -s -X POST http://localhost:8091/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

if [ -z "$TOKEN" ]; then
  echo "Failed to get auth token"
  exit 1
fi

echo "Token obtained"
echo ""

# Create folder structure
TIMESTAMP=$(date +%s)

echo "Creating folder structure..."
# Root folder
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Project${TIMESTAMP}\",\"path\":\"\"}" | jq -r '.message'

# Subfolder
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Documents\",\"path\":\"Project${TIMESTAMP}\"}" | jq -r '.message'

# Another subfolder
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Images\",\"path\":\"Project${TIMESTAMP}\"}" | jq -r '.message'

echo ""
echo "Uploading test files..."

# Create test files
echo "This is a test document" > /tmp/test-doc.txt
echo "Another test file" > /tmp/test-file.txt
echo '{"test": "data"}' > /tmp/test.json

# Upload to root
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-doc.txt" \
  -F "path=" | jq -r '.message'

# Upload to Project folder
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-file.txt" \
  -F "path=Project${TIMESTAMP}" | jq -r '.message'

# Upload to Documents subfolder
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.json" \
  -F "path=Project${TIMESTAMP}/Documents" | jq -r '.message'

echo ""
echo "Testing navigation..."
echo "===================="

echo ""
echo "1. ROOT - Should show Project${TIMESTAMP} folder and test-doc.txt:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | "  - \(.name) (\(.type))"'

echo ""
echo "2. PROJECT FOLDER - Should show Documents, Images folders and test-file.txt:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=Project${TIMESTAMP}" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | "  - \(.name) (\(.type))"'

echo ""
echo "3. DOCUMENTS FOLDER - Should show only test.json:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=Project${TIMESTAMP}/Documents" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | "  - \(.name) (\(.type))"'

echo ""
echo "4. IMAGES FOLDER - Should be empty:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=Project${TIMESTAMP}/Images" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | "  - \(.name) (\(.type))"'

# Cleanup
rm -f /tmp/test-doc.txt /tmp/test-file.txt /tmp/test.json

echo ""
echo "Test complete!"
echo "=============="
echo "Verify that:"
echo "1. Each folder shows only its direct contents"
echo "2. No items from parent or sibling folders appear"
echo "3. Navigation is working correctly at all levels"