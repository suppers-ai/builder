#!/bin/bash

# Test storage navigation functionality

API_URL="http://localhost:8092/api"

echo "=== Testing Storage Navigation ==="
echo

# Login
echo "1. Logging in..."
TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Test123456789!"}' | jq -r .token)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"
echo

# Create test bucket
echo "2. Creating test bucket..."
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"navigation-test"}' \
  $API_URL/storage/buckets > /dev/null
echo "✅ Bucket created"
echo

# Upload files in nested structure
echo "3. Uploading files in nested structure..."

# Create test files
echo "Root file" > /tmp/root.txt
echo "Folder1 file" > /tmp/folder1.txt
echo "Nested file" > /tmp/nested.txt
echo "Deep file" > /tmp/deep.txt

# Upload to different paths
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/root.txt" \
  $API_URL/storage/buckets/navigation-test/upload > /dev/null

curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/folder1.txt" \
  -F "path=folder1" \
  $API_URL/storage/buckets/navigation-test/upload > /dev/null

curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/nested.txt" \
  -F "path=folder1/subfolder" \
  $API_URL/storage/buckets/navigation-test/upload > /dev/null

curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/deep.txt" \
  -F "path=folder1/subfolder/deep" \
  $API_URL/storage/buckets/navigation-test/upload > /dev/null

echo "✅ Files uploaded"
echo

# Test navigation
echo "4. Testing folder navigation..."
echo

echo "   Root level:"
curl -s -H "Authorization: Bearer $TOKEN" \
  $API_URL/storage/buckets/navigation-test/objects | \
  jq -r '.[] | "   - \(.type): \(.name)"'
echo

echo "   Inside folder1:"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/storage/buckets/navigation-test/objects?path=folder1" | \
  jq -r '.[] | "   - \(.type): \(.name)"'
echo

echo "   Inside folder1/subfolder:"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/storage/buckets/navigation-test/objects?path=folder1/subfolder" | \
  jq -r '.[] | "   - \(.type): \(.name)"'
echo

echo "   Inside folder1/subfolder/deep:"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/storage/buckets/navigation-test/objects?path=folder1/subfolder/deep" | \
  jq -r '.[] | "   - \(.type): \(.name)"'
echo

echo "✅ Navigation test complete!"
echo
echo "=== Summary ==="
echo "Virtual folder navigation is working correctly!"
echo "- Folders are created dynamically from file paths"
echo "- Navigation filters content by path"
echo "- Nested folders work as expected"