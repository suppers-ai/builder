package cloudstorage

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	pkgstorage "github.com/suppers-ai/storage"
)

// Response structs
type ShareResponse struct {
	ID              string    `json:"id"`
	ShareURL        string    `json:"share_url,omitempty"`
	ShareToken      string    `json:"share_token,omitempty"`
	ExpiresAt       *time.Time `json:"expires_at,omitempty"`
	PermissionLevel string    `json:"permission_level"`
}

type QuotaResponse struct {
	StorageUsed         int64   `json:"storage_used"`
	StorageLimit        int64   `json:"storage_limit"`
	StoragePercentage   float64 `json:"storage_percentage"`
	BandwidthUsed       int64   `json:"bandwidth_used"`
	BandwidthLimit      int64   `json:"bandwidth_limit"`
	BandwidthPercentage float64 `json:"bandwidth_percentage"`
	ResetDate           *time.Time `json:"reset_date,omitempty"`
}

// handleShares manages file sharing operations
func (e *CloudStorageExtension) handleShares(w http.ResponseWriter, r *http.Request) {
	if e.shareService == nil {
		http.Error(w, "Sharing is not enabled", http.StatusNotImplemented)
		return
	}

	ctx := r.Context()
	userID := r.Header.Get("X-User-ID") // Should come from auth middleware

	switch r.Method {
	case http.MethodPost:
		// Create a new share
		var req struct {
			ObjectID          string    `json:"object_id"`
			SharedWithUserID  string    `json:"shared_with_user_id,omitempty"`
			SharedWithEmail   string    `json:"shared_with_email,omitempty"`
			PermissionLevel   string    `json:"permission_level"`
			InheritToChildren bool      `json:"inherit_to_children"`
			GenerateToken     bool      `json:"generate_token"`
			IsPublic          bool      `json:"is_public"`
			ExpiresAt         *time.Time `json:"expires_at,omitempty"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		opts := ShareOptions{
			SharedWithUserID:  req.SharedWithUserID,
			SharedWithEmail:   req.SharedWithEmail,
			PermissionLevel:   PermissionLevel(req.PermissionLevel),
			InheritToChildren: req.InheritToChildren,
			GenerateToken:     req.GenerateToken,
			IsPublic:          req.IsPublic,
			ExpiresAt:         req.ExpiresAt,
		}

		share, err := e.shareService.CreateShare(ctx, req.ObjectID, userID, opts)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Log the share action
		if e.accessLogService != nil {
			e.accessLogService.LogAccess(ctx, req.ObjectID, ActionShare, LogOptions{
				UserID:    userID,
				IPAddress: parseIPAddress(r.RemoteAddr),
				UserAgent: r.UserAgent(),
			})
		}

		response := ShareResponse{
			ID:              share.ID,
			ExpiresAt:       share.ExpiresAt,
			PermissionLevel: string(share.PermissionLevel),
		}
		if share.ShareToken != nil {
			response.ShareToken = *share.ShareToken
			response.ShareURL = fmt.Sprintf("/share/%s", *share.ShareToken)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)

	case http.MethodGet:
		// List user's shares
		shares, err := e.shareService.GetUserShares(ctx, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(shares)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleShareAccess handles accessing a shared file via token
func (e *CloudStorageExtension) handleShareAccess(w http.ResponseWriter, r *http.Request) {
	if e.shareService == nil {
		http.Error(w, "Sharing is not enabled", http.StatusNotImplemented)
		return
	}

	ctx := r.Context()
	
	// Extract share token from URL
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	token := parts[2]

	// Get the share
	share, err := e.shareService.GetShareByToken(ctx, token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// Get the object
	var obj pkgstorage.StorageObject
	if err := e.db.Where("id = ?", share.ObjectID).First(&obj).Error; err != nil {
		http.Error(w, "Object not found", http.StatusNotFound)
		return
	}

	// Log access
	if e.accessLogService != nil {
		e.accessLogService.LogAccess(ctx, share.ObjectID, ActionView, LogOptions{
			ShareID:   share.ID,
			IPAddress: parseIPAddress(r.RemoteAddr),
			UserAgent: r.UserAgent(),
		})
	}

	// Check permission level
	switch share.PermissionLevel {
	case PermissionView:
		// Allow view/download only
		if r.Method != http.MethodGet {
			http.Error(w, "Permission denied", http.StatusForbidden)
			return
		}
	case PermissionEdit:
		// Allow view/download/upload
		if r.Method != http.MethodGet && r.Method != http.MethodPost && r.Method != http.MethodPut {
			http.Error(w, "Permission denied", http.StatusForbidden)
			return
		}
	case PermissionAdmin:
		// Allow all operations
	}

	// Serve the file or handle upload based on method
	switch r.Method {
	case http.MethodGet:
		// Download the file
		content, contentType, err := e.manager.GetFile(ctx, obj.BucketName, obj.ObjectKey)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Update bandwidth usage for the file owner
		if e.quotaService != nil && e.config.EnableQuotas && obj.UserID != "" {
			if err := e.quotaService.UpdateBandwidthUsage(ctx, obj.UserID, obj.Size); err != nil {
				// Log error but don't fail the download
				fmt.Printf("Failed to update bandwidth usage: %v\n", err)
			}
		}

		// Set headers
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Length", strconv.FormatInt(obj.Size, 10))
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", obj.ObjectKey))

		// Write content
		w.Write(content)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleQuota manages storage quota operations
func (e *CloudStorageExtension) handleQuota(w http.ResponseWriter, r *http.Request) {
	if e.quotaService == nil {
		http.Error(w, "Quotas are not enabled", http.StatusNotImplemented)
		return
	}

	ctx := r.Context()
	userID := r.Header.Get("X-User-ID")

	switch r.Method {
	case http.MethodGet:
		// Get quota stats
		stats, err := e.quotaService.GetQuotaStats(ctx, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)

	case http.MethodPut:
		// Update quota (admin only)
		// TODO: Check admin permissions
		var req struct {
			UserID            string `json:"user_id"`
			MaxStorageBytes   int64  `json:"max_storage_bytes"`
			MaxBandwidthBytes int64  `json:"max_bandwidth_bytes"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		quota, err := e.quotaService.GetOrCreateQuota(ctx, req.UserID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		quota.MaxStorageBytes = req.MaxStorageBytes
		quota.MaxBandwidthBytes = req.MaxBandwidthBytes
		quota.UpdatedAt = time.Now()

		if err := e.db.Save(quota).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(quota)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleAccessLogs retrieves access logs
func (e *CloudStorageExtension) handleAccessLogs(w http.ResponseWriter, r *http.Request) {
	if e.accessLogService == nil {
		http.Error(w, "Access logging is not enabled", http.StatusNotImplemented)
		return
	}

	ctx := r.Context()
	userID := r.Header.Get("X-User-ID")

	// Parse query parameters
	filters := AccessLogFilters{
		UserID:   userID,
		ObjectID: r.URL.Query().Get("object_id"),
		Action:   r.URL.Query().Get("action"),
		Limit:    100,
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			filters.Limit = limit
		}
	}

	// Parse date filters
	if startStr := r.URL.Query().Get("start_date"); startStr != "" {
		if start, err := time.Parse(time.RFC3339, startStr); err == nil {
			filters.StartDate = &start
		}
	}
	if endStr := r.URL.Query().Get("end_date"); endStr != "" {
		if end, err := time.Parse(time.RFC3339, endStr); err == nil {
			filters.EndDate = &end
		}
	}

	logs, err := e.accessLogService.GetAccessLogs(ctx, filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}

// handleAccessStats retrieves access statistics
func (e *CloudStorageExtension) handleAccessStats(w http.ResponseWriter, r *http.Request) {
	if e.accessLogService == nil {
		http.Error(w, "Access logging is not enabled", http.StatusNotImplemented)
		return
	}

	ctx := r.Context()
	userID := r.Header.Get("X-User-ID")

	filters := StatsFilters{
		UserID:   userID,
		ObjectID: r.URL.Query().Get("object_id"),
	}

	// Parse date filters
	if startStr := r.URL.Query().Get("start_date"); startStr != "" {
		if start, err := time.Parse(time.RFC3339, startStr); err == nil {
			filters.StartDate = &start
		}
	}
	if endStr := r.URL.Query().Get("end_date"); endStr != "" {
		if end, err := time.Parse(time.RFC3339, endStr); err == nil {
			filters.EndDate = &end
		}
	}

	stats, err := e.accessLogService.GetAccessStats(ctx, filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// handleUpload handles file uploads with quota checking
func (e *CloudStorageExtension) handleUpload(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := r.Header.Get("X-User-ID")

	// Parse multipart form
	err := r.ParseMultipartForm(32 << 20) // 32MB max memory
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	bucketName := r.FormValue("bucket")
	if bucketName == "" {
		bucketName = "uploads" // Default bucket
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Check quota before upload
	if e.quotaService != nil && e.config.EnableQuotas {
		if err := e.quotaService.CheckStorageQuota(ctx, userID, header.Size); err != nil {
			http.Error(w, err.Error(), http.StatusInsufficientStorage)
			return
		}
	}

	// Read file content
	content, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	// Upload file
	path := userID // Use userID as the path/directory
	filename := header.Filename
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	
	// Parse userID as UUID if needed
	var userUUID *uuid.UUID
	if userID != "" {
		id, err := uuid.Parse(userID)
		if err == nil {
			userUUID = &id
		}
	}

	obj, err := e.manager.UploadObject(ctx, bucketName, path, filename, content, contentType, userUUID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update quota usage
	if e.quotaService != nil && e.config.EnableQuotas {
		if err := e.quotaService.UpdateStorageUsage(ctx, userID, header.Size); err != nil {
			// Log error but don't fail the upload
			fmt.Printf("Failed to update quota: %v\n", err)
		}
	}

	// Log the upload
	if e.accessLogService != nil && e.config.EnableAccessLogs {
		startTime := time.Now()
		success := true
		e.accessLogService.LogAccess(ctx, obj.ID, ActionUpload, LogOptions{
			UserID:    userID,
			IPAddress: parseIPAddress(r.RemoteAddr),
			UserAgent: r.UserAgent(),
			Success:   &success,
			BytesSize: header.Size,
			Duration:  time.Since(startTime),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(obj)
}

// handleStats returns storage statistics
func (e *CloudStorageExtension) handleStats(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := r.Header.Get("X-User-ID")

	stats := make(map[string]interface{})

	// Get storage stats
	var storageStats struct {
		TotalObjects int64 `json:"total_objects"`
		TotalSize    int64 `json:"total_size"`
	}
	e.db.Model(&pkgstorage.StorageObject{}).
		Where("user_id = ?", userID).
		Select("COUNT(*) as total_objects, COALESCE(SUM(size), 0) as total_size").
		Scan(&storageStats)
	
	stats["storage"] = storageStats

	// Get quota stats if enabled
	if e.quotaService != nil && e.config.EnableQuotas {
		quotaStats, err := e.quotaService.GetQuotaStats(ctx, userID)
		if err == nil {
			stats["quota"] = quotaStats
		}
	}

	// Get share stats if enabled
	if e.shareService != nil && e.config.EnableSharing {
		var shareCount int64
		e.db.Model(&StorageShare{}).Where("created_by = ?", userID).Count(&shareCount)
		stats["shares"] = map[string]interface{}{
			"total_shares": shareCount,
		}
	}

	// Get access stats if enabled
	if e.accessLogService != nil && e.config.EnableAccessLogs {
		accessStats, err := e.accessLogService.GetAccessStats(ctx, StatsFilters{UserID: userID})
		if err == nil {
			stats["access"] = accessStats
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// handleBuckets lists all buckets (for compatibility)
func (e *CloudStorageExtension) handleBuckets(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	buckets, err := e.manager.ListBuckets(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(buckets)
}

// handleDownload handles file downloads with bandwidth tracking
func (e *CloudStorageExtension) handleDownload(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := r.Header.Get("X-User-ID")
	
	// Get object ID from query params
	objectID := r.URL.Query().Get("id")
	if objectID == "" {
		http.Error(w, "Object ID is required", http.StatusBadRequest)
		return
	}
	
	// Get the object
	var obj pkgstorage.StorageObject
	if err := e.db.Where("id = ?", objectID).First(&obj).Error; err != nil {
		http.Error(w, "Object not found", http.StatusNotFound)
		return
	}
	
	// Check if user has access (owns the file or it's public)
	// TODO: Add more sophisticated access control
	if obj.UserID != userID {
		// Check if there's a public share for this object
		var share StorageShare
		if err := e.db.Where("object_id = ? AND is_public = ?", objectID, true).First(&share).Error; err != nil {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}
	}
	
	// Download the file
	content, contentType, err := e.manager.GetFile(ctx, obj.BucketName, obj.ObjectKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	// Update bandwidth usage for the file owner
	if e.quotaService != nil && e.config.EnableQuotas && obj.UserID != "" {
		if err := e.quotaService.UpdateBandwidthUsage(ctx, obj.UserID, obj.Size); err != nil {
			// Log error but don't fail the download
			fmt.Printf("Failed to update bandwidth usage: %v\n", err)
		}
	}
	
	// Log the download
	if e.accessLogService != nil && e.config.EnableAccessLogs {
		success := true
		e.accessLogService.LogAccess(ctx, obj.ID, ActionDownload, LogOptions{
			UserID:    userID,
			IPAddress: parseIPAddress(r.RemoteAddr),
			UserAgent: r.UserAgent(),
			Success:   &success,
			BytesSize: obj.Size,
		})
	}
	
	// Set headers
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Length", strconv.FormatInt(obj.Size, 10))
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filepath.Base(obj.ObjectKey)))
	
	// Write content
	w.Write(content)
}