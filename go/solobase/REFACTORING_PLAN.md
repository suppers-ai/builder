# Products Extension Refactoring Plan

## Current State Analysis

### ✅ What Already Exists
1. **Packages**
   - `formulaengine` - Formula calculation engine with parser, evaluator, and calculator
   - `dynamicfields` - Dynamic field definitions with validation and schema management

2. **Models** (in extensions/official/products/models/)
   - `EntityType` - Defines types of entities with dynamic field schemas
   - `Entity` - Instances of entity types with dynamic field values
   - `ProductType` - Defines product types with dynamic field schemas
   - `Product` - Product instances linked to entities with dynamic fields
   - `Variable` - Dynamic variables for pricing calculations
   - `PricingRule` - Formula-based pricing rules with conditions
   - `PricingTemplate` - Reusable pricing templates

3. **Services** (in extensions/official/products/services/)
   - `EntityService` - CRUD operations for entities
   - `ProductService` - Product management
   - `VariableService` - Variable management
   - `PricingService` - Price calculation using formulas
   - `SalesService` - Sales and order management

4. **API Handlers** (in extensions/official/products/api/)
   - `AdminAPI` - Admin endpoints for managing types, variables, and templates
   - `UserAPI` - User endpoints for creating entities and products
   - `PublicAPI` - Public endpoints for browsing products

### ❌ What's Missing/Not Working

1. **Database Integration**
   - Models are defined but not registered with GORM
   - No database migrations
   - Services don't persist data to database

2. **API Routes**
   - Extension APIs not exposed through the main router
   - Current `/ext/products/api/*` routes use simple handlers, not the actual extension

3. **Frontend Integration**
   - Admin UI doesn't show entity types, product types, or variables
   - No UI for formula creation
   - User profile doesn't have entity/product management

## Required Architecture

### System Flow
```
Admin Level:
1. Create Variables (e.g., "room_count", "season", "nights")
2. Create Entity Types (e.g., "Hotel", "Accommodation")
3. Create Product Types (e.g., "Room", "Suite")  
4. Define Pricing Formulas (e.g., "base_price * room_count * season_multiplier")

User Level:
1. Create Entities (e.g., "My Beach Hotel")
2. Add Products to Entities (e.g., "Ocean View Room")
3. Set Variable Values (e.g., room_count=10, season="high")
4. System calculates prices using formulas
```

## Refactoring Tasks

### Phase 1: Database Setup
1. **Create Migration System**
   ```go
   // migrations/products_extension.go
   - Register all models with GORM
   - Create tables for EntityType, Entity, ProductType, Product, Variable, PricingRule
   - Add indexes and foreign keys
   ```

2. **Update Services to Use Database**
   ```go
   // Update each service to:
   - Accept *gorm.DB in constructor
   - Implement actual CRUD operations
   - Add transaction support
   ```

### Phase 2: Wire Extension Properly
1. **Update Extension Initialization**
   ```go
   // extensions/official/products/extension.go
   - Properly initialize services with database
   - Register API routes
   - Setup background tasks
   ```

2. **Expose Extension Routes**
   ```go
   // api/router.go
   - Add product extension routes under /api/products/*
   - Map to actual extension handlers, not placeholder ones
   ```

### Phase 3: Admin UI Implementation
1. **Variable Management Page** (`/admin/products/variables`)
   - List/Create/Edit/Delete variables
   - Set validation rules
   - Categories and grouping

2. **Entity Types Page** (`/admin/products/entity-types`)
   - Create entity types with dynamic field schemas
   - Use dynamicfields package for field definitions
   - Preview entity creation form

3. **Product Types Page** (`/admin/products/product-types`)
   - Create product types with field schemas
   - Link to entity types
   - Set default pricing templates

4. **Pricing Rules Page** (`/admin/products/pricing`)
   - Visual formula builder
   - Test formulas with sample data
   - Create pricing templates

### Phase 4: User UI Implementation
1. **User Profile Extension** (`/profile/entities`)
   - List user's entities
   - Create new entities based on available types
   - Dynamic forms based on entity type schema

2. **Product Management** (`/profile/products`)
   - Add products to entities
   - Set product-specific variables
   - View calculated prices

3. **Public Product Pages**
   - Browse products by entity
   - Dynamic pricing display
   - Add to cart functionality

### Phase 5: Integration & Testing
1. **Formula Engine Integration**
   - Connect PricingService to formulaengine
   - Implement VariableResolver interface
   - Add caching for calculations

2. **Dynamic Fields Integration**
   - Use dynamicfields for all entity/product forms
   - Validation on save
   - Schema versioning

3. **Testing**
   - Unit tests for services
   - Integration tests for API
   - E2E tests for critical flows

## Implementation Priority

### Immediate (Week 1)
1. ✅ Fix database integration
2. ✅ Wire extension routes properly
3. ✅ Create basic admin UI for variables

### Short-term (Week 2)
1. Entity type management UI
2. Product type management UI
3. Basic pricing formula UI

### Medium-term (Week 3-4)
1. User entity/product management
2. Formula builder UI
3. Pricing calculation integration

### Long-term (Month 2)
1. Advanced features (bulk operations, import/export)
2. Performance optimization
3. Analytics and reporting

## Technical Decisions

### Database Schema
- Use GORM with PostgreSQL/SQLite
- JSON columns for dynamic fields
- Soft deletes for audit trail

### API Design
- RESTful endpoints for CRUD
- GraphQL for complex queries (future)
- WebSocket for real-time pricing

### Frontend Architecture
- SvelteKit for admin and user UIs
- Shared component library
- Real-time validation

### Security
- Row-level security for user data
- Admin-only endpoints protected
- Input validation at all levels

## Migration Strategy

### From Current State
1. Keep existing API handlers temporarily
2. Gradually migrate to extension handlers
3. Maintain backward compatibility
4. Deprecate old endpoints after migration

### Data Migration
1. No existing data to migrate (empty tables)
2. Seed data for testing
3. Import templates from files

## Success Metrics
- ✅ Admin can create variables, entity types, and product types
- ✅ Admin can define pricing formulas
- ✅ Users can create entities and products
- ✅ Prices calculate correctly based on formulas
- ✅ System handles 1000+ products efficiently
- ✅ UI is intuitive and responsive

## Next Steps
1. Review and approve this plan
2. Create detailed tickets for each phase
3. Begin with Phase 1: Database Setup
4. Weekly progress reviews