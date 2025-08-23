-- Seed test data for entity types and product types
-- Run this after you have set up an admin user

-- Insert test entity types
INSERT INTO entity_types (name, description, location_required, metadata_schema, filter_config)
VALUES 
  ('Restaurant', 'Food service establishments', true, 
   '{"fields": {"cuisine": {"type": "string", "label": "Cuisine Type", "required": false}, "capacity": {"type": "number", "label": "Seating Capacity", "required": false}}}',
   '{"searchable_fields": ["name", "description"], "filterable_fields": ["cuisine"]}'),
  
  ('Hotel', 'Accommodation providers', true,
   '{"fields": {"stars": {"type": "number", "label": "Star Rating", "required": true}, "amenities": {"type": "array", "label": "Amenities", "required": false}}}',
   '{"searchable_fields": ["name", "description"], "filterable_fields": ["stars"]}'),
  
  ('Event Venue', 'Spaces for events and gatherings', true,
   '{"fields": {"max_capacity": {"type": "number", "label": "Maximum Capacity", "required": true}, "facilities": {"type": "array", "label": "Available Facilities", "required": false}}}',
   '{"searchable_fields": ["name", "description"], "filterable_fields": ["max_capacity"]}')
ON CONFLICT (name) DO NOTHING;

-- Insert test product types
INSERT INTO product_types (name, description, metadata_schema, filter_config)
VALUES
  ('Menu Item', 'Food and beverage items',
   '{"fields": {"price": {"type": "number", "label": "Price", "required": true}, "category": {"type": "string", "label": "Category", "required": true}, "dietary": {"type": "array", "label": "Dietary Info", "required": false}}}',
   '{"searchable_fields": ["name", "description"], "filterable_fields": ["category", "dietary"]}'),
  
  ('Room Type', 'Hotel room categories',
   '{"fields": {"base_price": {"type": "number", "label": "Base Price", "required": true}, "occupancy": {"type": "number", "label": "Max Occupancy", "required": true}, "size_sqm": {"type": "number", "label": "Size (sqm)", "required": false}}}',
   '{"searchable_fields": ["name", "description"], "filterable_fields": ["occupancy"]}'),
  
  ('Event Package', 'Event service packages',
   '{"fields": {"duration_hours": {"type": "number", "label": "Duration (hours)", "required": true}, "min_guests": {"type": "number", "label": "Minimum Guests", "required": true}, "includes": {"type": "array", "label": "Included Services", "required": false}}}',
   '{"searchable_fields": ["name", "description"], "filterable_fields": ["duration_hours", "min_guests"]}')
ON CONFLICT (name) DO NOTHING;

-- Verify the data was inserted
SELECT 'Entity Types:' as category, COUNT(*) as count FROM entity_types
UNION ALL
SELECT 'Product Types:', COUNT(*) FROM product_types;