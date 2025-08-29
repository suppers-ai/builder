package web

import (
	"net/http"
	
	"github.com/suppers-ai/dufflebagbase/services"
)

// GetSystemMetrics returns system metrics as JSON
func GetSystemMetrics(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Metrics service not implemented yet
		http.Error(w, "Metrics service not available", http.StatusServiceUnavailable)
		return
	}
}