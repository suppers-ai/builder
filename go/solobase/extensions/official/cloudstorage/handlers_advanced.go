package cloudstorage

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
	
	"github.com/google/uuid"
)

// handleShares lists all shares for the current user
func (e *CloudStorageExtension) handleShares(w http.ResponseWriter, r *http.Request) {
	_ = r.Context() // ctx unused for now
	
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	// TODO: Get user ID from session/context
	userID := "current-user-id"
	
	var shares []StorageShare
	if err := e.db.Where("created_by = ?", userID).Find(&shares).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(shares)
}

// handleShare gets or validates a shared link
func (e *CloudStorageExtension) handleShare(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Extract token from URL
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	token := parts[3]
	
	switch r.Method {
	case http.MethodGet:
		// Get share details
		share, err := e.shareService.GetShare(ctx, token)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		
		// Check password if required
		password := r.Header.Get("X-Share-Password")
		if err := e.shareService.ValidateSharePassword(share, password); err != nil {
			http.Error(w, "Password required", http.StatusUnauthorized)
			return
		}
		
		// Increment access count
		e.shareService.IncrementShareAccess(ctx, share.ID)
		
		// Log access
		e.accessLogService.LogAccess(ctx, &StorageAccessLog{
			ObjectID:   share.ObjectID,
			BucketName: share.BucketName,
			ShareID:    share.ID,
			Action:     "share_access",
			IPAddress:  r.RemoteAddr,
			UserAgent:  r.UserAgent(),
			Success:    true,
		})
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(share)
		
	case http.MethodDelete:
		// Delete share (only by creator)
		// TODO: Verify user is the creator
		if err := e.db.Where("share_token = ?", token).Delete(&StorageShare{}).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.WriteHeader(http.StatusNoContent)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleCreateShare creates a new share
func (e *CloudStorageExtension) handleCreateShare(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	ctx := r.Context()
	
	var req struct {
		ObjectID       string     `json:"object_id"`
		BucketName     string     `json:"bucket_name"`
		ExpiresIn      int        `json:"expires_in_hours,omitempty"`
		MaxAccessCount int        `json:"max_access_count,omitempty"`
		Password       string     `json:"password,omitempty"`
		AllowDownload  bool       `json:"allow_download"`
		AllowUpload    bool       `json:"allow_upload"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// TODO: Get user ID from session/context
	userID := "current-user-id"
	
	opts := ShareOptions{
		AllowDownload: req.AllowDownload,
		AllowUpload:   req.AllowUpload,
		Password:      req.Password,
	}
	
	if req.ExpiresIn > 0 {
		expiresAt := time.Now().Add(time.Duration(req.ExpiresIn) * time.Hour)
		opts.ExpiresAt = &expiresAt
	}
	
	if req.MaxAccessCount > 0 {
		opts.MaxAccessCount = &req.MaxAccessCount
	}
	
	share, err := e.shareService.CreateShare(ctx, req.ObjectID, req.BucketName, userID, opts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(share)
}

// handleQuotas manages storage quotas
func (e *CloudStorageExtension) handleQuotas(w http.ResponseWriter, r *http.Request) {
	_ = r.Context() // ctx unused for now
	
	switch r.Method {
	case http.MethodGet:
		// List all quotas (admin only)
		var quotas []StorageQuota
		if err := e.db.Find(&quotas).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(quotas)
		
	case http.MethodPost:
		// Create or update quota
		var req StorageQuota
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		
		req.ID = uuid.New().String()
		req.CreatedAt = time.Now()
		req.UpdatedAt = time.Now()
		
		if err := e.db.Create(&req).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(req)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleUserQuota manages a specific user's quota
func (e *CloudStorageExtension) handleUserQuota(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Extract user ID from URL
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	userID := parts[3]
	
	switch r.Method {
	case http.MethodGet:
		// Get user's quota
		quota, err := e.quotaService.GetOrCreateQuota(ctx, userID, e.config.MaxStoragePerUser)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(quota)
		
	case http.MethodPut:
		// Update user's quota
		var req struct {
			MaxStorage   int64  `json:"max_storage"`
			MaxFileSize  int64  `json:"max_file_size,omitempty"`
			MaxFileCount *int64 `json:"max_file_count,omitempty"`
			AllowPublic  bool   `json:"allow_public"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		
		updates := map[string]interface{}{
			"max_storage":    req.MaxStorage,
			"max_file_size":  req.MaxFileSize,
			"max_file_count": req.MaxFileCount,
			"allow_public":   req.AllowPublic,
			"updated_at":     time.Now(),
		}
		
		if err := e.db.Model(&StorageQuota{}).Where("user_id = ?", userID).Updates(updates).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.WriteHeader(http.StatusNoContent)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleAccessLogs retrieves access logs
func (e *CloudStorageExtension) handleAccessLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	ctx := r.Context()
	
	// Parse query parameters
	filters := AccessLogFilters{
		ObjectID:   r.URL.Query().Get("object_id"),
		BucketName: r.URL.Query().Get("bucket"),
		UserID:     r.URL.Query().Get("user_id"),
		Action:     r.URL.Query().Get("action"),
		Limit:      100,
	}
	
	// Parse date filters
	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		if t, err := time.Parse(time.RFC3339, startDate); err == nil {
			filters.StartDate = &t
		}
	}
	
	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		if t, err := time.Parse(time.RFC3339, endDate); err == nil {
			filters.EndDate = &t
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

// handleVersions manages file versions
func (e *CloudStorageExtension) handleVersions(w http.ResponseWriter, r *http.Request) {
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
		// Get all versions of an object
		versions, err := e.versionService.GetVersions(ctx, objectID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(versions)
		
	case http.MethodPost:
		// Create a new version
		var req struct {
			BucketName string `json:"bucket_name"`
			Comment    string `json:"comment,omitempty"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		
		// TODO: Get user ID from session/context
		userID := "current-user-id"
		
		version, err := e.versionService.CreateVersion(ctx, objectID, req.BucketName, userID, req.Comment)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(version)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleRestoreVersion restores a file to a specific version
func (e *CloudStorageExtension) handleRestoreVersion(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	ctx := r.Context()
	
	var req struct {
		ObjectID  string `json:"object_id"`
		VersionID string `json:"version_id"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	if err := e.versionService.RestoreVersion(ctx, req.ObjectID, req.VersionID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// handleTags manages object tags
func (e *CloudStorageExtension) handleTags(w http.ResponseWriter, r *http.Request) {
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
		// Get tags for an object
		tags, err := e.tagService.GetTags(ctx, objectID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tags)
		
	case http.MethodPost:
		// Add tags to an object
		var req struct {
			BucketName string            `json:"bucket_name"`
			Tags       map[string]string `json:"tags"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		
		if err := e.tagService.AddTags(ctx, objectID, req.BucketName, req.Tags); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.WriteHeader(http.StatusNoContent)
		
	case http.MethodDelete:
		// Remove a tag
		key := r.URL.Query().Get("key")
		if key == "" {
			http.Error(w, "Tag key is required", http.StatusBadRequest)
			return
		}
		
		if err := e.tagService.RemoveTag(ctx, objectID, key); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		w.WriteHeader(http.StatusNoContent)
		
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleSearchByTags searches objects by tags
func (e *CloudStorageExtension) handleSearchByTags(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	ctx := r.Context()
	
	var req struct {
		BucketName string            `json:"bucket_name"`
		Tags       map[string]string `json:"tags"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	objectIDs, err := e.tagService.SearchByTags(ctx, req.BucketName, req.Tags)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(objectIDs)
}