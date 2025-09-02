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

// SiteHandler handles site-related HTTP requests
type SiteHandler struct {
	manager *services.HugoManager
	logger  core.ExtensionLogger
}

// NewSiteHandler creates a new site handler
func NewSiteHandler(manager *services.HugoManager, logger core.ExtensionLogger) *SiteHandler {
	return &SiteHandler{
		manager: manager,
		logger:  logger,
	}
}

// ListSites handles GET /api/sites
func (sh *SiteHandler) ListSites(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get user ID from context (set by auth middleware)
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	sites, err := sh.manager.ListSites(ctx, userID)
	if err != nil {
		sh.logger.Error(ctx, "Failed to list sites", logger.Err(err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sites)
}

// CreateSite handles POST /api/sites/create
func (sh *SiteHandler) CreateSite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get user ID from context
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse request body
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Theme       string `json:"theme"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		http.Error(w, "Site name is required", http.StatusBadRequest)
		return
	}

	// Create site
	site, err := sh.manager.CreateSite(ctx, userID, req.Name, req.Description, req.Theme)
	if err != nil {
		sh.logger.Error(ctx, "Failed to create site", 
			logger.String("user_id", userID),
			logger.String("name", req.Name),
			logger.Err(err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(site)
}

// GetSite handles GET /api/sites/{id}
func (sh *SiteHandler) GetSite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get site ID from URL
	vars := mux.Vars(r)
	siteID := vars["id"]
	if siteID == "" {
		http.Error(w, "Site ID is required", http.StatusBadRequest)
		return
	}

	site, err := sh.manager.GetSite(ctx, siteID)
	if err != nil {
		sh.logger.Error(ctx, "Failed to get site",
			logger.String("site_id", siteID),
			logger.Err(err))
		
		// Check if site not found
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Site not found", http.StatusNotFound)
			return
		}
		
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(site)
}

// UpdateSite handles PUT /api/sites/{id}/update
func (sh *SiteHandler) UpdateSite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get site ID from URL
	vars := mux.Vars(r)
	siteID := vars["id"]
	if siteID == "" {
		http.Error(w, "Site ID is required", http.StatusBadRequest)
		return
	}

	// Parse request body
	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update site
	if err := sh.manager.UpdateSite(ctx, siteID, updates); err != nil {
		sh.logger.Error(ctx, "Failed to update site",
			logger.String("site_id", siteID),
			logger.Err(err))
		
		// Check if site not found
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Site not found", http.StatusNotFound)
			return
		}
		
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Site updated successfully",
		"site_id": siteID,
	})
}

// DeleteSite handles DELETE /api/sites/{id}/delete
func (sh *SiteHandler) DeleteSite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get site ID from URL
	vars := mux.Vars(r)
	siteID := vars["id"]
	if siteID == "" {
		http.Error(w, "Site ID is required", http.StatusBadRequest)
		return
	}

	// Delete site
	if err := sh.manager.DeleteSite(ctx, siteID); err != nil {
		sh.logger.Error(ctx, "Failed to delete site",
			logger.String("site_id", siteID),
			logger.Err(err))
		
		// Check if site not found
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Site not found", http.StatusNotFound)
			return
		}
		
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Site deleted successfully",
		"site_id": siteID,
	})
}