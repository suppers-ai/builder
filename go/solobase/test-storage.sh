#!/bin/bash

BASE_URL="http://localhost:8092"
EMAIL="admin@example.com"
PASSWORD="Test123456789!"

echo "Testing Storage Functionality"
echo "=============================="

# 1. Login
echo "1. Logging in..."
SESSION=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c - | grep -o 'session=[^;]*' | cut -d= -f2)

if [ -z "$SESSION" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"

# 2. Access storage page
echo -e "\n2. Accessing storage page..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/storage" \
  -H "Cookie: session=$SESSION")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Storage page accessible"
else
  echo "❌ Failed to access storage page (HTTP $HTTP_CODE)"
fi

# 3. Create a bucket
echo -e "\n3. Creating test bucket..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/buckets" \
  -H "Cookie: session=$SESSION" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-bucket","public":false}')

if echo "$CREATE_RESPONSE" | grep -q "success\|created"; then
  echo "✅ Bucket created successfully"
else
  echo "❌ Failed to create bucket: $CREATE_RESPONSE"
fi

# 4. List buckets on storage page
echo -e "\n4. Checking if bucket appears on storage page..."
STORAGE_PAGE=$(curl -s "$BASE_URL/storage" \
  -H "Cookie: session=$SESSION")

if echo "$STORAGE_PAGE" | grep -q "test-bucket"; then
  echo "✅ Bucket appears on storage page"
else
  echo "❌ Bucket not visible on storage page"
fi

# 5. Navigate to bucket
echo -e "\n5. Navigating to bucket..."
BUCKET_PAGE=$(curl -s "$BASE_URL/storage?bucket=test-bucket" \
  -H "Cookie: session=$SESSION")

if echo "$BUCKET_PAGE" | grep -q "test-bucket"; then
  echo "✅ Can navigate to bucket"
else
  echo "❌ Failed to navigate to bucket"
fi

# 6. Create a folder in the bucket
echo -e "\n6. Creating folder in bucket..."
FOLDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/folders" \
  -H "Cookie: session=$SESSION" \
  -H "Content-Type: application/json" \
  -d '{"bucket":"test-bucket","path":"","name":"test-folder"}')

if echo "$FOLDER_RESPONSE" | grep -q "success\|created"; then
  echo "✅ Folder created successfully"
else
  echo "❌ Failed to create folder: $FOLDER_RESPONSE"
fi

# 7. Upload a test file
echo -e "\n7. Uploading test file..."
echo "Hello, Storage!" > /tmp/test-file.txt
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/upload" \
  -H "Cookie: session=$SESSION" \
  -F "bucket=test-bucket" \
  -F "path=" \
  -F "file=@/tmp/test-file.txt")

if echo "$UPLOAD_RESPONSE" | grep -q "success\|created"; then
  echo "✅ File uploaded successfully"
else
  echo "❌ Failed to upload file: $UPLOAD_RESPONSE"
fi

# 8. Check if file appears in bucket listing
echo -e "\n8. Checking if file appears in bucket..."
BUCKET_FILES=$(curl -s "$BASE_URL/storage?bucket=test-bucket" \
  -H "Cookie: session=$SESSION")

if echo "$BUCKET_FILES" | grep -q "test-file.txt"; then
  echo "✅ File appears in bucket listing"
else
  echo "❌ File not visible in bucket listing"
fi

echo -e "\n=============================="
echo "Storage test completed!"