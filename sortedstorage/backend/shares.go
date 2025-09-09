package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// StorageShare represents a share for cloud storage objects
type StorageShare struct {
	ID                string         `gorm:"type:uuid;primaryKey" json:"id"`
	ObjectID          string         `gorm:"type:uuid;index;not null" json:"object_id"`
	ShareToken        string         `gorm:"type:varchar(255);unique;index" json:"share_token"`
	CreatedBy         string         `gorm:"type:uuid;index;not null" json:"created_by"`
	SharedWithUserID  sql.NullString `gorm:"type:uuid;index" json:"shared_with_user_id,omitempty"`
	SharedWithEmail   sql.NullString `gorm:"type:varchar(255);index" json:"shared_with_email,omitempty"`
	PermissionLevel   string         `gorm:"type:varchar(50);not null;default:'view'" json:"permission_level"`
	InheritToChildren bool           `gorm:"default:false" json:"inherit_to_children"`
	IsPublic          bool           `gorm:"default:false;index" json:"is_public"`
	ExpiresAt         *time.Time     `gorm:"index" json:"expires_at,omitempty"`
	AccessedCount     int            `gorm:"default:0" json:"accessed_count"`
	LastAccessedAt    *time.Time     `json:"last_accessed_at,omitempty"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
}

// TableName specifies the table name for GORM
func (StorageShare) TableName() string {
	return "ext_cloudstorage_storage_shares"
}

// SharesHandler handles share-related requests
type SharesHandler struct {
	db *gorm.DB
}

// NewSharesHandler creates a new shares handler
func NewSharesHandler(db *gorm.DB) *SharesHandler {
	// Auto-migrate the shares table
	db.AutoMigrate(&StorageShare{})
	return &SharesHandler{db: db}
}

// RegisterRoutes registers the share routes
func (h *SharesHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/shares", h.handleShares).Methods("GET", "POST")
	router.HandleFunc("/api/shares/{id}", h.handleShareByID).Methods("GET", "DELETE")
}

// handleShares handles listing and creating shares
func (h *SharesHandler) handleShares(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID := r.Context().Value("user_id")
	if userID == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userIDStr := userID.(string)

	switch r.Method {
	case "GET":
		h.listShares(w, r, userIDStr)
	case "POST":
		h.createShare(w, r, userIDStr)
	}
}

// listShares lists all shares for the current user
func (h *SharesHandler) listShares(w http.ResponseWriter, r *http.Request, userID string) {
	var shares []StorageShare
	
	// Get shares created by this user
	if err := h.db.Where("created_by = ?", userID).Find(&shares).Error; err != nil {
		http.Error(w, "Failed to fetch shares", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(shares)
}

// createShare creates a new share
func (h *SharesHandler) createShare(w http.ResponseWriter, r *http.Request, userID string) {

	var req struct {
		ObjectID          string     `json:"object_id"`
		SharedWithUserID  string     `json:"shared_with_user_id,omitempty"`
		SharedWithEmail   string     `json:"shared_with_email,omitempty"`
		PermissionLevel   string     `json:"permission_level"`
		InheritToChildren bool       `json:"inherit_to_children"`
		IsPublic          bool       `json:"is_public"`
		ExpiresAt         *time.Time `json:"expires_at,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create the share
	share := StorageShare{
		ID:                uuid.New().String(),
		ObjectID:          req.ObjectID,
		ShareToken:        generateShareToken(),
		CreatedBy:         userID,
		PermissionLevel:   req.PermissionLevel,
		InheritToChildren: req.InheritToChildren,
		IsPublic:          req.IsPublic,
		ExpiresAt:         req.ExpiresAt,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if req.SharedWithUserID != "" {
		share.SharedWithUserID = sql.NullString{String: req.SharedWithUserID, Valid: true}
	}
	if req.SharedWithEmail != "" {
		share.SharedWithEmail = sql.NullString{String: req.SharedWithEmail, Valid: true}
	}

	// Default permission level
	if share.PermissionLevel == "" {
		share.PermissionLevel = "view"
	}

	// Save to database
	if err := h.db.Create(&share).Error; err != nil {
		http.Error(w, fmt.Sprintf("Failed to create share: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(share)
}

// handleShareByID handles getting or deleting a specific share
func (h *SharesHandler) handleShareByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	shareID := vars["id"]

	// Get user ID from context
	userID := r.Context().Value("user_id")
	if userID == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userIDStr := userID.(string)

	switch r.Method {
	case "GET":
		h.getShare(w, r, shareID, userIDStr)
	case "DELETE":
		h.deleteShare(w, r, shareID, userIDStr)
	}
}

// getShare gets a specific share
func (h *SharesHandler) getShare(w http.ResponseWriter, r *http.Request, shareID, userID string) {
	var share StorageShare
	
	// Find share by ID or token, owned by user
	if err := h.db.Where("(id = ? OR share_token = ?) AND created_by = ?", shareID, shareID, userID).First(&share).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Share not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch share", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(share)
}

// deleteShare deletes a share
func (h *SharesHandler) deleteShare(w http.ResponseWriter, r *http.Request, shareID, userID string) {
	// Delete share owned by user
	result := h.db.Where("(id = ? OR share_token = ?) AND created_by = ?", shareID, shareID, userID).Delete(&StorageShare{})
	
	if result.Error != nil {
		http.Error(w, "Failed to delete share", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Share not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// generateShareToken generates a unique share token
func generateShareToken() string {
	return uuid.New().String()
}