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

// BuildHandler handles build-related HTTP requests
type BuildHandler struct {
	buildService *services.BuildService
	logger       core.ExtensionLogger
}

// NewBuildHandler creates a new build handler
func NewBuildHandler(buildService *services.BuildService, logger core.ExtensionLogger) *BuildHandler {
	return &BuildHandler{
		buildService: buildService,
		logger:       logger,
	}
}

// BuildSite handles POST /api/sites/{id}/build
func (bh *BuildHandler) BuildSite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get site ID from URL
	vars := mux.Vars(r)
	siteID := vars["id"]
	if siteID == "" {
		http.Error(w, "Site ID is required", http.StatusBadRequest)
		return
	}

	// Start build
	build, err := bh.buildService.BuildSite(ctx, siteID)
	if err != nil {
		bh.logger.Error(ctx, "Failed to start build",
			logger.String("site_id", siteID),
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
	json.NewEncoder(w).Encode(build)
}

// ListBuilds handles GET /api/sites/{id}/builds
func (bh *BuildHandler) ListBuilds(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get site ID from URL
	vars := mux.Vars(r)
	siteID := vars["id"]
	if siteID == "" {
		http.Error(w, "Site ID is required", http.StatusBadRequest)
		return
	}

	builds, err := bh.buildService.ListBuilds(ctx, siteID)
	if err != nil {
		bh.logger.Error(ctx, "Failed to list builds",
			logger.String("site_id", siteID),
			logger.Err(err))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(builds)
}

// GetBuild handles GET /api/builds/{id}
func (bh *BuildHandler) GetBuild(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	// Get build ID from URL
	vars := mux.Vars(r)
	buildID := vars["id"]
	if buildID == "" {
		http.Error(w, "Build ID is required", http.StatusBadRequest)
		return
	}

	build, err := bh.buildService.GetBuild(ctx, buildID)
	if err != nil {
		bh.logger.Error(ctx, "Failed to get build",
			logger.String("build_id", buildID),
			logger.Err(err))
		
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Build not found", http.StatusNotFound)
			return
		}
		
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(build)
}