package services

import (
	"gorm.io/gorm"
	"github.com/suppers-ai/auth"
)

// AuthExtensions adds extra functionality to auth.Service
type AuthExtensions struct {
	*auth.Service
	db *gorm.DB
}

// NewAuthExtensions creates a new auth extensions wrapper
func NewAuthExtensions(authService *auth.Service, db *gorm.DB) *AuthExtensions {
	return &AuthExtensions{
		Service: authService,
		db:      db,
	}
}