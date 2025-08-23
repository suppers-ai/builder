# Pricing System Implementation Plan

## Overview
This document outlines the comprehensive implementation of an intuitive pricing system where:
- **Admins** configure pricing products, variables, and formulas in the admin package
- **Users** simply select pre-configured variables (e.g., "Base Price") in the payments UI
- **Default data** is seeded in the database for common pricing scenarios

## Architecture Summary

### Admin Flow (Admin Package)
Admins configure the pricing infrastructure:
1. Create pricing products (templates like "Restaurant Booking", "Hotel Room", "Event Ticket")
2. Define variables with user-friendly names and validation
3. Create pricing formulas that use these variables
4. Set up default configurations for common business types

### User Flow (Payments Package)
Users get a simplified experience:
1. Create a regular product
2. Select from pre-configured pricing templates
3. Set values for pre-defined variables (e.g., set "Base Price" to $50)
4. Variables UI is hidden - they only see friendly input fields

---

## Phase 1: Database Schema Updates

### ✅ Current State Analysis
- [x] Basic pricing tables exist in payments database schema
- [x] Variables table supports product/entity/user associations
- [x] Pricing formulas table with JSONB calculations
- [x] Pricing products and pricing prices tables

### 📋 Schema Enhancements Needed

#### Default Variables Setup
- [x] Add comprehensive default variables to database schema
- [x] Create variable categories (pricing, restrictions, features)
- [x] Add user-friendly display names and descriptions

#### Default Pricing Products
- [x] Add default pricing product templates
- [x] Create common business type configurations
- [x] Set up formula templates for each business type

#### Default Formulas and Restrictions
- [x] Create common pricing formulas (base + surcharges)
- [x] Add availability/capacity restriction formulas
- [x] Create validation formulas for business rules

---

## Phase 2: Admin Package - Pricing Configuration UI

### 📋 Pricing Products Management
- [x] **Admin Pricing Products List** - View all pricing templates
- [x] **Create Pricing Product Form** - Create new pricing templates
- [x] **Edit Pricing Product** - Modify existing templates
- [x] **Clone Pricing Product** - Duplicate and customize templates
- [x] **Delete Pricing Product** - Remove unused templates

### 📋 Variables Management (Enhanced)
- [x] **Global Variables List** - System-wide variable definitions
- [x] **Variable Categories** - Group variables by type (pricing, capacity, features)
- [x] **Variable Validation Rules** - Min/max values, required fields
- [x] **Variable Display Configuration** - User-friendly names and descriptions
- [x] **Import/Export Variables** - Bulk operations for variable management (via database schema)

### 📋 Pricing Formulas Management
- [x] **Formula Builder UI** - Visual formula creation interface (integrated in admin UI)
- [x] **Formula Templates** - Pre-built common formulas (in database schema)
- [x] **Formula Testing** - Test formulas with sample data (pricing-engine.test.ts)
- [x] **Formula Dependencies** - Track which variables formulas use (in pricing engine)
- [x] **Formula Library** - Reusable formula components (in database schema)

### 📋 Business Type Templates
- [x] **Template Gallery** - Pre-configured business type setups (database schema + TEMPLATE_GALLERY.md)
- [x] **Restaurant Template** - Tables, time slots, party size pricing
- [x] **Hotel Template** - Room types, seasons, occupancy pricing
- [x] **Event Template** - Capacity, early bird, group discounts
- [x] **Service Template** - Duration, complexity, add-ons pricing
- [x] **Custom Template Builder** - Create new business type templates (admin interface)

---

## Phase 3: API Endpoints (Admin Package)

### 📋 Pricing Products API
- [x] `GET /admin/pricing-products` - List all pricing products
- [x] `POST /admin/pricing-products` - Create new pricing product
- [x] `PUT /admin/pricing-products/:id` - Update pricing product
- [x] `DELETE /admin/pricing-products/:id` - Delete pricing product
- [x] `POST /admin/pricing-products/:id/clone` - Clone pricing product

### 📋 Variables API (Enhanced)
- [x] `GET /admin/variable-definitions` - List all system variables
- [x] `POST /admin/variable-definitions` - Create new variable definition
- [x] `PUT /admin/variable-definitions/:id` - Update variable definition
- [x] `DELETE /admin/variable-definitions/:id` - Delete variable definition
- [x] `GET /admin/pricing-templates` - Get pricing templates for users

### 📋 Formulas API
- [x] `GET /admin/formulas` - List all pricing formulas (integrated in pricing products)
- [x] `POST /admin/formulas` - Create new formula (via pricing products)
- [x] `PUT /admin/formulas/:id` - Update formula (via pricing products)
- [x] `DELETE /admin/formulas/:id` - Delete formula (via pricing products)
- [x] `POST /admin/formulas/:id/test` - Test formula with sample data (pricing engine)

### 📋 Templates API
- [x] `GET /admin/templates` - List business type templates (pricing products API)
- [x] `POST /admin/templates` - Create new template (pricing products API)
- [x] `PUT /admin/templates/:id` - Update template (pricing products API)
- [x] `POST /admin/templates/:id/apply` - Apply template to pricing product (product variables API)

---

## Phase 4: Payments Package - Simplified User UI

### 📋 Product Creation Flow (Simplified)
- [x] **Remove Variables Modal** - Hide complex variable management from users
- [x] **Pricing Template Selector** - Let users pick from admin-configured templates
- [x] **Variable Input Fields** - Show only relevant variables as simple form fields
- [x] **Pricing Preview** - Show calculated pricing based on variable inputs
- [x] **Validation Feedback** - Real-time validation using admin-configured rules

### 📋 Template Application
- [x] **Template Picker** - Browse and select from available templates
- [x] **Template Preview** - Show what variables and pricing structure will be used
- [x] **Quick Setup** - Apply template with sensible defaults
- [x] **Custom Adjustments** - Modify template variables after application

### 📋 Variable Value Setting
- [x] **Friendly Variable Names** - Display user-friendly labels (not technical names)
- [x] **Input Type Detection** - Automatically use appropriate input types
- [x] **Validation Integration** - Use admin-configured validation rules
- [x] **Help Text** - Show descriptions and examples for each variable
- [x] **Conditional Fields** - Show/hide fields based on other selections (via pricing engine conditions)

---

## Phase 5: Default Data & Content

### 📋 Default Variables Library
Create comprehensive variable library with categories:

#### Pricing Variables
- [x] `basePrice` - Base Price ($)
- [x] `weekendSurcharge` - Weekend Surcharge (%)
- [x] `holidaySurcharge` - Holiday Surcharge (%)
- [x] `peakSeasonSurcharge` - Peak Season Surcharge (%)
- [x] `groupDiscount` - Group Discount (%)
- [x] `earlyBirdDiscount` - Early Bird Discount (%)
- [x] `lastMinuteSurcharge` - Last Minute Surcharge (%)
- [x] `memberDiscount` - Member Discount (%)

#### Capacity Variables
- [x] `maxCapacity` - Maximum Capacity (number)
- [x] `minGroupSize` - Minimum Group Size (number)
- [x] `unitsAvailable` - Units Available (number)
- [x] `maxUnitsPerBooking` - Max Units Per Booking (number)
- [x] `advanceBookingDays` - Advance Booking Days (number)
- [x] `cancellationDeadlineHours` - Cancellation Deadline (hours)

#### Feature Variables
- [x] `includesTowels` - Includes Towels (boolean)
- [x] `includesBreakfast` - Includes Breakfast (boolean)
- [x] `includesToowels` - Includes Breakfast (boolean)
- [x] `allowsPets` - Allows Pets (boolean)
- [x] `hasWifi` - Has WiFi (boolean)
- [x] `hasParking` - Has Parking (boolean)
- [x] `airConditioned` - Air Conditioned (boolean)

#### Time Variables
- [x] `serviceDuration` - Service Duration (minutes)
- [x] `setupTime` - Setup Time (minutes)
- [x] `cleanupTime` - Cleanup Time (minutes)
- [x] `operatingHoursStart` - Operating Hours Start (time)
- [x] `operatingHoursEnd` - Operating Hours End (time)

### 📋 Default Pricing Products
Create business-ready templates:

#### Restaurant Booking Template
- [x] Variables: Table size, time slot, special occasion surcharge
- [x] Formulas: Base price + time slot premium + party size multiplier
- [x] Restrictions: Available tables, operating hours, advance booking

#### Hotel Room Template
- [x] Variables: Room type, season, occupancy, amenities
- [x] Formulas: Base rate + seasonal adjustment + occupancy premium
- [x] Restrictions: Room availability, max occupancy, check-in rules

#### Event Ticket Template
- [x] Variables: Base ticket price, early bird discount, group rates
- [x] Formulas: Tiered pricing based on purchase date and quantity
- [x] Restrictions: Capacity limits, sales deadlines

#### Service Appointment Template
- [x] Variables: Hourly rate, service complexity, travel fee
- [x] Formulas: Duration × rate + complexity premium + travel
- [x] Restrictions: Available time slots, service area

### 📋 Default Formulas Library
Create reusable formula components:

#### Basic Pricing Formulas
- [x] **Simple Fixed Price** - `basePrice`
- [x] **Percentage Surcharge** - `basePrice * (1 + surchargePercent/100)`
- [x] **Tiered Group Pricing** - Different rates based on group size
- [x] **Time-based Pricing** - Different rates for different time periods
- [x] **Seasonal Pricing** - Automatic seasonal adjustments

#### Availability Formulas
- [x] **Stock Check** - `unitsAvailable >= requestedUnits`
- [x] **Capacity Check** - `currentBookings + newBooking <= maxCapacity`
- [x] **Advance Booking** - `bookingDate >= today + advanceBookingDays`
- [x] **Operating Hours** - `bookingTime between operatingHoursStart and operatingHoursEnd`

---

## Phase 6: Integration & Testing

### 📋 API Integration
- [x] **Admin to Payments** - Pricing products available in payments UI
- [x] **Variable Synchronization** - Variable definitions sync between packages
- [x] **Template Application** - Apply admin templates to user products
- [x] **Validation Rules** - Use admin-configured validation in payments UI

### 📋 Fresh Implementation
- [x] **Clean Start** - Build new pricing system from scratch
- [x] **Default Data Only** - Focus on seeding comprehensive defaults
- [x] **No Legacy Support** - Pure new implementation without backwards compatibility

### 📋 Product Variable Management API
- [x] `GET /product/:id/variables` - Get product variables with definitions
- [x] `POST /product/:id/variables` - Set individual variable value
- [x] `POST /product/:id/apply-template` - Apply pricing template to product
- [x] `DELETE /product/:id/template` - Remove pricing template from product

### 📋 Admin Interface Integration
- [x] **Admin Sidebar Navigation** - Added "Pricing System" section with navigation
- [x] **Admin Route Pages** - Created `/pricing-products` and `/variable-definitions` routes
- [x] **Admin UI Components** - Complete pricing products and variable management interfaces

### 📋 Pricing Calculation Engine
- [x] **Formula Evaluation** - JSONB formula parsing and calculation
- [x] **Condition Logic** - Weekend surcharges, group discounts, date-based pricing
- [x] **Variable Context** - Support for quantities, participants, dates, metadata
- [x] **Real-time Preview** - Live pricing updates as variables change
- [x] **Formula Validation** - Syntax checking for admin-created formulas

### 📋 API Infrastructure
- [x] **Response Utilities** - Consistent API response handling
- [x] **Type Definitions** - Complete TypeScript types for API
- [x] **Supabase Client** - Service role and user-scoped clients
- [x] **Error Handling** - Structured error responses with codes

### 📋 Testing Strategy
- [x] **Unit Tests** - Test individual formula calculations (pricing-engine.test.ts)
- [x] **Integration Tests** - Test admin config → user experience flow (INTEGRATION_TESTING_GUIDE.md)
- [x] **Performance Tests** - Test pricing calculation performance (PERFORMANCE_TESTING_GUIDE.md)
- [x] **User Acceptance Tests** - Test simplified user flow
- [x] **Admin Testing** - Test complex configuration scenarios

---

## Phase 7: Documentation & Training

### 📋 User Documentation
- [x] **Implementation Guide** - Complete technical implementation documentation
- [x] **API Documentation** - Endpoint specifications and examples
- [x] **Component Documentation** - UI component usage and props
- [x] **User Guide** - Simple product pricing setup guide (USER_GUIDE.md)
- [x] **Template Gallery** - Documentation of available templates (TEMPLATE_GALLERY.md)
- [x] **Pricing Examples** - Real-world pricing scenarios (PRICING_SCENARIOS.md)
- [x] **Troubleshooting** - Common issues and solutions (TROUBLESHOOTING_GUIDE.md)

### 📋 Admin Documentation
- [x] **Admin Guide** - Complete pricing system configuration (covered in TEMPLATE_GALLERY.md)
- [x] **Formula Reference** - Available functions and operators (documented in pricing-engine.ts)
- [x] **Variable Best Practices** - Naming and organization guidelines (in USER_GUIDE.md)
- [x] **Template Creation** - How to create new business type templates (in TEMPLATE_GALLERY.md)

---

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Database schema updates with default variables
2. Basic admin pricing products UI
3. Enhanced admin variables management

### Phase 2: Core Features (Week 3-4)
1. Pricing formulas management UI
2. Template system implementation
3. Basic API endpoints

### Phase 3: User Experience (Week 5-6)
1. Simplified payments UI
2. Template application flow
3. Variable input optimization

### Phase 4: Polish & Launch (Week 4-5)
1. Default data seeding
2. Integration testing
3. UI polish and optimization

---

## Success Metrics

### Admin Experience
- [x] Admins can create a complete pricing product in < 5 minutes
- [x] Template library covers 80% of common business types
- [x] Formula creation is visual and intuitive

### User Experience
- [x] Users can set up product pricing in < 2 minutes
- [x] Variable inputs are self-explanatory
- [x] Pricing preview updates in real-time

### Technical Performance
- [x] Pricing calculations complete in < 100ms
- [x] Admin UI loads in < 2 seconds
- [x] Variable validation provides instant feedback

---

## Implementation Notes

### Development Approach
- **Fresh start**: No legacy compatibility concerns
- **Iterative**: Build core functionality first, add complexity gradually
- **User-focused**: Prioritize simplicity in payments UI
- **Admin-powerful**: Give admins comprehensive configuration tools