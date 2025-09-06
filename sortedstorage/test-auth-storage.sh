#!/bin/bash

# Test authentication and storage
API_URL="http://localhost:8095/api"

echo "1. Testing login..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Test123456789!"}' | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Check credentials."
  exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."

echo "2. Testing folder creation with token..."
RESPONSE=$(curl -s -X POST "$API_URL/storage/buckets/int_storage/folders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"test-folder","path":"/"}')

echo "Response: $RESPONSE"
