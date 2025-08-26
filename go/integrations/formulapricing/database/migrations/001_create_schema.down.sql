-- Drop all tables in reverse order of creation to handle foreign key constraints
DROP TABLE IF EXISTS formulapricing.pricing CASCADE;
DROP TABLE IF EXISTS formulapricing.conditions CASCADE;
DROP TABLE IF EXISTS formulapricing.calculations CASCADE;
DROP TABLE IF EXISTS formulapricing.variables CASCADE;
DROP TABLE IF EXISTS formulapricing.logs CASCADE;
DROP TABLE IF EXISTS formulapricing.superusers CASCADE;

-- Drop the schema
DROP SCHEMA IF EXISTS formulapricing CASCADE;