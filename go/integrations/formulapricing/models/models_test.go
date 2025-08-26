package models

import (
	"database/sql"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestVariable_Validate(t *testing.T) {
	tests := []struct {
		name    string
		variable Variable
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid number variable",
			variable: Variable{
				Name:         "test_var",
				Type:         "number",
				DefaultValue: "100",
				Description:  "Test variable",
				Category:     "test",
			},
			wantErr: false,
		},
		{
			name: "valid string variable",
			variable: Variable{
				Name:         "customer_type",
				Type:         "string",
				DefaultValue: "retail",
				Description:  "Customer type",
				Category:     "customer",
			},
			wantErr: false,
		},
		{
			name: "valid boolean variable",
			variable: Variable{
				Name:         "is_vip",
				Type:         "boolean",
				DefaultValue: "false",
				Description:  "VIP status",
				Category:     "customer",
			},
			wantErr: false,
		},
		{
			name: "valid date variable",
			variable: Variable{
				Name:         "order_date",
				Type:         "date",
				DefaultValue: "2024-01-01",
				Description:  "Order date",
				Category:     "order",
			},
			wantErr: false,
		},
		{
			name: "missing name",
			variable: Variable{
				Type:         "number",
				DefaultValue: "0",
			},
			wantErr: true,
			errMsg:  "name is required",
		},
		{
			name: "invalid type",
			variable: Variable{
				Name:         "test",
				Type:         "invalid",
				DefaultValue: "0",
			},
			wantErr: true,
			errMsg:  "invalid type",
		},
		{
			name: "invalid number default",
			variable: Variable{
				Name:         "test",
				Type:         "number",
				DefaultValue: "not_a_number",
			},
			wantErr: true,
			errMsg:  "invalid number format",
		},
		{
			name: "invalid boolean default",
			variable: Variable{
				Name:         "test",
				Type:         "boolean",
				DefaultValue: "yes",
			},
			wantErr: true,
			errMsg:  "invalid boolean format",
		},
		{
			name: "invalid date default",
			variable: Variable{
				Name:         "test",
				Type:         "date",
				DefaultValue: "not_a_date",
			},
			wantErr: true,
			errMsg:  "invalid date format",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.variable.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestCondition_Validate(t *testing.T) {
	tests := []struct {
		name      string
		condition Condition
		wantErr   bool
		errMsg    string
	}{
		{
			name: "valid equals condition",
			condition: Condition{
				Name:     "is_vip",
				Field:    "customer_type",
				Operator: "=",
				Value:    "vip",
			},
			wantErr: false,
		},
		{
			name: "valid greater than condition",
			condition: Condition{
				Name:     "bulk_order",
				Field:    "quantity",
				Operator: ">",
				Value:    "10",
			},
			wantErr: false,
		},
		{
			name: "valid in operator",
			condition: Condition{
				Name:     "premium_brand",
				Field:    "brand",
				Operator: "in",
				Value:    `["Brand1","Brand2"]`,
			},
			wantErr: false,
		},
		{
			name: "missing name",
			condition: Condition{
				Field:    "test",
				Operator: "=",
				Value:    "value",
			},
			wantErr: true,
			errMsg:  "name is required",
		},
		{
			name: "invalid operator",
			condition: Condition{
				Name:     "test",
				Field:    "field",
				Operator: "invalid",
				Value:    "value",
			},
			wantErr: true,
			errMsg:  "invalid operator",
		},
		{
			name: "invalid in operator value",
			condition: Condition{
				Name:     "test",
				Field:    "field",
				Operator: "in",
				Value:    "not_json_array",
			},
			wantErr: true,
			errMsg:  "value must be JSON array for 'in' operator",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.condition.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestCalculation_Validate(t *testing.T) {
	tests := []struct {
		name        string
		calculation Calculation
		wantErr     bool
		errMsg      string
	}{
		{
			name: "valid simple calculation",
			calculation: Calculation{
				Name:        "markup",
				Formula:     "cost_price * 1.5",
				Description: "50% markup",
				Category:    "pricing",
			},
			wantErr: false,
		},
		{
			name: "valid complex calculation",
			calculation: Calculation{
				Name:    "tiered_discount",
				Formula: "CASE WHEN quantity >= 100 THEN price * 0.7 ELSE price END",
			},
			wantErr: false,
		},
		{
			name: "missing name",
			calculation: Calculation{
				Formula: "price * 2",
			},
			wantErr: true,
			errMsg:  "name is required",
		},
		{
			name: "missing formula",
			calculation: Calculation{
				Name: "test",
			},
			wantErr: true,
			errMsg:  "formula is required",
		},
		{
			name: "empty formula",
			calculation: Calculation{
				Name:    "test",
				Formula: "   ",
			},
			wantErr: true,
			errMsg:  "formula is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.calculation.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestPricingRule_Validate(t *testing.T) {
	tests := []struct {
		name    string
		rule    PricingRule
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid rule without conditions",
			rule: PricingRule{
				Name:     "standard_price",
				Formula:  "base_price",
				Priority: 100,
				IsActive: true,
			},
			wantErr: false,
		},
		{
			name: "valid rule with conditions",
			rule: PricingRule{
				Name:       "vip_price",
				Formula:    "base_price * 0.8",
				Conditions: []string{"is_vip_customer"},
				Priority:   90,
				IsActive:   true,
			},
			wantErr: false,
		},
		{
			name: "missing name",
			rule: PricingRule{
				Formula:  "base_price",
				Priority: 100,
			},
			wantErr: true,
			errMsg:  "name is required",
		},
		{
			name: "missing formula",
			rule: PricingRule{
				Name:     "test",
				Priority: 100,
			},
			wantErr: true,
			errMsg:  "formula is required",
		},
		{
			name: "negative priority",
			rule: PricingRule{
				Name:     "test",
				Formula:  "base_price",
				Priority: -1,
			},
			wantErr: true,
			errMsg:  "priority must be positive",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.rule.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestPricingRule_ShouldApply(t *testing.T) {
	tests := []struct {
		name              string
		rule              PricingRule
		conditionsMet     bool
		expectedShouldApply bool
	}{
		{
			name: "active rule with met conditions",
			rule: PricingRule{
				IsActive:   true,
				Conditions: []string{"is_vip"},
			},
			conditionsMet:     true,
			expectedShouldApply: true,
		},
		{
			name: "active rule without conditions",
			rule: PricingRule{
				IsActive:   true,
				Conditions: []string{},
			},
			conditionsMet:     false,
			expectedShouldApply: true,
		},
		{
			name: "inactive rule",
			rule: PricingRule{
				IsActive:   false,
				Conditions: []string{},
			},
			conditionsMet:     true,
			expectedShouldApply: false,
		},
		{
			name: "active rule with unmet conditions",
			rule: PricingRule{
				IsActive:   true,
				Conditions: []string{"is_vip"},
			},
			conditionsMet:     false,
			expectedShouldApply: false,
		},
		{
			name: "deleted rule",
			rule: PricingRule{
				IsActive:  true,
				DeletedAt: sql.NullTime{Time: time.Now(), Valid: true},
			},
			conditionsMet:     true,
			expectedShouldApply: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.rule.ShouldApply(tt.conditionsMet)
			assert.Equal(t, tt.expectedShouldApply, result)
		})
	}
}

func TestPricingRule_Priority(t *testing.T) {
	rules := []PricingRule{
		{Name: "low_priority", Priority: 100},
		{Name: "high_priority", Priority: 50},
		{Name: "medium_priority", Priority: 75},
	}

	// Sort by priority (lower number = higher priority)
	sortedRules := SortRulesByPriority(rules)

	assert.Equal(t, "high_priority", sortedRules[0].Name)
	assert.Equal(t, "medium_priority", sortedRules[1].Name)
	assert.Equal(t, "low_priority", sortedRules[2].Name)
}

func TestGetVariableValue(t *testing.T) {
	variables := map[string]interface{}{
		"number_var":  42.5,
		"string_var":  "test",
		"bool_var":    true,
		"int_var":     100,
		"nil_var":     nil,
	}

	tests := []struct {
		name         string
		variableName string
		expected     interface{}
		shouldExist  bool
	}{
		{
			name:         "existing number",
			variableName: "number_var",
			expected:     42.5,
			shouldExist:  true,
		},
		{
			name:         "existing string",
			variableName: "string_var",
			expected:     "test",
			shouldExist:  true,
		},
		{
			name:         "existing boolean",
			variableName: "bool_var",
			expected:     true,
			shouldExist:  true,
		},
		{
			name:         "non-existing variable",
			variableName: "missing_var",
			expected:     nil,
			shouldExist:  false,
		},
		{
			name:         "nil value",
			variableName: "nil_var",
			expected:     nil,
			shouldExist:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			value, exists := GetVariableValue(variables, tt.variableName)
			assert.Equal(t, tt.shouldExist, exists)
			assert.Equal(t, tt.expected, value)
		})
	}
}

func TestConvertToFloat(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected float64
		wantErr  bool
	}{
		{
			name:     "float64",
			input:    42.5,
			expected: 42.5,
		},
		{
			name:     "int",
			input:    100,
			expected: 100.0,
		},
		{
			name:     "int32",
			input:    int32(50),
			expected: 50.0,
		},
		{
			name:     "int64",
			input:    int64(75),
			expected: 75.0,
		},
		{
			name:     "string number",
			input:    "123.45",
			expected: 123.45,
		},
		{
			name:     "boolean true",
			input:    true,
			expected: 1.0,
		},
		{
			name:     "boolean false",
			input:    false,
			expected: 0.0,
		},
		{
			name:    "invalid string",
			input:   "not_a_number",
			wantErr: true,
		},
		{
			name:    "nil",
			input:   nil,
			wantErr: true,
		},
		{
			name:    "unsupported type",
			input:   []int{1, 2, 3},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := ConvertToFloat(tt.input)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				require.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

// Helper function for testing
func SortRulesByPriority(rules []PricingRule) []PricingRule {
	// Create a copy to avoid modifying the original
	sorted := make([]PricingRule, len(rules))
	copy(sorted, rules)
	
	// Simple bubble sort for testing
	for i := 0; i < len(sorted)-1; i++ {
		for j := 0; j < len(sorted)-i-1; j++ {
			if sorted[j].Priority > sorted[j+1].Priority {
				sorted[j], sorted[j+1] = sorted[j+1], sorted[j]
			}
		}
	}
	
	return sorted
}

// Helper functions that would be in the actual models package
func GetVariableValue(variables map[string]interface{}, name string) (interface{}, bool) {
	value, exists := variables[name]
	return value, exists
}

func ConvertToFloat(value interface{}) (float64, error) {
	switch v := value.(type) {
	case float64:
		return v, nil
	case float32:
		return float64(v), nil
	case int:
		return float64(v), nil
	case int32:
		return float64(v), nil
	case int64:
		return float64(v), nil
	case string:
		var f float64
		_, err := fmt.Sscanf(v, "%f", &f)
		if err != nil {
			return 0, fmt.Errorf("cannot convert string '%s' to float: %w", v, err)
		}
		return f, nil
	case bool:
		if v {
			return 1.0, nil
		}
		return 0.0, nil
	default:
		return 0, fmt.Errorf("unsupported type for conversion: %T", value)
	}
}