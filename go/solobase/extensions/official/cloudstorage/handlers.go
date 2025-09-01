package cloudstorage

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	pkgstorage "github.com/suppers-ai/storage"
)

// handleBuckets manages bucket operations
func (e *CloudStorageExtension) handleBuckets(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	switch r.Method {
	case http.MethodGet:
		// List all buckets
		buckets, err := e.manager.ListBuckets(ctx)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(buckets)
		
	case http.MethodPost:
		// Create a new bucket
		var req struct {
			Name   string `json:"name"`
			Public bool   `json:"public"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		
		if req.Name == "" {
			http.Error(w, "Bucket name is required", http.StatusBadRequest)
			return
		}
		
		// Check if public buckets are allowed
		if req.Public && !e.config.AllowPublicBuckets {
			http.Error(w, "Public buckets are not allowed", http.StatusForbidden)
			return
		}
		
		bucket, err := e.manager.CreateBucket(ctx, req.Name, req.Public)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(bucket)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleBucket manages individual bucket operations
func (e *CloudStorageExtension) handleBucket(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Extract bucket name from URL
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	bucketName := parts[3]
	
	switch r.Method {
	case http.MethodGet:
		// Get bucket details
		bucket, err := e.manager.GetBucket(ctx, bucketName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		
		// Get bucket statistics
		var objectCount int64
		var totalSize int64
		
		e.db.Model(&pkgstorage.StorageObject{}).
			Where("bucket_name = ?", bucketName).
			Count(&objectCount)
		
		e.db.Model(&pkgstorage.StorageObject{}).
			Where("bucket_name = ?", bucketName).
			Select("COALESCE(SUM(size), 0)").
			Scan(&totalSize)
		
		response := map[string]interface{}{
			"id":           bucket.ID,
			"name":         bucket.Name,
			"public":       bucket.Public,
			"created_at":   bucket.CreatedAt,
			"object_count": objectCount,
			"total_size":   totalSize,
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		
	case http.MethodDelete:
		// Delete bucket
		if err := e.manager.DeleteBucket(ctx, bucketName); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.WriteHeader(http.StatusNoContent)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleObjects manages object operations
func (e *CloudStorageExtension) handleObjects(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	switch r.Method {
	case http.MethodGet:
		// List objects in a bucket
		bucketName := r.URL.Query().Get("bucket")
		if bucketName == "" {
			http.Error(w, "Bucket name is required", http.StatusBadRequest)
			return
		}
		
		prefix := r.URL.Query().Get("prefix")
		limitStr := r.URL.Query().Get("limit")
		limit := 100
		if limitStr != "" {
			if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
				limit = l
			}
		}
		
		objects, err := e.manager.ListObjects(ctx, bucketName, prefix, limit)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		// Convert to response format
		response := make([]map[string]interface{}, len(objects))
		for i, obj := range objects {
			response[i] = map[string]interface{}{
				"id":           obj.ID,
				"key":          obj.ObjectKey,
				"size":         obj.Size,
				"content_type": obj.ContentType,
				"checksum":     obj.Checksum,
				"created_at":   obj.CreatedAt,
				"updated_at":   obj.UpdatedAt,
				"is_folder":    obj.IsFolder(),
			}
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleObject manages individual object operations
func (e *CloudStorageExtension) handleObject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Extract object ID from URL
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	objectID := parts[3]
	
	switch r.Method {
	case http.MethodGet:
		// Get object metadata
		var obj pkgstorage.StorageObject
		if err := e.db.Where("id = ?", objectID).First(&obj).Error; err != nil {
			http.Error(w, "Object not found", http.StatusNotFound)
			return
		}
		
		response := map[string]interface{}{
			"id":           obj.ID,
			"bucket":       obj.BucketName,
			"key":          obj.ObjectKey,
			"size":         obj.Size,
			"content_type": obj.ContentType,
			"checksum":     obj.Checksum,
			"created_at":   obj.CreatedAt,
			"updated_at":   obj.UpdatedAt,
			"is_folder":    obj.IsFolder(),
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		
	case http.MethodDelete:
		// Delete object
		var obj pkgstorage.StorageObject
		if err := e.db.Where("id = ?", objectID).First(&obj).Error; err != nil {
			http.Error(w, "Object not found", http.StatusNotFound)
			return
		}
		
		// Extract directory and filename from object key
		parts := strings.Split(obj.ObjectKey, "/")
		var dir, filename string
		if len(parts) > 1 {
			dir = strings.Join(parts[:len(parts)-1], "/")
			filename = parts[len(parts)-1]
		} else {
			dir = ""
			filename = obj.ObjectKey
		}
		
		if err := e.manager.DeleteObject(ctx, obj.BucketName, dir, filename); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.WriteHeader(http.StatusNoContent)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleUpload handles file upload
func (e *CloudStorageExtension) handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	ctx := r.Context()
	
	// Parse multipart form
	if err := r.ParseMultipartForm(e.config.MaxFileSize); err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}
	
	bucketName := r.FormValue("bucket")
	if bucketName == "" {
		bucketName = e.config.DefaultBucket
	}
	
	path := r.FormValue("path")
	
	// Get file from form
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	
	// Check file size
	if header.Size > e.config.MaxFileSize {
		http.Error(w, fmt.Sprintf("File size exceeds maximum of %d bytes", e.config.MaxFileSize), 
			http.StatusRequestEntityTooLarge)
		return
	}
	
	// Read file content
	content, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}
	
	// Detect content type
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = http.DetectContentType(content)
	}
	
	// Get user ID if available (from session/context)
	var userID *uuid.UUID
	// TODO: Extract user ID from session/context
	
	// Upload file
	obj, err := e.manager.UploadObject(ctx, bucketName, path, header.Filename, content, contentType, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	response := map[string]interface{}{
		"id":           obj.ID,
		"bucket":       obj.BucketName,
		"key":          obj.ObjectKey,
		"size":         obj.Size,
		"content_type": obj.ContentType,
		"checksum":     obj.Checksum,
		"created_at":   obj.CreatedAt,
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// handleDownload handles file download
func (e *CloudStorageExtension) handleDownload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	ctx := r.Context()
	
	// Extract object ID from URL
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	objectID := parts[3]
	
	// Get object from database
	var obj pkgstorage.StorageObject
	if err := e.db.Where("id = ?", objectID).First(&obj).Error; err != nil {
		http.Error(w, "Object not found", http.StatusNotFound)
		return
	}
	
	// Get file content
	content, contentType, err := e.manager.GetFile(ctx, obj.BucketName, obj.ObjectKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Extract filename from object key
	filename := obj.ObjectKey
	if idx := strings.LastIndex(filename, "/"); idx >= 0 {
		filename = filename[idx+1:]
	}
	
	// Set response headers
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Length", strconv.FormatInt(int64(len(content)), 10))
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	
	// Write content
	w.Write(content)
}

// handleStats returns storage statistics
func (e *CloudStorageExtension) handleStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	ctx := r.Context()
	
	// Get overall statistics
	var totalBuckets int64
	var totalObjects int64
	var totalSize int64
	
	e.db.Model(&pkgstorage.StorageBucket{}).Count(&totalBuckets)
	e.db.Model(&pkgstorage.StorageObject{}).Count(&totalObjects)
	e.db.Model(&pkgstorage.StorageObject{}).
		Select("COALESCE(SUM(size), 0)").
		Scan(&totalSize)
	
	// Get per-bucket statistics
	buckets, _ := e.manager.ListBuckets(ctx)
	bucketStats := make([]map[string]interface{}, 0)
	
	for _, bucket := range buckets {
		var objectCount int64
		var bucketSize int64
		
		e.db.Model(&pkgstorage.StorageObject{}).
			Where("bucket_name = ?", bucket.Name).
			Count(&objectCount)
		
		e.db.Model(&pkgstorage.StorageObject{}).
			Where("bucket_name = ?", bucket.Name).
			Select("COALESCE(SUM(size), 0)").
			Scan(&bucketSize)
		
		bucketStats = append(bucketStats, map[string]interface{}{
			"name":         bucket.Name,
			"public":       bucket.Public,
			"object_count": objectCount,
			"size":         bucketSize,
			"size_formatted": formatBytes(bucketSize),
		})
	}
	
	// Get recent uploads
	var recentUploads []pkgstorage.StorageObject
	e.db.Order("created_at DESC").Limit(10).Find(&recentUploads)
	
	recentList := make([]map[string]interface{}, len(recentUploads))
	for i, obj := range recentUploads {
		recentList[i] = map[string]interface{}{
			"id":           obj.ID,
			"bucket":       obj.BucketName,
			"key":          obj.ObjectKey,
			"size":         obj.Size,
			"created_at":   obj.CreatedAt,
		}
	}
	
	// Get provider type from the manager
	provider := e.manager.GetProvider()
	providerType := "unknown"
	if provider != nil {
		providerType = string(provider.Type())
	}
	
	response := map[string]interface{}{
		"total_buckets":     totalBuckets,
		"total_objects":     totalObjects,
		"total_size":        totalSize,
		"total_size_formatted": formatBytes(totalSize),
		"provider":          providerType,
		"max_file_size":     e.config.MaxFileSize,
		"buckets":           bucketStats,
		"recent_uploads":    recentList,
		"timestamp":         time.Now(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// formatBytes formats bytes into human-readable format
func formatBytes(bytes int64) string {
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