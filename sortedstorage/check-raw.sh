#!/bin/bash
TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODhmYzIyNmYtNmU1YS00YzcxLWJhYzYtNzBkZWVhM2Q2NzMyIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc1NzMxODQ5NiwiaWF0IjoxNzU3MjMyMDk2fQ.5QpAFSVKUUfpOVp7BHfSXY23wiEwr12sTe-ZazMybuM'

echo "Raw response for root:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects" -H "Authorization: Bearer $TOKEN" | jq '.[0]'

echo -e "\nRaw response for FolderA:"
curl -s -X GET "http://localhost:8091/api/storage/buckets/int_storage/objects?path=FolderA" -H "Authorization: Bearer $TOKEN" | jq '.[0]'