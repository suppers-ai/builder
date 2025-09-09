#!/bin/bash

echo "Testing upload and folder creation with fixed code..."

# Kill any existing processes on port 8095
echo "Killing any process on port 8095..."
PID=$(lsof -t -i:8095)
if [ ! -z "$PID" ]; then
    kill -9 $PID 2>/dev/null
    sleep 1
fi

# Start backend on port 8095
echo "Starting backend on port 8095..."
DATABASE_TYPE=sqlite DATABASE_URL=file:./.data/sortedstorage.db \
DEFAULT_ADMIN_EMAIL=admin@example.com \
DEFAULT_ADMIN_PASSWORD=admin123 \
APP_ID=sortedstorage \
PORT=8095 \
./backend/sortedstorage-backend &

BACKEND_PID=$!
sleep 3

# Get auth token
echo "Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:8095/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

echo "Token: ${TOKEN:0:20}..."

# Test 1: Create a folder in root
echo -e "\n1. Creating folder in root..."
curl -X POST http://localhost:8095/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-root-folder","path":""}' | jq '.'

# Test 2: Upload a file to root
echo -e "\n2. Uploading file to root..."
echo "test content for root" > test-root.txt
curl -X POST http://localhost:8095/api/storage/buckets/int_storage/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-root.txt" | jq '.'

# Test 3: Get folder list to find the folder we created
echo -e "\n3. Getting folder list..."
FOLDERS=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8095/api/storage/buckets/int_storage/objects")
echo "$FOLDERS" | jq '.'

# Get the folder ID of test-root-folder
FOLDER_ID=$(echo "$FOLDERS" | jq -r '.[] | select(.object_name == "test-root-folder" or .name == "test-root-folder") | .id // .ID' | head -1)

if [ ! -z "$FOLDER_ID" ]; then
  echo -e "\n4. Creating subfolder in test-root-folder (ID: $FOLDER_ID)..."
  curl -X POST http://localhost:8095/api/storage/buckets/int_storage/folders \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"subfolder\",\"path\":\"test-root-folder\",\"parent_folder_id\":\"$FOLDER_ID\"}" | jq '.'
  
  echo -e "\n5. Uploading file to subfolder (parent_folder_id: $FOLDER_ID)..."
  echo "test content for subfolder" > test-sub.txt
  curl -X POST http://localhost:8095/api/storage/buckets/int_storage/upload \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@test-sub.txt" \
    -F "parent_folder_id=$FOLDER_ID" | jq '.'
    
  # Get objects in the subfolder
  echo -e "\n6. Getting objects in test-root-folder..."
  curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:8095/api/storage/buckets/int_storage/objects?path=test-root-folder" | jq '.'
else
  echo "Could not find test-root-folder to test subfolder operations"
fi

# Test 7: List all objects
echo -e "\n7. Listing all objects to verify structure..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8095/api/storage/buckets/int_storage/objects" | jq '.'

# Cleanup
echo -e "\nCleaning up..."
rm -f test-root.txt test-sub.txt
kill $BACKEND_PID 2>/dev/null

echo "Test complete!"