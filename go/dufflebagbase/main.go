package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	
	"github.com/suppers-ai/dufflebagbase/config"
	"github.com/suppers-ai/dufflebagbase/handlers"
	"github.com/suppers-ai/dufflebagbase/middleware"
	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/web"
	
	"github.com/suppers-ai/auth"
	"github.com/suppers-ai/database"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/mailer"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.Load()
	
	// Initialize logger
	logLevel, _ := logger.ParseLevel(cfg.LogLevel)
	appLogger, err := initLogger(logLevel, cfg)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer appLogger.Close()
	
	ctx := context.Background()
	appLogger.Info(ctx, "Starting DuffleBagBase",
		logger.String("version", "1.0.0"),
		logger.String("environment", cfg.Environment))

	// Initialize database
	db, err := initDatabase(ctx, cfg)
	if err != nil {
		appLogger.Fatal(ctx, "Failed to initialize database", logger.Err(err))
	}
	defer db.Close()

	// Run migrations
	if err := runMigrations(ctx, db); err != nil {
		appLogger.Fatal(ctx, "Failed to run migrations", logger.Err(err))
	}

	// Initialize mailer
	mailService, err := initMailer(cfg)
	if err != nil {
		appLogger.Fatal(ctx, "Failed to initialize mailer", logger.Err(err))
	}

	// Initialize auth service
	authService, err := initAuth(cfg, db, mailService)
	if err != nil {
		appLogger.Fatal(ctx, "Failed to initialize auth", logger.Err(err))
	}

	// Initialize services
	svc := services.New(services.Config{
		DB:          db,
		Auth:        authService,
		Mailer:      mailService,
		Logger:      appLogger,
		Config:      cfg,
	})

	// Create default admin user
	if err := createDefaultAdmin(ctx, svc, cfg); err != nil {
		appLogger.Warn(ctx, "Failed to create default admin", logger.Err(err))
	}

	// Initialize router
	router := setupRoutes(svc, authService, appLogger, cfg)

	// Start server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		appLogger.Info(ctx, "Server starting",
			logger.String("address", srv.Addr),
			logger.String("dashboard", fmt.Sprintf("http://localhost:%s", cfg.Port)))
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Fatal(ctx, "Server failed to start", logger.Err(err))
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	appLogger.Info(ctx, "Shutting down server...")

	// Graceful shutdown
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		appLogger.Error(ctx, "Server forced to shutdown", logger.Err(err))
	}

	appLogger.Info(ctx, "Server stopped")
}

func initLogger(level logger.Level, cfg *config.Config) (logger.Logger, error) {
	// For now, use multi logger with console and file
	return logger.New(logger.Config{
		Level:          level,
		Output:         "console",
		Format:         "text",
		IncludeCaller:  cfg.Environment == "development",
		IncludeStack:   cfg.Environment == "development",
	})
}

func initDatabase(ctx context.Context, cfg *config.Config) (database.Database, error) {
	db, err := database.New("postgres")
	if err != nil {
		return nil, err
	}

	dbConfig := database.Config{
		Driver:       "postgres",
		Host:         cfg.DatabaseHost,
		Port:         cfg.DatabasePort,
		Database:     cfg.DatabaseName,
		Username:     cfg.DatabaseUser,
		Password:     cfg.DatabasePassword,
		SSLMode:      cfg.DatabaseSSLMode,
		MaxOpenConns: 25,
		MaxIdleConns: 5,
	}

	if err := db.Connect(ctx, dbConfig); err != nil {
		return nil, err
	}

	return db, nil
}

func initMailer(cfg *config.Config) (mailer.Mailer, error) {
	return mailer.New(mailer.Config{
		Provider: "smtp",
		From: mailer.Address{
			Name:  "DuffleBagBase",
			Email: cfg.SMTPFrom,
		},
		Timeout: 10 * time.Second,
		Extra: map[string]interface{}{
			"smtp_host":      cfg.SMTPHost,
			"smtp_port":      cfg.SMTPPort,
			"smtp_username":  cfg.SMTPUsername,
			"smtp_password":  cfg.SMTPPassword,
			"smtp_start_tls": cfg.SMTPUseTLS,
		},
	})
}

func initAuth(cfg *config.Config, db database.Database, mailService mailer.Mailer) (*auth.Service, error) {
	return auth.New(auth.Config{
		DB:          db,
		Mailer:      mailService,
		RootURL:     fmt.Sprintf("http://localhost:%s", cfg.Port),
		BCryptCost:  12,
		SessionName: "dufflebag-session",
		SessionKey:  []byte(cfg.SessionSecret),
		CookieKey:   []byte(cfg.SessionSecret),
		CSRFKey:     []byte(cfg.SessionSecret),
	})
}

func runMigrations(ctx context.Context, db database.Database) error {
	// Create schemas
	schemas := []string{
		"CREATE SCHEMA IF NOT EXISTS auth",
		"CREATE SCHEMA IF NOT EXISTS storage",
		"CREATE SCHEMA IF NOT EXISTS logger",
		"CREATE SCHEMA IF NOT EXISTS collections",
	}

	for _, schema := range schemas {
		if _, err := db.Exec(ctx, schema); err != nil {
			return fmt.Errorf("failed to create schema: %w", err)
		}
	}

	// Create auth tables
	authSQL := `
	-- Users table (compatible with authboss)
	CREATE TABLE IF NOT EXISTS auth.users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		email VARCHAR(255) UNIQUE NOT NULL,
		password TEXT NOT NULL,  -- authboss expects 'password' field
		username VARCHAR(255),
		confirmed BOOLEAN DEFAULT false,
		confirm_token VARCHAR(255),
		confirm_selector VARCHAR(255),
		recover_token VARCHAR(255),
		recover_token_exp TIMESTAMP WITH TIME ZONE,
		recover_selector VARCHAR(255),
		totp_secret VARCHAR(255),
		totp_secret_backup VARCHAR(255),
		sms_phone_number VARCHAR(50),
		recovery_codes TEXT,
		oauth2_uid VARCHAR(255),
		oauth2_provider VARCHAR(50),
		oauth2_token TEXT,
		oauth2_refresh TEXT,
		oauth2_expiry TIMESTAMP WITH TIME ZONE,
		locked TIMESTAMP WITH TIME ZONE,
		attempt_count INT DEFAULT 0,
		last_attempt TIMESTAMP WITH TIME ZONE,
		role VARCHAR(50) DEFAULT 'user',
		metadata JSONB,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
	);
	CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
	CREATE INDEX IF NOT EXISTS idx_users_confirm_selector ON auth.users(confirm_selector);
	CREATE INDEX IF NOT EXISTS idx_users_recover_selector ON auth.users(recover_selector);

	-- Sessions table
	CREATE TABLE IF NOT EXISTS auth.sessions (
		id VARCHAR(255) PRIMARY KEY,
		user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
		data BYTEA,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
		expires_at TIMESTAMP WITH TIME ZONE
	);
	CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.sessions(user_id);
	CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON auth.sessions(expires_at);

	-- Tokens table (for password reset, email verification, etc.)
	CREATE TABLE IF NOT EXISTS auth.tokens (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
		token VARCHAR(255) UNIQUE NOT NULL,
		type VARCHAR(50) NOT NULL,
		expires_at TIMESTAMP WITH TIME ZONE,
		used_at TIMESTAMP WITH TIME ZONE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
	);
	CREATE INDEX IF NOT EXISTS idx_tokens_token ON auth.tokens(token);
	CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON auth.tokens(user_id);
	CREATE INDEX IF NOT EXISTS idx_tokens_type ON auth.tokens(type);
	`

	if _, err := db.Exec(ctx, authSQL); err != nil {
		return fmt.Errorf("failed to create auth tables: %w", err)
	}

	// Create storage tables
	storageSQL := `
	-- Buckets table
	CREATE TABLE IF NOT EXISTS storage.buckets (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name VARCHAR(255) UNIQUE NOT NULL,
		public BOOLEAN DEFAULT false,
		file_size_limit BIGINT,
		allowed_mime_types TEXT[],
		created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
	);
	CREATE INDEX IF NOT EXISTS idx_buckets_name ON storage.buckets(name);

	-- Objects table
	CREATE TABLE IF NOT EXISTS storage.objects (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		bucket_id UUID REFERENCES storage.buckets(id) ON DELETE CASCADE,
		name VARCHAR(255) NOT NULL,
		path TEXT NOT NULL,
		mime_type VARCHAR(255),
		size BIGINT,
		metadata JSONB,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
		UNIQUE(bucket_id, path)
	);
	CREATE INDEX IF NOT EXISTS idx_objects_bucket_id ON storage.objects(bucket_id);
	CREATE INDEX IF NOT EXISTS idx_objects_path ON storage.objects(path);
	`

	if _, err := db.Exec(ctx, storageSQL); err != nil {
		return fmt.Errorf("failed to create storage tables: %w", err)
	}

	// Create logger tables
	loggerSQL := `
	-- Logs table
	CREATE TABLE IF NOT EXISTS logger.logs (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		level VARCHAR(20) NOT NULL,
		message TEXT NOT NULL,
		metadata JSONB,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
	);
	CREATE INDEX IF NOT EXISTS idx_logs_level ON logger.logs(level);
	CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logger.logs(created_at);

	-- Request logs table
	CREATE TABLE IF NOT EXISTS logger.request_logs (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		method VARCHAR(10) NOT NULL,
		path TEXT NOT NULL,
		status_code INT,
		duration_ms INT,
		ip_address VARCHAR(45),
		user_agent TEXT,
		user_id UUID,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
	);
	CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON logger.request_logs(created_at);
	CREATE INDEX IF NOT EXISTS idx_request_logs_user_id ON logger.request_logs(user_id);
	`

	if _, err := db.Exec(ctx, loggerSQL); err != nil {
		return fmt.Errorf("failed to create logger tables: %w", err)
	}
	
	// Create collections metadata table
	collectionsSQL := `
	CREATE TABLE IF NOT EXISTS collections.collections (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name VARCHAR(255) NOT NULL UNIQUE,
		display_name VARCHAR(255),
		description TEXT,
		schema JSONB NOT NULL,
		indexes JSONB,
		auth_rules JSONB,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
	);

	CREATE INDEX IF NOT EXISTS idx_collections_name ON collections.collections(name);
	`

	if _, err := db.Exec(ctx, collectionsSQL); err != nil {
		return fmt.Errorf("failed to create collections table: %w", err)
	}

	return nil
}

func createDefaultAdmin(ctx context.Context, svc *services.Service, cfg *config.Config) error {
	// Check if admin exists
	// Create if not exists
	return svc.CreateAdminUser(ctx, cfg.AdminEmail, cfg.AdminPassword)
}

func setupRoutes(svc *services.Service, authService *auth.Service, logger logger.Logger, cfg *config.Config) *mux.Router {
	router := mux.NewRouter()

	// Middleware
	router.Use(middleware.CORS(cfg))
	router.Use(middleware.Logger(logger))
	router.Use(authService.LoadClientStateMiddleware)
	
	// Rate limiting
	if cfg.RateLimitEnabled {
		router.Use(middleware.RateLimit(cfg.RateLimitRequestsPerMinute))
	}

	// Static files
	router.PathPrefix("/static/").Handler(
		http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))),
	)

	// Health check
	router.HandleFunc("/health", handlers.Health()).Methods("GET")

	// Authentication routes
	router.HandleFunc("/auth/login", web.LoginPage(svc)).Methods("GET", "POST")
	router.HandleFunc("/auth/logout", web.Logout(svc)).Methods("POST")
	router.HandleFunc("/auth/signup", web.SignupPage(svc)).Methods("GET", "POST")
	router.HandleFunc("/auth/forgot-password", web.ForgotPassword(svc)).Methods("GET", "POST")

	// Main app (protected)
	router.Handle("/", authService.RequireAuth(web.DashboardPage(svc))).Methods("GET")
	
	// Dashboard pages (protected)
	// Direct dashboard route (not subrouter to avoid path issues)
	router.Handle("/dashboard", authService.RequireAuth(web.DashboardPage(svc))).Methods("GET")
	
	// Collections pages (protected)
	router.Handle("/collections", authService.RequireAuth(web.CollectionsPage(svc))).Methods("GET")
	
	// Admin pages (protected)
	router.Handle("/users", authService.RequireAuth(web.UsersPage(svc))).Methods("GET")
	router.Handle("/database", authService.RequireAuth(web.DatabasePage(svc))).Methods("GET")
	router.Handle("/storage", authService.RequireAuth(web.StoragePage(svc))).Methods("GET")
	router.Handle("/settings", authService.RequireAuth(web.SettingsPage(svc))).Methods("GET")

	// API routes
	if cfg.EnableAPI {
		api := router.PathPrefix("/api/v1").Subrouter()
		
		// Public API endpoints
		api.HandleFunc("/auth/login", handlers.APILogin(svc)).Methods("POST")
		api.HandleFunc("/auth/signup", handlers.APISignup(svc)).Methods("POST")
		api.HandleFunc("/auth/refresh", handlers.APIRefresh(svc)).Methods("POST")
		
		// Protected API endpoints
		protected := api.PathPrefix("").Subrouter()
		protected.Use(middleware.JWTAuth(cfg.JWTSecret))
		
		// Collections API
		protected.HandleFunc("/collections", handlers.ListCollections(svc)).Methods("GET")
		protected.HandleFunc("/collections", handlers.CreateCollection(svc)).Methods("POST")
		protected.HandleFunc("/collections/{name}", handlers.GetCollection(svc)).Methods("GET")
		protected.HandleFunc("/collections/{name}", handlers.UpdateCollection(svc)).Methods("PUT")
		protected.HandleFunc("/collections/{name}", handlers.DeleteCollection(svc)).Methods("DELETE")
		
		// Records API (dynamic collections)
		protected.HandleFunc("/collections/{collection}/records", handlers.ListRecords(svc)).Methods("GET")
		protected.HandleFunc("/collections/{collection}/records", handlers.CreateRecord(svc)).Methods("POST")
		protected.HandleFunc("/collections/{collection}/records/{id}", handlers.GetRecord(svc)).Methods("GET")
		protected.HandleFunc("/collections/{collection}/records/{id}", handlers.UpdateRecord(svc)).Methods("PUT")
		protected.HandleFunc("/collections/{collection}/records/{id}", handlers.DeleteRecord(svc)).Methods("DELETE")
		
		// Storage API
		protected.HandleFunc("/storage/buckets", handlers.ListBuckets(svc)).Methods("GET")
		protected.HandleFunc("/storage/buckets", handlers.CreateBucket(svc)).Methods("POST")
		protected.HandleFunc("/storage/buckets/{bucket}", handlers.DeleteBucket(svc)).Methods("DELETE")
		protected.HandleFunc("/storage/{bucket}/upload", handlers.UploadFile(svc)).Methods("POST")
		protected.HandleFunc("/storage/{bucket}/{path:.*}", handlers.GetFile(svc)).Methods("GET")
		protected.HandleFunc("/storage/{bucket}/{path:.*}", handlers.DeleteFile(svc)).Methods("DELETE")
		
		// Auth management API (admin only)
		admin := protected.PathPrefix("/admin").Subrouter()
		admin.Use(middleware.RequireAdmin())
		
		admin.HandleFunc("/users", handlers.ListUsers(svc)).Methods("GET")
		admin.HandleFunc("/users/{id}", handlers.GetUser(svc)).Methods("GET")
		admin.HandleFunc("/users/{id}", handlers.UpdateUser(svc)).Methods("PUT")
		admin.HandleFunc("/users/{id}", handlers.DeleteUser(svc)).Methods("DELETE")
		
		admin.HandleFunc("/logs", handlers.GetLogs(svc)).Methods("GET")
		admin.HandleFunc("/logs/requests", handlers.GetRequestLogs(svc)).Methods("GET")
	}

	// WebSocket for real-time subscriptions
	router.HandleFunc("/ws", handlers.WebSocketHandler(svc)).Methods("GET")

	return router
}