-- Create entity_types table
CREATE TABLE IF NOT EXISTS public.entity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  location_required BOOLEAN DEFAULT false,
  metadata_schema JSONB DEFAULT '{}',
  filter_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_types table
CREATE TABLE IF NOT EXISTS public.product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  metadata_schema JSONB DEFAULT '{}',
  filter_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_sub_types table
CREATE TABLE IF NOT EXISTS public.product_sub_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type_id UUID NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metadata_schema JSONB DEFAULT '{}',
  filter_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_type_id, name)
);

-- Create entity_sub_types table
CREATE TABLE IF NOT EXISTS public.entity_sub_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type_id UUID NOT NULL REFERENCES entity_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metadata_schema JSONB DEFAULT '{}',
  filter_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type_id, name)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entity_types_name ON entity_types(name);
CREATE INDEX IF NOT EXISTS idx_product_types_name ON product_types(name);
CREATE INDEX IF NOT EXISTS idx_product_sub_types_product_type_id ON product_sub_types(product_type_id);
CREATE INDEX IF NOT EXISTS idx_entity_sub_types_entity_type_id ON entity_sub_types(entity_type_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entity_types_updated_at
  BEFORE UPDATE ON entity_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_types_updated_at
  BEFORE UPDATE ON product_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_sub_types_updated_at
  BEFORE UPDATE ON product_sub_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_sub_types_updated_at
  BEFORE UPDATE ON entity_sub_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies (disabled by default, enable if needed)
ALTER TABLE entity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sub_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_sub_types ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for authenticated users
-- Adjust these based on your security requirements
CREATE POLICY "Entity types are viewable by everyone" 
  ON entity_types FOR SELECT 
  USING (true);

CREATE POLICY "Product types are viewable by everyone" 
  ON product_types FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage entity types" 
  ON entity_types FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can manage product types" 
  ON product_types FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can manage product sub types" 
  ON product_sub_types FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can manage entity sub types" 
  ON entity_sub_types FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );