package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/dufflebagbase/api"
	"github.com/suppers-ai/dufflebagbase/config"
	"github.com/suppers-ai/dufflebagbase/database"
	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/dufflebagbase/services"
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

	// Run migrations
	db.AutoMigrate(
		&models.User{},
		&models.Setting{},
		&models.Collection{},
		&models.CollectionRecord{},
		&models.ExtensionMigration{},
	)

	// Initialize services
	authService := services.NewAuthService(db)
	userService := services.NewUserService(db)
	storageService := services.NewStorageService(cfg.Storage)
	collectionService := services.NewCollectionService(db)
	databaseService := services.NewDatabaseService(db)
	settingsService := services.NewSettingsService(db)

	// Create default admin user if needed
	if os.Getenv("DEFAULT_ADMIN_EMAIL") != "" && os.Getenv("DEFAULT_ADMIN_PASSWORD") != "" {
		if err := authService.CreateDefaultAdmin(
			os.Getenv("DEFAULT_ADMIN_EMAIL"),
			os.Getenv("DEFAULT_ADMIN_PASSWORD"),
		); err != nil {
			log.Printf("Failed to create default admin: %v", err)
		}
	}

	// Setup API router
	apiRouter := api.NewAPI(
		authService,
		userService,
		storageService,
		collectionService,
		databaseService,
		settingsService,
	)

	// Setup main router
	router := mux.NewRouter()
	
	// Apply Prometheus metrics middleware
	router.Use(api.PrometheusMiddleware)

	// API routes
	router.PathPrefix("/api").Handler(apiRouter)

	// Serve admin UI for all other routes
	router.PathPrefix("/").Handler(ServeAdmin())

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}