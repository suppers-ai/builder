package services

import (
	"context"
	"gorm.io/gorm"
	"github.com/suppers-ai/auth"
)

// AuthExtensions adds extra functionality to auth.Service
type AuthExtensions struct {
	*auth.Service
	db    *gorm.DB
	users *UsersService
}

// NewAuthExtensions creates a new auth extensions wrapper
func NewAuthExtensions(authService *auth.Service, db *gorm.DB, users *UsersService) *AuthExtensions {
	return &AuthExtensions{
		Service: authService,
		db:      db,
		users:   users,
	}
}

// AuthenticateUser authenticates a user by email and password
func (a *AuthExtensions) AuthenticateUser(ctx context.Context, email, password string) (*auth.User, error) {
	return a.users.AuthenticateUser(ctx, email, password)
}