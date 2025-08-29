package services

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/storage"
	"gorm.io/gorm"
)

// EnhancedStorageService creates a new storage service with the new storage manager
type EnhancedStorageService struct {
	manager *storage.Manager
	db      *gorm.DB
	logger  logger.Logger
}

// InitEnhancedStorageService initializes the storage service with the new storage manager
func InitEnhancedStorageService(db *gorm.DB, logger logger.Logger, cfg storage.Config) (*EnhancedStorageService, error) {
	// Set default storage type if not specified
	if cfg.Provider == "" {
		cfg.Provider = storage.ProviderLocal
	}
	
	// Set default base path for local storage
	if cfg.Provider == storage.ProviderLocal && cfg.BasePath == "" {
		cfg.BasePath = "./.data/storage"
	}
	
	// Set base URL from environment or default
	if cfg.BaseURL == "" {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		cfg.BaseURL = fmt.Sprintf("http://localhost:%s", port)
	}
	
	manager, err := storage.NewManager(cfg, db, logger)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage manager: %w", err)
	}
	
	return &EnhancedStorageService{
		manager: manager,
		db:      db,
		logger:  logger,
	}, nil
}

// GetManager returns the underlying storage manager
func (s *EnhancedStorageService) GetManager() *storage.Manager {
	return s.manager
}

// CreateBucket creates a new storage bucket
func (s *EnhancedStorageService) CreateBucket(ctx context.Context, name string, public bool) (*storage.Bucket, error) {
	return s.manager.CreateBucket(ctx, name, public)
}

// GetBucket retrieves a bucket by name
func (s *EnhancedStorageService) GetBucket(ctx context.Context, name string) (*storage.Bucket, error) {
	return s.manager.GetBucket(ctx, name)
}

// ListBuckets lists all buckets with stats
func (s *EnhancedStorageService) ListBuckets(ctx context.Context) ([]BucketInfo, error) {
	buckets, err := s.manager.ListBuckets(ctx)
	if err != nil {
		return nil, err
	}
	
	// Convert storage.BucketInfo to services.BucketInfo
	result := make([]BucketInfo, len(buckets))
	for i, b := range buckets {
		result[i] = BucketInfo{
			Name:      b.Name,
			Public:    b.Public,
			FileCount: int(b.ObjectCount),
			TotalSize: b.TotalSize,
			CreatedAt: b.CreatedAt,
		}
	}
	
	return result, nil
}

// DeleteBucket deletes a bucket and all its objects
func (s *EnhancedStorageService) DeleteBucket(ctx context.Context, name string) error {
	return s.manager.DeleteBucket(ctx, name)
}

// UploadObject uploads an object to a bucket
func (s *EnhancedStorageService) UploadObject(ctx context.Context, bucketName, path, name string, content []byte, mimeType string, userID *uuid.UUID) (*storage.StorageObject, error) {
	return s.manager.UploadObject(ctx, bucketName, path, name, content, mimeType, userID)
}

// GetObject retrieves an object
func (s *EnhancedStorageService) GetObject(ctx context.Context, bucketName, path, name string) (*storage.StorageObject, error) {
	return s.manager.GetObject(ctx, bucketName, path, name)
}

// ListObjects lists objects in a bucket
func (s *EnhancedStorageService) ListObjects(ctx context.Context, bucketName, prefix string, limit int) ([]storage.StorageObject, error) {
	return s.manager.ListObjects(ctx, bucketName, prefix, limit)
}

// DeleteObject deletes an object
func (s *EnhancedStorageService) DeleteObject(ctx context.Context, bucketName, path, name string) error {
	return s.manager.DeleteObject(ctx, bucketName, path, name)
}

// GetObjectsByUser gets all objects uploaded by a user
func (s *EnhancedStorageService) GetObjectsByUser(ctx context.Context, userID uuid.UUID) ([]storage.StorageObject, error) {
	var objects []storage.StorageObject
	err := s.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&objects).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get user objects: %w", err)
	}

	return objects, nil
}

// GetBucketSize calculates the total size of all objects in a bucket
func (s *EnhancedStorageService) GetBucketSize(ctx context.Context, bucketName string) (int64, error) {
	bucket, err := s.manager.GetBucket(ctx, bucketName)
	if err != nil {
		return 0, err
	}

	var totalSize int64
	err = s.db.WithContext(ctx).
		Model(&storage.StorageObject{}).
		Where("bucket_id = ?", bucket.ID).
		Select("COALESCE(SUM(size), 0)").
		Scan(&totalSize).Error

	if err != nil {
		return 0, fmt.Errorf("failed to calculate bucket size: %w", err)
	}

	return totalSize, nil
}

// ListFilesWithFolders lists files and virtual folders in a bucket
func (s *EnhancedStorageService) ListFilesWithFolders(ctx context.Context, bucketName, prefix string) ([]storage.StorageObject, []string, error) {
	return s.manager.ListFilesWithFolders(ctx, bucketName, prefix)
}

// CreateFolder creates a virtual folder (no-op for compatibility)
func (s *EnhancedStorageService) CreateFolder(ctx context.Context, bucketName, folderPath string) error {
	// Folders are virtual in our system, created by file paths
	// This is a no-op but we return success
	return nil
}

// UploadFileWithContent uploads a file with content
func (s *EnhancedStorageService) UploadFileWithContent(ctx context.Context, bucketName, path, name string, content []byte, mimeType string, userID *uuid.UUID) (*storage.StorageObject, error) {
	return s.manager.UploadObject(ctx, bucketName, path, name, content, mimeType, userID)
}

// DeleteFile deletes a file
func (s *EnhancedStorageService) DeleteFile(ctx context.Context, bucketName, path, name string) error {
	return s.manager.DeleteObject(ctx, bucketName, path, name)
}

// GetFile retrieves a file's content and type
func (s *EnhancedStorageService) GetFile(ctx context.Context, bucketName, fullPath string) ([]byte, string, error) {
	return s.manager.GetFile(ctx, bucketName, fullPath)
}

// UpdateFile updates a file's content
func (s *EnhancedStorageService) UpdateFile(ctx context.Context, bucketName, fullPath string, content []byte) error {
	return s.manager.UpdateFile(ctx, bucketName, fullPath, content)
}

// GenerateSignedURL generates a signed URL for temporary access
func (s *EnhancedStorageService) GenerateSignedURL(ctx context.Context, bucketName, fullPath string, expiresIn time.Duration) (string, error) {
	return s.manager.GenerateSignedURL(ctx, bucketName, fullPath, expiresIn)
}

// ValidateSignedURL validates a signed URL (placeholder for compatibility)
func (s *EnhancedStorageService) ValidateSignedURL(ctx context.Context, signedURL string) (bool, error) {
	// This would be implemented based on your signing mechanism
	return true, nil
}

// SyncWithProvider syncs the database with the storage provider
func (s *EnhancedStorageService) SyncWithProvider(ctx context.Context, bucketName string) error {
	return s.manager.SyncWithProvider(ctx, bucketName)
}

// GetProviderType returns the current storage provider type
func (s *EnhancedStorageService) GetProviderType() string {
	return string(s.manager.GetProvider().Type())
}

// GetProviderName returns the current storage provider name
func (s *EnhancedStorageService) GetProviderName() string {
	return s.manager.GetProvider().Name()
}