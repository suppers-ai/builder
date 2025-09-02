package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/logger"
	"github.com/suppers-ai/solobase/extensions/core"
	"github.com/suppers-ai/solobase/extensions/official/hugo/services"
)

// BackupHandler handles backup-related HTTP requests
type BackupHandler struct {
	backupService *services.BackupService
	logger        core.ExtensionLogger
}

// NewBackupHandler creates a new backup handler
func NewBackupHandler(backupService *services.BackupService, logger core.ExtensionLogger) *BackupHandler {
	return &BackupHandler{
		backupService: backupService,
		logger:        logger,
	}
}

// ListBackups handles GET /api/sites/{id}/backups
func (bh *BackupHandler) ListBackups(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get site ID from URL
	vars := mux.Vars(r)
	siteID := vars["id"]
	if siteID == "" {
		http.Error(w, "Site ID is required", http.StatusBadRequest)
		return
	}

	backups, err := bh.backupService.ListBackups(ctx, siteID)
	if err != nil {
		bh.logger.Error(ctx, "Failed to list backups",
			logger.String("site_id", siteID),
			logger.Err(err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(backups)
}

// CreateBackup handles POST /api/sites/{id}/backup
func (bh *BackupHandler) CreateBackup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get site ID from URL
	vars := mux.Vars(r)
	siteID := vars["id"]
	if siteID == "" {
		http.Error(w, "Site ID is required", http.StatusBadRequest)
		return
	}

	// Parse request body
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate name
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		http.Error(w, "Backup name is required", http.StatusBadRequest)
		return
	}

	// Create backup
	backup, err := bh.backupService.CreateBackup(ctx, siteID, req.Name, req.Description)
	if err != nil {
		bh.logger.Error(ctx, "Failed to create backup",
			logger.String("site_id", siteID),
			logger.String("name", req.Name),
			logger.Err(err))
		
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Site not found", http.StatusNotFound)
			return
		}
		
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(backup)
}

// GetBackup handles GET /api/backups/{id}
func (bh *BackupHandler) GetBackup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get backup ID from URL
	vars := mux.Vars(r)
	backupID := vars["id"]
	if backupID == "" {
		http.Error(w, "Backup ID is required", http.StatusBadRequest)
		return
	}

	backup, err := bh.backupService.GetBackup(ctx, backupID)
	if err != nil {
		bh.logger.Error(ctx, "Failed to get backup",
			logger.String("backup_id", backupID),
			logger.Err(err))
		
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Backup not found", http.StatusNotFound)
			return
		}
		
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(backup)
}

// RestoreBackup handles POST /api/backups/{id}/restore
func (bh *BackupHandler) RestoreBackup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get backup ID from URL
	vars := mux.Vars(r)
	backupID := vars["id"]
	if backupID == "" {
		http.Error(w, "Backup ID is required", http.StatusBadRequest)
		return
	}

	// Start restore
	restore, err := bh.backupService.RestoreBackup(ctx, backupID)
	if err != nil {
		bh.logger.Error(ctx, "Failed to start restore",
			logger.String("backup_id", backupID),
			logger.Err(err))
		
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Backup not found", http.StatusNotFound)
			return
		}
		
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(restore)
}

// DeleteBackup handles DELETE /api/backups/{id}/delete
func (bh *BackupHandler) DeleteBackup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get backup ID from URL
	vars := mux.Vars(r)
	backupID := vars["id"]
	if backupID == "" {
		http.Error(w, "Backup ID is required", http.StatusBadRequest)
		return
	}

	// Delete backup
	if err := bh.backupService.DeleteBackup(ctx, backupID); err != nil {
		bh.logger.Error(ctx, "Failed to delete backup",
			logger.String("backup_id", backupID),
			logger.Err(err))
		
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Backup not found", http.StatusNotFound)
			return
		}
		
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Backup deleted successfully",
		"backup_id": backupID,
	})
}