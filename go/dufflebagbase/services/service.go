package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"gorm.io/gorm"

	"github.com/suppers-ai/auth"
	"github.com/suppers-ai/database"
	"github.com/suppers-ai/dufflebagbase/config"
	"github.com/suppers-ai/storage"
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
	db           *database.DB
	auth         *AuthExtensions
	mailer       mailer.Mailer
	logger       logger.Logger
	config       *config.Config
	storage      *EnhancedStorageService
	users        *UsersService
	stats        *StatsService
	collections  *CollectionsService
	logs         *LogsService
	sessions     *SessionService
	sessionStore sessions.Store
}

func New(cfg Config) *Service {
	s := &Service{
		db:           cfg.DB,
		mailer:       cfg.Mailer,
		logger:       cfg.Logger,
		config:       cfg.Config,
		sessionStore: sessions.NewCookieStore([]byte(cfg.Config.SessionSecret)),
	}

	// Initialize storage with provider-based system
	storageCfg := storage.Config{
		Provider:          storage.ProviderType(cfg.Config.StorageType),
		BasePath:          cfg.Config.LocalStoragePath,
		S3Endpoint:        cfg.Config.S3Endpoint,
		S3Region:          cfg.Config.S3Region,
		S3AccessKeyID:     cfg.Config.S3AccessKey,
		S3SecretAccessKey: cfg.Config.S3SecretKey,
		S3BucketPrefix:    cfg.Config.S3Bucket,
		S3UseSSL:          cfg.Config.S3UseSSL,
		BaseURL:           fmt.Sprintf("http://localhost:%s", cfg.Config.Port),
	}

	// Initialize storage service with provider
	var err error
	s.storage, err = InitEnhancedStorageService(cfg.DB.DB, cfg.Logger, storageCfg)
	if err != nil {
		cfg.Logger.Fatal(context.Background(), "Failed to initialize storage service", logger.Err(err))
	}

	cfg.Logger.Info(context.Background(), "Storage initialized",
		logger.String("provider", s.storage.GetProviderType()),
		logger.String("name", s.storage.GetProviderName()))

	// Initialize other services with GORM
	s.users = NewUsersService(cfg.DB.DB, cfg.Logger)
	s.collections = NewCollectionsService(cfg.DB.DB, cfg.Logger)
	s.stats = NewStatsService(s)
	s.logs = NewLogsService(cfg.DB.DB, cfg.Logger)
	s.sessions = NewSessionService(cfg.DB.DB, cfg.Logger)

	// Initialize auth extensions after users service is created
	s.auth = NewAuthExtensions(cfg.Auth, cfg.DB.DB, s.users)

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
func (s *Service) Storage() *EnhancedStorageService {
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

// Sessions returns the sessions service
func (s *Service) Sessions() *SessionService {
	return s.sessions
}

// SessionStore returns the gorilla session store
func (s *Service) SessionStore() sessions.Store {
	return s.sessionStore
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
	s.db.WithContext(ctx).Model(&auth.User{}).Where("email = ?", email).Count(&exists)

	if exists > 0 {
		s.logger.Info(ctx, "Admin user already exists", logger.String("email", email))
		return nil
	}

	// Create admin user
	user, err := s.users.CreateUser(ctx, email, password, UserRoleAdmin)
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
