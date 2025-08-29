package services

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/logger"
)

// StorageService handles storage operations
type StorageService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewStorageService creates a new storage service
func NewStorageService(db *gorm.DB, logger logger.Logger) *StorageService {
	return &StorageService{
		db:     db,
		logger: logger,
	}
}

// CreateBucket creates a new storage bucket
func (s *StorageService) CreateBucket(ctx context.Context, name string, public bool) (*models.Bucket, error) {
	bucket := &models.Bucket{
		Name:   name,
		Public: public,
	}

	if err := s.db.WithContext(ctx).Create(bucket).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, fmt.Errorf("bucket %s already exists", name)
		}
		return nil, fmt.Errorf("failed to create bucket: %w", err)
	}

	return bucket, nil
}

// GetBucket retrieves a bucket by name
func (s *StorageService) GetBucket(ctx context.Context, name string) (*models.Bucket, error) {
	var bucket models.Bucket
	err := s.db.WithContext(ctx).Where("name = ?", name).First(&bucket).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("bucket not found")
		}
		return nil, fmt.Errorf("failed to get bucket: %w", err)
	}
	return &bucket, nil
}

// ListBuckets lists all buckets with stats
func (s *StorageService) ListBuckets(ctx context.Context) ([]BucketInfo, error) {
	var buckets []models.Bucket
	err := s.db.WithContext(ctx).Order("name").Find(&buckets).Error
	if err != nil {
		return nil, fmt.Errorf("failed to list buckets: %w", err)
	}
	
	// Convert to BucketInfo with stats
	bucketInfos := make([]BucketInfo, len(buckets))
	for i, bucket := range buckets {
		// Get file count and total size for this bucket
		var fileCount int64
		var totalSize int64
		
		s.db.WithContext(ctx).Model(&models.Object{}).
			Where("bucket_id = ?", bucket.ID).
			Count(&fileCount)
		
		s.db.WithContext(ctx).Model(&models.Object{}).
			Where("bucket_id = ?", bucket.ID).
			Select("COALESCE(SUM(size), 0)").
			Scan(&totalSize)
		
		bucketInfos[i] = BucketInfo{
			Name:      bucket.Name,
			Public:    bucket.Public,
			FileCount: int(fileCount),
			TotalSize: totalSize,
			CreatedAt: bucket.CreatedAt,
		}
	}
	
	return bucketInfos, nil
}

// DeleteBucket deletes a bucket and all its objects
func (s *StorageService) DeleteBucket(ctx context.Context, name string) error {
	bucket, err := s.GetBucket(ctx, name)
	if err != nil {
		return err
	}

	// Delete bucket (cascade will delete objects)
	if err := s.db.WithContext(ctx).Delete(bucket).Error; err != nil {
		return fmt.Errorf("failed to delete bucket: %w", err)
	}

	return nil
}

// UploadObject uploads an object to a bucket
func (s *StorageService) UploadObject(ctx context.Context, bucketName, path, name string, content []byte, mimeType string, userID *uuid.UUID) (*models.Object, error) {
	// Get bucket
	bucket, err := s.GetBucket(ctx, bucketName)
	if err != nil {
		return nil, err
	}

	// Clean path
	path = cleanPath(path)

	object := &models.Object{
		BucketID:    bucket.ID,
		Name:        name,
		Path:        path,
		Size:        int64(len(content)),
		Content:     content,
		MimeType:    mimeType,
		UserID:      userID,
	}

	// Check if object already exists
	var existing models.Object
	err = s.db.WithContext(ctx).
		Where("bucket_id = ? AND path = ? AND name = ?", bucket.ID, path, name).
		First(&existing).Error

	if err == nil {
		// Update existing object
		existing.Content = content
		existing.Size = int64(len(content))
		existing.MimeType = mimeType
		if err := s.db.WithContext(ctx).Save(&existing).Error; err != nil {
			return nil, fmt.Errorf("failed to update object: %w", err)
		}
		return &existing, nil
	}

	// Create new object
	if err := s.db.WithContext(ctx).Create(object).Error; err != nil {
		return nil, fmt.Errorf("failed to create object: %w", err)
	}

	return object, nil
}

// GetObject retrieves an object
func (s *StorageService) GetObject(ctx context.Context, bucketName, path, name string) (*models.Object, error) {
	bucket, err := s.GetBucket(ctx, bucketName)
	if err != nil {
		return nil, err
	}

	path = cleanPath(path)

	var object models.Object
	err = s.db.WithContext(ctx).
		Where("bucket_id = ? AND path = ? AND name = ?", bucket.ID, path, name).
		First(&object).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("object not found")
		}
		return nil, fmt.Errorf("failed to get object: %w", err)
	}

	return &object, nil
}

// ListObjects lists objects in a bucket
func (s *StorageService) ListObjects(ctx context.Context, bucketName, prefix string, limit int) ([]models.Object, error) {
	bucket, err := s.GetBucket(ctx, bucketName)
	if err != nil {
		return nil, err
	}

	query := s.db.WithContext(ctx).Where("bucket_id = ?", bucket.ID)
	
	if prefix != "" {
		query = query.Where("path LIKE ?", prefix+"%")
	}

	if limit > 0 {
		query = query.Limit(limit)
	}

	var objects []models.Object
	err = query.Order("path, name").Find(&objects).Error
	if err != nil {
		return nil, fmt.Errorf("failed to list objects: %w", err)
	}

	return objects, nil
}

// DeleteObject deletes an object
func (s *StorageService) DeleteObject(ctx context.Context, bucketName, path, name string) error {
	bucket, err := s.GetBucket(ctx, bucketName)
	if err != nil {
		return err
	}

	path = cleanPath(path)

	result := s.db.WithContext(ctx).
		Where("bucket_id = ? AND path = ? AND name = ?", bucket.ID, path, name).
		Delete(&models.Object{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete object: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("object not found")
	}

	return nil
}

// GetObjectsByUser gets all objects uploaded by a user
func (s *StorageService) GetObjectsByUser(ctx context.Context, userID uuid.UUID) ([]models.Object, error) {
	var objects []models.Object
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
func (s *StorageService) GetBucketSize(ctx context.Context, bucketName string) (int64, error) {
	bucket, err := s.GetBucket(ctx, bucketName)
	if err != nil {
		return 0, err
	}

	var totalSize int64
	err = s.db.WithContext(ctx).
		Model(&models.Object{}).
		Where("bucket_id = ?", bucket.ID).
		Select("COALESCE(SUM(size), 0)").
		Scan(&totalSize).Error

	if err != nil {
		return 0, fmt.Errorf("failed to calculate bucket size: %w", err)
	}

	return totalSize, nil
}

// Helper function to clean paths
func cleanPath(path string) string {
	// Remove leading/trailing slashes
	path = strings.Trim(path, "/")
	// Clean the path
	path = filepath.Clean(path)
	// Replace backslashes with forward slashes (Windows compatibility)
	path = strings.ReplaceAll(path, "\\", "/")
	return path
}

// ListFilesWithFolders lists files and virtual folders in a bucket
func (s *StorageService) ListFilesWithFolders(ctx context.Context, bucketName, prefix string) ([]models.Object, []string, error) {
	bucket, err := s.GetBucket(ctx, bucketName)
	if err != nil {
		return nil, nil, err
	}
	
	var objects []models.Object
	query := s.db.WithContext(ctx).Where("bucket_id = ?", bucket.ID)
	
	// If prefix is provided, filter by it
	if prefix != "" {
		cleanPrefix := cleanPath(prefix)
		query = query.Where("path LIKE ?", cleanPrefix+"%")
	}
	
	err = query.Order("path, name").Find(&objects).Error
	if err != nil {
		return nil, nil, fmt.Errorf("failed to list objects: %w", err)
	}
	
	// Extract unique folders from paths
	folderMap := make(map[string]bool)
	for _, obj := range objects {
		if obj.Path != "" && obj.Path != "/" {
			// Get all parent folders
			parts := strings.Split(obj.Path, "/")
			for i := 1; i <= len(parts); i++ {
				folder := strings.Join(parts[:i], "/")
				if folder != "" {
					folderMap[folder] = true
				}
			}
		}
	}
	
	// Convert map to slice
	folders := make([]string, 0, len(folderMap))
	for folder := range folderMap {
		folders = append(folders, folder)
	}
	
	return objects, folders, nil
}

// CreateFolder creates a virtual folder (just a placeholder object)
func (s *StorageService) CreateFolder(ctx context.Context, bucketName, folderPath string) error {
	// Folders are virtual in our system, created by file paths
	// This is a no-op but we return success
	return nil
}

// UploadFileWithContent uploads a file with content
func (s *StorageService) UploadFileWithContent(ctx context.Context, bucketName, path, name string, content []byte, mimeType string, userID *uuid.UUID) (*models.Object, error) {
	return s.UploadObject(ctx, bucketName, path, name, content, mimeType, userID)
}

// DeleteFile deletes a file
func (s *StorageService) DeleteFile(ctx context.Context, bucketName, path, name string) error {
	return s.DeleteObject(ctx, bucketName, path, name)
}

// GetFile retrieves a file's content and type
func (s *StorageService) GetFile(ctx context.Context, bucketName, fullPath string) ([]byte, string, error) {
	// Split full path into directory and filename
	dir := filepath.Dir(fullPath)
	filename := filepath.Base(fullPath)
	if dir == "." {
		dir = ""
	}
	
	obj, err := s.GetObject(ctx, bucketName, dir, filename)
	if err != nil {
		return nil, "", err
	}
	
	return obj.Content, obj.MimeType, nil
}

// UpdateFile updates a file's content
func (s *StorageService) UpdateFile(ctx context.Context, bucketName, fullPath string, content []byte) error {
	// Split full path into directory and filename
	dir := filepath.Dir(fullPath)
	filename := filepath.Base(fullPath)
	if dir == "." {
		dir = ""
	}
	
	// Get existing object
	obj, err := s.GetObject(ctx, bucketName, dir, filename)
	if err != nil {
		return err
	}
	
	// Update content
	obj.Content = content
	obj.Size = int64(len(content))
	
	return s.db.WithContext(ctx).Save(obj).Error
}

// GenerateSignedURL generates a signed URL for temporary access
func (s *StorageService) GenerateSignedURL(ctx context.Context, bucketName, fullPath string, expiresIn time.Duration) (string, error) {
	// This is a placeholder implementation
	// In a real system, you'd generate a proper signed URL with expiration
	return fmt.Sprintf("/api/storage/%s/%s?expires=%d", bucketName, fullPath, time.Now().Add(expiresIn).Unix()), nil
}

// ValidateSignedURL validates a signed URL
func (s *StorageService) ValidateSignedURL(ctx context.Context, signedURL string) (bool, error) {
	// This is a placeholder implementation
	// In a real system, you'd validate the signature and expiration
	return true, nil
}