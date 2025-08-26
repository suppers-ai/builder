package storage

import (
	storage "github.com/suppers-ai/storage"
	_ "github.com/suppers-ai/storage/providers" // Register S3 provider
)

// S3Config contains configuration for S3 storage
type S3Config struct {
	Region          string
	Bucket          string
	Endpoint        string // Optional: for S3-compatible services
	AccessKeyID     string
	SecretAccessKey string
	UsePathStyle    bool // For S3-compatible services like MinIO
}

// NewS3FileStorage creates a new S3 file storage instance
func NewS3FileStorage(cfg *S3Config) (storage.Storage, error) {
	storageConfig := &storage.Config{
		Provider:        storage.ProviderS3,
		Region:          cfg.Region,
		Bucket:          cfg.Bucket,
		AccessKeyID:     cfg.AccessKeyID,
		SecretAccessKey: cfg.SecretAccessKey,
		Endpoint:        cfg.Endpoint,
		UsePathStyle:    cfg.UsePathStyle,
	}

	return storage.New(storageConfig)
}