-- Script to grant admin role to a user
-- Replace 'your-email@example.com' with your actual email

-- First, check existing users
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- Update a specific user to have admin role
-- Uncomment and modify the line below with the correct email or user ID:

-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
-- OR
-- UPDATE users SET role = 'admin' WHERE id = 'your-user-id-here';

-- Verify the update
-- SELECT id, email, role FROM users WHERE role = 'admin';

-- If you want to make the first user an admin:
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);