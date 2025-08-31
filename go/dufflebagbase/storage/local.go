package storage

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// LocalProvider implements storage using the local filesystem
type LocalProvider struct {
	basePath string
}

// NewLocalProvider creates a new local storage provider
func NewLocalProvider(basePath string) (*LocalProvider, error) {
	// Create base directory if it doesn't exist
	if basePath == "" {
		basePath = "./storage"
	}
	
	absPath, err := filepath.Abs(basePath)
	if err != nil {
		return nil, err
	}
	
	if err := os.MkdirAll(absPath, 0755); err != nil {
		return nil, err
	}
	
	return &LocalProvider{basePath: absPath}, nil
}

// CreateBucket creates a new bucket (directory)
func (l *LocalProvider) CreateBucket(name string, public bool) error {
	bucketPath := filepath.Join(l.basePath, name)
	
	// Check if bucket already exists
	if _, err := os.Stat(bucketPath); err == nil {
		return fmt.Errorf("bucket %s already exists", name)
	}
	
	// Create bucket directory
	if err := os.MkdirAll(bucketPath, 0755); err != nil {
		return err
	}
	
	// Store bucket metadata
	metaPath := filepath.Join(bucketPath, ".bucket_meta")
	meta := fmt.Sprintf("created_at=%s\npublic=%v\n", time.Now().Format(time.RFC3339), public)
	return ioutil.WriteFile(metaPath, []byte(meta), 0644)
}

// DeleteBucket deletes a bucket
func (l *LocalProvider) DeleteBucket(name string) error {
	bucketPath := filepath.Join(l.basePath, name)
	
	// Check if bucket exists
	if _, err := os.Stat(bucketPath); os.IsNotExist(err) {
		return fmt.Errorf("bucket %s does not exist", name)
	}
	
	// Check if bucket is empty
	entries, err := ioutil.ReadDir(bucketPath)
	if err != nil {
		return err
	}
	
	// Count non-metadata files
	fileCount := 0
	for _, entry := range entries {
		if !strings.HasPrefix(entry.Name(), ".") {
			fileCount++
		}
	}
	
	if fileCount > 0 {
		return fmt.Errorf("bucket %s is not empty", name)
	}
	
	return os.RemoveAll(bucketPath)
}

// ListBuckets lists all buckets
func (l *LocalProvider) ListBuckets() ([]Bucket, error) {
	entries, err := ioutil.ReadDir(l.basePath)
	if err != nil {
		return nil, err
	}
	
	var buckets []Bucket
	for _, entry := range entries {
		if entry.IsDir() {
			bucket := Bucket{
				Name:      entry.Name(),
				CreatedAt: entry.ModTime(),
			}
			
			// Read bucket metadata
			metaPath := filepath.Join(l.basePath, entry.Name(), ".bucket_meta")
			if data, err := ioutil.ReadFile(metaPath); err == nil {
				if strings.Contains(string(data), "public=true") {
					bucket.Public = true
				}
			}
			
			// Count objects and calculate size
			bucketPath := filepath.Join(l.basePath, entry.Name())
			var totalSize int64
			var objectCount int64
			
			filepath.Walk(bucketPath, func(path string, info os.FileInfo, err error) error {
				if err == nil && !info.IsDir() && !strings.HasPrefix(info.Name(), ".") {
					totalSize += info.Size()
					objectCount++
				}
				return nil
			})
			
			bucket.TotalSize = totalSize
			bucket.ObjectCount = objectCount
			buckets = append(buckets, bucket)
		}
	}
	
	return buckets, nil
}

// BucketExists checks if a bucket exists
func (l *LocalProvider) BucketExists(name string) (bool, error) {
	bucketPath := filepath.Join(l.basePath, name)
	_, err := os.Stat(bucketPath)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

// PutObject stores an object
func (l *LocalProvider) PutObject(bucket, key string, reader io.Reader, size int64, contentType string) error {
	// Ensure bucket exists
	if exists, _ := l.BucketExists(bucket); !exists {
		return fmt.Errorf("bucket %s does not exist", bucket)
	}
	
	objectPath := filepath.Join(l.basePath, bucket, key)
	
	// Create directory structure if needed
	dir := filepath.Dir(objectPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	
	// Create file
	file, err := os.Create(objectPath)
	if err != nil {
		return err
	}
	defer file.Close()
	
	// Copy data
	_, err = io.Copy(file, reader)
	if err != nil {
		return err
	}
	
	// Store metadata
	metaPath := objectPath + ".meta"
	meta := fmt.Sprintf("content_type=%s\nsize=%d\n", contentType, size)
	return ioutil.WriteFile(metaPath, []byte(meta), 0644)
}

// GetObject retrieves an object
func (l *LocalProvider) GetObject(bucket, key string) (io.ReadCloser, error) {
	objectPath := filepath.Join(l.basePath, bucket, key)
	return os.Open(objectPath)
}

// DeleteObject deletes an object
func (l *LocalProvider) DeleteObject(bucket, key string) error {
	objectPath := filepath.Join(l.basePath, bucket, key)
	metaPath := objectPath + ".meta"
	
	// Delete object
	if err := os.Remove(objectPath); err != nil {
		return err
	}
	
	// Delete metadata
	os.Remove(metaPath) // Ignore error if metadata doesn't exist
	return nil
}

// ListObjects lists objects in a bucket
func (l *LocalProvider) ListObjects(bucket, prefix string) ([]Object, error) {
	bucketPath := filepath.Join(l.basePath, bucket)
	
	// Check if bucket exists
	if _, err := os.Stat(bucketPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("bucket %s does not exist", bucket)
	}
	
	var objects []Object
	
	err := filepath.Walk(bucketPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // Skip errors
		}
		
		// Skip hidden files and metadata
		if strings.Contains(path, "/.") || strings.HasSuffix(path, ".meta") {
			return nil
		}
		
		// Get relative path from bucket
		relPath, _ := filepath.Rel(bucketPath, path)
		
		// Check if it matches prefix
		if prefix != "" && !strings.HasPrefix(relPath, prefix) {
			return nil
		}
		
		// Skip the bucket directory itself
		if path == bucketPath {
			return nil
		}
		
		// Read metadata if available
		contentType := "application/octet-stream"
		metaPath := path + ".meta"
		if data, err := ioutil.ReadFile(metaPath); err == nil {
			lines := strings.Split(string(data), "\n")
			for _, line := range lines {
				if strings.HasPrefix(line, "content_type=") {
					contentType = strings.TrimPrefix(line, "content_type=")
					break
				}
			}
		}
		
		// Calculate ETag (MD5 for files)
		etag := ""
		if !info.IsDir() {
			if data, err := ioutil.ReadFile(path); err == nil {
				hash := md5.Sum(data)
				etag = hex.EncodeToString(hash[:])
			}
		}
		
		objects = append(objects, Object{
			Key:          relPath,
			Size:         info.Size(),
			ContentType:  contentType,
			LastModified: info.ModTime(),
			ETag:         etag,
			IsDirectory:  info.IsDir(),
		})
		
		return nil
	})
	
	return objects, err
}

// ObjectExists checks if an object exists
func (l *LocalProvider) ObjectExists(bucket, key string) (bool, error) {
	objectPath := filepath.Join(l.basePath, bucket, key)
	_, err := os.Stat(objectPath)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

// GetObjectInfo gets object metadata
func (l *LocalProvider) GetObjectInfo(bucket, key string) (*Object, error) {
	objectPath := filepath.Join(l.basePath, bucket, key)
	
	info, err := os.Stat(objectPath)
	if err != nil {
		return nil, err
	}
	
	// Read metadata
	contentType := "application/octet-stream"
	metaPath := objectPath + ".meta"
	if data, err := ioutil.ReadFile(metaPath); err == nil {
		lines := strings.Split(string(data), "\n")
		for _, line := range lines {
			if strings.HasPrefix(line, "content_type=") {
				contentType = strings.TrimPrefix(line, "content_type=")
				break
			}
		}
	}
	
	// Calculate ETag
	etag := ""
	if !info.IsDir() {
		if data, err := ioutil.ReadFile(objectPath); err == nil {
			hash := md5.Sum(data)
			etag = hex.EncodeToString(hash[:])
		}
	}
	
	return &Object{
		Key:          key,
		Size:         info.Size(),
		ContentType:  contentType,
		LastModified: info.ModTime(),
		ETag:         etag,
		IsDirectory:  info.IsDir(),
	}, nil
}

// GetPublicURL gets a public URL for an object
func (l *LocalProvider) GetPublicURL(bucket, key string) string {
	// For local storage, return a path that can be served by the web server
	return fmt.Sprintf("/storage/%s/%s", bucket, key)
}

// GetSignedURL gets a signed URL for an object
func (l *LocalProvider) GetSignedURL(bucket, key string, expiry time.Duration) (string, error) {
	// For local storage, just return the public URL
	// In production, you might want to implement actual signed URLs
	return l.GetPublicURL(bucket, key), nil
}