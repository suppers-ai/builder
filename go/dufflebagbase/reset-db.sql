-- Drop all existing tables to start fresh
DROP TABLE IF EXISTS storage_objects CASCADE;
DROP TABLE IF EXISTS storage_buckets CASCADE;
DROP TABLE IF EXISTS auth_tokens CASCADE;
DROP TABLE IF EXISTS auth_sessions CASCADE;
DROP TABLE IF EXISTS auth_users CASCADE;

-- Drop any other tables that might exist
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS logger_logs CASCADE;