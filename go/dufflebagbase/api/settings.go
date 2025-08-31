package api

import (
	"encoding/json"
	"net/http"

	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/dufflebagbase/services"
)

func HandleGetSettings(settingsService *services.SettingsService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		settings, err := settingsService.GetSettings()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to fetch settings")
			return
		}

		respondWithJSON(w, http.StatusOK, settings)
	}
}

func HandleUpdateSettings(settingsService *services.SettingsService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if user is admin
		user := r.Context().Value("user").(*models.User)
		if user.Role != "admin" {
			respondWithError(w, http.StatusForbidden, "Insufficient permissions")
			return
		}

		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		settings, err := settingsService.UpdateSettings(updates)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to update settings")
			return
		}

		respondWithJSON(w, http.StatusOK, settings)
	}
}

func HandleResetSettings(settingsService *services.SettingsService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if user is admin
		user := r.Context().Value("user").(*models.User)
		if user.Role != "admin" {
			respondWithError(w, http.StatusForbidden, "Insufficient permissions")
			return
		}

		if err := settingsService.ResetToDefaults(); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to reset settings")
			return
		}

		settings, err := settingsService.GetSettings()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to fetch settings after reset")
			return
		}

		respondWithJSON(w, http.StatusOK, settings)
	}
}