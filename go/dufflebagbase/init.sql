-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS logger;
CREATE SCHEMA IF NOT EXISTS collections;

-- Grant permissions
GRANT ALL ON SCHEMA auth TO dufflebag;
GRANT ALL ON SCHEMA storage TO dufflebag;
GRANT ALL ON SCHEMA logger TO dufflebag;
GRANT ALL ON SCHEMA collections TO dufflebag;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set default search path
ALTER USER dufflebag SET search_path TO public, auth, storage, logger, collections;