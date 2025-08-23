-- Create the sorted-storage application
INSERT INTO applications (id, name, slug, description, status, created_at, updated_at) 
VALUES (
    gen_random_uuid(), 
    'Sorted Storage', 
    'sorted-storage', 
    'File storage and management application', 
    'active', 
    NOW(), 
    NOW()
) 
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Verify the application was created
SELECT * FROM applications WHERE slug = 'sorted-storage';