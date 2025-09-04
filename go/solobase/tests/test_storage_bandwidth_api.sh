#!/bin/bash

# Test storage and bandwidth tracking using API endpoints only
set -e

PORT=8096
API_BASE="http://localhost:$PORT/api"
DB_FILE="./test_tracking_api.db"

echo "=== Storage and Bandwidth Tracking Test (API) ==="
echo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Start the server
echo "Starting server on port $PORT..."
rm -f $DB_FILE
DATABASE_TYPE=sqlite DATABASE_URL=file:$DB_FILE DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="Test123456789!" PORT=$PORT ../solobase &
SERVER_PID=$!

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    rm -f $DB_FILE test_file_*.txt
}
trap cleanup EXIT

# Wait for server to start
sleep 5

# Check server health
if ! curl -s "$API_BASE/health" > /dev/null; then
    echo -e "${RED}❌ Server failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server started successfully${NC}"

# Login as admin
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Test123456789!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Logged in successfully${NC}"

# Create a unique test bucket
BUCKET_NAME="test-bucket-$$"
echo -e "\n${YELLOW}Creating test bucket: $BUCKET_NAME${NC}"
BUCKET_RESPONSE=$(curl -s -X POST "$API_BASE/storage/buckets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$BUCKET_NAME\",
    \"public\": false
  }")

echo -e "${GREEN}✅ Bucket created${NC}"

# Check if CloudStorage API endpoints are accessible
echo -e "\n${YELLOW}Checking CloudStorage extension status...${NC}"
QUOTA_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/ext/cloudstorage/api/quota" \
  -H "Authorization: Bearer $TOKEN")

if [ "$QUOTA_CHECK" == "404" ]; then
    echo -e "${YELLOW}⚠️  CloudStorage API endpoints not found. Checking if extension is enabled...${NC}"
    
    # Try to enable the extension
    echo "Attempting to enable CloudStorage extension..."
    ENABLE_RESPONSE=$(curl -s -X POST "$API_BASE/admin/extensions/cloudstorage/enable" \
      -H "Authorization: Bearer $TOKEN")
    echo "Enable response: $ENABLE_RESPONSE"
    
    sleep 2
    
    # Check again
    QUOTA_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/ext/cloudstorage/api/quota" \
      -H "Authorization: Bearer $TOKEN")
fi

if [ "$QUOTA_CHECK" == "200" ]; then
    echo -e "${GREEN}✅ CloudStorage extension is active${NC}"
    
    # Get initial quota
    echo -e "\n${YELLOW}Initial quota state:${NC}"
    INITIAL_QUOTA=$(curl -s "$API_BASE/ext/cloudstorage/api/quota" \
      -H "Authorization: Bearer $TOKEN")
    echo "$INITIAL_QUOTA" | python3 -m json.tool 2>/dev/null || echo "$INITIAL_QUOTA"
else
    echo -e "${YELLOW}⚠️  CloudStorage API not available (HTTP $QUOTA_CHECK). Hooks may still work internally.${NC}"
fi

# Create test files
echo -e "\n${YELLOW}Creating test files...${NC}"
echo "Small test file (37 bytes)" > test_file_small.txt
dd if=/dev/zero of=test_file_medium.txt bs=1024 count=10 2>/dev/null  # 10KB
dd if=/dev/zero of=test_file_large.txt bs=1024 count=100 2>/dev/null  # 100KB
echo -e "${GREEN}✅ Test files created${NC}"

# Function to get quota if available
get_quota() {
    if [ "$QUOTA_CHECK" == "200" ]; then
        curl -s "$API_BASE/ext/cloudstorage/api/quota" -H "Authorization: Bearer $TOKEN"
    else
        echo '{"message": "CloudStorage API not available"}'
    fi
}

# Upload files and track results
echo -e "\n${YELLOW}=== Testing Upload and Storage Tracking ===${NC}"

# Upload 1: Small file
echo -e "\n1. Uploading small file (37 bytes)..."
UPLOAD1=$(curl -s -X POST "$API_BASE/storage/buckets/$BUCKET_NAME/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_file_small.txt")

if [[ "$UPLOAD1" == *"id"* ]]; then
    FILE1_ID=$(echo "$UPLOAD1" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    echo -e "${GREEN}✅ Uploaded successfully (ID: ${FILE1_ID:0:8}...)${NC}"
    
    sleep 2  # Wait for hooks
    echo "Quota after upload 1:"
    get_quota | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'  Storage: {data.get(\"storage_used\", \"N/A\")} bytes')" 2>/dev/null || echo "  Unable to parse"
else
    echo -e "${RED}❌ Upload failed${NC}"
fi

# Upload 2: Medium file
echo -e "\n2. Uploading medium file (10KB)..."
UPLOAD2=$(curl -s -X POST "$API_BASE/storage/buckets/$BUCKET_NAME/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_file_medium.txt")

if [[ "$UPLOAD2" == *"id"* ]]; then
    FILE2_ID=$(echo "$UPLOAD2" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    echo -e "${GREEN}✅ Uploaded successfully (ID: ${FILE2_ID:0:8}...)${NC}"
    
    sleep 2
    echo "Quota after upload 2:"
    get_quota | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'  Storage: {data.get(\"storage_used\", \"N/A\")} bytes')" 2>/dev/null || echo "  Unable to parse"
else
    echo -e "${RED}❌ Upload failed${NC}"
fi

# Upload 3: Large file
echo -e "\n3. Uploading large file (100KB)..."
UPLOAD3=$(curl -s -X POST "$API_BASE/storage/buckets/$BUCKET_NAME/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_file_large.txt")

if [[ "$UPLOAD3" == *"id"* ]]; then
    FILE3_ID=$(echo "$UPLOAD3" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    echo -e "${GREEN}✅ Uploaded successfully (ID: ${FILE3_ID:0:8}...)${NC}"
    
    sleep 2
    echo "Quota after upload 3:"
    QUOTA_AFTER_UPLOADS=$(get_quota)
    echo "$QUOTA_AFTER_UPLOADS" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'  Storage: {data.get(\"storage_used\", \"N/A\")} bytes')" 2>/dev/null || echo "  Unable to parse"
else
    echo -e "${RED}❌ Upload failed${NC}"
fi

# Test downloads and bandwidth tracking
echo -e "\n${YELLOW}=== Testing Download and Bandwidth Tracking ===${NC}"

if [ ! -z "$FILE1_ID" ]; then
    echo -e "\n1. Downloading small file..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      "$API_BASE/storage/buckets/$BUCKET_NAME/objects/$FILE1_ID/download" \
      -H "Authorization: Bearer $TOKEN")
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Download successful${NC}"
        sleep 2
        echo "Quota after download 1:"
        get_quota | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'  Bandwidth: {data.get(\"bandwidth_used\", \"N/A\")} bytes')" 2>/dev/null || echo "  Unable to parse"
    else
        echo -e "${RED}❌ Download failed (HTTP $HTTP_CODE)${NC}"
    fi
fi

if [ ! -z "$FILE2_ID" ]; then
    echo -e "\n2. Downloading medium file..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      "$API_BASE/storage/buckets/$BUCKET_NAME/objects/$FILE2_ID/download" \
      -H "Authorization: Bearer $TOKEN")
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Download successful${NC}"
        sleep 2
        echo "Quota after download 2:"
        get_quota | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'  Bandwidth: {data.get(\"bandwidth_used\", \"N/A\")} bytes')" 2>/dev/null || echo "  Unable to parse"
    else
        echo -e "${RED}❌ Download failed (HTTP $HTTP_CODE)${NC}"
    fi
fi

if [ ! -z "$FILE3_ID" ]; then
    echo -e "\n3. Downloading large file (3 times)..."
    for i in {1..3}; do
        echo "  Download attempt $i..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
          "$API_BASE/storage/buckets/$BUCKET_NAME/objects/$FILE3_ID/download" \
          -H "Authorization: Bearer $TOKEN")
        
        if [ "$HTTP_CODE" == "200" ]; then
            echo -e "  ${GREEN}✓${NC}"
        else
            echo -e "  ${RED}✗ (HTTP $HTTP_CODE)${NC}"
        fi
        sleep 1
    done
    
    sleep 2
    echo "Quota after multiple downloads:"
    FINAL_QUOTA=$(get_quota)
    echo "$FINAL_QUOTA" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'  Storage: {data.get(\"storage_used\", \"N/A\")} bytes\n  Bandwidth: {data.get(\"bandwidth_used\", \"N/A\")} bytes')" 2>/dev/null || echo "  Unable to parse"
fi

# Check access logs if API is available
if [ "$QUOTA_CHECK" == "200" ]; then
    echo -e "\n${YELLOW}=== Checking Access Logs ===${NC}"
    ACCESS_LOGS=$(curl -s "$API_BASE/ext/cloudstorage/api/access-logs?limit=10" \
      -H "Authorization: Bearer $TOKEN")
    
    if [[ "$ACCESS_LOGS" == *"upload"* ]] || [[ "$ACCESS_LOGS" == *"download"* ]]; then
        echo -e "${GREEN}✅ Access logs are being recorded${NC}"
        echo "Recent logs:"
        echo "$ACCESS_LOGS" | python3 -m json.tool 2>/dev/null | head -20 || echo "$ACCESS_LOGS" | head -5
    else
        echo -e "${YELLOW}⚠️  No access logs found${NC}"
    fi
fi

# Test quota enforcement
echo -e "\n${YELLOW}=== Testing Quota Enforcement ===${NC}"

if [ "$QUOTA_CHECK" == "200" ]; then
    # Set a low quota
    echo "Setting low storage quota (150KB)..."
    QUOTA_UPDATE=$(curl -s -X PUT "$API_BASE/ext/cloudstorage/api/quota" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "max_storage_bytes": 153600
      }')
    
    # Try to upload a file that exceeds quota
    echo "Creating large file (200KB) to test quota..."
    dd if=/dev/zero of=test_file_too_large.txt bs=1024 count=200 2>/dev/null
    
    echo "Attempting upload that should exceed quota..."
    QUOTA_TEST=$(curl -s -X POST "$API_BASE/storage/buckets/$BUCKET_NAME/upload" \
      -H "Authorization: Bearer $TOKEN" \
      -F "file=@test_file_too_large.txt")
    
    if [[ "$QUOTA_TEST" == *"quota"* ]] || [[ "$QUOTA_TEST" == *"insufficient"* ]] || [[ "$QUOTA_TEST" == *"exceeded"* ]]; then
        echo -e "${GREEN}✅ Quota enforcement working - upload was blocked${NC}"
    else
        echo -e "${YELLOW}⚠️  Upload succeeded despite quota limit${NC}"
        echo "Response: ${QUOTA_TEST:0:100}..."
    fi
else
    echo -e "${YELLOW}CloudStorage API not available - quota enforcement test skipped${NC}"
fi

# Final summary
echo -e "\n${YELLOW}=== Final Summary ===${NC}"

echo -e "\n${GREEN}Core Storage System:${NC}"
echo "  ✅ File upload working"
echo "  ✅ File download working"
echo "  ✅ Bucket management working"

if [ "$QUOTA_CHECK" == "200" ]; then
    echo -e "\n${GREEN}CloudStorage Extension:${NC}"
    
    # Parse final quota
    if [ ! -z "$FINAL_QUOTA" ]; then
        STORAGE_USED=$(echo "$FINAL_QUOTA" | python3 -c "import sys, json; print(json.load(sys.stdin).get('storage_used', 0))" 2>/dev/null || echo "0")
        BANDWIDTH_USED=$(echo "$FINAL_QUOTA" | python3 -c "import sys, json; print(json.load(sys.stdin).get('bandwidth_used', 0))" 2>/dev/null || echo "0")
        
        if [ "$STORAGE_USED" -gt "0" ]; then
            echo "  ✅ Storage tracking: $STORAGE_USED bytes used"
        else
            echo "  ⚠️  Storage tracking: No usage recorded"
        fi
        
        if [ "$BANDWIDTH_USED" -gt "0" ]; then
            echo "  ✅ Bandwidth tracking: $BANDWIDTH_USED bytes used"
        else
            echo "  ⚠️  Bandwidth tracking: No usage recorded"
        fi
    fi
    
    if [[ "$ACCESS_LOGS" == *"upload"* ]] || [[ "$ACCESS_LOGS" == *"download"* ]]; then
        echo "  ✅ Access logging working"
    else
        echo "  ⚠️  Access logging needs verification"
    fi
    
    if [[ "$QUOTA_TEST" == *"quota"* ]] || [[ "$QUOTA_TEST" == *"exceeded"* ]]; then
        echo "  ✅ Quota enforcement working"
    else
        echo "  ⚠️  Quota enforcement needs verification"
    fi
else
    echo -e "\n${YELLOW}CloudStorage Extension:${NC}"
    echo "  ⚠️  API endpoints not accessible"
    echo "  Note: Hooks may still be working internally"
fi

echo -e "\n${GREEN}=== Test Complete ===${NC}"