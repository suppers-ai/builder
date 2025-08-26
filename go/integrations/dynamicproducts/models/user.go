package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the system
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Never include in JSON responses
	Name         string    `json:"name"`
	Role         string    `json:"role"` // admin, seller
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Session represents a user session
type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

// SetPassword hashes and sets the user's password
func (u *User) SetPassword(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}
	u.PasswordHash = string(hash)
	return nil
}

// CheckPassword verifies the provided password against the user's hash
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

// Create creates a new user in the database
func (u *User) Create() error {
	ctx := context.Background()
	query := `
		INSERT INTO users (email, password_hash, name, role, is_active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`
	
	row := DB.QueryRow(ctx, query, u.Email, u.PasswordHash, u.Name, u.Role, u.IsActive)
	err := row.Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

// Update updates the user in the database
func (u *User) Update() error {
	ctx := context.Background()
	query := `
		UPDATE users 
		SET email = $2, name = $3, role = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
		RETURNING updated_at`
	
	row := DB.QueryRow(ctx, query, u.ID, u.Email, u.Name, u.Role, u.IsActive)
	err := row.Scan(&u.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

// UpdatePassword updates only the user's password
func (u *User) UpdatePassword(newPassword string) error {
	if err := u.SetPassword(newPassword); err != nil {
		return err
	}
	
	ctx := context.Background()
	query := `
		UPDATE users 
		SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
		RETURNING updated_at`
	
	row := DB.QueryRow(ctx, query, u.ID, u.PasswordHash)
	err := row.Scan(&u.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	return nil
}

// Delete soft deletes the user (sets is_active to false)
func (u *User) Delete() error {
	ctx := context.Background()
	query := `
		UPDATE users 
		SET is_active = false, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1`
	
	_, err := DB.Exec(ctx, query, u.ID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	u.IsActive = false
	return nil
}

// GetUserByID retrieves a user by ID
func GetUserByID(id string) (*User, error) {
	ctx := context.Background()
	user := &User{}
	query := `
		SELECT id, email, password_hash, name, role, is_active, created_at, updated_at
		FROM users 
		WHERE id = $1 AND is_active = true`
	
	row := DB.QueryRow(ctx, query, id)
	err := row.Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, 
		&user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}
	return user, nil
}

// GetUserByEmail retrieves a user by email
func GetUserByEmail(email string) (*User, error) {
	ctx := context.Background()
	user := &User{}
	query := `
		SELECT id, email, password_hash, name, role, is_active, created_at, updated_at
		FROM users 
		WHERE email = $1 AND is_active = true`
	
	row := DB.QueryRow(ctx, query, email)
	err := row.Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Name, 
		&user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}
	return user, nil
}

// GetAllUsers retrieves all active users
func GetAllUsers() ([]User, error) {
	ctx := context.Background()
	query := `
		SELECT id, email, password_hash, name, role, is_active, created_at, updated_at
		FROM users 
		WHERE is_active = true
		ORDER BY created_at DESC`
	
	rows, err := DB.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all users: %w", err)
	}
	defer rows.Close()
	
	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID, &user.Email, &user.PasswordHash, &user.Name, 
			&user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}
	
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate users: %w", err)
	}
	
	return users, nil
}

// IsAdmin checks if the user is an admin
func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

// IsSeller checks if the user is a seller
func (u *User) IsSeller() bool {
	return u.Role == "seller"
}

// Session methods

// CreateSession creates a new session for the user
func (u *User) CreateSession() (*Session, error) {
	ctx := context.Background()
	session := &Session{
		UserID:    u.ID,
		Token:     generateSessionToken(),
		ExpiresAt: time.Now().Add(24 * time.Hour), // 24 hour session
	}
	
	query := `
		INSERT INTO sessions (user_id, token, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id, created_at`
	
	row := DB.QueryRow(ctx, query, session.UserID, session.Token, session.ExpiresAt)
	err := row.Scan(&session.ID, &session.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}
	
	return session, nil
}

// GetSessionByToken retrieves a session by token
func GetSessionByToken(token string) (*Session, error) {
	ctx := context.Background()
	session := &Session{}
	query := `
		SELECT id, user_id, token, expires_at, created_at
		FROM sessions 
		WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP`
	
	row := DB.QueryRow(ctx, query, token)
	err := row.Scan(
		&session.ID, &session.UserID, &session.Token, 
		&session.ExpiresAt, &session.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	
	return session, nil
}

// DeleteSession deletes a session
func DeleteSession(token string) error {
	ctx := context.Background()
	query := `DELETE FROM sessions WHERE token = $1`
	_, err := DB.Exec(ctx, query, token)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}
	return nil
}

// CleanExpiredSessions removes expired sessions
func CleanExpiredSessions() error {
	ctx := context.Background()
	query := `DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP`
	_, err := DB.Exec(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to clean expired sessions: %w", err)
	}
	return nil
}

// GetUserBySessionToken retrieves a user by session token
func GetUserBySessionToken(token string) (*User, error) {
	session, err := GetSessionByToken(token)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, nil
	}
	
	return GetUserByID(session.UserID)
}

// generateSessionToken generates a random session token
func generateSessionToken() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const tokenLength = 32
	
	b := make([]byte, tokenLength)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}