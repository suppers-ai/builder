package engine

import (
	"database/sql"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCalculator_EvaluateExpression(t *testing.T) {
	calc := NewCalculator()

	tests := []struct {
		name      string
		expr      string
		variables map[string]interface{}
		expected  float64
		wantErr   bool
	}{
		// Basic arithmetic
		{
			name:      "simple addition",
			expr:      "10 + 5",
			variables: map[string]interface{}{},
			expected:  15,
		},
		{
			name:      "simple subtraction",
			expr:      "20 - 8",
			variables: map[string]interface{}{},
			expected:  12,
		},
		{
			name:      "multiplication",
			expr:      "7 * 6",
			variables: map[string]interface{}{},
			expected:  42,
		},
		{
			name:      "division",
			expr:      "100 / 4",
			variables: map[string]interface{}{},
			expected:  25,
		},
		{
			name:      "complex arithmetic",
			expr:      "(10 + 5) * 2 - 3",
			variables: map[string]interface{}{},
			expected:  27,
		},
		{
			name:      "decimal operations",
			expr:      "99.99 * 1.08",
			variables: map[string]interface{}{},
			expected:  107.9892,
		},

		// Variable substitution
		{
			name: "single variable",
			expr: "base_price * 2",
			variables: map[string]interface{}{
				"base_price": 50.0,
			},
			expected: 100,
		},
		{
			name: "multiple variables",
			expr: "base_price * quantity + shipping",
			variables: map[string]interface{}{
				"base_price": 25.0,
				"quantity":   3.0,
				"shipping":   10.0,
			},
			expected: 85,
		},
		{
			name: "percentage calculation",
			expr: "base_price * (1 + tax_rate / 100)",
			variables: map[string]interface{}{
				"base_price": 100.0,
				"tax_rate":   8.5,
			},
			expected: 108.5,
		},

		// Functions
		{
			name:      "MAX function",
			expr:      "MAX(10, 20, 15)",
			variables: map[string]interface{}{},
			expected:  20,
		},
		{
			name:      "MIN function",
			expr:      "MIN(10, 20, 15)",
			variables: map[string]interface{}{},
			expected:  10,
		},
		{
			name: "MAX with variables",
			expr: "MAX(weight, dimensional_weight)",
			variables: map[string]interface{}{
				"weight":             5.0,
				"dimensional_weight": 8.0,
			},
			expected: 8,
		},
		{
			name:      "GREATEST function (alias for MAX)",
			expr:      "GREATEST(1, 2, 3)",
			variables: map[string]interface{}{},
			expected:  3,
		},
		{
			name:      "LEAST function (alias for MIN)",
			expr:      "LEAST(1, 2, 3)",
			variables: map[string]interface{}{},
			expected:  1,
		},

		// CASE statements
		{
			name: "simple CASE WHEN",
			expr: "CASE WHEN quantity >= 10 THEN base_price * 0.9 ELSE base_price END",
			variables: map[string]interface{}{
				"quantity":   15.0,
				"base_price": 100.0,
			},
			expected: 90,
		},
		{
			name: "multiple CASE WHEN conditions",
			expr: `CASE 
				WHEN quantity >= 100 THEN base_price * 0.7
				WHEN quantity >= 50 THEN base_price * 0.8
				WHEN quantity >= 10 THEN base_price * 0.9
				ELSE base_price
			END`,
			variables: map[string]interface{}{
				"quantity":   75.0,
				"base_price": 100.0,
			},
			expected: 80,
		},
		{
			name: "nested CASE statements",
			expr: `base_price * 
				CASE WHEN is_vip THEN 
					CASE WHEN order_count > 10 THEN 0.7 ELSE 0.8 END
				ELSE 
					CASE WHEN order_count > 10 THEN 0.9 ELSE 1.0 END
				END`,
			variables: map[string]interface{}{
				"base_price":  100.0,
				"is_vip":      true,
				"order_count": 15.0,
			},
			expected: 70,
		},

		// Complex formulas
		{
			name: "tiered volume pricing",
			expr: `CASE 
				WHEN quantity >= 1000 THEN cost * 1.15
				WHEN quantity >= 500 THEN cost * 1.20
				WHEN quantity >= 100 THEN cost * 1.30
				WHEN quantity >= 50 THEN cost * 1.40
				WHEN quantity >= 20 THEN cost * 1.55
				WHEN quantity >= 10 THEN cost * 1.70
				ELSE base_price
			END`,
			variables: map[string]interface{}{
				"quantity":   250.0,
				"cost":       50.0,
				"base_price": 100.0,
			},
			expected: 65, // 50 * 1.30
		},
		{
			name: "shipping calculation",
			expr: "MAX(weight, (length * width * height) / 5000) * 2.5",
			variables: map[string]interface{}{
				"weight": 5.0,
				"length": 40.0,
				"width":  30.0,
				"height": 20.0,
			},
			expected: 12, // dimensional weight = 24000/5000 = 4.8, MAX(5, 4.8) = 5, 5 * 2.5 = 12.5
		},
		{
			name: "subscription pricing with overages",
			expr: `base_monthly + 
				GREATEST(0, (users - 5) * 15) + 
				GREATEST(0, (storage - 100) * 0.10)`,
			variables: map[string]interface{}{
				"base_monthly": 99.0,
				"users":        8.0,
				"storage":      150.0,
			},
			expected: 149, // 99 + (3 * 15) + (50 * 0.10) = 99 + 45 + 5
		},

		// Comparison operators
		{
			name: "greater than comparison",
			expr: "CASE WHEN price > 100 THEN price * 0.9 ELSE price END",
			variables: map[string]interface{}{
				"price": 150.0,
			},
			expected: 135,
		},
		{
			name: "less than or equal comparison",
			expr: "CASE WHEN stock <= 10 THEN price * 1.2 ELSE price END",
			variables: map[string]interface{}{
				"stock": 5.0,
				"price": 50.0,
			},
			expected: 60,
		},
		{
			name: "equality comparison",
			expr: "CASE WHEN status = 1 THEN price * 0.5 ELSE price END",
			variables: map[string]interface{}{
				"status": 1.0,
				"price":  100.0,
			},
			expected: 50,
		},
		{
			name: "not equal comparison",
			expr: "CASE WHEN type != 0 THEN price + 10 ELSE price END",
			variables: map[string]interface{}{
				"type":  2.0,
				"price": 40.0,
			},
			expected: 50,
		},

		// Logical operators
		{
			name: "AND operator",
			expr: "CASE WHEN quantity > 10 AND is_vip THEN price * 0.7 ELSE price END",
			variables: map[string]interface{}{
				"quantity": 15.0,
				"is_vip":   true,
				"price":    100.0,
			},
			expected: 70,
		},
		{
			name: "OR operator",
			expr: "CASE WHEN quantity > 100 OR is_wholesale THEN price * 0.8 ELSE price END",
			variables: map[string]interface{}{
				"quantity":     50.0,
				"is_wholesale": true,
				"price":        100.0,
			},
			expected: 80,
		},
		{
			name: "Complex logical conditions",
			expr: `CASE 
				WHEN (quantity > 50 AND is_vip) OR (quantity > 100) THEN price * 0.7
				WHEN quantity > 20 OR is_member THEN price * 0.9
				ELSE price
			END`,
			variables: map[string]interface{}{
				"quantity":  60.0,
				"is_vip":    true,
				"is_member": false,
				"price":     100.0,
			},
			expected: 70,
		},

		// Error cases
		{
			name:      "undefined variable",
			expr:      "undefined_var * 2",
			variables: map[string]interface{}{},
			wantErr:   true,
		},
		{
			name:      "division by zero",
			expr:      "100 / 0",
			variables: map[string]interface{}{},
			wantErr:   true,
		},
		{
			name:      "invalid syntax",
			expr:      "10 + + 5",
			variables: map[string]interface{}{},
			wantErr:   true,
		},
		{
			name:      "mismatched parentheses",
			expr:      "(10 + 5",
			variables: map[string]interface{}{},
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := calc.EvaluateExpression(tt.expr, tt.variables)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				require.NoError(t, err)
				assert.InDelta(t, tt.expected, result, 0.01)
			}
		})
	}
}

func TestCalculator_EvaluateWithConditions(t *testing.T) {
	calc := NewCalculator()

	tests := []struct {
		name       string
		conditions []Condition
		variables  map[string]interface{}
		expected   bool
		wantErr    bool
	}{
		{
			name: "single condition true",
			conditions: []Condition{
				{Field: "quantity", Operator: ">=", Value: "10"},
			},
			variables: map[string]interface{}{
				"quantity": 15.0,
			},
			expected: true,
		},
		{
			name: "single condition false",
			conditions: []Condition{
				{Field: "quantity", Operator: ">=", Value: "10"},
			},
			variables: map[string]interface{}{
				"quantity": 5.0,
			},
			expected: false,
		},
		{
			name: "multiple conditions all true",
			conditions: []Condition{
				{Field: "quantity", Operator: ">=", Value: "10"},
				{Field: "is_vip", Operator: "=", Value: "true"},
				{Field: "price", Operator: "<", Value: "100"},
			},
			variables: map[string]interface{}{
				"quantity": 15.0,
				"is_vip":   true,
				"price":    75.0,
			},
			expected: true,
		},
		{
			name: "multiple conditions one false",
			conditions: []Condition{
				{Field: "quantity", Operator: ">=", Value: "10"},
				{Field: "is_vip", Operator: "=", Value: "true"},
				{Field: "price", Operator: "<", Value: "100"},
			},
			variables: map[string]interface{}{
				"quantity": 15.0,
				"is_vip":   false,
				"price":    75.0,
			},
			expected: false,
		},
		{
			name: "string comparison",
			conditions: []Condition{
				{Field: "customer_type", Operator: "=", Value: "vip"},
			},
			variables: map[string]interface{}{
				"customer_type": "vip",
			},
			expected: true,
		},
		{
			name: "in operator with array",
			conditions: []Condition{
				{Field: "brand", Operator: "in", Value: `["Premium1","Premium2","Luxury"]`},
			},
			variables: map[string]interface{}{
				"brand": "Premium1",
			},
			expected: true,
		},
		{
			name: "in operator not found",
			conditions: []Condition{
				{Field: "brand", Operator: "in", Value: `["Premium1","Premium2","Luxury"]`},
			},
			variables: map[string]interface{}{
				"brand": "Standard",
			},
			expected: false,
		},
		{
			name: "not equal operator",
			conditions: []Condition{
				{Field: "status", Operator: "!=", Value: "inactive"},
			},
			variables: map[string]interface{}{
				"status": "active",
			},
			expected: true,
		},
		{
			name: "variable comparison",
			conditions: []Condition{
				{Field: "current_stock", Operator: "<=", Value: "min_stock"},
			},
			variables: map[string]interface{}{
				"current_stock": 5.0,
				"min_stock":     10.0,
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := calc.EvaluateConditions(tt.conditions, tt.variables)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				require.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func TestCalculator_CalculatePrice(t *testing.T) {
	calc := NewCalculator()

	tests := []struct {
		name      string
		rules     []PricingRule
		variables map[string]interface{}
		expected  float64
		wantErr   bool
	}{
		{
			name: "single matching rule",
			rules: []PricingRule{
				{
					Name:       "standard",
					Formula:    "base_price",
					Conditions: []string{},
					Priority:   100,
					IsActive:   true,
				},
			},
			variables: map[string]interface{}{
				"base_price": 100.0,
			},
			expected: 100,
		},
		{
			name: "multiple rules with priority",
			rules: []PricingRule{
				{
					Name:       "standard",
					Formula:    "base_price",
					Conditions: []string{},
					Priority:   100,
					IsActive:   true,
				},
				{
					Name:       "vip_discount",
					Formula:    "base_price * 0.8",
					Conditions: []string{"is_vip_customer"},
					Priority:   90,
					IsActive:   true,
				},
			},
			variables: map[string]interface{}{
				"base_price":      100.0,
				"customer_type":   "vip",
				"is_vip_customer": true,
			},
			expected: 80, // VIP discount applies (higher priority)
		},
		{
			name: "complex tiered pricing",
			rules: []PricingRule{
				{
					Name: "tiered_volume",
					Formula: `CASE 
						WHEN quantity >= 100 THEN base_price * 0.7
						WHEN quantity >= 50 THEN base_price * 0.8
						WHEN quantity >= 20 THEN base_price * 0.9
						ELSE base_price
					END`,
					Conditions: []string{},
					Priority:   100,
					IsActive:   true,
				},
			},
			variables: map[string]interface{}{
				"base_price": 100.0,
				"quantity":   75.0,
			},
			expected: 80,
		},
		{
			name: "rule with unmet conditions",
			rules: []PricingRule{
				{
					Name:       "vip_only",
					Formula:    "base_price * 0.5",
					Conditions: []string{"is_vip"},
					Priority:   100,
					IsActive:   true,
				},
				{
					Name:       "fallback",
					Formula:    "base_price",
					Conditions: []string{},
					Priority:   200,
					IsActive:   true,
				},
			},
			variables: map[string]interface{}{
				"base_price": 100.0,
				"is_vip":     false,
			},
			expected: 100, // Fallback rule applies
		},
		{
			name: "inactive rules ignored",
			rules: []PricingRule{
				{
					Name:       "special_offer",
					Formula:    "base_price * 0.5",
					Conditions: []string{},
					Priority:   50,
					IsActive:   false,
				},
				{
					Name:       "standard",
					Formula:    "base_price",
					Conditions: []string{},
					Priority:   100,
					IsActive:   true,
				},
			},
			variables: map[string]interface{}{
				"base_price": 100.0,
			},
			expected: 100,
		},
		{
			name: "no matching rules",
			rules: []PricingRule{
				{
					Name:       "vip_only",
					Formula:    "base_price * 0.5",
					Conditions: []string{"is_vip"},
					Priority:   100,
					IsActive:   true,
				},
			},
			variables: map[string]interface{}{
				"base_price": 100.0,
				"is_vip":     false,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, appliedRule, err := calc.CalculatePrice(tt.rules, tt.variables)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				require.NoError(t, err)
				assert.InDelta(t, tt.expected, result, 0.01)
				assert.NotEmpty(t, appliedRule)
			}
		})
	}
}

func TestCalculator_ComplexBusinessScenarios(t *testing.T) {
	calc := NewCalculator()

	tests := []struct {
		name      string
		scenario  string
		formula   string
		variables map[string]interface{}
		expected  float64
	}{
		{
			name:     "E-commerce with loyalty and bulk discount",
			scenario: "Customer buying in bulk with loyalty points",
			formula: `base_price * 
				CASE 
					WHEN quantity >= 100 THEN 0.7
					WHEN quantity >= 50 THEN 0.8
					WHEN quantity >= 20 THEN 0.9
					ELSE 1
				END *
				CASE 
					WHEN loyalty_points >= 1000 THEN 0.9
					WHEN loyalty_points >= 500 THEN 0.95
					ELSE 1
				END *
				CASE
					WHEN is_first_order THEN 0.9
					ELSE 1
				END`,
			variables: map[string]interface{}{
				"base_price":     100.0,
				"quantity":       75.0,
				"loyalty_points": 750.0,
				"is_first_order": false,
			},
			expected: 76, // 100 * 0.8 * 0.95 * 1
		},
		{
			name:     "SaaS subscription with usage overages",
			scenario: "Enterprise subscription with extra users and storage",
			formula: `(base_monthly + 
				GREATEST(0, (users - included_users) * user_cost) + 
				GREATEST(0, (storage_gb - included_storage) * storage_cost) +
				GREATEST(0, (api_calls - included_api_calls) * 0.0001)) *
				CASE WHEN is_annual THEN 0.8333 ELSE 1 END`,
			variables: map[string]interface{}{
				"base_monthly":      299.0,
				"users":             25.0,
				"included_users":    10.0,
				"user_cost":         15.0,
				"storage_gb":        500.0,
				"included_storage":  100.0,
				"storage_cost":      0.10,
				"api_calls":         50000.0,
				"included_api_calls": 10000.0,
				"is_annual":         true,
			},
			expected: 602.475, // (299 + 225 + 40 + 4) * 0.8333
		},
		{
			name:     "Hotel room dynamic pricing",
			scenario: "Weekend peak season booking with children",
			formula: `base_rate * 
				(1 + 
					(CASE WHEN is_weekend THEN 0.25 ELSE 0 END) +
					(CASE WHEN is_peak THEN 0.35 ELSE 0 END) +
					(CASE WHEN is_holiday THEN 0.5 ELSE 0 END)
				) * 
				nights * 
				(adults + (children * 0.5)) *
				CASE 
					WHEN nights >= 7 THEN 0.85
					WHEN nights >= 3 THEN 0.95
					ELSE 1
				END`,
			variables: map[string]interface{}{
				"base_rate":  200.0,
				"is_weekend": true,
				"is_peak":    true,
				"is_holiday": false,
				"nights":     5.0,
				"adults":     2.0,
				"children":   2.0,
			},
			expected: 2280, // 200 * 1.6 * 5 * 3 * 0.95
		},
		{
			name:     "Service call with emergency and materials",
			scenario: "Emergency plumbing service on weekend",
			formula: `((hourly_rate * hours) + 
				materials + 
				(travel_km * travel_rate)) * 
				(1 + 
					(CASE WHEN is_emergency THEN 0.5 ELSE 0 END) +
					(CASE WHEN is_weekend THEN 0.3 ELSE 0 END) +
					(CASE WHEN is_after_hours THEN 0.2 ELSE 0 END)
				)`,
			variables: map[string]interface{}{
				"hourly_rate":     75.0,
				"hours":           3.0,
				"materials":       150.0,
				"travel_km":       20.0,
				"travel_rate":     1.5,
				"is_emergency":    true,
				"is_weekend":      true,
				"is_after_hours":  false,
			},
			expected: 729, // (225 + 150 + 30) * 1.8
		},
		{
			name:     "Shipping with dimensional weight",
			scenario: "International express shipping for large light item",
			formula: `(MAX(actual_weight, (length * width * height) / dimensional_factor) * 
				base_rate * 
				CASE 
					WHEN zone = 'international' THEN 2.5
					WHEN zone = 'remote' THEN 1.8
					ELSE 1
				END *
				CASE WHEN is_express THEN 2 ELSE 1 END) +
				CASE WHEN needs_insurance THEN value * 0.02 ELSE 0 END`,
			variables: map[string]interface{}{
				"actual_weight":      3.0,
				"length":             60.0,
				"width":              40.0,
				"height":             30.0,
				"dimensional_factor": 5000.0,
				"base_rate":          2.5,
				"zone":               "international",
				"is_express":         true,
				"needs_insurance":    true,
				"value":              500.0,
			},
			expected: 100, // (14.4 * 2.5 * 2.5 * 2) + 10
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := calc.EvaluateExpression(tt.formula, tt.variables)
			require.NoError(t, err)
			assert.InDelta(t, tt.expected, result, 0.1, "Scenario: %s", tt.scenario)
		})
	}
}

// Condition represents a pricing condition (simplified for testing)
type Condition struct {
	Field    string
	Operator string
	Value    string
}

// PricingRule represents a pricing rule (simplified for testing)
type PricingRule struct {
	ID          int
	Name        string
	Formula     string
	Conditions  []string
	Priority    int
	Description string
	Category    string
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   sql.NullTime
}