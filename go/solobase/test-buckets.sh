#!/bin/bash

PORT=8095
BASE_URL="http://localhost:$PORT"

echo "Testing storage buckets..."

# Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Test123456789!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:20}..."

# Check buckets
echo -e "\n2. Checking buckets..."
curl -s "$BASE_URL/api/storage/buckets" | jq -r '.[] | .name'

# Upload to int_storage
echo -e "\n3. Uploading to int_storage..."
echo "Internal test file" > /tmp/int_test.txt
curl -s -X POST "$BASE_URL/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/int_test.txt" | jq '.'

# Upload to ext_storage
echo -e "\n4. Uploading to ext_storage..."
echo "Extension test file" > /tmp/ext_test.txt
curl -s -X POST "$BASE_URL/api/storage/buckets/ext_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/ext_test.txt" | jq '.'

# Check objects in int_storage
echo -e "\n5. Objects in int_storage..."
curl -s "$BASE_URL/api/storage/buckets/int_storage/objects" | jq '.'

# Check objects in ext_storage
echo -e "\n6. Objects in ext_storage..."
curl -s "$BASE_URL/api/storage/buckets/ext_storage/objects" | jq '.'

# Clean up
rm -f /tmp/int_test.txt /tmp/ext_test.txt

echo -e "\nDone!"