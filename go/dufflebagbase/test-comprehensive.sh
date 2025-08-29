#!/bin/bash

echo "==================================="
echo "COMPREHENSIVE DUFFLEBAG TEST SUITE"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((TESTS_FAILED++))
    fi
}

echo "1. Testing PostgreSQL Database"
echo "-------------------------------"

# Start PostgreSQL version
DATABASE_TYPE=postgres DATABASE_URL="postgresql://dufflebag:dufflebag123@localhost:5432/dufflebagbase?sslmode=disable" DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="AdminSecurePass2024!" PORT=8091 ./dufflebag &
PG_PID=$!
sleep 3

# Test PostgreSQL login
curl -s -X POST http://localhost:8091/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=admin@example.com&password=AdminSecurePass2024!" \
    -c cookies-pg.txt -w "%{http_code}" -o /dev/null | grep -q "303"
print_result $? "PostgreSQL: Admin login"

# Test PostgreSQL routes
for route in dashboard database storage users settings; do
    STATUS=$(curl -s -b cookies-pg.txt http://localhost:8091/$route -o /dev/null -w "%{http_code}")
    [ "$STATUS" = "200" ]
    print_result $? "PostgreSQL: Access /$route (HTTP $STATUS)"
done

# Test PostgreSQL API
STATUS=$(curl -s -b cookies-pg.txt http://localhost:8091/api/dashboard/cpu-stats -o /dev/null -w "%{http_code}")
[ "$STATUS" = "200" ]
print_result $? "PostgreSQL: API endpoint (HTTP $STATUS)"

# Kill PostgreSQL version
kill $PG_PID 2>/dev/null
wait $PG_PID 2>/dev/null
sleep 2  # Wait for port to be released

echo ""
echo "2. Testing SQLite Database"
echo "--------------------------"

# Clean up SQLite database
rm -f test.db

# Start SQLite version
DATABASE_TYPE=sqlite DATABASE_URL=file:./test.db DEFAULT_ADMIN_EMAIL="admin@example.com" DEFAULT_ADMIN_PASSWORD="AdminSecurePass2024!" PORT=8092 ./dufflebag &
SQLITE_PID=$!
sleep 3

# Test SQLite login
curl -s -X POST http://localhost:8092/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=admin@example.com&password=AdminSecurePass2024!" \
    -c cookies-sqlite.txt -w "%{http_code}" -o /dev/null | grep -q "303"
print_result $? "SQLite: Admin login"

# Test SQLite routes
for route in dashboard database storage users settings; do
    STATUS=$(curl -s -b cookies-sqlite.txt http://localhost:8092/$route -o /dev/null -w "%{http_code}")
    [ "$STATUS" = "200" ]
    print_result $? "SQLite: Access /$route (HTTP $STATUS)"
done

# Test SQLite API
STATUS=$(curl -s -b cookies-sqlite.txt http://localhost:8092/api/dashboard/cpu-stats -o /dev/null -w "%{http_code}")
[ "$STATUS" = "200" ]
print_result $? "SQLite: API endpoint (HTTP $STATUS)"

# Check SQLite database file was created
[ -f "test.db" ] && [ -s "test.db" ]
print_result $? "SQLite: Database file created"

# Kill SQLite version
kill $SQLITE_PID 2>/dev/null
wait $SQLITE_PID 2>/dev/null

echo ""
echo "==================================="
echo "TEST RESULTS"
echo "==================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

# Clean up
rm -f cookies-pg.txt cookies-sqlite.txt

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi