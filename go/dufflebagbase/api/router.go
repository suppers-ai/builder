package api

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/dufflebagbase/services"
)

type API struct {
	Router            *mux.Router
	AuthService       *services.AuthService
	UserService       *services.UserService
	StorageService    *services.StorageService
	CollectionService *services.CollectionService
	DatabaseService   *services.DatabaseService
	SettingsService   *services.SettingsService
}

func NewAPI(
	authService *services.AuthService,
	userService *services.UserService,
	storageService *services.StorageService,
	collectionService *services.CollectionService,
	databaseService *services.DatabaseService,
	settingsService *services.SettingsService,
) *API {
	api := &API{
		Router:            mux.NewRouter(),
		AuthService:       authService,
		UserService:       userService,
		StorageService:    storageService,
		CollectionService: collectionService,
		DatabaseService:   databaseService,
		SettingsService:   settingsService,
	}

	api.setupRoutes()
	return api
}

func (a *API) setupRoutes() {
	// API prefix
	apiRouter := a.Router.PathPrefix("/api").Subrouter()
	
	// Apply CORS middleware to all API routes
	apiRouter.Use(CORSMiddleware)

	// Public routes (no auth required)
	apiRouter.HandleFunc("/auth/login", HandleLogin(a.AuthService)).Methods("POST", "OPTIONS")
	apiRouter.HandleFunc("/auth/signup", HandleSignup(a.AuthService)).Methods("POST", "OPTIONS")
	
	// Temporarily make dashboard public for testing
	apiRouter.HandleFunc("/dashboard/stats", HandleGetDashboardStats(
		a.UserService, 
		a.StorageService, 
		a.CollectionService,
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
		a.CollectionService,
	)).Methods("GET", "OPTIONS")

	// Database routes
	protected.HandleFunc("/database/tables", HandleGetDatabaseTables(a.DatabaseService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/database/tables/{table}/columns", HandleGetTableColumns(a.DatabaseService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/database/query", HandleExecuteQuery(a.DatabaseService)).Methods("POST", "OPTIONS")

	// Storage routes
	protected.HandleFunc("/storage/buckets", HandleGetStorageBuckets(a.StorageService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/storage/buckets/{bucket}/objects", HandleGetBucketObjects(a.StorageService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/storage/buckets/{bucket}/upload", HandleUploadFile(a.StorageService)).Methods("POST", "OPTIONS")
	protected.HandleFunc("/storage/buckets/{bucket}/objects/{id}", HandleDeleteObject(a.StorageService)).Methods("DELETE", "OPTIONS")

	// Collection routes
	protected.HandleFunc("/collections", HandleGetCollections(a.CollectionService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/collections", HandleCreateCollection(a.CollectionService)).Methods("POST", "OPTIONS")
	protected.HandleFunc("/collections/{id}", HandleGetCollection(a.CollectionService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/collections/{id}", HandleUpdateCollection(a.CollectionService)).Methods("PATCH", "OPTIONS")
	protected.HandleFunc("/collections/{id}", HandleDeleteCollection(a.CollectionService)).Methods("DELETE", "OPTIONS")

	// Settings routes
	protected.HandleFunc("/settings", HandleGetSettings(a.SettingsService)).Methods("GET", "OPTIONS")
	protected.HandleFunc("/settings", HandleUpdateSettings(a.SettingsService)).Methods("PATCH", "OPTIONS")
}

func (a *API) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	a.Router.ServeHTTP(w, r)
}