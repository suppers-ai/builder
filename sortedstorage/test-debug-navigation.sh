#!/bin/bash

echo "Debug Navigation Test"
echo "===================="

# Get a fresh token
echo "Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:8091/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

if [ -z "$TOKEN" ]; then
  echo "Failed to get auth token"
  exit 1
fi

echo "Token obtained"
echo ""

# Create a test folder structure
echo "Creating test folders with unique names..."
TIMESTAMP=$(date +%s)

# Create root folder
echo "Creating RootTest${TIMESTAMP}..."
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"RootTest${TIMESTAMP}\",\"path\":\"\"}" | jq '.'

# Create subfolder
echo "Creating SubTest${TIMESTAMP} inside RootTest${TIMESTAMP}..."
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"SubTest${TIMESTAMP}\",\"path\":\"RootTest${TIMESTAMP}\"}" | jq '.'

echo ""
echo "Testing navigation..."
echo "--------------------"

echo "1. List root (should include RootTest${TIMESTAMP}):"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | "\(.name) (type: \(.type), path: \(.fullPath))"'

echo ""
echo "2. Navigate to RootTest${TIMESTAMP} (should show SubTest${TIMESTAMP}):"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=RootTest${TIMESTAMP}" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | "\(.name) (type: \(.type), path: \(.fullPath))"'

echo ""
echo "3. Navigate to a non-existent path:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=DoesNotExist${TIMESTAMP}" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo "Testing complete. Check if:"
echo "1. RootTest${TIMESTAMP} appears in root listing"
echo "2. SubTest${TIMESTAMP} appears when navigating to RootTest${TIMESTAMP}"
echo "3. Empty array returned for non-existent path"