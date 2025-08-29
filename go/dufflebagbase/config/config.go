package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/suppers-ai/dufflebagbase/utils"
)

type Config struct {
	// Server
	Port        string
	Environment string

	// Database
	DatabaseType     string // "postgres" or "sqlite"
	DatabaseURL      string
	DatabaseHost     string
	DatabasePort     int
	DatabaseName     string
	DatabaseUser     string
	DatabasePassword string
	DatabaseSSLMode  string

	// Storage
	StorageType      string
	S3Endpoint       string
	S3AccessKey      string
	S3SecretKey      string
	S3Bucket         string
	S3Region         string
	S3UseSSL         bool
	LocalStoragePath string

	// Mail
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	SMTPFrom     string
	SMTPUseTLS   bool

	// Auth
	JWTSecret     string
	SessionSecret string
	EnableSignup  bool
	EnableAPI     bool

	// Admin
	AdminEmail    string
	AdminPassword string

	// Logging
	LogLevel string

	// CORS
	CORSAllowedOrigins []string
	CORSAllowedMethods []string
	CORSAllowedHeaders []string

	// Rate limiting
	RateLimitEnabled           bool
	RateLimitRequestsPerMinute int
}

func Load() *Config {
	cfg := &Config{
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),

		// Database
		DatabaseType: getEnv("DATABASE_TYPE", "sqlite"), // Default to SQLite for development
		DatabaseURL: getEnv("DATABASE_URL", ""),

		// Storage
		StorageType:      getEnv("STORAGE_TYPE", "local"),
		S3Endpoint:       getEnv("S3_ENDPOINT", ""),
		S3AccessKey:      getEnv("S3_ACCESS_KEY", ""),
		S3SecretKey:      getEnv("S3_SECRET_KEY", ""),
		S3Bucket:         getEnv("S3_BUCKET", "dufflebagbase"),
		S3Region:         getEnv("S3_REGION", "us-east-1"),
		S3UseSSL:         getEnvBool("S3_USE_SSL", false),
		LocalStoragePath: getEnv("LOCAL_STORAGE_PATH", "./.data/storage"),

		// Mail
		SMTPHost:     getEnv("SMTP_HOST", "localhost"),
		SMTPPort:     getEnvInt("SMTP_PORT", 1025),
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@dufflebagbase.local"),
		SMTPUseTLS:   getEnvBool("SMTP_USE_TLS", false),

		// Auth - Generate secure secrets if not provided
		JWTSecret:     getSecureSecret("JWT_SECRET"),
		SessionSecret: getSecureSecret("SESSION_SECRET"),
		EnableSignup:  getEnvBool("ENABLE_SIGNUP", true),
		EnableAPI:     getEnvBool("ENABLE_API", true),

		// Admin - Require secure password
		AdminEmail:    getEnv("DEFAULT_ADMIN_EMAIL", "admin@example.com"),
		AdminPassword: getSecureAdminPassword(),

		// Logging
		LogLevel: getEnv("LOG_LEVEL", "INFO"),

		// CORS
		CORSAllowedOrigins: getEnvSlice("CORS_ALLOWED_ORIGINS", []string{"*"}),
		CORSAllowedMethods: getEnvSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}),
		CORSAllowedHeaders: getEnvSlice("CORS_ALLOWED_HEADERS", []string{"Content-Type", "Authorization"}),

		// Rate limiting
		RateLimitEnabled:           getEnvBool("RATE_LIMIT_ENABLED", true),
		RateLimitRequestsPerMinute: getEnvInt("RATE_LIMIT_REQUESTS_PER_MINUTE", 60),
	}

	// Parse database configuration based on type
	if cfg.DatabaseType == "sqlite" {
		// For SQLite, DATABASE_URL is the file path
		if cfg.DatabaseURL == "" {
			cfg.DatabaseURL = getEnv("SQLITE_PATH", "./.data/dufflebag.db")
		}
	} else if cfg.DatabaseType == "postgres" || cfg.DatabaseType == "postgresql" {
		// Parse PostgreSQL DATABASE_URL if provided
		if cfg.DatabaseURL != "" {
			parseDatabaseURL(cfg)
		} else {
			cfg.DatabaseHost = getEnv("DATABASE_HOST", "localhost")
			cfg.DatabasePort = getEnvInt("DATABASE_PORT", 5432)
			cfg.DatabaseName = getEnv("DATABASE_NAME", "dufflebagbase")
			cfg.DatabaseUser = getEnv("DATABASE_USER", "dufflebag")
			cfg.DatabasePassword = getEnv("DATABASE_PASSWORD", "dufflebag123")
			cfg.DatabaseSSLMode = getEnv("DATABASE_SSLMODE", "disable")
		}
	}

	return cfg
}

func parseDatabaseURL(cfg *Config) {
	// Simple parsing of postgres://user:pass@host:port/db?sslmode=disable
	url := cfg.DatabaseURL

	// Remove postgres:// prefix
	url = strings.TrimPrefix(url, "postgres://")
	url = strings.TrimPrefix(url, "postgresql://")

	// Split by @
	parts := strings.Split(url, "@")
	if len(parts) != 2 {
		return
	}

	// Parse user:pass
	userPass := strings.Split(parts[0], ":")
	if len(userPass) == 2 {
		cfg.DatabaseUser = userPass[0]
		cfg.DatabasePassword = userPass[1]
	}

	// Parse host:port/db?params
	hostPart := parts[1]

	// Extract params
	if idx := strings.Index(hostPart, "?"); idx != -1 {
		params := hostPart[idx+1:]
		hostPart = hostPart[:idx]

		// Parse params
		for _, param := range strings.Split(params, "&") {
			kv := strings.Split(param, "=")
			if len(kv) == 2 && kv[0] == "sslmode" {
				cfg.DatabaseSSLMode = kv[1]
			}
		}
	}

	// Parse host:port/db
	if idx := strings.LastIndex(hostPart, "/"); idx != -1 {
		cfg.DatabaseName = hostPart[idx+1:]
		hostPart = hostPart[:idx]
	}

	// Parse host:port
	if idx := strings.LastIndex(hostPart, ":"); idx != -1 {
		cfg.DatabaseHost = hostPart[:idx]
		if port, err := strconv.Atoi(hostPart[idx+1:]); err == nil {
			cfg.DatabasePort = port
		}
	} else {
		cfg.DatabaseHost = hostPart
		cfg.DatabasePort = 5432
	}

	if cfg.DatabaseSSLMode == "" {
		cfg.DatabaseSSLMode = "disable"
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if i, err := strconv.Atoi(value); err == nil {
			return i
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if b, err := strconv.ParseBool(value); err == nil {
			return b
		}
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}
	return defaultValue
}

// getSecureSecret generates a secure secret if not provided via environment
func getSecureSecret(key string) string {
	if value := os.Getenv(key); value != "" {
		// Warn if using weak defaults
		if value == "your-super-secret-jwt-key" || value == "your-session-secret" {
			log.Printf("WARNING: Using weak default for %s. This is insecure for production!\n", key)
		}
		return value
	}

	// Generate secure secret
	secret, err := utils.GenerateSecureToken(32)
	if err != nil {
		log.Fatalf("Failed to generate secure secret for %s: %v\n", key, err)
	}

	log.Printf("Generated secure secret for %s. Save this in your environment: %s=%s\n", key, key, secret)
	return secret
}

// getSecureAdminPassword requires admin password to be set or generates one
func getSecureAdminPassword() string {
	password := os.Getenv("DEFAULT_ADMIN_PASSWORD")

	if password == "" {
		// Generate secure password
		generated, err := utils.GenerateSecurePassword()
		if err != nil {
			log.Fatalf("Failed to generate secure admin password: %v\n", err)
		}
		password = generated
		log.Printf("\n"+
			"========================================\n"+
			"IMPORTANT: Generated admin credentials:\n"+
			"Email: %s\n"+
			"Password: %s\n"+
			"Save these credentials securely!\n"+
			"Set DEFAULT_ADMIN_PASSWORD environment variable to use a custom password.\n"+
			"========================================\n",
			getEnv("DEFAULT_ADMIN_EMAIL", "admin@example.com"),
			password)
		return password
	}

	// Validate existing password strength
	if err := utils.ValidatePasswordStrength(password); err != nil {
		if password == "admin123" || password == "password" || password == "admin" {
			log.Fatalf("SECURITY ERROR: The admin password '%s' is too weak and commonly used.\n"+
				"Please set DEFAULT_ADMIN_PASSWORD to a strong password (12+ chars with mixed case, numbers, and symbols).\n", password)
		}
		log.Printf("WARNING: Admin password does not meet security requirements: %v\n", err)
	}

	return password
}
