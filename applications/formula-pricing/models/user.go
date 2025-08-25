package models

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func GetUserByEmail(db *sql.DB, email string) (*User, error) {
	query := `
		SELECT id, email, password_hash, role, created_at, updated_at
		FROM formulapricing.users
		WHERE email = $1
	`
	
	var u User
	err := db.QueryRow(query, email).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func CreateUser(db *sql.DB, email, password, role string) (*User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Validate role
	if role != "admin" && role != "viewer" {
		role = "viewer" // Default to viewer if invalid role
	}

	query := `
		INSERT INTO formulapricing.users (email, password_hash, role)
		VALUES ($1, $2, $3)
		RETURNING id, email, role, created_at, updated_at
	`
	
	var u User
	err = db.QueryRow(query, email, string(hashedPassword), role).
		Scan(&u.ID, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

func (u *User) IsViewer() bool {
	return u.Role == "viewer"
}

func GetOrCreateDefaultUser(db *sql.DB, email, password string) error {
	// Check if any user exists
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM formulapricing.users").Scan(&count)
	if err != nil {
		return err
	}

	// If no user exists, create the default admin
	if count == 0 {
		_, err = CreateUser(db, email, password, "admin")
		if err != nil {
			return err
		}
	}

	return nil
}

func GetAllUsers(db *sql.DB) ([]User, error) {
	query := `
		SELECT id, email, password_hash, role, created_at, updated_at
		FROM formulapricing.users
		ORDER BY email
	`
	
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		err := rows.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	return users, nil
}

func GetUserByID(db *sql.DB, id uuid.UUID) (*User, error) {
	query := `
		SELECT id, email, password_hash, role, created_at, updated_at
		FROM formulapricing.users
		WHERE id = $1
	`
	
	var u User
	err := db.QueryRow(query, id).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func UpdateUserPassword(db *sql.DB, id uuid.UUID, newPassword string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	query := `
		UPDATE formulapricing.users
		SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`
	
	result, err := db.Exec(query, id, string(hashedPassword))
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

func UpdateUserRole(db *sql.DB, id uuid.UUID, role string) error {
	// Validate role
	if role != "admin" && role != "viewer" {
		return ErrInvalidInput
	}

	query := `
		UPDATE formulapricing.users
		SET role = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`
	
	result, err := db.Exec(query, id, role)
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

func DeleteUser(db *sql.DB, id uuid.UUID) error {
	query := `DELETE FROM formulapricing.users WHERE id = $1`
	
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