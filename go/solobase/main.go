package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	auth "github.com/suppers-ai/auth"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/solobase/admin"
	"github.com/suppers-ai/solobase/api"
	"github.com/suppers-ai/solobase/config"
	"github.com/suppers-ai/solobase/database"
	"github.com/suppers-ai/solobase/extensions"
	"github.com/suppers-ai/solobase/models"
	"github.com/suppers-ai/solobase/services"
	storage "github.com/suppers-ai/storage"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set JWT secret for API
	api.SetJWTSecret(cfg.JWTSecret)

	// Initialize database
	log.Printf("Initializing database with type: %s", cfg.Database.Type)
	db, err := database.New(cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	log.Printf("Successfully connected to %s database", cfg.Database.Type)
	defer db.Close()

	// Run migrations
	if err := db.Migrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize database logger early for logging
	earlyDbLogger := services.NewDBLogger(db)

	// Run migrations
	db.AutoMigrate(
		&auth.User{},
		&models.Setting{},
		&models.Collection{},
		&models.CollectionRecord{},
		&models.ExtensionMigration{},
		&storage.StorageObject{},
		&storage.StorageBucket{},
		&logger.LogModel{},
		&logger.RequestLogModel{},
	)

	// Log database migrations completed
	earlyDbLogger.Info(nil, "Database migrations completed successfully",
		logger.String("database", cfg.Database.Type),
	)

	// Setup database metrics tracking
	database.RecordDBQueryFunc = api.RecordDBQuery

	// Initialize services
	authService := services.NewAuthService(db)
	userService := services.NewUserService(db)
	storageService := services.NewStorageService(db, cfg.Storage)
	collectionService := services.NewCollectionService(db)
	databaseService := services.NewDatabaseService(db)
	settingsService := services.NewSettingsService(db)
	logsService := services.NewLogsService(db)

	// Create default admin user if needed
	adminEmail := os.Getenv("DEFAULT_ADMIN_EMAIL")
	adminPassword := os.Getenv("DEFAULT_ADMIN_PASSWORD")

	if adminEmail == "" {
		adminEmail = "admin@example.com"
	}
	if adminPassword == "" {
		adminPassword = "admin123"
	}

	log.Printf("========================================")
	log.Printf("Default Admin Credentials:")
	log.Printf("Email: %s", adminEmail)
	log.Printf("Password: %s", adminPassword)
	log.Printf("========================================")

	if err := authService.CreateDefaultAdmin(adminEmail, adminPassword); err != nil {
		log.Printf("Failed to create default admin: %v", err)
		earlyDbLogger.Warn(nil, "Failed to create default admin",
			logger.String("error", err.Error()),
			logger.String("email", adminEmail),
		)
	} else {
		earlyDbLogger.Info(nil, "Default admin user configured",
			logger.String("email", adminEmail),
		)
	}

	// Setup API router
	apiRouter := api.NewAPI(
		db,
		authService,
		userService,
		storageService,
		collectionService,
		databaseService,
		settingsService,
		logsService,
	)

	// Setup main router
	router := mux.NewRouter()

	// Initialize database logger
	dbLogger := services.NewDBLogger(db)

	// Log application startup
	dbLogger.Info(nil, "Application starting",
		logger.String("version", "1.0.0"),
		logger.String("database_type", cfg.Database.Type),
		logger.String("storage_type", cfg.Storage.Type),
	)

	// Initialize extension system
	extensionManager, err := extensions.NewExtensionManager(db.DB, dbLogger)
	if err != nil {
		log.Fatal("Failed to create extension manager:", err)
	}

	// Initialize extensions
	ctx := context.Background()
	if err := extensionManager.Initialize(ctx); err != nil {
		log.Fatal("Failed to initialize extensions:", err)
	}

	// Apply middleware
	router.Use(services.HTTPLoggingMiddleware(dbLogger))
	router.Use(api.PrometheusMiddleware)

	// Apply extension middleware
	router.Use(func(next http.Handler) http.Handler {
		return extensionManager.ApplyMiddleware(next)
	})

	// Register extension routes
	extensionManager.RegisterRoutes(router)
	
	// Register admin extension management routes
	adminExtHandler := admin.NewExtensionsHandler(extensionManager, dbLogger)
	adminExtHandler.RegisterRoutes(router)

	// API routes - strip /api prefix and pass to API router
	router.PathPrefix("/api").Handler(http.StripPrefix("/api", apiRouter))

	// Serve static files
	staticDir := "./static/"
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(staticDir))))
	
	// Serve storage files (both internal and extension storage)
	storageDir := "./.data/storage/"
	router.PathPrefix("/storage/").Handler(http.StripPrefix("/storage/", http.FileServer(http.Dir(storageDir))))

	// Serve admin UI for all other routes
	router.PathPrefix("/").Handler(ServeAdmin())

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Log server startup
	dbLogger.Info(nil, "HTTP server starting",
		logger.String("port", port),
		logger.String("environment", os.Getenv("ENVIRONMENT")),
	)

	// Create HTTP server
	server := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Setup graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		dbLogger.Info(nil, "Shutdown signal received, starting graceful shutdown")

		// Create shutdown context with timeout
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Shutdown extensions first
		if err := extensionManager.Shutdown(shutdownCtx); err != nil {
			dbLogger.Error(shutdownCtx, "Extension shutdown error", logger.Err(err))
		}

		// Shutdown HTTP server
		if err := server.Shutdown(shutdownCtx); err != nil {
			dbLogger.Error(shutdownCtx, "Server shutdown error", logger.Err(err))
		}
	}()

	log.Printf("Server starting on port %s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		dbLogger.Error(nil, "Server failed to start",
			logger.String("error", err.Error()),
			logger.String("port", port),
		)
		log.Fatal("Server failed to start:", err)
	}

	dbLogger.Info(nil, "Server shutdown complete")
}
