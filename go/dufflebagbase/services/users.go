package services

import (
	"context"
	"fmt"
	"time"

	"github.com/suppers-ai/auth"
	"github.com/suppers-ai/database"
)

// UserInfo provides information about a user
type UserInfo struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	Confirmed bool      `json:"confirmed"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ListUsers extends auth.Service to list all users
func ListUsers(authService *auth.Service, db database.Database) func(ctx context.Context, offset, limit int) ([]UserInfo, int, error) {
	return func(ctx context.Context, offset, limit int) ([]UserInfo, int, error) {
		// Get total count
		var total int
		err := db.Get(ctx, &total, `SELECT COUNT(*) FROM auth.users`)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to count users: %w", err)
		}
		
		// Get users
		query := `
			SELECT 
				id, email, 
				COALESCE(metadata->>'username', '') as username,
				COALESCE(metadata->>'role', 'user') as role,
				confirmed, created_at, updated_at
			FROM auth.users
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2
		`
		
		rows, err := db.Query(ctx, query, limit, offset)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to query users: %w", err)
		}
		defer rows.Close()
		
		var users []UserInfo
		for rows.Next() {
			var u UserInfo
			err := rows.Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.Confirmed, &u.CreatedAt, &u.UpdatedAt)
			if err != nil {
				return nil, 0, err
			}
			users = append(users, u)
		}
		
		return users, total, nil
	}
}