#!/bin/bash

echo "Testing Dufflebag Settings API..."
echo "================================"

# Try to login
echo -n "1. Logging in as admin... "
RESPONSE=$(curl -s -X POST http://localhost:8092/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Test123456789!"}')

TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "FAILED"
  echo "   Response: $RESPONSE"
  echo ""
  echo "Checking database for admin user..."
  sqlite3 dufflebagbase.db "SELECT email, role FROM auth_users;" 2>/dev/null || echo "   No users found in database"
  exit 1
else
  echo "SUCCESS"
  echo "   Token: ${TOKEN:0:30}..."
fi

echo ""
echo "2. Fetching current settings..."
SETTINGS=$(curl -s http://localhost:8092/api/settings \
  -H "Authorization: Bearer $TOKEN")

if echo "$SETTINGS" | jq . >/dev/null 2>&1; then
  echo "   Settings retrieved successfully:"
  echo "$SETTINGS" | jq '.' | head -20
else
  echo "   Failed to get settings: $SETTINGS"
fi

echo ""
echo "3. Updating a setting (app_name)..."
UPDATE_RESPONSE=$(curl -s -X PATCH http://localhost:8092/api/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"app_name":"Dufflebag Test","enable_debug_mode":true}')

if echo "$UPDATE_RESPONSE" | jq . >/dev/null 2>&1; then
  echo "   Update successful:"
  echo "$UPDATE_RESPONSE" | jq '.app_name, .enable_debug_mode'
else
  echo "   Update failed: $UPDATE_RESPONSE"
fi

echo ""
echo "4. Testing reset endpoint..."
RESET_RESPONSE=$(curl -s -X POST http://localhost:8092/api/settings/reset \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESET_RESPONSE" | jq . >/dev/null 2>&1; then
  echo "   Reset successful. Default values:"
  echo "$RESET_RESPONSE" | jq '.app_name, .enable_debug_mode'
else
  echo "   Reset failed: $RESET_RESPONSE"
fi

echo ""
echo "Settings API test complete!"