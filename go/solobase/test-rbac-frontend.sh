#!/bin/bash

echo "==================================="
echo "Testing Role-Based Access Control"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API endpoint
BASE_URL="http://localhost:8092"

echo -e "\n${YELLOW}Step 1: Testing user with 'user' role${NC}"
echo "Creating a test user with 'user' role..."

# Create a user with 'user' role
curl -s -X POST "$BASE_URL/api/admin/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestUser123!",
    "role": "user",
    "confirmed": true
  }' > /dev/null 2>&1

echo "User created (or already exists)"

echo -e "\n${YELLOW}Step 2: Logging in as the test user${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestUser123!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to login as test user${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully logged in as test user${NC}"

echo -e "\n${YELLOW}Step 3: Testing access to admin endpoints with 'user' role${NC}"

# Test accessing admin pages (should be denied)
ENDPOINTS=(
    "/api/admin/users"
    "/api/database/tables"
    "/api/storage/buckets"
    "/api/settings"
    "/api/collections"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo -n "Testing $endpoint: "
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL$endpoint")
    
    if [ "$RESPONSE" = "403" ] || [ "$RESPONSE" = "401" ]; then
        echo -e "${GREEN}Access denied (Expected)${NC}"
    else
        echo -e "${RED}Access allowed - HTTP $RESPONSE (Should be denied!)${NC}"
    fi
done

echo -e "\n${YELLOW}Step 4: Testing access to allowed endpoints${NC}"

# Test accessing profile (should be allowed)
echo -n "Testing /api/auth/me (profile): "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/auth/me")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}Access allowed (Expected)${NC}"
else
    echo -e "${RED}Access denied - HTTP $RESPONSE (Should be allowed!)${NC}"
fi

echo -e "\n${YELLOW}Step 5: Frontend Navigation Test Instructions${NC}"
echo "Please manually test the following in the browser:"
echo "1. Navigate to http://localhost:8092"
echo "2. Login with testuser@example.com / TestUser123!"
echo "3. Verify you are redirected to /profile page"
echo "4. Try to manually navigate to admin pages:"
echo "   - /users - Should redirect to /profile"
echo "   - /database - Should redirect to /profile"
echo "   - /storage - Should redirect to /profile"
echo "   - /settings - Should redirect to /profile"
echo "   - /collections - Should redirect to /profile"
echo "5. Verify the sidebar does not show admin menu items"

echo -e "\n${GREEN}Role-based access control testing complete!${NC}"
echo "The frontend should now properly restrict non-admin users."