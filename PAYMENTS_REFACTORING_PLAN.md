# Payments Database Refactoring Implementation Plan

## Overview
This plan implements comprehensive database and UI changes to enhance the payments system with:
- Dynamic type system for entities and products
- Geographic location support for entities
- Flexible filtering system with admin-configurable metadata
- Removal of static tags in favor of dynamic metadata

## Phase 1: Database Schema Changes

### 1.1 Core Table Structure Updates
- [x] **Add metadata JSONB to entities table**
- [x] **Remove tags from entities table**
- [x] **Remove tags from products table**
- [x] **Add type and sub_type columns to entities table**
- [x] **Add type and sub_type columns to products table**
- [x] **Add location GEOGRAPHY(Point, 4326) to entities table**

### 1.2 Dynamic Filtering System
- [x] **Add 5 numeric filter columns to entities** (filter_numeric_1 through filter_numeric_5)
- [x] **Add 5 text filter columns to entities** (filter_text_1 through filter_text_5)
- [x] **Add 5 boolean filter columns to entities** (filter_boolean_1 through filter_boolean_5)
- [x] **Add 5 date filter columns to entities** (filter_date_1 through filter_date_5)
- [x] **Add 5 numeric filter columns to products** (filter_numeric_1 through filter_numeric_5)
- [x] **Add 5 text filter columns to products** (filter_text_1 through filter_text_5)
- [x] **Add 5 boolean filter columns to products** (filter_boolean_1 through filter_boolean_5)
- [x] **Add 5 date filter columns to products** (filter_date_1 through filter_date_5)

### 1.3 Type Configuration System
- [x] **Create entity_types table** with columns:
  - id UUID PRIMARY KEY
  - name TEXT NOT NULL UNIQUE
  - description TEXT
  - metadata_schema JSONB (defines allowed metadata fields)
  - filter_config JSONB (defines which filter columns are used and their labels)
  - location_required BOOLEAN DEFAULT false
  - created_at, updated_at timestamps

- [x] **Create entity_sub_types table** with columns:
  - id UUID PRIMARY KEY
  - entity_type_id UUID REFERENCES entity_types(id)
  - name TEXT NOT NULL
  - description TEXT
  - metadata_schema JSONB
  - filter_config JSONB
  - created_at, updated_at timestamps
  - UNIQUE(entity_type_id, name)

- [x] **Create product_types table** with columns:
  - id UUID PRIMARY KEY
  - name TEXT NOT NULL UNIQUE
  - description TEXT
  - metadata_schema JSONB
  - filter_config JSONB
  - created_at, updated_at timestamps

- [x] **Create product_sub_types table** with columns:
  - id UUID PRIMARY KEY
  - product_type_id UUID REFERENCES product_types(id)
  - name TEXT NOT NULL
  - description TEXT
  - metadata_schema JSONB
  - filter_config JSONB
  - created_at, updated_at timestamps
  - UNIQUE(product_type_id, name)

### 1.4 Database Indexes and Constraints
- [x] **Add indexes for new type columns**
- [x] **Add indexes for filter columns**
- [x] **Add spatial index for location column**
- [x] **Add foreign key constraints for type references**
- [x] **Update existing triggers for new tables**

### 1.5 Default Data
- [x] **Created default entity and product types** with:
  - Default types for accommodation, service, ecommerce, experience
  - Comprehensive metadata schemas and filter configurations
  - Sub-types for common variations

## Phase 2: API Layer Updates

### 2.1 Entity Type Management API
- [x] **Create API endpoints for entity types CRUD**:
  - GET /api/admin/entity-types
  - POST /api/admin/entity-types
  - PUT /api/admin/entity-types/:id
  - DELETE /api/admin/entity-types/:id

- [x] **Create API endpoints for entity sub-types CRUD**:
  - GET /api/admin/entity-types/:id/sub-types
  - POST /api/admin/entity-types/:id/sub-types
  - PUT /api/admin/entity-sub-types/:id
  - DELETE /api/admin/entity-sub-types/:id

### 2.2 Product Type Management API
- [x] **Create API endpoints for product types CRUD**:
  - GET /api/admin/product-types
  - POST /api/admin/product-types
  - PUT /api/admin/product-types/:id
  - DELETE /api/admin/product-types/:id

- [x] **Create API endpoints for product sub-types CRUD**:
  - GET /api/admin/product-types/:id/sub-types
  - POST /api/admin/product-types/:id/sub-types
  - PUT /api/admin/product-sub-types/:id
  - DELETE /api/admin/product-sub-types/:id

### 2.3 Enhanced Entity and Product APIs
- [x] **Update entity creation/update APIs** to handle:
  - Type and sub-type selection
  - Dynamic metadata based on type schema
  - Filter column population
  - Location data (latitude/longitude)

- [x] **Update product creation/update APIs** to handle:
  - Type and sub-type selection
  - Dynamic metadata based on type schema
  - Filter column population

- [ ] **Create advanced filtering endpoints**:
  - GET /api/entities/search (with geographic and filter-based search)
  - GET /api/products/search (with filter-based search)

### 2.4 Type Schema Validation
- [x] **Create metadata validation service** that:
  - Validates metadata against type schema
  - Ensures required fields are present
  - Validates data types and constraints

- [x] **Create filter mapping service** that:
  - Maps metadata to appropriate filter columns
  - Handles data type conversions
  - Maintains consistency between metadata and filters

## Phase 3: Admin Package UI Implementation

### 3.1 Entity Type Management Interface
- [x] **Create EntityTypeManagement component** with:
  - List view of all entity types
  - Create/edit forms for entity types
  - Metadata schema builder interface
  - Filter configuration interface
  - Delete functionality with safety checks

- [x] **Create EntitySubTypeManagement component** with:
  - Nested sub-type management within entity types
  - Schema inheritance from parent types
  - Override capabilities for sub-type specific configs

### 3.2 Product Type Management Interface
- [x] **Create ProductTypeManagement component** with:
  - List view of all product types
  - Create/edit forms for product types
  - Metadata schema builder interface
  - Filter configuration interface

- [x] **Create ProductSubTypeManagement component** with:
  - Nested sub-type management within product types
  - Schema inheritance capabilities

### 3.3 Schema Builder Components
- [x] **Create MetadataSchemaBuilder component** that allows:
  - Adding/removing metadata fields
  - Configuring field types (text, number, boolean, date, select)
  - Setting field constraints (required, min/max, options)
  - Preview of generated forms

- [x] **Create FilterConfigBuilder component** that allows:
  - Mapping metadata fields to filter columns
  - Configuring filter labels and display options
  - Setting searchable/filterable flags

### 3.4 Admin Dashboard Integration
- [x] **Add type management sections to admin sidebar**
- [x] **Create dashboard widgets for type statistics**
- [x] **Add validation and error handling throughout admin interface**

## Phase 4: Payments Package UI Implementation

### 4.1 Dynamic Entity Creation Forms
- [x] **Update EntityForm component** to:
  - Display type/sub-type selection dropdowns
  - Dynamically render metadata fields based on selected type
  - Handle location input (map picker or lat/lng inputs)
  - Populate filter columns automatically from metadata

- [x] **Create TypeSelector component** for:
  - Hierarchical type/sub-type selection
  - Dynamic form field generation
  - Real-time metadata schema loading

### 4.2 Dynamic Product Creation Forms
- [x] **Update ProductForm component** to:
  - Display type/sub-type selection dropdowns
  - Dynamically render metadata fields based on selected type
  - Populate filter columns automatically from metadata

### 4.3 Enhanced Filtering and Search
- [ ] **Create AdvancedEntitySearch component** with:
  - Geographic radius search
  - Dynamic filter inputs based on available types
  - Map-based result display
  - Filter by type/sub-type

- [ ] **Create AdvancedProductSearch component** with:
  - Dynamic filter inputs based on available types
  - Filter by type/sub-type
  - Metadata-based search

### 4.4 List and Detail Views
- [ ] **Update EntityList component** to:
  - Display type information
  - Show relevant metadata fields
  - Support advanced filtering

- [ ] **Update ProductList component** to:
  - Display type information
  - Show relevant metadata fields
  - Support advanced filtering

- [ ] **Update detail views** to display dynamic metadata in organized sections

## Phase 5: Testing

### 5.1 Testing
- [ ] **Create unit tests** for:
  - New API endpoints
  - Metadata validation logic
  - Filter mapping services
  - Schema builder components

- [ ] **Create integration tests** for:
  - End-to-end type creation workflow
  - Entity/product creation with dynamic forms
  - Search and filtering functionality

- [ ] **Create UI tests** for:
  - Admin type management interfaces
  - Dynamic form generation
  - Search and filter interfaces

### 5.2 Documentation
- [x] **Update API documentation** with new endpoints and schemas
- [x] **Create admin user guide** for type management
- [x] **Create user guide** for enhanced entity/product creation
