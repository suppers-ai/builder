package services

import (
	"github.com/suppers-ai/dufflebagbase/config"
)

// EnhancedStorageService is an alias for StorageService
type EnhancedStorageService = StorageService

type StorageService struct {
	config config.StorageConfig
}

func NewStorageService(cfg config.StorageConfig) *StorageService {
	return &StorageService{config: cfg}
}

func (s *StorageService) GetBuckets() ([]interface{}, error) {
	// Mock implementation
	return []interface{}{
		map[string]interface{}{
			"id":            "1",
			"name":          "public",
			"public":        true,
			"created_at":    "2024-01-01T00:00:00Z",
			"objects_count": 10,
			"total_size":    1024000,
		},
		map[string]interface{}{
			"id":            "2",
			"name":          "private",
			"public":        false,
			"created_at":    "2024-01-01T00:00:00Z",
			"objects_count": 5,
			"total_size":    512000,
		},
	}, nil
}

func (s *StorageService) GetBucketObjects(bucket string) ([]interface{}, error) {
	// Mock implementation
	return []interface{}{}, nil
}

func (s *StorageService) UploadFile(bucket, filename string, content []byte, mimeType string) (interface{}, error) {
	// Mock implementation
	return map[string]interface{}{
		"id":         "file-1",
		"name":       filename,
		"bucket":     bucket,
		"size":       len(content),
		"mime_type":  mimeType,
		"created_at": "2024-01-01T00:00:00Z",
	}, nil
}

func (s *StorageService) DeleteObject(bucket, objectID string) error {
	// Mock implementation
	return nil
}

func (s *StorageService) GetTotalStorageUsed() (int64, error) {
	// Mock implementation
	return 1536000, nil // 1.5MB
}