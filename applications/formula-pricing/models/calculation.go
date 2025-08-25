package models

import (
	"database/sql"
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

func GetAllCalculations(db *sql.DB) ([]Calculation, error) {
	query := `
		SELECT id, calculation_name, display_name, description, calculation, created_at, updated_at
		FROM formulapricing.calculations
		ORDER BY calculation_name
	`
	
	rows, err := db.Query(query)
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

func GetCalculationByID(db *sql.DB, id uuid.UUID) (*Calculation, error) {
	query := `
		SELECT id, calculation_name, display_name, description, calculation, created_at, updated_at
		FROM formulapricing.calculations
		WHERE id = $1
	`
	
	var c Calculation
	err := db.QueryRow(query, id).Scan(&c.ID, &c.CalculationName, &c.DisplayName, 
		&c.Description, pq.Array(&c.Calculation), &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func GetCalculationByName(db *sql.DB, name string) (*Calculation, error) {
	query := `
		SELECT id, calculation_name, display_name, description, calculation, created_at, updated_at
		FROM formulapricing.calculations
		WHERE calculation_name = $1
	`
	
	var c Calculation
	err := db.QueryRow(query, name).Scan(&c.ID, &c.CalculationName, &c.DisplayName, 
		&c.Description, pq.Array(&c.Calculation), &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func CreateCalculation(db *sql.DB, c *Calculation) error {
	query := `
		INSERT INTO formulapricing.calculations (calculation_name, display_name, description, calculation)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	
	err := db.QueryRow(query, c.CalculationName, c.DisplayName, c.Description, pq.Array(c.Calculation)).
		Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrDuplicateKey
		}
		return err
	}

	return nil
}

func UpdateCalculation(db *sql.DB, id uuid.UUID, c *Calculation) error {
	query := `
		UPDATE formulapricing.calculations
		SET calculation_name = $2, display_name = $3, description = $4, calculation = $5
		WHERE id = $1
		RETURNING updated_at
	`
	
	err := db.QueryRow(query, id, c.CalculationName, c.DisplayName, c.Description, pq.Array(c.Calculation)).
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

func DeleteCalculation(db *sql.DB, id uuid.UUID) error {
	query := `DELETE FROM formulapricing.calculations WHERE id = $1`
	
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