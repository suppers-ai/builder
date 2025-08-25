package engine

import (
	"fmt"
	"strconv"
	"strings"
)

type Calculator struct {
	variables       map[string]interface{}
	systemVariables map[string]interface{} // Special variables managed by the engine
	calculations    map[string][]string
	conditions      map[string][]string
}

func NewCalculator() *Calculator {
	calc := &Calculator{
		variables:       make(map[string]interface{}),
		systemVariables: make(map[string]interface{}),
		calculations:    make(map[string][]string),
		conditions:      make(map[string][]string),
	}
	// Initialize system variables
	calc.systemVariables["runningTotal"] = 0.0
	calc.systemVariables["previousTotal"] = 0.0
	return calc
}

func (c *Calculator) SetVariable(name string, value interface{}) {
	c.variables[name] = value
}

func (c *Calculator) GetSystemVariable(name string) (interface{}, bool) {
	val, exists := c.systemVariables[name]
	return val, exists
}

func (c *Calculator) UpdateSystemVariable(name string, value interface{}) {
	c.systemVariables[name] = value
}

func (c *Calculator) AddToRunningTotal(value float64) {
	current, _ := toFloat(c.systemVariables["runningTotal"])
	c.systemVariables["previousTotal"] = current
	c.systemVariables["runningTotal"] = current + value
}

func (c *Calculator) ResetRunningTotal() {
	c.systemVariables["runningTotal"] = 0.0
	c.systemVariables["previousTotal"] = 0.0
}

func (c *Calculator) SetCalculation(name string, formula []string) {
	c.calculations[name] = formula
}

func (c *Calculator) SetCondition(name string, condition []string) {
	c.conditions[name] = condition
}

func (c *Calculator) HasVariable(name string) bool {
	_, exists := c.variables[name]
	if !exists {
		_, exists = c.systemVariables[name]
	}
	return exists
}

func (c *Calculator) GetVariable(name string) (interface{}, error) {
	if val, exists := c.variables[name]; exists {
		return val, nil
	}
	if val, exists := c.systemVariables[name]; exists {
		return val, nil
	}
	return nil, fmt.Errorf("variable '%s' not found", name)
}

func (c *Calculator) EvaluateCondition(conditionName string) (bool, error) {
	condition, exists := c.conditions[conditionName]
	if !exists {
		// Check if it's a special condition
		if conditionName == "always" || conditionName == "true" {
			return true, nil
		}
		return false, fmt.Errorf("condition '%s' not found", conditionName)
	}

	return c.evaluateConditionArray(condition)
}

func (c *Calculator) evaluateConditionArray(condition []string) (bool, error) {
	// Handle single boolean conditions like ["true"] or ["false"]
	if len(condition) == 1 {
		if condition[0] == "true" {
			return true, nil
		}
		if condition[0] == "false" {
			return false, nil
		}
		// Try to resolve as a variable
		val := c.resolveValue(condition[0])
		if boolVal, ok := val.(bool); ok {
			return boolVal, nil
		}
		return false, fmt.Errorf("invalid single condition: %s", condition[0])
	}
	
	if len(condition) < 3 {
		return false, fmt.Errorf("invalid condition format: %v", condition)
	}

	left := c.resolveValue(condition[0])
	operator := condition[1]
	right := c.resolveValue(condition[2])

	leftFloat, leftIsFloat := toFloat(left)
	rightFloat, rightIsFloat := toFloat(right)

	switch operator {
	case ">":
		if leftIsFloat && rightIsFloat {
			return leftFloat > rightFloat, nil
		}
	case ">=":
		if leftIsFloat && rightIsFloat {
			return leftFloat >= rightFloat, nil
		}
	case "<":
		if leftIsFloat && rightIsFloat {
			return leftFloat < rightFloat, nil
		}
	case "<=":
		if leftIsFloat && rightIsFloat {
			return leftFloat <= rightFloat, nil
		}
	case "==", "=":
		if leftIsFloat && rightIsFloat {
			return leftFloat == rightFloat, nil
		}
		return fmt.Sprintf("%v", left) == fmt.Sprintf("%v", right), nil
	case "!=", "<>":
		if leftIsFloat && rightIsFloat {
			return leftFloat != rightFloat, nil
		}
		return fmt.Sprintf("%v", left) != fmt.Sprintf("%v", right), nil
	default:
		return false, fmt.Errorf("unknown operator: %s", operator)
	}

	return false, nil
}

func (c *Calculator) Calculate(calculationName string) (float64, error) {
	calculation, exists := c.calculations[calculationName]
	if !exists {
		// Try to resolve as a variable
		if val, ok := c.variables[calculationName]; ok {
			if floatVal, ok := toFloat(val); ok {
				return floatVal, nil
			}
		}
		return 0, fmt.Errorf("calculation '%s' not found", calculationName)
	}

	return c.evaluateFormula(calculation)
}

func (c *Calculator) evaluateFormula(formula []string) (float64, error) {
	if len(formula) == 0 {
		return 0, fmt.Errorf("empty formula")
	}

	// Convert tokens to values first
	values := []interface{}{}
	for _, token := range formula {
		if isOperator(token) {
			values = append(values, token)
		} else {
			value := c.resolveValue(token)
			if floatVal, ok := toFloat(value); ok {
				values = append(values, floatVal)
			} else if calcResult, err := c.Calculate(token); err == nil {
				values = append(values, calcResult)
			} else {
				return 0, fmt.Errorf("cannot convert '%v' to number", value)
			}
		}
	}

	// Handle operator precedence (multiplication and division first)
	// First pass: handle * and /
	for i := 0; i < len(values); i++ {
		if op, ok := values[i].(string); ok && (op == "*" || op == "/") {
			if i == 0 || i == len(values)-1 {
				return 0, fmt.Errorf("invalid operator position")
			}
			
			left, leftOk := values[i-1].(float64)
			right, rightOk := values[i+1].(float64)
			
			if !leftOk || !rightOk {
				return 0, fmt.Errorf("invalid operands for %s", op)
			}
			
			var result float64
			if op == "*" {
				result = left * right
			} else {
				if right == 0 {
					return 0, fmt.Errorf("division by zero")
				}
				result = left / right
			}
			
			// Replace the three elements with the result
			newValues := append(values[:i-1], result)
			values = append(newValues, values[i+2:]...)
			i-- // Adjust index after removal
		}
	}
	
	// Second pass: handle + and -
	result := 0.0
	currentOp := "+"
	
	for _, val := range values {
		switch v := val.(type) {
		case float64:
			switch currentOp {
			case "+":
				result += v
			case "-":
				result -= v
			default:
				result = v
			}
		case string:
			if v == "+" || v == "-" {
				currentOp = v
			} else {
				return 0, fmt.Errorf("unexpected operator: %s", v)
			}
		}
	}
	
	return result, nil
}

func (c *Calculator) resolveValue(token string) interface{} {
	// Check if it's a system variable first
	if val, exists := c.systemVariables[token]; exists {
		return val
	}
	
	// Check if it's a regular variable
	if val, exists := c.variables[token]; exists {
		return val
	}
	
	// Check if it's a number
	if floatVal, err := strconv.ParseFloat(token, 64); err == nil {
		return floatVal
	}
	
	// Check if it's a boolean
	if strings.ToLower(token) == "true" {
		return true
	}
	if strings.ToLower(token) == "false" {
		return false
	}
	
	// Return as string
	return token
}

func isOperator(token string) bool {
	return token == "+" || token == "-" || token == "*" || token == "/"
}

func toFloat(val interface{}) (float64, bool) {
	switch v := val.(type) {
	case float64:
		return v, true
	case float32:
		return float64(v), true
	case int:
		return float64(v), true
	case int64:
		return float64(v), true
	case string:
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			return f, true
		}
	case bool:
		if v {
			return 1, true
		}
		return 0, true
	}
	return 0, false
}