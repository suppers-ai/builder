#!/bin/bash

# Test database column display issue

PORT=8094
BASE_URL="http://localhost:$PORT"

echo "Testing database column display in solobase admin..."

# Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Test123456789!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to login"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in successfully"

# Get database tables
echo -e "\n2. Getting database tables..."
TABLES=$(curl -s -X GET "$BASE_URL/api/database/tables" \
  -H "Authorization: Bearer $TOKEN")

echo "Tables response:"
echo "$TABLES" | jq '.'

# Get columns for users table
echo -e "\n3. Getting columns for users table..."
COLUMNS=$(curl -s -X GET "$BASE_URL/api/database/tables/users/columns" \
  -H "Authorization: Bearer $TOKEN")

echo "Columns for users:"
echo "$COLUMNS" | jq '.'

# Execute a direct query to see what columns are returned
echo -e "\n4. Executing direct query on users table..."
QUERY_RESULT=$(curl -s -X POST "$BASE_URL/api/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM users LIMIT 2"
  }')

echo "Query result:"
echo "$QUERY_RESULT" | jq '.'

# Check if user_id column is present
echo -e "\n5. Checking for user_id column..."
if echo "$QUERY_RESULT" | jq -r '.columns[]' 2>/dev/null | grep -q "user_id"; then
  echo "✅ user_id column found in query result"
else
  echo "❌ user_id column NOT found in query result"
  echo "Columns returned:"
  echo "$QUERY_RESULT" | jq -r '.columns[]' 2>/dev/null
fi

echo -e "\nDone!"