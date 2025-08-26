-- Dynamic Products Application Schema
-- PostgreSQL schema for dynamic entity and product management
-- Using dedicated schema: dynamicproducts

-- Create schema
CREATE SCHEMA IF NOT EXISTS dynamicproducts;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table for this application
CREATE TABLE IF NOT EXISTS dynamicproducts.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'seller')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Entity types configuration (admin-managed)
CREATE TABLE IF NOT EXISTS dynamicproducts.entity_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    metadata_schema JSONB, -- Defines allowed metadata fields and their types
    filter_config JSONB, -- Defines which filter columns are used and their labels
    location_required BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Entity sub-types configuration (admin-managed)
CREATE TABLE IF NOT EXISTS dynamicproducts.entity_sub_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type_id UUID NOT NULL REFERENCES dynamicproducts.entity_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    metadata_schema JSONB, -- Inherits from parent type, can override/extend
    filter_config JSONB, -- Inherits from parent type, can override/extend
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(entity_type_id, name)
);

-- Entities table (seller-created)
CREATE TABLE IF NOT EXISTS dynamicproducts.entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES dynamicproducts.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    photos JSONB, -- Array of photo objects
    type TEXT NOT NULL DEFAULT 'general',
    sub_type TEXT,
    metadata JSONB, -- Flexible metadata storage based on type configuration
    location GEOGRAPHY(Point, 4326), -- Geographic location
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    -- Dynamic filter columns
    filter_numeric_1 DECIMAL,
    filter_numeric_2 DECIMAL,
    filter_numeric_3 DECIMAL,
    filter_numeric_4 DECIMAL,
    filter_numeric_5 DECIMAL,
    filter_text_1 TEXT,
    filter_text_2 TEXT,
    filter_text_3 TEXT,
    filter_text_4 TEXT,
    filter_text_5 TEXT,
    filter_boolean_1 BOOLEAN,
    filter_boolean_2 BOOLEAN,
    filter_boolean_3 BOOLEAN,
    filter_boolean_4 BOOLEAN,
    filter_boolean_5 BOOLEAN,
    filter_date_1 DATE,
    filter_date_2 DATE,
    filter_date_3 DATE,
    filter_date_4 DATE,
    filter_date_5 DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deleted')),
    verified BOOLEAN NOT NULL DEFAULT true,
    version_id INTEGER NOT NULL DEFAULT 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product types configuration (admin-managed)
CREATE TABLE IF NOT EXISTS dynamicproducts.product_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    metadata_schema JSONB, -- Defines allowed metadata fields and their types
    filter_config JSONB, -- Defines which filter columns are used and their labels
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product sub-types configuration (admin-managed)
CREATE TABLE IF NOT EXISTS dynamicproducts.product_sub_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type_id UUID NOT NULL REFERENCES dynamicproducts.product_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    metadata_schema JSONB, -- Inherits from parent type, can override/extend
    filter_config JSONB, -- Inherits from parent type, can override/extend
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(product_type_id, name)
);

-- Products table (seller-created)
CREATE TABLE IF NOT EXISTS dynamicproducts.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES dynamicproducts.users(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES dynamicproducts.entities(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    thumbnail_url TEXT,
    photos JSONB, -- Array of photo URLs
    type TEXT NOT NULL DEFAULT 'service',
    sub_type TEXT,
    metadata JSONB, -- Flexible metadata storage based on type configuration
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    -- Dynamic filter columns
    filter_numeric_1 DECIMAL,
    filter_numeric_2 DECIMAL,
    filter_numeric_3 DECIMAL,
    filter_numeric_4 DECIMAL,
    filter_numeric_5 DECIMAL,
    filter_text_1 TEXT,
    filter_text_2 TEXT,
    filter_text_3 TEXT,
    filter_text_4 TEXT,
    filter_text_5 TEXT,
    filter_boolean_1 BOOLEAN,
    filter_boolean_2 BOOLEAN,
    filter_boolean_3 BOOLEAN,
    filter_boolean_4 BOOLEAN,
    filter_boolean_5 BOOLEAN,
    filter_date_1 DATE,
    filter_date_2 DATE,
    filter_date_3 DATE,
    filter_date_4 DATE,
    filter_date_5 DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    version_id INTEGER NOT NULL DEFAULT 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Purchases/Sales tracking
CREATE TABLE IF NOT EXISTS dynamicproducts.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES dynamicproducts.products(id) ON DELETE CASCADE,
    buyer_email TEXT NOT NULL,
    buyer_name TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    payment_method TEXT,
    payment_id TEXT,
    metadata JSONB, -- Additional purchase data
    source TEXT, -- Source of the purchase (api, web, etc.)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Entity views tracking
CREATE TABLE IF NOT EXISTS dynamicproducts.entity_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES dynamicproducts.entities(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES dynamicproducts.users(id) ON DELETE SET NULL,
    viewer_ip TEXT,
    viewer_session TEXT,
    viewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Entity likes tracking
CREATE TABLE IF NOT EXISTS dynamicproducts.entity_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES dynamicproducts.entities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES dynamicproducts.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(entity_id, user_id)
);

-- Product views tracking
CREATE TABLE IF NOT EXISTS dynamicproducts.product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES dynamicproducts.products(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES dynamicproducts.users(id) ON DELETE SET NULL,
    viewer_ip TEXT,
    viewer_session TEXT,
    viewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product likes tracking
CREATE TABLE IF NOT EXISTS dynamicproducts.product_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES dynamicproducts.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES dynamicproducts.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(product_id, user_id)
);

-- Sessions for user authentication
CREATE TABLE IF NOT EXISTS dynamicproducts.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES dynamicproducts.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON dynamicproducts.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON dynamicproducts.users(role);

CREATE INDEX IF NOT EXISTS idx_entities_owner_id ON dynamicproducts.entities(owner_id);
CREATE INDEX IF NOT EXISTS idx_entities_status ON dynamicproducts.entities(status);
CREATE INDEX IF NOT EXISTS idx_entities_type ON dynamicproducts.entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_sub_type ON dynamicproducts.entities(sub_type);
CREATE INDEX IF NOT EXISTS idx_entities_location ON dynamicproducts.entities USING GIST(location) WHERE location IS NOT NULL;

-- Filter column indexes for entities
CREATE INDEX IF NOT EXISTS idx_entities_filter_numeric_1 ON dynamicproducts.entities(filter_numeric_1);
CREATE INDEX IF NOT EXISTS idx_entities_filter_numeric_2 ON dynamicproducts.entities(filter_numeric_2);
CREATE INDEX IF NOT EXISTS idx_entities_filter_text_1 ON dynamicproducts.entities(filter_text_1);
CREATE INDEX IF NOT EXISTS idx_entities_filter_text_2 ON dynamicproducts.entities(filter_text_2);
CREATE INDEX IF NOT EXISTS idx_entities_filter_boolean_1 ON dynamicproducts.entities(filter_boolean_1);
CREATE INDEX IF NOT EXISTS idx_entities_filter_date_1 ON dynamicproducts.entities(filter_date_1);

CREATE INDEX IF NOT EXISTS idx_entity_types_name ON dynamicproducts.entity_types(name);
CREATE INDEX IF NOT EXISTS idx_entity_sub_types_entity_type_id ON dynamicproducts.entity_sub_types(entity_type_id);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON dynamicproducts.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_entity_id ON dynamicproducts.products(entity_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON dynamicproducts.products(type);
CREATE INDEX IF NOT EXISTS idx_products_sub_type ON dynamicproducts.products(sub_type);
CREATE INDEX IF NOT EXISTS idx_products_status ON dynamicproducts.products(status);

-- Filter column indexes for products
CREATE INDEX IF NOT EXISTS idx_products_filter_numeric_1 ON dynamicproducts.products(filter_numeric_1);
CREATE INDEX IF NOT EXISTS idx_products_filter_numeric_2 ON dynamicproducts.products(filter_numeric_2);
CREATE INDEX IF NOT EXISTS idx_products_filter_text_1 ON dynamicproducts.products(filter_text_1);
CREATE INDEX IF NOT EXISTS idx_products_filter_text_2 ON dynamicproducts.products(filter_text_2);
CREATE INDEX IF NOT EXISTS idx_products_filter_boolean_1 ON dynamicproducts.products(filter_boolean_1);
CREATE INDEX IF NOT EXISTS idx_products_filter_date_1 ON dynamicproducts.products(filter_date_1);

CREATE INDEX IF NOT EXISTS idx_product_types_name ON dynamicproducts.product_types(name);
CREATE INDEX IF NOT EXISTS idx_product_sub_types_product_type_id ON dynamicproducts.product_sub_types(product_type_id);

CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON dynamicproducts.purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_email ON dynamicproducts.purchases(buyer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON dynamicproducts.purchases(status);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON dynamicproducts.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON dynamicproducts.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON dynamicproducts.sessions(expires_at);

-- Views and likes tracking indexes
CREATE INDEX IF NOT EXISTS idx_entity_views_entity_id ON dynamicproducts.entity_views(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_likes_entity_id ON dynamicproducts.entity_likes(entity_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON dynamicproducts.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_product_id ON dynamicproducts.product_likes(product_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION dynamicproducts.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON dynamicproducts.users 
    FOR EACH ROW EXECUTE FUNCTION dynamicproducts.update_updated_at_column();
CREATE TRIGGER update_entity_types_updated_at BEFORE UPDATE ON dynamicproducts.entity_types 
    FOR EACH ROW EXECUTE FUNCTION dynamicproducts.update_updated_at_column();
CREATE TRIGGER update_entity_sub_types_updated_at BEFORE UPDATE ON dynamicproducts.entity_sub_types 
    FOR EACH ROW EXECUTE FUNCTION dynamicproducts.update_updated_at_column();
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON dynamicproducts.entities 
    FOR EACH ROW EXECUTE FUNCTION dynamicproducts.update_updated_at_column();
CREATE TRIGGER update_product_types_updated_at BEFORE UPDATE ON dynamicproducts.product_types 
    FOR EACH ROW EXECUTE FUNCTION dynamicproducts.update_updated_at_column();
CREATE TRIGGER update_product_sub_types_updated_at BEFORE UPDATE ON dynamicproducts.product_sub_types 
    FOR EACH ROW EXECUTE FUNCTION dynamicproducts.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON dynamicproducts.products 
    FOR EACH ROW EXECUTE FUNCTION dynamicproducts.update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON dynamicproducts.purchases 
    FOR EACH ROW EXECUTE FUNCTION dynamicproducts.update_updated_at_column();