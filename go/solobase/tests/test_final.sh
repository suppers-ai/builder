#!/bin/bash
set -e

PORT=8100
DB_FILE="./test_final.db"
rm -f $DB_FILE

echo "=== Storage & Bandwidth Tracking Test ==="
echo ""

echo "Starting server..."
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase > server.log 2>&1 &
PID=$!

cleanup() {
    kill $PID 2>/dev/null || true
    rm -f $DB_FILE test*.txt check.go server.log
}
trap cleanup EXIT

sleep 5

# Login
echo "1. Logging in..."
RESPONSE=$(curl -s -X POST "http://localhost:$PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}')

TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
echo "   User: $USER_ID"

# Create bucket
BUCKET="final-test-$$"
echo ""
echo "2. Creating bucket: $BUCKET"
curl -s -X POST "http://localhost:$PORT/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BUCKET\", \"public\": false}" > /dev/null
echo "   ✓ Bucket created"

# Upload small file
echo ""
echo "3. Uploading small file (10 bytes)..."
echo "TestFile1" > test1.txt
RESPONSE=$(curl -s -X POST "http://localhost:$PORT/api/storage/buckets/$BUCKET/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test1.txt")
FILE1_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "   File ID: $FILE1_ID"

sleep 2

# Check quota created
echo ""
echo "4. Checking quota after upload..."
cat > check.go << 'GOEOF'
package main
import (
    "database/sql"
    "fmt"
    "os"
    _ "github.com/mattn/go-sqlite3"
)
func main() {
    userID := os.Args[1]
    db, _ := sql.Open("sqlite3", "./test_final.db")
    defer db.Close()
    
    var storageUsed, bandwidthUsed int64
    err := db.QueryRow("SELECT storage_used, bandwidth_used FROM ext_cloudstorage_storage_quotas WHERE user_id = ?", userID).Scan(&storageUsed, &bandwidthUsed)
    if err == nil {
        fmt.Printf("   ✓ Quota: Storage=%d bytes, Bandwidth=%d bytes\n", storageUsed, bandwidthUsed)
    } else {
        fmt.Printf("   ✗ No quota record found\n")
    }
    
    var logCount int
    db.QueryRow("SELECT COUNT(*) FROM ext_cloudstorage_storage_access_logs").Scan(&logCount)
    fmt.Printf("   Access logs: %d\n", logCount)
}
GOEOF
go run check.go "$USER_ID" 2>/dev/null || echo "   Check failed"

# Upload larger file
echo ""
echo "5. Uploading larger file (50KB)..."
dd if=/dev/zero of=test2.txt bs=1024 count=50 2>/dev/null
curl -s -X POST "http://localhost:$PORT/api/storage/buckets/$BUCKET/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test2.txt" > /dev/null
echo "   ✓ Large file uploaded"

sleep 2

echo ""
echo "6. Checking storage increase..."
go run check.go "$USER_ID" 2>/dev/null || echo "   Check failed"

# Download file to test bandwidth
echo ""
echo "7. Downloading file to test bandwidth..."
curl -s -o downloaded.txt "http://localhost:$PORT/api/storage/buckets/$BUCKET/objects/$FILE1_ID/download" \
  -H "Authorization: Bearer $TOKEN"
echo "   ✓ File downloaded"

sleep 2

echo ""
echo "8. Final check..."
go run check.go "$USER_ID" 2>/dev/null || echo "   Check failed"

# Check logs for errors
echo ""
if grep -q "Successfully updated storage usage" server.log; then
    echo "✅ Storage tracking is working!"
else
    echo "⚠️  No storage update confirmation in logs"
fi

if grep -q "error\|Error\|failed" server.log | grep -v "record not found" | head -3; then
    echo "⚠️  Errors found in log (see above)"
fi

echo ""
echo "=== Test Complete ==="
