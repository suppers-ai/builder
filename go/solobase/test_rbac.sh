#!/bin/bash

# Test script for RBAC implementation
# This script tests role-based access control for different user roles

API_BASE="http://localhost:8091"
ADMIN_BASE="$API_BASE/admin"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

echo "====================================="
echo "RBAC Testing Script for SolobaseBase"
echo "====================================="
echo ""

# Test user tokens (you'll need to replace these with actual tokens after login)
# These would typically be obtained from the login endpoint
echo "NOTE: You need to set up test users first and obtain their session tokens."
echo "Run these SQL commands in your database:"
echo ""
echo "-- Create test users with different roles"
echo "INSERT INTO auth.users (email, confirmed, role, password) VALUES"
echo "  ('test.user@example.com', true, 'user', crypt('admin123', gen_salt('bf'))),"
echo "  ('test.manager@example.com', true, 'manager', crypt('admin123', gen_salt('bf'))),"
echo "  ('test.admin@example.com', true, 'admin', crypt('admin123', gen_salt('bf'))),"
echo "  ('test.deleted@example.com', true, 'deleted', crypt('admin123', gen_salt('bf')))"
echo "ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;"
echo ""
echo "Then login with each user to get session cookies."
echo ""
echo "For now, testing without authentication (assuming local development)..."
echo ""

# Test 1: Check if server is running
echo "Test 1: Server availability"
curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_result 0 "Server is running"
else
    print_result 1 "Server is not running on port 8091"
    echo "Please start the server with: DATABASE_URL='...' PORT=8091 ./solobase"
    exit 1
fi

echo ""
echo "Test 2: Testing public endpoints (should work for everyone)"
curl -s -o /dev/null -w "%{http_code}" "$API_BASE/auth/login" | grep -q "405\|200"
print_result $? "Public auth endpoints accessible"

echo ""
echo "Test 3: Testing protected web routes (requires authentication)"
echo "These should redirect to login when not authenticated:"

# Test dashboard access
response=$(curl -s -o /dev/null -w "%{http_code}" -L "$API_BASE/dashboard")
if [ "$response" = "302" ] || [ "$response" = "401" ]; then
    print_result 0 "Dashboard properly protected (redirects when unauthenticated)"
else
    print_result 1 "Dashboard protection issue (got $response)"
fi

# Test users page access
response=$(curl -s -o /dev/null -w "%{http_code}" -L "$API_BASE/users")
if [ "$response" = "302" ] || [ "$response" = "401" ]; then
    print_result 0 "Users page properly protected (redirects when unauthenticated)"
else
    print_result 1 "Users page protection issue (got $response)"
fi

echo ""
echo "Test 4: Testing API endpoints (requires authentication)"
echo "These should return 401 when not authenticated:"

# Test API collections endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/v1/collections")
if [ "$response" = "401" ]; then
    print_result 0 "Collections API properly protected"
else
    print_result 1 "Collections API protection issue (got $response)"
fi

# Test API users endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/v1/admin/users")
if [ "$response" = "401" ]; then
    print_result 0 "Users API properly protected"
else
    print_result 1 "Users API protection issue (got $response)"
fi

echo ""
echo "====================================="
echo "Manual Testing Instructions"
echo "====================================="
echo ""
echo "1. Create test users with the SQL above"
echo "2. Login as each user type and test:"
echo ""
echo "   USER ROLE (test.user@example.com):"
echo "   - Should NOT be able to access /admin/dashboard"
echo "   - Should NOT be able to access any /admin/* pages"
echo "   - Should NOT be able to use API endpoints"
echo ""
echo "   MANAGER ROLE (test.manager@example.com):"
echo "   - SHOULD be able to access /admin/dashboard (read-only)"
echo "   - SHOULD be able to view users, collections, storage"
echo "   - Should NOT be able to modify data (create, update, delete)"
echo "   - CAN use GET API endpoints"
echo "   - CANNOT use POST, PUT, DELETE API endpoints"
echo ""
echo "   ADMIN ROLE (test.admin@example.com):"
echo "   - Full access to all /admin/* pages"
echo "   - Can create, update, delete all resources"
echo "   - Full access to all API endpoints"
echo ""
echo "   DELETED ROLE (test.deleted@example.com):"
echo "   - Should NOT be able to login"
echo "   - Should NOT be able to access anything"
echo "   - All API calls should be blocked"
echo ""
echo "3. Test role changing:"
echo "   - Login as admin"
echo "   - Go to /admin/users"
echo "   - Try changing user roles and verify permissions update"
echo ""
echo "4. Test lock/unlock:"
echo "   - Lock a user account"
echo "   - Verify they cannot login"
echo "   - Unlock and verify they can login again"