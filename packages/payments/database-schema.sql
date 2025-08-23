-- Payments System Database Schema
-- PostgreSQL schema for the complete payments application
--
-- IMPORTANT: This schema depends on tables from the main API schema:
-- - users table (from packages/api/database-schema.sql)
-- - applications table (from packages/api/database-schema.sql)
-- Make sure the main API schema is loaded first!

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Entity types configuration
CREATE TABLE IF NOT EXISTS entity_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    metadata_schema JSONB, -- Defines allowed metadata fields and their types
    filter_config JSONB, -- Defines which filter columns are used and their labels
    location_required BOOLEAN NOT NULL DEFAULT false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Entity sub-types configuration
CREATE TABLE IF NOT EXISTS entity_sub_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type_id UUID NOT NULL REFERENCES entity_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    metadata_schema JSONB, -- Inherits from parent type, can override/extend
    filter_config JSONB, -- Inherits from parent type, can override/extend
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(entity_type_id, name)
);

-- Entities table (generic entities like places, events, services, etc.)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    connected_application_ids TEXT[], -- Array of application IDs that are connected to this entity
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deleted')),
    verified BOOLEAN NOT NULL DEFAULT true,
    version_id INTEGER NOT NULL DEFAULT 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product types configuration
CREATE TABLE IF NOT EXISTS product_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    metadata_schema JSONB, -- Defines allowed metadata fields and their types
    filter_config JSONB, -- Defines which filter columns are used and their labels
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product sub-types configuration
CREATE TABLE IF NOT EXISTS product_sub_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type_id UUID NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    metadata_schema JSONB, -- Inherits from parent type, can override/extend
    filter_config JSONB, -- Inherits from parent type, can override/extend
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(product_type_id, name)
);

-- Products table (now handles both application and system products)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
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

-- Unified variables table (for products, entities, and users)
CREATE TABLE IF NOT EXISTS variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    variable_id TEXT NOT NULL, -- e.g., 'basePrice', 'maxCapacity', 'storageLimit'
    name TEXT NOT NULL,
    description TEXT,
    value_type TEXT NOT NULL CHECK (value_type IN ('number', 'percentage', 'boolean', 'string')),
    value TEXT NOT NULL, -- Generic value storage, converted based on value_type
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Ensure exactly one of product_id, entity_id, or user_id is set
    CONSTRAINT exactly_one_owner CHECK (
        (product_id IS NOT NULL)::int +
        (entity_id IS NOT NULL)::int +
        (user_id IS NOT NULL)::int = 1
    ),
    -- Ensure unique variable_id per owner
    UNIQUE(product_id, variable_id),
    UNIQUE(entity_id, variable_id),
    UNIQUE(user_id, variable_id)
);

-- Product restrictions (formula IDs)
CREATE TABLE IF NOT EXISTS product_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    formula_name TEXT NOT NULL, -- e.g., 'availableStockCheck', 'maxParticipantsCheck'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(product_id, formula_name)
);

-- Pricing products (pricing configurations)
CREATE TABLE IF NOT EXISTS pricing_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product pricing assignments
CREATE TABLE IF NOT EXISTS product_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    pricing_product_id UUID NOT NULL REFERENCES pricing_products(id) ON DELETE CASCADE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(product_id, pricing_product_id)
);

-- Pricing formulas
CREATE TABLE IF NOT EXISTS pricing_formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pricing_product_id UUID NOT NULL REFERENCES pricing_products(id) ON DELETE CASCADE,
    formula_name TEXT NOT NULL, -- e.g., 'baseCalculation', 'weekendSurcharge'
    name TEXT NOT NULL,
    description TEXT,
    value_calculation JSONB NOT NULL, -- Array of calculation elements
    apply_condition JSONB, -- Array of condition elements
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(pricing_product_id, formula_name)
);

-- Pricing prices (individual price configurations)
CREATE TABLE IF NOT EXISTS pricing_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pricing_product_id UUID NOT NULL REFERENCES pricing_products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'dynamic')),
    amount JSONB, -- Object with currency codes as keys and amounts as values
    formula_names TEXT[], -- Array of formula names for dynamic pricing
    target TEXT NOT NULL CHECK (target IN ('per-participant', 'per-group-of-participants', 'flat')),
    interval TEXT NOT NULL CHECK (interval IN ('per-unit', 'flat')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Billing configurations
CREATE TABLE IF NOT EXISTS billing_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'instant' CHECK (mode IN ('instant', 'approval')),
    type TEXT NOT NULL DEFAULT 'one-time' CHECK (type IN ('one-time', 'recurring')),
    recurring_interval TEXT CHECK (recurring_interval IN ('day', 'week', 'month', 'year')),
    recurring_interval_count INTEGER DEFAULT 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(product_id)
);

-- Cancellation policies
CREATE TABLE IF NOT EXISTS cancellation_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB, -- Array of cancellation conditions
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product cancellation policy assignments
CREATE TABLE IF NOT EXISTS product_cancellation_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    cancellation_policy_id UUID NOT NULL REFERENCES cancellation_policies(id) ON DELETE CASCADE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    UNIQUE(product_id, cancellation_policy_id)
);

-- Purchases/Orders
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_email TEXT NOT NULL, -- Allow guest purchases without account
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    pricing_price_id UUID NOT NULL REFERENCES pricing_prices(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
    payment_type TEXT NOT NULL DEFAULT 'stripe' CHECK (payment_type IN ('stripe')),
    payment_id TEXT, -- Stripe payment intent ID
    metadata JSONB, -- Additional purchase data (including participants info)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions (for recurring billing)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    pricing_price_id UUID NOT NULL REFERENCES pricing_prices(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    subscription_type TEXT NOT NULL DEFAULT 'stripe' CHECK (subscription_type IN ('stripe')),
    subscription_id TEXT,
    metadata JSONB,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Global Variable Definitions (for admin configuration)
-- These define what variables are available system-wide
CREATE TABLE IF NOT EXISTS global_variable_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variable_id TEXT NOT NULL UNIQUE, -- e.g., 'basePrice', 'weekendSurcharge'
    name TEXT NOT NULL, -- User-friendly name: "Base Price"
    description TEXT NOT NULL, -- "The standard price before any adjustments"
    category TEXT NOT NULL CHECK (category IN ('pricing', 'capacity', 'features', 'time', 'restrictions')),
    value_type TEXT NOT NULL CHECK (value_type IN ('number', 'percentage', 'boolean', 'string', 'time', 'date')),
    default_value TEXT, -- Default value for new instances
    validation_rules JSONB, -- {"min": 0, "max": 1000, "required": true}
    display_order INTEGER DEFAULT 0, -- Order in UI
    is_system BOOLEAN DEFAULT false, -- System variables cannot be deleted
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Entity views tracking
CREATE TABLE IF NOT EXISTS entity_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_ip TEXT,
    viewer_session TEXT,
    viewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Entity likes tracking
CREATE TABLE IF NOT EXISTS entity_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product views tracking
CREATE TABLE IF NOT EXISTS product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_ip TEXT,
    viewer_session TEXT,
    viewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product likes tracking
CREATE TABLE IF NOT EXISTS product_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_owner_id ON entities(owner_id);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_sub_type ON entities(sub_type);
CREATE INDEX IF NOT EXISTS idx_entities_location ON entities USING GIST(location) WHERE location IS NOT NULL;
-- Filter column indexes for entities
CREATE INDEX IF NOT EXISTS idx_entities_filter_numeric_1 ON entities(filter_numeric_1);
CREATE INDEX IF NOT EXISTS idx_entities_filter_numeric_2 ON entities(filter_numeric_2);
CREATE INDEX IF NOT EXISTS idx_entities_filter_text_1 ON entities(filter_text_1);
CREATE INDEX IF NOT EXISTS idx_entities_filter_text_2 ON entities(filter_text_2);
CREATE INDEX IF NOT EXISTS idx_entities_filter_boolean_1 ON entities(filter_boolean_1);
CREATE INDEX IF NOT EXISTS idx_entities_filter_date_1 ON entities(filter_date_1);
CREATE INDEX IF NOT EXISTS idx_entities_filter_date_2 ON entities(filter_date_2);

CREATE INDEX IF NOT EXISTS idx_entity_types_name ON entity_types(name);
CREATE INDEX IF NOT EXISTS idx_entity_sub_types_entity_type_id ON entity_sub_types(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_entity_sub_types_name ON entity_sub_types(entity_type_id, name);

CREATE INDEX IF NOT EXISTS idx_variables_product_id ON variables(product_id);
CREATE INDEX IF NOT EXISTS idx_variables_entity_id ON variables(entity_id);
CREATE INDEX IF NOT EXISTS idx_variables_user_id ON variables(user_id);
CREATE INDEX IF NOT EXISTS idx_variables_variable_id ON variables(variable_id);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_entity_id ON products(entity_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_sub_type ON products(sub_type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
-- Filter column indexes for products
CREATE INDEX IF NOT EXISTS idx_products_filter_numeric_1 ON products(filter_numeric_1);
CREATE INDEX IF NOT EXISTS idx_products_filter_numeric_2 ON products(filter_numeric_2);
CREATE INDEX IF NOT EXISTS idx_products_filter_text_1 ON products(filter_text_1);
CREATE INDEX IF NOT EXISTS idx_products_filter_text_2 ON products(filter_text_2);
CREATE INDEX IF NOT EXISTS idx_products_filter_boolean_1 ON products(filter_boolean_1);
CREATE INDEX IF NOT EXISTS idx_products_filter_date_1 ON products(filter_date_1);
CREATE INDEX IF NOT EXISTS idx_products_filter_date_2 ON products(filter_date_2);

CREATE INDEX IF NOT EXISTS idx_product_types_name ON product_types(name);
CREATE INDEX IF NOT EXISTS idx_product_sub_types_product_type_id ON product_sub_types(product_type_id);
CREATE INDEX IF NOT EXISTS idx_product_sub_types_name ON product_sub_types(product_type_id, name);

CREATE INDEX IF NOT EXISTS idx_product_restrictions_product_id ON product_restrictions(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_products_owner_id ON pricing_products(owner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_email ON purchases(buyer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Global variable definitions indexes
CREATE INDEX IF NOT EXISTS idx_global_variable_definitions_variable_id ON global_variable_definitions(variable_id);
CREATE INDEX IF NOT EXISTS idx_global_variable_definitions_category ON global_variable_definitions(category);
CREATE INDEX IF NOT EXISTS idx_global_variable_definitions_display_order ON global_variable_definitions(display_order);

-- Views and likes tracking indexes
CREATE INDEX IF NOT EXISTS idx_entity_views_entity_id ON entity_views(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_views_viewer_id ON entity_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_entity_views_viewed_at ON entity_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_entity_likes_entity_id ON entity_likes(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_likes_user_id ON entity_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewer_id ON product_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_product_likes_product_id ON product_likes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_likes_user_id ON product_likes(user_id);

-- Count columns indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_views_count ON entities(views_count);
CREATE INDEX IF NOT EXISTS idx_entities_likes_count ON entities(likes_count);
CREATE INDEX IF NOT EXISTS idx_products_views_count ON products(views_count);
CREATE INDEX IF NOT EXISTS idx_products_likes_count ON products(likes_count);
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON products(sales_count);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entity_types_updated_at BEFORE UPDATE ON entity_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entity_sub_types_updated_at BEFORE UPDATE ON entity_sub_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_types_updated_at BEFORE UPDATE ON product_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_sub_types_updated_at BEFORE UPDATE ON product_sub_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_variables_updated_at BEFORE UPDATE ON variables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_products_updated_at BEFORE UPDATE ON pricing_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_formulas_updated_at BEFORE UPDATE ON pricing_formulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_prices_updated_at BEFORE UPDATE ON pricing_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_configs_updated_at BEFORE UPDATE ON billing_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cancellation_policies_updated_at BEFORE UPDATE ON cancellation_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_global_variable_definitions_updated_at BEFORE UPDATE ON global_variable_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Default Entity Types
INSERT INTO entity_types (id, name, description, metadata_schema, filter_config, location_required) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'accommodation',
    'Hotels, apartments, guesthouses and other lodging facilities',
    '{
        "fields": {
            "check_in_time": {"type": "time", "label": "Check-in Time", "required": true},
            "check_out_time": {"type": "time", "label": "Check-out Time", "required": true},
            "max_guests": {"type": "number", "label": "Maximum Guests", "required": true, "min": 1},
            "amenities": {"type": "array", "label": "Amenities", "options": ["wifi", "parking", "pool", "gym", "spa", "restaurant", "bar", "room_service", "air_conditioning", "heating", "pets_allowed"]},
            "star_rating": {"type": "number", "label": "Star Rating", "min": 1, "max": 5},
            "property_type": {"type": "select", "label": "Property Type", "options": ["hotel", "apartment", "guesthouse", "villa", "hostel", "resort"], "required": true}
        }
    }',
    '{
        "filter_numeric_1": {"label": "Star Rating", "searchable": true},
        "filter_numeric_2": {"label": "Maximum Guests", "searchable": true},
        "filter_text_1": {"label": "Property Type", "searchable": true},
        "filter_boolean_1": {"label": "Pets Allowed", "searchable": true},
        "filter_boolean_2": {"label": "Has Pool", "searchable": true}
    }',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'service',
    'Professional services, consultations, and service-based businesses',
    '{
        "fields": {
            "service_duration": {"type": "number", "label": "Service Duration (minutes)", "required": true, "min": 15},
            "service_category": {"type": "select", "label": "Service Category", "options": ["consulting", "health", "beauty", "education", "technology", "legal", "financial", "maintenance", "cleaning"], "required": true},
            "qualifications": {"type": "text", "label": "Qualifications/Certifications"},
            "availability": {"type": "object", "label": "Availability Schedule"},
            "remote_available": {"type": "boolean", "label": "Remote Service Available", "default": false}
        }
    }',
    '{
        "filter_numeric_1": {"label": "Duration (minutes)", "searchable": true},
        "filter_text_1": {"label": "Service Category", "searchable": true},
        "filter_boolean_1": {"label": "Remote Available", "searchable": true},
        "filter_text_2": {"label": "Qualification Level", "searchable": true}
    }',
    false
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'venue',
    'Event venues, meeting spaces, and rental locations',
    '{
        "fields": {
            "capacity": {"type": "number", "label": "Maximum Capacity", "required": true, "min": 1},
            "venue_type": {"type": "select", "label": "Venue Type", "options": ["conference_room", "wedding_venue", "restaurant", "outdoor_space", "warehouse", "studio", "theater", "sports_facility"], "required": true},
            "equipment_included": {"type": "array", "label": "Equipment Included", "options": ["projector", "sound_system", "microphones", "tables", "chairs", "stage", "lighting", "catering_kitchen", "parking"]},
            "setup_time": {"type": "number", "label": "Setup Time (hours)", "min": 0},
            "cleanup_time": {"type": "number", "label": "Cleanup Time (hours)", "min": 0}
        }
    }',
    '{
        "filter_numeric_1": {"label": "Capacity", "searchable": true},
        "filter_text_1": {"label": "Venue Type", "searchable": true},
        "filter_boolean_1": {"label": "Has Projector", "searchable": true},
        "filter_boolean_2": {"label": "Has Parking", "searchable": true}
    }',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'general',
    'General entities that don''t fit specific categories',
    '{
        "fields": {
            "category": {"type": "text", "label": "Category"},
            "description_long": {"type": "text", "label": "Detailed Description"},
            "contact_info": {"type": "object", "label": "Contact Information"}
        }
    }',
    '{
        "filter_text_1": {"label": "Category", "searchable": true}
    }',
    false
);

-- Default Entity Sub-types
INSERT INTO entity_sub_types (entity_type_id, name, description, metadata_schema, filter_config) VALUES
-- Accommodation sub-types
('550e8400-e29b-41d4-a716-446655440001', 'luxury', 'High-end luxury accommodations', '{"fields": {"concierge": {"type": "boolean", "label": "Concierge Service"}, "valet": {"type": "boolean", "label": "Valet Parking"}}}', '{"filter_boolean_3": {"label": "Concierge Available", "searchable": true}}'),
('550e8400-e29b-41d4-a716-446655440001', 'budget', 'Budget-friendly accommodations', '{"fields": {"shared_facilities": {"type": "boolean", "label": "Shared Facilities"}, "self_checkin": {"type": "boolean", "label": "Self Check-in"}}}', '{"filter_boolean_3": {"label": "Self Check-in", "searchable": true}}'),
-- Service sub-types
('550e8400-e29b-41d4-a716-446655440002', 'hourly', 'Services billed by the hour', '{"fields": {"hourly_rate": {"type": "number", "label": "Hourly Rate", "required": true, "min": 0}}}', '{"filter_numeric_3": {"label": "Hourly Rate", "searchable": true}}'),
('550e8400-e29b-41d4-a716-446655440002', 'project', 'Project-based services', '{"fields": {"project_timeline": {"type": "text", "label": "Typical Project Timeline"}, "deliverables": {"type": "text", "label": "Standard Deliverables"}}}', '{}'),
-- Venue sub-types
('550e8400-e29b-41d4-a716-446655440003', 'indoor', 'Indoor venue spaces', '{"fields": {"climate_control": {"type": "boolean", "label": "Climate Control"}, "natural_light": {"type": "boolean", "label": "Natural Light"}}}', '{"filter_boolean_3": {"label": "Climate Control", "searchable": true}}'),
('550e8400-e29b-41d4-a716-446655440003', 'outdoor', 'Outdoor venue spaces', '{"fields": {"weather_protection": {"type": "boolean", "label": "Weather Protection"}, "seasonal_availability": {"type": "text", "label": "Seasonal Availability"}}}', '{"filter_boolean_3": {"label": "Weather Protection", "searchable": true}}');

-- Default Product Types
INSERT INTO product_types (id, name, description, metadata_schema, filter_config) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    'service',
    'Service-based products and offerings',
    '{
        "fields": {
            "service_type": {"type": "select", "label": "Service Type", "options": ["consultation", "maintenance", "training", "support", "custom"], "required": true},
            "delivery_method": {"type": "select", "label": "Delivery Method", "options": ["in_person", "remote", "hybrid"], "required": true},
            "duration": {"type": "number", "label": "Service Duration (minutes)", "min": 15},
            "includes": {"type": "array", "label": "What''s Included", "options": ["materials", "follow_up", "certification", "documentation", "support"]},
            "prerequisites": {"type": "text", "label": "Prerequisites"}
        }
    }',
    '{
        "filter_text_1": {"label": "Service Type", "searchable": true},
        "filter_text_2": {"label": "Delivery Method", "searchable": true},
        "filter_numeric_1": {"label": "Duration (minutes)", "searchable": true},
        "filter_boolean_1": {"label": "Includes Materials", "searchable": true}
    }'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'accommodation',
    'Accommodation and lodging products',
    '{
        "fields": {
            "room_type": {"type": "select", "label": "Room Type", "options": ["single", "double", "suite", "apartment", "dorm"], "required": true},
            "bed_configuration": {"type": "select", "label": "Bed Configuration", "options": ["single", "double", "queen", "king", "twin", "bunk"]},
            "max_occupancy": {"type": "number", "label": "Maximum Occupancy", "required": true, "min": 1},
            "meal_plan": {"type": "select", "label": "Meal Plan", "options": ["none", "breakfast", "half_board", "full_board", "all_inclusive"]},
            "cancellation_policy": {"type": "select", "label": "Cancellation Policy", "options": ["flexible", "moderate", "strict", "non_refundable"]}
        }
    }',
    '{
        "filter_text_1": {"label": "Room Type", "searchable": true},
        "filter_numeric_1": {"label": "Max Occupancy", "searchable": true},
        "filter_text_2": {"label": "Meal Plan", "searchable": true},
        "filter_text_3": {"label": "Cancellation Policy", "searchable": true}
    }'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'ecommerce',
    'Physical and digital products for sale',
    '{
        "fields": {
            "product_category": {"type": "select", "label": "Product Category", "options": ["electronics", "clothing", "home", "books", "software", "digital", "food", "health", "sports"], "required": true},
            "physical_product": {"type": "boolean", "label": "Physical Product", "default": true},
            "weight": {"type": "number", "label": "Weight (kg)", "min": 0},
            "dimensions": {"type": "object", "label": "Dimensions (L x W x H cm)"},
            "shipping_required": {"type": "boolean", "label": "Shipping Required", "default": true},
            "digital_delivery": {"type": "boolean", "label": "Digital Delivery Available", "default": false},
            "warranty": {"type": "text", "label": "Warranty Information"},
            "return_policy": {"type": "select", "label": "Return Policy", "options": ["30_days", "60_days", "90_days", "1_year", "no_returns"]}
        }
    }',
    '{
        "filter_text_1": {"label": "Product Category", "searchable": true},
        "filter_boolean_1": {"label": "Physical Product", "searchable": true},
        "filter_boolean_2": {"label": "Digital Delivery", "searchable": true},
        "filter_text_2": {"label": "Return Policy", "searchable": true},
        "filter_numeric_1": {"label": "Weight (kg)", "searchable": true}
    }'
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    'experience',
    'Events, activities, and experience-based products',
    '{
        "fields": {
            "experience_type": {"type": "select", "label": "Experience Type", "options": ["tour", "workshop", "class", "event", "activity", "adventure"], "required": true},
            "group_size": {"type": "object", "label": "Group Size", "properties": {"min": {"type": "number", "min": 1}, "max": {"type": "number", "min": 1}}},
            "difficulty_level": {"type": "select", "label": "Difficulty Level", "options": ["beginner", "intermediate", "advanced", "expert"]},
            "age_restrictions": {"type": "object", "label": "Age Restrictions", "properties": {"min_age": {"type": "number", "min": 0}, "max_age": {"type": "number"}}},
            "location_type": {"type": "select", "label": "Location Type", "options": ["indoor", "outdoor", "mixed", "virtual"]},
            "equipment_provided": {"type": "boolean", "label": "Equipment Provided", "default": false}
        }
    }',
    '{
        "filter_text_1": {"label": "Experience Type", "searchable": true},
        "filter_text_2": {"label": "Difficulty Level", "searchable": true},
        "filter_text_3": {"label": "Location Type", "searchable": true},
        "filter_boolean_1": {"label": "Equipment Provided", "searchable": true},
        "filter_numeric_1": {"label": "Min Group Size", "searchable": true}
    }'
);

-- Default Product Sub-types
INSERT INTO product_sub_types (product_type_id, name, description, metadata_schema, filter_config) VALUES
-- Service sub-types
('660e8400-e29b-41d4-a716-446655440001', 'premium', 'Premium service offerings', '{"fields": {"priority_support": {"type": "boolean", "label": "Priority Support"}, "dedicated_manager": {"type": "boolean", "label": "Dedicated Account Manager"}}}', '{"filter_boolean_2": {"label": "Priority Support", "searchable": true}}'),
('660e8400-e29b-41d4-a716-446655440001', 'basic', 'Basic service offerings', '{"fields": {"self_service": {"type": "boolean", "label": "Self-Service Options"}, "community_support": {"type": "boolean", "label": "Community Support"}}}', '{"filter_boolean_2": {"label": "Self-Service", "searchable": true}}'),
-- Accommodation sub-types
('660e8400-e29b-41d4-a716-446655440002', 'luxury', 'Luxury accommodation products', '{"fields": {"butler_service": {"type": "boolean", "label": "Butler Service"}, "private_facilities": {"type": "boolean", "label": "Private Facilities"}}}', '{"filter_boolean_2": {"label": "Butler Service", "searchable": true}}'),
('660e8400-e29b-41d4-a716-446655440002', 'economy', 'Economy accommodation products', '{"fields": {"shared_bathroom": {"type": "boolean", "label": "Shared Bathroom"}, "hostel_style": {"type": "boolean", "label": "Hostel Style"}}}', '{"filter_boolean_2": {"label": "Shared Facilities", "searchable": true}}'),
-- Ecommerce sub-types
('660e8400-e29b-41d4-a716-446655440003', 'digital', 'Digital products and downloads', '{"fields": {"download_limit": {"type": "number", "label": "Download Limit"}, "license_type": {"type": "select", "label": "License Type", "options": ["personal", "commercial", "enterprise"]}}}', '{"filter_text_3": {"label": "License Type", "searchable": true}}'),
('660e8400-e29b-41d4-a716-446655440003', 'subscription', 'Subscription-based products', '{"fields": {"billing_cycle": {"type": "select", "label": "Billing Cycle", "options": ["monthly", "quarterly", "yearly"]}, "auto_renewal": {"type": "boolean", "label": "Auto-Renewal", "default": true}}}', '{"filter_text_3": {"label": "Billing Cycle", "searchable": true}}'),
-- Experience sub-types
('660e8400-e29b-41d4-a716-446655440004', 'group', 'Group experience activities', '{"fields": {"team_building": {"type": "boolean", "label": "Team Building Focus"}, "corporate_discounts": {"type": "boolean", "label": "Corporate Discounts Available"}}}', '{"filter_boolean_2": {"label": "Team Building", "searchable": true}}'),
('660e8400-e29b-41d4-a716-446655440004', 'private', 'Private experience activities', '{"fields": {"customizable": {"type": "boolean", "label": "Customizable Experience"}, "personal_guide": {"type": "boolean", "label": "Personal Guide Included"}}}', '{"filter_boolean_2": {"label": "Personal Guide", "searchable": true}}');

-- =============================================
-- DEFAULT PRICING SYSTEM DATA
-- =============================================

-- Insert default variable definitions
INSERT INTO global_variable_definitions (variable_id, name, description, category, value_type, default_value, validation_rules, display_order, is_system) VALUES
-- Pricing Variables
('basePrice', 'Base Price', 'The standard price before any adjustments', 'pricing', 'number', '0', '{"min": 0, "required": true, "step": 0.01}', 1, true),
('weekendSurcharge', 'Weekend Surcharge', 'Additional charge for weekend bookings (percentage)', 'pricing', 'percentage', '0', '{"min": 0, "max": 200}', 2, true),
('holidaySurcharge', 'Holiday Surcharge', 'Additional charge for holiday bookings (percentage)', 'pricing', 'percentage', '0', '{"min": 0, "max": 300}', 3, true),
('peakSeasonSurcharge', 'Peak Season Surcharge', 'Additional charge during peak season (percentage)', 'pricing', 'percentage', '0', '{"min": 0, "max": 500}', 4, true),
('groupDiscount', 'Group Discount', 'Discount for group bookings (percentage)', 'pricing', 'percentage', '0', '{"min": 0, "max": 50}', 5, true),
('earlyBirdDiscount', 'Early Bird Discount', 'Discount for advance bookings (percentage)', 'pricing', 'percentage', '0', '{"min": 0, "max": 30}', 6, true),
('lastMinuteSurcharge', 'Last Minute Surcharge', 'Surcharge for last-minute bookings (percentage)', 'pricing', 'percentage', '0', '{"min": 0, "max": 100}', 7, true),
('memberDiscount', 'Member Discount', 'Discount for members (percentage)', 'pricing', 'percentage', '0', '{"min": 0, "max": 30}', 8, true),
('taxRate', 'Tax Rate', 'Tax rate applied to the total (percentage)', 'pricing', 'percentage', '0', '{"min": 0, "max": 50}', 9, true),
('serviceFee', 'Service Fee', 'Fixed service fee added to booking', 'pricing', 'number', '0', '{"min": 0}', 10, true),

-- Capacity Variables  
('maxCapacity', 'Maximum Capacity', 'Maximum number of people/units allowed', 'capacity', 'number', '1', '{"min": 1, "required": true}', 11, true),
('minGroupSize', 'Minimum Group Size', 'Minimum number of people required', 'capacity', 'number', '1', '{"min": 1}', 12, true),
('unitsAvailable', 'Units Available', 'Number of units/rooms/slots available', 'capacity', 'number', '1', '{"min": 0, "required": true}', 13, true),
('maxUnitsPerBooking', 'Max Units Per Booking', 'Maximum units one person can book', 'capacity', 'number', '10', '{"min": 1}', 14, true),
('advanceBookingDays', 'Advance Booking Days', 'How many days in advance booking is required', 'restrictions', 'number', '0', '{"min": 0}', 15, true),
('cancellationDeadlineHours', 'Cancellation Deadline Hours', 'Hours before event when cancellation is no longer allowed', 'restrictions', 'number', '24', '{"min": 0}', 16, true),

-- Feature Variables
('includesBreakfast', 'Includes Breakfast', 'Whether breakfast is included', 'features', 'boolean', 'false', '{}', 17, true),
('includesTowels', 'Includes Towels', 'Whether towels are provided', 'features', 'boolean', 'false', '{}', 18, true),
('allowsPets', 'Allows Pets', 'Whether pets are allowed', 'features', 'boolean', 'false', '{}', 19, true),
('hasWifi', 'Has WiFi', 'Whether WiFi is available', 'features', 'boolean', 'true', '{}', 20, true),
('hasParking', 'Has Parking', 'Whether parking is available', 'features', 'boolean', 'false', '{}', 21, true),
('airConditioned', 'Air Conditioned', 'Whether space is air conditioned', 'features', 'boolean', 'false', '{}', 22, true),
('wheelchairAccessible', 'Wheelchair Accessible', 'Whether space is wheelchair accessible', 'features', 'boolean', 'false', '{}', 23, true),

-- Time Variables
('serviceDuration', 'Service Duration', 'Duration of service in minutes', 'time', 'number', '60', '{"min": 15, "required": true}', 24, true),
('setupTime', 'Setup Time', 'Setup time required in minutes', 'time', 'number', '0', '{"min": 0}', 25, true),
('cleanupTime', 'Cleanup Time', 'Cleanup time required in minutes', 'time', 'number', '0', '{"min": 0}', 26, true),
('operatingHoursStart', 'Operating Hours Start', 'When operations start each day', 'time', 'time', '09:00', '{"required": true}', 27, true),
('operatingHoursEnd', 'Operating Hours End', 'When operations end each day', 'time', 'time', '17:00', '{"required": true}', 28, true),
('checkInTime', 'Check-in Time', 'Standard check-in time', 'time', 'time', '15:00', '{}', 29, true),
('checkOutTime', 'Check-out Time', 'Standard check-out time', 'time', 'time', '11:00', '{}', 30, true);

-- Default Pricing Products (Templates)
-- Note: These use a placeholder owner_id. In production, you should either:
-- 1. Create a system user with this ID first, or
-- 2. Update these to use an actual admin user's ID
-- For now, we'll skip these default inserts to avoid foreign key violations
-- INSERT INTO pricing_products (id, owner_id, name, description) VALUES ...

-- Default Pricing Formulas
-- These depend on the pricing_products above, so they're also commented out
/*
INSERT INTO pricing_formulas (pricing_product_id, formula_name, name, description, value_calculation, apply_condition) VALUES
-- Restaurant Table Booking Formulas
('770e8400-e29b-41d4-a716-446655440001', 'baseCalculation', 'Base Table Price', 'Calculate base price per person', 
 '[{"type": "variable", "value": "basePrice"}]', 
 '{}'),
('770e8400-e29b-41d4-a716-446655440001', 'weekendSurcharge', 'Weekend Premium', 'Add weekend surcharge', 
 '[{"type": "multiply", "left": {"type": "variable", "value": "basePrice"}, "right": {"type": "divide", "left": {"type": "variable", "value": "weekendSurcharge"}, "right": {"type": "literal", "value": 100}}}]',
 '[{"type": "weekday", "operator": "in", "value": ["saturday", "sunday"]}]'),

-- Hotel Room Booking Formulas  
('770e8400-e29b-41d4-a716-446655440002', 'baseCalculation', 'Base Room Rate', 'Standard room rate per night',
 '[{"type": "variable", "value": "basePrice"}]',
 '{}'),
('770e8400-e29b-41d4-a716-446655440002', 'peakSeasonSurcharge', 'Peak Season Rate', 'Higher rates during peak season',
 '[{"type": "multiply", "left": {"type": "variable", "value": "basePrice"}, "right": {"type": "divide", "left": {"type": "variable", "value": "peakSeasonSurcharge"}, "right": {"type": "literal", "value": 100}}}]',
 '[{"type": "date_range", "start": "2024-06-01", "end": "2024-08-31"}]'),

-- Event Ticket Sales Formulas
('770e8400-e29b-41d4-a716-446655440003', 'baseCalculation', 'Base Ticket Price', 'Standard ticket price',
 '[{"type": "variable", "value": "basePrice"}]',
 '{}'),
('770e8400-e29b-41d4-a716-446655440003', 'earlyBirdDiscount', 'Early Bird Pricing', 'Discount for early purchases',
 '[{"type": "multiply", "left": {"type": "variable", "value": "basePrice"}, "right": {"type": "subtract", "left": {"type": "literal", "value": 1}, "right": {"type": "divide", "left": {"type": "variable", "value": "earlyBirdDiscount"}, "right": {"type": "literal", "value": 100}}}}]',
 '[{"type": "days_before_event", "operator": "greater_than", "value": 30}]'),
('770e8400-e29b-41d4-a716-446655440003', 'groupDiscount', 'Group Discount', 'Discount for group purchases',
 '[{"type": "multiply", "left": {"type": "variable", "value": "basePrice"}, "right": {"type": "subtract", "left": {"type": "literal", "value": 1}, "right": {"type": "divide", "left": {"type": "variable", "value": "groupDiscount"}, "right": {"type": "literal", "value": 100}}}}]',
 '[{"type": "quantity", "operator": "greater_than_equal", "value": 5}]'),

-- Service Appointment Formulas
('770e8400-e29b-41d4-a716-446655440004', 'baseCalculation', 'Hourly Rate Calculation', 'Calculate cost based on duration',
 '[{"type": "multiply", "left": {"type": "variable", "value": "basePrice"}, "right": {"type": "divide", "left": {"type": "variable", "value": "serviceDuration"}, "right": {"type": "literal", "value": 60}}}]',
 '{}'),
('770e8400-e29b-41d4-a716-446655440004', 'serviceFeeAdd', 'Service Fee', 'Add fixed service fee',
 '[{"type": "variable", "value": "serviceFee"}]',
 '{}'),

-- Venue Rental Formulas
('770e8400-e29b-41d4-a716-446655440005', 'baseCalculation', 'Base Venue Rate', 'Standard venue rental rate',
 '[{"type": "variable", "value": "basePrice"}]',
 '{}'),
('770e8400-e29b-41d4-a716-446655440005', 'capacityPremium', 'Large Group Premium', 'Surcharge for large groups',
 '[{"type": "multiply", "left": {"type": "variable", "value": "basePrice"}, "right": {"type": "literal", "value": 0.5}}]',
 '[{"type": "guest_count", "operator": "greater_than", "value": 50}]'),

-- Experience Tour Formulas
('770e8400-e29b-41d4-a716-446655440006', 'baseCalculation', 'Per Person Rate', 'Standard rate per participant',
 '[{"type": "variable", "value": "basePrice"}]',
 '{}'),
('770e8400-e29b-41d4-a716-446655440006', 'groupDiscount', 'Group Tour Discount', 'Discount for larger groups',
 '[{"type": "multiply", "left": {"type": "variable", "value": "basePrice"}, "right": {"type": "subtract", "left": {"type": "literal", "value": 1}, "right": {"type": "divide", "left": {"type": "variable", "value": "groupDiscount"}, "right": {"type": "literal", "value": 100}}}}]',
 '[{"type": "quantity", "operator": "greater_than_equal", "value": 6}]'),

-- Simple Fixed Price Formula
('770e8400-e29b-41d4-a716-446655440007', 'baseCalculation', 'Fixed Price', 'Simple fixed price without adjustments',
 '[{"type": "variable", "value": "basePrice"}]',
 '{}');

-- Default Pricing Prices (Price configurations for each template)
INSERT INTO pricing_prices (pricing_product_id, name, description, pricing_type, amount, formula_names, target, interval) VALUES
-- Restaurant Table Booking Prices
('770e8400-e29b-41d4-a716-446655440001', 'Per Person Dining', 'Standard per-person dining price', 'dynamic', '{"USD": 25.00}', '{baseCalculation, weekendSurcharge}', 'per-participant', 'per-unit'),
('770e8400-e29b-41d4-a716-446655440001', 'Table Reservation Fee', 'Fixed table reservation fee', 'fixed', '{"USD": 10.00}', '{}', 'flat', 'flat'),

-- Hotel Room Booking Prices
('770e8400-e29b-41d4-a716-446655440002', 'Standard Room Rate', 'Per-night room rate with seasonal adjustments', 'dynamic', '{"USD": 120.00}', '{baseCalculation, peakSeasonSurcharge}', 'flat', 'per-unit'),

-- Event Ticket Sales Prices
('770e8400-e29b-41d4-a716-446655440003', 'General Admission', 'Standard event ticket with early bird and group discounts', 'dynamic', '{"USD": 35.00}', '{baseCalculation, earlyBirdDiscount, groupDiscount}', 'per-participant', 'per-unit'),

-- Service Appointment Prices
('770e8400-e29b-41d4-a716-446655440004', 'Hourly Service Rate', 'Professional service charged by time', 'dynamic', '{"USD": 100.00}', '{baseCalculation, serviceFeeAdd}', 'flat', 'per-unit'),

-- Venue Rental Prices
('770e8400-e29b-41d4-a716-446655440005', 'Event Space Rental', 'Space rental with capacity premiums', 'dynamic', '{"USD": 500.00}', '{baseCalculation, capacityPremium}', 'flat', 'per-unit'),

-- Experience Tour Prices
('770e8400-e29b-41d4-a716-446655440006', 'Tour Participation', 'Per-person tour rate with group discounts', 'dynamic', '{"USD": 45.00}', '{baseCalculation, groupDiscount}', 'per-participant', 'per-unit'),

-- Simple Fixed Price
('770e8400-e29b-41d4-a716-446655440007', 'Simple Product Price', 'Basic fixed price for simple products', 'fixed', '{"USD": 29.99}', '{baseCalculation}', 'flat', 'flat');
*/

-- Partial unique indexes for views and likes
CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_views_unique_user ON entity_views(entity_id, viewer_id) WHERE viewer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_views_unique_session ON entity_views(entity_id, viewer_session) WHERE viewer_session IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_likes_unique ON entity_likes(entity_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_views_unique_user ON product_views(product_id, viewer_id) WHERE viewer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_views_unique_session ON product_views(product_id, viewer_session) WHERE viewer_session IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_likes_unique ON product_likes(product_id, user_id);
