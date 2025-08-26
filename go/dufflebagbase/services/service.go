package services

import (
	"context"
	"fmt"

	"github.com/suppers-ai/auth"
	"github.com/suppers-ai/database"
	"github.com/suppers-ai/dufflebagbase/config"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/mailer"
)

type Config struct {
	DB     database.Database
	Auth   *auth.Service
	Mailer mailer.Mailer
	Logger logger.Logger
	Config *config.Config
}

type Service struct {
	db     database.Database
	auth   *AuthExtensions
	mailer mailer.Mailer
	logger logger.Logger
	config *config.Config
}

func New(cfg Config) *Service {
	return &Service{
		db:     cfg.DB,
		auth:   NewAuthExtensions(cfg.Auth, cfg.DB),
		mailer: cfg.Mailer,
		logger: cfg.Logger,
		config: cfg.Config,
	}
}

// Auth returns the auth service with extensions
func (s *Service) Auth() *AuthExtensions {
	return s.auth
}

// DB returns the database
func (s *Service) DB() database.Database {
	return s.db
}

// Logger returns the logger
func (s *Service) Logger() logger.Logger {
	return s.logger
}

// Config returns the config
func (s *Service) Config() *config.Config {
	return s.config
}

// Collections returns the collections service
func (s *Service) Collections() *CollectionsService {
	return &CollectionsService{
		db:     s.db,
		logger: s.logger,
	}
}

// Storage returns the storage service
func (s *Service) Storage() *StorageService {
	return &StorageService{
		db:     s.db,
		logger: s.logger,
	}
}

// CreateAdminUser creates the default admin user
func (s *Service) CreateAdminUser(ctx context.Context, email, password string) error {
	// Check if user exists
	var exists bool
	err := s.db.Get(ctx, &exists, `
		SELECT EXISTS(
			SELECT 1 FROM auth.users WHERE email = $1
		)
	`, email)
	
	if err != nil {
		return fmt.Errorf("failed to check admin existence: %w", err)
	}
	
	if exists {
		s.logger.Info(ctx, "Admin user already exists", logger.String("email", email))
		return nil
	}
	
	// Create admin user
	user, err := s.auth.CreateUser(ctx, email, password)
	if err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}
	
	// Set admin role and confirm email
	_, err = s.db.Exec(ctx, `
		UPDATE auth.users 
		SET role = 'admin', confirmed = true 
		WHERE id = $1
	`, user.GetPID())
	
	if err != nil {
		return fmt.Errorf("failed to set admin role: %w", err)
	}
	
	s.logger.Info(ctx, "Admin user created", logger.String("email", email))
	return nil
}