#!/bin/bash

echo "Testing sorted storage paths..."

# Login
TOKEN=$(curl -s -X POST http://localhost:8093/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}' | jq -r '.token')

echo "Token obtained"

# Create test file
echo "Test file for sorted storage" > /tmp/sorted-test.txt

# Upload to int_storage
echo "Uploading to int_storage..."
RESPONSE=$(curl -s -X POST "http://localhost:8093/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/sorted-test.txt")

echo "Response: $RESPONSE"
KEY=$(echo "$RESPONSE" | jq -r '.key')
echo "File key: $KEY"

# Check where the file was actually created
echo -e "\nFile created at:"
find /home/joris/Projects/suppers-ai/builder/sortedstorage/.data/storage -name "sorted-test.txt" -type f 2>/dev/null

# Clean up
rm -f /tmp/sorted-test.txt