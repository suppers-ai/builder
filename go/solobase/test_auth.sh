#!/bin/bash

# Test authentication flow

echo "Testing Solobase Authentication"
echo "===================================="

# Base URL
BASE_URL="http://localhost:8091"

# Test credentials - you'll need to update these with your actual admin credentials
EMAIL="admin@solobase.local"
PASSWORD="821w0k4\$Erybyd=O"  # Update this with the generated password

# Create a cookie jar for session persistence
COOKIE_JAR="/tmp/solobase_cookies.txt"

echo "1. Testing login..."
echo "   Email: $EMAIL"

# Login request
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_JAR" -X POST \
  -F "email=$EMAIL" \
  -F "password=$PASSWORD" \
  -w "\n%{http_code}" \
  "$BASE_URL/auth/login")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
echo "   Login response code: $HTTP_CODE"

if [ "$HTTP_CODE" = "303" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "   ✓ Login successful (redirect received)"
else
    echo "   ✗ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "2. Testing authenticated access to routes..."

# Test root route
echo "   Testing / route..."
ROOT_RESPONSE=$(curl -s -b "$COOKIE_JAR" -w "\n%{http_code}" "$BASE_URL/")
ROOT_CODE=$(echo "$ROOT_RESPONSE" | tail -n 1)
echo "   Root route response code: $ROOT_CODE"

if [ "$ROOT_CODE" = "303" ] || [ "$ROOT_CODE" = "302" ] || [ "$ROOT_CODE" = "200" ]; then
    echo "   ✓ Root route accessible"
else
    echo "   ✗ Root route returned $ROOT_CODE"
fi

# Test dashboard route
echo "   Testing /dashboard route..."
DASHBOARD_RESPONSE=$(curl -s -b "$COOKIE_JAR" -w "\n%{http_code}" "$BASE_URL/dashboard")
DASHBOARD_CODE=$(echo "$DASHBOARD_RESPONSE" | tail -n 1)
echo "   Dashboard route response code: $DASHBOARD_CODE"

if [ "$DASHBOARD_CODE" = "200" ]; then
    echo "   ✓ Dashboard accessible"
else
    echo "   ✗ Dashboard returned $DASHBOARD_CODE"
fi

# Test users route (admin only)
echo "   Testing /users route..."
USERS_RESPONSE=$(curl -s -b "$COOKIE_JAR" -w "\n%{http_code}" "$BASE_URL/users")
USERS_CODE=$(echo "$USERS_RESPONSE" | tail -n 1)
echo "   Users route response code: $USERS_CODE"

if [ "$USERS_CODE" = "200" ]; then
    echo "   ✓ Users page accessible (admin access confirmed)"
else
    echo "   ✗ Users page returned $USERS_CODE"
fi

# Test database route (admin only)
echo "   Testing /database route..."
DB_RESPONSE=$(curl -s -b "$COOKIE_JAR" -w "\n%{http_code}" "$BASE_URL/database")
DB_CODE=$(echo "$DB_RESPONSE" | tail -n 1)
echo "   Database route response code: $DB_CODE"

if [ "$DB_CODE" = "200" ]; then
    echo "   ✓ Database page accessible (admin access confirmed)"
else
    echo "   ✗ Database page returned $DB_CODE"
fi

# Test storage route
echo "   Testing /storage route..."
STORAGE_RESPONSE=$(curl -s -b "$COOKIE_JAR" -w "\n%{http_code}" "$BASE_URL/storage")
STORAGE_CODE=$(echo "$STORAGE_RESPONSE" | tail -n 1)
echo "   Storage route response code: $STORAGE_CODE"

if [ "$STORAGE_CODE" = "200" ]; then
    echo "   ✓ Storage page accessible"
else
    echo "   ✗ Storage page returned $STORAGE_CODE"
fi

echo ""
echo "3. Session cookie check..."
if [ -f "$COOKIE_JAR" ]; then
    echo "   Cookies stored:"
    grep -o "solobase-session.*" "$COOKIE_JAR" | head -c 50
    echo "..."
    echo "   ✓ Session cookie created"
fi

echo ""
echo "===================================="
echo "Authentication test complete!"

# Clean up
rm -f "$COOKIE_JAR"