package handlers

import (
	"encoding/json"
	"net/http"
)

// Health check handler
func Health() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "healthy",
			"service": "dufflebagbase",
			"version": "1.0.0",
		})
	}
}