#!/bin/bash

# Script to check users in the database

echo "=== Checking Users in Database ==="

# PostgreSQL connection (adjust these as needed)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

echo "Using database: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Check users table
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Check which auth tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%'
ORDER BY table_name;

-- Try common user table names
SELECT 'Checking users table:' as info;
SELECT id, email, role, created_at 
FROM users 
LIMIT 10;
EOF

echo ""
echo "Note: Password hashes are not shown for security"