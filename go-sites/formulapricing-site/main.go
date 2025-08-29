package main

import (
	"context"
	"fmt"
	"mime"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"github.com/suppers-ai/formulapricing-site/config"
	"github.com/suppers-ai/formulapricing-site/handlers"
	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/metrics"
	"github.com/suppers-ai/formulapricing-site/middleware"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		fmt.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize logger
	log := logger.New(cfg.LogLevel)

	// Initialize metrics if enabled
	var m *metrics.Metrics
	if cfg.EnableMetrics {
		m = metrics.NewMetrics()
		log.Info("Metrics collection enabled")
	}

	log.Info("Starting Formula Pricing Site")
	log.Info("Environment: %s", cfg.Environment)
	log.Info("Port: %s", cfg.Port)
	log.Info("Static Path: %s", cfg.StaticPath)
	log.Info("Log Level: %s", cfg.LogLevel)
	log.Info("Read Timeout: %ds", cfg.ReadTimeout)
	log.Info("Write Timeout: %ds", cfg.WriteTimeout)
	log.Info("Idle Timeout: %ds", cfg.IdleTimeout)
	log.Info("Request Timeout: %ds", cfg.RequestTimeout)

	// Initialize router
	router := setupRoutes(cfg, log, m)

	// Create HTTP server with configurable performance settings
	srv := &http.Server{
		Addr:           fmt.Sprintf(":%s", cfg.Port),
		Handler:        router,
		ReadTimeout:    time.Duration(cfg.ReadTimeout) * time.Second,
		WriteTimeout:   time.Duration(cfg.WriteTimeout) * time.Second,
		IdleTimeout:    time.Duration(cfg.IdleTimeout) * time.Second,
		MaxHeaderBytes: cfg.MaxHeaderBytes,
	}

	// Start server in goroutine
	go func() {
		log.Info("Server starting on http://localhost:%s", cfg.Port)
		log.Info("Health check available at http://localhost:%s/health", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("Server forced to shutdown: %v", err)
	}

	log.Info("Server stopped")
}

func setupRoutes(cfg *config.Config, log *logger.Logger, m *metrics.Metrics) *mux.Router {
	router := mux.NewRouter()

	// Apply middleware in order (order matters!)
	if m != nil {
		// Use metrics-enabled middleware when metrics are enabled
		router.Use(middleware.RecoveryWithMetrics(log, m))                                               // First: catch panics
		router.Use(middleware.SecurityHeaders)                                                           // Second: set security headers
		router.Use(middleware.ErrorHandler(log))                                                         // Third: centralized error handling
		router.Use(middleware.MetricsLogger(log, m))                                                     // Fourth: log requests and record metrics
		router.Use(middleware.TimeoutWithMetrics(time.Duration(cfg.RequestTimeout)*time.Second, log, m)) // Fifth: request timeout
		router.Use(middleware.GzipCompression)                                                           // Last: compress responses
	} else {
		// Use standard middleware when metrics are disabled
		router.Use(middleware.Recovery(log))                                               // First: catch panics
		router.Use(middleware.SecurityHeaders)                                             // Second: set security headers
		router.Use(middleware.ErrorHandler(log))                                           // Third: centralized error handling
		router.Use(middleware.RequestLogger(log))                                          // Fourth: log requests
		router.Use(middleware.Timeout(time.Duration(cfg.RequestTimeout)*time.Second, log)) // Fifth: request timeout
		router.Use(middleware.GzipCompression)                                             // Last: compress responses
	}

	// Static files with proper caching headers and MIME types
	staticHandler := http.StripPrefix("/static/", addStaticHeaders(http.FileServer(http.Dir(cfg.StaticPath+"/"))))
	router.PathPrefix("/static/").Handler(staticHandler)

	// Serve static assets from root for compatibility with original site
	router.HandleFunc("/professor-gopher.png", serveStaticAssetWithErrorHandling(cfg.StaticPath+"/images/professor-gopher.png", log))
	router.HandleFunc("/wave-background-tile-512-thinner-seamless.svg", serveStaticAssetWithErrorHandling(cfg.StaticPath+"/images/wave-background-tile-512-thinner-seamless.svg", log))
	router.HandleFunc("/wave-background-tile-512-thick.svg", serveStaticAssetWithErrorHandling(cfg.StaticPath+"/images/wave-background-tile-512-thick.svg", log))

	// Serve favicon if it exists
	router.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		faviconPath := cfg.StaticPath + "/favicon.ico"
		if _, err := os.Stat(faviconPath); err == nil {
			serveStaticAssetWithErrorHandling(faviconPath, log)(w, r)
		} else {
			// Return a 204 No Content for missing favicon to avoid 404 errors in logs
			w.WriteHeader(http.StatusNoContent)
		}
	})

	// Health check endpoints for monitoring (use enhanced version)
	router.HandleFunc("/health", handlers.EnhancedHealthHandler(log)).Methods("GET", "HEAD")
	router.HandleFunc("/healthz", handlers.EnhancedHealthHandler(log)).Methods("GET", "HEAD") // Alternative endpoint

	// Metrics endpoints (only if metrics are enabled)
	if m != nil {
		router.HandleFunc("/metrics", handlers.MetricsHandler(m, log)).Methods("GET")
		router.HandleFunc("/metrics/prometheus", handlers.PrometheusMetricsHandler(m, log)).Methods("GET")
	}

	// Application routes
	router.HandleFunc("/", handlers.HomeHandler(log)).Methods("GET")
	router.HandleFunc("/faq", handlers.FAQHandler(log)).Methods("GET")
	router.HandleFunc("/docs", handlers.DocsHandler(log)).Methods("GET")
	router.HandleFunc("/demo", handlers.DemoHandler(log)).Methods("GET")
	router.HandleFunc("/api-reference", handlers.APIReferenceHandler(log)).Methods("GET")
	router.HandleFunc("/examples", handlers.ExamplesHandler(log)).Methods("GET")
	router.HandleFunc("/search", handlers.SearchHandler(log)).Methods("GET")

	// Enhanced 404 handler
	router.NotFoundHandler = handlers.EnhancedNotFoundHandler(log)

	return router
}

// addStaticHeaders adds appropriate cache headers and MIME types for static assets
func addStaticHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set proper MIME type based on file extension
		ext := filepath.Ext(r.URL.Path)
		if mimeType := mime.TypeByExtension(ext); mimeType != "" {
			w.Header().Set("Content-Type", mimeType)
		}

		// Set cache headers based on asset type
		setCacheHeaders(w, ext)

		next.ServeHTTP(w, r)
	})
}

// setCacheHeaders sets appropriate cache headers based on file type
func setCacheHeaders(w http.ResponseWriter, ext string) {
	switch strings.ToLower(ext) {
	case ".css", ".js":
		// Cache CSS and JS for 1 hour (can be updated frequently during development)
		w.Header().Set("Cache-Control", "public, max-age=3600")
		w.Header().Set("Expires", time.Now().Add(time.Hour).Format(http.TimeFormat))
	case ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico":
		// Cache images for 24 hours (less likely to change)
		w.Header().Set("Cache-Control", "public, max-age=86400")
		w.Header().Set("Expires", time.Now().Add(24*time.Hour).Format(http.TimeFormat))
	case ".woff", ".woff2", ".ttf", ".eot":
		// Cache fonts for 1 week (very stable)
		w.Header().Set("Cache-Control", "public, max-age=604800")
		w.Header().Set("Expires", time.Now().Add(7*24*time.Hour).Format(http.TimeFormat))
	default:
		// Default cache for 1 hour
		w.Header().Set("Cache-Control", "public, max-age=3600")
		w.Header().Set("Expires", time.Now().Add(time.Hour).Format(http.TimeFormat))
	}
}

// serveStaticAsset creates a handler for serving individual static assets
func serveStaticAsset(filePath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set proper MIME type
		ext := filepath.Ext(filePath)
		if mimeType := mime.TypeByExtension(ext); mimeType != "" {
			w.Header().Set("Content-Type", mimeType)
		}

		// Set cache headers
		setCacheHeaders(w, ext)

		// Serve the file
		http.ServeFile(w, r, filePath)
	}
}

// serveStaticAssetWithErrorHandling creates a handler for serving individual static assets with error handling
func serveStaticAssetWithErrorHandling(filePath string, log *logger.Logger) http.HandlerFunc {
	eh := handlers.NewErrorHandler(log)
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				eh.RecoverFromPanic(w, r)
			}
		}()

		// Check if file exists
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			eh.HandleNotFound(w, r)
			return
		} else if err != nil {
			eh.HandleInternalError(w, r, err, "Failed to check static asset")
			return
		}

		// Set proper MIME type
		ext := filepath.Ext(filePath)
		if mimeType := mime.TypeByExtension(ext); mimeType != "" {
			w.Header().Set("Content-Type", mimeType)
		}

		// Set cache headers
		setCacheHeaders(w, ext)

		// Serve the file
		http.ServeFile(w, r, filePath)
	}
}
