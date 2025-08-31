-- Remove all folder entries from storage_objects
-- We only want actual files in the database

-- Delete all folder entries
DELETE FROM storage_objects 
WHERE is_folder = true;

-- Clean up any leading slashes from remaining files
UPDATE storage_objects 
SET object_key = LTRIM(object_key, '/')
WHERE object_key LIKE '/%';

-- Show remaining objects (should only be actual files)
SELECT id, bucket_name, object_key, size, content_type, is_folder 
FROM storage_objects 
ORDER BY bucket_name, object_key;