#!/bin/bash

echo "Testing upload path..."

# Login
TOKEN=$(curl -s -X POST http://localhost:8094/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}' | jq -r '.token')

echo "Token obtained: $TOKEN"

# Create test file
echo "Test file for path check" > /tmp/path-test.txt

# Upload to int_storage
echo "Uploading to int_storage..."
RESPONSE=$(curl -s -X POST "http://localhost:8094/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/path-test.txt")

echo "Response: $RESPONSE"
KEY=$(echo "$RESPONSE" | jq -r '.key')
echo "File key: $KEY"

# Check where the file was actually created
echo -e "\nFile created at:"
find ./.data/storage -name "path-test.txt" -type f 2>/dev/null

# Clean up
rm -f /tmp/path-test.txt