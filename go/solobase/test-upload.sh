#!/bin/bash

# Test script for storage upload functionality

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Storage Upload Functionality"
echo "===================================="

# Set the API base URL
API_BASE="http://localhost:8091/api"

# Test credentials
EMAIL="admin@example.com"
PASSWORD="Test123456789!"

# Step 1: Login
echo -e "\n1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to login${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}Login successful${NC}"

# Step 2: Get or create a test bucket
echo -e "\n2. Getting buckets..."
BUCKETS=$(curl -s -X GET "$API_BASE/storage/buckets" \
  -H "Authorization: Bearer $TOKEN")

echo "Buckets response: $BUCKETS"

# Check if test-bucket exists, if not create it
if ! echo "$BUCKETS" | grep -q "test-bucket"; then
  echo -e "\n3. Creating test bucket..."
  CREATE_BUCKET=$(curl -s -X POST "$API_BASE/storage/buckets" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"test-bucket","public":false}')
  
  echo "Create bucket response: $CREATE_BUCKET"
fi

# Step 4: Create a test file
echo -e "\n4. Creating test file..."
echo "This is a test file for upload testing" > /tmp/test-upload.txt

# Step 5: Upload the file
echo -e "\n5. Uploading file..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE/storage/buckets/test-bucket/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-upload.txt")

echo "Upload response: $UPLOAD_RESPONSE"

# Check if upload was successful
if echo "$UPLOAD_RESPONSE" | grep -q "error"; then
  echo -e "${RED}Upload failed${NC}"
  exit 1
else
  echo -e "${GREEN}Upload successful!${NC}"
fi

# Step 6: List objects to verify
echo -e "\n6. Listing bucket objects..."
OBJECTS=$(curl -s -X GET "$API_BASE/storage/buckets/test-bucket/objects" \
  -H "Authorization: Bearer $TOKEN")

echo "Objects in bucket: $OBJECTS"

# Cleanup
rm -f /tmp/test-upload.txt

echo -e "\n${GREEN}Test completed successfully!${NC}"