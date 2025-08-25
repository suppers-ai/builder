-- Create formulapricing schema
CREATE SCHEMA IF NOT EXISTS formulapricing;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication with roles
CREATE TABLE IF NOT EXISTS formulapricing.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Logs table for tracking API requests
CREATE TABLE IF NOT EXISTS formulapricing.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level TEXT NOT NULL DEFAULT 'INFO',
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER,
    exec_time_ms INTEGER,
    user_ip TEXT,
    user_id UUID REFERENCES formulapricing.users(id),
    error TEXT,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Variables table - defines simple variables for calculations
CREATE TABLE IF NOT EXISTS formulapricing.variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variable_name TEXT NOT NULL UNIQUE, -- e.g., 'basePrice', 'numberOfAdults', 'storageLimit'
    display_name TEXT NOT NULL,
    description TEXT,
    value_type TEXT NOT NULL CHECK (value_type IN (
        'text',       -- String value
        'number',     -- Numeric value (int or float)
        'boolean',    -- True/false
        'date',       -- ISO 8601 date (YYYY-MM-DD)
        'datetime',   -- ISO 8601 datetime (YYYY-MM-DDTHH:MM:SS)
        'enum',       -- Enumerated value from a list
        'char',       -- Single character
        'array',      -- Array of values
        'point'       -- Geographic or 2D point (x,y)
    )),
    default_value TEXT,
    is_unique BOOLEAN DEFAULT false, -- Marks system-managed variables
    unique_behavior TEXT, -- Description of how the system manages this variable
    constraints JSONB DEFAULT '{}', -- Type-specific constraints:
    -- number: { "min": 0, "max": 100, "step": 1, "precision": 2 }
    -- text: { "minLength": 1, "maxLength": 255, "pattern": "regex" }
    -- enum: { "values": ["option1", "option2", "option3"] }
    -- array: { "itemType": "number", "minItems": 1, "maxItems": 10 }
    -- date/datetime: { "min": "2020-01-01", "max": "2030-12-31" }
    -- char: { "allowedChars": "A-Z0-9" }
    -- point: { "minX": -180, "maxX": 180, "minY": -90, "maxY": 90 }
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Calculations table - defines named calculations with formulas
CREATE TABLE IF NOT EXISTS formulapricing.calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_name TEXT NOT NULL UNIQUE, -- e.g., 'adultsCost', 'childrenCost'
    display_name TEXT NOT NULL,
    description TEXT,
    calculation TEXT[] NOT NULL, -- Array of calculation elements e.g., ['adultsPrice', '*', 'numberOfAdults']
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Conditions table - defines named conditions for conditional pricing
CREATE TABLE IF NOT EXISTS formulapricing.conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condition_name TEXT NOT NULL UNIQUE, -- e.g., 'hasAdults', 'isWeekend'
    display_name TEXT NOT NULL,
    description TEXT,
    condition TEXT[] NOT NULL, -- Array of condition elements e.g., ['numberOfAdults', '>', '0']
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pricing table - combines conditions and calculations for pricing rules
CREATE TABLE IF NOT EXISTS formulapricing.pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    pricing JSONB NOT NULL, -- Array of {condition: string, calculation: string} objects
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_variables_variable_name ON formulapricing.variables(variable_name);
CREATE INDEX IF NOT EXISTS idx_calculations_calculation_name ON formulapricing.calculations(calculation_name);
CREATE INDEX IF NOT EXISTS idx_conditions_condition_name ON formulapricing.conditions(condition_name);
CREATE INDEX IF NOT EXISTS idx_pricing_name ON formulapricing.pricing(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION formulapricing.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_variables_updated_at BEFORE UPDATE ON formulapricing.variables 
    FOR EACH ROW EXECUTE FUNCTION formulapricing.update_updated_at_column();
CREATE TRIGGER update_calculations_updated_at BEFORE UPDATE ON formulapricing.calculations 
    FOR EACH ROW EXECUTE FUNCTION formulapricing.update_updated_at_column();
CREATE TRIGGER update_conditions_updated_at BEFORE UPDATE ON formulapricing.conditions 
    FOR EACH ROW EXECUTE FUNCTION formulapricing.update_updated_at_column();
CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON formulapricing.pricing 
    FOR EACH ROW EXECUTE FUNCTION formulapricing.update_updated_at_column();

-- Insert system variables
INSERT INTO formulapricing.variables (variable_name, display_name, description, value_type, is_unique, unique_behavior) VALUES
    ('runningTotal', 'Running Total', 'Keeps track of the running total throughout the pricing calculation', 'number', true, 
     'Automatically updated after each successful calculation. Starts at 0 and accumulates values from each calculation step.'),
    ('previousTotal', 'Previous Total', 'Stores the previous calculation total for comparison', 'number', true, 
     'Stores the total from before the last calculation was added. Useful for conditional logic based on accumulated totals.')
ON CONFLICT (variable_name) DO NOTHING;

-- Insert user variables for testing
-- Family pricing variables
INSERT INTO formulapricing.variables (variable_name, display_name, description, value_type) VALUES
    ('numberOfAdults', 'Number of Adults', 'Total number of adults', 'number'),
    ('numberOfChildren', 'Number of Children', 'Total number of children (ages 3-12)', 'number'),
    ('numberOfInfants', 'Number of Infants', 'Total number of infants (under 3)', 'number'),
    ('numberOfSeniors', 'Number of Seniors', 'Total number of seniors (65+)', 'number'),
    ('adultPrice', 'Adult Price', 'Price per adult', 'number'),
    ('childPrice', 'Child Price', 'Price per child', 'number'),
    ('infantPrice', 'Infant Price', 'Price per infant', 'number'),
    ('seniorPrice', 'Senior Price', 'Price per senior (usually discounted)', 'number'),
    
    -- E-commerce variables
    ('basePrice', 'Base Price', 'The base price per unit', 'number'),
    ('quantity', 'Quantity', 'Number of items to purchase', 'number'),
    ('shippingFee', 'Shipping Fee', 'Flat shipping fee', 'number'),
    ('taxRate', 'Tax Rate', 'Tax rate as decimal (e.g., 0.08 for 8%)', 'number'),
    
    -- Accommodation variables
    ('numberOfNights', 'Number of Nights', 'Total nights of stay', 'number'),
    ('numberOfGuests', 'Number of Guests', 'Total number of guests', 'number'),
    ('pricePerNight', 'Price Per Night', 'Base price per night', 'number'),
    ('cleaningFeeAmount', 'Cleaning Fee Amount', 'One-time cleaning fee', 'number'),
    ('petFeeAmount', 'Pet Fee Amount', 'Additional fee for pets', 'number'),
    ('hasPets', 'Has Pets', 'Whether guests are bringing pets', 'boolean'),
    ('serviceFee', 'Service Fee', 'Platform service fee as decimal', 'number'),
    ('extraGuestFee', 'Extra Guest Fee', 'Fee per guest above base occupancy', 'number'),
    ('baseOccupancy', 'Base Occupancy', 'Number of guests included in base price', 'number')
ON CONFLICT (variable_name) DO NOTHING;

INSERT INTO formulapricing.calculations (calculation_name, display_name, description, calculation) VALUES
    -- Family pricing calculations
    ('adultsCost', 'Adults Cost', 'Total cost for adults', ARRAY['adultPrice', '*', 'numberOfAdults']),
    ('childrenCost', 'Children Cost', 'Total cost for children', ARRAY['childPrice', '*', 'numberOfChildren']),
    ('infantsCost', 'Infants Cost', 'Total cost for infants', ARRAY['infantPrice', '*', 'numberOfInfants']),
    ('seniorsCost', 'Seniors Cost', 'Total cost for seniors', ARRAY['seniorPrice', '*', 'numberOfSeniors']),
    
    -- E-commerce calculations
    ('itemsTotal', 'Items Total', 'Total cost of items', ARRAY['basePrice', '*', 'quantity']),
    ('taxAmount', 'Tax Amount', 'Tax on items', ARRAY['itemsTotal', '*', 'taxRate']),
    
    -- Accommodation calculations
    ('nightsTotal', 'Nights Total', 'Total cost for all nights', ARRAY['pricePerNight', '*', 'numberOfNights']),
    ('extraGuests', 'Extra Guests', 'Number of guests above base occupancy', ARRAY['numberOfGuests', '-', 'baseOccupancy']),
    ('extraGuestTotal', 'Extra Guest Total', 'Total fee for extra guests', ARRAY['extraGuests', '*', 'extraGuestFee', '*', 'numberOfNights']),
    ('cleaningFee', 'Cleaning Fee', 'One-time cleaning fee', ARRAY['cleaningFeeAmount']),
    ('petFee', 'Pet Fee', 'Additional fee for pets', ARRAY['petFeeAmount']),
    ('serviceFeeAmount', 'Service Fee Amount', 'Platform service fee', ARRAY['nightsTotal', '*', 'serviceFee'])
ON CONFLICT (calculation_name) DO NOTHING;

INSERT INTO formulapricing.conditions (condition_name, display_name, description, condition) VALUES
    -- Family pricing conditions
    ('hasAdults', 'Has Adults', 'Check if there are adults', ARRAY['numberOfAdults', '>', '0']),
    ('hasChildren', 'Has Children', 'Check if there are children', ARRAY['numberOfChildren', '>', '0']),
    ('hasInfants', 'Has Infants', 'Check if there are infants', ARRAY['numberOfInfants', '>', '0']),
    ('hasSeniors', 'Has Seniors', 'Check if there are seniors', ARRAY['numberOfSeniors', '>', '0']),
    
    -- E-commerce conditions
    ('hasItems', 'Has Items', 'Check if there are items to purchase', ARRAY['quantity', '>', '0']),
    ('needsShipping', 'Needs Shipping', 'Check if shipping is required', ARRAY['shippingFee', '>', '0']),
    
    -- Accommodation conditions
    ('hasExtraGuests', 'Has Extra Guests', 'Check if there are guests above base occupancy', ARRAY['numberOfGuests', '>', 'baseOccupancy']),
    ('hasPetsBooked', 'Has Pets Booked', 'Check if pets are included', ARRAY['hasPets', '==', 'true']),
    ('multiNight', 'Multi Night Stay', 'Check if stay is more than one night', ARRAY['numberOfNights', '>', '1']),
    
    -- General conditions
    ('always', 'Always', 'Always true condition', ARRAY['true'])
ON CONFLICT (condition_name) DO NOTHING;

INSERT INTO formulapricing.pricing (name, description, pricing) VALUES
    ('standard_family_pricing', 'Standard pricing for family bookings', 
     '[
        {"condition": "hasAdults", "calculation": "adultsCost"},
        {"condition": "hasChildren", "calculation": "childrenCost"},
        {"condition": "hasInfants", "calculation": "infantsCost"},
        {"condition": "hasSeniors", "calculation": "seniorsCost"}
     ]'::jsonb),
    
    ('simple_ecommerce_pricing', 'Simple e-commerce pricing with tax and shipping', 
     '[
        {"condition": "hasItems", "calculation": "itemsTotal"},
        {"condition": "hasItems", "calculation": "taxAmount"},
        {"condition": "needsShipping", "calculation": "shippingFee"}
     ]'::jsonb),
    
    ('accommodation_pricing', 'Accommodation pricing with various fees', 
     '[
        {"condition": "always", "calculation": "nightsTotal"},
        {"condition": "hasExtraGuests", "calculation": "extraGuestTotal"},
        {"condition": "always", "calculation": "cleaningFee"},
        {"condition": "hasPetsBooked", "calculation": "petFee"},
        {"condition": "always", "calculation": "serviceFeeAmount"}
     ]'::jsonb)
ON CONFLICT DO NOTHING;

-- Set default values for accommodation variables
UPDATE formulapricing.variables SET default_value = '75', constraints = '{"min": 0}'::jsonb WHERE variable_name = 'cleaningFeeAmount';
UPDATE formulapricing.variables SET default_value = '50', constraints = '{"min": 0}'::jsonb WHERE variable_name = 'petFeeAmount';
UPDATE formulapricing.variables SET default_value = '100' WHERE variable_name = 'pricePerNight';
UPDATE formulapricing.variables SET default_value = '2' WHERE variable_name = 'baseOccupancy';
UPDATE formulapricing.variables SET default_value = '15' WHERE variable_name = 'extraGuestFee';
UPDATE formulapricing.variables SET default_value = '0.1' WHERE variable_name = 'serviceFee';

-- Set default values for family pricing variables
UPDATE formulapricing.variables SET default_value = '50' WHERE variable_name = 'adultPrice';
UPDATE formulapricing.variables SET default_value = '25' WHERE variable_name = 'childPrice';
UPDATE formulapricing.variables SET default_value = '10' WHERE variable_name = 'infantPrice';
UPDATE formulapricing.variables SET default_value = '40' WHERE variable_name = 'seniorPrice';