DROP TRIGGER IF EXISTS update_auth_sessions_updated_at ON auth.sessions;
DROP TRIGGER IF EXISTS update_auth_users_updated_at ON auth.users;
DROP FUNCTION IF EXISTS auth.update_updated_at_column();

DROP TABLE IF EXISTS auth.remember_tokens;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.users;

DROP SCHEMA IF EXISTS auth CASCADE;