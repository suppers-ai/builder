package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	auth "github.com/suppers-ai/auth"
	"github.com/suppers-ai/solobase/services"
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
		user := r.Context().Value("user").(*auth.User)
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
		user := r.Context().Value("user").(*auth.User)
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

// HandleGetSetting gets a single setting by key
func HandleGetSetting(settingsService *services.SettingsService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		key := vars["key"]

		value, err := settingsService.GetSetting(key)
		if err != nil {
			respondWithError(w, http.StatusNotFound, "Setting not found")
			return
		}

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"key":   key,
			"value": value,
		})
	}
}

// HandleSetSetting creates or updates a single setting
func HandleSetSetting(settingsService *services.SettingsService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if user is admin
		userVal := r.Context().Value("user")
		if userVal != nil {
			user := userVal.(*auth.User)
			if user.Role != "admin" {
				respondWithError(w, http.StatusForbidden, "Insufficient permissions")
				return
			}
		}

		var req struct {
			Key   string      `json:"key"`
			Value interface{} `json:"value"`
			Type  string      `json:"type,omitempty"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if req.Key == "" {
			respondWithError(w, http.StatusBadRequest, "Setting key is required")
			return
		}

		if err := settingsService.SetSetting(req.Key, req.Value); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to update setting")
			return
		}

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"key":     req.Key,
			"value":   req.Value,
		})
	}
}