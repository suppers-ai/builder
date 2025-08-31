package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/suppers-ai/logger"
	"gorm.io/gorm"
)

// Manager handles storage operations with database tracking
type Manager struct {
	provider Provider
	db       *gorm.DB
	logger   logger.Logger
	config   Config
}

// NewManager creates a new storage manager
func NewManager(cfg Config, db *gorm.DB, logger logger.Logger) (*Manager, error) {
	provider, err := NewProvider(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create storage provider: %w", err)
	}
	
	return &Manager{
		provider: provider,
		db:       db,
		logger:   logger,
		config:   cfg,
	}, nil
}

// GetProvider returns the underlying storage provider
func (m *Manager) GetProvider() Provider {
	return m.provider
}

// CreateBucket creates a new bucket in both storage and database
func (m *Manager) CreateBucket(ctx context.Context, name string, public bool) (*StorageBucket, error) {
	// Create in storage provider first
	err := m.provider.CreateBucket(ctx, name, CreateBucketOptions{
		Public: public,
		Region: m.config.S3Region,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create bucket in storage: %w", err)
	}
	
	// Create in database
	bucket := &StorageBucket{
		Name:   name,
		Public: public,
	}
	
	if err := m.db.WithContext(ctx).Create(bucket).Error; err != nil {
		// Try to clean up the storage bucket
		m.provider.DeleteBucket(ctx, name)
		return nil, fmt.Errorf("failed to create bucket in database: %w", err)
	}
	
	m.logger.Info(ctx, "Bucket created",
		logger.String("bucket", name),
		logger.Bool("public", public),
		logger.String("provider", string(m.provider.Type())))
	
	return bucket, nil
}

// DeleteBucket deletes a bucket from both storage and database
func (m *Manager) DeleteBucket(ctx context.Context, name string) error {
	// Get bucket from database
	var bucket StorageBucket
	err := m.db.WithContext(ctx).Where("name = ?", name).First(&bucket).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("bucket not found")
		}
		return fmt.Errorf("failed to get bucket: %w", err)
	}
	
	// Delete from storage provider
	err = m.provider.DeleteBucket(ctx, name)
	if err != nil {
		m.logger.Error(ctx, "Failed to delete bucket from storage",
			logger.String("bucket", name),
			logger.Err(err))
		// Continue to delete from database anyway
	}
	
	// Delete from database (cascade will delete objects)
	if err := m.db.WithContext(ctx).Delete(&bucket).Error; err != nil {
		return fmt.Errorf("failed to delete bucket from database: %w", err)
	}
	
	m.logger.Info(ctx, "Bucket deleted",
		logger.String("bucket", name))
	
	return nil
}

// GetBucket retrieves a bucket by name
func (m *Manager) GetBucket(ctx context.Context, name string) (*StorageBucket, error) {
	var bucket StorageBucket
	err := m.db.WithContext(ctx).Where("name = ?", name).First(&bucket).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("bucket not found")
		}
		return nil, fmt.Errorf("failed to get bucket: %w", err)
	}
	return &bucket, nil
}

// ListBuckets lists all buckets with stats
func (m *Manager) ListBuckets(ctx context.Context) ([]BucketInfo, error) {
	// Get buckets from provider
	providerBuckets, err := m.provider.ListBuckets(ctx)
	if err != nil {
		m.logger.Error(ctx, "Failed to list buckets from provider", logger.Err(err))
		// Fall back to database
		return m.listBucketsFromDB(ctx)
	}
	
	// Sync with database
	for _, pb := range providerBuckets {
		var bucket StorageBucket
		err := m.db.WithContext(ctx).Where("name = ?", pb.Name).First(&bucket).Error
		if err == gorm.ErrRecordNotFound {
			// Create missing bucket in database
			bucket = StorageBucket{
				Name:   pb.Name,
				Public: pb.Public,
			}
			m.db.WithContext(ctx).Create(&bucket)
		}
	}
	
	return providerBuckets, nil
}

// listBucketsFromDB lists buckets from database as fallback
func (m *Manager) listBucketsFromDB(ctx context.Context) ([]BucketInfo, error) {
	var buckets []StorageBucket
	err := m.db.WithContext(ctx).Order("name").Find(&buckets).Error
	if err != nil {
		return nil, fmt.Errorf("failed to list buckets: %w", err)
	}
	
	bucketInfos := make([]BucketInfo, len(buckets))
	for i, bucket := range buckets {
		// Get file count and total size for this bucket
		var fileCount int64
		var totalSize int64
		
		m.db.WithContext(ctx).Model(&StorageObject{}).
			Where("bucket_name = ?", bucket.Name).
			Count(&fileCount)
		
		m.db.WithContext(ctx).Model(&StorageObject{}).
			Where("bucket_name = ?", bucket.Name).
			Select("COALESCE(SUM(size), 0)").
			Scan(&totalSize)
		
		bucketInfos[i] = BucketInfo{
			Name:        bucket.Name,
			Public:      bucket.Public,
			ObjectCount: fileCount,
			TotalSize:   totalSize,
			CreatedAt:   bucket.CreatedAt,
		}
	}
	
	return bucketInfos, nil
}

// UploadObject uploads an object to storage and tracks it in database
func (m *Manager) UploadObject(ctx context.Context, bucketName, path, name string, content []byte, mimeType string, userID *uuid.UUID) (*StorageObject, error) {
	// Get bucket from database
	bucket, err := m.GetBucket(ctx, bucketName)
	if err != nil {
		return nil, err
	}
	
	// Clean path
	path = cleanPath(path)
	
	// Build full key for storage
	key := filepath.Join(path, name)
	if path == "" || path == "." {
		key = name
	}
	
	// Upload to storage provider
	reader := bytes.NewReader(content)
	err = m.provider.PutObject(ctx, bucketName, key, reader, int64(len(content)), PutObjectOptions{
		ContentType: mimeType,
		Public:      bucket.Public,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to storage: %w", err)
	}
	
	// Check if object already exists in database
	var existing StorageObject
	err = m.db.WithContext(ctx).
		Where("bucket_name = ? AND path = ? AND name = ?", bucket.Name, path, name).
		First(&existing).Error
	
	if err == nil {
		// Update existing object
		existing.Size = int64(len(content))
		existing.ContentType = mimeType
		if err := m.db.WithContext(ctx).Save(&existing).Error; err != nil {
			return nil, fmt.Errorf("failed to update object in database: %w", err)
		}
		
		m.logger.Info(ctx, "Object updated",
			logger.String("bucket", bucketName),
			logger.String("path", path),
			logger.String("name", name))
		
		return &existing, nil
	}
	
	// Convert userID to string if provided
	var userIDStr string
	if userID != nil {
		userIDStr = userID.String()
	}
	
	// Create new object in database
	object := &StorageObject{
		BucketName:  bucket.Name,
		ObjectKey:   filepath.Join(path, name),
		Size:        int64(len(content)),
		ContentType: mimeType,
		UserID:      userIDStr,
	}
	
	if err := m.db.WithContext(ctx).Create(object).Error; err != nil {
		// Try to clean up from storage
		m.provider.DeleteObject(ctx, bucketName, key)
		return nil, fmt.Errorf("failed to create object in database: %w", err)
	}
	
	m.logger.Info(ctx, "Object uploaded",
		logger.String("bucket", bucketName),
		logger.String("path", path),
		logger.String("name", name),
		logger.Int64("size", object.Size))
	
	return object, nil
}

// GetObject retrieves an object from storage
func (m *Manager) GetObject(ctx context.Context, bucketName, path, name string) (*StorageObject, error) {
	// Get bucket from database
	bucket, err := m.GetBucket(ctx, bucketName)
	if err != nil {
		return nil, err
	}
	
	path = cleanPath(path)
	
	// Get object from database
	var object StorageObject
	err = m.db.WithContext(ctx).
		Where("bucket_name = ? AND path = ? AND name = ?", bucket.Name, path, name).
		First(&object).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("object not found")
		}
		return nil, fmt.Errorf("failed to get object: %w", err)
	}
	
	// Object found in database
	return &object, nil
	
	return &object, nil
}

// DeleteObject deletes an object from storage and database
func (m *Manager) DeleteObject(ctx context.Context, bucketName, path, name string) error {
	// Get bucket from database
	bucket, err := m.GetBucket(ctx, bucketName)
	if err != nil {
		return err
	}
	
	path = cleanPath(path)
	
	// Build full key for storage
	key := filepath.Join(path, name)
	if path == "" || path == "." {
		key = name
	}
	
	// Delete from storage provider
	err = m.provider.DeleteObject(ctx, bucketName, key)
	if err != nil {
		m.logger.Error(ctx, "Failed to delete object from storage",
			logger.String("bucket", bucketName),
			logger.String("key", key),
			logger.Err(err))
		// Continue to delete from database anyway
	}
	
	// Delete from database
	fullKey := filepath.Join(path, name)
	if path == "" || path == "." {
		fullKey = name
	}
	result := m.db.WithContext(ctx).
		Where("bucket_name = ? AND object_key = ?", bucket.Name, fullKey).
		Delete(&StorageObject{})
	
	if result.Error != nil {
		return fmt.Errorf("failed to delete object from database: %w", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("object not found")
	}
	
	m.logger.Info(ctx, "Object deleted",
		logger.String("bucket", bucketName),
		logger.String("path", path),
		logger.String("name", name))
	
	return nil
}

// ListObjects lists objects in a bucket
func (m *Manager) ListObjects(ctx context.Context, bucketName, prefix string, limit int) ([]StorageObject, error) {
	// Get bucket from database
	bucket, err := m.GetBucket(ctx, bucketName)
	if err != nil {
		return nil, err
	}
	
	// List from database (could also list from provider and sync)
	query := m.db.WithContext(ctx).Where("bucket_name = ?", bucket.Name)
	
	if prefix != "" {
		query = query.Where("path LIKE ?", prefix+"%")
	}
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	var objects []StorageObject
	err = query.Order("path, name").Find(&objects).Error
	if err != nil {
		return nil, fmt.Errorf("failed to list objects: %w", err)
	}
	
	return objects, nil
}

// ListFilesWithFolders lists files and virtual folders in a bucket
func (m *Manager) ListFilesWithFolders(ctx context.Context, bucketName, prefix string) ([]StorageObject, []string, error) {
	objects, err := m.ListObjects(ctx, bucketName, prefix, 0)
	if err != nil {
		return nil, nil, err
	}
	
	// Extract unique folders from object keys
	folderMap := make(map[string]bool)
	for _, obj := range objects {
		// Extract directory from object key
		dir := filepath.Dir(obj.ObjectKey)
		if dir != "" && dir != "." && dir != "/" {
			// Get all parent folders
			parts := strings.Split(dir, "/")
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

// GenerateSignedURL generates a signed URL for temporary access
func (m *Manager) GenerateSignedURL(ctx context.Context, bucketName, fullPath string, expiresIn time.Duration) (string, error) {
	
	// Verify object exists in database
	bucket, err := m.GetBucket(ctx, bucketName)
	if err != nil {
		return "", err
	}
	
	var object StorageObject
	err = m.db.WithContext(ctx).
		Where("bucket_name = ? AND object_key = ?", bucket.Name, fullPath).
		First(&object).Error
	
	if err != nil {
		return "", fmt.Errorf("object not found")
	}
	
	// Generate presigned URL from provider
	return m.provider.GeneratePresignedURL(ctx, bucketName, fullPath, expiresIn)
}

// GetFile retrieves a file's content and type
func (m *Manager) GetFile(ctx context.Context, bucketName, fullPath string) ([]byte, string, error) {
	// Split full path into directory and filename
	dir := filepath.Dir(fullPath)
	filename := filepath.Base(fullPath)
	if dir == "." {
		dir = ""
	}
	
	obj, err := m.GetObject(ctx, bucketName, dir, filename)
	if err != nil {
		return nil, "", err
	}
	
	// Fetch content from provider
	reader, err := m.provider.GetObject(ctx, bucketName, fullPath)
	if err != nil {
		return nil, "", fmt.Errorf("failed to get object from storage: %w", err)
	}
	defer reader.Close()
	
	content, err := io.ReadAll(reader)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read object content: %w", err)
	}
	
	return content, obj.ContentType, nil
}

// UpdateFile updates a file's content
func (m *Manager) UpdateFile(ctx context.Context, bucketName, fullPath string, content []byte) error {
	// Split full path into directory and filename
	dir := filepath.Dir(fullPath)
	filename := filepath.Base(fullPath)
	if dir == "." {
		dir = ""
	}
	
	// Get existing object
	obj, err := m.GetObject(ctx, bucketName, dir, filename)
	if err != nil {
		return err
	}
	
	// Upload new content to provider
	key := fullPath
	reader := bytes.NewReader(content)
	err = m.provider.PutObject(ctx, bucketName, key, reader, int64(len(content)), PutObjectOptions{
		ContentType: obj.ContentType,
	})
	if err != nil {
		return fmt.Errorf("failed to update object in storage: %w", err)
	}
	
	// Update database
	obj.Size = int64(len(content))
	
	return m.db.WithContext(ctx).Save(obj).Error
}

// SyncWithProvider syncs the database with the storage provider
func (m *Manager) SyncWithProvider(ctx context.Context, bucketName string) error {
	// List objects from provider
	providerObjects, err := m.provider.ListObjects(ctx, bucketName, "", ListObjectsOptions{
		Recursive: true,
	})
	if err != nil {
		return fmt.Errorf("failed to list objects from provider: %w", err)
	}
	
	// Get bucket from database
	bucket, err := m.GetBucket(ctx, bucketName)
	if err != nil {
		return err
	}
	
	// Sync each object
	for _, pObj := range providerObjects {
		if pObj.IsDir {
			continue
		}
		
		// Check if object exists in database
		var dbObj StorageObject
		err := m.db.WithContext(ctx).
			Where("bucket_name = ? AND object_key = ?", bucket.Name, pObj.Key).
			First(&dbObj).Error
		
		if err == gorm.ErrRecordNotFound {
			// Create missing object in database
			dbObj = StorageObject{
				BucketName:  bucket.Name,
				ObjectKey:   pObj.Key,
				Size:        pObj.Size,
				ContentType: pObj.ContentType,
			}
			m.db.WithContext(ctx).Create(&dbObj)
			m.logger.Info(ctx, "Synced object from provider",
				logger.String("bucket", bucketName),
				logger.String("key", pObj.Key))
		}
	}
	
	return nil
}

// Helper function to clean paths
func cleanPath(path string) string {
	// Remove leading/trailing slashes
	path = strings.Trim(path, "/")
	// Clean the path
	path = filepath.Clean(path)
	// Replace backslashes with forward slashes (Windows compatibility)
	path = strings.ReplaceAll(path, "\\", "/")
	if path == "." {
		return ""
	}
	return path
}