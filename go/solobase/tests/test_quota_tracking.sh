#!/bin/bash

# Simple test to verify quota tracking
set -e

PORT=8098  
DB_FILE="./test_quota.db"
rm -f $DB_FILE

echo "Starting server..."
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase > server_quota.log 2>&1 &
PID=$!

cleanup() {
    kill $PID 2>/dev/null || true
    rm -f $DB_FILE test_file*.txt server_quota.log
}
trap cleanup EXIT

sleep 5

# Login
echo "Logging in..."
TOKEN=$(curl -s -X POST "http://localhost:$PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

USER_ID=$(curl -s -X POST "http://localhost:$PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}' \
  | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

echo "User ID: $USER_ID"

# Create bucket
BUCKET="quota-test-$$"
echo "Creating bucket: $BUCKET"
curl -s -X POST "http://localhost:$PORT/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BUCKET\", \"public\": false}" > /dev/null

# Create test files
echo "Creating test files..."
echo "Small file" > test_file1.txt  # ~11 bytes
dd if=/dev/zero of=test_file2.txt bs=1024 count=5 2>/dev/null  # 5KB  
dd if=/dev/zero of=test_file3.txt bs=1024 count=10 2>/dev/null  # 10KB

# Upload files and check database after each
for i in 1 2 3; do
    echo ""
    echo "Uploading file $i..."
    
    RESPONSE=$(curl -s -X POST "http://localhost:$PORT/api/storage/buckets/$BUCKET/upload" \
      -H "Authorization: Bearer $TOKEN" \
      -F "file=@test_file$i.txt")
    
    FILE_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    echo "  Uploaded with ID: ${FILE_ID:0:8}..."
    
    # Give hooks time to execute
    sleep 3
    
    # Check database directly
    echo "  Checking database..."
    
    # Check if quota table exists and has data
    sqlite3 $DB_FILE 2>/dev/null <<EOF
.headers off
SELECT 'Tables:', COUNT(*) FROM sqlite_master WHERE type='table' AND name LIKE 'ext_cloudstorage%';
SELECT 'Quotas:', COUNT(*) FROM ext_cloudstorage_storage_quotas WHERE user_id = '$USER_ID';
SELECT 'Storage:', storage_used FROM ext_cloudstorage_storage_quotas WHERE user_id = '$USER_ID';
EOF
    
    # Download file to test bandwidth
    if [ ! -z "$FILE_ID" ]; then
        echo "  Downloading file..."
        curl -s -o /dev/null "http://localhost:$PORT/api/storage/buckets/$BUCKET/objects/$FILE_ID/download" \
          -H "Authorization: Bearer $TOKEN"
        
        sleep 2
        
        echo "  Bandwidth check:"
        sqlite3 $DB_FILE 2>/dev/null <<EOF
.headers off  
SELECT 'Bandwidth:', bandwidth_used FROM ext_cloudstorage_storage_quotas WHERE user_id = '$USER_ID';
EOF
    fi
done

echo ""
echo "Final database state:"
sqlite3 $DB_FILE 2>/dev/null <<EOF
.headers on
.mode column
SELECT * FROM ext_cloudstorage_storage_quotas WHERE user_id = '$USER_ID';
EOF

# Check logs for errors
echo ""
echo "Checking logs for quota errors..."
grep -i "quota\|storage_used\|bandwidth" server_quota.log | tail -5 || echo "No quota activity in logs"

echo ""
echo "Test complete!"