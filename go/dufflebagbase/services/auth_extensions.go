package services

import (
	"context"

	"github.com/suppers-ai/auth"
	"github.com/suppers-ai/database"
)

// AuthExtensions adds extra functionality to auth.Service
type AuthExtensions struct {
	*auth.Service
	db database.Database
}

// NewAuthExtensions creates a new auth extensions wrapper
func NewAuthExtensions(authService *auth.Service, db database.Database) *AuthExtensions {
	return &AuthExtensions{
		Service: authService,
		db:      db,
	}
}

// ListUsers lists all users with pagination
func (a *AuthExtensions) ListUsers(ctx context.Context, offset, limit int) ([]UserInfo, int, error) {
	return ListUsers(a.Service, a.db)(ctx, offset, limit)
}