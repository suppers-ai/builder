#!/bin/bash
set -e

PORT=8099
DB_FILE="./test_verbose.db"
rm -f $DB_FILE

echo "Starting server with verbose logging..."
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase 2>&1 | tee verbose.log &
PID=$!

cleanup() {
    kill $PID 2>/dev/null || true
    rm -f $DB_FILE test.txt
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

echo ""
echo "=== Hook execution logs ==="
grep -E "updateStorageUsageHook|quotaService|GetOrCreateQuota" verbose.log || echo "No hook logs found"

echo ""
echo "=== Database check ==="
cat > check.go << 'GOEOF'
package main
import (
    "database/sql"
    "fmt"
    _ "github.com/mattn/go-sqlite3"
)
func main() {
    db, _ := sql.Open("sqlite3", "./test_verbose.db")
    defer db.Close()
    var count int
    db.QueryRow("SELECT COUNT(*) FROM ext_cloudstorage_storage_quotas").Scan(&count)
    fmt.Printf("Quota records: %d\n", count)
}
GOEOF
go run check.go 2>/dev/null || echo "Check failed"

echo "Done - see verbose.log for details"
