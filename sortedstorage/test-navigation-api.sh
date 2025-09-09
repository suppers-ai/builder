#!/bin/bash

echo "Testing navigation API..."

# Get auth token
TOKEN=$(curl -s -X POST http://localhost:8095/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

echo "Token obtained: ${TOKEN:0:20}..."

# List objects
echo -e "\n1. Listing objects:"
OBJECTS=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8095/api/storage/buckets/int_storage/objects?path=20ebe46d-3c2d-4693-84e6-3ba61b048945/sortedstorage")

echo "$OBJECTS" | jq '.'

# Get first object ID
OBJECT_ID=$(echo "$OBJECTS" | jq -r '.[0].id // .[0].ID // empty')

if [ -z "$OBJECT_ID" ]; then
  echo "No objects found, trying without path..."
  OBJECTS=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:8095/api/storage/buckets/int_storage/objects")
  echo "$OBJECTS" | jq '.'
  OBJECT_ID=$(echo "$OBJECTS" | jq -r '.[0].id // .[0].ID // empty')
fi

if [ ! -z "$OBJECT_ID" ]; then
  echo -e "\n2. Getting object by ID: $OBJECT_ID"
  curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:8095/api/storage/buckets/int_storage/objects/$OBJECT_ID" | jq '.'
else
  echo "No object ID found to test"
fi

# Test with parent_folder_id
echo -e "\n3. Testing with parent_folder_id:"
# First get a folder
FOLDERS=$(echo "$OBJECTS" | jq '[.[] | select(.is_folder == true or .type == "folder")]')
FOLDER_ID=$(echo "$FOLDERS" | jq -r '.[0].id // .[0].ID // empty')

if [ ! -z "$FOLDER_ID" ]; then
  echo "Listing items in folder: $FOLDER_ID"
  curl -s -H "Authorization: Bearer $TOKEN" \
    "http://localhost:8095/api/storage/buckets/int_storage/objects?parent_folder_id=$FOLDER_ID" | jq '.'
else
  echo "No folder found to test parent_folder_id"
fi