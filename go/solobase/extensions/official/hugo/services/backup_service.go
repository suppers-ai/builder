package services

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/solobase/extensions/core"
	"github.com/suppers-ai/solobase/extensions/official/hugo/models"
	"github.com/suppers-ai/storage"
)

// BackupService handles site backup and restore operations
type BackupService struct {
	storage *storage.Manager
	db      *gorm.DB
	logger  core.ExtensionLogger
	bucket  string
}

// NewBackupService creates a new backup service
func NewBackupService(storage *storage.Manager, db *gorm.DB, logger core.ExtensionLogger, bucket string) *BackupService {
	return &BackupService{
		storage: storage,
		db:      db,
		logger:  logger,
		bucket:  bucket,
	}
}

// CreateBackup creates a backup of a Hugo site
func (bs *BackupService) CreateBackup(ctx context.Context, siteID, name, description string) (*models.HugoBackup, error) {
	if siteID == "" {
		return nil, fmt.Errorf("site ID is required")
	}
	if name == "" {
		return nil, fmt.Errorf("backup name is required")
	}

	// Verify site exists
	var site models.HugoSite
	if err := bs.db.WithContext(ctx).Where("id = ?", siteID).First(&site).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("site not found: %s", siteID)
		}
		return nil, fmt.Errorf("failed to get site: %w", err)
	}

	// Create backup record
	backup := &models.HugoBackup{
		ID:          uuid.New().String(),
		SiteID:      siteID,
		Name:        name,
		Description: description,
		Status:      models.BackupStatusPending,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := bs.db.WithContext(ctx).Create(backup).Error; err != nil {
		return nil, fmt.Errorf("failed to create backup record: %w", err)
	}

	// Start backup process in background
	go bs.performBackup(context.Background(), backup, &site)

	return backup, nil
}

// performBackup performs the actual backup operation
func (bs *BackupService) performBackup(ctx context.Context, backup *models.HugoBackup, site *models.HugoSite) {
	// Update status to in progress
	backup.Status = models.BackupStatusInProgress
	bs.db.WithContext(ctx).Save(backup)

	// Create tar.gz archive
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gw)

	// Add site files to archive
	sitePath := fmt.Sprintf("sites/%s", site.ID)
	files, err := bs.storage.ListObjects(ctx, bs.bucket, sitePath, 1000)
	if err != nil {
		bs.handleBackupError(ctx, backup, fmt.Errorf("failed to list site files: %w", err))
		return
	}

	for _, fileObj := range files {
		// Read file content
		content, _, err := bs.storage.GetFile(ctx, bs.bucket, fileObj.ObjectKey)
		if err != nil {
			bs.handleBackupError(ctx, backup, fmt.Errorf("failed to read file %s: %w", fileObj.ObjectKey, err))
			return
		}

		// Add to tar archive
		header := &tar.Header{
			Name: filepath.Base(fileObj.ObjectKey),
			Mode: 0644,
			Size: int64(len(content)),
		}

		if err := tw.WriteHeader(header); err != nil {
			bs.handleBackupError(ctx, backup, fmt.Errorf("failed to write tar header: %w", err))
			return
		}

		if _, err := tw.Write(content); err != nil {
			bs.handleBackupError(ctx, backup, fmt.Errorf("failed to write tar content: %w", err))
			return
		}
	}

	// Close writers
	if err := tw.Close(); err != nil {
		bs.handleBackupError(ctx, backup, fmt.Errorf("failed to close tar writer: %w", err))
		return
	}
	if err := gw.Close(); err != nil {
		bs.handleBackupError(ctx, backup, fmt.Errorf("failed to close gzip writer: %w", err))
		return
	}

	// Store backup archive
	backupDir := fmt.Sprintf("backups/%s", site.ID)
	backupName := fmt.Sprintf("%s.tar.gz", backup.ID)
	_, err = bs.storage.UploadObject(ctx, bs.bucket, backupDir, backupName, buf.Bytes(), "application/gzip", nil)
	if err != nil {
		bs.handleBackupError(ctx, backup, fmt.Errorf("failed to store backup: %w", err))
		return
	}
	backupPath := filepath.Join(backupDir, backupName)

	// Update backup record
	backup.Status = models.BackupStatusCompleted
	backup.Size = int64(buf.Len())
	backup.StoragePath = backupPath
	backup.CompletedAt = timePtr(time.Now())
	bs.db.WithContext(ctx).Save(backup)
}

// handleBackupError handles errors during backup process
func (bs *BackupService) handleBackupError(ctx context.Context, backup *models.HugoBackup, err error) {
	backup.Status = models.BackupStatusFailed
	backup.Error = err.Error()
	bs.db.WithContext(ctx).Save(backup)
	
	if bs.logger != nil {
		bs.logger.Error(ctx, "Backup failed",
			logger.String("backup_id", backup.ID),
			logger.Err(err))
	}
}

// ListBackups lists all backups for a site
func (bs *BackupService) ListBackups(ctx context.Context, siteID string) ([]*models.HugoBackup, error) {
	if siteID == "" {
		return nil, fmt.Errorf("site ID is required")
	}

	var backups []*models.HugoBackup
	err := bs.db.WithContext(ctx).
		Where("site_id = ?", siteID).
		Order("created_at DESC").
		Find(&backups).Error

	if err != nil {
		return nil, fmt.Errorf("failed to list backups: %w", err)
	}

	return backups, nil
}

// GetBackup retrieves a specific backup
func (bs *BackupService) GetBackup(ctx context.Context, backupID string) (*models.HugoBackup, error) {
	if backupID == "" {
		return nil, fmt.Errorf("backup ID is required")
	}

	var backup models.HugoBackup
	err := bs.db.WithContext(ctx).Where("id = ?", backupID).First(&backup).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("backup not found: %s", backupID)
		}
		return nil, fmt.Errorf("failed to get backup: %w", err)
	}

	return &backup, nil
}

// RestoreBackup restores a site from a backup
func (bs *BackupService) RestoreBackup(ctx context.Context, backupID string) (*models.HugoRestore, error) {
	if backupID == "" {
		return nil, fmt.Errorf("backup ID is required")
	}

	// Get backup record
	backup, err := bs.GetBackup(ctx, backupID)
	if err != nil {
		return nil, err
	}

	if backup.Status != models.BackupStatusCompleted {
		return nil, fmt.Errorf("backup is not completed: %s", backup.Status)
	}

	// Create restore record
	restore := &models.HugoRestore{
		ID:        uuid.New().String(),
		BackupID:  backupID,
		SiteID:    backup.SiteID,
		Status:    models.RestoreStatusPending,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := bs.db.WithContext(ctx).Create(restore).Error; err != nil {
		return nil, fmt.Errorf("failed to create restore record: %w", err)
	}

	// Start restore process in background
	go bs.performRestore(context.Background(), restore, backup)

	return restore, nil
}

// performRestore performs the actual restore operation
func (bs *BackupService) performRestore(ctx context.Context, restore *models.HugoRestore, backup *models.HugoBackup) {
	// Update status to in progress
	restore.Status = models.RestoreStatusInProgress
	bs.db.WithContext(ctx).Save(restore)

	// Download backup archive
	archiveData, _, err := bs.storage.GetFile(ctx, bs.bucket, backup.StoragePath)
	if err != nil {
		bs.handleRestoreError(ctx, restore, fmt.Errorf("failed to download backup: %w", err))
		return
	}

	// Extract archive
	gr, err := gzip.NewReader(bytes.NewReader(archiveData))
	if err != nil {
		bs.handleRestoreError(ctx, restore, fmt.Errorf("failed to open gzip reader: %w", err))
		return
	}
	defer gr.Close()

	tr := tar.NewReader(gr)
	sitePath := fmt.Sprintf("sites/%s", backup.SiteID)

	// Clear existing site files
	files, err := bs.storage.ListObjects(ctx, bs.bucket, sitePath, 1000)
	if err == nil {
		for _, fileObj := range files {
			// Extract directory and filename from ObjectKey
			dir := filepath.Dir(fileObj.ObjectKey)
			name := filepath.Base(fileObj.ObjectKey)
			bs.storage.DeleteObject(ctx, bs.bucket, dir, name)
		}
	}

	// Extract and restore files
	for {
		header, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			bs.handleRestoreError(ctx, restore, fmt.Errorf("failed to read tar header: %w", err))
			return
		}

		// Read file content
		content := make([]byte, header.Size)
		if _, err := io.ReadFull(tr, content); err != nil {
			bs.handleRestoreError(ctx, restore, fmt.Errorf("failed to read file content: %w", err))
			return
		}

		// Store file
		dir := filepath.Join(sitePath, filepath.Dir(header.Name))
		name := filepath.Base(header.Name)
		_, err = bs.storage.UploadObject(ctx, bs.bucket, dir, name, content, "application/octet-stream", nil)
		if err != nil {
			bs.handleRestoreError(ctx, restore, fmt.Errorf("failed to restore file %s: %w", header.Name, err))
			return
		}
	}

	// Update restore record
	restore.Status = models.RestoreStatusCompleted
	restore.CompletedAt = timePtr(time.Now())
	bs.db.WithContext(ctx).Save(restore)
}

// handleRestoreError handles errors during restore process
func (bs *BackupService) handleRestoreError(ctx context.Context, restore *models.HugoRestore, err error) {
	restore.Status = models.RestoreStatusFailed
	restore.Error = err.Error()
	bs.db.WithContext(ctx).Save(restore)
	
	if bs.logger != nil {
		bs.logger.Error(ctx, "Restore failed",
			logger.String("restore_id", restore.ID),
			logger.Err(err))
	}
}

// DeleteBackup deletes a backup
func (bs *BackupService) DeleteBackup(ctx context.Context, backupID string) error {
	if backupID == "" {
		return fmt.Errorf("backup ID is required")
	}

	// Get backup record
	backup, err := bs.GetBackup(ctx, backupID)
	if err != nil {
		return err
	}

	// Delete backup file from storage
	if backup.StoragePath != "" {
		dir := filepath.Dir(backup.StoragePath)
		name := filepath.Base(backup.StoragePath)
		if err := bs.storage.DeleteObject(ctx, bs.bucket, dir, name); err != nil {
			// Log error but continue with database deletion
			if bs.logger != nil {
				bs.logger.Error(ctx, "Failed to delete backup file",
					logger.String("backup_id", backupID),
					logger.String("path", backup.StoragePath),
					logger.Err(err))
			}
		}
	}

	// Delete backup record
	if err := bs.db.WithContext(ctx).Delete(&backup).Error; err != nil {
		return fmt.Errorf("failed to delete backup record: %w", err)
	}

	return nil
}

// Helper function to get pointer to time
func timePtr(t time.Time) *time.Time {
	return &t
}