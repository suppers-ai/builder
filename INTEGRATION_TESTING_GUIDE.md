# Integration Testing Guide

## Overview

This guide outlines comprehensive integration testing for the pricing system, ensuring the admin configuration flows seamlessly to user experience.

## Test Scenarios

### Admin to User Flow Tests

#### Test 1: Restaurant Template Creation and Usage
**Admin Setup:**
1. Navigate to Admin → Pricing Products
2. Create "Restaurant Table Booking" template
3. Configure variables: basePrice ($25), weekendSurcharge (20%), groupDiscount (10%)
4. Set up pricing formulas with weekend and group conditions
5. Publish template

**User Experience:**
1. Create new product in payments package
2. Navigate to Pricing Configuration tab
3. Select "Restaurant Table Booking" template
4. Set variable values through simple interface
5. Verify real-time pricing preview updates
6. Test different scenarios (weekday/weekend, group sizes)

**Expected Results:**
- Template appears in user template selector
- Variables load with correct validation rules
- Pricing calculations match expected formulas
- Preview updates immediately on variable changes

#### Test 2: Hotel Room Template Complex Scenarios
**Admin Setup:**
1. Create "Hotel Room Booking" template
2. Configure seasonal pricing with date-based conditions
3. Set occupancy premiums and amenity variables
4. Configure availability restrictions

**User Testing:**
1. Apply hotel template to product
2. Test seasonal date ranges
3. Verify occupancy-based pricing adjustments
4. Confirm amenity additions affect pricing
5. Test edge cases (max occupancy, off-season dates)

### API Integration Tests

#### Test 3: Real-time Variable Synchronization
**Setup:**
1. Admin creates new variable definition
2. User has product with template applied

**Test Flow:**
1. Admin updates variable validation rules
2. User interface should reflect changes immediately
3. Admin updates variable display name
4. User sees updated label without refresh
5. Admin deletes variable
6. User interface handles gracefully

#### Test 4: Template Application and Removal
**Test Scenarios:**
1. Apply template to product with no existing variables
2. Apply template to product with existing variables (merge behavior)
3. Switch between different templates (data preservation)
4. Remove template (variable cleanup)
5. Re-apply same template (data restoration)

### Performance Integration Tests

#### Test 5: Pricing Calculation Performance
**Load Testing:**
1. Create template with 10+ complex formulas
2. Set up nested conditional logic
3. Test calculation time with various contexts
4. Verify response time < 100ms target
5. Test concurrent calculations (10+ users)

#### Test 6: Real-time Preview Performance
**User Experience Testing:**
1. Rapid variable value changes
2. Multiple concurrent users with live previews
3. Complex formula recalculations
4. Network latency simulation
5. Mobile device performance

### Error Handling Integration

#### Test 7: Graceful Degradation
**Network Issues:**
1. Simulate API timeout during variable save
2. Test offline behavior with cached data
3. Recovery when connection restored
4. User feedback during outages

**Data Validation:**
1. Invalid variable values (negative prices, over limits)
2. Missing required variables
3. Formula evaluation errors
4. Template compatibility issues

### Security Integration Tests

#### Test 8: Role-Based Access Control
**Admin Security:**
1. Non-admin user cannot access pricing configuration
2. API endpoints reject unauthorized requests
3. Database RLS policies enforce permissions
4. Audit trails for admin actions

**User Security:**
1. Users can only modify their own products
2. Template application respects user permissions
3. Variable values are properly sanitized
4. No access to other users' pricing data

## Automated Test Implementation

### API Endpoint Testing

```typescript
// Test product variable management
describe('Product Variables API', () => {
  test('GET /product/:id/variables returns correct data', async () => {
    const response = await fetch(`${baseUrl}/product/${productId}/variables`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('variables');
    expect(data.data).toHaveProperty('definitions');
  });

  test('POST /product/:id/apply-template applies correctly', async () => {
    const response = await fetch(`${baseUrl}/product/${productId}/apply-template`, {
      method: 'POST',
      body: JSON.stringify({ templateId: 'restaurant-booking' })
    });
    
    expect(response.status).toBe(200);
    // Verify variables were created
    // Verify pricing formulas were applied
  });
});
```

### UI Component Integration Testing

```typescript
// Test pricing preview component
describe('PricingPreview Integration', () => {
  test('Updates when variables change', async () => {
    render(<PricingPreview variables={testVariables} />);
    
    // Change variable value
    fireEvent.change(screen.getByLabelText('Base Price'), { 
      target: { value: '30' } 
    });
    
    // Wait for API call and preview update
    await waitFor(() => {
      expect(screen.getByText('$30.00')).toBeInTheDocument();
    });
  });
});
```

## Test Data Setup

### Sample Restaurant Template
```sql
-- Use this data for consistent testing
INSERT INTO pricing_products (id, name, description, category) VALUES
('test-restaurant', 'Test Restaurant Booking', 'For testing', 'restaurant');

INSERT INTO pricing_variables (product_id, variable_key, variable_value) VALUES
('test-restaurant', 'basePrice', '25'),
('test-restaurant', 'weekendSurcharge', '20'),
('test-restaurant', 'groupDiscount', '10');
```

### Expected Calculation Results
- Weekday, 2 people: $25.00
- Weekend, 2 people: $30.00 (25 + 20%)
- Weekend, 6 people: $27.50 (25 + 20% - 10%)
- Weekday, 6 people: $22.50 (25 - 10%)

## Running Integration Tests

### Local Environment
```bash
# Start all services
deno task api:serve
deno task dev:payments
deno task dev:admin

# Run integration tests
deno task test:integration
```

### CI/CD Pipeline
1. Deploy to staging environment
2. Seed test data
3. Run automated test suite
4. Generate test report
5. Cleanup test data

## Test Checklist

- [ ] Admin can create pricing templates
- [ ] Templates appear in user interface
- [ ] Variable inputs work correctly
- [ ] Real-time preview updates
- [ ] API endpoints respond correctly
- [ ] Error handling works gracefully
- [ ] Performance meets targets
- [ ] Security permissions enforced
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

## Common Issues and Solutions

### Template Not Appearing in User Interface
**Cause:** Template not published or user permissions
**Solution:** Check template status and user role

### Pricing Calculations Incorrect
**Cause:** Formula configuration or variable types
**Solution:** Verify formula logic and variable data types

### Preview Not Updating
**Cause:** API connectivity or caching issues
**Solution:** Check network requests and clear cache

### Performance Issues
**Cause:** Complex formulas or large datasets
**Solution:** Optimize formulas and implement caching

## Success Metrics

- All admin configurations flow to user interface
- Pricing calculations match expected results
- Response times under performance targets
- Error scenarios handled gracefully
- Security policies enforced correctly

This comprehensive integration testing ensures the pricing system works seamlessly from admin configuration to user experience.