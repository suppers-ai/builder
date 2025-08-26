package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"formulapricing/database"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type PricingRule struct {
	Condition   string `json:"condition"`
	Calculation string `json:"calculation"`
}

type Pricing struct {
	ID          uuid.UUID     `json:"id"`
	Name        string        `json:"name"`
	Description *string       `json:"description,omitempty"`
	Pricing     []PricingRule `json:"pricing"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

func GetAllPricings() ([]Pricing, error) {
	query := `
		SELECT id, name, description, pricing, created_at, updated_at
		FROM formulapricing.pricing
		ORDER BY name
	`
	
	ctx := context.Background()
	rows, err := database.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pricings []Pricing
	for rows.Next() {
		var p Pricing
		var pricingJSON []byte
		err := rows.Scan(&p.ID, &p.Name, &p.Description, &pricingJSON, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		
		if err := json.Unmarshal(pricingJSON, &p.Pricing); err != nil {
			return nil, err
		}
		
		pricings = append(pricings, p)
	}

	return pricings, nil
}

func GetPricingByID(id uuid.UUID) (*Pricing, error) {
	query := `
		SELECT id, name, description, pricing, created_at, updated_at
		FROM formulapricing.pricing
		WHERE id = $1
	`
	
	var p Pricing
	var pricingJSON []byte
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, id)
	err := row.Scan(&p.ID, &p.Name, &p.Description, &pricingJSON, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	
	if err := json.Unmarshal(pricingJSON, &p.Pricing); err != nil {
		return nil, err
	}

	return &p, nil
}

func GetPricingByName(name string) (*Pricing, error) {
	query := `
		SELECT id, name, description, pricing, created_at, updated_at
		FROM formulapricing.pricing
		WHERE name = $1
	`
	
	var p Pricing
	var pricingJSON []byte
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, name)
	err := row.Scan(&p.ID, &p.Name, &p.Description, &pricingJSON, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	
	if err := json.Unmarshal(pricingJSON, &p.Pricing); err != nil {
		return nil, err
	}

	return &p, nil
}

func CreatePricing(p *Pricing) error {
	pricingJSON, err := json.Marshal(p.Pricing)
	if err != nil {
		return err
	}
	
	query := `
		INSERT INTO formulapricing.pricing (name, description, pricing)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`
	
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, p.Name, p.Description, pricingJSON)
	err = row.Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return err
	}

	return nil
}

func UpdatePricing(id uuid.UUID, p *Pricing) error {
	pricingJSON, err := json.Marshal(p.Pricing)
	if err != nil {
		return err
	}
	
	query := `
		UPDATE formulapricing.pricing
		SET name = $2, description = $3, pricing = $4
		WHERE id = $1
		RETURNING updated_at
	`
	
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, id, p.Name, p.Description, pricingJSON)
	err = row.Scan(&p.UpdatedAt)
	if err == sql.ErrNoRows {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	
	p.ID = id
	return nil
}

func DeletePricing(id uuid.UUID) error {
	query := `DELETE FROM formulapricing.pricing WHERE id = $1`
	
	ctx := context.Background()
	result, err := database.DB.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

// GetRequiredVariablesForPricing analyzes a pricing strategy and returns all variables it needs
func GetRequiredVariablesForPricing(pricing *Pricing) ([]Variable, error) {
	if pricing == nil {
		return nil, nil
	}
	
	// Collect all unique variable names from conditions and calculations
	variableNames := make(map[string]bool)
	
	for _, rule := range pricing.Pricing {
		// Get variables from the condition
		if rule.Condition != "" && rule.Condition != "always" {
			condition, err := GetConditionByName(rule.Condition)
			if err == nil && condition != nil {
				// Parse condition array to find variable references
				for _, elem := range condition.Condition {
					// Check if it's a variable name (not an operator or value)
					if !isOperator(elem) && !isLiteral(elem) {
						variableNames[elem] = true
					}
				}
			}
		}
		
		// Get variables from the calculation
		if rule.Calculation != "" {
			calculation, err := GetCalculationByName(rule.Calculation)
			if err == nil && calculation != nil {
				// Parse calculation array to find variable references
				for _, elem := range calculation.Calculation {
					// Check if it's a variable name (not an operator or value)
					if !isOperator(elem) && !isLiteral(elem) {
						// Check if it's a variable or another calculation
						if v, err := GetVariableByName(elem); err == nil && v != nil {
							variableNames[elem] = true
						} else if c, err := GetCalculationByName(elem); err == nil && c != nil {
							// Recursively get variables from referenced calculations
							for _, calcElem := range c.Calculation {
								if !isOperator(calcElem) && !isLiteral(calcElem) {
									variableNames[calcElem] = true
								}
							}
						}
					}
				}
			}
		}
	}
	
	// Fetch all the variables
	var variables []Variable
	for name := range variableNames {
		if v, err := GetVariableByName(name); err == nil && v != nil {
			variables = append(variables, *v)
		}
	}
	
	// Sort by is_unique (system variables first) then by name
	// This is already handled in GetAllVariables, but we need to do it here too
	for i := 0; i < len(variables); i++ {
		for j := i + 1; j < len(variables); j++ {
			if (!variables[i].IsUnique && variables[j].IsUnique) ||
				(variables[i].IsUnique == variables[j].IsUnique && variables[i].VariableName > variables[j].VariableName) {
				variables[i], variables[j] = variables[j], variables[i]
			}
		}
	}
	
	return variables, nil
}

func isOperator(s string) bool {
	operators := []string{"+", "-", "*", "/", "(", ")", ">", "<", ">=", "<=", "==", "!=", "&&", "||"}
	for _, op := range operators {
		if s == op {
			return true
		}
	}
	return false
}

func isLiteral(s string) bool {
	// Check if it's a number
	if _, err := strconv.ParseFloat(s, 64); err == nil {
		return true
	}
	// Check if it's a boolean
	if s == "true" || s == "false" {
		return true
	}
	// Check if it's a quoted string
	if (strings.HasPrefix(s, "\"") && strings.HasSuffix(s, "\"")) ||
		(strings.HasPrefix(s, "'") && strings.HasSuffix(s, "'")) {
		return true
	}
	return false
}