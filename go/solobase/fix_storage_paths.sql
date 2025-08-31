-- Fix storage object paths to remove leading slashes
-- This ensures consistent path handling in the storage system

-- Update folders that have leading slashes
UPDATE storage_objects 
SET object_key = LTRIM(object_key, '/')
WHERE object_key LIKE '/%';

-- Verify the changes
SELECT id, bucket_name, object_key, is_folder 
FROM storage_objects 
ORDER BY bucket_name, object_key;