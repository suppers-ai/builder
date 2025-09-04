#!/bin/bash
set -e

PORT=8101
DB_FILE="./test_quota_simple.db"
rm -f $DB_FILE

echo "Starting server..."
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase 2>&1 | tee simple.log &
PID=$!

cleanup() {
    kill $PID 2>/dev/null || true
    rm -f $DB_FILE test.txt simple.log
}
trap cleanup EXIT

sleep 5

# Login
TOKEN=$(curl -s -X POST "http://localhost:$PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# Create bucket and upload
BUCKET="test-$$"
curl -s -X POST "http://localhost:$PORT/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BUCKET\", \"public\": false}" > /dev/null

echo "Test file" > test.txt
curl -s -X POST "http://localhost:$PORT/api/storage/buckets/$BUCKET/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" > /dev/null

sleep 3

echo "Checking logs for userID extraction..."
grep -E "HandleUploadFile: userID|updateStorageUsageHook" simple.log | tail -10

echo "Done"
