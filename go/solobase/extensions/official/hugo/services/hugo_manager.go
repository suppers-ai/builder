package services

import (
	"context"
	"fmt"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/solobase/extensions/core"
	"github.com/suppers-ai/solobase/extensions/official/hugo/errors"
	"github.com/suppers-ai/solobase/extensions/official/hugo/models"
	"github.com/suppers-ai/storage"
)

// HugoConfig holds configuration for the Hugo extension
type HugoConfig struct {
	HugoBinaryPath  string        `json:"hugo_binary_path"`
	MaxSitesPerUser int           `json:"max_sites_per_user"`
	MaxSiteSize     int64         `json:"max_site_size"`
	BuildTimeout    time.Duration `json:"build_timeout"`
	AllowedThemes   []string      `json:"allowed_themes"`
	DefaultTheme    string        `json:"default_theme"`
	StorageBucket   string        `json:"storage_bucket"`
}

// HugoManager manages Hugo site lifecycle operations
type HugoManager struct {
	db      *gorm.DB
	storage *storage.Manager
	logger  core.ExtensionLogger
	config  *HugoConfig
}

// NewHugoManager creates a new Hugo manager
func NewHugoManager(db *gorm.DB, storage *storage.Manager, logger core.ExtensionLogger) *HugoManager {
	return &HugoManager{
		db:      db,
		storage: storage,
		logger:  logger,
	}
}

// SetConfig sets the Hugo configuration for the manager
func (hm *HugoManager) SetConfig(config *HugoConfig) {
	hm.config = config
}

// CreateSite creates a new Hugo site
func (hm *HugoManager) CreateSite(ctx context.Context, userID, name, description, theme string) (*models.HugoSite, error) {
	// Validate inputs
	if userID == "" {
		return nil, errors.InvalidRequest("user ID is required")
	}
	if name == "" {
		return nil, errors.InvalidRequest("site name is required")
	}

	// Validate theme
	if theme == "" && hm.config != nil {
		theme = hm.config.DefaultTheme
	} else if theme != "" && hm.config != nil {
		validTheme := false
		for _, allowedTheme := range hm.config.AllowedThemes {
			if allowedTheme == theme {
				validTheme = true
				break
			}
		}
		if !validTheme {
			return nil, errors.InvalidRequest(fmt.Sprintf("theme '%s' is not allowed", theme))
		}
	}

	// Check site limit
	if hm.config != nil && hm.config.MaxSitesPerUser > 0 {
		var siteCount int64
		err := hm.db.WithContext(ctx).Model(&models.HugoSite{}).
			Where("user_id = ? AND status != ?", userID, "deleted").
			Count(&siteCount).Error
		if err != nil {
			return nil, errors.DatabaseError("count sites", err)
		}

		if siteCount >= int64(hm.config.MaxSitesPerUser) {
			return nil, errors.QuotaExceeded("sites", hm.config.MaxSitesPerUser)
		}
	}

	// Create site
	site := &models.HugoSite{
		ID:          uuid.New().String(),
		UserID:      userID,
		Name:        name,
		Description: description,
		Theme:       theme,
		Status:      models.SiteStatusActive,
		StoragePath: fmt.Sprintf("sites/%s", uuid.New().String()),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Save to database
	if err := hm.db.WithContext(ctx).Create(site).Error; err != nil {
		return nil, errors.DatabaseError("create site", err)
	}

	// Initialize Hugo project structure
	if err := hm.initializeHugoProject(ctx, site); err != nil {
		// Rollback database creation
		hm.db.WithContext(ctx).Delete(site)
		return nil, err
	}

	hm.logger.Info(ctx, "Hugo site created",
		logger.String("site_id", site.ID),
		logger.String("user_id", userID))

	return site, nil
}

// ListSites lists all Hugo sites for a user
func (hm *HugoManager) ListSites(ctx context.Context, userID string) ([]*models.HugoSite, error) {
	if userID == "" {
		return nil, errors.InvalidRequest("user ID is required")
	}

	var sites []*models.HugoSite
	err := hm.db.WithContext(ctx).
		Where("user_id = ? AND status != ?", userID, "deleted").
		Order("created_at DESC").
		Find(&sites).Error

	if err != nil {
		return nil, errors.DatabaseError("list sites", err)
	}

	return sites, nil
}

// GetSite retrieves a specific Hugo site
func (hm *HugoManager) GetSite(ctx context.Context, siteID string) (*models.HugoSite, error) {
	if siteID == "" {
		return nil, errors.InvalidRequest("site ID is required")
	}

	var site models.HugoSite
	err := hm.db.WithContext(ctx).
		Where("id = ? AND status != ?", siteID, "deleted").
		First(&site).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.SiteNotFound(siteID)
		}
		return nil, errors.DatabaseError("get site", err)
	}

	return &site, nil
}

// UpdateSite updates a Hugo site
func (hm *HugoManager) UpdateSite(ctx context.Context, siteID string, updates map[string]interface{}) error {
	if siteID == "" {
		return errors.InvalidRequest("site ID is required")
	}

	// Verify site exists
	site, err := hm.GetSite(ctx, siteID)
	if err != nil {
		return err
	}

	// Update allowed fields only
	allowedFields := map[string]bool{
		"name":        true,
		"description": true,
		"theme":       true,
		"base_url":    true,
		"config":      true,
	}

	filteredUpdates := make(map[string]interface{})
	for key, value := range updates {
		if allowedFields[key] {
			filteredUpdates[key] = value
		}
	}

	if len(filteredUpdates) == 0 {
		return errors.InvalidRequest("no valid fields to update")
	}

	filteredUpdates["updated_at"] = time.Now()

	// Update database
	if err := hm.db.WithContext(ctx).Model(site).Updates(filteredUpdates).Error; err != nil {
		return errors.DatabaseError("update site", err)
	}

	hm.logger.Info(ctx, "Hugo site updated",
		logger.String("site_id", siteID))

	return nil
}

// DeleteSite deletes a Hugo site
func (hm *HugoManager) DeleteSite(ctx context.Context, siteID string) error {
	if siteID == "" {
		return errors.InvalidRequest("site ID is required")
	}

	// Get site
	site, err := hm.GetSite(ctx, siteID)
	if err != nil {
		return err
	}

	// Mark as deleted (soft delete)
	site.Status = "deleted"
	if err := hm.db.WithContext(ctx).Save(site).Error; err != nil {
		return errors.DatabaseError("delete site", err)
	}

	// Clean up storage (in background)
	go hm.cleanupSiteStorage(context.Background(), site)

	hm.logger.Info(ctx, "Hugo site deleted",
		logger.String("site_id", siteID))

	return nil
}

// initializeHugoProject initializes a new Hugo project structure in storage
func (hm *HugoManager) initializeHugoProject(ctx context.Context, site *models.HugoSite) error {
	bucket := hm.config.StorageBucket
	basePath := site.StoragePath

	// Create basic Hugo config
	hugoConfig := fmt.Sprintf(`baseURL = "%s"
languageCode = "en-us"
title = "%s"
theme = "%s"
`, site.BaseURL, site.Name, site.Theme)

	// Store config file
	configDir := basePath
	configName := "config.toml"
	_, err := hm.storage.UploadObject(ctx, bucket, configDir, configName, []byte(hugoConfig), "text/toml", nil)
	if err != nil {
		return errors.StorageError("create config", err)
	}

	// Create directory structure
	directories := []string{
		"content",
		"layouts",
		"static",
		"themes",
		"data",
		"assets",
	}

	for _, dir := range directories {
		dirPath := filepath.Join(basePath, dir)
		fileName := ".keep"
		_, err := hm.storage.UploadObject(ctx, bucket, dirPath, fileName, []byte(""), "text/plain", nil)
		if err != nil {
			return errors.StorageError(fmt.Sprintf("create %s directory", dir), err)
		}
	}

	// Create initial content
	indexContent := `---
title: "Welcome"
date: %s
draft: false
---

# Welcome to your new Hugo site!

This is your homepage. Start editing content in the **content** directory.
`
	indexDir := filepath.Join(basePath, "content")
	indexName := "_index.md"
	_, err = hm.storage.UploadObject(ctx, bucket, indexDir, indexName, 
		[]byte(fmt.Sprintf(indexContent, time.Now().Format(time.RFC3339))), "text/markdown", nil)
	if err != nil {
		return errors.StorageError("create index content", err)
	}

	return nil
}

// cleanupSiteStorage removes all storage files for a deleted site
func (hm *HugoManager) cleanupSiteStorage(ctx context.Context, site *models.HugoSite) {
	bucket := hm.config.StorageBucket
	
	// List all files in site directory
	files, err := hm.storage.ListObjects(ctx, bucket, site.StoragePath, 1000)
	if err != nil {
		hm.logger.Error(ctx, "Failed to list site files for cleanup",
			logger.String("site_id", site.ID),
			logger.Err(err))
		return
	}

	// Delete all files
	for _, fileObj := range files {
		// Extract directory and filename from ObjectKey
		dir := filepath.Dir(fileObj.ObjectKey)
		name := filepath.Base(fileObj.ObjectKey)
		if err := hm.storage.DeleteObject(ctx, bucket, dir, name); err != nil {
			hm.logger.Error(ctx, "Failed to delete file during cleanup",
				logger.String("site_id", site.ID),
				logger.String("file", fileObj.ObjectKey),
				logger.Err(err))
		}
	}

	hm.logger.Info(ctx, "Site storage cleaned up",
		logger.String("site_id", site.ID))
}