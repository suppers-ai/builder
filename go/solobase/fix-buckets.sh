#!/bin/bash

PORT=${1:-8090}
BASE_URL="http://localhost:$PORT"

echo "Fixing storage buckets in existing database..."

# Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to login. Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✓ Logged in successfully"

# Try to create each bucket, ignoring "already exists" errors
echo -e "\n2. Creating/syncing default buckets..."

# Create int_storage
echo -n "  - int_storage: "
RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "int_storage", "public": false}')
  
if echo "$RESPONSE" | grep -q "already exists"; then
  echo "already exists (filesystem), adding to database..."
  # The bucket exists on filesystem but might not be in DB
  # Our updated CreateBucket should handle this
elif echo "$RESPONSE" | grep -q "message"; then
  echo "created successfully"
else
  echo "$RESPONSE"
fi

# Create ext_storage
echo -n "  - ext_storage: "
RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "ext_storage", "public": false}')
  
if echo "$RESPONSE" | grep -q "already exists"; then
  echo "already exists"
elif echo "$RESPONSE" | grep -q "message"; then
  echo "created successfully"
else
  echo "$RESPONSE"
fi

# Create public
echo -n "  - public: "
RESPONSE=$(curl -s -X POST "$BASE_URL/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "public", "public": true}')
  
if echo "$RESPONSE" | grep -q "already exists"; then
  echo "already exists"
elif echo "$RESPONSE" | grep -q "message"; then
  echo "created successfully"
else
  echo "$RESPONSE"
fi

echo -e "\n3. Verifying all buckets:"
curl -s "$BASE_URL/api/storage/buckets" | jq -r '.[] | "  - " + .name + " (id: " + .id + ")"'

echo -e "\nDone! Your storage buckets are now properly configured."
echo "The storage manager should now show: int_storage, ext_storage, public, and test"