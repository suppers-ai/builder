#!/bin/bash

PORT=${1:-8090}
BASE_URL="http://localhost:$PORT"

echo "Creating default buckets..."

# Login
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

echo "Logged in successfully"

# Create int_storage bucket
echo "Creating int_storage bucket..."
curl -s -X POST "$BASE_URL/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "int_storage", "public": false}' | jq '.'

# Create ext_storage bucket  
echo "Creating ext_storage bucket..."
curl -s -X POST "$BASE_URL/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "ext_storage", "public": false}' | jq '.'

# Create public bucket
echo "Creating public bucket..."
curl -s -X POST "$BASE_URL/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "public", "public": true}' | jq '.'

echo -e "\nChecking all buckets:"
curl -s "$BASE_URL/api/storage/buckets" | jq -r '.[] | .name'