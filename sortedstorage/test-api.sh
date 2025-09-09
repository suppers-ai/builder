#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODhmYzIyNmYtNmU1YS00YzcxLWJhYzYtNzBkZWVhM2Q2NzMyIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc1NzMxODQ5NiwiaWF0IjoxNzU3MjMyMDk2fQ.5QpAFSVKUUfpOVp7BHfSXY23wiEwr12sTe-ZazMybuM"

echo "=== Creating folder structure ==="

# Create root folders
curl -s -X POST http://localhost:8091/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"FolderA","path":""}' | jq -c .

curl -s -X POST http://localhost:8091/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"FolderB","path":""}' | jq -c .

# Create subfolders
curl -s -X POST http://localhost:8091/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"SubA1","path":"FolderA"}' | jq -c .

curl -s -X POST http://localhost:8091/api/storage/buckets/int_storage/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"SubA2","path":"FolderA"}' | jq -c .

echo ""
echo "=== Testing navigation ==="

echo "1. Root (empty path) - should show FolderA and FolderB:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name' | sort

echo ""
echo "2. Path with no query param (same as root):"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name' | sort

echo ""
echo "3. FolderA - should show SubA1 and SubA2:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=FolderA" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name' | sort

echo ""
echo "4. FolderB - should be empty:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=FolderB" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name' | sort

echo ""
echo "5. FolderA/SubA1 - should be empty:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=FolderA/SubA1" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].name' | sort