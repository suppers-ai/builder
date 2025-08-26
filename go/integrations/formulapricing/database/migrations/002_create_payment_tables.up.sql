-- Clean up any existing tables from failed migrations
DROP TABLE IF EXISTS payment_webhooks CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS payment_sessions CASCADE;
DROP TABLE IF EXISTS payment_providers CASCADE;

-- Create payment providers table in formulapricing schema
CREATE TABLE IF NOT EXISTS formulapricing.payment_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    configuration JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default payment providers
INSERT INTO formulapricing.payment_providers (name, is_active, configuration) VALUES
    ('stripe', true, '{"api_version": "2023-10-16"}'),
    ('paypal', false, '{}'),
    ('square', false, '{}')
ON CONFLICT (name) DO NOTHING;

-- Create payment sessions table in formulapricing schema
CREATE TABLE IF NOT EXISTS formulapricing.payment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES formulapricing.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES formulapricing.payment_providers(id),
    provider_session_id VARCHAR(255) NOT NULL,
    pricing_name VARCHAR(255) NOT NULL,
    calculation_data JSONB NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payment_sessions
CREATE INDEX IF NOT EXISTS idx_provider_session ON formulapricing.payment_sessions(provider_id, provider_session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions ON formulapricing.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_status ON formulapricing.payment_sessions(status);

-- Create purchases table in formulapricing schema
CREATE TABLE IF NOT EXISTS formulapricing.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES formulapricing.users(id) ON DELETE CASCADE,
    payment_session_id UUID REFERENCES formulapricing.payment_sessions(id),
    provider_id UUID REFERENCES formulapricing.payment_providers(id),
    provider_payment_id VARCHAR(255),
    pricing_name VARCHAR(255) NOT NULL,
    calculation_data JSONB NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    payment_method JSONB DEFAULT '{}',
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for purchases
CREATE INDEX IF NOT EXISTS idx_user_purchases ON formulapricing.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_status ON formulapricing.purchases(status);
CREATE INDEX IF NOT EXISTS idx_provider_payment ON formulapricing.purchases(provider_id, provider_payment_id);

-- Create payment webhooks table for idempotency in formulapricing schema
CREATE TABLE IF NOT EXISTS formulapricing.payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES formulapricing.payment_providers(id),
    provider_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, provider_event_id)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION formulapricing.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_providers_updated_at BEFORE UPDATE ON formulapricing.payment_providers
    FOR EACH ROW EXECUTE FUNCTION formulapricing.update_updated_at_column();

CREATE TRIGGER update_payment_sessions_updated_at BEFORE UPDATE ON formulapricing.payment_sessions
    FOR EACH ROW EXECUTE FUNCTION formulapricing.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON formulapricing.purchases
    FOR EACH ROW EXECUTE FUNCTION formulapricing.update_updated_at_column();