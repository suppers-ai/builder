#!/bin/bash
export TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODhmYzIyNmYtNmU1YS00YzcxLWJhYzYtNzBkZWVhM2Q2NzMyIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc1NzMxODQ5NiwiaWF0IjoxNzU3MjMyMDk2fQ.5QpAFSVKUUfpOVp7BHfSXY23wiEwr12sTe-ZazMybuM'

echo "Test 1: Root path (should show FolderA and FolderB):"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects" -H "Authorization: Bearer $TOKEN" | jq -r '.[].name'

echo -e "\nTest 2: Non-existent path 'test' (should be empty):"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=test" -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\nTest 3: Existing path 'FolderA' (should show SubA1 and SubA2):"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=FolderA" -H "Authorization: Bearer $TOKEN" | jq -r '.[].name'

echo -e "\nTest 4: Non-existent path 'NonExistent/Folder' (should be empty):"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=NonExistent/Folder" -H "Authorization: Bearer $TOKEN" | jq '.'