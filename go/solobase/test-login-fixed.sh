#!/bin/bash

echo "Starting login test..."
echo ""

# Start the application in the background
echo "Starting application with PostgreSQL..."
DATABASE_TYPE=postgres DATABASE_URL="postgresql://solobase:solobase123@localhost:5432/solobase?sslmode=disable" DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="admin123" PORT=8091 ./solobase &
APP_PID=$!

# Wait for app to start
echo "Waiting for application to start..."
sleep 3

# Test if app is running
if ! kill -0 $APP_PID 2>/dev/null; then
    echo "❌ Application failed to start"
    exit 1
fi

echo "✅ Application started on port 8091"
echo ""

# Test login
echo "Testing login with admin@example.com..."
RESPONSE=$(curl -s -c cookies.txt -X POST http://localhost:8091/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@example.com&password=admin123" \
  -w "\n%{http_code}" \
  -L)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Response Code: $HTTP_CODE"

# Check if we got redirected to dashboard (303 then 200)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "303" ]; then
    # Check if session cookie was set
    if grep -q "session_id" cookies.txt; then
        echo "✅ Login successful - session cookie set"
        
        # Test accessing dashboard
        echo ""
        echo "Testing dashboard access..."
        DASHBOARD_RESPONSE=$(curl -s -b cookies.txt http://localhost:8091/dashboard -w "\n%{http_code}")
        DASHBOARD_CODE=$(echo "$DASHBOARD_RESPONSE" | tail -n 1)
        
        if [ "$DASHBOARD_CODE" = "200" ]; then
            echo "✅ Dashboard access successful"
        else
            echo "❌ Dashboard access failed with code: $DASHBOARD_CODE"
        fi
    else
        echo "❌ Login failed - no session cookie"
    fi
else
    echo "❌ Login failed with HTTP code: $HTTP_CODE"
    echo "Response body:"
    echo "$BODY" | head -100
fi

# Cleanup
echo ""
echo "Cleaning up..."
kill $APP_PID 2>/dev/null
rm -f cookies.txt

echo "Test complete!"