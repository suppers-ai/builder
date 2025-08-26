package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	// Server
	Port        string
	Environment string

	// Database
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
	JWTSecret      string
	SessionSecret  string
	EnableSignup   bool
	EnableAPI      bool

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
		DatabaseURL: getEnv("DATABASE_URL", ""),
		
		// Storage
		StorageType:    getEnv("STORAGE_TYPE", "local"),
		S3Endpoint:     getEnv("S3_ENDPOINT", ""),
		S3AccessKey:    getEnv("S3_ACCESS_KEY", ""),
		S3SecretKey:    getEnv("S3_SECRET_KEY", ""),
		S3Bucket:       getEnv("S3_BUCKET", "dufflebagbase"),
		S3Region:       getEnv("S3_REGION", "us-east-1"),
		S3UseSSL:       getEnvBool("S3_USE_SSL", false),
		LocalStoragePath: getEnv("LOCAL_STORAGE_PATH", "./storage"),

		// Mail
		SMTPHost:     getEnv("SMTP_HOST", "localhost"),
		SMTPPort:     getEnvInt("SMTP_PORT", 1025),
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@dufflebagbase.local"),
		SMTPUseTLS:   getEnvBool("SMTP_USE_TLS", false),

		// Auth
		JWTSecret:     getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		SessionSecret: getEnv("SESSION_SECRET", "your-session-secret"),
		EnableSignup:  getEnvBool("ENABLE_SIGNUP", true),
		EnableAPI:     getEnvBool("ENABLE_API", true),

		// Admin
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@dufflebagbase.local"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "admin123"),

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

	// Parse DATABASE_URL if provided
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