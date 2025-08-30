package main

import (
	"context"
	"encoding/hex"
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
	"github.com/suppers-ai/dufflebagbase/extensions/core"
	"github.com/suppers-ai/database"
	"github.com/suppers-ai/dufflebagbase/handlers"
	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/dufflebagbase/middleware"
	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/web"

	"github.com/suppers-ai/auth"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/mailer"
	"github.com/suppers-ai/storage"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize temporary console logger for bootstrap
	logLevel, _ := logger.ParseLevel(cfg.LogLevel)
	bootstrapLogger, err := logger.New(logger.Config{
		Level:         logLevel,
		Output:        "console",
		Format:        "text",
		IncludeCaller: cfg.Environment == "development",
	})
	if err != nil {
		log.Fatalf("Failed to initialize bootstrap logger: %v", err)
	}

	ctx := context.Background()
	bootstrapLogger.Info(ctx, "Starting DuffleBagBase",
		logger.String("version", "1.0.0"),
		logger.String("environment", cfg.Environment))

	// Initialize database with GORM
	dbConfig := &database.Config{
		Type:            cfg.DatabaseType,
		DSN:             cfg.DatabaseURL,
		Host:            cfg.DatabaseHost,
		Port:            cfg.DatabasePort,
		Database:        cfg.DatabaseName,
		Username:        cfg.DatabaseUser,
		Password:        cfg.DatabasePassword,
		SSLMode:         cfg.DatabaseSSLMode,
		MaxOpenConns:    100,
		MaxIdleConns:    10,
		ConnMaxLifetime: time.Hour,
		Debug:           cfg.Environment == "development",
		AutoMigrate:     true,
	}
	
	db, err := database.New(dbConfig)
	if err != nil {
		bootstrapLogger.Fatal(ctx, "Failed to initialize database", logger.Err(err))
	}
	defer db.Close()

	// Create schemas if using PostgreSQL
	if cfg.DatabaseType == "postgres" || cfg.DatabaseType == "postgresql" {
		schemas := []string{
			"CREATE SCHEMA IF NOT EXISTS auth",
			"CREATE SCHEMA IF NOT EXISTS storage",
			"CREATE SCHEMA IF NOT EXISTS logger",
			"CREATE SCHEMA IF NOT EXISTS collections",
		}
		for _, schema := range schemas {
			if err := db.GetGORM().Exec(schema).Error; err != nil {
				bootstrapLogger.Warn(ctx, "Failed to create schema", 
					logger.String("schema", schema),
					logger.Err(err))
			}
		}
	}

	// Initialize models with database type
	models.InitModels(cfg.DatabaseType)
	logger.InitModels(cfg.DatabaseType)
	storage.InitModels(cfg.DatabaseType)
	
	// Auth models will be migrated by the auth package
	// Logger and storage models will be migrated by their packages
	// Only migrate local models here
	if err := db.GetGORM().AutoMigrate(
		&storage.Bucket{},
		&storage.StorageObject{},
		&models.Collection{},
		&models.CollectionRecord{},
		&logger.LogModel{},
		&logger.RequestLogModel{},
		&models.ExtensionMigration{},
	); err != nil {
		bootstrapLogger.Fatal(ctx, "Failed to migrate database models", logger.Err(err))
	}

	bootstrapLogger.Info(ctx, "Database initialized and migrated successfully")

	// Now initialize the real logger with database support
	appLogger, err := initLogger(logLevel, cfg)
	if err != nil {
		bootstrapLogger.Fatal(ctx, "Failed to initialize application logger", logger.Err(err))
	}
	defer appLogger.Close()

	// Close bootstrap logger and switch to app logger
	bootstrapLogger.Close()

	appLogger.Info(ctx, "Application logger initialized with database support",
		logger.String("version", "1.0.0"),
		logger.String("environment", cfg.Environment))

	// Initialize mailer
	appLogger.Info(ctx, "Initializing mailer service...")
	mailService, err := initMailer(cfg)
	if err != nil {
		appLogger.Fatal(ctx, "Failed to initialize mailer", logger.Err(err))
	}
	appLogger.Info(ctx, "Mailer service initialized",
		logger.String("provider", "smtp"),
		logger.String("from", cfg.SMTPFrom))

	// Initialize auth service
	appLogger.Info(ctx, "Initializing authentication service...")
	authService, err := initAuth(cfg, db, mailService)
	if err != nil {
		appLogger.Fatal(ctx, "Failed to initialize auth", logger.Err(err))
	}
	appLogger.Info(ctx, "Authentication service initialized")

	// Initialize services
	svc := services.New(services.Config{
		DB:      db,
		Auth:    authService,
		Mailer:  mailService,
		Logger:  appLogger,
		Config:  cfg,
	})

	// Initialize extension system
	appLogger.Info(ctx, "Initializing extension system...")
	extensionServices := core.NewExtensionServices(
		db, authService, appLogger,
		svc.Storage(), cfg,
		svc.Collections(), svc.Stats(),
	)

	extensionRegistry := core.NewExtensionRegistry(appLogger, extensionServices)

	// Initialize migration runner for extensions
	migrationRunner := core.NewMigrationRunner(db, appLogger)
	if err := migrationRunner.InitializeMigrationTable(ctx); err != nil {
		appLogger.Warn(ctx, "Failed to initialize migration table")
	}

	// Initialize security manager
	securityManager := core.NewSecurityManager()

	// Initialize metrics collector
	metricsCollector := core.NewMetricsCollector()
	metricsCollector.UpdateActiveExtensions(0) // Will be updated as extensions are enabled

	// Initialize hot reloader for configuration changes
	hotReloader, err := core.NewHotReloader(extensionRegistry, "config.json", appLogger)
	if err != nil {
		appLogger.Warn(ctx, "Failed to initialize hot reloader: "+err.Error())
	} else {
		if err := hotReloader.Start(ctx); err != nil {
			appLogger.Warn(ctx, "Failed to start hot reloader: "+err.Error())
		}
		defer hotReloader.Stop(ctx)
	}

	// Register all discovered extensions
	if err := RegisterExtensions(extensionRegistry); err != nil {
		appLogger.Warn(ctx, "Failed to register extensions: "+err.Error())
	}

	// Enable extensions based on config (for now, enable all)
	for _, ext := range extensionRegistry.List() {
		// Validate extension safety
		extObj, exists := extensionRegistry.Get(ext.Name)
		if !exists || extObj == nil {
			appLogger.Warn(ctx, "Extension not found or is nil: "+ext.Name)
			continue
		}
		if err := securityManager.ValidateExtensionSafety(extObj); err != nil {
			appLogger.Warn(ctx, "Extension failed safety validation: "+ext.Name)
			continue
		}

		// Run migrations
		if err := migrationRunner.RunMigrations(ctx, ext.Name, extObj.Migrations()); err != nil {
			appLogger.Warn(ctx, "Failed to run migrations for "+ext.Name)
		}

		// Enable extension
		if err := extensionRegistry.Enable(ext.Name); err != nil {
			appLogger.Warn(ctx, "Failed to enable extension: "+ext.Name)
		} else {
			// Record metrics for enabled extension
			metricsCollector.RecordHealth(ext.Name, true)
		}

		// Set security policies
		securityManager.SetRateLimit(ext.Name, 100) // 100 requests per second
		securityManager.SetResourceQuota(ext.Name, &core.ResourceQuota{
			MaxMemoryMB:       100,
			MaxGoroutines:     50,
			MaxDatabaseConns:  10,
			MaxRequestsPerSec: 100,
			MaxStorageMB:      50,
		})
	}

	// Update active extensions count
	metricsCollector.UpdateActiveExtensions(len(extensionRegistry.List()))

	appLogger.Info(ctx, "Extension system initialized")

	// Create default admin user
	if err := createDefaultAdmin(ctx, svc, cfg); err != nil {
		appLogger.Warn(ctx, "Failed to create default admin", logger.Err(err))
	}

	// Initialize router
	router := setupRoutes(svc, authService, appLogger, cfg, extensionRegistry)

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
	// For now, use console logger only
	// Database logging can be added later through the logger package
	return logger.New(logger.Config{
		Level:         level,
		Output:        "console",
		Format:        "text",
		IncludeCaller: cfg.Environment == "development",
		IncludeStack:  cfg.Environment == "development",
	})
}

// initDatabase is no longer needed - we use database.New() directly

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
	// Decode hex session secret to bytes
	sessionKey, err := hex.DecodeString(cfg.SessionSecret)
	if err != nil {
		// Fallback to using the raw string if it's not valid hex
		// and ensure it's 32 bytes for AES-256
		sessionKey = []byte(cfg.SessionSecret)
		if len(sessionKey) > 32 {
			sessionKey = sessionKey[:32]
		}
	}

	// Ensure the key is exactly 32 bytes for AES-256
	if len(sessionKey) != 32 {
		// Pad or truncate to 32 bytes
		keyBytes := make([]byte, 32)
		copy(keyBytes, sessionKey)
		sessionKey = keyBytes
	}

	return auth.New(auth.Config{
		DB:           db,
		Mailer:       mailService,
		RootURL:      fmt.Sprintf("http://localhost:%s", cfg.Port),
		BCryptCost:   12,
		SessionName:  "dufflebag-session",
		SessionKey:   sessionKey,
		CookieKey:    sessionKey,
		CSRFKey:      sessionKey,
		DatabaseType: cfg.DatabaseType,
	})
}


func createDefaultAdmin(ctx context.Context, svc *services.Service, cfg *config.Config) error {
	// Check if admin exists
	// Create if not exists
	svc.Logger().Info(ctx, "Checking for default admin user...",
		logger.String("email", cfg.AdminEmail))
	err := svc.CreateAdminUser(ctx, cfg.AdminEmail, cfg.AdminPassword)
	if err != nil {
		svc.Logger().Warn(ctx, "Could not create default admin user", logger.Err(err))
		return err
	}
	svc.Logger().Info(ctx, "Default admin user ready",
		logger.String("email", cfg.AdminEmail))
	return nil
}

func setupRoutes(svc *services.Service, authService *auth.Service, logger logger.Logger, cfg *config.Config, extensionRegistry *core.ExtensionRegistry) *mux.Router {
	router := mux.NewRouter()

	// Middleware
	router.Use(middleware.CORS(cfg))
	router.Use(middleware.Logger(logger))
	router.Use(middleware.WithExtensions(extensionRegistry))
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

	// Main app (protected) - redirect to dashboard
	router.Handle("/", middleware.SessionAuth(svc)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
	}))).Methods("GET")

	// Dashboard pages (protected with role-based access)
	// Direct dashboard route (requires at least manager role for backend access)
	router.Handle("/dashboard",
		middleware.SessionAuth(svc)(
			middleware.RequireManagerOrAdmin(svc)(web.DashboardPage(svc)))).Methods("GET")
	router.Handle("/api/dashboard/cpu-stats",
		middleware.SessionAuth(svc)(
			middleware.RequireManagerOrAdmin(svc)(web.GetCPUStats(svc)))).Methods("GET")
	router.Handle("/api/dashboard/metrics",
		middleware.SessionAuth(svc)(
			middleware.RequireManagerOrAdmin(svc)(web.GetDashboardMetrics(svc)))).Methods("GET")

	// Collections pages (protected with role-based access)
	router.Handle("/collections",
		middleware.SessionAuth(svc)(
			middleware.RequireManagerOrAdmin(svc)(web.CollectionsPage(svc)))).Methods("GET")

	// Admin pages (protected with role-based access)
	router.Handle("/users",
		middleware.SessionAuth(svc)(
			middleware.RequireManagerOrAdmin(svc)(web.UsersPage(svc)))).Methods("GET")
	router.Handle("/database",
		middleware.SessionAuth(svc)(
			middleware.RequireAdmin(svc)(web.DatabasePage(svc)))).Methods("GET")
	router.Handle("/storage",
		middleware.SessionAuth(svc)(
			middleware.RequireAdmin(svc)(web.StoragePage(svc)))).Methods("GET")
	router.Handle("/logs",
		middleware.SessionAuth(svc)(
			middleware.RequireManagerOrAdmin(svc)(web.LogsPage(svc)))).Methods("GET")
	router.Handle("/settings",
		middleware.SessionAuth(svc)(
			middleware.RequireAdmin(svc)(web.SettingsPage(svc)))).Methods("GET")

	// Storage API routes (ADMIN ONLY - File system manipulation)
	storageAPI := router.PathPrefix("/api/storage").Subrouter()
	storageAPI.Use(middleware.SessionAuth(svc))
	storageAPI.Use(middleware.RequireAdmin(svc)) // Admin-only access
	storageAPI.HandleFunc("/buckets", web.CreateBucketHandler(svc)).Methods("POST")
	storageAPI.HandleFunc("/buckets/{bucket}", web.DeleteBucketHandler(svc)).Methods("DELETE")
	storageAPI.HandleFunc("/folders", web.CreateFolderHandler(svc)).Methods("POST")
	storageAPI.HandleFunc("/upload", web.UploadFileHandler(svc)).Methods("POST")
	storageAPI.HandleFunc("/{bucket}/files", web.DeleteFileHandler(svc)).Methods("DELETE")
	storageAPI.HandleFunc("/{bucket}/download", web.DownloadFileHandler(svc)).Methods("GET")
	storageAPI.HandleFunc("/{bucket}/view", web.ViewFileHandler(svc)).Methods("GET", "POST")
	storageAPI.HandleFunc("/signed-url", web.GenerateSignedURLHandler(svc)).Methods("POST")

	// Public signed URL download route (no auth required)
	router.HandleFunc("/api/storage/signed/{bucket}", web.SignedDownloadHandler(svc)).Methods("GET")

	// Database API routes (ADMIN ONLY - Direct database manipulation)
	databaseAPI := router.PathPrefix("/api/database").Subrouter()
	databaseAPI.Use(middleware.SessionAuth(svc))
	databaseAPI.Use(middleware.RequireAdmin(svc)) // CRITICAL: Admin-only access
	databaseAPI.HandleFunc("/insert", web.InsertRowHandler(svc)).Methods("POST")
	databaseAPI.HandleFunc("/update", web.UpdateCellHandler(svc)).Methods("POST")
	databaseAPI.HandleFunc("/delete/{id}", web.DeleteRowHandler(svc)).Methods("DELETE")
	databaseAPI.HandleFunc("/duplicate", web.DuplicateRowHandler(svc)).Methods("POST")
	databaseAPI.HandleFunc("/query", web.ExecuteQueryHandler(svc)).Methods("POST")
	databaseAPI.HandleFunc("/create-table", web.CreateTableHandler(svc)).Methods("POST")

	// Logs API routes (ADMIN ONLY - System logs access)
	logsAPI := router.PathPrefix("/api/v1/admin/logs").Subrouter()
	logsAPI.Use(middleware.SessionAuth(svc))
	logsAPI.Use(middleware.RequireAdmin(svc)) // Admin-only access to logs
	logsAPI.HandleFunc("/stats", web.LogsStatsHandler(svc)).Methods("GET")
	logsAPI.HandleFunc("/details", web.LogDetailsHandler(svc)).Methods("GET")
	logsAPI.HandleFunc("/export", web.ExportLogsHandler(svc)).Methods("GET")
	logsAPI.HandleFunc("/clear", web.ClearLogsHandler(svc)).Methods("POST")

	// Extension management routes (ADMIN ONLY - System configuration)
	extensionHandlers := web.NewExtensionsHandlers(extensionRegistry)
	router.Handle("/extensions",
		middleware.SessionAuth(svc)(
			middleware.RequireAdmin(svc)(http.HandlerFunc(extensionHandlers.ExtensionsPage)))).Methods("GET")
	
	// Extension API routes (ADMIN ONLY - System configuration)
	extensionsAPI := router.PathPrefix("/api/extensions").Subrouter()
	extensionsAPI.Use(middleware.SessionAuth(svc))
	extensionsAPI.Use(middleware.RequireAdmin(svc)) // Admin-only access
	extensionsAPI.HandleFunc("/toggle", extensionHandlers.ToggleExtension).Methods("POST")
	extensionsAPI.HandleFunc("/config", extensionHandlers.GetExtensionConfig).Methods("GET")
	extensionsAPI.HandleFunc("/config", extensionHandlers.SaveExtensionConfig).Methods("POST")

	// Extension management routes
	if extensionRegistry != nil {
		// Register extension routes with /ext prefix
		extensionRegistry.RegisterRoutes(router)

		// Extension management API
		// TODO: Implement extension management API when needed
		// extensionHandlers := web.NewExtensionHandlers(extensionRegistry, svc, logger)
		// extensionHandlers.RegisterRoutes(router)
	}

	// API routes
	if cfg.EnableAPI {
		api := router.PathPrefix("/api/v1").Subrouter()

		// Public API endpoints
		api.HandleFunc("/auth/login", handlers.APILogin(svc)).Methods("POST")
		api.HandleFunc("/auth/signup", handlers.APISignup(svc)).Methods("POST")
		api.HandleFunc("/auth/refresh", handlers.APIRefresh(svc)).Methods("POST")

		// Protected API endpoints with role-based access
		protected := api.PathPrefix("").Subrouter()
		protected.Use(middleware.JWTAuth(cfg.JWTSecret))
		protected.Use(middleware.EnforceRoleHierarchy(svc)) // Block 'deleted' role users

		// Collections API (managers can read, admins can write)
		protected.Handle("/collections",
			middleware.RequireManagerOrAdmin(svc)(handlers.ListCollections(svc))).Methods("GET")
		protected.Handle("/collections",
			middleware.RequireAdmin(svc)(handlers.CreateCollection(svc))).Methods("POST")
		protected.Handle("/collections/{name}",
			middleware.RequireManagerOrAdmin(svc)(handlers.GetCollection(svc))).Methods("GET")
		protected.Handle("/collections/{name}",
			middleware.RequireAdmin(svc)(handlers.UpdateCollection(svc))).Methods("PUT")
		protected.Handle("/collections/{name}",
			middleware.RequireAdmin(svc)(handlers.DeleteCollection(svc))).Methods("DELETE")

		// Records API (managers can read, admins can write)
		protected.Handle("/collections/{collection}/records",
			middleware.RequireManagerOrAdmin(svc)(handlers.ListRecords(svc))).Methods("GET")
		protected.Handle("/collections/{collection}/records",
			middleware.RequireAdmin(svc)(handlers.CreateRecord(svc))).Methods("POST")
		protected.Handle("/collections/{collection}/records/{id}",
			middleware.RequireManagerOrAdmin(svc)(handlers.GetRecord(svc))).Methods("GET")
		protected.Handle("/collections/{collection}/records/{id}",
			middleware.RequireAdmin(svc)(handlers.UpdateRecord(svc))).Methods("PUT")
		protected.Handle("/collections/{collection}/records/{id}",
			middleware.RequireAdmin(svc)(handlers.DeleteRecord(svc))).Methods("DELETE")

		// Storage API (managers can read, admins can write)
		protected.Handle("/storage/buckets",
			middleware.RequireManagerOrAdmin(svc)(handlers.ListBuckets(svc))).Methods("GET")
		protected.Handle("/storage/buckets",
			middleware.RequireAdmin(svc)(handlers.CreateBucket(svc))).Methods("POST")
		protected.Handle("/storage/buckets/{bucket}",
			middleware.RequireAdmin(svc)(handlers.DeleteBucket(svc))).Methods("DELETE")
		protected.Handle("/storage/{bucket}/upload",
			middleware.RequireAdmin(svc)(handlers.UploadFile(svc))).Methods("POST")
		protected.Handle("/storage/{bucket}/{path:.*}",
			middleware.RequireManagerOrAdmin(svc)(handlers.GetFile(svc))).Methods("GET")
		protected.Handle("/storage/{bucket}/{path:.*}",
			middleware.RequireAdmin(svc)(handlers.DeleteFile(svc))).Methods("DELETE")

		// Auth management API (admin only for all operations)
		admin := protected.PathPrefix("/admin").Subrouter()
		admin.Use(middleware.RequireAdmin(svc))

		admin.HandleFunc("/users", handlers.ListUsers(svc)).Methods("GET")
		admin.HandleFunc("/users/{id}", handlers.GetUser(svc)).Methods("GET")
		admin.HandleFunc("/users/{id}", handlers.UpdateUser(svc)).Methods("PUT")
		admin.HandleFunc("/users/{id}", handlers.DeleteUser(svc)).Methods("DELETE")

		// User management routes (web handlers)
		admin.HandleFunc("/users/{id}/role", web.UpdateUserRole(svc)).Methods("PUT")
		admin.HandleFunc("/users/{id}/password-reset", web.SendPasswordReset(svc)).Methods("POST")
		admin.HandleFunc("/users/{id}/lock", web.LockUser(svc)).Methods("POST")
		admin.HandleFunc("/users/{id}/unlock", web.UnlockUser(svc)).Methods("POST")

		// Logs API (managers can read logs)
		protected.Handle("/admin/logs",
			middleware.RequireManagerOrAdmin(svc)(handlers.GetLogs(svc))).Methods("GET")
		protected.Handle("/admin/logs/requests",
			middleware.RequireManagerOrAdmin(svc)(handlers.GetRequestLogs(svc))).Methods("GET")
	}

	// WebSocket for real-time subscriptions
	router.HandleFunc("/ws", handlers.WebSocketHandler(svc)).Methods("GET")

	// Register extension routes
	if extensionRegistry != nil {
		// Register extension routes
		extensionRegistry.RegisterRoutes(router)

		// Register extension management API
		// TODO: Implement when needed
		// extHandlers := web.NewExtensionHandlers(extensionRegistry, svc, logger)
		// extHandlers.RegisterRoutes(router)
	}

	return router
}
