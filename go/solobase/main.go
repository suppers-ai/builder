package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/solobase/api"
	"github.com/suppers-ai/solobase/config"
	"github.com/suppers-ai/solobase/database"
	auth "github.com/suppers-ai/auth"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/solobase/models"
	"github.com/suppers-ai/solobase/services"
	storage "github.com/suppers-ai/storage"
)

func main() {
	// Load configuration
	cfg := config.Load()

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
	
	// Apply middleware
	router.Use(services.HTTPLoggingMiddleware(dbLogger))
	router.Use(api.PrometheusMiddleware)

	// API routes - strip /api prefix and pass to API router
	router.PathPrefix("/api").Handler(http.StripPrefix("/api", apiRouter))

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
	
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		dbLogger.Error(nil, "Server failed to start",
			logger.String("error", err.Error()),
			logger.String("port", port),
		)
		log.Fatal("Server failed to start:", err)
	}
}