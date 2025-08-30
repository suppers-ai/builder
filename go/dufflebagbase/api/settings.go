package api

import (
	"encoding/json"
	"net/http"

	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/dufflebagbase/services"
)

type AppSettings struct {
	AppName                   string `json:"app_name"`
	AppURL                    string `json:"app_url"`
	AllowSignup               bool   `json:"allow_signup"`
	RequireEmailConfirmation  bool   `json:"require_email_confirmation"`
	SMTPEnabled               bool   `json:"smtp_enabled"`
	SMTPHost                  string `json:"smtp_host,omitempty"`
	SMTPPort                  int    `json:"smtp_port,omitempty"`
	SMTPUser                  string `json:"smtp_user,omitempty"`
	StorageProvider           string `json:"storage_provider"`
	S3Bucket                  string `json:"s3_bucket,omitempty"`
	S3Region                  string `json:"s3_region,omitempty"`
}

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