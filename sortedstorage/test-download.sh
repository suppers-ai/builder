#!/bin/bash

TOKEN=$(curl -s -X POST http://localhost:8093/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' | jq -r '.token')

echo "Testing download with token: ${TOKEN:0:20}..."

# Test downloading the image (use -v for verbose output, not -I which sends HEAD)
curl -v -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8093/api/storage/buckets/int_storage/objects/0bb7975a-6ccf-4597-b099-1b3381b30189/download" \
  -o test-image.jpg 2>&1 | head -30