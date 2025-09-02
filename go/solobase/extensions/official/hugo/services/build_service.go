package services

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
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

// BuildService handles Hugo site building operations
type BuildService struct {
	hugoBinary string
	timeout    time.Duration
	logger     core.ExtensionLogger
	storage    *storage.Manager
	db         *gorm.DB
	bucket     string
}

// NewBuildService creates a new build service
func NewBuildService(hugoBinary string, timeout time.Duration, logger core.ExtensionLogger, storage *storage.Manager, db *gorm.DB) *BuildService {
	if hugoBinary == "" {
		hugoBinary = "hugo" // Default to hugo in PATH
	}
	if timeout == 0 {
		timeout = 5 * time.Minute // Default 5 minute timeout
	}

	return &BuildService{
		hugoBinary: hugoBinary,
		timeout:    timeout,
		logger:     logger,
		storage:    storage,
		db:         db,
	}
}

// SetBucket sets the storage bucket
func (bs *BuildService) SetBucket(bucket string) {
	bs.bucket = bucket
}

// BuildSite builds a Hugo site
func (bs *BuildService) BuildSite(ctx context.Context, siteID string) (*models.HugoBuild, error) {
	if siteID == "" {
		return nil, errors.InvalidRequest("site ID is required")
	}

	// Get site
	var site models.HugoSite
	if err := bs.db.WithContext(ctx).Where("id = ?", siteID).First(&site).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.SiteNotFound(siteID)
		}
		return nil, errors.DatabaseError("get site", err)
	}

	// Create build record
	build := &models.HugoBuild{
		ID:        uuid.New().String(),
		SiteID:    siteID,
		Status:    models.BuildStatusPending,
		StartedAt: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := bs.db.WithContext(ctx).Create(build).Error; err != nil {
		return nil, errors.DatabaseError("create build record", err)
	}

	// Start build in background
	go bs.performBuild(context.Background(), build, &site)

	return build, nil
}

// performBuild performs the actual build operation
func (bs *BuildService) performBuild(ctx context.Context, build *models.HugoBuild, site *models.HugoSite) {
	// Update status to in progress
	build.Status = models.BuildStatusInProgress
	bs.db.WithContext(ctx).Save(build)

	// Create temporary directory for build
	tempDir, err := os.MkdirTemp("", fmt.Sprintf("hugo-build-%s-", build.ID))
	if err != nil {
		bs.handleBuildError(ctx, build, fmt.Errorf("failed to create temp directory: %w", err))
		return
	}
	defer os.RemoveAll(tempDir)

	// Download site files from storage
	if err := bs.downloadSiteFiles(ctx, site, tempDir); err != nil {
		bs.handleBuildError(ctx, build, fmt.Errorf("failed to download site files: %w", err))
		return
	}

	// Run Hugo build
	outputDir := filepath.Join(tempDir, "public")
	if err := bs.runHugoBuild(ctx, tempDir, outputDir); err != nil {
		bs.handleBuildError(ctx, build, err)
		return
	}

	// Upload build output to storage
	outputPath := fmt.Sprintf("builds/%s/%s", site.ID, build.ID)
	if err := bs.uploadBuildOutput(ctx, outputDir, outputPath); err != nil {
		bs.handleBuildError(ctx, build, fmt.Errorf("failed to upload build output: %w", err))
		return
	}

	// Update build record
	build.Status = models.BuildStatusCompleted
	build.OutputPath = outputPath
	build.CompletedAt = timePtr(time.Now())
	bs.db.WithContext(ctx).Save(build)

	// Update site with latest build
	site.Status = models.SiteStatusActive
	bs.db.WithContext(ctx).Model(site).Updates(map[string]interface{}{
		"status":     models.SiteStatusActive,
		"updated_at": time.Now(),
	})

	bs.logger.Info(ctx, "Build completed successfully",
		logger.String("build_id", build.ID),
		logger.String("site_id", site.ID))
}

// downloadSiteFiles downloads site files from storage to local directory
func (bs *BuildService) downloadSiteFiles(ctx context.Context, site *models.HugoSite, localDir string) error {
	// List all files in site storage
	files, err := bs.storage.ListObjects(ctx, bs.bucket, site.StoragePath, 1000)
	if err != nil {
		return fmt.Errorf("failed to list site files: %w", err)
	}

	for _, fileObj := range files {
		// Get file content
		content, _, err := bs.storage.GetFile(ctx, bs.bucket, fileObj.ObjectKey)
		if err != nil {
			return fmt.Errorf("failed to get file %s: %w", fileObj.ObjectKey, err)
		}

		// Calculate relative path
		relPath, _ := filepath.Rel(site.StoragePath, fileObj.ObjectKey)
		localPath := filepath.Join(localDir, relPath)

		// Create directory if needed
		dir := filepath.Dir(localPath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
		}

		// Write file
		if err := os.WriteFile(localPath, content, 0644); err != nil {
			return fmt.Errorf("failed to write file %s: %w", localPath, err)
		}
	}

	return nil
}

// runHugoBuild executes the Hugo build command
func (bs *BuildService) runHugoBuild(ctx context.Context, sourceDir, outputDir string) error {
	// Create Hugo command with timeout
	ctx, cancel := context.WithTimeout(ctx, bs.timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, bs.hugoBinary, 
		"--source", sourceDir,
		"--destination", outputDir,
		"--minify",
	)

	// Capture output
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Run command
	if err := cmd.Run(); err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("build timed out after %v", bs.timeout)
		}
		return fmt.Errorf("hugo build failed: %v\nstdout: %s\nstderr: %s", 
			err, stdout.String(), stderr.String())
	}

	return nil
}

// uploadBuildOutput uploads build output to storage
func (bs *BuildService) uploadBuildOutput(ctx context.Context, localDir, storagePath string) error {
	// Walk through output directory
	return filepath.Walk(localDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Read file content
		content, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("failed to read file %s: %w", path, err)
		}

		// Calculate storage path
		relPath, _ := filepath.Rel(localDir, path)
		fullPath := filepath.Join(storagePath, relPath)

		// Upload to storage
		dir := filepath.Dir(fullPath)
		name := filepath.Base(fullPath)
		_, err = bs.storage.UploadObject(ctx, bs.bucket, dir, name, content, "application/octet-stream", nil)
		if err != nil {
			return fmt.Errorf("failed to upload file %s: %w", fullPath, err)
		}

		return nil
	})
}

// handleBuildError handles errors during build process
func (bs *BuildService) handleBuildError(ctx context.Context, build *models.HugoBuild, err error) {
	build.Status = models.BuildStatusFailed
	build.Error = err.Error()
	build.CompletedAt = timePtr(time.Now())
	bs.db.WithContext(ctx).Save(build)

	bs.logger.Error(ctx, "Build failed",
		logger.String("build_id", build.ID),
		logger.String("site_id", build.SiteID),
		logger.Err(err))
}

// GetBuild retrieves a specific build
func (bs *BuildService) GetBuild(ctx context.Context, buildID string) (*models.HugoBuild, error) {
	if buildID == "" {
		return nil, errors.InvalidRequest("build ID is required")
	}

	var build models.HugoBuild
	err := bs.db.WithContext(ctx).Where("id = ?", buildID).First(&build).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New(errors.ErrorBuildFailed, "build not found")
		}
		return nil, errors.DatabaseError("get build", err)
	}

	return &build, nil
}

// ListBuilds lists builds for a site
func (bs *BuildService) ListBuilds(ctx context.Context, siteID string) ([]*models.HugoBuild, error) {
	if siteID == "" {
		return nil, errors.InvalidRequest("site ID is required")
	}

	var builds []*models.HugoBuild
	err := bs.db.WithContext(ctx).
		Where("site_id = ?", siteID).
		Order("created_at DESC").
		Find(&builds).Error

	if err != nil {
		return nil, errors.DatabaseError("list builds", err)
	}

	return builds, nil
}

// GetLatestBuild gets the latest successful build for a site
func (bs *BuildService) GetLatestBuild(ctx context.Context, siteID string) (*models.HugoBuild, error) {
	if siteID == "" {
		return nil, errors.InvalidRequest("site ID is required")
	}

	var build models.HugoBuild
	err := bs.db.WithContext(ctx).
		Where("site_id = ? AND status = ?", siteID, models.BuildStatusCompleted).
		Order("completed_at DESC").
		First(&build).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // No builds yet
		}
		return nil, errors.DatabaseError("get latest build", err)
	}

	return &build, nil
}