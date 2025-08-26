package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"formulapricing/auth"
	"formulapricing/database"
	"formulapricing/handlers"
	"formulapricing/models"
	"formulapricing/web"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/suppers-ai/logger"
)

func main() {
	// Load .env file if it exists
	godotenv.Load()

	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.CloseDB()

	// Initialize logger with database support
	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel == "" {
		logLevel = "INFO"
	}
	
	level, _ := logger.ParseLevel(logLevel)
	appLogger, err := logger.NewWithDatabase(logger.Config{
		Level:         level,
		Output:        "multi",  // Console, file, and database
		Format:        "json",
		FilePath:      "formulapricing.log",
		BufferSize:    1000,
		FlushInterval: 5 * time.Second,
		AsyncMode:     true,
		EnableRotation: true,
		MaxSize:       100, // 100 MB
		MaxAge:        30,  // 30 days
		MaxBackups:    10,
	}, database.GetDB())
	
	if err != nil {
		log.Printf("Failed to initialize logger: %v, falling back to console", err)
		appLogger, _ = logger.New(logger.Config{
			Level:  level,
			Output: "console",
			Format: "text",
		})
	}
	defer appLogger.Close()
	
	// Set as default logger
	logger.SetDefault(appLogger)
	
	ctx := context.Background()
	appLogger.Info(ctx, "Formula Pricing application starting",
		logger.String("log_level", logLevel))

	// Run migrations
	if err := database.AutoMigrate(); err != nil {
		appLogger.Fatal(ctx, "Failed to run migrations", logger.Err(err))
	}

	// Initialize session store
	sessionSecret := os.Getenv("SESSION_SECRET")
	if sessionSecret == "" {
		// Use a proper 64-character hex secret for development
		// In production, set SESSION_SECRET environment variable
		sessionSecret = "a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447"
		appLogger.Warn(ctx, "Using default session secret. Set SESSION_SECRET in production!")
	} else {
		appLogger.Info(ctx, "Using session secret from environment",
			logger.Int("secret_length", len(sessionSecret)))
	}
	auth.InitSessionStore(sessionSecret)

	// Create default user from environment
	defaultEmail := os.Getenv("DEFAULT_USER_EMAIL")
	defaultPassword := os.Getenv("DEFAULT_USER_PASSWORD")
	if defaultEmail == "" {
		defaultEmail = "admin@example.com"
	}
	if defaultPassword == "" {
		defaultPassword = "admin123"
	}
	
	if err := models.GetOrCreateDefaultUser(defaultEmail, defaultPassword); err != nil {
		appLogger.Warn(ctx, "Failed to create default user",
			logger.Err(err),
			logger.String("email", defaultEmail))
	} else {
		appLogger.Info(ctx, "Default user ensured",
			logger.String("email", defaultEmail))
	}

	// Create router
	router := mux.NewRouter()

	// Add logging middleware using the new logger package
	loggerMiddleware := logger.HTTPMiddleware(appLogger, &logger.MiddlewareConfig{
		SkipPaths: []string{
			"/health",
			"/static/",
			"/favicon.ico",
		},
		LogHeaders:      true,
		LogRequestBody:  true,
		LogResponseBody: true,
		MaxBodySize:     4096,
	})
	router.Use(loggerMiddleware)
	
	// Add CORS middleware for API routes
	router.Use(corsMiddleware)

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Variables endpoints
	api.HandleFunc("/variables", handlers.GetVariables).Methods("GET")
	api.HandleFunc("/variables", auth.RequireAdminAPI(handlers.CreateVariable)).Methods("POST")
	api.HandleFunc("/variables/{id}", handlers.GetVariable).Methods("GET")
	api.HandleFunc("/variables/{id}", auth.RequireAdminAPI(handlers.UpdateVariable)).Methods("PUT")
	api.HandleFunc("/variables/{id}", auth.RequireAdminAPI(handlers.DeleteVariable)).Methods("DELETE")

	// Calculations endpoints
	api.HandleFunc("/calculations", handlers.GetCalculations).Methods("GET")
	api.HandleFunc("/calculations", auth.RequireAdminAPI(handlers.CreateCalculation)).Methods("POST")
	api.HandleFunc("/calculations/{id}", handlers.GetCalculation).Methods("GET")
	api.HandleFunc("/calculations/{id}", auth.RequireAdminAPI(handlers.UpdateCalculation)).Methods("PUT")
	api.HandleFunc("/calculations/{id}", auth.RequireAdminAPI(handlers.DeleteCalculation)).Methods("DELETE")

	// Conditions endpoints
	api.HandleFunc("/conditions", handlers.GetConditions).Methods("GET")
	api.HandleFunc("/conditions", auth.RequireAdminAPI(handlers.CreateCondition)).Methods("POST")
	api.HandleFunc("/conditions/{id}", handlers.GetCondition).Methods("GET")
	api.HandleFunc("/conditions/{id}", auth.RequireAdminAPI(handlers.UpdateCondition)).Methods("PUT")
	api.HandleFunc("/conditions/{id}", auth.RequireAdminAPI(handlers.DeleteCondition)).Methods("DELETE")

	// Pricing endpoints
	api.HandleFunc("/pricing", handlers.GetPricings).Methods("GET")
	api.HandleFunc("/pricing", auth.RequireAdminAPI(handlers.CreatePricing)).Methods("POST")
	api.HandleFunc("/pricing/{id}", handlers.GetPricing).Methods("GET")
	api.HandleFunc("/pricing/{id}", auth.RequireAdminAPI(handlers.UpdatePricing)).Methods("PUT")
	api.HandleFunc("/pricing/{id}", auth.RequireAdminAPI(handlers.DeletePricing)).Methods("DELETE")
	api.HandleFunc("/pricing/{name}/variables", handlers.GetPricingWithVariables).Methods("GET")

	// Users endpoints (users management requires admin)
	api.HandleFunc("/users", auth.RequireAdminAPI(handlers.GetUsers)).Methods("GET")
	api.HandleFunc("/users", auth.RequireAdminAPI(handlers.CreateUser)).Methods("POST")
	api.HandleFunc("/users/{id}", auth.RequireAdminAPI(handlers.GetUser)).Methods("GET")
	api.HandleFunc("/users/{id}/password", auth.RequireAdminAPI(handlers.UpdateUserPassword)).Methods("PUT")
	api.HandleFunc("/users/{id}/role", auth.RequireAdminAPI(handlers.UpdateUserRole)).Methods("PUT")
	api.HandleFunc("/users/{id}", auth.RequireAdminAPI(handlers.DeleteUser)).Methods("DELETE")

	// Calculate endpoint
	api.HandleFunc("/calculate", handlers.Calculate).Methods("POST")

	// Payment endpoints
	api.HandleFunc("/checkout", handlers.CreateCheckout).Methods("POST")
	api.HandleFunc("/payments/webhook", handlers.HandlePaymentWebhook).Methods("POST")
	api.HandleFunc("/payments/success", handlers.PaymentSuccess).Methods("GET")
	api.HandleFunc("/payments/cancel", handlers.PaymentCancel).Methods("GET")
	api.HandleFunc("/purchases", handlers.GetPurchases).Methods("GET")
	api.HandleFunc("/purchases/simulate", auth.RequireAdminAPI(handlers.SimulatePurchase)).Methods("POST")
	
	// Payment provider settings
	api.HandleFunc("/payment-providers", auth.RequireAdminAPI(handlers.GetPaymentProviders)).Methods("GET")
	api.HandleFunc("/payment-providers/{name}", handlers.GetPaymentProvider).Methods("GET")
	api.HandleFunc("/payment-providers/{name}", auth.RequireAdminAPI(handlers.UpdatePaymentProvider)).Methods("PUT")

	// Health check endpoint
	api.HandleFunc("/health", healthCheck).Methods("GET")

	// Web routes
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if auth.IsAuthenticated(r) {
			http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
		} else {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
		}
	}).Methods("GET")
	
	// Static files
	router.PathPrefix("/static/").HandlerFunc(web.ServeStatic).Methods("GET")
	
	router.HandleFunc("/login", web.LoginPage).Methods("GET", "POST")
	router.HandleFunc("/logout", web.Logout).Methods("GET")
	
	// Protected web routes (with and without trailing slash)
	router.HandleFunc("/dashboard", auth.RequireAuth(web.Dashboard)).Methods("GET")
	router.HandleFunc("/dashboard/", auth.RequireAuth(web.Dashboard)).Methods("GET")
	router.HandleFunc("/dashboard/logs", auth.RequireAuth(web.DashboardLogs)).Methods("GET")
	router.HandleFunc("/dashboard/logs/", auth.RequireAuth(web.DashboardLogs)).Methods("GET")
	router.HandleFunc("/dashboard/settings", auth.RequireAuth(web.DashboardSettings)).Methods("GET")
	router.HandleFunc("/dashboard/settings/", auth.RequireAuth(web.DashboardSettings)).Methods("GET")
	
	// Entity management pages
	router.HandleFunc("/variables", auth.RequireAuth(web.VariablesPage)).Methods("GET")
	router.HandleFunc("/calculations", auth.RequireAuth(web.CalculationsPage)).Methods("GET")
	router.HandleFunc("/conditions", auth.RequireAuth(web.ConditionsPage)).Methods("GET")
	router.HandleFunc("/pricing", auth.RequireAuth(web.PricingPage)).Methods("GET")
	router.HandleFunc("/calculate", auth.RequireAuth(web.CalculatePage)).Methods("GET")
	router.HandleFunc("/purchases", auth.RequireAuth(web.PurchasesPage)).Methods("GET")
	router.HandleFunc("/users", auth.RequireAdmin(web.UsersPage)).Methods("GET")

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	appLogger.Info(ctx, "FormulaPricing server starting",
		logger.String("port", port),
		logger.String("web_interface", fmt.Sprintf("http://localhost:%s", port)),
		logger.String("api_endpoint", fmt.Sprintf("http://localhost:%s/api", port)),
		logger.String("default_user", defaultEmail))
	
	if err := http.ListenAndServe(":"+port, router); err != nil {
		appLogger.Fatal(ctx, "Failed to start server", logger.Err(err))
	}
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"healthy","service":"formulapricing"}`)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only apply CORS headers to API routes
		if strings.HasPrefix(r.URL.Path, "/api") {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}