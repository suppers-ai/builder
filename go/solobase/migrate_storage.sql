-- Migration script to update storage_objects table for the new schema

-- Add new columns if they don't exist
ALTER TABLE storage_objects ADD COLUMN IF NOT EXISTS object_type VARCHAR(10) DEFAULT 'file';
ALTER TABLE storage_objects ADD COLUMN IF NOT EXISTS parent_folder_id VARCHAR(255);
ALTER TABLE storage_objects ADD COLUMN IF NOT EXISTS checksum VARCHAR(255);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_storage_objects_object_type ON storage_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_storage_objects_parent_folder_id ON storage_objects(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_checksum ON storage_objects(checksum);
CREATE INDEX IF NOT EXISTS idx_storage_objects_object_key ON storage_objects(object_key);

-- Update existing rows to set object_type based on is_folder if it exists
UPDATE storage_objects 
SET object_type = CASE 
    WHEN is_folder = true THEN 'folder'
    ELSE 'file'
END
WHERE object_type IS NULL;

-- Drop the old is_folder column if it exists
ALTER TABLE storage_objects DROP COLUMN IF EXISTS is_folder;

-- Display the updated schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'storage_objects' 
ORDER BY ordinal_position;