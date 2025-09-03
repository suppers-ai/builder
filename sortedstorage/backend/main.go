package main

import (
	"context"
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	auth "github.com/suppers-ai/auth"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/solobase/api"
	"github.com/suppers-ai/solobase/config"
	"github.com/suppers-ai/solobase/database"
	"github.com/suppers-ai/solobase/models"
	"github.com/suppers-ai/solobase/services"
	storage "github.com/suppers-ai/storage"
)

//go:embed all:build/*
var frontendFiles embed.FS

func main() {
	// Load configuration
	cfg := config.Load()

	// Override port if specified
	if port := os.Getenv("PORT"); port != "" {
		cfg.Port = port
	} else if cfg.Port == "" {
		cfg.Port = "3000"
	}

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
	
	// Auto-migrate models
	log.Println("Running auto-migrations...")
	if err := db.AutoMigrate(
		&auth.User{},
		&models.Setting{},
		&models.Collection{},
		&models.CollectionRecord{},
		&models.ExtensionMigration{},
		&storage.StorageObject{},
		&storage.StorageBucket{},
		&logger.LogModel{},
		&logger.RequestLogModel{},
	); err != nil {
		log.Printf("Warning: AutoMigrate failed: %v", err)
	}

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
		adminEmail = "admin@sortedstorage.com"
	}
	if adminPassword == "" {
		adminPassword = "AdminSecurePass2024!"
	}

	log.Printf("========================================")
	log.Printf("SortedStorage with Integrated Backend")
	log.Printf("Default Admin Credentials:")
	log.Printf("Email: %s", adminEmail)
	log.Printf("Password: %s", adminPassword)
	log.Printf("========================================")

	if err := authService.CreateDefaultAdmin(adminEmail, adminPassword); err != nil {
		log.Printf("Note: Default admin might already exist: %v", err)
	}

	// Create API instance
	apiInstance := api.NewAPI(
		db,
		authService,
		userService,
		storageService,
		collectionService,
		databaseService,
		settingsService,
		logsService,
	)

	// Create main router
	mainRouter := mux.NewRouter()

	// Mount API routes under /api
	mainRouter.PathPrefix("/api/").Handler(http.StripPrefix("/api", apiInstance.Router))

	// Serve frontend files
	frontendFS, err := fs.Sub(frontendFiles, "build")
	if err != nil {
		log.Fatal("Failed to create frontend filesystem:", err)
	}

	fileServer := http.FileServer(http.FS(frontendFS))

	// Handle all other routes with the frontend
	mainRouter.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		// Check if file exists in embedded filesystem
		file, err := frontendFS.Open(strings.TrimPrefix(path, "/"))
		if err == nil {
			file.Close()
			// Serve the file directly
			fileServer.ServeHTTP(w, r)
			return
		}

		// For client-side routing, serve index.html for non-file requests
		if filepath.Ext(path) == "" || strings.Contains(path, ".") == false {
			// Reset the path to serve index.html
			r.URL.Path = "/"
		}
		
		fileServer.ServeHTTP(w, r)
	})

	// Configure CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// CORS headers
			origin := r.Header.Get("Origin")
			if origin == "" {
				origin = "*"
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			// Handle preflight requests
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// Apply CORS middleware
	mainRouter.Use(corsMiddleware)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      mainRouter,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting SortedStorage server on port %s", cfg.Port)
		log.Printf("Frontend: http://localhost:%s", cfg.Port)
		log.Printf("API: http://localhost:%s/api", cfg.Port)
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}