package services

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/suppers-ai/database"
	"github.com/suppers-ai/logger"
)

// StorageService handles storage operations
type StorageService struct {
	db     database.Database
	logger logger.Logger
}

// BucketInfo provides information about a storage bucket
type BucketInfo struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Public     bool      `json:"public"`
	FileCount  int       `json:"file_count"`
	TotalSize  int64     `json:"total_size"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// FileInfo provides information about a stored file
type FileInfo struct {
	ID           string    `json:"id"`
	BucketID     string    `json:"bucket_id"`
	Name         string    `json:"name"`
	Path         string    `json:"path"`
	Size         int64     `json:"size"`
	ContentType  string    `json:"content_type"`
	PublicURL    string    `json:"public_url"`
	LastModified time.Time `json:"last_modified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ListBuckets returns all storage buckets
func (s *StorageService) ListBuckets(ctx context.Context) ([]BucketInfo, error) {
	query := `
		SELECT 
			b.id, b.name, b.public, b.created_at, b.updated_at,
			COUNT(o.id) as file_count,
			COALESCE(SUM(o.size), 0) as total_size
		FROM storage.buckets b
		LEFT JOIN storage.objects o ON b.id = o.bucket_id
		GROUP BY b.id, b.name, b.public, b.created_at, b.updated_at
		ORDER BY b.name
	`
	
	rows, err := s.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list buckets: %w", err)
	}
	defer rows.Close()
	
	var buckets []BucketInfo
	for rows.Next() {
		var b BucketInfo
		err := rows.Scan(
			&b.ID, &b.Name, &b.Public, &b.CreatedAt, &b.UpdatedAt,
			&b.FileCount, &b.TotalSize,
		)
		if err != nil {
			return nil, err
		}
		buckets = append(buckets, b)
	}
	
	return buckets, nil
}

// ListFiles returns files in a bucket
func (s *StorageService) ListFiles(ctx context.Context, bucketName string, prefix string, offset, limit int) ([]FileInfo, int, error) {
	// First get bucket ID
	var bucketID string
	err := s.db.Get(ctx, &bucketID, `
		SELECT id FROM storage.buckets WHERE name = $1
	`, bucketName)
	if err != nil {
		return nil, 0, fmt.Errorf("bucket not found: %w", err)
	}
	
	// Count total files
	var total int
	countQuery := `
		SELECT COUNT(*) 
		FROM storage.objects 
		WHERE bucket_id = $1
	`
	args := []interface{}{bucketID}
	
	if prefix != "" {
		countQuery += " AND path LIKE $2"
		args = append(args, prefix+"%")
	}
	
	err = s.db.Get(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count files: %w", err)
	}
	
	// Get files
	query := `
		SELECT 
			id, bucket_id, name, path, size, 
			mime_type as content_type, 
			created_at, updated_at
		FROM storage.objects
		WHERE bucket_id = $1
	`
	
	queryArgs := []interface{}{bucketID}
	argIndex := 2
	
	if prefix != "" {
		query += fmt.Sprintf(" AND path LIKE $%d", argIndex)
		queryArgs = append(queryArgs, prefix+"%")
		argIndex++
	}
	
	query += fmt.Sprintf(" ORDER BY path, name LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	queryArgs = append(queryArgs, limit, offset)
	
	rows, err := s.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list files: %w", err)
	}
	defer rows.Close()
	
	var files []FileInfo
	for rows.Next() {
		var f FileInfo
		err := rows.Scan(
			&f.ID, &f.BucketID, &f.Name, &f.Path, &f.Size,
			&f.ContentType, &f.CreatedAt, &f.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		
		// Set last modified and public URL
		f.LastModified = f.UpdatedAt
		f.PublicURL = fmt.Sprintf("/storage/%s/%s%s", bucketName, f.Path, f.Name)
		
		files = append(files, f)
	}
	
	return files, total, nil
}

// CreateBucket creates a new storage bucket
func (s *StorageService) CreateBucket(ctx context.Context, name string, public bool) error {
	query := `
		INSERT INTO storage.buckets (name, public)
		VALUES ($1, $2)
	`
	
	_, err := s.db.Exec(ctx, query, name, public)
	if err != nil {
		return fmt.Errorf("failed to create bucket: %w", err)
	}
	
	s.logger.Info(ctx, "Bucket created", logger.String("name", name))
	return nil
}

// DeleteBucket deletes a storage bucket
func (s *StorageService) DeleteBucket(ctx context.Context, name string) error {
	query := `
		DELETE FROM storage.buckets WHERE name = $1
	`
	
	_, err := s.db.Exec(ctx, query, name)
	if err != nil {
		return fmt.Errorf("failed to delete bucket: %w", err)
	}
	
	s.logger.Info(ctx, "Bucket deleted", logger.String("name", name))
	return nil
}

// UploadFile uploads a file to storage
func (s *StorageService) UploadFile(ctx context.Context, bucketName, path, name string, content io.Reader, contentType string, size int64) error {
	// First get bucket ID
	var bucketID string
	err := s.db.Get(ctx, &bucketID, `
		SELECT id FROM storage.buckets WHERE name = $1
	`, bucketName)
	if err != nil {
		return fmt.Errorf("bucket not found: %w", err)
	}
	
	// TODO: Store actual file content in S3 or filesystem
	// For now, just store metadata
	
	query := `
		INSERT INTO storage.objects (bucket_id, name, path, size, mime_type)
		VALUES ($1, $2, $3, $4, $5)
	`
	
	_, err = s.db.Exec(ctx, query, bucketID, name, path, size, contentType)
	if err != nil {
		return fmt.Errorf("failed to upload file: %w", err)
	}
	
	s.logger.Info(ctx, "File uploaded", 
		logger.String("bucket", bucketName),
		logger.String("path", path),
		logger.String("name", name))
	
	return nil
}

// DeleteFile deletes a file from storage
func (s *StorageService) DeleteFile(ctx context.Context, bucketName, path string) error {
	// First get bucket ID
	var bucketID string
	err := s.db.Get(ctx, &bucketID, `
		SELECT id FROM storage.buckets WHERE name = $1
	`, bucketName)
	if err != nil {
		return fmt.Errorf("bucket not found: %w", err)
	}
	
	query := `
		DELETE FROM storage.objects 
		WHERE bucket_id = $1 AND path = $2
	`
	
	_, err = s.db.Exec(ctx, query, bucketID, path)
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	
	s.logger.Info(ctx, "File deleted", 
		logger.String("bucket", bucketName),
		logger.String("path", path))
	
	return nil
}