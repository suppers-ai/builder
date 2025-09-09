#!/bin/bash

echo "Testing subfolder upload with new ObjectPath structure..."

# Start server
rm -f test.db
DATABASE_TYPE=sqlite DATABASE_URL=file:./test.db DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="admin123" PORT=8104 ./sortedstorage-test &
PID=$!

sleep 3

# Get token
RESPONSE=$(curl -s -X POST http://localhost:8104/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

TOKEN=$(echo $RESPONSE | jq -r .token)
USER_ID=$(echo $RESPONSE | jq -r .user.id)

echo "User ID: $USER_ID"

# Create a root folder
echo "Creating root folder..."
FOLDER1=$(curl -s -X POST http://localhost:8104/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"documents","path":""}')
echo "Root folder response: $FOLDER1"

# Create a subfolder
echo "Creating subfolder..."
FOLDER2=$(curl -s -X POST http://localhost:8104/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"reports","path":"documents"}')
echo "Subfolder response: $FOLDER2"

# Upload a file to the subfolder
echo "Uploading file to subfolder..."
echo "Test report content" > report.txt
UPLOAD=$(curl -s -X POST http://localhost:8104/api/storage/buckets/int_storage/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@report.txt" \
  -F "path=documents/reports")
echo "Upload response: $UPLOAD"

# List objects to verify structure
echo -e "\nListing all objects..."
OBJECTS=$(curl -s -X GET http://localhost:8104/api/storage/buckets/int_storage/objects \
  -H "Authorization: Bearer $TOKEN")
echo "Objects: $OBJECTS" | jq '.'

# Check database structure
echo -e "\nDatabase structure:"
echo "SELECT id, object_path, object_name, parent_folder_id, user_id FROM storage_objects;" | sqlite3 test.db -column -header

kill $PID 2>/dev/null
rm -f report.txt test.db

echo -e "\nTest completed. ObjectPath should contain folder IDs, not names."