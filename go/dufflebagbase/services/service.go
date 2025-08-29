package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"github.com/suppers-ai/auth"
	"github.com/suppers-ai/dufflebagbase/config"
	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/database"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/mailer"
)

type Config struct {
	DB     *database.DB
	Auth   *auth.Service
	Mailer mailer.Mailer
	Logger logger.Logger
	Config *config.Config
}

type Service struct {
	db          *database.DB
	auth        *AuthExtensions
	mailer      mailer.Mailer
	logger      logger.Logger
	config      *config.Config
	storage     *StorageService
	users       *UsersService
	stats       *StatsService
	collections *CollectionsService
	logs        *LogsService
}

func New(cfg Config) *Service {
	s := &Service{
		db:     cfg.DB,
		auth:   NewAuthExtensions(cfg.Auth, cfg.DB.DB),
		mailer: cfg.Mailer,
		logger: cfg.Logger,
		config: cfg.Config,
	}
	
	// Initialize services with GORM
	s.storage = NewStorageService(cfg.DB.DB, cfg.Logger)
	s.users = NewUsersService(cfg.DB.DB, cfg.Logger)
	s.collections = NewCollectionsService(cfg.DB.DB, cfg.Logger)
	s.stats = NewStatsService(s)
	s.logs = NewLogsService(cfg.DB.DB, cfg.Logger)
	
	return s
}

// Auth returns the auth service with extensions
func (s *Service) Auth() *AuthExtensions {
	return s.auth
}

// DB returns the GORM database
func (s *Service) DB() *gorm.DB {
	return s.db.DB
}

// Database returns the database interface for raw SQL operations
func (s *Service) Database() database.Database {
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
	return s.collections
}

// Storage returns the storage service
func (s *Service) Storage() *StorageService {
	return s.storage
}

// Users returns the users service
func (s *Service) Users() *UsersService {
	return s.users
}

// Stats returns the stats service
func (s *Service) Stats() *StatsService {
	return s.stats
}

// Logs returns the logs service
func (s *Service) Logs() *LogsService {
	return s.logs
}

// GetLogs retrieves logs with pagination and filtering
func (s *Service) GetLogs(ctx context.Context, level string, limit, offset int) ([]LogEntry, int64, error) {
	return s.logs.GetLogs(ctx, level, limit, offset)
}

// GetLogByID retrieves a specific log by ID
func (s *Service) GetLogByID(ctx context.Context, id uuid.UUID) (*LogEntry, error) {
	return s.logs.GetLogByID(ctx, id)
}

// GetLogStats retrieves log statistics
func (s *Service) GetLogStats(ctx context.Context) (map[string]interface{}, error) {
	return s.logs.GetLogStats(ctx)
}

// ClearLogs clears logs older than the specified duration
func (s *Service) ClearLogs(ctx context.Context, olderThan time.Duration) (int64, error) {
	return s.logs.ClearLogs(ctx, olderThan)
}

// CreateAdminUser creates the default admin user
func (s *Service) CreateAdminUser(ctx context.Context, email, password string) error {
	// Check if user exists
	var exists int64
	s.db.WithContext(ctx).Model(&models.User{}).Where("email = ?", email).Count(&exists)
	
	if exists > 0 {
		s.logger.Info(ctx, "Admin user already exists", logger.String("email", email))
		return nil
	}
	
	// Create admin user
	user, err := s.users.CreateUser(ctx, email, password, models.RoleAdmin)
	if err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}
	
	// Confirm email
	if err := s.users.ConfirmEmail(ctx, user.ID); err != nil {
		return fmt.Errorf("failed to confirm admin email: %w", err)
	}
	
	s.logger.Info(ctx, "Admin user created", logger.String("email", email))
	return nil
}