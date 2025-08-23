# Pricing System Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common issues with the pricing system, from basic setup problems to complex configuration challenges.

---

## Quick Diagnostic Checklist

### Before You Start
- [ ] Clear browser cache and refresh the page
- [ ] Check your internet connection
- [ ] Verify you're logged in with the correct account
- [ ] Confirm you have the necessary permissions

### Basic System Health Check
- [ ] Can you access the admin dashboard?
- [ ] Do pricing templates load in the payments interface?
- [ ] Are variable inputs saving correctly?
- [ ] Is the pricing preview updating?

---

## Common Issues & Solutions

### 1. "No pricing configuration" Message

#### Symptoms
- Product shows "No pricing configuration available"
- Pricing tab appears empty
- Template selector doesn't load

#### Possible Causes & Solutions

**Cause: No template applied to product**
```
Solution:
1. Go to Pricing Configuration tab
2. Click "Choose Template"
3. Select appropriate template for your business
4. Configure the required variables
```

**Cause: Template has no variables configured**
```
Solution:
1. Check if template exists in admin panel
2. Verify template has variables assigned
3. Contact admin to configure template properly
```

**Cause: Database connection issues**
```
Solution:
1. Check API endpoint status
2. Verify Supabase connection
3. Check browser console for errors
4. Try refreshing the page
```

---

### 2. Pricing Calculations Are Wrong

#### Symptoms
- Preview shows unexpected amounts
- Calculations don't match expected formulas
- Some adjustments not appearing

#### Debugging Steps

**Step 1: Verify Variable Values**
```
Check that variables contain correct values:
- Base Price: Should be positive number
- Percentages: Enter as whole numbers (20 for 20%, not 0.2)
- Boolean values: Should be true/false
- Dates: Should be valid date format
```

**Step 2: Review Formula Logic**
```
Common formula issues:
- Weekend surcharge not applying (check date format)
- Group discount threshold (verify participant count)
- Percentage calculations (ensure proper decimal conversion)
```

**Step 3: Test with Simple Values**
```
Test calculation with basic values:
- Base Price: $100
- Weekend Surcharge: 20%
- Expected weekend result: $120
```

#### Specific Formula Issues

**Weekend/Holiday Pricing Not Working**
```
Check:
1. Event date is set correctly
2. Weekend detection logic (Friday-Sunday)
3. Date format in system (ISO format required)
4. Timezone considerations

Fix:
- Ensure date is valid JavaScript Date object
- Check formula conditions for weekday detection
- Verify timezone handling in date calculations
```

**Group Discounts Not Applying**
```
Check:
1. Participant count is set
2. Minimum threshold in formula (usually 5+)
3. Discount percentage is positive number

Fix:
- Set participants field in pricing context
- Verify groupDiscount variable exists
- Check condition logic in formula
```

**Percentage Calculations Off**
```
Common issue: Entering 0.2 instead of 20 for 20%

Fix:
- Enter percentages as whole numbers (20, not 0.2)
- Check formula divides by 100 for percentage
- Verify calculation order (multiplication before division)
```

---

### 3. Template Selection Issues

#### Symptoms
- No templates appear in selector
- Template preview is empty
- Cannot apply template to product

#### Solutions

**No Templates Available**
```
Cause: No templates configured by admin
Solution:
1. Contact system administrator
2. Ask admin to create pricing templates
3. Verify your user permissions
```

**Template Won't Apply**
```
Cause: Template missing required data
Solution:
1. Check template has variables defined
2. Verify template formulas are valid
3. Try applying different template
4. Check browser console for errors
```

**Template Preview Empty**
```
Cause: Template configuration incomplete
Solution:
1. Admin needs to configure template variables
2. Verify template formulas exist
3. Check template category assignment
```

---

### 4. Variable Input Problems

#### Symptoms
- Cannot edit variable values
- Inputs don't save
- Validation errors on valid data

#### Common Fixes

**Values Not Saving**
```
Debugging:
1. Check browser console for API errors
2. Verify internet connection
3. Try refreshing page
4. Check if you have edit permissions

Network Issues:
- Check API endpoint status (/api/product/{id}/variables)
- Verify authentication token
- Try different browser/device
```

**Validation Errors**
```
Common validation issues:
- Negative prices (must be positive)
- Invalid percentage range (usually 0-100)
- Required fields empty
- Wrong data type (text in number field)

Fix:
- Enter positive numbers for prices
- Use whole numbers for percentages
- Fill all required fields
- Match expected data types
```

**Input Fields Not Appearing**
```
Cause: Template variables not properly configured
Solution:
1. Check template has variables assigned
2. Verify variable definitions exist
3. Contact admin to review template configuration
```

---

### 5. API and Performance Issues

#### Symptoms
- Slow loading times
- Request timeouts
- Intermittent failures

#### Performance Troubleshooting

**Slow Pricing Calculations**
```
Check:
1. Formula complexity (nested calculations)
2. Number of conditional formulas
3. Large variable datasets

Optimize:
- Simplify complex formulas
- Reduce number of conditions
- Cache frequently used calculations
```

**API Timeouts**
```
Symptoms: Long loading times, timeout errors
Causes: Heavy database queries, complex calculations

Solutions:
1. Check Supabase performance metrics
2. Optimize database queries
3. Implement request caching
4. Reduce payload sizes
```

**Browser Performance**
```
Issues: Slow UI updates, unresponsive interface
Solutions:
1. Clear browser cache
2. Disable browser extensions
3. Try different browser
4. Check available memory
```

---

### 6. Admin Configuration Issues

#### Symptoms
- Cannot create pricing products
- Variable definitions won't save
- Formula validation fails

#### Admin-Specific Solutions

**Cannot Create Pricing Products**
```
Check:
1. Admin permissions (role-based access)
2. Required fields completion
3. Valid category selection
4. Unique naming requirements

Fix:
- Verify admin role assignment
- Complete all required fields
- Choose valid category
- Use unique product names
```

**Variable Definition Problems**
```
Common issues:
- Duplicate variable keys
- Invalid data types
- Missing validation rules

Solutions:
- Use unique variable keys (e.g., basePrice, not "Base Price")
- Choose correct data type (number, string, boolean)
- Set appropriate min/max values
- Provide clear descriptions
```

**Formula Validation Errors**
```
Common formula syntax errors:
- Missing operators
- Invalid variable references
- Malformed JSON structure

Fix:
- Use valid JSON syntax
- Reference existing variables only
- Test formulas with sample data
- Use formula builder tool
```

---

### 7. Integration and Data Issues

#### Symptoms
- Data not syncing between admin and user interfaces
- Inconsistent pricing across different products
- Missing default data

#### Data Consistency Solutions

**Admin Changes Not Reflecting**
```
Check:
1. Browser cache (clear and refresh)
2. API synchronization delays
3. Database replication lag

Fix:
- Clear browser cache
- Wait 30 seconds for sync
- Refresh both admin and user interfaces
- Check database connection status
```

**Missing Default Data**
```
Symptoms: No templates or variables available
Cause: Database not properly seeded

Solution:
1. Run database migration scripts
2. Execute default data seeding
3. Contact system administrator
4. Check deployment status
```

**Inconsistent Pricing**
```
Cause: Different products using different template versions
Solution:
1. Standardize templates across products
2. Update all products to latest template version
3. Review pricing consistency across product line
```

---

## Advanced Troubleshooting

### Database-Level Issues

#### Check Database Health
```sql
-- Verify core tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pricing_products', 'pricing_variables', 'global_variable_definitions');

-- Check default data
SELECT COUNT(*) FROM global_variable_definitions;
SELECT COUNT(*) FROM pricing_products WHERE is_default = true;
```

#### Common SQL Fixes
```sql
-- Reset pricing configuration for product
DELETE FROM pricing_variables WHERE product_id = 'your-product-id';

-- Recreate default variables
INSERT INTO global_variable_definitions (variable_key, display_name, data_type, category)
VALUES ('basePrice', 'Base Price', 'number', 'pricing');
```

### API Debugging

#### Test API Endpoints
```bash
# Test product variables endpoint
curl -X GET "https://your-api.com/api/product/123/variables" \
  -H "Authorization: Bearer your-token"

# Test template application
curl -X POST "https://your-api.com/api/product/123/apply-template" \
  -H "Content-Type: application/json" \
  -d '{"templateId": "restaurant-booking"}'
```

#### Common API Response Codes
- **200**: Success
- **400**: Bad request (check request format)
- **401**: Unauthorized (check authentication)
- **403**: Forbidden (check permissions)
- **404**: Not found (check resource exists)
- **500**: Server error (check logs)

### Browser Console Debugging

#### Check for JavaScript Errors
```javascript
// Open browser console (F12) and look for:
// - Network request failures
// - JavaScript errors
// - Failed API calls
// - Timeout warnings

// Test pricing calculation manually
console.log(PricingEngine.calculatePrice(formulas, context));
```

---

## Error Code Reference

### API Error Codes
- **PRICING_001**: Template not found
- **PRICING_002**: Invalid variable value
- **PRICING_003**: Formula calculation error
- **PRICING_004**: Permission denied
- **PRICING_005**: Missing required variables

### System Error Messages
- **"Template could not be applied"**: Check template configuration
- **"Invalid pricing formula"**: Review formula syntax
- **"Variable validation failed"**: Check input requirements
- **"Pricing calculation error"**: Verify variable values

---

## Prevention Best Practices

### For Administrators
1. **Test templates thoroughly** before making them available
2. **Document variable requirements** clearly
3. **Provide example values** for each variable
4. **Regular backup** of pricing configurations

### For Users
1. **Start with simple configurations** and add complexity gradually
2. **Test pricing scenarios** before going live
3. **Keep variable values updated** as business needs change
4. **Save configurations frequently** during setup

### For Developers
1. **Implement proper error handling** in all API endpoints
2. **Add comprehensive logging** for debugging
3. **Use type safety** throughout the system
4. **Write integration tests** for pricing calculations

---

## Getting Additional Help

### Support Channels
1. **Check documentation** first (User Guide, Template Gallery)
2. **Search this troubleshooting guide** for similar issues
3. **Contact system administrator** for permission issues
4. **Submit support ticket** with detailed error information

### Information to Include in Support Requests
- **Error message** (exact text)
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Browser and version** you're using
- **Screenshots** of error messages
- **Network requests** from browser console

### Emergency Contacts
- **System Administrator**: For permission and access issues
- **Technical Support**: For complex technical problems
- **Database Administrator**: For data consistency issues

Remember: Most pricing system issues are configuration-related and can be resolved by checking variable values, template settings, and user permissions.