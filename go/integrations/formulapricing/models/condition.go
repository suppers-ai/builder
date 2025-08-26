package models

import (
	"context"
	"database/sql"
	"formulapricing/database"
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

func GetAllConditions() ([]Condition, error) {
	query := `
		SELECT id, condition_name, display_name, description, condition, created_at, updated_at
		FROM formulapricing.conditions
		ORDER BY condition_name
	`
	
	ctx := context.Background()
	rows, err := database.DB.Query(ctx, query)
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

func GetConditionByID(id uuid.UUID) (*Condition, error) {
	query := `
		SELECT id, condition_name, display_name, description, condition, created_at, updated_at
		FROM formulapricing.conditions
		WHERE id = $1
	`
	
	var c Condition
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, id)
	err := row.Scan(&c.ID, &c.ConditionName, &c.DisplayName, 
		&c.Description, pq.Array(&c.Condition), &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func GetConditionByName(name string) (*Condition, error) {
	query := `
		SELECT id, condition_name, display_name, description, condition, created_at, updated_at
		FROM formulapricing.conditions
		WHERE condition_name = $1
	`
	
	var c Condition
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, name)
	err := row.Scan(&c.ID, &c.ConditionName, &c.DisplayName, 
		&c.Description, pq.Array(&c.Condition), &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func CreateCondition(c *Condition) error {
	query := `
		INSERT INTO formulapricing.conditions (condition_name, display_name, description, condition)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, c.ConditionName, c.DisplayName, c.Description, pq.Array(c.Condition))
	err := row.Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrDuplicateKey
		}
		return err
	}

	return nil
}

func UpdateCondition(id uuid.UUID, c *Condition) error {
	query := `
		UPDATE formulapricing.conditions
		SET condition_name = $2, display_name = $3, description = $4, condition = $5
		WHERE id = $1
		RETURNING updated_at
	`
	
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, id, c.ConditionName, c.DisplayName, c.Description, pq.Array(c.Condition))
	err := row.Scan(&c.UpdatedAt)
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

func DeleteCondition(id uuid.UUID) error {
	query := `DELETE FROM formulapricing.conditions WHERE id = $1`
	
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