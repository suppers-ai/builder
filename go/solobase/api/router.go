package api

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/solobase/services"
)

type API struct {
	Router            *mux.Router
	AuthService       *services.AuthService
	UserService       *services.UserService
	StorageService    *services.StorageService
	CollectionService *services.CollectionService
	DatabaseService   *services.DatabaseService
	SettingsService   *services.SettingsService
	LogsService       *services.LogsService
}

func NewAPI(
	authService *services.AuthService,
	userService *services.UserService,
	storageService *services.StorageService,
	collectionService *services.CollectionService,
	databaseService *services.DatabaseService,
	settingsService *services.SettingsService,
	logsService *services.LogsService,
) *API {
	api := &API{
		Router:            mux.NewRouter(),
		AuthService:       authService,
		UserService:       userService,
		StorageService:    storageService,
		CollectionService: collectionService,
		DatabaseService:   databaseService,
		SettingsService:   settingsService,
		LogsService:       logsService,
	}

	api.setupRoutes()
	return api
}

func (a *API) setupRoutes() {
	// The router is already mounted at /api in main.go, so we don't need the prefix here
	apiRouter := a.Router
	
	// Apply CORS and Metrics middleware to all API routes
	apiRouter.Use(CORSMiddleware)
	apiRouter.Use(MetricsMiddleware)

	// Health check endpoint for debugging
	apiRouter.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"API is running"}`))
	}).Methods("GET", "OPTIONS")
	
	// Temporary endpoint to create test admin
	apiRouter.HandleFunc("/create-test-admin", func(w http.ResponseWriter, r *http.Request) {
		err := a.AuthService.CreateDefaultAdmin("admin@example.com", "admin123")
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"error":"` + err.Error() + `"}`))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Admin created with password: admin123"}`))
	}).Methods("GET", "OPTIONS")
	
	// Public routes (no auth required)
	apiRouter.HandleFunc("/auth/login", HandleLogin(a.AuthService)).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/auth/signup", HandleSignup(a.AuthService)).Methods("POST", "OPTIONS")
	
	// Temporarily make dashboard public for testing
	apiRouter.HandleFunc("/dashboard/stats", HandleGetDashboardStats(
		a.UserService, 
		a.StorageService, 
		a.DatabaseService,
	)).Methods("GET", "OPTIONS")

	// Protected routes (auth required)
	protected := apiRouter.PathPrefix("").Subrouter()
	protected.Use(AuthMiddleware(a.AuthService))

	// Auth routes
	protected.HandleFunc("/auth/logout", HandleLogout()).Methods("POST", "OPTIONS")
	protected.HandleFunc("/auth/me", HandleGetCurrentUser()).Methods("GET", "OPTIONS")

	// User routes
	protected.HandleFunc("/users", HandleGetUsers(a.UserService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/users/{id}", HandleGetUser(a.UserService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/users/{id}", HandleUpdateUser(a.UserService)).Methods("PATCH", "OPTIONS")
	protected.HandleFunc("/users/{id}", HandleDeleteUser(a.UserService)).Methods("DELETE", "OPTIONS")

	// Dashboard routes
	protected.HandleFunc("/dashboard/stats", HandleGetDashboardStats(
		a.UserService, 
		a.StorageService, 
		a.DatabaseService,
	)).Methods("GET", "OPTIONS")
	
	// System metrics (temporarily public for development)
	apiRouter.HandleFunc("/system/metrics", HandleGetSystemMetrics()).Methods("GET", "OPTIONS")
	apiRouter.Handle("/metrics", HandlePrometheusMetrics()).Methods("GET", "OPTIONS")

	// Database routes (temporarily public for development)
	apiRouter.HandleFunc("/database/info", HandleGetDatabaseInfo(a.DatabaseService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/database/tables", HandleGetDatabaseTables(a.DatabaseService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/database/tables/{table}/columns", HandleGetTableColumns(a.DatabaseService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/database/query", HandleExecuteQuery(a.DatabaseService)).Methods("POST", "OPTIONS")

	// Storage routes (temporarily public for development)
	apiRouter.HandleFunc("/storage/buckets", HandleGetStorageBuckets(a.StorageService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/storage/buckets", HandleCreateBucket(a.StorageService)).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/storage/buckets/{bucket}", HandleDeleteBucket(a.StorageService)).Methods("DELETE", "OPTIONS")
	apiRouter.HandleFunc("/storage/buckets/{bucket}/objects", HandleGetBucketObjects(a.StorageService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/storage/buckets/{bucket}/upload", HandleUploadFile(a.StorageService)).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/storage/buckets/{bucket}/objects/{id}", HandleDeleteObject(a.StorageService)).Methods("DELETE", "OPTIONS")
	apiRouter.HandleFunc("/storage/buckets/{bucket}/objects/{id}/download", HandleDownloadObject(a.StorageService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/storage/buckets/{bucket}/objects/{id}/rename", HandleRenameObject(a.StorageService)).Methods("PATCH", "OPTIONS")
	apiRouter.HandleFunc("/storage/buckets/{bucket}/folders", HandleCreateFolder(a.StorageService)).Methods("POST", "OPTIONS")

	// Logs routes (temporarily public for development)
	apiRouter.HandleFunc("/logs", HandleGetLogs(a.LogsService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/logs/requests", HandleGetRequestLogs(a.LogsService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/logs/stats", HandleGetLogStats(a.LogsService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/logs/details", HandleGetLogDetails(a.LogsService)).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/logs/clear", HandleClearLogs(a.LogsService)).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/logs/export", HandleExportLogs(a.LogsService)).Methods("GET", "OPTIONS")

	// Collection routes
	protected.HandleFunc("/collections", HandleGetCollections(a.CollectionService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/collections", HandleCreateCollection(a.CollectionService)).Methods("POST", "OPTIONS")
	protected.HandleFunc("/collections/{id}", HandleGetCollection(a.CollectionService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/collections/{id}", HandleUpdateCollection(a.CollectionService)).Methods("PATCH", "OPTIONS")
	protected.HandleFunc("/collections/{id}", HandleDeleteCollection(a.CollectionService)).Methods("DELETE", "OPTIONS")

	// Settings routes
	protected.HandleFunc("/settings", HandleGetSettings(a.SettingsService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/settings", HandleUpdateSettings(a.SettingsService)).Methods("PATCH", "OPTIONS")
	protected.HandleFunc("/settings/reset", HandleResetSettings(a.SettingsService)).Methods("POST", "OPTIONS")
	
	// Extensions routes (temporarily public for development)
	apiRouter.HandleFunc("/extensions", HandleGetExtensions()).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/extensions/manage", HandleExtensionsManagement()).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/extensions/{name}/toggle", HandleToggleExtension()).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/extensions/status", HandleExtensionsStatus()).Methods("GET", "OPTIONS")
	
	// Extension dashboard routes (temporarily public for development)
	// Analytics dashboard
	apiRouter.HandleFunc("/ext/analytics/dashboard", HandleAnalyticsDashboard()).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/ext/analytics/api/stats", HandleAnalyticsStats()).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/ext/analytics/api/pageviews", HandleAnalyticsPageviews()).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/ext/analytics/api/track", HandleAnalyticsTrack()).Methods("POST", "OPTIONS")
	
	// Webhooks dashboard
	apiRouter.HandleFunc("/ext/webhooks/dashboard", HandleWebhooksDashboard()).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/ext/webhooks/api/webhooks", HandleWebhooksList()).Methods("GET", "OPTIONS")
	apiRouter.HandleFunc("/ext/webhooks/api/webhooks/create", HandleWebhooksCreate()).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/ext/webhooks/api/webhooks/{id}/toggle", HandleWebhooksToggle()).Methods("POST", "OPTIONS")
}

func (a *API) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	a.Router.ServeHTTP(w, r)
}