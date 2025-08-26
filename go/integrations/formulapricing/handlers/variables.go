package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"

	"formulapricing/models"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func GetVariables(w http.ResponseWriter, r *http.Request) {
	variables, err := models.GetAllVariables()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch variables")
		return
	}

	respondWithJSON(w, http.StatusOK, variables)
}

func GetVariable(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid variable ID")
		return
	}

	variable, err := models.GetVariableByID(id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch variable")
		return
	}
	if variable == nil {
		respondWithError(w, http.StatusNotFound, "Variable not found")
		return
	}

	respondWithJSON(w, http.StatusOK, variable)
}

func CreateVariable(w http.ResponseWriter, r *http.Request) {
	var variable models.Variable
	if err := json.NewDecoder(r.Body).Decode(&variable); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if variable.VariableName == "" || variable.DisplayName == "" || variable.ValueType == "" {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: variable_name, display_name, value_type")
		return
	}

	// Validate value type
	if !isValidValueType(variable.ValueType) {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid value_type: %s", variable.ValueType))
		return
	}

	// Validate constraints based on type
	if err := validateConstraints(variable.ValueType, variable.Constraints); err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid constraints: %v", err))
		return
	}

	// Validate default value if provided
	if variable.DefaultValue != nil && *variable.DefaultValue != "" {
		if err := validateDefaultValue(variable.ValueType, *variable.DefaultValue, variable.Constraints); err != nil {
			respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid default value: %v", err))
			return
		}
	}

	if err := models.CreateVariable(&variable); err != nil {
		if err == models.ErrDuplicateKey {
			respondWithError(w, http.StatusConflict, "Variable with this name already exists")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to create variable")
		return
	}

	respondWithJSON(w, http.StatusCreated, variable)
}

func UpdateVariable(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid variable ID")
		return
	}

	var variable models.Variable
	if err := json.NewDecoder(r.Body).Decode(&variable); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if variable.VariableName == "" || variable.DisplayName == "" || variable.ValueType == "" {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: variable_name, display_name, value_type")
		return
	}

	// Validate value type
	if !isValidValueType(variable.ValueType) {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid value_type: %s", variable.ValueType))
		return
	}

	// Validate constraints based on type
	if err := validateConstraints(variable.ValueType, variable.Constraints); err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid constraints: %v", err))
		return
	}

	// Validate default value if provided
	if variable.DefaultValue != nil && *variable.DefaultValue != "" {
		if err := validateDefaultValue(variable.ValueType, *variable.DefaultValue, variable.Constraints); err != nil {
			respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid default value: %v", err))
			return
		}
	}

	if err := models.UpdateVariable(id, &variable); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Variable not found")
			return
		}
		if err == models.ErrDuplicateKey {
			respondWithError(w, http.StatusConflict, "Variable with this name already exists")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to update variable")
		return
	}

	respondWithJSON(w, http.StatusOK, variable)
}

func DeleteVariable(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid variable ID")
		return
	}

	if err := models.DeleteVariable(id); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Variable not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to delete variable")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Variable deleted successfully"})
}

// Helper functions for validation

func isValidValueType(valueType string) bool {
	for _, validType := range models.ValidValueTypes {
		if valueType == validType {
			return true
		}
	}
	return false
}

func validateConstraints(valueType string, constraints models.VariableConstraints) error {
	switch valueType {
	case "number":
		if min, ok := constraints["min"].(float64); ok {
			if max, ok := constraints["max"].(float64); ok {
				if min > max {
					return fmt.Errorf("min cannot be greater than max")
				}
			}
		}
		if step, ok := constraints["step"].(float64); ok {
			if step <= 0 {
				return fmt.Errorf("step must be positive")
			}
		}
		if precision, ok := constraints["precision"].(float64); ok {
			if precision < 0 || precision > 10 {
				return fmt.Errorf("precision must be between 0 and 10")
			}
		}

	case "text":
		if minLen, ok := constraints["minLength"].(float64); ok {
			if minLen < 0 {
				return fmt.Errorf("minLength cannot be negative")
			}
			if maxLen, ok := constraints["maxLength"].(float64); ok {
				if minLen > maxLen {
					return fmt.Errorf("minLength cannot be greater than maxLength")
				}
			}
		}
		if pattern, ok := constraints["pattern"].(string); ok {
			if _, err := regexp.Compile(pattern); err != nil {
				return fmt.Errorf("invalid regex pattern: %v", err)
			}
		}

	case "enum":
		values, ok := constraints["values"].([]interface{})
		if !ok || len(values) == 0 {
			return fmt.Errorf("enum type requires 'values' array in constraints")
		}

	case "array":
		if itemType, ok := constraints["itemType"].(string); ok {
			if !isValidValueType(itemType) {
				return fmt.Errorf("invalid array itemType: %s", itemType)
			}
		}
		if minItems, ok := constraints["minItems"].(float64); ok {
			if minItems < 0 {
				return fmt.Errorf("minItems cannot be negative")
			}
			if maxItems, ok := constraints["maxItems"].(float64); ok {
				if minItems > maxItems {
					return fmt.Errorf("minItems cannot be greater than maxItems")
				}
			}
		}

	case "char":
		if allowedChars, ok := constraints["allowedChars"].(string); ok {
			if _, err := regexp.Compile("[" + allowedChars + "]"); err != nil {
				return fmt.Errorf("invalid allowedChars pattern: %v", err)
			}
		}

	case "point":
		// Validate coordinate bounds if specified
		if minX, ok := constraints["minX"].(float64); ok {
			if maxX, ok := constraints["maxX"].(float64); ok {
				if minX > maxX {
					return fmt.Errorf("minX cannot be greater than maxX")
				}
			}
		}
		if minY, ok := constraints["minY"].(float64); ok {
			if maxY, ok := constraints["maxY"].(float64); ok {
				if minY > maxY {
					return fmt.Errorf("minY cannot be greater than maxY")
				}
			}
		}
	}

	return nil
}

func validateDefaultValue(valueType string, defaultValue string, constraints models.VariableConstraints) error {
	switch valueType {
	case "number":
		val, err := strconv.ParseFloat(defaultValue, 64)
		if err != nil {
			return fmt.Errorf("must be a valid number")
		}
		if min, ok := constraints["min"].(float64); ok && val < min {
			return fmt.Errorf("value must be >= %v", min)
		}
		if max, ok := constraints["max"].(float64); ok && val > max {
			return fmt.Errorf("value must be <= %v", max)
		}

	case "boolean":
		if defaultValue != "true" && defaultValue != "false" {
			return fmt.Errorf("must be 'true' or 'false'")
		}

	case "date":
		// Validate ISO 8601 date format YYYY-MM-DD
		dateRegex := regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
		if !dateRegex.MatchString(defaultValue) {
			return fmt.Errorf("must be in ISO 8601 date format (YYYY-MM-DD)")
		}

	case "datetime":
		// Validate ISO 8601 datetime format
		datetimeRegex := regexp.MustCompile(`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}`)
		if !datetimeRegex.MatchString(defaultValue) {
			return fmt.Errorf("must be in ISO 8601 datetime format (YYYY-MM-DDTHH:MM:SS)")
		}

	case "enum":
		if values, ok := constraints["values"].([]interface{}); ok {
			found := false
			for _, v := range values {
				if fmt.Sprintf("%v", v) == defaultValue {
					found = true
					break
				}
			}
			if !found {
				return fmt.Errorf("must be one of the enum values")
			}
		}

	case "char":
		if len(defaultValue) != 1 {
			return fmt.Errorf("must be a single character")
		}
		if allowedChars, ok := constraints["allowedChars"].(string); ok {
			pattern := regexp.MustCompile("[" + allowedChars + "]")
			if !pattern.MatchString(defaultValue) {
				return fmt.Errorf("character not in allowed set")
			}
		}

	case "array":
		// For arrays, we expect JSON array format
		var arr []interface{}
		if err := json.Unmarshal([]byte(defaultValue), &arr); err != nil {
			return fmt.Errorf("must be a valid JSON array")
		}

	case "point":
		// Expect format: "x,y" or JSON: {"x": 0, "y": 0}
		pointRegex := regexp.MustCompile(`^-?\d+(\.\d+)?,-?\d+(\.\d+)?$`)
		if !pointRegex.MatchString(defaultValue) {
			// Try parsing as JSON
			var point map[string]float64
			if err := json.Unmarshal([]byte(defaultValue), &point); err != nil {
				return fmt.Errorf("must be in format 'x,y' or valid JSON point")
			}
			if _, hasX := point["x"]; !hasX {
				return fmt.Errorf("point must have 'x' coordinate")
			}
			if _, hasY := point["y"]; !hasY {
				return fmt.Errorf("point must have 'y' coordinate")
			}
		}
	}

	return nil
}