# Products Extension Implementation Plan

## Overview
This document outlines the comprehensive plan to refactor the existing `dynamicproducts` and `formulapricing` packages into a unified **Products Extension** for Solobase. The extension will enable users to list and sell products with configurable entity types, product types, variable definitions, and formula-based pricing.

## Architecture Overview

### Package Structure
```
/go/solobase/extensions/official/products/
├── extension.go           # Main extension entry point
├── models/                 # Data models
│   ├── entity.go          # Entity types and instances
│   ├── product.go         # Product types and instances
│   ├── variable.go        # Variable definitions
│   ├── pricing.go         # Pricing rules and formulas
│   └── sales.go           # Sales/orders tracking
├── services/              # Business logic
│   ├── entity_service.go  # Entity management
│   ├── product_service.go # Product management
│   ├── variable_service.go # Variable management
│   ├── pricing_service.go # Pricing calculations
│   └── sales_service.go   # Sales/order processing
├── engine/                # Core calculation engine
│   ├── calculator.go      # Formula calculation engine
│   ├── evaluator.go       # Condition evaluator
│   └── parser.go          # Formula parser
├── api/                   # API handlers
│   ├── admin_api.go       # Admin endpoints
│   ├── user_api.go        # User endpoints
│   └── public_api.go      # Public endpoints
├── migrations/            # Database migrations
│   └── 001_initial.sql    # Initial schema
└── README.md              # Extension documentation
```

### Standalone Package Refactoring
```
/go/packages/
├── formulaengine/         # Standalone formula calculation engine
│   ├── calculator.go      # Core calculation logic
│   ├── parser.go          # Formula parsing
│   ├── evaluator.go       # Condition evaluation
│   └── engine_test.go     # Unit tests
└── dynamicfields/         # Standalone dynamic field system
    ├── schema.go          # Field schema definitions
    ├── validator.go       # Field validation
    ├── mapper.go          # Field mapping utilities
    └── fields_test.go     # Unit tests
```

## Implementation Phases

### Phase 1: Core Package Refactoring (Week 1)

#### 1.1 Extract Formula Engine
- [ ] Create `/go/packages/formulaengine` package directory
- [ ] Create `go.mod` file for formulaengine package
- [ ] Extract calculator logic from `formulapricing/engine/calculator.go`
- [ ] Remove all database dependencies from calculator
- [ ] Create `interfaces.go` with pure interfaces:
  - [ ] `VariableResolver` interface
  - [ ] `Calculator` interface
  - [ ] `Evaluator` interface
  - [ ] `Parser` interface
- [ ] Implement `calculator.go` with core calculation logic
- [ ] Implement `parser.go` for formula parsing
- [ ] Implement `evaluator.go` for condition evaluation
- [ ] Create `errors.go` with custom error types
- [ ] Write unit tests in `calculator_test.go`
- [ ] Write unit tests in `parser_test.go`
- [ ] Write unit tests in `evaluator_test.go`
- [ ] Create `README.md` with usage examples
- [ ] Add benchmark tests for performance validation

#### 1.2 Extract Dynamic Fields System
- [ ] Create `/go/packages/dynamicfields` package directory
- [ ] Create `go.mod` file for dynamicfields package
- [ ] Extract field schema logic from `dynamicproducts/models`
- [ ] Create `types.go` with field type definitions:
  - [ ] Text field type
  - [ ] Number field type
  - [ ] Boolean field type
  - [ ] Date/DateTime field types
  - [ ] Enum field type
  - [ ] Array field type
  - [ ] Point (geo) field type
  - [ ] File/Image field type
- [ ] Implement `schema.go` for schema definitions
- [ ] Implement `validator.go` with validation rules:
  - [ ] Required field validation
  - [ ] Min/Max value validation
  - [ ] Pattern matching validation
  - [ ] Custom validation functions
- [ ] Implement `mapper.go` for field mapping utilities
- [ ] Create `errors.go` with validation error types
- [ ] Write unit tests in `schema_test.go`
- [ ] Write unit tests in `validator_test.go`
- [ ] Write unit tests in `mapper_test.go`
- [ ] Create `README.md` with usage examples

### Phase 2: Database Models with GORM (Week 1-2)

#### 2.1 Database Models Implementation
- [ ] Create models directory `/go/solobase/extensions/official/products/models/`
- [ ] Implement `models/entity_type.go` with GORM model
- [ ] Implement `models/product_type.go` with GORM model
- [ ] Implement `models/variable.go` with GORM model
- [ ] Implement `models/pricing_template.go` with GORM model
- [ ] Implement `models/entity.go` with GORM model
- [ ] Implement `models/product.go` with GORM model
- [ ] Implement `models/sale.go` with GORM model
- [ ] Implement `models/favorite.go` with GORM model
- [ ] Add GORM hooks for validation
- [ ] Add GORM hooks for slug generation
- [ ] Setup auto-migration in extension initialization
- [ ] Document model relationships in `MODELS.md`

#### 2.2 Core GORM Models

```go
// Entity Type Model
type EntityType struct {
    ID                 uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    Name               string                 `gorm:"type:varchar(255);not null;uniqueIndex"`
    DisplayName        string                 `gorm:"type:varchar(255);not null"`
    Description        string                 `gorm:"type:text"`
    Icon               string                 `gorm:"type:varchar(100)"`
    MetadataSchema     datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    FilterConfig       datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    LocationRequired   bool                   `gorm:"default:false"`
    AllowUserCreation  bool                   `gorm:"default:true"`
    IsActive           bool                   `gorm:"default:true"`
    CreatedAt          time.Time
    UpdatedAt          time.Time
    DeletedAt          gorm.DeletedAt         `gorm:"index"`
    
    // Relationships
    Entities           []Entity               `gorm:"foreignKey:EntityTypeID"`
}

// Product Type Model
type ProductType struct {
    ID                 uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    Name               string                 `gorm:"type:varchar(255);not null;uniqueIndex"`
    DisplayName        string                 `gorm:"type:varchar(255);not null"`
    Description        string                 `gorm:"type:text"`
    Icon               string                 `gorm:"type:varchar(100)"`
    MetadataSchema     datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    FilterConfig       datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    RequiresEntity     bool                   `gorm:"default:false"`
    PricingType        string                 `gorm:"type:varchar(50);default:'fixed'"` // fixed, formula, dynamic
    IsActive           bool                   `gorm:"default:true"`
    CreatedAt          time.Time
    UpdatedAt          time.Time
    DeletedAt          gorm.DeletedAt         `gorm:"index"`
    
    // Relationships
    Products           []Product              `gorm:"foreignKey:ProductTypeID"`
    PricingTemplates   []PricingTemplate      `gorm:"foreignKey:ProductTypeID"`
}

// Variable Model
type Variable struct {
    ID                 uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    Category           string                 `gorm:"type:varchar(100);not null;index"` // system, product, entity, custom
    VariableName       string                 `gorm:"type:varchar(255);not null;uniqueIndex"`
    DisplayName        string                 `gorm:"type:varchar(255);not null"`
    Description        string                 `gorm:"type:text"`
    ValueType          string                 `gorm:"type:varchar(50);not null"` // text, number, boolean, date, enum, array
    DefaultValue       *string                `gorm:"type:text"`
    ValidationRules    datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    DisplayOrder       int                    `gorm:"default:0"`
    IsRequired         bool                   `gorm:"default:false"`
    MinValue           *float64               `gorm:"type:numeric"`
    MaxValue           *float64               `gorm:"type:numeric"`
    StepValue          *float64               `gorm:"type:numeric"`
    EnumValues         datatypes.JSON         `gorm:"type:jsonb"`
    CreatedAt          time.Time
    UpdatedAt          time.Time
    DeletedAt          gorm.DeletedAt         `gorm:"index"`
}

// Pricing Template Model
type PricingTemplate struct {
    ID                 uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    Name               string                 `gorm:"type:varchar(255);not null"`
    Description        string                 `gorm:"type:text"`
    ProductTypeID      *uuid.UUID             `gorm:"type:uuid;index"`
    Rules              datatypes.JSON         `gorm:"type:jsonb;not null"` // Array of {condition, calculation} objects
    VariablesUsed      datatypes.JSON         `gorm:"type:jsonb;default:'[]'"` // List of variable IDs used
    IsActive           bool                   `gorm:"default:true"`
    CreatedAt          time.Time
    UpdatedAt          time.Time
    DeletedAt          gorm.DeletedAt         `gorm:"index"`
    
    // Relationships
    ProductType        *ProductType           `gorm:"foreignKey:ProductTypeID"`
    Products           []Product              `gorm:"foreignKey:PricingTemplateID"`
}

// Entity Model
type Entity struct {
    ID                 uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    EntityTypeID       uuid.UUID              `gorm:"type:uuid;not null;index"`
    OwnerID            uuid.UUID              `gorm:"type:uuid;not null;index"`
    Name               string                 `gorm:"type:varchar(255);not null"`
    Slug               string                 `gorm:"type:varchar(255);uniqueIndex"`
    Description        string                 `gorm:"type:text"`
    Photos             datatypes.JSON         `gorm:"type:jsonb;default:'[]'"`
    Metadata           datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    Location           *string                `gorm:"type:geography(POINT,4326)"` // PostGIS point
    Address            string                 `gorm:"type:text"`
    ViewsCount         int                    `gorm:"default:0"`
    LikesCount         int                    `gorm:"default:0"`
    RatingAverage      *float32               `gorm:"type:numeric(3,2)"`
    RatingCount        int                    `gorm:"default:0"`
    Status             string                 `gorm:"type:varchar(50);default:'active';index"`
    CreatedAt          time.Time
    UpdatedAt          time.Time
    DeletedAt          gorm.DeletedAt         `gorm:"index"`
    
    // Relationships
    EntityType         EntityType             `gorm:"foreignKey:EntityTypeID"`
    Owner              auth.User              `gorm:"foreignKey:OwnerID"`
    Products           []Product              `gorm:"foreignKey:EntityID"`
    Favorites          []Favorite             `gorm:"foreignKey:EntityID"`
}

// Product Model
type Product struct {
    ID                 uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    ProductTypeID      uuid.UUID              `gorm:"type:uuid;not null;index"`
    EntityID           *uuid.UUID             `gorm:"type:uuid;index"`
    SellerID           uuid.UUID              `gorm:"type:uuid;not null;index"`
    PricingTemplateID  *uuid.UUID             `gorm:"type:uuid;index"`
    Name               string                 `gorm:"type:varchar(255);not null"`
    Slug               string                 `gorm:"type:varchar(255);uniqueIndex"`
    Description        string                 `gorm:"type:text"`
    Price              *float64               `gorm:"type:numeric(10,2)"`
    Currency           string                 `gorm:"type:varchar(3);default:'USD'"`
    Photos             datatypes.JSON         `gorm:"type:jsonb;default:'[]'"`
    Metadata           datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    VariableValues     datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    InventoryCount     *int
    ViewsCount         int                    `gorm:"default:0"`
    LikesCount         int                    `gorm:"default:0"`
    SalesCount         int                    `gorm:"default:0"`
    RatingAverage      *float32               `gorm:"type:numeric(3,2)"`
    RatingCount        int                    `gorm:"default:0"`
    Status             string                 `gorm:"type:varchar(50);default:'active';index"`
    CreatedAt          time.Time
    UpdatedAt          time.Time
    DeletedAt          gorm.DeletedAt         `gorm:"index"`
    
    // Relationships
    ProductType        ProductType            `gorm:"foreignKey:ProductTypeID"`
    Entity             *Entity                `gorm:"foreignKey:EntityID"`
    Seller             auth.User              `gorm:"foreignKey:SellerID"`
    PricingTemplate    *PricingTemplate       `gorm:"foreignKey:PricingTemplateID"`
    Sales              []Sale                 `gorm:"foreignKey:ProductID"`
    Favorites          []Favorite             `gorm:"foreignKey:ProductID"`
}

// Sale Model
type Sale struct {
    ID                 uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    OrderNumber        string                 `gorm:"type:varchar(50);uniqueIndex"`
    ProductID          uuid.UUID              `gorm:"type:uuid;not null;index"`
    BuyerID            uuid.UUID              `gorm:"type:uuid;not null;index"`
    SellerID           uuid.UUID              `gorm:"type:uuid;not null;index"`
    Quantity           int                    `gorm:"not null;default:1"`
    UnitPrice          float64                `gorm:"type:numeric(10,2);not null"`
    TotalPrice         float64                `gorm:"type:numeric(10,2);not null"`
    Currency           string                 `gorm:"type:varchar(3);default:'USD'"`
    VariableSnapshot   datatypes.JSON         `gorm:"type:jsonb"`
    PaymentMethod      string                 `gorm:"type:varchar(50)"`
    PaymentStatus      string                 `gorm:"type:varchar(50);default:'pending';index"`
    FulfillmentStatus  string                 `gorm:"type:varchar(50);default:'pending';index"`
    Notes              string                 `gorm:"type:text"`
    Metadata           datatypes.JSON         `gorm:"type:jsonb;default:'{}'"`
    CompletedAt        *time.Time
    CreatedAt          time.Time
    UpdatedAt          time.Time
    DeletedAt          gorm.DeletedAt         `gorm:"index"`
    
    // Relationships
    Product            Product                `gorm:"foreignKey:ProductID"`
    Buyer              auth.User              `gorm:"foreignKey:BuyerID"`
    Seller             auth.User              `gorm:"foreignKey:SellerID"`
}

// Favorite Model
type Favorite struct {
    ID                 uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
    UserID             uuid.UUID              `gorm:"type:uuid;not null;index"`
    EntityID           *uuid.UUID             `gorm:"type:uuid;index"`
    ProductID          *uuid.UUID             `gorm:"type:uuid;index"`
    CreatedAt          time.Time
    
    // Relationships
    User               auth.User              `gorm:"foreignKey:UserID"`
    Entity             *Entity                `gorm:"foreignKey:EntityID"`
    Product            *Product               `gorm:"foreignKey:ProductID"`
}

// Setup unique constraints in BeforeCreate hooks
func (f *Favorite) BeforeCreate(tx *gorm.DB) error {
    // Ensure either EntityID or ProductID is set, not both
    if (f.EntityID == nil && f.ProductID == nil) || 
       (f.EntityID != nil && f.ProductID != nil) {
        return errors.New("favorite must reference either entity or product, not both")
    }
    return nil
}
```

#### 2.3 Database Package Integration
- [ ] Import database package from `/go/solobase/database`
- [ ] Use database adapter interface
- [ ] Implement AutoMigrate in extension Initialize():
  ```go
  db.AutoMigrate(
      &EntityType{},
      &ProductType{},
      &Variable{},
      &PricingTemplate{},
      &Entity{},
      &Product{},
      &Sale{},
      &Favorite{},
  )
  ```
- [ ] Setup GORM indexes using tags
- [ ] Configure soft deletes with DeletedAt
- [ ] Add database hooks for:
  - [ ] Slug generation
  - [ ] Validation
  - [ ] Cascade deletes
  - [ ] Update counters

#### 2.4 Default Data Seeding

##### Configuration for Default Data
```go
type DefaultDataConfig struct {
    EnableSystemVariables     bool `json:"enable_system_variables" default:"true"`
    EnableEcommerceTemplates  bool `json:"enable_ecommerce_templates" default:"true"`
    EnableSubscriptionTemplates bool `json:"enable_subscription_templates" default:"true"`
    EnableServiceTemplates    bool `json:"enable_service_templates" default:"true"`
    EnableAccommodationTemplates bool `json:"enable_accommodation_templates" default:"true"`
    EnableMarketplaceTemplates bool `json:"enable_marketplace_templates" default:"true"`
    EnableEventTemplates      bool `json:"enable_event_templates" default:"true"`
    EnableRentalTemplates     bool `json:"enable_rental_templates" default:"true"`
}
```

##### System Variables (Core)
- [ ] Create default system variables:
  ```go
  systemVariables := []Variable{
      // Numeric Variables
      {VariableName: "quantity", DisplayName: "Quantity", Category: "system", ValueType: "number", DefaultValue: "1", MinValue: ptr(1.0), MaxValue: ptr(10000.0), DisplayOrder: 1},
      {VariableName: "basePrice", DisplayName: "Base Price", Category: "system", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 2},
      {VariableName: "taxRate", DisplayName: "Tax Rate", Category: "system", ValueType: "number", DefaultValue: "0.0", MinValue: ptr(0.0), MaxValue: ptr(100.0), DisplayOrder: 3},
      {VariableName: "discount", DisplayName: "Discount", Category: "system", ValueType: "number", DefaultValue: "0", MinValue: ptr(0.0), MaxValue: ptr(100.0), DisplayOrder: 4},
      {VariableName: "shippingCost", DisplayName: "Shipping Cost", Category: "system", ValueType: "number", DefaultValue: "0", MinValue: ptr(0.0), DisplayOrder: 5},
      
      // Date/Time Variables
      {VariableName: "startDate", DisplayName: "Start Date", Category: "system", ValueType: "date", DisplayOrder: 10},
      {VariableName: "endDate", DisplayName: "End Date", Category: "system", ValueType: "date", DisplayOrder: 11},
      {VariableName: "duration", DisplayName: "Duration (days)", Category: "system", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 12},
      {VariableName: "hours", DisplayName: "Hours", Category: "system", ValueType: "number", MinValue: ptr(0.0), MaxValue: ptr(24.0), DisplayOrder: 13},
      
      // User Variables
      {VariableName: "userType", DisplayName: "User Type", Category: "system", ValueType: "enum", EnumValues: jsonb(["guest", "member", "premium", "vip"]), DefaultValue: "guest", DisplayOrder: 20},
      {VariableName: "membershipLevel", DisplayName: "Membership Level", Category: "system", ValueType: "enum", EnumValues: jsonb(["bronze", "silver", "gold", "platinum"]), DisplayOrder: 21},
      {VariableName: "isFirstPurchase", DisplayName: "First Purchase", Category: "system", ValueType: "boolean", DefaultValue: "false", DisplayOrder: 22},
      
      // Location Variables
      {VariableName: "distance", DisplayName: "Distance (km)", Category: "system", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 30},
      {VariableName: "deliveryZone", DisplayName: "Delivery Zone", Category: "system", ValueType: "enum", EnumValues: jsonb(["local", "regional", "national", "international"]), DisplayOrder: 31},
  }
  ```

##### E-commerce Templates
- [ ] Create e-commerce entity types:
  ```go
  ecommerceEntityTypes := []EntityType{
      {Name: "store", DisplayName: "Online Store", Description: "E-commerce store or shop", Icon: "store", AllowUserCreation: true},
      {Name: "brand", DisplayName: "Brand", Description: "Product brand or manufacturer", Icon: "tag", AllowUserCreation: false},
      {Name: "warehouse", DisplayName: "Warehouse", Description: "Storage facility", Icon: "warehouse", LocationRequired: true},
  }
  ```

- [ ] Create e-commerce product types:
  ```go
  ecommerceProductTypes := []ProductType{
      {Name: "physical_product", DisplayName: "Physical Product", Description: "Tangible goods", Icon: "package", PricingType: "formula"},
      {Name: "digital_product", DisplayName: "Digital Product", Description: "Downloadable content", Icon: "download", PricingType: "fixed"},
      {Name: "bundle", DisplayName: "Product Bundle", Description: "Multiple products as package", Icon: "layers", PricingType: "formula"},
  }
  ```

- [ ] Create e-commerce variables:
  ```go
  ecommerceVariables := []Variable{
      {VariableName: "weight", DisplayName: "Weight (kg)", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 100},
      {VariableName: "dimensions", DisplayName: "Dimensions", Category: "product", ValueType: "text", DisplayOrder: 101},
      {VariableName: "sku", DisplayName: "SKU", Category: "product", ValueType: "text", IsRequired: true, DisplayOrder: 102},
      {VariableName: "manufacturer", DisplayName: "Manufacturer", Category: "product", ValueType: "text", DisplayOrder: 103},
      {VariableName: "warranty", DisplayName: "Warranty (months)", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 104},
      {VariableName: "stockLevel", DisplayName: "Stock Level", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 105},
  }
  ```

- [ ] Create e-commerce pricing templates:
  ```go
  ecommercePricingTemplates := []PricingTemplate{
      {
          Name: "Standard Product Pricing",
          Description: "Base price with quantity discounts",
          Rules: jsonb([
              {condition: "quantity >= 10", calculation: "basePrice * quantity * 0.9"},
              {condition: "quantity >= 5", calculation: "basePrice * quantity * 0.95"},
              {condition: "true", calculation: "basePrice * quantity"},
          ]),
      },
      {
          Name: "Shipping Calculator",
          Description: "Weight and distance based shipping",
          Rules: jsonb([
              {condition: "weight > 10 && distance > 100", calculation: "weight * 2.5 + distance * 0.5"},
              {condition: "weight > 5", calculation: "weight * 2 + distance * 0.3"},
              {condition: "true", calculation: "weight * 1.5 + distance * 0.2 + 5"},
          ]),
      },
  }
  ```

##### Subscription Templates
- [ ] Create subscription product types:
  ```go
  subscriptionProductTypes := []ProductType{
      {Name: "monthly_subscription", DisplayName: "Monthly Subscription", Description: "Recurring monthly service", Icon: "calendar", PricingType: "formula"},
      {Name: "annual_subscription", DisplayName: "Annual Subscription", Description: "Yearly subscription with discount", Icon: "calendar-check", PricingType: "formula"},
      {Name: "tiered_subscription", DisplayName: "Tiered Subscription", Description: "Multiple tier options", Icon: "layers", PricingType: "formula"},
  }
  ```

- [ ] Create subscription variables:
  ```go
  subscriptionVariables := []Variable{
      {VariableName: "billingCycle", DisplayName: "Billing Cycle", Category: "product", ValueType: "enum", EnumValues: jsonb(["monthly", "quarterly", "annual"]), DisplayOrder: 200},
      {VariableName: "seats", DisplayName: "Number of Seats", Category: "product", ValueType: "number", MinValue: ptr(1.0), DefaultValue: "1", DisplayOrder: 201},
      {VariableName: "storageGB", DisplayName: "Storage (GB)", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 202},
      {VariableName: "apiCalls", DisplayName: "API Calls/month", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 203},
  }
  ```

- [ ] Create subscription pricing templates:
  ```go
  subscriptionPricingTemplates := []PricingTemplate{
      {
          Name: "SaaS Tiered Pricing",
          Description: "Per-seat pricing with volume discounts",
          Rules: jsonb([
              {condition: "seats > 100", calculation: "seats * 8 * (billingCycle == 'annual' ? 10 : 1)"},
              {condition: "seats > 20", calculation: "seats * 10 * (billingCycle == 'annual' ? 10 : 1)"},
              {condition: "seats > 5", calculation: "seats * 12 * (billingCycle == 'annual' ? 10 : 1)"},
              {condition: "true", calculation: "seats * 15 * (billingCycle == 'annual' ? 10 : 1)"},
          ]),
      },
  }
  ```

##### Service Templates
- [ ] Create service entity types:
  ```go
  serviceEntityTypes := []EntityType{
      {Name: "service_provider", DisplayName: "Service Provider", Description: "Individual or company providing services", Icon: "briefcase", AllowUserCreation: true},
      {Name: "service_location", DisplayName: "Service Location", Description: "Physical location where service is provided", Icon: "map-pin", LocationRequired: true},
  }
  ```

- [ ] Create service product types:
  ```go
  serviceProductTypes := []ProductType{
      {Name: "hourly_service", DisplayName: "Hourly Service", Description: "Time-based service billing", Icon: "clock", PricingType: "formula"},
      {Name: "project_service", DisplayName: "Project Service", Description: "Fixed project pricing", Icon: "folder", PricingType: "formula"},
      {Name: "consultation", DisplayName: "Consultation", Description: "Professional consultation", Icon: "message-circle", PricingType: "formula"},
  }
  ```

- [ ] Create service variables:
  ```go
  serviceVariables := []Variable{
      {VariableName: "hourlyRate", DisplayName: "Hourly Rate", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 300},
      {VariableName: "estimatedHours", DisplayName: "Estimated Hours", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 301},
      {VariableName: "urgency", DisplayName: "Urgency", Category: "product", ValueType: "enum", EnumValues: jsonb(["standard", "urgent", "emergency"]), DefaultValue: "standard", DisplayOrder: 302},
      {VariableName: "complexity", DisplayName: "Complexity", Category: "product", ValueType: "enum", EnumValues: jsonb(["simple", "moderate", "complex"]), DefaultValue: "moderate", DisplayOrder: 303},
  }
  ```

- [ ] Create service pricing templates:
  ```go
  servicePricingTemplates := []PricingTemplate{
      {
          Name: "Professional Services",
          Description: "Hourly rate with urgency multiplier",
          Rules: jsonb([
              {condition: "urgency == 'emergency'", calculation: "hourlyRate * hours * 2"},
              {condition: "urgency == 'urgent'", calculation: "hourlyRate * hours * 1.5"},
              {condition: "complexity == 'complex'", calculation: "hourlyRate * hours * 1.3"},
              {condition: "true", calculation: "hourlyRate * hours"},
          ]),
      },
  }
  ```

##### Accommodation Templates
- [ ] Create accommodation entity types:
  ```go
  accommodationEntityTypes := []EntityType{
      {Name: "property", DisplayName: "Property", Description: "Rental property or accommodation", Icon: "home", LocationRequired: true, AllowUserCreation: true},
      {Name: "hotel", DisplayName: "Hotel", Description: "Hotel or resort", Icon: "building", LocationRequired: true},
      {Name: "hostel", DisplayName: "Hostel", Description: "Budget accommodation", Icon: "users", LocationRequired: true},
  }
  ```

- [ ] Create accommodation product types:
  ```go
  accommodationProductTypes := []ProductType{
      {Name: "room_night", DisplayName: "Room Night", Description: "Single night accommodation", Icon: "bed", PricingType: "formula", RequiresEntity: true},
      {Name: "long_term_rental", DisplayName: "Long Term Rental", Description: "Monthly or yearly rental", Icon: "key", PricingType: "formula", RequiresEntity: true},
      {Name: "vacation_rental", DisplayName: "Vacation Rental", Description: "Short-term vacation property", Icon: "umbrella", PricingType: "formula", RequiresEntity: true},
  }
  ```

- [ ] Create accommodation variables:
  ```go
  accommodationVariables := []Variable{
      {VariableName: "guests", DisplayName: "Number of Guests", Category: "product", ValueType: "number", MinValue: ptr(1.0), DefaultValue: "2", DisplayOrder: 400},
      {VariableName: "nights", DisplayName: "Number of Nights", Category: "product", ValueType: "number", MinValue: ptr(1.0), DefaultValue: "1", DisplayOrder: 401},
      {VariableName: "roomType", DisplayName: "Room Type", Category: "product", ValueType: "enum", EnumValues: jsonb(["single", "double", "suite", "deluxe"]), DisplayOrder: 402},
      {VariableName: "season", DisplayName: "Season", Category: "product", ValueType: "enum", EnumValues: jsonb(["low", "mid", "high", "peak"]), DefaultValue: "mid", DisplayOrder: 403},
      {VariableName: "amenities", DisplayName: "Amenities", Category: "product", ValueType: "array", DisplayOrder: 404},
      {VariableName: "cleaningFee", DisplayName: "Cleaning Fee", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 405},
  }
  ```

- [ ] Create accommodation pricing templates:
  ```go
  accommodationPricingTemplates := []PricingTemplate{
      {
          Name: "Hotel Room Pricing",
          Description: "Dynamic pricing based on season and occupancy",
          Rules: jsonb([
              {condition: "season == 'peak' && nights > 7", calculation: "basePrice * nights * 1.3 * 0.9"},
              {condition: "season == 'peak'", calculation: "basePrice * nights * 1.3"},
              {condition: "season == 'high'", calculation: "basePrice * nights * 1.15"},
              {condition: "nights > 14", calculation: "basePrice * nights * 0.85"},
              {condition: "nights > 7", calculation: "basePrice * nights * 0.9"},
              {condition: "true", calculation: "basePrice * nights + cleaningFee"},
          ]),
      },
  }
  ```

##### Marketplace Templates
- [ ] Create marketplace variables:
  ```go
  marketplaceVariables := []Variable{
      {VariableName: "condition", DisplayName: "Item Condition", Category: "product", ValueType: "enum", EnumValues: jsonb(["new", "like_new", "good", "fair", "poor"]), DisplayOrder: 500},
      {VariableName: "sellerRating", DisplayName: "Seller Rating", Category: "entity", ValueType: "number", MinValue: ptr(0.0), MaxValue: ptr(5.0), DisplayOrder: 501},
      {VariableName: "platformFee", DisplayName: "Platform Fee %", Category: "system", ValueType: "number", DefaultValue: "10", MinValue: ptr(0.0), MaxValue: ptr(100.0), DisplayOrder: 502},
  }
  ```

##### Event Templates
- [ ] Create event product types:
  ```go
  eventProductTypes := []ProductType{
      {Name: "event_ticket", DisplayName: "Event Ticket", Description: "Tickets for events", Icon: "ticket", PricingType: "formula"},
      {Name: "workshop", DisplayName: "Workshop", Description: "Educational workshop or training", Icon: "book-open", PricingType: "formula"},
      {Name: "conference", DisplayName: "Conference", Description: "Multi-day conference", Icon: "users", PricingType: "formula"},
  }
  ```

- [ ] Create event variables:
  ```go
  eventVariables := []Variable{
      {VariableName: "ticketType", DisplayName: "Ticket Type", Category: "product", ValueType: "enum", EnumValues: jsonb(["general", "vip", "backstage", "early_bird"]), DisplayOrder: 600},
      {VariableName: "eventDate", DisplayName: "Event Date", Category: "product", ValueType: "datetime", IsRequired: true, DisplayOrder: 601},
      {VariableName: "venue", DisplayName: "Venue", Category: "entity", ValueType: "text", DisplayOrder: 602},
      {VariableName: "capacity", DisplayName: "Capacity", Category: "entity", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 603},
  }
  ```

##### Rental Templates
- [ ] Create rental product types:
  ```go
  rentalProductTypes := []ProductType{
      {Name: "equipment_rental", DisplayName: "Equipment Rental", Description: "Tools and equipment rental", Icon: "tool", PricingType: "formula"},
      {Name: "vehicle_rental", DisplayName: "Vehicle Rental", Description: "Car, bike, or other vehicle rental", Icon: "truck", PricingType: "formula"},
  }
  ```

- [ ] Create rental variables:
  ```go
  rentalVariables := []Variable{
      {VariableName: "rentalPeriod", DisplayName: "Rental Period", Category: "product", ValueType: "enum", EnumValues: jsonb(["hourly", "daily", "weekly", "monthly"]), DisplayOrder: 700},
      {VariableName: "depositAmount", DisplayName: "Deposit Amount", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 701},
      {VariableName: "insuranceRequired", DisplayName: "Insurance Required", Category: "product", ValueType: "boolean", DefaultValue: "false", DisplayOrder: 702},
      {VariableName: "mileageLimit", DisplayName: "Mileage Limit (km)", Category: "product", ValueType: "number", MinValue: ptr(0.0), DisplayOrder: 703},
  }
  ```

#### 2.5 Seed Data Implementation
- [ ] Create `seeds/seeder.go` with Seeder struct
- [ ] Implement SeedSystemVariables() method
- [ ] Implement SeedEcommerceTemplates() method
- [ ] Implement SeedSubscriptionTemplates() method
- [ ] Implement SeedServiceTemplates() method
- [ ] Implement SeedAccommodationTemplates() method
- [ ] Implement SeedMarketplaceTemplates() method
- [ ] Implement SeedEventTemplates() method
- [ ] Implement SeedRentalTemplates() method
- [ ] Create configuration to enable/disable each template set
- [ ] Add check to prevent duplicate seeding
- [ ] Add transaction support for atomic seeding
- [ ] Create seed verification tests

### Phase 3: Extension Development (Week 2-3)

#### 3.1 Core Extension Structure
- [ ] Create `/go/solobase/extensions/official/products/` directory
- [ ] Create `extension.go` with main extension entry point
- [ ] Implement `core.Extension` interface methods:
  - [ ] `Metadata()` method
  - [ ] `Initialize()` method
  - [ ] `Start()` method
  - [ ] `Stop()` method
  - [ ] `Health()` method
- [ ] Define extension configuration struct
- [ ] Create `config.go` for configuration management
- [ ] Setup service initialization in `Initialize()`
- [ ] Create `README.md` for extension documentation

#### 3.2 Models Implementation
- [ ] Create `models/` directory
- [ ] Implement `models/entity.go`:
  - [ ] `EntityType` struct
  - [ ] `EntitySubType` struct
  - [ ] `Entity` struct
  - [ ] GORM tags and relationships
- [ ] Implement `models/product.go`:
  - [ ] `ProductType` struct
  - [ ] `ProductSubType` struct
  - [ ] `Product` struct
  - [ ] GORM tags and relationships
- [ ] Implement `models/variable.go`:
  - [ ] `Variable` struct
  - [ ] `VariableConstraints` type
  - [ ] Validation methods
- [ ] Implement `models/pricing.go`:
  - [ ] `PricingTemplate` struct
  - [ ] `PricingRule` struct
  - [ ] `CalculationResult` struct
- [ ] Implement `models/sales.go`:
  - [ ] `Sale` struct
  - [ ] `OrderStatus` enum
  - [ ] `PaymentStatus` enum

#### 3.3 Services Implementation
- [ ] Create `services/` directory
- [ ] Implement `services/entity_service.go`:
  - [ ] `NewEntityService()` constructor
  - [ ] `CreateEntityType()` method
  - [ ] `UpdateEntityType()` method
  - [ ] `DeleteEntityType()` method
  - [ ] `GetEntityType()` method
  - [ ] `ListEntityTypes()` method
  - [ ] `CreateEntity()` method
  - [ ] `UpdateEntity()` method
  - [ ] `DeleteEntity()` method
  - [ ] `GetEntity()` method
  - [ ] `ListEntities()` method
  - [ ] `SearchEntities()` method
- [ ] Implement `services/product_service.go`:
  - [ ] `NewProductService()` constructor
  - [ ] `CreateProductType()` method
  - [ ] `UpdateProductType()` method
  - [ ] `DeleteProductType()` method
  - [ ] `GetProductType()` method
  - [ ] `ListProductTypes()` method
  - [ ] `CreateProduct()` method
  - [ ] `UpdateProduct()` method
  - [ ] `DeleteProduct()` method
  - [ ] `GetProduct()` method
  - [ ] `ListProducts()` method
  - [ ] `SearchProducts()` method
- [ ] Implement `services/variable_service.go`:
  - [ ] `NewVariableService()` constructor
  - [ ] `CreateVariable()` method
  - [ ] `UpdateVariable()` method
  - [ ] `DeleteVariable()` method
  - [ ] `GetVariable()` method
  - [ ] `ListVariables()` method
  - [ ] `ValidateVariableValue()` method
  - [ ] `GetVariablesByCategory()` method
- [ ] Implement `services/pricing_service.go`:
  - [ ] `NewPricingService()` constructor
  - [ ] `CreatePricingTemplate()` method
  - [ ] `UpdatePricingTemplate()` method
  - [ ] `DeletePricingTemplate()` method
  - [ ] `GetPricingTemplate()` method
  - [ ] `ListPricingTemplates()` method
  - [ ] `CalculatePrice()` method
  - [ ] `ValidateFormula()` method
- [ ] Implement `services/sales_service.go`:
  - [ ] `NewSalesService()` constructor
  - [ ] `CreateSale()` method
  - [ ] `UpdateSaleStatus()` method
  - [ ] `GetSale()` method
  - [ ] `ListSales()` method
  - [ ] `GetSalesAnalytics()` method
  - [ ] `ProcessPayment()` method
  - [ ] `RefundSale()` method

#### 3.4 API Implementation

##### Admin API (`/api/extensions/products/admin/`)
- [ ] Create `api/admin_api.go`
- [ ] Implement entity type endpoints:
  - [ ] `GET /entity-types` - List all entity types
  - [ ] `POST /entity-types` - Create entity type
  - [ ] `GET /entity-types/:id` - Get entity type
  - [ ] `PUT /entity-types/:id` - Update entity type
  - [ ] `DELETE /entity-types/:id` - Delete entity type
- [ ] Implement product type endpoints:
  - [ ] `GET /product-types` - List all product types
  - [ ] `POST /product-types` - Create product type
  - [ ] `GET /product-types/:id` - Get product type
  - [ ] `PUT /product-types/:id` - Update product type
  - [ ] `DELETE /product-types/:id` - Delete product type
- [ ] Implement variable endpoints:
  - [ ] `GET /variables` - List all variables
  - [ ] `POST /variables` - Create variable
  - [ ] `GET /variables/:id` - Get variable
  - [ ] `PUT /variables/:id` - Update variable
  - [ ] `DELETE /variables/:id` - Delete variable
  - [ ] `GET /variables/categories` - Get variable categories
- [ ] Implement pricing template endpoints:
  - [ ] `GET /pricing-templates` - List pricing templates
  - [ ] `POST /pricing-templates` - Create pricing template
  - [ ] `GET /pricing-templates/:id` - Get pricing template
  - [ ] `PUT /pricing-templates/:id` - Update pricing template
  - [ ] `DELETE /pricing-templates/:id` - Delete pricing template
  - [ ] `POST /pricing-templates/validate` - Validate formula
- [ ] Implement sales management endpoints:
  - [ ] `GET /sales` - List all sales
  - [ ] `GET /sales/:id` - Get sale details
  - [ ] `PUT /sales/:id/status` - Update sale status
  - [ ] `GET /sales/analytics` - Sales analytics
  - [ ] `GET /sales/export` - Export sales data
- [ ] Implement settings endpoints:
  - [ ] `GET /settings` - Get extension settings
  - [ ] `PUT /settings` - Update extension settings

##### User API (`/api/extensions/products/user/`)
- [ ] Create `api/user_api.go`
- [ ] Implement dashboard endpoints:
  - [ ] `GET /dashboard` - User dashboard stats
  - [ ] `GET /dashboard/recent-sales` - Recent sales
  - [ ] `GET /dashboard/top-products` - Top products
- [ ] Implement entity management:
  - [ ] `GET /entities` - List user's entities
  - [ ] `POST /entities` - Create entity
  - [ ] `GET /entities/:id` - Get entity
  - [ ] `PUT /entities/:id` - Update entity
  - [ ] `DELETE /entities/:id` - Delete entity
  - [ ] `POST /entities/:id/photos` - Upload photos
- [ ] Implement product management:
  - [ ] `GET /products` - List user's products
  - [ ] `POST /products` - Create product
  - [ ] `GET /products/:id` - Get product
  - [ ] `PUT /products/:id` - Update product
  - [ ] `DELETE /products/:id` - Delete product
  - [ ] `POST /products/:id/duplicate` - Duplicate product
  - [ ] `POST /products/:id/photos` - Upload photos
- [ ] Implement sales management:
  - [ ] `GET /sales` - User's sales history
  - [ ] `GET /sales/:id` - Sale details
  - [ ] `PUT /sales/:id/fulfill` - Mark as fulfilled
  - [ ] `GET /purchases` - User's purchases
  - [ ] `GET /purchases/:id` - Purchase details

##### Public API (`/api/extensions/products/public/`)
- [ ] Create `api/public_api.go`
- [ ] Implement browsing endpoints:
  - [ ] `GET /entities` - Browse public entities
  - [ ] `GET /entities/:id` - Entity details
  - [ ] `GET /products` - Browse public products
  - [ ] `GET /products/:id` - Product details
  - [ ] `GET /products/search` - Search products
  - [ ] `GET /products/featured` - Featured products
- [ ] Implement interaction endpoints:
  - [ ] `POST /products/:id/view` - Track view
  - [ ] `POST /products/:id/like` - Like product
  - [ ] `POST /entities/:id/like` - Like entity
  - [ ] `POST /products/:id/calculate-price` - Calculate dynamic price
- [ ] Implement purchase endpoints:
  - [ ] `POST /products/:id/purchase` - Initiate purchase
  - [ ] `GET /products/:id/availability` - Check availability
  - [ ] `POST /products/:id/review` - Add review

### Phase 4: Admin UI Implementation (Week 3-4)

#### 4.1 Admin Pages Setup
- [ ] Create `/admin/src/routes/products/` directory structure
- [ ] Setup shared components directory `/admin/src/lib/components/products/`
- [ ] Create API client `/admin/src/lib/api/products.ts`
- [ ] Create types file `/admin/src/lib/types/products.ts`
- [ ] Setup state management stores `/admin/src/lib/stores/products.ts`

#### 4.2 Variables Management Page
- [ ] Create `/admin/src/routes/products/variables/+page.svelte`
- [ ] Implement variable list view:
  - [ ] Table with sorting and filtering
  - [ ] Category filter dropdown
  - [ ] Search functionality
  - [ ] Pagination
- [ ] Implement create/edit modal:
  - [ ] Variable ID field (camelCase validation)
  - [ ] Display name field
  - [ ] Description textarea
  - [ ] Category dropdown (System, Product, Entity, Custom)
  - [ ] Value type dropdown
  - [ ] Default value field
  - [ ] Display order field
- [ ] Implement validation rules section:
  - [ ] Required checkbox
  - [ ] Min/Max value fields (for numbers)
  - [ ] Step value field (for numbers)
  - [ ] Pattern field (for text)
  - [ ] Enum values editor (for enums)
- [ ] Add delete confirmation dialog
- [ ] Add success/error notifications

#### 4.3 Entity Types Configuration
- [ ] Create `/admin/src/routes/products/entity-types/+page.svelte`
- [ ] Implement entity types list:
  - [ ] Card grid view
  - [ ] Active/inactive toggle
  - [ ] Edit/delete actions
- [ ] Implement create/edit form:
  - [ ] Name and display name fields
  - [ ] Description field
  - [ ] Icon selector
  - [ ] Location required toggle
  - [ ] User creation allowed toggle
- [ ] Implement metadata schema builder:
  - [ ] Add field button
  - [ ] Field type selector
  - [ ] Field properties editor
  - [ ] Field reordering (drag and drop)
  - [ ] Field deletion
- [ ] Implement filter configuration:
  - [ ] Map filter fields to columns
  - [ ] Set filter types
  - [ ] Configure filter display

#### 4.4 Product Types Configuration
- [ ] Create `/admin/src/routes/products/product-types/+page.svelte`
- [ ] Implement product types list:
  - [ ] Card grid view
  - [ ] Active/inactive toggle
  - [ ] Edit/delete actions
- [ ] Implement create/edit form:
  - [ ] Name and display name fields
  - [ ] Description field
  - [ ] Icon selector
  - [ ] Pricing type selector (fixed, formula, dynamic)
  - [ ] Requires entity toggle
- [ ] Implement metadata schema builder (reuse from entity types)
- [ ] Implement filter configuration (reuse from entity types)
- [ ] Add associated variables selector

#### 4.5 Pricing Templates
- [ ] Create `/admin/src/routes/products/pricing/+page.svelte`
- [ ] Implement templates list:
  - [ ] Table view with search
  - [ ] Product type filter
  - [ ] Active/inactive status
- [ ] Implement formula builder:
  - [ ] Add rule button
  - [ ] Condition editor
  - [ ] Calculation editor
  - [ ] Variable picker modal
  - [ ] Operator buttons
  - [ ] Function selector
- [ ] Implement formula validation:
  - [ ] Syntax checking
  - [ ] Variable existence checking
  - [ ] Type compatibility checking
- [ ] Implement formula testing:
  - [ ] Test data input form
  - [ ] Calculate button
  - [ ] Result display
  - [ ] Step-by-step calculation view

#### 4.6 Sales Dashboard
- [ ] Create `/admin/src/routes/products/sales/+page.svelte`
- [ ] Implement overview cards:
  - [ ] Total sales count
  - [ ] Total revenue
  - [ ] Average order value
  - [ ] Conversion rate
- [ ] Implement sales table:
  - [ ] Order number
  - [ ] Date/time
  - [ ] Customer info
  - [ ] Product info
  - [ ] Amount
  - [ ] Status badges
  - [ ] Actions dropdown
- [ ] Implement filters:
  - [ ] Date range picker
  - [ ] Status filter
  - [ ] Product filter
  - [ ] Seller filter
- [ ] Implement analytics charts:
  - [ ] Sales over time chart
  - [ ] Top products chart
  - [ ] Revenue by category
  - [ ] Customer distribution map
- [ ] Implement export functionality:
  - [ ] CSV export
  - [ ] PDF report generation
  - [ ] Date range selection

### Phase 5: User UI Implementation (Week 4)

#### 5.1 User Profile Setup
- [ ] Create `/admin/src/routes/profile/products/` directory
- [ ] Add products tab to profile navigation
- [ ] Create shared components `/admin/src/lib/components/user-products/`
- [ ] Setup user products store `/admin/src/lib/stores/user-products.ts`

#### 5.2 Products Dashboard Tab
- [ ] Create `/admin/src/routes/profile/products/+page.svelte`
- [ ] Implement overview statistics cards:
  - [ ] Total Products card with icon
  - [ ] Total Sales card with icon
  - [ ] Total Entities card with icon
  - [ ] Total Views card with icon
  - [ ] Product Likes card with icon
  - [ ] Entity Likes card with icon
- [ ] Implement Recent Sales section:
  - [ ] Sales list component
  - [ ] Product name and date
  - [ ] Price display
  - [ ] Status badge
  - [ ] View details link
- [ ] Implement Top Products section:
  - [ ] Numbered list (1, 2, 3)
  - [ ] Product name
  - [ ] View count icon and number
  - [ ] Like count icon and number
  - [ ] Sales count icon and number
- [ ] Add refresh functionality
- [ ] Add date range filter

#### 5.3 Sales & Orders Tab
- [ ] Create `/admin/src/routes/profile/sales/+page.svelte`
- [ ] Implement orders table:
  - [ ] Order # column
  - [ ] Date column with time
  - [ ] Customer email column
  - [ ] Product name column
  - [ ] Amount column
  - [ ] Payment method column
  - [ ] Status column with badges
  - [ ] Actions column with view button
- [ ] Implement search functionality:
  - [ ] Search input field
  - [ ] Search by order number
  - [ ] Search by customer
  - [ ] Search by product
- [ ] Implement filters:
  - [ ] Status filter dropdown
  - [ ] Date range picker
  - [ ] Payment method filter
- [ ] Implement export button:
  - [ ] Export to CSV
  - [ ] Export to PDF
  - [ ] Date range selection
- [ ] Implement summary cards:
  - [ ] Total Orders count
  - [ ] Completed count (green)
  - [ ] Pending count (yellow)
  - [ ] Total Revenue amount

#### 5.4 Entities Management Tab
- [ ] Create `/admin/src/routes/profile/entities/+page.svelte`
- [ ] Implement entity list/grid toggle
- [ ] Implement entity cards (grid view):
  - [ ] Entity photo/thumbnail
  - [ ] Entity name
  - [ ] Entity type badge
  - [ ] View/Like counts
  - [ ] Edit/Delete actions
- [ ] Implement entity table (list view):
  - [ ] Name column
  - [ ] Type column
  - [ ] Created date column
  - [ ] Status column
  - [ ] Actions column
- [ ] Implement create entity modal:
  - [ ] Entity type selector
  - [ ] Name field
  - [ ] Description field
  - [ ] Photo upload (multiple)
  - [ ] Location picker (if required)
  - [ ] Metadata fields (dynamic)
- [ ] Implement edit entity modal (reuse create)
- [ ] Implement delete confirmation
- [ ] Add pagination

#### 5.5 Products Management Tab
- [ ] Create `/admin/src/routes/profile/products-manage/+page.svelte`
- [ ] Implement product list/grid toggle
- [ ] Implement product cards (grid view):
  - [ ] Product photo/thumbnail
  - [ ] Product name
  - [ ] Price display
  - [ ] Entity association (if any)
  - [ ] View/Like/Sales counts
  - [ ] Edit/Delete/Duplicate actions
- [ ] Implement product table (list view):
  - [ ] Name column
  - [ ] Type column
  - [ ] Price column
  - [ ] Entity column
  - [ ] Sales column
  - [ ] Status column
  - [ ] Actions column
- [ ] Implement create product modal:
  - [ ] Product type selector
  - [ ] Entity selector (if required)
  - [ ] Name field
  - [ ] Description field
  - [ ] Photo upload (multiple)
  - [ ] Pricing configuration:
    - [ ] Fixed price input
    - [ ] Or pricing template selector
    - [ ] Variable values input
  - [ ] Inventory count field
  - [ ] Metadata fields (dynamic)
- [ ] Implement edit product modal (reuse create)
- [ ] Implement duplicate functionality
- [ ] Implement delete confirmation
- [ ] Add bulk actions:
  - [ ] Bulk activate/deactivate
  - [ ] Bulk delete
  - [ ] Bulk export

### Phase 6: Integration & Testing (Week 5)

#### 6.1 Payment Integration
- [ ] Review existing payments package structure
- [ ] Create payment adapter interface
- [ ] Implement Stripe integration:
  - [ ] Product checkout session creation
  - [ ] Payment intent handling
  - [ ] Webhook handler for payment events
  - [ ] Refund processing
- [ ] Implement payment callbacks:
  - [ ] Success callback handler
  - [ ] Failure callback handler
  - [ ] Webhook signature verification
- [ ] Update order status workflow:
  - [ ] Pending → Processing
  - [ ] Processing → Completed
  - [ ] Processing → Failed
  - [ ] Completed → Refunded
- [ ] Add payment method storage
- [ ] Implement commission calculation
- [ ] Create payout system for sellers

#### 6.2 Storage Integration
- [ ] Review existing storage adapter
- [ ] Implement product photo upload:
  - [ ] Multiple photo support
  - [ ] File size validation
  - [ ] File type validation
  - [ ] Virus scanning integration
- [ ] Implement entity photo upload (reuse product logic)
- [ ] Implement thumbnail generation:
  - [ ] Small (150x150)
  - [ ] Medium (300x300)
  - [ ] Large (600x600)
  - [ ] WebP conversion
- [ ] Setup CDN integration:
  - [ ] CloudFront configuration
  - [ ] Cache headers
  - [ ] Signed URLs for private content
- [ ] Implement photo management:
  - [ ] Reorder photos
  - [ ] Set primary photo
  - [ ] Delete photos
  - [ ] Bulk upload

#### 6.3 Testing

##### Unit Tests
- [ ] Formula engine tests:
  - [ ] Calculator operations
  - [ ] Condition evaluation
  - [ ] Variable resolution
  - [ ] Edge cases
- [ ] Dynamic fields tests:
  - [ ] Field validation
  - [ ] Schema validation
  - [ ] Type conversion
  - [ ] Error handling
- [ ] Model tests:
  - [ ] Data validation
  - [ ] Relationship tests
  - [ ] CRUD operations

##### Integration Tests
- [ ] Service layer tests:
  - [ ] EntityService integration
  - [ ] ProductService integration
  - [ ] VariableService integration
  - [ ] PricingService integration
  - [ ] SalesService integration
- [ ] Database tests:
  - [ ] Migration tests
  - [ ] Transaction tests
  - [ ] Constraint tests
- [ ] API integration tests:
  - [ ] Authentication flow
  - [ ] Authorization checks
  - [ ] Rate limiting

##### API Endpoint Tests
- [ ] Admin API tests:
  - [ ] Entity type endpoints
  - [ ] Product type endpoints
  - [ ] Variable endpoints
  - [ ] Pricing template endpoints
  - [ ] Sales management endpoints
- [ ] User API tests:
  - [ ] Dashboard endpoints
  - [ ] Entity management endpoints
  - [ ] Product management endpoints
  - [ ] Sales endpoints
- [ ] Public API tests:
  - [ ] Browse endpoints
  - [ ] Search endpoints
  - [ ] Purchase endpoints

##### UI Component Tests
- [ ] Admin component tests:
  - [ ] Variable form validation
  - [ ] Formula builder logic
  - [ ] Schema builder functionality
  - [ ] Chart components
- [ ] User component tests:
  - [ ] Product cards
  - [ ] Entity cards
  - [ ] Order table
  - [ ] Dashboard statistics
- [ ] Shared component tests:
  - [ ] Photo uploader
  - [ ] Location picker
  - [ ] Date range picker

##### End-to-End Tests
- [ ] Complete purchase flow:
  - [ ] Browse products
  - [ ] View product details
  - [ ] Calculate dynamic price
  - [ ] Add to cart
  - [ ] Checkout process
  - [ ] Payment processing
  - [ ] Order confirmation
- [ ] Seller flow:
  - [ ] Create entity
  - [ ] Create product
  - [ ] Manage inventory
  - [ ] View sales
  - [ ] Process orders
- [ ] Admin flow:
  - [ ] Configure entity types
  - [ ] Configure product types
  - [ ] Define variables
  - [ ] Create pricing templates
  - [ ] Monitor sales

## Configuration & Settings

### Extension Settings
```go
type ProductsSettings struct {
    // User Permissions
    AllowUserSales      bool   `json:"allow_user_sales"`
    RequireApproval     bool   `json:"require_approval"`
    MaxProductsPerUser  int    `json:"max_products_per_user"`
    MaxEntitiesPerUser  int    `json:"max_entities_per_user"`
    
    // Commission Settings
    PlatformCommission  float64 `json:"platform_commission"` // Percentage
    MinimumPrice       float64 `json:"minimum_price"`
    
    // Display Settings
    DefaultCurrency    string  `json:"default_currency"`
    ShowRatings        bool    `json:"show_ratings"`
    ShowViewCounts     bool    `json:"show_view_counts"`
    
    // Search Settings
    EnableGeoSearch    bool    `json:"enable_geo_search"`
    DefaultSearchRadius int    `json:"default_search_radius"` // km
}
```

## Migration Strategy

### Data Migration from Existing Systems

#### 7.1 Data Export
- [ ] Create Go export tool for `dynamicproducts`:
  - [ ] Connect to existing database
  - [ ] Export entity types to JSON
  - [ ] Export product types to JSON
  - [ ] Export entities to JSON
  - [ ] Export products to JSON
  - [ ] Export purchases to JSON
- [ ] Create Go export tool for `formulapricing`:
  - [ ] Connect to existing database
  - [ ] Export variables to JSON
  - [ ] Export pricing rules to JSON
  - [ ] Export calculations to JSON
  - [ ] Export payment records to JSON
- [ ] Validate exported data integrity
- [ ] Create backup of exported JSON files

#### 7.2 Data Transformation
- [ ] Create Go transformation tool:
  - [ ] Read exported JSON files
  - [ ] Map old entity types to new GORM models
  - [ ] Map old product types to new GORM models
  - [ ] Convert variable definitions to new format
  - [ ] Transform pricing rules to templates
  - [ ] Migrate user references
- [ ] Handle data inconsistencies:
  - [ ] Add default values for missing required fields
  - [ ] Fix invalid UUID references
  - [ ] Merge duplicate entries
  - [ ] Generate UUIDs for missing IDs
- [ ] Generate transformation report with statistics

#### 7.3 Data Import Using GORM
- [ ] Create Go import tool:
  - [ ] Connect to new database using database package
  - [ ] Use GORM Create() for batch inserts
  - [ ] Import entity types using GORM
  - [ ] Import product types using GORM
  - [ ] Import variables using GORM
  - [ ] Import pricing templates using GORM
  - [ ] Import entities with relationships
  - [ ] Import products with relationships
  - [ ] Import sales history with relationships
- [ ] Validate imported data:
  - [ ] Use GORM associations to verify relationships
  - [ ] Check data completeness with Count()
  - [ ] Test calculations with imported data
- [ ] Create rollback tool:
  - [ ] Use GORM soft deletes
  - [ ] Backup before import
  - [ ] Transaction-based import for atomicity

### Backward Compatibility
- [ ] Create compatibility layer:
  - [ ] Map old API endpoints to new ones
  - [ ] Transform request/response formats
  - [ ] Handle deprecated fields
- [ ] Add deprecation warnings:
  - [ ] Log deprecated endpoint usage
  - [ ] Return deprecation headers
  - [ ] Include migration notes in responses
- [ ] Create migration guide documentation:
  - [ ] API changes documentation
  - [ ] Code migration examples
  - [ ] Timeline for deprecation

## Performance Considerations

### 8.1 Caching Implementation
- [ ] Setup Redis infrastructure:
  - [ ] Redis cluster configuration
  - [ ] Connection pooling
  - [ ] Failover configuration
- [ ] Implement calculation caching:
  - [ ] Cache formula results
  - [ ] Cache key generation strategy
  - [ ] TTL configuration
  - [ ] Cache invalidation logic
- [ ] Implement entity/product caching:
  - [ ] Most viewed products cache
  - [ ] Featured products cache
  - [ ] User favorites cache
  - [ ] Search results cache
- [ ] Setup CDN for images:
  - [ ] CloudFront distribution
  - [ ] Image optimization pipeline
  - [ ] Lazy loading implementation

### 8.2 Database Optimizations
- [ ] Create indexes:
  - [ ] Search field indexes
  - [ ] Foreign key indexes
  - [ ] Composite indexes for common queries
  - [ ] GiST indexes for geo queries
- [ ] Create materialized views:
  - [ ] Sales analytics view
  - [ ] Product popularity view
  - [ ] User statistics view
- [ ] Implement partitioning:
  - [ ] Partition sales table by date
  - [ ] Partition views table by date
  - [ ] Archive old data strategy

### 8.3 Search Optimization
- [ ] Elasticsearch setup:
  - [ ] Index configuration
  - [ ] Mapping definition
  - [ ] Sync strategy with PostgreSQL
- [ ] Implement search features:
  - [ ] Full-text search
  - [ ] Faceted search
  - [ ] Auto-complete
  - [ ] Search suggestions
- [ ] Query optimization:
  - [ ] Query caching
  - [ ] Result pagination
  - [ ] Lazy loading

## Security Considerations

### 9.1 Access Control Implementation
- [ ] Implement RBAC:
  - [ ] Define roles (Admin, Seller, Buyer, Guest)
  - [ ] Create permission matrix
  - [ ] Implement middleware checks
  - [ ] Add role-based UI rendering
- [ ] API security:
  - [ ] JWT validation
  - [ ] API key management
  - [ ] OAuth integration
  - [ ] Session management

### 9.2 Data Validation
- [ ] Input validation:
  - [ ] XSS prevention
  - [ ] SQL injection prevention
  - [ ] Command injection prevention
  - [ ] Path traversal prevention
- [ ] Schema validation:
  - [ ] JSON schema validation
  - [ ] Type checking
  - [ ] Required field validation
  - [ ] Format validation
- [ ] File upload security:
  - [ ] File type validation
  - [ ] File size limits
  - [ ] Virus scanning
  - [ ] Content verification

### 9.3 Rate Limiting
- [ ] Implement rate limiting:
  - [ ] Per-endpoint limits
  - [ ] Per-user limits
  - [ ] IP-based limits
  - [ ] Adaptive rate limiting
- [ ] DDoS protection:
  - [ ] CloudFlare integration
  - [ ] Request throttling
  - [ ] Captcha integration

## Monitoring & Analytics

### 10.1 Business Metrics
- [ ] Implement tracking for:
  - [ ] Total sales volume
  - [ ] Average order value
  - [ ] Conversion rates
  - [ ] Revenue by category
  - [ ] Top selling products
  - [ ] Customer lifetime value
- [ ] Create dashboards:
  - [ ] Real-time sales dashboard
  - [ ] Product performance dashboard
  - [ ] User analytics dashboard

### 10.2 Performance Monitoring
- [ ] Setup monitoring tools:
  - [ ] Prometheus metrics
  - [ ] Grafana dashboards
  - [ ] New Relic APM
  - [ ] Error tracking (Sentry)
- [ ] Track metrics:
  - [ ] API response times
  - [ ] Database query times
  - [ ] Cache hit rates
  - [ ] Error rates
  - [ ] Throughput

### 10.3 User Analytics
- [ ] Implement event tracking:
  - [ ] Page views
  - [ ] Product interactions
  - [ ] Search queries
  - [ ] Purchase funnel
- [ ] Generate reports:
  - [ ] User engagement report
  - [ ] Product popularity report
  - [ ] Search analytics report
  - [ ] Conversion funnel analysis

## Timeline Summary

- **Week 1**: Core package refactoring
- **Week 2**: Database schema and migrations
- **Week 3**: Extension services and API
- **Week 4**: Admin and User UI
- **Week 5**: Integration, testing, and deployment

## Success Criteria

1. ✅ Standalone formula engine and dynamic fields packages
2. ✅ Fully functional products extension
3. ✅ Admin can configure entity/product types
4. ✅ Admin can define variables and pricing formulas
5. ✅ Users can create and sell products (when enabled)
6. ✅ Complete purchase flow with payment integration
7. ✅ Analytics and reporting dashboard
8. ✅ All tests passing with >80% coverage
9. ✅ Performance benchmarks met (<100ms API response)
10. ✅ Security audit passed

## Phase 7: Documentation & Deployment

### 11.1 Documentation
- [ ] API Documentation:
  - [ ] OpenAPI/Swagger specification
  - [ ] API endpoint examples
  - [ ] Authentication guide
  - [ ] Rate limiting documentation
- [ ] Developer Documentation:
  - [ ] Extension architecture guide
  - [ ] Formula engine documentation
  - [ ] Dynamic fields documentation
  - [ ] Integration guide
- [ ] User Documentation:
  - [ ] Admin user guide
  - [ ] Seller guide
  - [ ] Buyer guide
  - [ ] FAQ section
- [ ] Code Documentation:
  - [ ] Inline code comments
  - [ ] Package README files
  - [ ] Architecture decision records

### 11.2 Deployment Preparation
- [ ] Environment setup:
  - [ ] Development environment
  - [ ] Staging environment
  - [ ] Production environment
- [ ] Configuration management:
  - [ ] Environment variables
  - [ ] Secrets management
  - [ ] Feature flags
- [ ] CI/CD Pipeline:
  - [ ] Build automation
  - [ ] Test automation
  - [ ] Deployment automation
  - [ ] Rollback procedures

### 11.3 Launch Checklist
- [ ] Pre-launch:
  - [ ] Security audit completed
  - [ ] Performance testing completed
  - [ ] Documentation reviewed
  - [ ] Backup procedures tested
- [ ] Launch day:
  - [ ] Deploy to production
  - [ ] Monitor metrics
  - [ ] Check error rates
  - [ ] Verify payment flow
- [ ] Post-launch:
  - [ ] User feedback collection
  - [ ] Performance monitoring
  - [ ] Bug tracking
  - [ ] Feature requests tracking

## Next Steps

### Immediate Actions
- [ ] Review and approve this implementation plan
- [ ] Assemble development team
- [ ] Set up project management tools
- [ ] Create Git repository structure
- [ ] Set up development environments

### Week 0 - Preparation
- [ ] Create detailed task tickets for Phase 1
- [ ] Set up CI/CD pipeline
- [ ] Configure development databases
- [ ] Set up Redis and Elasticsearch
- [ ] Prepare testing frameworks

### Ongoing Tasks
- [ ] Daily standup meetings
- [ ] Weekly progress reviews
- [ ] Sprint planning sessions
- [ ] Code review process
- [ ] Documentation updates

## Notes

- The products extension will be one of the flagship features of Solobase
- Focus on developer experience with clean APIs
- Prioritize performance and scalability from the start
- Maintain consistency with existing Solobase patterns
- Document all APIs and provide examples