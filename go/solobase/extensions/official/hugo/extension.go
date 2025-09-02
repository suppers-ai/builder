package hugo

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"gorm.io/gorm"

	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/solobase/extensions/core"
	"github.com/suppers-ai/solobase/extensions/official/hugo/handlers"
	"github.com/suppers-ai/solobase/extensions/official/hugo/models"
	"github.com/suppers-ai/solobase/extensions/official/hugo/services"
	"github.com/suppers-ai/storage"
)

// HugoExtension provides static site generation using Hugo
type HugoExtension struct {
	services      *core.ExtensionServices
	db            *gorm.DB
	storage       *storage.Manager
	config        *services.HugoConfig
	enabled       bool
	
	// Services
	hugoManager   *services.HugoManager
	buildService  *services.BuildService
	backupService *services.BackupService
	
	// Handlers
	siteHandler   *handlers.SiteHandler
	buildHandler  *handlers.BuildHandler
	backupHandler *handlers.BackupHandler
}

// NewHugoExtension creates a new Hugo extension instance
func NewHugoExtension() *HugoExtension {
	return &HugoExtension{
		enabled: true,
		config: &services.HugoConfig{
			HugoBinaryPath:  "hugo",
			MaxSitesPerUser: 10,
			MaxSiteSize:     1024 * 1024 * 1024, // 1GB
			BuildTimeout:    time.Minute * 10,
			AllowedThemes:   []string{"default", "blog", "portfolio"},
			DefaultTheme:    "default",
			StorageBucket:   "hugo-sites",
		},
	}
}

// Metadata returns the extension metadata
func (e *HugoExtension) Metadata() core.ExtensionMetadata {
	return core.ExtensionMetadata{
		Name:         "hugo",
		Version:      "2.0.0",
		Description:  "Hugo Static Site Generator extension for creating and hosting static websites",
		Author:       "Solobase Official",
		License:      "MIT",
		Homepage:     "https://github.com/suppers-ai/solobase",
		Dependencies: []string{"storage", "auth"},
		Tags:         []string{"static-site", "hugo", "hosting", "cms"},
		MinVersion:   "1.0.0",
		MaxVersion:   "3.0.0",
	}
}

// Initialize initializes the extension with services and database
func (e *HugoExtension) Initialize(ctx context.Context, services *core.ExtensionServices) error {
	e.services = services

	// For now, skip full initialization to allow compilation
	// The extension system needs to be updated to provide proper database and storage access
	// This is a temporary solution similar to the Products extension
	
	e.enabled = true
	
	if services != nil && services.Logger() != nil {
		services.Logger().Info(ctx, "Hugo extension initialized (limited mode)",
			logger.String("version", e.Metadata().Version))
	}

	return nil
}

// Start starts the extension
func (e *HugoExtension) Start(ctx context.Context) error {
	if e.services != nil && e.services.Logger() != nil {
		e.services.Logger().Info(ctx, "Hugo extension started")
	}
	return nil
}

// Stop stops the extension
func (e *HugoExtension) Stop(ctx context.Context) error {
	if e.services != nil && e.services.Logger() != nil {
		e.services.Logger().Info(ctx, "Hugo extension stopped")
	}
	e.enabled = false
	return nil
}

// Health returns the health status of the extension
func (e *HugoExtension) Health(ctx context.Context) (*core.HealthStatus, error) {
	status := "healthy"
	message := "Hugo extension is running"
	checks := []core.HealthCheck{}

	if !e.enabled {
		status = "stopped"
		message = "Hugo extension is stopped"
	}

	// Check database connectivity
	dbCheck := core.HealthCheck{
		Name:   "database",
		Status: "healthy",
	}

	if e.db != nil {
		sqlDB, err := e.db.DB()
		if err != nil || sqlDB.Ping() != nil {
			dbCheck.Status = "unhealthy"
			dbCheck.Message = "Database connection failed"
			status = "unhealthy"
		}
	}

	checks = append(checks, dbCheck)

	// Check storage connectivity
	storageCheck := core.HealthCheck{
		Name:   "storage",
		Status: "healthy",
	}

	if e.storage == nil {
		storageCheck.Status = "unhealthy"
		storageCheck.Message = "Storage not initialized"
		status = "degraded"
	}

	checks = append(checks, storageCheck)

	return &core.HealthStatus{
		Status:      status,
		Message:     message,
		Checks:      checks,
		LastChecked: time.Now(),
	}, nil
}

// RegisterRoutes registers the extension routes
func (e *HugoExtension) RegisterRoutes(router core.ExtensionRouter) error {
	// For now, only register the dashboard route since handlers aren't initialized
	router.HandleFunc("/dashboard", e.handleDashboard)
	
	// API routes will be registered once the extension is fully integrated
	// with proper database and storage access

	return nil
}

// handleDashboard handles the dashboard page
func (e *HugoExtension) handleDashboard(w http.ResponseWriter, r *http.Request) {
	// Simple dashboard response for now
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Hugo Extension Dashboard</title>
			<style>
				body { font-family: system-ui; padding: 2rem; }
				h1 { color: #333; }
				.status { padding: 1rem; background: #f0f0f0; border-radius: 8px; }
			</style>
		</head>
		<body>
			<h1>Hugo Extension Dashboard</h1>
			<div class="status">
				<p>Status: Active</p>
				<p>Version: 2.0.0</p>
			</div>
		</body>
		</html>
	`))
}

// handlePreview handles site preview requests
func (e *HugoExtension) handlePreview(w http.ResponseWriter, r *http.Request) {
	// This would serve the static site files
	// Implementation depends on your routing framework
	w.Write([]byte("Site preview functionality"))
}

// getGORMDatabase gets the GORM database from services
func (e *HugoExtension) getGORMDatabase(services *core.ExtensionServices) (*gorm.DB, error) {
	// Note: ExtensionServices provides ExtensionDatabase interface, not direct GORM access
	// This needs to be refactored to work with the interface
	return nil, fmt.Errorf("database access not yet implemented")
}

// getStorageService gets the storage service
func (e *HugoExtension) getStorageService(services *core.ExtensionServices) (*storage.Manager, error) {
	// Note: ExtensionServices provides ExtensionStorage interface, not direct storage.Manager
	// This needs to be refactored to work with the interface
	return nil, fmt.Errorf("storage access not yet implemented")
}

// migrateModels runs database migrations
func (e *HugoExtension) migrateModels() error {
	if e.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return e.db.AutoMigrate(
		&models.HugoSite{},
		&models.HugoBuild{},
		&models.HugoTheme{},
		&models.HugoDomain{},
		&models.HugoBackup{},
		&models.HugoRestore{},
		&models.HugoAnalytics{},
		&models.HugoAnalyticsDaily{},
		&models.HugoAnalyticsConfig{},
		&models.AnalyticsReport{},
		&models.HugoVersion{},
		&models.HugoVersionMigration{},
		&models.HugoVersionNotification{},
	)
}

// RegisterMiddleware registers extension middleware
func (e *HugoExtension) RegisterMiddleware() []core.MiddlewareRegistration {
	return nil // No middleware needed for now
}

// RegisterHooks registers extension hooks
func (e *HugoExtension) RegisterHooks() []core.HookRegistration {
	return nil // No hooks needed for now
}

// RegisterTemplates registers extension templates
func (e *HugoExtension) RegisterTemplates() []core.TemplateRegistration {
	return nil // No templates needed for now
}

// RegisterStaticAssets registers static assets
func (e *HugoExtension) RegisterStaticAssets() []core.StaticAssetRegistration {
	return nil // No static assets needed for now
}

// ConfigSchema returns the configuration schema
func (e *HugoExtension) ConfigSchema() json.RawMessage {
	schema := `{
		"type": "object",
		"properties": {
			"hugo_binary_path": {
				"type": "string",
				"description": "Path to Hugo binary"
			},
			"max_sites_per_user": {
				"type": "integer",
				"description": "Maximum sites per user"
			},
			"max_site_size": {
				"type": "integer",
				"description": "Maximum site size in bytes"
			},
			"build_timeout": {
				"type": "integer",
				"description": "Build timeout in seconds"
			},
			"allowed_themes": {
				"type": "array",
				"items": {
					"type": "string"
				},
				"description": "Allowed Hugo themes"
			},
			"default_theme": {
				"type": "string",
				"description": "Default Hugo theme"
			},
			"storage_bucket": {
				"type": "string",
				"description": "Storage bucket for Hugo sites"
			}
		}
	}`
	return json.RawMessage(schema)
}

// ValidateConfig validates the configuration
func (e *HugoExtension) ValidateConfig(config json.RawMessage) error {
	var cfg services.HugoConfig
	if err := json.Unmarshal(config, &cfg); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}
	return nil
}

// ApplyConfig applies the configuration
func (e *HugoExtension) ApplyConfig(config json.RawMessage) error {
	var cfg services.HugoConfig
	if err := json.Unmarshal(config, &cfg); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}
	e.config = &cfg
	return nil
}

// DatabaseSchema returns the database schema name
func (e *HugoExtension) DatabaseSchema() string {
	return "hugo"
}

// Migrations returns database migrations
func (e *HugoExtension) Migrations() []core.Migration {
	return nil // Using GORM AutoMigrate instead
}

// RequiredPermissions returns required permissions
func (e *HugoExtension) RequiredPermissions() []core.Permission {
	return []core.Permission{
		{
			Name:        "hugo.admin",
			Description: "Full access to Hugo sites administration",
			Resource:    "hugo",
			Actions:     []string{"create", "read", "update", "delete", "build", "backup"},
		},
		{
			Name:        "hugo.user",
			Description: "Manage own Hugo sites",
			Resource:    "hugo",
			Actions:     []string{"create", "read", "update", "build"},
		},
		{
			Name:        "hugo.public",
			Description: "View public Hugo sites",
			Resource:    "hugo",
			Actions:     []string{"read"},
		},
	}
}