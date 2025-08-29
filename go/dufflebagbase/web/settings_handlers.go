package web

import (
	"net/http"
	"os"
	"strconv"

	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/views/pages"
)

// SettingsPage renders the settings page
func SettingsPage(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		userEmail, _ := h.GetUserEmail(r)
		
		// Get environment settings
		appName := getEnv("APP_NAME", "DuffleBagBase")
		appVersion := getEnv("APP_VERSION", "1.0.0")
		environment := getEnv("ENVIRONMENT", "development")
		
		// Database settings
		dbHost := getEnv("DATABASE_HOST", "localhost")
		dbName := getEnv("DATABASE_NAME", "dufflebagbase")
		
		// Storage settings
		s3Endpoint := getEnv("S3_ENDPOINT", "localhost:9000")
		s3Bucket := getEnv("S3_BUCKET", "default")
		
		// Email settings
		smtpHost := getEnv("SMTP_HOST", "localhost")
		smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "1025"))
		
		// Feature flags
		enableSignup := getEnv("ENABLE_SIGNUP", "true") == "true"
		enableAPI := getEnv("ENABLE_API", "true") == "true"
		
		// Rate limiting
		rateLimitEnabled := getEnv("RATE_LIMIT_ENABLED", "true") == "true"
		rateLimitRPM, _ := strconv.Atoi(getEnv("RATE_LIMIT_RPM", "60"))
		
		// Logging
		logLevel := getEnv("LOG_LEVEL", "INFO")
		
		// Maintenance
		maintenanceMode := getEnv("MAINTENANCE_MODE", "false") == "true"
		
		data := pages.SettingsData{
			UserEmail:        userEmail,
			AppName:          appName,
			AppVersion:       appVersion,
			Environment:      environment,
			DatabaseHost:     dbHost,
			DatabaseName:     dbName,
			S3Endpoint:       s3Endpoint,
			S3Bucket:         s3Bucket,
			SMTPHost:         smtpHost,
			SMTPPort:         smtpPort,
			EnableSignup:     enableSignup,
			EnableAPI:        enableAPI,
			RateLimitEnabled: rateLimitEnabled,
			RateLimitRPM:     rateLimitRPM,
			LogLevel:         logLevel,
			MaintenanceMode:  maintenanceMode,
		}
		
		// Render with HTMX support
		h.RenderWithHTMX(w, r, pages.SettingsPage(data), pages.SettingsPartial(data))
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}