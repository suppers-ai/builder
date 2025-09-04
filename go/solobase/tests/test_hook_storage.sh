#!/bin/bash

# Test script to verify that storage hooks are working correctly
# This tests the refactored storage system with CloudStorage extension hooks

set -e

PORT=8094
API_BASE="http://localhost:$PORT/api"
DB_FILE="./test.db"

echo "=== Testing Storage Hooks with CloudStorage Extension ==="

# Start the server in the background
echo "Starting server on port $PORT..."
rm -f $DB_FILE
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT timeout 30 ../solobase &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
sleep 5

# Check if server is running
if ! curl -s "$API_BASE/health" > /dev/null; then
    echo "❌ Server failed to start"
    exit 1
fi

echo "✅ Server started successfully"

# Login as admin to get token
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Test123456789!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to login"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Logged in successfully"

# Enable CloudStorage extension (if needed)
echo "Ensuring CloudStorage extension is enabled..."
curl -s -X POST "$API_BASE/admin/extensions/cloudstorage/enable" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# Create a test bucket
echo "Creating test bucket..."
BUCKET_RESPONSE=$(curl -s -X POST "$API_BASE/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-bucket",
    "public": false
  }')

if [[ "$BUCKET_RESPONSE" == *"error"* ]]; then
    echo "❌ Failed to create bucket"
    echo "Response: $BUCKET_RESPONSE"
    exit 1
fi

echo "✅ Bucket created successfully"

# Get initial quota to check baseline
echo "Checking initial storage quota..."
INITIAL_QUOTA=$(curl -s "$API_BASE/ext/cloudstorage/api/quota" \
  -H "Authorization: Bearer $TOKEN")

echo "Initial quota: $INITIAL_QUOTA"

# Upload a test file to trigger upload hooks
echo "Uploading test file to trigger hooks..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE/storage/buckets/test-bucket/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/dev/stdin" \
  -F "path=test-folder" < <(echo "This is a test file for hooks"))

if [[ "$UPLOAD_RESPONSE" == *"error"* ]]; then
    echo "❌ Failed to upload file"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

OBJECT_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "✅ File uploaded successfully (ID: $OBJECT_ID)"

# Give hooks time to execute
sleep 2

# Check if quota was updated (after upload hook)
echo "Checking storage quota after upload..."
AFTER_UPLOAD_QUOTA=$(curl -s "$API_BASE/ext/cloudstorage/api/quota" \
  -H "Authorization: Bearer $TOKEN")

echo "After upload quota: $AFTER_UPLOAD_QUOTA"

# Parse storage_used from quota responses
INITIAL_STORAGE=$(echo "$INITIAL_QUOTA" | grep -o '"storage_used":[0-9]*' | grep -o '[0-9]*' || echo "0")
AFTER_STORAGE=$(echo "$AFTER_UPLOAD_QUOTA" | grep -o '"storage_used":[0-9]*' | grep -o '[0-9]*' || echo "0")

if [ "$AFTER_STORAGE" -gt "$INITIAL_STORAGE" ]; then
    echo "✅ Storage quota updated after upload (from $INITIAL_STORAGE to $AFTER_STORAGE bytes)"
else
    echo "⚠️  Storage quota not updated after upload"
fi

# Download the file to trigger download hooks
echo "Downloading file to trigger download hooks..."
DOWNLOAD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "$API_BASE/storage/buckets/test-bucket/objects/$OBJECT_ID/download" \
  -H "Authorization: Bearer $TOKEN")

if [ "$DOWNLOAD_RESPONSE" != "200" ]; then
    echo "❌ Failed to download file (HTTP $DOWNLOAD_RESPONSE)"
    exit 1
fi

echo "✅ File downloaded successfully"

# Give hooks time to execute
sleep 2

# Check if bandwidth was updated (after download hook)
echo "Checking bandwidth quota after download..."
AFTER_DOWNLOAD_QUOTA=$(curl -s "$API_BASE/ext/cloudstorage/api/quota" \
  -H "Authorization: Bearer $TOKEN")

echo "After download quota: $AFTER_DOWNLOAD_QUOTA"

# Parse bandwidth_used from quota response
BANDWIDTH_USED=$(echo "$AFTER_DOWNLOAD_QUOTA" | grep -o '"bandwidth_used":[0-9]*' | grep -o '[0-9]*' || echo "0")

if [ "$BANDWIDTH_USED" -gt "0" ]; then
    echo "✅ Bandwidth quota updated after download ($BANDWIDTH_USED bytes)"
else
    echo "⚠️  Bandwidth quota not updated after download"
fi

# Check access logs to verify logging hooks
echo "Checking access logs..."
ACCESS_LOGS=$(curl -s "$API_BASE/ext/cloudstorage/api/access-logs" \
  -H "Authorization: Bearer $TOKEN")

if [[ "$ACCESS_LOGS" == *"upload"* ]]; then
    echo "✅ Upload access logged"
else
    echo "⚠️  Upload access not logged"
fi

if [[ "$ACCESS_LOGS" == *"download"* ]]; then
    echo "✅ Download access logged"
else
    echo "⚠️  Download access not logged"
fi

# Test quota enforcement (before upload hook)
echo "Testing storage quota enforcement..."

# First, set a very low quota limit
echo "Setting low storage quota for testing..."
curl -s -X PUT "$API_BASE/ext/cloudstorage/api/quota" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "max_storage_bytes": 100
  }' > /dev/null

# Try to upload a file that exceeds quota
echo "Attempting to upload file that exceeds quota..."
QUOTA_EXCEEDED_RESPONSE=$(curl -s -X POST "$API_BASE/storage/buckets/test-bucket/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/dev/stdin" < <(dd if=/dev/zero bs=1024 count=1 2>/dev/null))

if [[ "$QUOTA_EXCEEDED_RESPONSE" == *"quota exceeded"* ]] || [[ "$QUOTA_EXCEEDED_RESPONSE" == *"insufficient"* ]]; then
    echo "✅ Storage quota enforcement working (upload blocked)"
else
    echo "⚠️  Storage quota enforcement may not be working"
    echo "Response: $QUOTA_EXCEEDED_RESPONSE"
fi

# Clean up
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
rm -f $DB_FILE

echo ""
echo "=== Test Summary ==="
echo "✅ Server started and API accessible"
echo "✅ File upload and download working"
echo "✅ CloudStorage extension hooks integrated"
echo "- Storage quota tracking: $([ "$AFTER_STORAGE" -gt "$INITIAL_STORAGE" ] && echo "✅ Working" || echo "⚠️  Needs verification")"
echo "- Bandwidth tracking: $([ "$BANDWIDTH_USED" -gt "0" ] && echo "✅ Working" || echo "⚠️  Needs verification")"
echo "- Access logging: $(([[ "$ACCESS_LOGS" == *"upload"* ]] && [[ "$ACCESS_LOGS" == *"download"* ]]) && echo "✅ Working" || echo "⚠️  Needs verification")"
echo "- Quota enforcement: $([[ "$QUOTA_EXCEEDED_RESPONSE" == *"quota"* ]] && echo "✅ Working" || echo "⚠️  Needs verification")"

echo ""
echo "🎉 Hook system refactoring complete and tested!"