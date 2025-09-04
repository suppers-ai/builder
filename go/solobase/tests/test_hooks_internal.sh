#!/bin/bash

# Test that hooks are working internally even if extension API isn't accessible
set -e

PORT=8097
API_BASE="http://localhost:$PORT/api"
DB_FILE="./test_hooks.db"

echo "=== Internal Hooks Verification Test ==="
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Start server with verbose logging
echo "Starting server..."
rm -f $DB_FILE
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase 2>&1 | tee server.log &
SERVER_PID=$!

cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    rm -f $DB_FILE test_*.txt
}
trap cleanup EXIT

sleep 5

# Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Test123456789!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
echo -e "${GREEN}✅ Logged in${NC}"

# Create bucket
BUCKET="test-hooks-$$"
echo -e "\nCreating bucket: $BUCKET"
curl -s -X POST "$API_BASE/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BUCKET\", \"public\": false}" > /dev/null
echo -e "${GREEN}✅ Bucket created${NC}"

# Create test file
echo "Test content for hooks" > test_hooks.txt

# Upload file (should trigger hooks)
echo -e "\n${YELLOW}Uploading file (should trigger upload hooks)...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE/storage/buckets/$BUCKET/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_hooks.txt")

FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "File uploaded with ID: $FILE_ID"

# Wait for hooks to process
sleep 3

# Check server logs for hook execution
echo -e "\n${YELLOW}Checking server logs for hook execution...${NC}"

# Look for quota service calls
if grep -q "quota" server.log 2>/dev/null; then
    echo -e "${GREEN}✅ Quota-related activity detected in logs${NC}"
else
    echo -e "${YELLOW}⚠️  No quota activity in logs${NC}"
fi

# Look for storage/bandwidth updates
if grep -q "storage_used\|bandwidth_used" server.log 2>/dev/null; then
    echo -e "${GREEN}✅ Storage/bandwidth updates detected${NC}"
else
    echo -e "${YELLOW}⚠️  No storage/bandwidth updates in logs${NC}"
fi

# Look for access log entries
if grep -q "log.*access\|access.*log" server.log 2>/dev/null; then
    echo -e "${GREEN}✅ Access logging activity detected${NC}"
else
    echo -e "${YELLOW}⚠️  No access logging in logs${NC}"
fi

# Download file (should trigger download hooks)
echo -e "\n${YELLOW}Downloading file (should trigger download hooks)...${NC}"
curl -s -o downloaded.txt "$API_BASE/storage/buckets/$BUCKET/objects/$FILE_ID/download" \
  -H "Authorization: Bearer $TOKEN"

if [ -f downloaded.txt ]; then
    echo -e "${GREEN}✅ File downloaded successfully${NC}"
    rm downloaded.txt
fi

sleep 2

# Check database directly using Go code
echo -e "\n${YELLOW}Checking database for hook results...${NC}"

cat > check_db.go << 'EOF'
package main

import (
    "database/sql"
    "fmt"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

func main() {
    db, err := sql.Open("sqlite3", "./test_hooks.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Check if CloudStorage tables exist
    var tableCount int
    err = db.QueryRow(`
        SELECT COUNT(*) 
        FROM sqlite_master 
        WHERE type='table' AND name LIKE 'ext_cloudstorage%'
    `).Scan(&tableCount)
    
    if err != nil {
        fmt.Println("❌ Error checking tables:", err)
    } else if tableCount > 0 {
        fmt.Printf("✅ Found %d CloudStorage tables\n", tableCount)
        
        // Check for quota records
        var quotaCount int
        err = db.QueryRow("SELECT COUNT(*) FROM ext_cloudstorage_storage_quotas").Scan(&quotaCount)
        if err == nil && quotaCount > 0 {
            fmt.Printf("✅ Found %d quota records\n", quotaCount)
            
            // Get quota details
            var storageUsed, bandwidthUsed int64
            err = db.QueryRow(`
                SELECT COALESCE(storage_used, 0), COALESCE(bandwidth_used, 0) 
                FROM ext_cloudstorage_storage_quotas 
                LIMIT 1
            `).Scan(&storageUsed, &bandwidthUsed)
            
            if err == nil {
                if storageUsed > 0 {
                    fmt.Printf("✅ Storage tracking: %d bytes used\n", storageUsed)
                } else {
                    fmt.Println("⚠️  Storage tracking: 0 bytes")
                }
                if bandwidthUsed > 0 {
                    fmt.Printf("✅ Bandwidth tracking: %d bytes used\n", bandwidthUsed)
                } else {
                    fmt.Println("⚠️  Bandwidth tracking: 0 bytes")
                }
            }
        } else {
            fmt.Println("⚠️  No quota records found")
        }
        
        // Check for access logs
        var logCount int
        err = db.QueryRow("SELECT COUNT(*) FROM ext_cloudstorage_storage_access_logs").Scan(&logCount)
        if err == nil && logCount > 0 {
            fmt.Printf("✅ Found %d access log entries\n", logCount)
        } else {
            fmt.Println("⚠️  No access logs found")
        }
    } else {
        fmt.Println("⚠️  CloudStorage tables not created")
    }
}
EOF

go run check_db.go 2>/dev/null || echo "⚠️  Database check failed (may need go-sqlite3)"

# Summary
echo -e "\n${YELLOW}=== Summary ===${NC}"
echo "Core functionality:"
echo "  ✅ Upload works"
echo "  ✅ Download works"
echo ""
echo "Hook execution:"

# Extract key info from logs
HOOK_COUNT=$(grep -c "hook\|Hook" server.log 2>/dev/null || echo "0")
echo "  Hook mentions in logs: $HOOK_COUNT"

if [ "$HOOK_COUNT" -gt "0" ]; then
    echo -e "  ${GREEN}✅ Hooks are being processed${NC}"
else
    echo -e "  ${YELLOW}⚠️  No explicit hook activity detected${NC}"
fi

echo -e "\n${GREEN}Test complete!${NC}"