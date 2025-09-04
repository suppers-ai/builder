-- Initialize CloudStorage profile visibility setting
-- This script sets the default setting to show storage usage in user profiles

-- Check and insert the setting if it doesn't exist
INSERT INTO settings (id, key, value, type, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'ext_cloudstorage_profile_show_usage',
    'true',
    'bool',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM settings 
    WHERE key = 'ext_cloudstorage_profile_show_usage'
);