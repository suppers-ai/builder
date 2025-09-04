#!/bin/bash
set -e

PORT=8097
DB_FILE="./test_debug.db"
rm -f $DB_FILE

echo "Starting server with debug logging..."
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase 2>&1 | tee debug.log &
PID=$!

cleanup() {
    kill $PID 2>/dev/null || true
    rm -f $DB_FILE test_file.txt
}
trap cleanup EXIT

sleep 5

# Login
echo "Logging in..."
TOKEN=$(curl -s -X POST "http://localhost:$PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# Create bucket
BUCKET="test-$$"
echo "Creating bucket: $BUCKET"
curl -s -X POST "http://localhost:$PORT/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BUCKET\", \"public\": false}" > /dev/null

# Create and upload file
echo "Test content" > test_file.txt
echo "Uploading file..."
curl -s -X POST "http://localhost:$PORT/api/storage/buckets/$BUCKET/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_file.txt" > /dev/null

sleep 2

echo ""
echo "Checking debug log for hook activity..."
grep -E "Extension|hook|Hook|storage_used|bandwidth" debug.log | head -20

echo ""
echo "Test complete - check debug.log for full output"
