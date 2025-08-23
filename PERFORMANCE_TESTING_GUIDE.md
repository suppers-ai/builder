# Performance Testing Guide

## Overview

This guide outlines comprehensive performance testing strategies for the pricing system, ensuring optimal response times and scalability under various load conditions.

---

## Performance Targets

### Response Time Goals
- **Pricing Calculation**: < 100ms for standard formulas
- **Variable Save**: < 200ms for individual updates
- **Template Application**: < 500ms including all variables
- **Pricing Preview**: < 150ms for real-time updates
- **Admin Interface**: < 2 seconds for page loads

### Throughput Targets
- **Concurrent Users**: 50+ simultaneous pricing calculations
- **API Requests**: 1000+ requests per minute
- **Database Queries**: < 50ms average query time
- **Template Operations**: 100+ template applications per minute

### Scalability Goals
- **Variable Count**: 100+ variables per product
- **Formula Complexity**: 20+ nested conditions
- **Product Scale**: 10,000+ products with pricing
- **User Scale**: 500+ concurrent active users

---

## Testing Methodology

### Load Testing Strategy

#### 1. Baseline Performance Testing
**Objective**: Establish current performance metrics

```bash
# Single user baseline test
deno task test:performance:baseline

# Metrics to capture:
# - API response times
# - Database query performance
# - UI rendering speed
# - Memory usage patterns
```

#### 2. Stress Testing
**Objective**: Find system breaking points

```javascript
// Load test configuration
const loadTest = {
  scenarios: {
    pricingCalculations: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 10 },   // Ramp up
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Scale to 100
        { duration: '5m', target: 100 },  // Hold at peak
        { duration: '2m', target: 0 },    // Ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.05'],   // Less than 5% failures
  },
};
```

#### 3. Endurance Testing
**Objective**: Verify system stability over time

```bash
# 24-hour endurance test
deno task test:performance:endurance

# Monitor for:
# - Memory leaks
# - Performance degradation
# - Error rate increases
# - Database connection issues
```

---

## Component-Specific Testing

### Pricing Engine Performance

#### Formula Calculation Benchmarks

```typescript
// Test complex formula evaluation
describe('Pricing Engine Performance', () => {
  test('Complex formula calculation under 100ms', async () => {
    const startTime = performance.now();
    
    const result = PricingEngine.calculatePrice(complexFormulas, context);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // 100ms target
    expect(result.totalAmount).toBeGreaterThan(0);
  });

  test('Bulk calculations performance', async () => {
    const contexts = generateTestContexts(100);
    const startTime = performance.now();
    
    const results = contexts.map(ctx => 
      PricingEngine.calculatePrice(formulas, ctx)
    );
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / contexts.length;
    
    expect(avgTime).toBeLessThan(50); // 50ms average
  });
});
```

#### Conditional Logic Performance

```typescript
// Test weekend/group discount conditions
const performanceTest = {
  scenarios: [
    {
      name: 'Weekend Detection',
      iterations: 1000,
      context: { eventDate: new Date('2024-03-16') }, // Saturday
      expectedTime: 10, // 10ms max
    },
    {
      name: 'Group Size Calculation',
      iterations: 1000,
      context: { participants: 8 },
      expectedTime: 5, // 5ms max
    },
    {
      name: 'Nested Conditions',
      iterations: 500,
      context: { 
        eventDate: new Date('2024-03-16'),
        participants: 8,
        isHoliday: true 
      },
      expectedTime: 25, // 25ms max for complex logic
    },
  ],
};
```

### API Endpoint Performance

#### Variable Management Endpoints

```bash
# Test variable retrieval performance
curl -w "@curl-format.txt" \
  -X GET "https://api.example.com/product/123/variables" \
  -H "Authorization: Bearer $TOKEN"

# Expected response format:
# time_namelookup:    0.001
# time_connect:       0.037
# time_appconnect:    0.084
# time_pretransfer:   0.085
# time_redirect:      0.000
# time_starttransfer: 0.150  # Target: <200ms
# time_total:         0.151
```

#### Template Application Performance

```javascript
// Load test template application
export default function() {
  const productId = `test-product-${Math.floor(Math.random() * 1000)}`;
  
  group('Template Application Flow', () => {
    // Apply template
    let response = http.post(`${baseUrl}/product/${productId}/apply-template`, 
      JSON.stringify({ templateId: 'restaurant-booking' }), {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    check(response, {
      'template applied successfully': (r) => r.status === 200,
      'response time under 500ms': (r) => r.timings.duration < 500,
    });
    
    // Update variables
    response = http.post(`${baseUrl}/product/${productId}/variables`,
      JSON.stringify({ basePrice: 25, weekendSurcharge: 20 }), {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    check(response, {
      'variables updated successfully': (r) => r.status === 200,
      'response time under 200ms': (r) => r.timings.duration < 200,
    });
  });
}
```

### Database Performance

#### Query Optimization Testing

```sql
-- Test variable retrieval query performance
EXPLAIN ANALYZE 
SELECT 
  v.variable_key,
  v.variable_value,
  d.display_name,
  d.data_type,
  d.validation_rules
FROM pricing_variables v
JOIN global_variable_definitions d ON v.variable_key = d.variable_key
WHERE v.product_id = 'test-product-123';

-- Expected: Execution time < 50ms
-- Index requirements:
-- - pricing_variables(product_id)
-- - global_variable_definitions(variable_key)
```

#### Bulk Operations Performance

```sql
-- Test bulk variable insertion
INSERT INTO pricing_variables (product_id, variable_key, variable_value)
SELECT 
  'test-product-' || generate_series(1, 1000),
  'basePrice',
  '25'
FROM generate_series(1, 1000);

-- Monitor: Insertion rate (should handle 1000+ inserts/second)
```

### Frontend Performance

#### React Component Rendering

```typescript
// Test pricing preview component performance
describe('PricingPreview Performance', () => {
  test('Initial render under 100ms', () => {
    const startTime = performance.now();
    
    render(
      <PricingPreview 
        variables={largeVariableSet} 
        productId="test-product" 
      />
    );
    
    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(100);
  });

  test('Re-render on variable change under 50ms', () => {
    const { rerender } = render(
      <PricingPreview variables={initialVariables} />
    );
    
    const startTime = performance.now();
    
    rerender(
      <PricingPreview variables={updatedVariables} />
    );
    
    const rerenderTime = performance.now() - startTime;
    expect(rerenderTime).toBeLessThan(50);
  });
});
```

#### Real-time Updates Performance

```typescript
// Test variable input debouncing
describe('Variable Input Performance', () => {
  test('Debounced API calls reduce server load', async () => {
    const apiCalls = [];
    const mockApi = jest.fn().mockImplementation((call) => {
      apiCalls.push(call);
      return Promise.resolve({ success: true });
    });

    render(<SimpleVariableInputs onApiCall={mockApi} />);
    
    const input = screen.getByLabelText('Base Price');
    
    // Rapid typing simulation
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.change(input, { target: { value: '123' } });
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Should only make one API call due to debouncing
    expect(apiCalls).toHaveLength(1);
    expect(apiCalls[0].value).toBe('123');
  });
});
```

---

## Load Testing Scenarios

### Scenario 1: Peak User Activity

```javascript
// Simulate busy restaurant booking period
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Normal activity
    { duration: '30s', target: 100 }, // Dinner rush starts
    { duration: '10m', target: 100 }, // Peak dinner rush
    { duration: '1m', target: 20 },   // Back to normal
  ],
};

export default function() {
  const scenarios = [
    { weight: 40, action: 'view_pricing' },
    { weight: 30, action: 'update_variables' },
    { weight: 20, action: 'apply_template' },
    { weight: 10, action: 'calculate_pricing' },
  ];
  
  const action = weightedChoice(scenarios);
  executeAction(action);
}
```

### Scenario 2: Admin Configuration Activity

```javascript
// Admin making bulk changes during setup
export default function() {
  group('Admin Bulk Operations', () => {
    // Create multiple pricing products
    for (let i = 0; i < 10; i++) {
      http.post(`${adminUrl}/pricing-products`, {
        name: `Test Product ${i}`,
        category: 'restaurant',
        variables: generateRandomVariables(),
      });
    }
    
    // Apply templates to multiple products
    for (let i = 0; i < 20; i++) {
      http.post(`${userUrl}/product/${i}/apply-template`, {
        templateId: 'restaurant-booking',
      });
    }
  });
}
```

### Scenario 3: Mixed User Types

```javascript
// Combination of admin and regular users
export const options = {
  scenarios: {
    admins: {
      executor: 'constant-vus',
      vus: 5,
      duration: '10m',
      exec: 'adminWorkflow',
    },
    users: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '6m', target: 50 },
        { duration: '2m', target: 10 },
      ],
      exec: 'userWorkflow',
    },
  },
};

export function adminWorkflow() {
  // Heavy admin operations
  createPricingProducts();
  managVariableDefinitions();
  configureComplexFormulas();
}

export function userWorkflow() {
  // Typical user operations
  viewProducts();
  applyTemplates();
  updateVariables();
  previewPricing();
}
```

---

## Performance Monitoring

### Real-time Metrics Collection

```typescript
// Application performance monitoring
class PerformanceMonitor {
  static trackPricingCalculation(startTime: number, endTime: number, complexity: number) {
    const duration = endTime - startTime;
    
    // Log to monitoring service
    analytics.track('pricing_calculation_performance', {
      duration,
      complexity,
      timestamp: new Date(),
    });
    
    // Alert if performance degrades
    if (duration > PERFORMANCE_THRESHOLDS.PRICING_CALCULATION) {
      alerts.send(`Slow pricing calculation: ${duration}ms`);
    }
  }
  
  static trackApiResponse(endpoint: string, duration: number, status: number) {
    metrics.histogram('api_response_time', duration, {
      endpoint,
      status: status.toString(),
    });
  }
}
```

### Database Performance Monitoring

```sql
-- Monitor slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE query LIKE '%pricing_%'
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor connection usage
SELECT state, count(*) 
FROM pg_stat_activity 
WHERE application_name LIKE '%pricing%'
GROUP BY state;
```

### Frontend Performance Monitoring

```typescript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Collect and send performance metrics
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

function sendToAnalytics(metric) {
  const { name, value, id } = metric;
  
  // Send to monitoring service
  analytics.track('web_vitals', {
    metric_name: name,
    value,
    id,
    url: window.location.href,
  });
}
```

---

## Performance Optimization Strategies

### Backend Optimizations

#### Database Query Optimization
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_pricing_variables_product_id 
ON pricing_variables(product_id);

CREATE INDEX CONCURRENTLY idx_global_variable_definitions_key 
ON global_variable_definitions(variable_key);

-- Optimize variable retrieval query
CREATE VIEW product_variables_view AS
SELECT 
  v.product_id,
  v.variable_key,
  v.variable_value,
  d.display_name,
  d.data_type,
  d.validation_rules,
  d.category
FROM pricing_variables v
JOIN global_variable_definitions d ON v.variable_key = d.variable_key;
```

#### API Response Caching
```typescript
// Cache frequently accessed data
class PricingCache {
  private static cache = new Map();
  
  static async getProductVariables(productId: string) {
    const cacheKey = `variables:${productId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const variables = await database.getProductVariables(productId);
    this.cache.set(cacheKey, variables);
    
    // Cache for 5 minutes
    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
    
    return variables;
  }
}
```

### Frontend Optimizations

#### Component Memoization
```typescript
// Optimize pricing preview component
const PricingPreview = memo(({ variables, productId }) => {
  const memoizedCalculation = useMemo(() => {
    return PricingEngine.calculatePrice(formulas, {
      variables,
      quantity: 1,
      participants: 1,
      eventDate: new Date(),
    });
  }, [variables, formulas]);
  
  return (
    <div>
      <div>Total: ${memoizedCalculation.totalAmount}</div>
      {/* Render breakdown */}
    </div>
  );
});
```

#### Debounced API Calls
```typescript
// Optimize variable input updates
const useDebounceVariableUpdate = (productId: string, delay = 500) => {
  const debouncedUpdate = useCallback(
    debounce(async (variableKey: string, value: any) => {
      await api.updateProductVariable(productId, variableKey, value);
    }, delay),
    [productId, delay]
  );
  
  return debouncedUpdate;
};
```

---

## Performance Testing Tools

### Load Testing Setup

```bash
# Install k6 for load testing
npm install -g k6

# Run performance tests
k6 run pricing-load-test.js

# Generate HTML report
k6 run --out json=results.json pricing-load-test.js
k6-html-reporter results.json
```

### Database Performance Analysis

```bash
# PostgreSQL performance analysis
psql -d pricing_db -c "
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('pricing_variables', 'pricing_products')
ORDER BY tablename, attname;
"
```

### Frontend Performance Testing

```bash
# Lighthouse CI for performance auditing
npm install -g @lhci/cli

# Run Lighthouse tests
lhci autorun --upload.target=filesystem --upload.outputDir=./lighthouse-reports
```

---

## Performance Benchmarks

### Current System Performance
- **Average pricing calculation**: 45ms
- **Variable update API**: 120ms
- **Template application**: 340ms
- **Admin interface load**: 1.2s
- **Database query average**: 28ms

### Performance Regression Thresholds
- **Pricing calculation**: >100ms (alert)
- **API responses**: >500ms (alert)
- **Page load times**: >3s (alert)
- **Database queries**: >100ms (investigate)
- **Error rates**: >2% (immediate attention)

### Scalability Targets
- **Concurrent users**: 200+ without degradation
- **Products with pricing**: 50,000+
- **Variables per product**: 500+
- **Daily calculations**: 1,000,000+

This comprehensive performance testing approach ensures the pricing system maintains optimal performance as it scales to meet growing business demands.