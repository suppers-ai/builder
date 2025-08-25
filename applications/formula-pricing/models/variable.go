package models

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// VariableConstraints represents type-specific constraints for variables
type VariableConstraints map[string]interface{}

// Scan implements the sql.Scanner interface for JSONB
func (vc *VariableConstraints) Scan(value interface{}) error {
	if value == nil {
		*vc = make(VariableConstraints)
		return nil
	}
	
	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, vc)
	case string:
		return json.Unmarshal([]byte(v), vc)
	default:
		*vc = make(VariableConstraints)
		return nil
	}
}

// Value implements the driver.Valuer interface for JSONB
func (vc VariableConstraints) Value() (driver.Value, error) {
	if vc == nil || len(vc) == 0 {
		return "{}", nil
	}
	return json.Marshal(vc)
}

type Variable struct {
	ID             uuid.UUID           `json:"id"`
	VariableName   string              `json:"variable_name"`
	DisplayName    string              `json:"display_name"`
	Description    *string             `json:"description,omitempty"`
	ValueType      string              `json:"value_type"`
	DefaultValue   *string             `json:"default_value,omitempty"`
	IsUnique       bool                `json:"is_unique"`
	UniqueBehavior *string             `json:"unique_behavior,omitempty"`
	Constraints    VariableConstraints `json:"constraints"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
}

// ValidValueTypes contains all valid variable types
var ValidValueTypes = []string{
	"text", "number", "boolean", "date", "datetime", 
	"enum", "char", "array", "point",
}

func GetAllVariables(db *sql.DB) ([]Variable, error) {
	query := `
		SELECT id, variable_name, display_name, description, value_type, 
		       default_value, COALESCE(is_unique, false) as is_unique, unique_behavior,
		       COALESCE(constraints, '{}') as constraints,
		       created_at, updated_at
		FROM formulapricing.variables
		ORDER BY is_unique DESC, variable_name
	`
	
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variables []Variable
	for rows.Next() {
		var v Variable
		err := rows.Scan(&v.ID, &v.VariableName, &v.DisplayName, &v.Description, &v.ValueType, 
			&v.DefaultValue, &v.IsUnique, &v.UniqueBehavior, &v.Constraints,
			&v.CreatedAt, &v.UpdatedAt)
		if err != nil {
			return nil, err
		}
		variables = append(variables, v)
	}

	return variables, nil
}

func GetVariableByID(db *sql.DB, id uuid.UUID) (*Variable, error) {
	query := `
		SELECT id, variable_name, display_name, description, value_type, 
		       default_value, COALESCE(is_unique, false) as is_unique, unique_behavior,
		       COALESCE(constraints, '{}') as constraints,
		       created_at, updated_at
		FROM formulapricing.variables
		WHERE id = $1
	`
	
	var v Variable
	err := db.QueryRow(query, id).Scan(&v.ID, &v.VariableName, &v.DisplayName, &v.Description, &v.ValueType, 
		&v.DefaultValue, &v.IsUnique, &v.UniqueBehavior, &v.Constraints,
		&v.CreatedAt, &v.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &v, nil
}

func CreateVariable(db *sql.DB, v *Variable) error {
	query := `
		INSERT INTO formulapricing.variables 
		(variable_name, display_name, description, value_type, default_value, is_unique, unique_behavior, constraints)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`
	
	err := db.QueryRow(query, v.VariableName, v.DisplayName, v.Description, v.ValueType, 
		v.DefaultValue, v.IsUnique, v.UniqueBehavior, v.Constraints).
		Scan(&v.ID, &v.CreatedAt, &v.UpdatedAt)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrDuplicateKey
		}
		return err
	}

	return nil
}

func UpdateVariable(db *sql.DB, id uuid.UUID, v *Variable) error {
	query := `
		UPDATE formulapricing.variables
		SET variable_name = $2, display_name = $3, description = $4, value_type = $5, 
		    default_value = $6, is_unique = $7, unique_behavior = $8, constraints = $9
		WHERE id = $1
		RETURNING updated_at
	`
	
	err := db.QueryRow(query, id, v.VariableName, v.DisplayName, v.Description, v.ValueType, 
		v.DefaultValue, v.IsUnique, v.UniqueBehavior, v.Constraints).
		Scan(&v.UpdatedAt)
	if err == sql.ErrNoRows {
		return ErrNotFound
	}
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrDuplicateKey
		}
		return err
	}
	
	v.ID = id
	return nil
}

func DeleteVariable(db *sql.DB, id uuid.UUID) error {
	query := `DELETE FROM formulapricing.variables WHERE id = $1`
	
	result, err := db.Exec(query, id)
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

func GetVariableByName(db *sql.DB, name string) (*Variable, error) {
	query := `
		SELECT id, variable_name, display_name, description, value_type, 
		       default_value, COALESCE(is_unique, false) as is_unique, unique_behavior,
		       COALESCE(constraints, '{}') as constraints,
		       created_at, updated_at
		FROM formulapricing.variables
		WHERE variable_name = $1
	`
	
	var v Variable
	err := db.QueryRow(query, name).Scan(&v.ID, &v.VariableName, &v.DisplayName, &v.Description, &v.ValueType, 
		&v.DefaultValue, &v.IsUnique, &v.UniqueBehavior, &v.Constraints,
		&v.CreatedAt, &v.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &v, nil
}