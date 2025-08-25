package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"formula-pricing/database"
	"formula-pricing/engine"
	"formula-pricing/models"
)

type CalculateRequest struct {
	PricingName string                 `json:"pricing_name"`
	Variables   map[string]interface{} `json:"variables"`
}

type VariableInfo struct {
	Name        string                 `json:"name"`
	DisplayName string                 `json:"display_name"`
	Description string                 `json:"description"`
	Value       interface{}            `json:"value"`
	ValueType   string                 `json:"value_type"`
	Constraints map[string]interface{} `json:"constraints,omitempty"`
	IsCalculation bool                 `json:"is_calculation,omitempty"`
}

type CalculationResult struct {
	ConditionName      string          `json:"condition_name"`
	ConditionMet       bool            `json:"condition_met"`
	CalculationName    string          `json:"calculation_name"`
	DisplayName        string          `json:"display_name"`
	Value              float64         `json:"value"`
	Formula            []string        `json:"formula,omitempty"`
	ResolvedFormula    string          `json:"resolved_formula,omitempty"`
	CalculationSteps   string          `json:"calculation_steps,omitempty"`
	UsedVariables      []VariableInfo  `json:"used_variables,omitempty"`
	Error              string          `json:"error,omitempty"`
}

type CalculateResponse struct {
	Results       []CalculationResult    `json:"results"`
	Total         float64                `json:"total"`
	Summary       map[string]interface{} `json:"summary"`
	AllVariables  []VariableInfo         `json:"all_variables,omitempty"`
}

func Calculate(w http.ResponseWriter, r *http.Request) {
	var req CalculateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.PricingName == "" || req.Variables == nil {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: pricing_name, variables")
		return
	}

	// Get the pricing configuration
	pricing, err := models.GetPricingByName(database.DB, req.PricingName)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch pricing configuration")
		return
	}
	if pricing == nil {
		respondWithError(w, http.StatusNotFound, fmt.Sprintf("Pricing configuration '%s' not found", req.PricingName))
		return
	}

	// Get all calculations and conditions
	calculations, err := models.GetAllCalculations(database.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch calculations")
		return
	}

	conditions, err := models.GetAllConditions(database.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch conditions")
		return
	}

	// Get all variables for metadata
	allVariables, err := models.GetAllVariables(database.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch variables")
		return
	}

	// Create a map for quick variable lookup
	variableMap := make(map[string]models.Variable)
	for _, v := range allVariables {
		variableMap[v.VariableName] = v
	}

	// Create a map for quick calculation lookup
	calculationMap := make(map[string]models.Calculation)
	for _, c := range calculations {
		calculationMap[c.CalculationName] = c
	}

	// Create calculator and load data
	calc := engine.NewCalculator()
	
	// Set variables from request
	for name, value := range req.Variables {
		calc.SetVariable(name, value)
	}

	// Load calculations
	for _, c := range calculations {
		calc.SetCalculation(c.CalculationName, c.Calculation)
	}

	// Load conditions
	for _, c := range conditions {
		calc.SetCondition(c.ConditionName, c.Condition)
	}

	// Process pricing rules
	var results []CalculationResult
	total := 0.0
	summary := make(map[string]interface{})

	// Reset runningTotal at the start
	calc.ResetRunningTotal()

	for _, rule := range pricing.Pricing {
		// Evaluate condition
		conditionMet, err := calc.EvaluateCondition(rule.Condition)
		if err != nil {
			results = append(results, CalculationResult{
				ConditionName:   rule.Condition,
				ConditionMet:    false,
				CalculationName: rule.Calculation,
				Error:           fmt.Sprintf("Failed to evaluate condition: %v", err),
			})
			continue
		}

		result := CalculationResult{
			ConditionName:   rule.Condition,
			ConditionMet:    conditionMet,
			CalculationName: rule.Calculation,
		}

		if conditionMet {
			// Find the calculation and its formula
			var calculationFormula []string
			for _, c := range calculations {
				if c.CalculationName == rule.Calculation {
					result.DisplayName = c.DisplayName
					result.Formula = c.Calculation
					calculationFormula = c.Calculation
					break
				}
			}

			// Build resolved formula and calculation steps
			if len(calculationFormula) > 0 {
				resolvedParts := []string{}
				stepsParts := []string{}
				usedVars := []VariableInfo{}
				
				for _, part := range calculationFormula {
					// Check if it's a variable
					if val, exists := req.Variables[part]; exists {
						resolvedParts = append(resolvedParts, fmt.Sprintf("%v", val))
						stepsParts = append(stepsParts, fmt.Sprintf("%s=%v", part, val))
						
						// Add variable info
						if varMeta, found := variableMap[part]; found {
							varInfo := VariableInfo{
								Name:        part,
								DisplayName: varMeta.DisplayName,
								Description: "",
								Value:       val,
								ValueType:   varMeta.ValueType,
								Constraints: varMeta.Constraints,
							}
							if varMeta.Description != nil {
								varInfo.Description = *varMeta.Description
							}
							usedVars = append(usedVars, varInfo)
						}
					} else if calc.HasVariable(part) {
						// Check if it's a calculated variable
						if calcVal, err := calc.GetVariable(part); err == nil {
							resolvedParts = append(resolvedParts, fmt.Sprintf("%v", calcVal))
							stepsParts = append(stepsParts, fmt.Sprintf("%s=%v", part, calcVal))
							
							// Check if it's a variable or a calculation
							if varMeta, found := variableMap[part]; found {
								// It's a regular variable
								varInfo := VariableInfo{
									Name:        part,
									DisplayName: varMeta.DisplayName,
									Description: "",
									Value:       calcVal,
									ValueType:   varMeta.ValueType,
									Constraints: varMeta.Constraints,
								}
								if varMeta.Description != nil {
									varInfo.Description = *varMeta.Description
								}
								usedVars = append(usedVars, varInfo)
							} else if calcMeta, found := calculationMap[part]; found {
								// It's a calculation reference
								varInfo := VariableInfo{
									Name:        part,
									DisplayName: calcMeta.DisplayName,
									Description: "",
									Value:       calcVal,
									ValueType:   "calculation",
									IsCalculation: true,
								}
								if calcMeta.Description != nil {
									varInfo.Description = *calcMeta.Description
								}
								usedVars = append(usedVars, varInfo)
							}
						} else {
							resolvedParts = append(resolvedParts, part)
						}
					} else if calcMeta, found := calculationMap[part]; found {
						// It's a calculation that hasn't been computed yet
						// Try to calculate it
						if calcVal, err := calc.Calculate(part); err == nil {
							resolvedParts = append(resolvedParts, fmt.Sprintf("%v", calcVal))
							stepsParts = append(stepsParts, fmt.Sprintf("%s=%v", part, calcVal))
							
							varInfo := VariableInfo{
								Name:        part,
								DisplayName: calcMeta.DisplayName,
								Description: "",
								Value:       calcVal,
								ValueType:   "calculation",
								IsCalculation: true,
							}
							if calcMeta.Description != nil {
								varInfo.Description = *calcMeta.Description
							}
							usedVars = append(usedVars, varInfo)
						} else {
							// Can't calculate, just show the name
							resolvedParts = append(resolvedParts, part)
						}
					} else {
						// It's an operator or literal
						resolvedParts = append(resolvedParts, part)
					}
				}
				
				result.ResolvedFormula = strings.Join(resolvedParts, " ")
				if len(stepsParts) > 0 {
					result.CalculationSteps = strings.Join(stepsParts, ", ")
				}
				result.UsedVariables = usedVars
			}

			// Perform calculation
			value, err := calc.Calculate(rule.Calculation)
			if err != nil {
				result.Error = fmt.Sprintf("Failed to calculate: %v", err)
			} else {
				result.Value = value
				total += value
				
				// Update the runningTotal system variable after each successful calculation
				calc.AddToRunningTotal(value)
				
				// Add to summary
				summary[rule.Calculation] = map[string]interface{}{
					"display_name":    result.DisplayName,
					"value":           value,
					"formula":         result.Formula,
					"resolved":        result.ResolvedFormula,
				}
			}
		}

		results = append(results, result)
	}

	// Create response
	response := CalculateResponse{
		Results: results,
		Total:   total,
		Summary: summary,
	}

	respondWithJSON(w, http.StatusOK, response)
}