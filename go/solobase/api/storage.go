package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/suppers-ai/solobase/database"
	"github.com/suppers-ai/solobase/extensions/core"
	"github.com/suppers-ai/solobase/models"
	"github.com/suppers-ai/solobase/services"
)

// StorageHandlers contains all storage-related handlers with hook support
type StorageHandlers struct {
	storageService *services.StorageService
	db             *database.DB
	hookRegistry   *core.ExtensionRegistry
}

// extractUserIDFromToken extracts user ID from JWT token in Authorization header
func extractUserIDFromToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}
	
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		return ""
	}
	
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Use the same secret as in middleware.go
		return jwtSecret, nil
	})
	
	if err != nil || !token.Valid {
		return ""
	}
	
	return claims.UserID
}

// NewStorageHandlers creates new storage handlers with hook support
func NewStorageHandlers(storageService *services.StorageService, db *database.DB, hookRegistry *core.ExtensionRegistry) *StorageHandlers {
	return &StorageHandlers{
		storageService: storageService,
		db:             db,
		hookRegistry:   hookRegistry,
	}
}

// HandleGetStorageBuckets handles bucket listing
func (h *StorageHandlers) HandleGetStorageBuckets(w http.ResponseWriter, r *http.Request) {
	buckets, err := h.storageService.GetBuckets()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch buckets")
		return
	}

	respondWithJSON(w, http.StatusOK, buckets)
}

// HandleGetBucketObjects handles object listing in a bucket
func (h *StorageHandlers) HandleGetBucketObjects(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]
	
	// Get path from query parameters
	path := r.URL.Query().Get("path")

	objects, err := h.storageService.GetBucketObjectsWithPath(bucket, path)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch objects")
		return
	}

	respondWithJSON(w, http.StatusOK, objects)
}

// HandleCreateBucket handles bucket creation
func (h *StorageHandlers) HandleCreateBucket(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Name   string `json:"name"`
		Public bool   `json:"public"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	if request.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Bucket name is required")
		return
	}
	
	err := h.storageService.CreateBucket(request.Name, request.Public)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	
	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Bucket created successfully",
		"name":    request.Name,
	})
}

// HandleDeleteBucket handles bucket deletion
func (h *StorageHandlers) HandleDeleteBucket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]
	
	err := h.storageService.DeleteBucket(bucket)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	
	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Bucket deleted successfully",
	})
}

// HandleUploadFile handles file uploads with hook support
func (h *StorageHandlers) HandleUploadFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]

	// Parse multipart form
	err := r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Failed to parse form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Failed to get file")
		return
	}
	defer file.Close()

	// Get path from form (optional)
	path := r.FormValue("path")
	
	// Construct full key with path
	key := header.Filename
	if path != "" {
		// Clean up path - remove leading/trailing slashes
		path = strings.Trim(path, "/")
		if path != "" {
			key = path + "/" + header.Filename
		}
	}

	// Get content type
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Get user ID from context if available, otherwise try to extract from token
	userID, _ := r.Context().Value("user_id").(string)
	if userID == "" {
		userID = extractUserIDFromToken(r)
	}

	// Prepare hook context for before upload
	if h.hookRegistry != nil {
		hookCtx := &core.HookContext{
			Request:  r,
			Response: w,
			Data: map[string]interface{}{
				"userID":      userID,
				"bucket":      bucket,
				"filename":    header.Filename,
				"key":         key,
				"fileSize":    header.Size,
				"contentType": contentType,
			},
			Services: nil, // Will be set by registry
		}

		// Execute before upload hooks
		if err := h.hookRegistry.ExecuteHooks(r.Context(), core.HookBeforeUpload, hookCtx); err != nil {
			respondWithError(w, http.StatusInsufficientStorage, err.Error())
			return
		}
	}

	// Read file content for upload
	fileContent, err := io.ReadAll(file)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to read file")
		return
	}

	// Upload file using the storage service
	object, err := h.storageService.UploadFile(bucket, key, bytes.NewReader(fileContent), header.Size, contentType)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to upload file: " + err.Error())
		return
	}

	// Extract object ID from response
	objectID := ""
	if objMap, ok := object.(map[string]interface{}); ok {
		if id, ok := objMap["id"].(string); ok {
			objectID = id
		}
	}

	// Execute after upload hooks
	if h.hookRegistry != nil {
		hookCtx := &core.HookContext{
			Request:  r,
			Response: w,
			Data: map[string]interface{}{
				"userID":   userID,
				"bucket":   bucket,
				"objectID": objectID,
				"filename": header.Filename,
				"key":      key,
				"fileSize": header.Size,
			},
			Services: nil,
		}

		// Execute after upload hooks (async)
		go h.hookRegistry.ExecuteHooks(context.Background(), core.HookAfterUpload, hookCtx)
	}

	respondWithJSON(w, http.StatusCreated, object)
}

// HandleDeleteObject handles object deletion
func (h *StorageHandlers) HandleDeleteObject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]
	objectID := vars["id"]

	err := h.storageService.DeleteObject(bucket, objectID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete object: " + err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Object deleted successfully"})
}

// HandleDownloadObject handles file downloads with hook support
func (h *StorageHandlers) HandleDownloadObject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]
	objectID := vars["id"]
	
	// Get user ID from context if available, otherwise try to extract from token
	userID, _ := r.Context().Value("user_id").(string)
	if userID == "" {
		userID = extractUserIDFromToken(r)
	}
	
	// Execute before download hooks
	if h.hookRegistry != nil {
		hookCtx := &core.HookContext{
			Request:  r,
			Response: w,
			Data: map[string]interface{}{
				"userID":   userID,
				"bucket":   bucket,
				"objectID": objectID,
			},
			Services: nil,
		}

		if err := h.hookRegistry.ExecuteHooks(r.Context(), core.HookBeforeDownload, hookCtx); err != nil {
			respondWithError(w, http.StatusForbidden, err.Error())
			return
		}
	}
	
	// Get the file from storage service
	reader, filename, contentType, err := h.storageService.GetObject(bucket, objectID)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Object not found")
		return
	}
	
	// Track bandwidth if we have hooks
	var tracker *BandwidthTracker
	var finalReader io.ReadCloser = reader
	
	if h.hookRegistry != nil && userID != "" {
		// Wrap reader to track bandwidth
		tracker = &BandwidthTracker{
			reader: reader,
		}
		finalReader = tracker
	}
	defer finalReader.Close()
	
	// Set headers for download
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", "attachment; filename=\""+filename+"\"")
	
	// Stream the file to the response
	if _, err := io.Copy(w, finalReader); err != nil {
		// Log error but can't send error response as headers are already sent
		log.Printf("Error streaming file: %v", err)
		return
	}
	
	// Execute after download hooks
	if h.hookRegistry != nil && tracker != nil {
		bytesRead := tracker.bytesRead
		if bytesRead > 0 || userID != "" {
			hookCtx := &core.HookContext{
				Request:  r,
				Response: w,
				Data: map[string]interface{}{
					"userID":    userID,
					"bucket":    bucket,
					"objectID":  objectID,
					"bytesRead": bytesRead,
				},
				Services: nil,
			}

			// Execute after download hooks (async)
			go h.hookRegistry.ExecuteHooks(context.Background(), core.HookAfterDownload, hookCtx)
		}
	}
}

// HandleRenameObject handles object renaming
func (h *StorageHandlers) HandleRenameObject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]
	objectID := vars["id"]
	
	var request struct {
		NewName string `json:"newName"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	if request.NewName == "" {
		respondWithError(w, http.StatusBadRequest, "New name is required")
		return
	}
	
	if err := h.storageService.RenameObject(bucket, objectID, request.NewName); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	
	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Object renamed successfully",
	})
}

// HandleCreateFolder handles folder creation
func (h *StorageHandlers) HandleCreateFolder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]
	
	var request struct {
		Name string `json:"name"`
		Path string `json:"path"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	if request.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Folder name is required")
		return
	}
	
	// Construct the full folder path
	folderPath := request.Name
	if request.Path != "" {
		folderPath = strings.TrimSuffix(request.Path, "/") + "/" + request.Name
	}
	
	err := h.storageService.CreateFolder(bucket, folderPath)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create folder: " + err.Error())
		return
	}
	
	respondWithJSON(w, http.StatusCreated, map[string]string{
		"message": "Folder created successfully",
		"folder":  folderPath,
	})
}

// Presigned URL handlers

// HandleGenerateDownloadURL generates a presigned URL or token for download
func (h *StorageHandlers) HandleGenerateDownloadURL(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]
	objectID := vars["id"]
	
	// Get user ID from context
	userID, _ := r.Context().Value("user_id").(string)
	if userID == "" {
		userID = extractUserIDFromToken(r)
	}
	
	// Get object info
	object, err := h.storageService.GetObjectInfo(bucket, objectID)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Object not found")
		return
	}
	
	// Check storage provider
	provider := h.storageService.GetProviderType()
	
	var response map[string]interface{}
	
	if provider == "s3" {
		// Generate S3 presigned URL
		url, err := h.storageService.GeneratePresignedDownloadURL(bucket, object.ObjectKey, 3600) // 1 hour
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to generate download URL")
			return
		}
		
		// Create download token for tracking
		token := &models.DownloadToken{
			ID:        uuid.New().String(),
			Token:     uuid.New().String(),
			FileID:    objectID,
			Bucket:    bucket,
			ObjectKey: object.ObjectKey,
			UserID:    userID,
			FileSize:  object.Size,
			ExpiresAt: time.Now().Add(time.Hour),
		}
		
		if err := h.db.Create(token).Error; err != nil {
			log.Printf("Failed to create download token: %v", err)
		}
		
		response = map[string]interface{}{
			"url":          url,
			"type":         "presigned",
			"expires_in":   3600,
			"callback_url": fmt.Sprintf("/api/storage/download-callback/%s", token.Token),
		}
	} else {
		// Generate token for local storage
		token := &models.DownloadToken{
			ID:        uuid.New().String(),
			Token:     uuid.New().String(),
			FileID:    objectID,
			Bucket:    bucket,
			ObjectKey: object.ObjectKey,
			UserID:    userID,
			FileSize:  object.Size,
			ExpiresAt: time.Now().Add(time.Hour),
		}
		
		if err := h.db.Create(token).Error; err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create download token")
			return
		}
		
		response = map[string]interface{}{
			"url":        fmt.Sprintf("/api/storage/direct/%s", token.Token),
			"type":       "token",
			"expires_in": 3600,
		}
	}
	
	respondWithJSON(w, http.StatusOK, response)
}

// HandleGenerateUploadURL generates a presigned URL or token for upload
func (h *StorageHandlers) HandleGenerateUploadURL(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bucket := vars["bucket"]
	
	var request struct {
		Filename    string `json:"filename"`
		Path        string `json:"path"`
		ContentType string `json:"contentType"`
		MaxSize     int64  `json:"maxSize"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	
	if request.Filename == "" {
		respondWithError(w, http.StatusBadRequest, "Filename is required")
		return
	}
	
	if request.ContentType == "" {
		request.ContentType = "application/octet-stream"
	}
	
	if request.MaxSize == 0 {
		request.MaxSize = 10 << 20 // 10MB default
	}
	
	// Get user ID from context
	userID, _ := r.Context().Value("user_id").(string)
	if userID == "" {
		userID = extractUserIDFromToken(r)
	}
	
	// Construct object key
	objectKey := request.Filename
	if request.Path != "" {
		objectKey = strings.Trim(request.Path, "/") + "/" + request.Filename
	}
	
	// Check storage quota before generating URL
	if h.hookRegistry != nil && userID != "" {
		hookCtx := &core.HookContext{
			Request:  r,
			Response: w,
			Data: map[string]interface{}{
				"userID":   userID,
				"bucket":   bucket,
				"fileSize": request.MaxSize,
			},
			Services: nil,
		}
		
		if err := h.hookRegistry.ExecuteHooks(r.Context(), core.HookBeforeUpload, hookCtx); err != nil {
			respondWithError(w, http.StatusInsufficientStorage, err.Error())
			return
		}
	}
	
	// Check storage provider
	provider := h.storageService.GetProviderType()
	
	var response map[string]interface{}
	
	if provider == "s3" {
		// Generate S3 presigned upload URL
		url, err := h.storageService.GeneratePresignedUploadURL(bucket, objectKey, request.ContentType, 3600)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to generate upload URL")
			return
		}
		
		// Create upload token for tracking
		token := &models.UploadToken{
			ID:          uuid.New().String(),
			Token:       uuid.New().String(),
			Bucket:      bucket,
			Filename:    request.Filename,
			ObjectKey:   objectKey,
			UserID:      userID,
			MaxSize:     request.MaxSize,
			ContentType: request.ContentType,
			ExpiresAt:   time.Now().Add(time.Hour),
		}
		
		if err := h.db.Create(token).Error; err != nil {
			log.Printf("Failed to create upload token: %v", err)
		}
		
		response = map[string]interface{}{
			"url":          url,
			"type":         "presigned",
			"expires_in":   3600,
			"callback_url": fmt.Sprintf("/api/storage/upload-callback/%s", token.Token),
		}
	} else {
		// Generate token for local storage
		token := &models.UploadToken{
			ID:          uuid.New().String(),
			Token:       uuid.New().String(),
			Bucket:      bucket,
			Filename:    request.Filename,
			ObjectKey:   objectKey,
			UserID:      userID,
			MaxSize:     request.MaxSize,
			ContentType: request.ContentType,
			ExpiresAt:   time.Now().Add(time.Hour),
		}
		
		if err := h.db.Create(token).Error; err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create upload token")
			return
		}
		
		response = map[string]interface{}{
			"url":        fmt.Sprintf("/api/storage/direct-upload/%s", token.Token),
			"type":       "token",
			"expires_in": 3600,
		}
	}
	
	respondWithJSON(w, http.StatusOK, response)
}

// HandleDirectDownload handles token-based direct download for local storage
func (h *StorageHandlers) HandleDirectDownload(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tokenStr := vars["token"]
	
	// Get download token
	var token models.DownloadToken
	if err := h.db.Where("token = ?", tokenStr).First(&token).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Invalid or expired token")
		return
	}
	
	// Check if token is expired
	if time.Now().After(token.ExpiresAt) {
		respondWithError(w, http.StatusUnauthorized, "Token has expired")
		return
	}
	
	// Get the file from storage
	reader, filename, contentType, err := h.storageService.GetObjectByKey(token.Bucket, token.ObjectKey)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "File not found")
		return
	}
	
	// Track bandwidth
	tracker := &DirectDownloadTracker{
		reader: reader,
		token:  &token,
		db:     h.db,
	}
	defer tracker.Close()
	
	// Set headers for download
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", "attachment; filename=\""+filename+"\"")
	
	// Stream the file
	if _, err := io.Copy(w, tracker); err != nil {
		log.Printf("Error streaming file: %v", err)
	}
}

// HandleDirectUpload handles token-based direct upload for local storage
func (h *StorageHandlers) HandleDirectUpload(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tokenStr := vars["token"]
	
	// Get upload token
	var token models.UploadToken
	if err := h.db.Where("token = ?", tokenStr).First(&token).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Invalid or expired token")
		return
	}
	
	// Check if token is expired
	if time.Now().After(token.ExpiresAt) {
		respondWithError(w, http.StatusUnauthorized, "Token has expired")
		return
	}
	
	// Check if already used
	if token.Completed {
		respondWithError(w, http.StatusConflict, "Token has already been used")
		return
	}
	
	// Read file from request body
	fileContent, err := io.ReadAll(io.LimitReader(r.Body, token.MaxSize+1))
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Failed to read file")
		return
	}
	
	fileSize := int64(len(fileContent))
	
	// Check file size
	if fileSize > token.MaxSize {
		respondWithError(w, http.StatusRequestEntityTooLarge, "File exceeds maximum size")
		return
	}
	
	// Upload the file
	object, err := h.storageService.UploadFile(token.Bucket, token.ObjectKey, bytes.NewReader(fileContent), fileSize, token.ContentType)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to upload file")
		return
	}
	
	// Extract object ID from response
	objectIDStr := ""
	if objMap, ok := object.(map[string]interface{}); ok {
		if id, ok := objMap["id"].(string); ok {
			objectIDStr = id
		}
	}
	
	// Mark token as completed
	token.Completed = true
	token.BytesUploaded = fileSize
	token.ObjectID = objectIDStr
	h.db.Save(&token)
	
	// Execute after upload hooks
	if h.hookRegistry != nil && token.UserID != "" {
		hookCtx := &core.HookContext{
			Request:  r,
			Response: w,
			Data: map[string]interface{}{
				"userID":   token.UserID,
				"bucket":   token.Bucket,
				"objectID": objectIDStr,
				"filename": token.Filename,
				"key":      token.ObjectKey,
				"fileSize": fileSize,
			},
			Services: nil,
		}
		
		go h.hookRegistry.ExecuteHooks(context.Background(), core.HookAfterUpload, hookCtx)
	}
	
	respondWithJSON(w, http.StatusCreated, object)
}

// BandwidthTracker wraps an io.ReadCloser to track bandwidth usage
type BandwidthTracker struct {
	reader    io.ReadCloser
	bytesRead int64
}

func (b *BandwidthTracker) Read(p []byte) (n int, err error) {
	n, err = b.reader.Read(p)
	b.bytesRead += int64(n)
	return n, err
}

func (b *BandwidthTracker) Close() error {
	return b.reader.Close()
}

// DirectDownloadTracker tracks bandwidth for direct downloads
type DirectDownloadTracker struct {
	reader    io.ReadCloser
	token     *models.DownloadToken
	db        *database.DB
	bytesRead int64
}

func (d *DirectDownloadTracker) Read(p []byte) (n int, err error) {
	n, err = d.reader.Read(p)
	d.bytesRead += int64(n)
	return n, err
}

func (d *DirectDownloadTracker) Close() error {
	// Update token with bytes served
	d.token.BytesServed = d.bytesRead
	d.token.Completed = (d.bytesRead >= d.token.FileSize)
	d.db.Save(d.token)
	
	// Execute after download hooks if we have the registry
	// Note: This would need the hook registry to be accessible
	
	return d.reader.Close()
}

// HandleGetStorageQuota returns storage quota information for the current user
func (h *StorageHandlers) HandleGetStorageQuota(w http.ResponseWriter, r *http.Request) {
	userID := extractUserIDFromToken(r)
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	
	// Note: If CloudStorage extension is enabled, it provides additional quota functionality
	// through its own endpoints at /ext/cloudstorage/api/quota
	
	// Get storage used by user
	storageUsed, err := h.storageService.GetUserStorageUsed(userID)
	if err != nil {
		log.Printf("Failed to get user storage: %v", err)
		storageUsed = 0
	}
	
	// Default quota limits (can be overridden by CloudStorage extension)
	maxStorage := int64(5 * 1024 * 1024 * 1024) // 5GB default
	maxBandwidth := int64(10 * 1024 * 1024 * 1024) // 10GB default
	
	// Check if there's a storage quota record for this user
	var quota struct {
		MaxStorageBytes   int64 `json:"max_storage_bytes"`
		MaxBandwidthBytes int64 `json:"max_bandwidth_bytes"`
		StorageUsed       int64 `json:"storage_used"`
		BandwidthUsed     int64 `json:"bandwidth_used"`
	}
	
	// Try to get quota from ext_cloudstorage_storage_quotas table if it exists
	err = h.db.Raw(`
		SELECT 
			COALESCE(max_storage_bytes, ?) as max_storage_bytes,
			COALESCE(max_bandwidth_bytes, ?) as max_bandwidth_bytes,
			COALESCE(storage_used, 0) as storage_used,
			COALESCE(bandwidth_used, 0) as bandwidth_used
		FROM ext_cloudstorage_storage_quotas 
		WHERE user_id = ?
	`, maxStorage, maxBandwidth, userID).Scan(&quota).Error
	
	if err != nil {
		// Table doesn't exist or user has no quota record, use defaults
		quota.MaxStorageBytes = maxStorage
		quota.MaxBandwidthBytes = maxBandwidth
		quota.StorageUsed = storageUsed
		quota.BandwidthUsed = 0
	}
	
	// Calculate percentage
	percentage := float64(0)
	if quota.MaxStorageBytes > 0 {
		percentage = (float64(quota.StorageUsed) / float64(quota.MaxStorageBytes)) * 100
	}
	
	response := map[string]interface{}{
		"used":       quota.StorageUsed,
		"total":      quota.MaxStorageBytes,
		"percentage": percentage,
		"storage_used": quota.StorageUsed,
		"storage_limit": quota.MaxStorageBytes,
		"bandwidth_used": quota.BandwidthUsed,
		"bandwidth_limit": quota.MaxBandwidthBytes,
	}
	
	respondWithJSON(w, http.StatusOK, response)
}

// HandleGetStorageStats returns storage statistics for the current user
func (h *StorageHandlers) HandleGetStorageStats(w http.ResponseWriter, r *http.Request) {
	userID := extractUserIDFromToken(r)
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "Authentication required")
		return
	}
	
	// Get storage statistics
	stats, err := h.storageService.GetStorageStats(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get storage statistics")
		return
	}
	
	// Format response
	response := map[string]interface{}{
		"totalSize":     stats["total_size"],
		"fileCount":     stats["file_count"],
		"folderCount":   stats["folder_count"],
		"sharedCount":   stats["shared_count"],
		"recentUploads": stats["recent_uploads"],
		// Additional fields for compatibility
		"trashedCount": 0, // We don't have trash functionality yet
		"totalFiles":   stats["file_count"],
		"totalFolders": stats["folder_count"],
	}
	
	respondWithJSON(w, http.StatusOK, response)
}

// HandleGetAdminStorageStats returns storage statistics for all users (admin only)
func (h *StorageHandlers) HandleGetAdminStorageStats(w http.ResponseWriter, r *http.Request) {
	// TODO: Add admin role check here
	
	stats, err := h.storageService.GetAllUsersStorageStats()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get storage statistics")
		return
	}
	
	respondWithJSON(w, http.StatusOK, stats)
}