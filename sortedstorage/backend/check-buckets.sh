#!/bin/bash

echo "Checking buckets via API..."

# Login
TOKEN=$(curl -s -X POST http://localhost:8094/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}' | jq -r '.token')

echo "Token obtained"

# Get buckets
echo -e "\nFetching buckets from API:"
curl -s -X GET "http://localhost:8094/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" | jq '.'