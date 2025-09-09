#!/bin/bash

echo "Testing Folder Navigation After Reactivity Fix"
echo "=============================================="

# Get a fresh token
echo "Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:8091/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

if [ -z "$TOKEN" ]; then
  echo "Failed to get auth token"
  exit 1
fi

echo "Token obtained successfully"
echo ""

# Create test folder structure
echo "Creating test folder structure..."
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"TestFolder","path":""}' > /dev/null

curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"SubFolder1","path":"TestFolder"}' > /dev/null

curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"SubFolder2","path":"TestFolder"}' > /dev/null

curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"DeepFolder","path":"TestFolder/SubFolder1"}' > /dev/null

echo "Test structure created"
echo ""

# Test navigation
echo "Test 1: Root path (should show TestFolder and any other root items):"
echo "----------------------------------------------------------------"
RESULT=$(curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name // empty')
echo "$RESULT"
echo ""

echo "Test 2: Navigate to TestFolder (should show SubFolder1 and SubFolder2):"
echo "-----------------------------------------------------------------------"
RESULT=$(curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=TestFolder" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name // empty')
echo "$RESULT"
if [[ "$RESULT" == *"SubFolder1"* ]] && [[ "$RESULT" == *"SubFolder2"* ]]; then
  echo "✓ Navigation to TestFolder works correctly"
else
  echo "✗ Navigation to TestFolder failed - expected SubFolder1 and SubFolder2"
fi
echo ""

echo "Test 3: Navigate to TestFolder/SubFolder1 (should show DeepFolder):"
echo "-------------------------------------------------------------------"
RESULT=$(curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=TestFolder/SubFolder1" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name // empty')
echo "$RESULT"
if [[ "$RESULT" == *"DeepFolder"* ]]; then
  echo "✓ Navigation to nested folder works correctly"
else
  echo "✗ Navigation to nested folder failed - expected DeepFolder"
fi
echo ""

echo "Test 4: Navigate to non-existent folder (should return empty):"
echo "--------------------------------------------------------------"
RESULT=$(curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=NonExistentFolder" \
  -H "Authorization: Bearer $TOKEN")
if [ "$RESULT" == "[]" ] || [ "$RESULT" == "null" ]; then
  echo "✓ Non-existent folder returns empty correctly"
else
  echo "✗ Non-existent folder returned unexpected data:"
  echo "$RESULT" | jq '.'
fi
echo ""

echo "Test 5: Upload file to TestFolder and verify it appears:"
echo "--------------------------------------------------------"
echo "test content" > /tmp/test-file.txt
curl -s -X POST "http://localhost:8091/api/storage/buckets/int_storage/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-file.txt" \
  -F "path=TestFolder" > /dev/null

RESULT=$(curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=TestFolder" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name // empty')
echo "$RESULT"
if [[ "$RESULT" == *"test-file.txt"* ]]; then
  echo "✓ File upload to folder works correctly"
else
  echo "✗ File upload to folder failed - expected test-file.txt"
fi
echo ""

echo "=============================================="
echo "Navigation Testing Complete"
echo ""
echo "Frontend Verification:"
echo "----------------------"
echo "1. Open http://localhost:5175 in your browser"
echo "2. Login with admin@example.com / admin123"
echo "3. Navigate to Files page"
echo "4. Double-click 'TestFolder' - should show SubFolder1, SubFolder2, and test-file.txt"
echo "5. Breadcrumbs should show: Home > TestFolder"
echo "6. Double-click 'SubFolder1' - should show DeepFolder"
echo "7. Breadcrumbs should show: Home > TestFolder > SubFolder1"
echo "8. Click 'TestFolder' in breadcrumbs - should go back to TestFolder contents"
echo "9. Click 'Home' in breadcrumbs - should go back to root"
echo ""
echo "The key fix: Path is now passed directly to loadItems() in handleNavigate(),"
echo "avoiding the Svelte reactivity timing issue where currentPathString was lagging behind."