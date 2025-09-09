#!/bin/bash

echo "Testing upload functionality with correct port configuration..."

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

# Test upload to root
echo -e "\n1. Testing upload to root..."
echo "test content" > test.txt
curl -X POST http://localhost:8095/api/storage/buckets/int_storage/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" | jq '.'

# Get folder list to find a folder ID
echo -e "\n2. Getting folder list..."
FOLDERS=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8095/api/storage/buckets/int_storage/objects" | jq '.')
echo "$FOLDERS"

# Create a test folder
echo -e "\n3. Creating test folder..."
curl -X POST http://localhost:8095/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-folder","path":"/"}' | jq '.'

# Get folder ID
FOLDER_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8095/api/storage/buckets/int_storage/objects" | \
  jq -r '.[] | select(.object_name == "test-folder" or .name == "test-folder") | .id // .ID' | head -1)

if [ ! -z "$FOLDER_ID" ]; then
  echo -e "\n4. Testing upload to subfolder (ID: $FOLDER_ID)..."
  echo "subfolder test content" > test2.txt
  curl -X POST http://localhost:8095/api/storage/buckets/int_storage/upload \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@test2.txt" \
    -F "parent_folder_id=$FOLDER_ID" | jq '.'
else
  echo "No folder found to test subfolder upload"
fi

# Test download
echo -e "\n5. Testing download..."
FILE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8095/api/storage/buckets/int_storage/objects" | \
  jq -r '.[0].id // .[0].ID' | head -1)

if [ ! -z "$FILE_ID" ]; then
  echo "Downloading file ID: $FILE_ID"
  curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:8095/api/storage/buckets/int_storage/objects/$FILE_ID/download" \
    -o downloaded.txt
  echo "Download response code: $?"
  if [ -f downloaded.txt ]; then
    echo "Downloaded content:"
    cat downloaded.txt
  fi
else
  echo "No file found to test download"
fi

# Cleanup
echo -e "\nCleaning up..."
rm -f test.txt test2.txt downloaded.txt
kill $BACKEND_PID 2>/dev/null

echo "Test complete!"