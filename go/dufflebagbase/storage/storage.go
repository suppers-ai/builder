package storage

import (
	"io"
	"time"
)

// Object represents a stored object
type Object struct {
	Key          string    `json:"key"`
	Size         int64     `json:"size"`
	ContentType  string    `json:"content_type"`
	LastModified time.Time `json:"last_modified"`
	ETag         string    `json:"etag,omitempty"`
	IsDirectory  bool      `json:"is_directory"`
}

// Bucket represents a storage bucket
type Bucket struct {
	Name         string    `json:"name"`
	CreatedAt    time.Time `json:"created_at"`
	Public       bool      `json:"public"`
	ObjectCount  int64     `json:"object_count"`
	TotalSize    int64     `json:"total_size"`
}

// Provider defines the storage provider interface
type Provider interface {
	// Bucket operations
	CreateBucket(name string, public bool) error
	DeleteBucket(name string) error
	ListBuckets() ([]Bucket, error)
	BucketExists(name string) (bool, error)
	
	// Object operations
	PutObject(bucket, key string, reader io.Reader, size int64, contentType string) error
	GetObject(bucket, key string) (io.ReadCloser, error)
	DeleteObject(bucket, key string) error
	ListObjects(bucket, prefix string) ([]Object, error)
	ObjectExists(bucket, key string) (bool, error)
	GetObjectInfo(bucket, key string) (*Object, error)
	
	// URL generation
	GetPublicURL(bucket, key string) string
	GetSignedURL(bucket, key string, expiry time.Duration) (string, error)
}

// Storage wraps a storage provider
type Storage struct {
	provider Provider
}

// New creates a new storage instance
func New(provider Provider) *Storage {
	return &Storage{provider: provider}
}

// CreateBucket creates a new bucket
func (s *Storage) CreateBucket(name string, public bool) error {
	return s.provider.CreateBucket(name, public)
}

// DeleteBucket deletes a bucket
func (s *Storage) DeleteBucket(name string) error {
	return s.provider.DeleteBucket(name)
}

// ListBuckets lists all buckets
func (s *Storage) ListBuckets() ([]Bucket, error) {
	return s.provider.ListBuckets()
}

// BucketExists checks if a bucket exists
func (s *Storage) BucketExists(name string) (bool, error) {
	return s.provider.BucketExists(name)
}

// PutObject stores an object
func (s *Storage) PutObject(bucket, key string, reader io.Reader, size int64, contentType string) error {
	return s.provider.PutObject(bucket, key, reader, size, contentType)
}

// GetObject retrieves an object
func (s *Storage) GetObject(bucket, key string) (io.ReadCloser, error) {
	return s.provider.GetObject(bucket, key)
}

// DeleteObject deletes an object
func (s *Storage) DeleteObject(bucket, key string) error {
	return s.provider.DeleteObject(bucket, key)
}

// ListObjects lists objects in a bucket
func (s *Storage) ListObjects(bucket, prefix string) ([]Object, error) {
	return s.provider.ListObjects(bucket, prefix)
}

// ObjectExists checks if an object exists
func (s *Storage) ObjectExists(bucket, key string) (bool, error) {
	return s.provider.ObjectExists(bucket, key)
}

// GetObjectInfo gets object metadata
func (s *Storage) GetObjectInfo(bucket, key string) (*Object, error) {
	return s.provider.GetObjectInfo(bucket, key)
}

// GetPublicURL gets a public URL for an object
func (s *Storage) GetPublicURL(bucket, key string) string {
	return s.provider.GetPublicURL(bucket, key)
}

// GetSignedURL gets a signed URL for an object
func (s *Storage) GetSignedURL(bucket, key string, expiry time.Duration) (string, error) {
	return s.provider.GetSignedURL(bucket, key, expiry)
}