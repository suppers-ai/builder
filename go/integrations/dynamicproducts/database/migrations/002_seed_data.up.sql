-- Seed data for Dynamic Products Application

-- Create default admin user (password: admin123 - change in production!)
INSERT INTO dynamicproducts.users (id, email, password_hash, name, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@dynamicproducts.com', '$2a$10$YKmxQltT5pBvKPmZJqKJAeQzB7FzHD6P/bVzT7mNvKaD8wKP8qZUq', 'System Admin', 'admin');

-- Default Entity Types
INSERT INTO dynamicproducts.entity_types (id, name, description, metadata_schema, filter_config, location_required) VALUES
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
INSERT INTO dynamicproducts.entity_sub_types (entity_type_id, name, description, metadata_schema, filter_config) VALUES
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
INSERT INTO dynamicproducts.product_types (id, name, description, metadata_schema, filter_config) VALUES
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
INSERT INTO dynamicproducts.product_sub_types (product_type_id, name, description, metadata_schema, filter_config) VALUES
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