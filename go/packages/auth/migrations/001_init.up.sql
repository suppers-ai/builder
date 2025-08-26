CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    username VARCHAR(255),
    confirmed BOOLEAN DEFAULT false,
    confirm_token VARCHAR(255),
    confirm_selector VARCHAR(255),
    recover_token VARCHAR(255),
    recover_token_exp TIMESTAMP,
    recover_selector VARCHAR(255),
    totp_secret VARCHAR(255),
    totp_secret_backup VARCHAR(255),
    sms_phone_number VARCHAR(50),
    recovery_codes TEXT,
    oauth2_uid VARCHAR(255),
    oauth2_provider VARCHAR(50),
    oauth2_token TEXT,
    oauth2_refresh TEXT,
    oauth2_expiry TIMESTAMP,
    locked BOOLEAN DEFAULT false,
    attempt_count INTEGER DEFAULT 0,
    last_attempt TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_users_email ON auth.users(email);
CREATE INDEX idx_auth_users_confirm_selector ON auth.users(confirm_selector);
CREATE INDEX idx_auth_users_recover_selector ON auth.users(recover_selector);
CREATE INDEX idx_auth_users_oauth2 ON auth.users(oauth2_provider, oauth2_uid);

CREATE TABLE IF NOT EXISTS auth.sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    data BYTEA NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_sessions_expires_at ON auth.sessions(expires_at);
CREATE INDEX idx_auth_sessions_user_id ON auth.sessions(user_id);

CREATE TABLE IF NOT EXISTS auth.remember_tokens (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_remember_tokens_user_id ON auth.remember_tokens(user_id);
CREATE INDEX idx_auth_remember_tokens_token ON auth.remember_tokens(token);
CREATE INDEX idx_auth_remember_tokens_expires_at ON auth.remember_tokens(expires_at);

CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE
    ON auth.users FOR EACH ROW EXECUTE PROCEDURE
    auth.update_updated_at_column();

CREATE TRIGGER update_auth_sessions_updated_at BEFORE UPDATE
    ON auth.sessions FOR EACH ROW EXECUTE PROCEDURE
    auth.update_updated_at_column();