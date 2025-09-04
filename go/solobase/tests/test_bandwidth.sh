#!/bin/bash
set -e

PORT=8102
DB_FILE="./test_bandwidth.db"
rm -f $DB_FILE

echo "=== Bandwidth Tracking Test ==="
echo ""

echo "Starting server..."
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase > bandwidth.log 2>&1 &
PID=$!

cleanup() {
    kill $PID 2>/dev/null || true
    rm -f $DB_FILE test*.txt bandwidth.log check.go
}
trap cleanup EXIT

sleep 5

# Login
RESPONSE=$(curl -s -X POST "http://localhost:$PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Test123456789!"}')
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

# Create bucket and upload
BUCKET="bandwidth-$$"
curl -s -X POST "http://localhost:$PORT/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BUCKET\", \"public\": false}" > /dev/null

# Upload a file
echo "Upload test file content - bandwidth test" > test_bandwidth.txt
UPLOAD=$(curl -s -X POST "http://localhost:$PORT/api/storage/buckets/$BUCKET/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_bandwidth.txt")
FILE_ID=$(echo "$UPLOAD" | grep -o '"id":"[^"]*' | sed 's/"id":"//')

echo "File uploaded: $FILE_ID"
sleep 2

# Check initial state
echo "Before download:"
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
    db, _ := sql.Open("sqlite3", "./test_bandwidth.db")
    defer db.Close()
    var storageUsed, bandwidthUsed int64
    db.QueryRow("SELECT storage_used, bandwidth_used FROM ext_cloudstorage_storage_quotas WHERE user_id = ?", userID).Scan(&storageUsed, &bandwidthUsed)
    fmt.Printf("  Storage: %d bytes, Bandwidth: %d bytes\n", storageUsed, bandwidthUsed)
}
GOEOF
go run check.go "$USER_ID" 2>/dev/null

# Download the file
echo ""
echo "Downloading file..."
curl -s -o downloaded.txt "http://localhost:$PORT/api/storage/buckets/$BUCKET/objects/$FILE_ID/download" \
  -H "Authorization: Bearer $TOKEN"
echo "  Downloaded $(wc -c < downloaded.txt) bytes"

sleep 3

# Check after download
echo ""
echo "After download:"
go run check.go "$USER_ID" 2>/dev/null

# Check logs
echo ""
echo "Download logs:"
grep -E "HandleDownloadObject|bytesRead|bandwidth" bandwidth.log | tail -10

echo ""
echo "=== Test Complete ==="
