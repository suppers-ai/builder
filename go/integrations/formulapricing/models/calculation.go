package models

import (
	"context"
	"database/sql"
	"formulapricing/database"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Calculation struct {
	ID               uuid.UUID `json:"id"`
	CalculationName  string    `json:"calculation_name"`
	DisplayName      string    `json:"display_name"`
	Description      *string   `json:"description,omitempty"`
	Calculation      []string  `json:"calculation"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func GetAllCalculations() ([]Calculation, error) {
	query := `
		SELECT id, calculation_name, display_name, description, calculation, created_at, updated_at
		FROM formulapricing.calculations
		ORDER BY calculation_name
	`
	
	ctx := context.Background()
	rows, err := database.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var calculations []Calculation
	for rows.Next() {
		var c Calculation
		err := rows.Scan(&c.ID, &c.CalculationName, &c.DisplayName, &c.Description, 
			pq.Array(&c.Calculation), &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
		calculations = append(calculations, c)
	}

	return calculations, nil
}

func GetCalculationByID(id uuid.UUID) (*Calculation, error) {
	query := `
		SELECT id, calculation_name, display_name, description, calculation, created_at, updated_at
		FROM formulapricing.calculations
		WHERE id = $1
	`
	
	var c Calculation
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, id)
	err := row.Scan(&c.ID, &c.CalculationName, &c.DisplayName, 
		&c.Description, pq.Array(&c.Calculation), &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func GetCalculationByName(name string) (*Calculation, error) {
	query := `
		SELECT id, calculation_name, display_name, description, calculation, created_at, updated_at
		FROM formulapricing.calculations
		WHERE calculation_name = $1
	`
	
	var c Calculation
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, name)
	err := row.Scan(&c.ID, &c.CalculationName, &c.DisplayName, 
		&c.Description, pq.Array(&c.Calculation), &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func CreateCalculation(c *Calculation) error {
	query := `
		INSERT INTO formulapricing.calculations (calculation_name, display_name, description, calculation)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, c.CalculationName, c.DisplayName, c.Description, pq.Array(c.Calculation))
	err := row.Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrDuplicateKey
		}
		return err
	}

	return nil
}

func UpdateCalculation(id uuid.UUID, c *Calculation) error {
	query := `
		UPDATE formulapricing.calculations
		SET calculation_name = $2, display_name = $3, description = $4, calculation = $5
		WHERE id = $1
		RETURNING updated_at
	`
	
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, id, c.CalculationName, c.DisplayName, c.Description, pq.Array(c.Calculation))
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

func DeleteCalculation(id uuid.UUID) error {
	query := `DELETE FROM formulapricing.calculations WHERE id = $1`
	
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