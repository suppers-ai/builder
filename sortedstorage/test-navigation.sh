#!/bin/bash

# Test script for folder navigation
echo "Testing SortedStorage folder navigation..."

# Login first
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | \
  grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "Failed to login"
  exit 1
fi

echo "Got token: ${TOKEN:0:20}..."

# Create a test folder structure
echo "2. Creating test folder structure..."

# Create root folder
curl -s -X POST http://localhost:8090/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"TestFolder","path":""}' | jq .

# Create subfolder
curl -s -X POST http://localhost:8090/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"SubFolder","path":"TestFolder"}' | jq .

# List root items
echo "3. Listing root items (should show TestFolder)..."
curl -s -X GET "http://localhost:8090/api/storage/buckets/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {name, type: .content_type}'

# List items in TestFolder
echo "4. Listing items in TestFolder (should show SubFolder)..."
curl -s -X GET "http://localhost:8090/api/storage/buckets/int_storage/objects?path=TestFolder" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {name, type: .content_type}'

# List items in SubFolder (should be empty)
echo "5. Listing items in TestFolder/SubFolder (should be empty)..."
curl -s -X GET "http://localhost:8090/api/storage/buckets/int_storage/objects?path=TestFolder/SubFolder" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {name, type: .content_type}'

echo "Test complete!"