package services

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/suppers-ai/solobase/config"
	"github.com/suppers-ai/solobase/database"
	"github.com/suppers-ai/solobase/storage"
	pkgstorage "github.com/suppers-ai/storage"
)

// EnhancedStorageService is an alias for StorageService
type EnhancedStorageService = StorageService

// StorageOptions contains optional configuration for StorageService
type StorageOptions struct {
	AppID string // Application ID for storage isolation (defaults to "solobase")
}

type StorageService struct {
	config   config.StorageConfig
	provider storage.Provider
	storage  *storage.Storage
	db       *database.DB
	appID    string // Application ID for storage isolation
}

func NewStorageService(db *database.DB, cfg config.StorageConfig) *StorageService {
	// Default to "solobase" app ID
	return NewStorageServiceWithOptions(db, cfg, &StorageOptions{
		AppID: "solobase",
	})
}

// NewStorageServiceWithOptions creates a new storage service with custom options
func NewStorageServiceWithOptions(db *database.DB, cfg config.StorageConfig, opts *StorageOptions) *StorageService {
	var provider storage.Provider
	var err error
	
	// Default options
	if opts == nil {
		opts = &StorageOptions{}
	}
	if opts.AppID == "" {
		opts.AppID = "solobase"
	}
	
	// Update path to use new structure
	localPath := cfg.LocalStoragePath
	if localPath == "" || localPath == "./data/storage" || localPath == "./.data/storage" {
		localPath = "./.data/storage/int" // Internal storage path
	}
	
	switch cfg.Type {
	case "s3":
		provider, err = storage.NewS3Provider(
			cfg.S3Endpoint,
			cfg.S3AccessKey,
			cfg.S3SecretKey,
			cfg.S3Region,
			cfg.S3UseSSL,
		)
		if err != nil {
			log.Printf("Failed to initialize S3 storage: %v, falling back to local", err)
			provider, _ = storage.NewLocalProvider(localPath)
		}
	default:
		provider, err = storage.NewLocalProvider(localPath)
		if err != nil {
			log.Printf("Failed to initialize local storage: %v", err)
		}
	}
	
	service := &StorageService{
		config:   cfg,
		provider: provider,
		storage:  storage.New(provider),
		db:       db,
		appID:    opts.AppID,
	}
	
	// Initialize default buckets
	service.initializeDefaultBuckets()
	
	return service
}

// initializeDefaultBuckets creates default buckets if they don't exist
func (s *StorageService) initializeDefaultBuckets() {
	defaultBuckets := []struct {
		name   string
		public bool
	}{
		{"int_storage", false},  // Internal storage for user/app data
		{"ext_storage", false},  // External storage for extensions
		{"public", true},        // Public files
	}
	
	for _, bucket := range defaultBuckets {
		// Try to create the bucket (it will fail silently if it already exists)
		if s.storage != nil {
			if err := s.storage.CreateBucket(bucket.name, bucket.public); err != nil {
				// Only log if it's not an "already exists" error
				if !strings.Contains(err.Error(), "exists") && !strings.Contains(err.Error(), "exist") {
					log.Printf("Failed to create default bucket %s: %v", bucket.name, err)
				}
			} else {
				log.Printf("Created default bucket: %s", bucket.name)
			}
		}
	}
}

// GetProviderType returns the type of storage provider being used
func (s *StorageService) GetProviderType() string {
	return s.config.Type
}

// GetAppID returns the application ID for storage isolation
func (s *StorageService) GetAppID() string {
	return s.appID
}

// GetObjectInfo retrieves information about an object
func (s *StorageService) GetObjectInfo(bucket, objectID string) (*pkgstorage.StorageObject, error) {
	var object pkgstorage.StorageObject
	log.Printf("GetObjectInfo: Looking for object with id=%s in bucket=%s", objectID, bucket)
	if err := s.db.Where("id = ? AND bucket_name = ?", objectID, bucket).First(&object).Error; err != nil {
		log.Printf("GetObjectInfo: Failed to find object: %v", err)
		return nil, err
	}
	log.Printf("GetObjectInfo: Found object with key=%s", object.ObjectKey)
	return &object, nil
}

// GetObjectByKey retrieves an object by its storage key
func (s *StorageService) GetObjectByKey(bucket, key string) (io.ReadCloser, string, string, error) {
	if s.storage == nil {
		return nil, "", "", fmt.Errorf("storage not initialized")
	}
	
	// Get object metadata from database
	var object pkgstorage.StorageObject
	if err := s.db.Where("key = ? AND bucket = ?", key, bucket).First(&object).Error; err != nil {
		return nil, "", "", err
	}
	
	// Get the actual file from storage
	reader, err := s.storage.GetObject(bucket, key)
	if err != nil {
		return nil, "", "", err
	}
	
	// Extract filename from object key (last part after /)
	filename := object.ObjectKey
	if idx := strings.LastIndex(filename, "/"); idx >= 0 {
		filename = filename[idx+1:]
	}
	
	return reader, filename, object.ContentType, nil
}

// GeneratePresignedDownloadURL generates a presigned URL for downloading (S3 only)
func (s *StorageService) GeneratePresignedDownloadURL(bucket, key string, expiry int) (string, error) {
	if s.config.Type != "s3" {
		return "", fmt.Errorf("presigned URLs are only supported for S3 storage")
	}
	
	// Use the storage's GetSignedURL method which internally uses GeneratePresignedURL
	return s.storage.GetSignedURL(bucket, key, time.Duration(expiry)*time.Second)
}

// GeneratePresignedUploadURL generates a presigned URL for uploading (S3 only)
func (s *StorageService) GeneratePresignedUploadURL(bucket, key, contentType string, expiry int) (string, error) {
	if s.config.Type != "s3" {
		return "", fmt.Errorf("presigned URLs are only supported for S3 storage")
	}
	
	// For now, we'll use the same method as download
	// In a full implementation, we'd need to extend the storage package to support upload URLs
	return s.storage.GetSignedURL(bucket, key, time.Duration(expiry)*time.Second)
}

func (s *StorageService) CreateBucket(name string, public bool) error {
	if s.storage == nil {
		return fmt.Errorf("storage not initialized")
	}
	
	// Create bucket in storage provider
	err := s.storage.CreateBucket(name, public)
	if err != nil {
		return err
	}
	
	// Save bucket to database
	bucket := &pkgstorage.StorageBucket{
		ID:        uuid.New().String(),
		Name:      name,
		Public:    public,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	
	if err := s.db.Create(bucket).Error; err != nil {
		// Try to rollback storage bucket creation
		s.storage.DeleteBucket(name)
		return err
	}
	
	return nil
}

func (s *StorageService) DeleteBucket(name string) error {
	if s.storage == nil {
		return fmt.Errorf("storage not initialized")
	}
	
	// Delete from storage provider
	err := s.storage.DeleteBucket(name)
	if err != nil {
		return err
	}
	
	// Delete bucket and all objects from database
	if err := s.db.Where("bucket_name = ?", name).Delete(&pkgstorage.StorageObject{}).Error; err != nil {
		return err
	}
	
	if err := s.db.Where("name = ?", name).Delete(&pkgstorage.StorageBucket{}).Error; err != nil {
		return err
	}
	
	return nil
}

func (s *StorageService) GetBuckets() ([]interface{}, error) {
	if s.storage == nil {
		return []interface{}{}, nil
	}
	
	// Get buckets from database
	var buckets []pkgstorage.StorageBucket
	if err := s.db.Find(&buckets).Error; err != nil {
		return nil, err
	}
	
	// Convert to interface slice with stats
	result := make([]interface{}, len(buckets))
	for i, bucket := range buckets {
		// Get object count and size for this bucket
		var count int64
		var totalSize int64
		
		s.db.Model(&pkgstorage.StorageObject{}).
			Where("bucket_name = ?", bucket.Name).
			Count(&count)
		
		s.db.Model(&pkgstorage.StorageObject{}).
			Where("bucket_name = ?", bucket.Name).
			Select("COALESCE(SUM(size), 0)").
			Scan(&totalSize)
		
		result[i] = map[string]interface{}{
			"id":         bucket.ID,
			"name":       bucket.Name,
			"public":     bucket.Public,
			"created_at": bucket.CreatedAt.Format("2006-01-02"),
			"files":      count,
			"size":       formatBytes(totalSize),
			"size_bytes": totalSize,
		}
	}
	
	return result, nil
}

func (s *StorageService) GetBucketObjects(bucket string) ([]interface{}, error) {
	return s.GetBucketObjectsWithPath(bucket, "")
}

func (s *StorageService) GetBucketObjectsWithPath(bucket string, path string) ([]interface{}, error) {
	if s.storage == nil {
		return []interface{}{}, nil
	}
	
	// Clean up the path
	path = strings.TrimPrefix(path, "/")
	path = strings.TrimSuffix(path, "/")
	
	log.Printf("GetBucketObjectsWithPath: bucket=%s, path=%s", bucket, path)
	
	// Determine parent folder ID for current path
	var parentFolderID *string
	if path != "" {
		// Find the folder object for the current path
		var currentFolder pkgstorage.StorageObject
		folderPath := path + "/"
		if err := s.db.Where("bucket_name = ? AND object_key = ? AND content_type = ?", 
			bucket, folderPath, "application/x-directory").First(&currentFolder).Error; err == nil {
			parentFolderID = &currentFolder.ID
		}
	}
	
	// Query for direct children (files and folders) at this level
	query := s.db.Where("bucket_name = ?", bucket)
	if parentFolderID != nil {
		// Get items with this parent folder
		query = query.Where("parent_folder_id = ?", *parentFolderID)
	} else {
		// Get root items (no parent folder)
		query = query.Where("parent_folder_id IS NULL")
	}
	
	var objects []pkgstorage.StorageObject
	if err := query.Find(&objects).Error; err != nil {
		return nil, err
	}
	
	// Build a tree structure from objects
	type Item struct {
		IsFolder bool
		Object   *pkgstorage.StorageObject
	}
	
	// Convert to result format
	result := make([]interface{}, 0, len(objects))
	
	for i := range objects {
		obj := &objects[i]
		
		// Extract display name from object key
		displayName := obj.ObjectKey
		if obj.IsFolder() {
			// Remove trailing slash for folder display
			displayName = strings.TrimSuffix(displayName, "/")
		}
		
		// Get just the name part (not the full path)
		if idx := strings.LastIndex(displayName, "/"); idx >= 0 {
			displayName = displayName[idx+1:]
		}
		
		if displayName == "" || displayName == ".keep" {
			continue // Skip empty names and .keep files
		}
		
		// Determine file type for display
		fileType := "file"
		if obj.IsFolder() {
			fileType = "folder"
		} else {
			fileType = getFileType(displayName)
		}
		
		result = append(result, map[string]interface{}{
			"id":           obj.ID,
			"name":         displayName,
			"fullPath":     obj.ObjectKey,
			"type":         fileType,
			"size":         formatBytes(obj.Size),
			"size_bytes":   obj.Size,
			"modified":     obj.UpdatedAt.Format("2006-01-02 15:04"),
			"content_type": obj.ContentType,
			"checksum":     obj.Checksum,
			"public":       false,
			"isFolder":     obj.IsFolder(),
		})
	}
	
	log.Printf("Returning %d items for path '%s'", len(result), path)
	return result, nil
}

func (s *StorageService) UploadFile(bucket, filename string, reader io.Reader, size int64, mimeType string) (interface{}, error) {
	if s.storage == nil {
		return nil, fmt.Errorf("storage not initialized")
	}
	
	// Clean filename - remove leading slashes
	filename = strings.TrimPrefix(filename, "/")
	
	// Read the content to calculate checksum
	var buf bytes.Buffer
	tee := io.TeeReader(reader, &buf)
	
	// Calculate MD5 checksum
	hash := md5.New()
	if _, err := io.Copy(hash, tee); err != nil {
		return nil, fmt.Errorf("failed to calculate checksum: %v", err)
	}
	checksum := hex.EncodeToString(hash.Sum(nil))
	
	// Find parent folder ID if file is in a folder
	var parentFolderID *string
	if idx := strings.LastIndex(filename, "/"); idx > 0 {
		parentPath := filename[:idx] + "/"
		var parentFolder pkgstorage.StorageObject
		if err := s.db.Where("bucket_name = ? AND object_key = ? AND content_type = ?", 
			bucket, parentPath, "application/x-directory").First(&parentFolder).Error; err == nil {
			parentFolderID = &parentFolder.ID
		}
	}
	
	// Upload to storage provider using the buffered content
	err := s.storage.PutObject(bucket, filename, &buf, size, mimeType)
	if err != nil {
		return nil, err
	}
	
	// Save to database
	storageObj := &pkgstorage.StorageObject{
		ID:             uuid.New().String(),
		BucketName:     bucket,
		ObjectKey:      filename,
		ParentFolderID: parentFolderID,
		Size:           size,
		ContentType:    mimeType,
		Checksum:       checksum,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	
	if err := s.db.Create(storageObj).Error; err != nil {
		// Try to rollback storage upload
		s.storage.DeleteObject(bucket, filename)
		return nil, err
	}
	
	return map[string]interface{}{
		"id":           storageObj.ID,
		"key":          filename,
		"size":         size,
		"content_type": mimeType,
		"checksum":     checksum,
		"url":          s.storage.GetPublicURL(bucket, filename),
	}, nil
}

func (s *StorageService) UploadFileBytes(bucket, filename string, content []byte, mimeType string) (interface{}, error) {
	reader := bytes.NewReader(content)
	return s.UploadFile(bucket, filename, reader, int64(len(content)), mimeType)
}

func (s *StorageService) GetObject(bucket, objectID string) (io.ReadCloser, string, string, error) {
	if s.storage == nil {
		return nil, "", "", fmt.Errorf("storage not initialized")
	}
	
	// Get object from database to get the actual key and metadata
	var obj pkgstorage.StorageObject
	if err := s.db.Where("id = ? AND bucket_name = ?", objectID, bucket).First(&obj).Error; err != nil {
		// Try with objectID as the key for backward compatibility
		if err := s.db.Where("object_key = ? AND bucket_name = ?", objectID, bucket).First(&obj).Error; err != nil {
			return nil, "", "", fmt.Errorf("object not found")
		}
	}
	
	// Get the object from storage
	reader, err := s.storage.GetObject(bucket, obj.ObjectKey)
	if err != nil {
		return nil, "", "", err
	}
	
	// Extract filename from path
	filename := obj.ObjectKey
	if idx := strings.LastIndex(filename, "/"); idx >= 0 {
		filename = filename[idx+1:]
	}
	
	return reader, filename, obj.ContentType, nil
}

// GeneratePresignedURL generates a presigned URL for direct downloads
func (s *StorageService) GeneratePresignedURL(bucket, objectKey string, expiry time.Duration) (string, error) {
	// For now, return empty string to indicate presigned URLs are not supported
	// This will cause the system to fall back to token-based downloads
	// In future, we can implement presigned URLs for S3 here
	return "", fmt.Errorf("presigned URLs not supported by current storage provider")
}


func (s *StorageService) CreateFolder(bucket, folderName string) error {
	if s.storage == nil {
		return fmt.Errorf("storage not initialized")
	}
	
	// Clean up the folder name
	folderName = strings.TrimSuffix(folderName, "/")
	if folderName == "" {
		return fmt.Errorf("folder name cannot be empty")
	}
	
	log.Printf("CreateFolder: Creating folder '%s' in bucket '%s'", folderName, bucket)
	
	// Check if folder already exists
	var existingFolder pkgstorage.StorageObject
	folderKey := folderName + "/"
	if err := s.db.Where("bucket_name = ? AND object_key = ?", bucket, folderKey).First(&existingFolder).Error; err == nil {
		log.Printf("CreateFolder: Folder already exists: %s", folderKey)
		return fmt.Errorf("folder already exists: %s", folderName)
	}
	
	// Find parent folder ID if this is a nested folder
	var parentFolderID *string
	if idx := strings.LastIndex(folderName, "/"); idx > 0 {
		parentPath := folderName[:idx] + "/"
		var parentFolder pkgstorage.StorageObject
		if err := s.db.Where("bucket_name = ? AND object_key = ? AND content_type = ?", 
			bucket, parentPath, "application/x-directory").First(&parentFolder).Error; err == nil {
			parentFolderID = &parentFolder.ID
			log.Printf("CreateFolder: Found parent folder with ID: %s", parentFolder.ID)
		} else {
			log.Printf("CreateFolder: Parent folder not found for path: %s", parentPath)
		}
	}
	
	// In object storage, create a placeholder object to represent the folder
	// This ensures the folder appears even when empty
	keepFilePath := folderName + "/.keep"
	
	// Create a placeholder file
	content := []byte("")
	err := s.storage.PutObject(bucket, keepFilePath, bytes.NewReader(content), 0, "application/x-directory")
	if err != nil {
		log.Printf("CreateFolder: Failed to create .keep file: %v", err)
		return fmt.Errorf("failed to create folder structure: %v", err)
	}
	
	// Save folder to database
	storageObj := &pkgstorage.StorageObject{
		ID:             uuid.New().String(),
		BucketName:     bucket,
		ObjectKey:      folderKey, // Use folderKey which has the trailing slash
		ParentFolderID: parentFolderID,
		Size:           0,
		ContentType:    "application/x-directory",
		Checksum:       "", // No checksum for folders
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	
	if err := s.db.Create(storageObj).Error; err != nil {
		// Try to rollback
		s.storage.DeleteObject(bucket, keepFilePath)
		log.Printf("CreateFolder: Failed to save folder to database: %v", err)
		return fmt.Errorf("failed to save folder: %v", err)
	}
	
	log.Printf("CreateFolder: Created folder %s in bucket %s", folderName, bucket)
	return nil
}

func (s *StorageService) DeleteObject(bucket, objectID string) error {
	if s.storage == nil {
		return fmt.Errorf("storage not initialized")
	}
	
	// Get object from database to get the actual key
	var obj pkgstorage.StorageObject
	if err := s.db.Where("id = ? AND bucket_name = ?", objectID, bucket).First(&obj).Error; err != nil {
		// Try with objectID as the key for backward compatibility
		if err := s.storage.DeleteObject(bucket, objectID); err != nil {
			return err
		}
		// Delete from database using objectID as key
		return s.db.Where("object_key = ? AND bucket_name = ?", objectID, bucket).Delete(&pkgstorage.StorageObject{}).Error
	}
	
	// Delete from storage provider
	if err := s.storage.DeleteObject(bucket, obj.ObjectKey); err != nil {
		return err
	}
	
	// Delete from database
	if err := s.db.Delete(&obj).Error; err != nil {
		return err
	}
	
	return nil
}

func (s *StorageService) GetTotalStorageUsed() (int64, error) {
	var totalSize int64
	
	// Get total storage used from database
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Select("COALESCE(SUM(size), 0)").
		Scan(&totalSize).Error; err != nil {
		return 0, err
	}
	
	return totalSize, nil
}

// GetUserStorageUsed returns the total storage used by a specific user
func (s *StorageService) GetUserStorageUsed(userID string) (int64, error) {
	var totalSize int64
	
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Select("COALESCE(SUM(size), 0)").
		Where("user_id = ?", userID).
		Scan(&totalSize).Error; err != nil {
		return 0, err
	}
	
	return totalSize, nil
}

// GetStorageStats returns comprehensive storage statistics
func (s *StorageService) GetStorageStats(userID string) (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Get total file count for user
	var fileCount int64
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Where("user_id = ? AND NOT is_folder", userID).
		Count(&fileCount).Error; err != nil {
		return nil, err
	}
	stats["file_count"] = fileCount
	
	// Get total folder count for user
	var folderCount int64
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Where("user_id = ? AND is_folder", userID).
		Count(&folderCount).Error; err != nil {
		return nil, err
	}
	stats["folder_count"] = folderCount
	
	// Get total storage used
	totalSize, err := s.GetUserStorageUsed(userID)
	if err != nil {
		return nil, err
	}
	stats["total_size"] = totalSize
	
	// Get shared files count (if public column exists)
	var sharedCount int64
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Where("user_id = ? AND public = ?", userID, true).
		Count(&sharedCount).Error; err != nil {
		// Ignore error if public column doesn't exist
		sharedCount = 0
	}
	stats["shared_count"] = sharedCount
	
	// Get recent uploads (last 7 days)
	var recentCount int64
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Where("user_id = ? AND created_at >= ?", userID, sevenDaysAgo).
		Count(&recentCount).Error; err != nil {
		recentCount = 0
	}
	stats["recent_uploads"] = recentCount
	
	return stats, nil
}

// GetAllUsersStorageStats returns storage statistics for all users (admin use)
func (s *StorageService) GetAllUsersStorageStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Get total storage used across all users
	totalSize, err := s.GetTotalStorageUsed()
	if err != nil {
		return nil, err
	}
	stats["total_storage_used"] = totalSize
	
	// Get total file count
	var totalFiles int64
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Where("NOT is_folder").
		Count(&totalFiles).Error; err != nil {
		return nil, err
	}
	stats["total_files"] = totalFiles
	
	// Get total folder count
	var totalFolders int64
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Where("is_folder").
		Count(&totalFolders).Error; err != nil {
		return nil, err
	}
	stats["total_folders"] = totalFolders
	
	// Get number of users with files
	var activeUsers int64
	if err := s.db.Model(&pkgstorage.StorageObject{}).
		Select("COUNT(DISTINCT user_id)").
		Scan(&activeUsers).Error; err != nil {
		return nil, err
	}
	stats["active_users"] = activeUsers
	
	return stats, nil
}

func (s *StorageService) GetPublicURL(bucket, key string) string {
	if s.storage == nil {
		return ""
	}
	return s.storage.GetPublicURL(bucket, key)
}

// RenameObject renames an object in storage
func (s *StorageService) RenameObject(bucket, objectID, newName string) error {
	// First get the object from database
	var object pkgstorage.StorageObject
	if err := s.db.Where("id = ? AND bucket_name = ?", objectID, bucket).First(&object).Error; err != nil {
		return fmt.Errorf("object not found: %v", err)
	}
	
	// Extract the path from the current object key
	oldKey := object.ObjectKey
	lastSlash := -1
	for i := len(oldKey) - 1; i >= 0; i-- {
		if oldKey[i] == '/' {
			lastSlash = i
			break
		}
	}
	
	// Build new key with same path but new name
	var newKey string
	if lastSlash >= 0 {
		newKey = oldKey[:lastSlash+1] + newName
	} else {
		newKey = newName
	}
	
	// Check if new name already exists
	var existingCount int64
	s.db.Model(&pkgstorage.StorageObject{}).
		Where("bucket_name = ? AND object_key = ?", bucket, newKey).
		Count(&existingCount)
	
	if existingCount > 0 {
		return fmt.Errorf("an object with name '%s' already exists", newName)
	}
	
	// If it's a file, rename in storage backend
	if object.ContentType != "application/x-directory" {
		// Copy to new location
		reader, err := s.storage.GetObject(bucket, oldKey)
		if err != nil {
			return fmt.Errorf("failed to get object: %v", err)
		}
		defer reader.Close()
		
		// Read the content
		content, err := io.ReadAll(reader)
		if err != nil {
			return fmt.Errorf("failed to read object: %v", err)
		}
		
		// Upload with new name
		if err := s.storage.PutObject(bucket, newKey, bytes.NewReader(content), int64(len(content)), object.ContentType); err != nil {
			return fmt.Errorf("failed to put renamed object: %v", err)
		}
		
		// Delete old object from storage
		if err := s.storage.DeleteObject(bucket, oldKey); err != nil {
			// Try to clean up the new object
			s.storage.DeleteObject(bucket, newKey)
			return fmt.Errorf("failed to delete old object: %v", err)
		}
	}
	
	// Update database record
	object.ObjectKey = newKey
	if err := s.db.Save(&object).Error; err != nil {
		// If database update fails and it's a file, try to revert storage changes
		if object.ContentType != "application/x-directory" {
			// Try to restore original
			reader, _ := s.storage.GetObject(bucket, newKey)
			if reader != nil {
				defer reader.Close()
				content, _ := io.ReadAll(reader)
				s.storage.PutObject(bucket, oldKey, bytes.NewReader(content), int64(len(content)), object.ContentType)
				s.storage.DeleteObject(bucket, newKey)
			}
		}
		return fmt.Errorf("failed to update database: %v", err)
	}
	
	// If it's a folder, update all child objects' paths
	if object.ContentType == "application/x-directory" {
		var childObjects []pkgstorage.StorageObject
		s.db.Where("bucket_name = ? AND object_key LIKE ?", bucket, oldKey + "/%").Find(&childObjects)
		
		for _, child := range childObjects {
			// Replace the old folder path with new one
			newChildKey := newKey + child.ObjectKey[len(oldKey):]
			child.ObjectKey = newChildKey
			s.db.Save(&child)
		}
	}
	
	return nil
}

// Helper functions
func formatBytes(bytes int64) string {
	if bytes == 0 {
		return "0 B"
	}
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

func getFileType(filename string) string {
	// Get file extension
	ext := ""
	for i := len(filename) - 1; i >= 0; i-- {
		if filename[i] == '.' {
			ext = filename[i+1:]
			break
		}
	}
	
	switch ext {
	case "jpg", "jpeg", "png", "gif", "webp", "svg":
		return "image"
	case "pdf":
		return "pdf"
	case "mp4", "avi", "mov", "webm":
		return "video"
	case "mp3", "wav", "ogg", "m4a":
		return "audio"
	case "zip", "tar", "gz", "rar", "7z":
		return "archive"
	case "json", "js", "ts", "go", "py", "html", "css":
		return "code"
	default:
		return "file"
	}
}