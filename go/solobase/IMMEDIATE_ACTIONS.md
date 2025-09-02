# Immediate Actions - Products Extension Integration

## Current Issues to Fix

### 1. Database Integration Missing
**Problem**: Models exist but aren't registered with GORM
**Solution**: 
```go
// In main.go or database init
db.AutoMigrate(
    &models.EntityType{},
    &models.Entity{},
    &models.ProductType{},
    &models.Product{},
    &models.Variable{},
    &models.PricingRule{},
    &models.PricingTemplate{},
)
```

### 2. Extension Not Properly Initialized
**Problem**: Extension doesn't receive database connection
**Solution**: Update extension initialization in `extension.go`

### 3. API Routes Not Connected
**Problem**: Current `/api/ext/products/*` routes use placeholder handlers
**Solution**: Connect to actual extension API handlers

## Step-by-Step Implementation

### Step 1: Fix Extension Initialization
```go
// extensions/official/products/extension.go
func (e *ProductsExtension) Initialize(ctx context.Context, services *core.ExtensionServices) error {
    // Get database from services
    e.db = services.Database
    
    // Initialize services
    e.services = &Services{
        Entity:   services.NewEntityService(e.db),
        Product:  services.NewProductService(e.db),
        Variable: services.NewVariableService(e.db),
        Pricing:  services.NewPricingService(e.db),
        Sales:    services.NewSalesService(e.db),
    }
    
    // Initialize APIs
    e.apis = &APIs{
        Admin:  api.NewAdminAPI(e.services),
        User:   api.NewUserAPI(e.services),
        Public: api.NewPublicAPI(e.services),
    }
    
    return nil
}
```

### Step 2: Register Database Models
```go
// models/register.go
func RegisterModels(db *gorm.DB) error {
    return db.AutoMigrate(
        &EntityType{},
        &Entity{},
        &ProductType{},
        &Product{},
        &ProductImage{},
        &Variable{},
        &PricingRule{},
        &PricingTemplate{},
        &PriceCalculation{},
    )
}
```

### Step 3: Connect API Routes
```go
// api/router.go - Replace placeholder handlers
// Products Admin API
apiRouter.HandleFunc("/products/variables", productExt.APIs.Admin.ListVariables).Methods("GET")
apiRouter.HandleFunc("/products/variables", productExt.APIs.Admin.CreateVariable).Methods("POST")
apiRouter.HandleFunc("/products/variables/{id}", productExt.APIs.Admin.UpdateVariable).Methods("PUT")
apiRouter.HandleFunc("/products/variables/{id}", productExt.APIs.Admin.DeleteVariable).Methods("DELETE")

// Entity Types
apiRouter.HandleFunc("/products/entity-types", productExt.APIs.Admin.ListEntityTypes).Methods("GET")
apiRouter.HandleFunc("/products/entity-types", productExt.APIs.Admin.CreateEntityType).Methods("POST")

// Product Types
apiRouter.HandleFunc("/products/product-types", productExt.APIs.Admin.ListProductTypes).Methods("GET")
apiRouter.HandleFunc("/products/product-types", productExt.APIs.Admin.CreateProductType).Methods("POST")

// Pricing Rules
apiRouter.HandleFunc("/products/pricing-rules", productExt.APIs.Admin.ListPricingRules).Methods("GET")
apiRouter.HandleFunc("/products/pricing-rules", productExt.APIs.Admin.CreatePricingRule).Methods("POST")

// User API
apiRouter.HandleFunc("/user/entities", productExt.APIs.User.ListEntities).Methods("GET")
apiRouter.HandleFunc("/user/entities", productExt.APIs.User.CreateEntity).Methods("POST")
apiRouter.HandleFunc("/user/products", productExt.APIs.User.ListProducts).Methods("GET")
apiRouter.HandleFunc("/user/products", productExt.APIs.User.CreateProduct).Methods("POST")
```

### Step 4: Update Admin UI

#### 4.1 Create Variables Management Page
```svelte
<!-- admin/src/routes/products/variables/+page.svelte -->
- List all variables
- Create/Edit/Delete variables
- Set variable types and validation
- Test variable in formulas
```

#### 4.2 Create Entity Types Page
```svelte
<!-- admin/src/routes/products/entity-types/+page.svelte -->
- List entity types
- Create with dynamic field builder
- Preview entity creation form
- Set default values
```

#### 4.3 Create Product Types Page
```svelte
<!-- admin/src/routes/products/product-types/+page.svelte -->
- List product types
- Link to entity types
- Define product-specific fields
- Set pricing templates
```

#### 4.4 Create Pricing Rules Page
```svelte
<!-- admin/src/routes/products/pricing/+page.svelte -->
- Visual formula builder
- Variable selector
- Test with sample data
- Save as templates
```

### Step 5: Update User Profile

#### 5.1 Add Entities Section
```svelte
<!-- admin/src/routes/profile/entities/+page.svelte -->
- List user's entities
- Create based on entity types
- Dynamic forms from schema
- Edit entity details
```

#### 5.2 Add Products Section
```svelte
<!-- admin/src/routes/profile/products/+page.svelte -->
- List user's products
- Add to entities
- Set product variables
- View calculated prices
```

## Testing Plan

### 1. Database Tests
```bash
# Test migrations
go test ./extensions/official/products/models

# Test services
go test ./extensions/official/products/services
```

### 2. API Tests
```bash
# Create variable
curl -X POST http://localhost:8093/api/products/variables \
  -H "Content-Type: application/json" \
  -d '{"name":"room_count","type":"number","default_value":1}'

# Create entity type
curl -X POST http://localhost:8093/api/products/entity-types \
  -H "Content-Type: application/json" \
  -d '{"name":"hotel","display_name":"Hotel","schema":{...}}'
```

### 3. UI Tests
- Admin can create variables ✓
- Admin can create entity types ✓
- Admin can create product types ✓
- Admin can define pricing formulas ✓
- User can create entities ✓
- User can add products ✓
- Prices calculate correctly ✓

## Timeline

### Day 1-2: Backend Integration
- [ ] Fix extension initialization
- [ ] Register database models
- [ ] Connect API routes
- [ ] Test with curl commands

### Day 3-4: Admin UI
- [ ] Variables management page
- [ ] Entity types page
- [ ] Product types page
- [ ] Basic pricing rules page

### Day 5-6: User UI
- [ ] User entities page
- [ ] User products page
- [ ] Price calculation display

### Day 7: Testing & Polish
- [ ] Integration tests
- [ ] Bug fixes
- [ ] Documentation
- [ ] Demo preparation

## Dependencies

### Required Packages
- ✅ formulaengine (exists)
- ✅ dynamicfields (exists)
- ✅ GORM (installed)
- ✅ SvelteKit (installed)

### Required Services
- ✅ Database (SQLite/PostgreSQL)
- ✅ Authentication (existing)
- ✅ Storage (for product images)

## Risk Mitigation

### Risk 1: Breaking Changes
**Mitigation**: Keep old handlers temporarily, gradual migration

### Risk 2: Performance Issues
**Mitigation**: Add caching for price calculations, optimize queries

### Risk 3: Complex UI
**Mitigation**: Start with simple forms, iterate based on feedback

## Success Criteria
1. Admin can manage the full product system
2. Users can create and price products
3. Formulas calculate correctly
4. System is performant with 1000+ products
5. UI is intuitive and responsive