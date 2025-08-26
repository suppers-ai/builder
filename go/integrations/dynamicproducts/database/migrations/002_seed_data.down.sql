-- Remove seed data
DELETE FROM dynamicproducts.product_sub_types;
DELETE FROM dynamicproducts.product_types;
DELETE FROM dynamicproducts.entity_sub_types;
DELETE FROM dynamicproducts.entity_types;
DELETE FROM dynamicproducts.users WHERE id = '550e8400-e29b-41d4-a716-446655440000';