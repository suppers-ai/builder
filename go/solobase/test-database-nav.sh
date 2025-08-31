#!/bin/bash

echo "Testing Database Navigation Fix"
echo "================================"

# Login first to get session
echo "1. Logging in..."
SESSION=$(curl -s -c /tmp/cookies.txt -X POST http://localhost:8091/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@example.com&password=AdminSecurePass2024!" \
  -L -o /dev/null -w "%{http_code}")

if [ "$SESSION" != "200" ]; then
    echo "Login failed with status: $SESSION"
    exit 1
fi
echo "Login successful"

# Test regular page load
echo ""
echo "2. Testing regular database page load..."
RESPONSE=$(curl -s -b /tmp/cookies.txt http://localhost:8091/database)
if echo "$RESPONSE" | grep -q "Table Editor"; then
    echo "✓ Regular page load works"
else
    echo "✗ Regular page load failed"
fi

# Test HTMX request to database page
echo ""
echo "3. Testing HTMX request to database page..."
HTMX_RESPONSE=$(curl -s -b /tmp/cookies.txt -H "HX-Request: true" http://localhost:8091/database)
if echo "$HTMX_RESPONSE" | grep -q 'id="main-content"'; then
    echo "✓ HTMX response includes main-content ID"
else
    echo "✗ HTMX response missing main-content ID"
fi

# Test selecting a table via HTMX
echo ""
echo "4. Testing table selection via HTMX..."
TABLE_RESPONSE=$(curl -s -b /tmp/cookies.txt -H "HX-Request: true" "http://localhost:8091/database?schema=auth&table=users")
if echo "$TABLE_RESPONSE" | grep -q 'id="main-content"'; then
    echo "✓ Table selection preserves main-content ID"
    if echo "$TABLE_RESPONSE" | grep -q "auth.users"; then
        echo "✓ Table data loaded correctly"
    else
        echo "✗ Table data not loaded"
    fi
else
    echo "✗ Table selection missing main-content ID"
fi

# Cleanup
rm -f /tmp/cookies.txt

echo ""
echo "Test complete!"