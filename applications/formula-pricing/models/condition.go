package models

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Condition struct {
	ID            uuid.UUID `json:"id"`
	ConditionName string    `json:"condition_name"`
	DisplayName   string    `json:"display_name"`
	Description   *string   `json:"description,omitempty"`
	Condition     []string  `json:"condition"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func GetAllConditions(db *sql.DB) ([]Condition, error) {
	query := `
		SELECT id, condition_name, display_name, description, condition, created_at, updated_at
		FROM formulapricing.conditions
		ORDER BY condition_name
	`
	
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conditions []Condition
	for rows.Next() {
		var c Condition
		err := rows.Scan(&c.ID, &c.ConditionName, &c.DisplayName, &c.Description, 
			pq.Array(&c.Condition), &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
		conditions = append(conditions, c)
	}

	return conditions, nil
}

func GetConditionByID(db *sql.DB, id uuid.UUID) (*Condition, error) {
	query := `
		SELECT id, condition_name, display_name, description, condition, created_at, updated_at
		FROM formulapricing.conditions
		WHERE id = $1
	`
	
	var c Condition
	err := db.QueryRow(query, id).Scan(&c.ID, &c.ConditionName, &c.DisplayName, 
		&c.Description, pq.Array(&c.Condition), &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func GetConditionByName(db *sql.DB, name string) (*Condition, error) {
	query := `
		SELECT id, condition_name, display_name, description, condition, created_at, updated_at
		FROM formulapricing.conditions
		WHERE condition_name = $1
	`
	
	var c Condition
	err := db.QueryRow(query, name).Scan(&c.ID, &c.ConditionName, &c.DisplayName, 
		&c.Description, pq.Array(&c.Condition), &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func CreateCondition(db *sql.DB, c *Condition) error {
	query := `
		INSERT INTO formulapricing.conditions (condition_name, display_name, description, condition)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	
	err := db.QueryRow(query, c.ConditionName, c.DisplayName, c.Description, pq.Array(c.Condition)).
		Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrDuplicateKey
		}
		return err
	}

	return nil
}

func UpdateCondition(db *sql.DB, id uuid.UUID, c *Condition) error {
	query := `
		UPDATE formulapricing.conditions
		SET condition_name = $2, display_name = $3, description = $4, condition = $5
		WHERE id = $1
		RETURNING updated_at
	`
	
	err := db.QueryRow(query, id, c.ConditionName, c.DisplayName, c.Description, pq.Array(c.Condition)).
		Scan(&c.UpdatedAt)
	if err == sql.ErrNoRows {
		return ErrNotFound
	}
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrDuplicateKey
		}
		return err
	}
	
	c.ID = id
	return nil
}

func DeleteCondition(db *sql.DB, id uuid.UUID) error {
	query := `DELETE FROM formulapricing.conditions WHERE id = $1`
	
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