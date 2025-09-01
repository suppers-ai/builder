package cloudstorage

import (
	"context"
	"encoding/json"
	"time"

	"github.com/suppers-ai/solobase/extensions/core"
	pkgstorage "github.com/suppers-ai/storage"
	"gorm.io/gorm"
)

// CloudStorageConfig holds extension-specific configuration
type CloudStorageConfig struct {
	DefaultBucket      string // Default bucket for uploads
	MaxFileSize        int64  // Max file size in bytes (default: 100MB)
	MaxStoragePerUser  int64  // Max storage per user in bytes (default: 1GB)
	AllowPublicBuckets bool   // Allow creation of public buckets
	EnableVersioning   bool   // Enable file versioning
}

// CloudStorageExtension provides cloud storage capabilities
type CloudStorageExtension struct {
	db              *gorm.DB
	manager         *pkgstorage.Manager
	config          *CloudStorageConfig
	
	// Services (initialized but not fully used yet)
	shareService     *ShareService
	quotaService     *QuotaService
	accessLogService *AccessLogService
	versionService   *VersionService
	tagService       *TagService
}

// Metadata returns extension metadata
func (e *CloudStorageExtension) Metadata() core.ExtensionMetadata {
	return core.ExtensionMetadata{
		Name:        "cloudstorage",
		Version:     "1.0.0",
		Description: "Cloud storage management with advanced features",
		Author:      "Solobase Team",
		License:     "MIT",
		Tags:        []string{"storage", "files", "s3"},
	}
}

// Initialize sets up the extension
func (e *CloudStorageExtension) Initialize(ctx context.Context, services *core.ExtensionServices) error {
	// For simplicity, create a basic database connection
	// In production, this would come from services
	// TODO: Get proper database connection from services
	
	// Get storage service - create a basic config
	storageConfig := pkgstorage.Config{
		Provider: pkgstorage.ProviderLocal,
		BasePath: "./storage",
	}
	
	// Initialize manager
	// Note: e.db should be initialized elsewhere for now
	if e.db == nil {
		// Use a placeholder - this should be provided by the main app
		return nil // Skip initialization if no DB
	}
	
	// Pass nil for logger - the manager should handle it
	manager, err := pkgstorage.NewManager(storageConfig, e.db, nil)
	if err != nil {
		return err
	}
	e.manager = manager
	
	// Auto-migrate tables
	if err := e.db.AutoMigrate(&pkgstorage.StorageBucket{}, &pkgstorage.StorageObject{}); err != nil {
		return err
	}
	
	// Auto-migrate extension tables
	if err := AutoMigrate(e.db); err != nil {
		return err
	}
	
	// Initialize services
	e.shareService = NewShareService(e.db, e.manager)
	e.quotaService = NewQuotaService(e.db)
	e.accessLogService = NewAccessLogService(e.db)
	e.versionService = NewVersionService(e.db, e.manager, e.config != nil && e.config.EnableVersioning)
	e.tagService = NewTagService(e.db)
	
	return nil
}

// Start begins the extension's operations
func (e *CloudStorageExtension) Start(ctx context.Context) error {
	return nil
}

// Stop gracefully shuts down the extension
func (e *CloudStorageExtension) Stop(ctx context.Context) error {
	return nil
}

// Health returns the health status
func (e *CloudStorageExtension) Health(ctx context.Context) (*core.HealthStatus, error) {
	// Check if we can list buckets
	_, err := e.manager.ListBuckets(ctx)
	if err != nil {
		return &core.HealthStatus{
			Status:      "unhealthy",
			Message:     "Storage provider error: " + err.Error(),
			LastChecked: time.Now(),
		}, nil
	}
	
	return &core.HealthStatus{
		Status:      "healthy",
		Message:     "CloudStorage is operational",
		LastChecked: time.Now(),
	}, nil
}

// RegisterRoutes registers HTTP routes
func (e *CloudStorageExtension) RegisterRoutes(router core.ExtensionRouter) error {
	// Register basic routes
	router.HandleFunc("/api/buckets", e.handleBuckets)
	router.HandleFunc("/api/stats", e.handleStats)
	router.HandleFunc("/api/upload", e.handleUpload)
	return nil
}

// RegisterMiddleware returns middleware registrations
func (e *CloudStorageExtension) RegisterMiddleware() []core.MiddlewareRegistration {
	return nil
}

// RegisterHooks returns hook registrations
func (e *CloudStorageExtension) RegisterHooks() []core.HookRegistration {
	return nil
}

// RegisterTemplates returns template registrations
func (e *CloudStorageExtension) RegisterTemplates() []core.TemplateRegistration {
	return []core.TemplateRegistration{
		{
			Name:    "cloudstorage-dashboard",
			Content: []byte(dashboardHTML),
			Path:    "/dashboard",
		},
	}
}

// RegisterStaticAssets returns static asset registrations
func (e *CloudStorageExtension) RegisterStaticAssets() []core.StaticAssetRegistration {
	return nil
}

// ConfigSchema returns the configuration schema
func (e *CloudStorageExtension) ConfigSchema() json.RawMessage {
	schema := `{
		"type": "object",
		"properties": {
			"defaultBucket": {"type": "string"},
			"maxFileSize": {"type": "integer"},
			"maxStoragePerUser": {"type": "integer"},
			"allowPublicBuckets": {"type": "boolean"},
			"enableVersioning": {"type": "boolean"}
		}
	}`
	return json.RawMessage(schema)
}

// ValidateConfig validates configuration
func (e *CloudStorageExtension) ValidateConfig(config json.RawMessage) error {
	var cfg CloudStorageConfig
	return json.Unmarshal(config, &cfg)
}

// ApplyConfig applies configuration
func (e *CloudStorageExtension) ApplyConfig(config json.RawMessage) error {
	var cfg CloudStorageConfig
	if err := json.Unmarshal(config, &cfg); err != nil {
		return err
	}
	e.config = &cfg
	return nil
}

// DatabaseSchema returns the database schema name
func (e *CloudStorageExtension) DatabaseSchema() string {
	return "ext_cloudstorage"
}

// Migrations returns database migrations
func (e *CloudStorageExtension) Migrations() []core.Migration {
	return nil // Using GORM auto-migrate
}

// RequiredPermissions returns required permissions
func (e *CloudStorageExtension) RequiredPermissions() []core.Permission {
	return []core.Permission{
		{
			Name:        "cloudstorage.admin",
			Description: "Full cloud storage administration",
			Resource:    "cloudstorage",
			Actions:     []string{"create", "read", "update", "delete"},
		},
		{
			Name:        "cloudstorage.upload",
			Description: "Upload files to cloud storage",
			Resource:    "cloudstorage",
			Actions:     []string{"create", "upload"},
		},
		{
			Name:        "cloudstorage.download",
			Description: "Download files from cloud storage",
			Resource:    "cloudstorage",
			Actions:     []string{"read", "download"},
		},
	}
}

// NewCloudStorageExtension creates a new extension instance
func NewCloudStorageExtension(config *CloudStorageConfig) core.Extension {
	if config == nil {
		config = &CloudStorageConfig{
			DefaultBucket:      "uploads",
			MaxFileSize:        100 * 1024 * 1024,
			MaxStoragePerUser:  1024 * 1024 * 1024,
			AllowPublicBuckets: true,
			EnableVersioning:   false,
		}
	}
	
	return &CloudStorageExtension{
		config: config,
	}
}