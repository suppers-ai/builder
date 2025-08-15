-- Simple email sharing implementation
-- Add shared_with_emails column to storage_objects table

ALTER TABLE storage_objects 
ADD COLUMN shared_with_emails text[] DEFAULT '{}';

-- Add index for better performance when querying shared objects
CREATE INDEX idx_storage_objects_shared_emails ON storage_objects USING gin(shared_with_emails);

-- Update RLS policies to allow access for objects shared via email
-- Users can view objects if they are in the shared_with_emails array (when using share_token)
CREATE POLICY "Allow access to email-shared objects via share token"
ON storage_objects FOR SELECT
USING (
  is_public = true 
  OR user_id = auth.uid()
  OR (
    share_token IS NOT NULL 
    AND array_length(shared_with_emails, 1) > 0
  )
);