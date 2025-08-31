#!/bin/bash

# Script to clean up storage object paths in the database
# Run this to fix any existing storage entries with leading slashes

echo "Cleaning up storage object paths..."

# PostgreSQL connection (adjust these as needed)
DB_HOST="127.0.0.1"
DB_PORT="54322"
DB_USER="postgres"
DB_PASS="postgres"
DB_NAME="postgres"

# Clean up storage paths
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Remove leading slashes from all storage objects
UPDATE storage_objects 
SET object_key = LTRIM(object_key, '/')
WHERE object_key LIKE '/%';

-- Show the cleaned up objects
SELECT id, bucket_name, object_key, is_folder 
FROM storage_objects 
ORDER BY bucket_name, object_key;
EOF

echo "Storage paths cleaned up successfully!"