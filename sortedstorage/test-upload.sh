#!/bin/bash

# Test upload functionality
echo "Testing upload to Solobase backend..."

# Create a test file
echo "Test file content" > test-upload.txt

# Get auth token first
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8095/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Failed to get auth token"
  exit 1
fi

# Try to upload file
echo ""
echo "2. Uploading file..."
UPLOAD_RESPONSE=$(curl -v -X POST http://localhost:8095/api/storage/buckets/int_storage/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-upload.txt")

echo "Upload response: $UPLOAD_RESPONSE"

# Clean up
rm test-upload.txt