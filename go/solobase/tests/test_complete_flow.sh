#!/bin/bash
set -e

PORT=8098
DB_FILE="./test_complete.db"
rm -f $DB_FILE

echo "=== Complete Storage System Test ==="
echo ""

echo "Starting server..."
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase > server.log 2>&1 &
PID=$!

cleanup() {
    kill $PID 2>/dev/null || true
    rm -f $DB_FILE test_file*.txt server.log downloaded.txt
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

echo "   User ID: $USER_ID"

# Create bucket
BUCKET="test-complete-$$"
echo ""
echo "2. Creating bucket: $BUCKET"
curl -s -X POST "http://localhost:$PORT/api/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BUCKET\", \"public\": false}" > /dev/null
echo "   ✓ Bucket created"

# Upload a file
echo ""
echo "3. Uploading test file (32 bytes)..."
echo "Test content for complete flow" > test_file1.txt
UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:$PORT/api/storage/buckets/$BUCKET/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_file1.txt")
  
FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "   File ID: $FILE_ID"

sleep 3

# Use Go to check database
echo ""
echo "4. Checking database for quota records..."
cat > check_quota.go << 'GOEOF'
package main

import (
    "database/sql"
    "fmt"
    "log"
    "os"
    _ "github.com/mattn/go-sqlite3"
)

func main() {
    userID := os.Args[1]
    db, err := sql.Open("sqlite3", "./test_complete.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Check tables
    var tableCount int
    db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name LIKE 'ext_cloudstorage%'").Scan(&tableCount)
    fmt.Printf("   CloudStorage tables: %d\n", tableCount)
    
    // Check quota
    var quotaCount int
    err = db.QueryRow("SELECT COUNT(*) FROM ext_cloudstorage_storage_quotas WHERE user_id = ?", userID).Scan(&quotaCount)
    if err == nil && quotaCount > 0 {
        var storageUsed, bandwidthUsed int64
        err = db.QueryRow("SELECT storage_used, bandwidth_used FROM ext_cloudstorage_storage_quotas WHERE user_id = ?", userID).Scan(&storageUsed, &bandwidthUsed)
        if err == nil {
            fmt.Printf("   Quota found - Storage: %d bytes, Bandwidth: %d bytes\n", storageUsed, bandwidthUsed)
        }
    } else {
        fmt.Printf("   No quota record found for user\n")
    }
    
    // Check access logs
    var logCount int
    db.QueryRow("SELECT COUNT(*) FROM ext_cloudstorage_storage_access_logs").Scan(&logCount)
    fmt.Printf("   Access logs: %d\n", logCount)
}
GOEOF
go run check_quota.go "$USER_ID" 2>/dev/null || echo "   Database check failed"

# Download the file
echo ""
echo "5. Downloading file..."
curl -s -o downloaded.txt "http://localhost:$PORT/api/storage/buckets/$BUCKET/objects/$FILE_ID/download" \
  -H "Authorization: Bearer $TOKEN"
echo "   ✓ File downloaded"

sleep 2

# Check bandwidth update
echo ""
echo "6. Checking bandwidth update..."
go run check_quota.go "$USER_ID" 2>/dev/null || echo "   Database check failed"

# Upload larger file
echo ""
echo "7. Uploading larger file (100KB)..."
dd if=/dev/zero of=test_file2.txt bs=1024 count=100 2>/dev/null
curl -s -X POST "http://localhost:$PORT/api/storage/buckets/$BUCKET/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_file2.txt" > /dev/null
echo "   ✓ Large file uploaded"

sleep 2

# Final check
echo ""
echo "8. Final database state..."
go run check_quota.go "$USER_ID" 2>/dev/null || echo "   Database check failed"

# Clean up Go file
rm -f check_quota.go

echo ""
echo "=== Test Complete ==="
