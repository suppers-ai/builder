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
	DefaultStorageLimit   int64  // Default storage limit per user in bytes (default: 5GB)
	DefaultBandwidthLimit int64  // Default bandwidth limit per user in bytes (default: 10GB)
	EnableSharing         bool   // Enable file sharing features (default: true)
	EnableAccessLogs      bool   // Enable access logging (default: true)
	EnableQuotas          bool   // Enable storage quotas (default: true)
	BandwidthResetPeriod  string // Period for bandwidth reset: "daily", "weekly", "monthly" (default: "monthly")
}

// CloudStorageExtension provides enhanced cloud storage capabilities
type CloudStorageExtension struct {
	services         *core.ExtensionServices
	db              *gorm.DB
	manager         *pkgstorage.Manager
	config          *CloudStorageConfig
	
	// Core services for extending storage functionality
	shareService     *ShareService
	quotaService     *QuotaService
	accessLogService *AccessLogService
}

// Metadata returns extension metadata
func (e *CloudStorageExtension) Metadata() core.ExtensionMetadata {
	return core.ExtensionMetadata{
		Name:        "cloudstorage",
		Version:     "2.0.0",
		Description: "Enterprise-level storage management with advanced sharing capabilities, granular access control, storage quotas, bandwidth monitoring, and detailed analytics. Create public links, share with specific users, track file access, and manage storage limits.",
		Author:      "Solobase Team",
		License:     "MIT",
		Tags:        []string{"storage", "sharing", "quotas", "analytics", "access-control", "bandwidth", "file-management"},
		Homepage:    "https://github.com/suppers-ai/solobase",
		MinVersion:  "1.0.0",
		MaxVersion:  "3.0.0",
		Dependencies: []string{"storage", "auth"},
	}
}

// Initialize sets up the extension
func (e *CloudStorageExtension) Initialize(ctx context.Context, services *core.ExtensionServices) error {
	e.services = services
	
	// Get database connection - we'll need to get the underlying GORM DB
	// For now, we'll skip this initialization if we can't get a DB
	// TODO: Get proper GORM DB instance from services
	
	// Log initialization
	if services != nil {
		services.Logger().Info(ctx, "CloudStorage extension initializing")
	}
	
	// Note: The actual database and storage manager initialization
	// will need to be handled differently based on how the core
	// ExtensionServices provides access to these resources
	
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
	// Core storage routes
	router.HandleFunc("/api/buckets", e.handleBuckets)
	router.HandleFunc("/api/upload", e.handleUpload)
	router.HandleFunc("/api/download", e.handleDownload)
	router.HandleFunc("/api/stats", e.handleStats)
	
	// Sharing routes
	router.HandleFunc("/api/shares", e.handleShares)
	router.HandleFunc("/share/*", e.handleShareAccess) // Public share access
	
	// Quota management routes
	router.HandleFunc("/api/quota", e.handleQuota)
	
	// Access logging routes
	router.HandleFunc("/api/access-logs", e.handleAccessLogs)
	router.HandleFunc("/api/access-stats", e.handleAccessStats)
	
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
			"defaultStorageLimit": {"type": "integer", "description": "Default storage limit in bytes"},
			"defaultBandwidthLimit": {"type": "integer", "description": "Default bandwidth limit in bytes"},
			"enableSharing": {"type": "boolean", "default": true},
			"enableAccessLogs": {"type": "boolean", "default": true},
			"enableQuotas": {"type": "boolean", "default": true},
			"bandwidthResetPeriod": {"type": "string", "enum": ["daily", "weekly", "monthly"], "default": "monthly"}
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
			DefaultStorageLimit:   5368709120,  // 5GB default
			DefaultBandwidthLimit: 10737418240, // 10GB default
			EnableSharing:         true,
			EnableAccessLogs:      true,
			EnableQuotas:          true,
			BandwidthResetPeriod:  "monthly",
		}
	}
	
	return &CloudStorageExtension{
		config: config,
	}
}