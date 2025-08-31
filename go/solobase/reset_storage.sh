#!/bin/bash

# Script to reset storage for testing
# This will remove folder entries and clean up paths

echo "=== Storage Reset Script ==="
echo "This will clean up your storage database"
echo ""

# PostgreSQL connection (adjust these as needed)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-54322}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

echo "Using database: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Clean up storage
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Remove all folder entries (we only want files)
DELETE FROM storage_objects 
WHERE is_folder = true;

-- Clean up any leading slashes from files
UPDATE storage_objects 
SET object_key = LTRIM(object_key, '/')
WHERE object_key LIKE '/%';

-- Show summary
SELECT 
    bucket_name,
    COUNT(*) as file_count,
    SUM(size) as total_size
FROM storage_objects
GROUP BY bucket_name;

-- Show sample of files
SELECT 
    bucket_name,
    object_key,
    size,
    content_type
FROM storage_objects
LIMIT 10;
EOF

echo ""
echo "Storage cleaned up! Only actual files remain."
echo "Folders will now appear automatically based on file paths."