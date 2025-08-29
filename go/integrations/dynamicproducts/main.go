package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"dynamicproducts/handlers"
	"dynamicproducts/middleware"
	"dynamicproducts/models"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database
	if err := models.InitDB(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer models.CloseDB()

	// Check database migrations
	if err := models.RunMigrations(); err != nil {
		log.Printf("Warning: %v", err)
		log.Println("Please ensure database migrations are run before starting the server")
	}

	// Initialize session store
	sessionSecret := os.Getenv("SESSION_SECRET")
	if sessionSecret == "" {
		// Use a proper secret in production
		sessionSecret = "dynamicproducts-default-secret-change-in-production-2024"
		log.Println("WARNING: Using default session secret. Set SESSION_SECRET environment variable in production!")
	}
	middleware.InitSessionStore(sessionSecret)

	// Create default admin user if specified
	defaultEmail := os.Getenv("DEFAULT_ADMIN_EMAIL")
	defaultPassword := os.Getenv("DEFAULT_ADMIN_PASSWORD")
	if defaultEmail == "" {
		defaultEmail = "admin@example.com"
	}
	if defaultPassword == "" {
		defaultPassword = "solobaseadmin123"
	}

	if err := models.CreateDefaultUser(defaultEmail, defaultPassword); err != nil {
		log.Printf("Warning: Failed to create default user: %v", err)
	}

	// Create router
	router := mux.NewRouter()

	// Apply middleware
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.SecurityHeadersMiddleware)
	router.Use(middleware.CORSMiddleware)
	router.Use(middleware.RateLimitMiddleware)

	// Static files
	router.PathPrefix("/static/").HandlerFunc(serveStatic).Methods("GET")

	// Root redirect
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if middleware.IsAuthenticated(r) {
			http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
		} else {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
		}
	}).Methods("GET")

	// Authentication routes
	router.HandleFunc("/login", handlers.LoginPage).Methods("GET", "POST")
	router.HandleFunc("/register", middleware.RequireAdmin(handlers.RegisterPage)).Methods("GET", "POST")
	router.HandleFunc("/logout", handlers.LogoutHandler).Methods("GET", "POST")
	router.HandleFunc("/change-password", middleware.RequireAuth(handlers.ChangePasswordHandler)).Methods("POST")

	// Dashboard routes
	router.HandleFunc("/dashboard", middleware.RequireAuth(handlers.SellerDashboard)).Methods("GET")

	// Admin routes
	adminRouter := router.PathPrefix("/admin").Subrouter()
	adminRouter.Use(middleware.RequireAdmin)

	adminRouter.HandleFunc("", handlers.AdminDashboard).Methods("GET")
	adminRouter.HandleFunc("/", handlers.AdminDashboard).Methods("GET")

	// Entity types management
	adminRouter.HandleFunc("/entity-types", handlers.EntityTypesHandler).Methods("GET", "POST")
	adminRouter.HandleFunc("/entity-types/{id}", handlers.EntityTypeHandler).Methods("GET", "PUT", "DELETE")

	// Product types management
	adminRouter.HandleFunc("/product-types", handlers.ProductTypesHandler).Methods("GET", "POST")
	adminRouter.HandleFunc("/product-types/{id}", handlers.ProductTypeHandler).Methods("GET", "PUT", "DELETE")

	// User management
	adminRouter.HandleFunc("/users", handlers.UsersHandler).Methods("GET")
	adminRouter.HandleFunc("/users/{id}", handlers.UserHandler).Methods("GET", "PUT", "DELETE")

	// Purchases overview
	adminRouter.HandleFunc("/purchases", handlers.PurchasesHandler).Methods("GET")

	// Seller routes
	sellerRouter := router.PathPrefix("/seller").Subrouter()
	sellerRouter.Use(middleware.RequireSeller)

	// Entities management
	sellerRouter.HandleFunc("/entities", handlers.EntitiesHandler).Methods("GET", "POST")
	sellerRouter.HandleFunc("/entities/{id}", handlers.EntityHandler).Methods("GET", "PUT", "DELETE")

	// Products management
	sellerRouter.HandleFunc("/products", handlers.ProductsHandler).Methods("GET", "POST")
	sellerRouter.HandleFunc("/products/{id}", handlers.ProductHandler).Methods("GET", "PUT", "DELETE")

	// API routes
	apiRouter := router.PathPrefix("/api").Subrouter()

	// Public API endpoints (no authentication required)
	apiRouter.HandleFunc("/health", handlers.HealthCheck).Methods("GET")
	apiRouter.HandleFunc("/products", handlers.ListActiveProducts).Methods("GET")
	apiRouter.HandleFunc("/products/{id}", handlers.GetPublicProduct).Methods("GET")
	apiRouter.HandleFunc("/products/search", handlers.SearchProducts).Methods("GET")

	// Purchase endpoints
	apiRouter.HandleFunc("/purchases", handlers.CreatePurchase).Methods("POST")
	apiRouter.HandleFunc("/purchases/{id}", handlers.GetPurchase).Methods("GET")
	apiRouter.HandleFunc("/purchases/{id}/status", handlers.UpdatePurchaseStatus).Methods("PUT")
	apiRouter.HandleFunc("/purchases/by-payment/{payment_id}", handlers.GetPurchaseByPaymentID).Methods("GET")
	apiRouter.HandleFunc("/purchases/by-buyer", handlers.GetPurchasesByBuyer).Methods("GET")

	// Webhook endpoint for payment providers
	apiRouter.HandleFunc("/webhooks/payment", handlers.PaymentWebhook).Methods("POST")

	// Authenticated API endpoints
	authAPIRouter := apiRouter.PathPrefix("/auth").Subrouter()
	authAPIRouter.Use(middleware.RequireAuth)

	authAPIRouter.HandleFunc("/login", handlers.APILoginHandler).Methods("POST")
	authAPIRouter.HandleFunc("/me/purchases", handlers.GetMyPurchases).Methods("GET")
	authAPIRouter.HandleFunc("/me/stats", handlers.GetMyStats).Methods("GET")

	// Admin API endpoints
	adminAPIRouter := apiRouter.PathPrefix("/admin").Subrouter()
	adminAPIRouter.Use(middleware.RequireAdminAPI)

	adminAPIRouter.HandleFunc("/entity-types", handlers.EntityTypesHandler).Methods("GET", "POST")
	adminAPIRouter.HandleFunc("/entity-types/{id}", handlers.EntityTypeHandler).Methods("GET", "PUT", "DELETE")
	adminAPIRouter.HandleFunc("/product-types", handlers.ProductTypesHandler).Methods("GET", "POST")
	adminAPIRouter.HandleFunc("/product-types/{id}", handlers.ProductTypeHandler).Methods("GET", "PUT", "DELETE")
	adminAPIRouter.HandleFunc("/users", handlers.UsersHandler).Methods("GET")
	adminAPIRouter.HandleFunc("/users/{id}", handlers.UserHandler).Methods("GET", "PUT", "DELETE")
	adminAPIRouter.HandleFunc("/purchases", handlers.PurchasesHandler).Methods("GET")

	// Seller API endpoints
	sellerAPIRouter := apiRouter.PathPrefix("/seller").Subrouter()
	sellerAPIRouter.Use(middleware.RequireSeller)

	sellerAPIRouter.HandleFunc("/entities", handlers.EntitiesHandler).Methods("GET", "POST")
	sellerAPIRouter.HandleFunc("/entities/{id}", handlers.EntityHandler).Methods("GET", "PUT", "DELETE")
	sellerAPIRouter.HandleFunc("/products", handlers.ProductsHandler).Methods("GET", "POST")
	sellerAPIRouter.HandleFunc("/products/{id}", handlers.ProductHandler).Methods("GET", "PUT", "DELETE")

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Dynamic Products server starting on port %s", port)
	log.Printf("Web interface: http://localhost:%s", port)
	log.Printf("API endpoint: http://localhost:%s/api", port)
	log.Printf("Admin login: %s / %s", defaultEmail, defaultPassword)
	log.Printf("Database: Connected successfully")

	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// serveStatic serves static files
func serveStatic(w http.ResponseWriter, r *http.Request) {
	// Remove /static/ prefix
	path := r.URL.Path[8:]

	// Security check - prevent directory traversal
	if path == "" || path[0] == '.' || filepath.Clean(path) != path {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	// Get the file path
	filePath := filepath.Join("static", path)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	// Set appropriate content type
	switch filepath.Ext(path) {
	case ".css":
		w.Header().Set("Content-Type", "text/css")
	case ".js":
		w.Header().Set("Content-Type", "application/javascript")
	case ".png":
		w.Header().Set("Content-Type", "image/png")
	case ".jpg", ".jpeg":
		w.Header().Set("Content-Type", "image/jpeg")
	case ".gif":
		w.Header().Set("Content-Type", "image/gif")
	case ".svg":
		w.Header().Set("Content-Type", "image/svg+xml")
	case ".woff", ".woff2":
		w.Header().Set("Content-Type", "application/font-woff")
	case ".ttf":
		w.Header().Set("Content-Type", "application/font-sfnt")
	case ".eot":
		w.Header().Set("Content-Type", "application/vnd.ms-fontobject")
	}

	// Set caching headers for static assets
	w.Header().Set("Cache-Control", "public, max-age=31536000") // 1 year

	// Serve the file
	http.ServeFile(w, r, filePath)
}

// Additional utility functions and middleware can be added here

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Initializing Dynamic Products application...")
}
