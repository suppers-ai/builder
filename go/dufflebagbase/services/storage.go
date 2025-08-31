package services

import (
	"bytes"
	"fmt"
	"io"
	"log"

	"github.com/suppers-ai/dufflebagbase/config"
	"github.com/suppers-ai/dufflebagbase/storage"
)

// EnhancedStorageService is an alias for StorageService
type EnhancedStorageService = StorageService

type StorageService struct {
	config   config.StorageConfig
	provider storage.Provider
	storage  *storage.Storage
}

func NewStorageService(cfg config.StorageConfig) *StorageService {
	var provider storage.Provider
	var err error
	
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
			provider, _ = storage.NewLocalProvider(cfg.LocalStoragePath)
		}
	default:
		provider, err = storage.NewLocalProvider(cfg.LocalStoragePath)
		if err != nil {
			log.Printf("Failed to initialize local storage: %v", err)
		}
	}
	
	return &StorageService{
		config:   cfg,
		provider: provider,
		storage:  storage.New(provider),
	}
}

func (s *StorageService) CreateBucket(name string, public bool) error {
	if s.storage == nil {
		return fmt.Errorf("storage not initialized")
	}
	return s.storage.CreateBucket(name, public)
}

func (s *StorageService) DeleteBucket(name string) error {
	if s.storage == nil {
		return fmt.Errorf("storage not initialized")
	}
	return s.storage.DeleteBucket(name)
}

func (s *StorageService) GetBuckets() ([]interface{}, error) {
	if s.storage == nil {
		return []interface{}{}, nil
	}
	
	buckets, err := s.storage.ListBuckets()
	if err != nil {
		return nil, err
	}
	
	// Convert to interface slice
	result := make([]interface{}, len(buckets))
	for i, bucket := range buckets {
		result[i] = map[string]interface{}{
			"id":         bucket.Name,
			"name":       bucket.Name,
			"public":     bucket.Public,
			"created_at": bucket.CreatedAt.Format("2006-01-02"),
			"files":      bucket.ObjectCount,
			"size":       formatBytes(bucket.TotalSize),
			"size_bytes": bucket.TotalSize,
		}
	}
	
	return result, nil
}

func (s *StorageService) GetBucketObjects(bucket string) ([]interface{}, error) {
	if s.storage == nil {
		return []interface{}{}, nil
	}
	
	objects, err := s.storage.ListObjects(bucket, "")
	if err != nil {
		return nil, err
	}
	
	// Convert to interface slice
	result := make([]interface{}, len(objects))
	for i, obj := range objects {
		objType := "file"
		if obj.IsDirectory {
			objType = "folder"
		} else {
			// Determine file type by extension
			objType = getFileType(obj.Key)
		}
		
		result[i] = map[string]interface{}{
			"id":           fmt.Sprintf("%s-%d", obj.Key, i),
			"name":         obj.Key,
			"type":         objType,
			"size":         formatBytes(obj.Size),
			"size_bytes":   obj.Size,
			"modified":     obj.LastModified.Format("2006-01-02 15:04"),
			"content_type": obj.ContentType,
			"etag":         obj.ETag,
			"public":       false, // You might want to determine this based on bucket settings
		}
	}
	
	return result, nil
}

func (s *StorageService) UploadFile(bucket, filename string, reader io.Reader, size int64, mimeType string) (interface{}, error) {
	if s.storage == nil {
		return nil, fmt.Errorf("storage not initialized")
	}
	
	err := s.storage.PutObject(bucket, filename, reader, size, mimeType)
	if err != nil {
		return nil, err
	}
	
	// Get object info
	obj, err := s.storage.GetObjectInfo(bucket, filename)
	if err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"key":          obj.Key,
		"size":         obj.Size,
		"content_type": obj.ContentType,
		"url":          s.storage.GetPublicURL(bucket, filename),
	}, nil
}

func (s *StorageService) UploadFileBytes(bucket, filename string, content []byte, mimeType string) (interface{}, error) {
	reader := bytes.NewReader(content)
	return s.UploadFile(bucket, filename, reader, int64(len(content)), mimeType)
}

func (s *StorageService) DeleteObject(bucket, objectID string) error {
	if s.storage == nil {
		return fmt.Errorf("storage not initialized")
	}
	return s.storage.DeleteObject(bucket, objectID)
}

func (s *StorageService) GetTotalStorageUsed() (int64, error) {
	if s.storage == nil {
		return 0, nil
	}
	
	buckets, err := s.storage.ListBuckets()
	if err != nil {
		return 0, err
	}
	
	var total int64
	for _, bucket := range buckets {
		total += bucket.TotalSize
	}
	
	return total, nil
}

func (s *StorageService) GetObject(bucket, key string) (io.ReadCloser, error) {
	if s.storage == nil {
		return nil, fmt.Errorf("storage not initialized")
	}
	return s.storage.GetObject(bucket, key)
}

func (s *StorageService) GetObjectInfo(bucket, key string) (*storage.Object, error) {
	if s.storage == nil {
		return nil, fmt.Errorf("storage not initialized")
	}
	return s.storage.GetObjectInfo(bucket, key)
}

func (s *StorageService) GetPublicURL(bucket, key string) string {
	if s.storage == nil {
		return ""
	}
	return s.storage.GetPublicURL(bucket, key)
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