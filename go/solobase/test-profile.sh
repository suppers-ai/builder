#!/bin/bash

echo "Testing Profile Page Functionality"
echo "=================================="

# Base URL
BASE_URL="http://localhost:8093"

# Login first
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Test123456789!"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✓ Login successful"
echo "Token: ${TOKEN:0:20}..."

# Get current user
echo ""
echo "2. Getting current user profile..."
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Current user: $USER_RESPONSE" | python3 -m json.tool | head -20

# Update user profile
echo ""
echo "3. Updating user profile..."
USER_ID=$(echo $USER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Admin",
    "last_name": "User",
    "display_name": "Administrator",
    "phone": "+1234567890",
    "location": "San Francisco, CA"
  }')

echo "Update response: $UPDATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPDATE_RESPONSE"

# Test change password
echo ""
echo "4. Testing change password endpoint..."
CHANGE_PWD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "Test123456789!",
    "new_password": "NewPassword123!"
  }')

echo "Change password response: $CHANGE_PWD_RESPONSE"

# Test with wrong current password
echo ""
echo "5. Testing change password with wrong current password..."
WRONG_PWD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "WrongPassword",
    "new_password": "NewPassword123!"
  }')

echo "Wrong password response: $WRONG_PWD_RESPONSE"

echo ""
echo "=================================="
echo "Profile functionality test complete!"