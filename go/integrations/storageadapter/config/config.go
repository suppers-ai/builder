package config

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/suppers-ai/database"
	"github.com/suppers-ai/storageadapter"
	"github.com/suppers-ai/storageadapter/metadata"
	"github.com/suppers-ai/storageadapter/storage"
)

// Config contains the configuration for the storage adapter
type Config struct {
	// Database configuration
	DatabaseURL string

	// S3 configuration
	S3Region          string
	S3Bucket          string
	S3Endpoint        string // Optional: for S3-compatible services
	S3AccessKeyID     string
	S3SecretAccessKey string
	S3UsePathStyle    bool // For S3-compatible services like MinIO

	// Application configuration
	ShareBaseURL string // Base URL for generating share links
}

// NewFromEnv creates a new configuration from environment variables
func NewFromEnv() *Config {
	return &Config{
		DatabaseURL:       getEnv("DATABASE_URL", "postgresql://localhost/storageadapter?sslmode=disable"),
		S3Region:          getEnv("S3_REGION", "us-east-1"),
		S3Bucket:          getEnv("S3_BUCKET", ""),
		S3Endpoint:        getEnv("S3_ENDPOINT", ""),
		S3AccessKeyID:     getEnv("S3_ACCESS_KEY_ID", getEnv("AWS_ACCESS_KEY_ID", "")),
		S3SecretAccessKey: getEnv("S3_SECRET_ACCESS_KEY", getEnv("AWS_SECRET_ACCESS_KEY", "")),
		S3UsePathStyle:    getEnvBool("S3_USE_PATH_STYLE", false),
		ShareBaseURL:      getEnv("SHARE_BASE_URL", "https://storage.example.com"),
	}
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if c.S3Bucket == "" {
		return fmt.Errorf("S3_BUCKET is required")
	}
	if c.S3Region == "" && c.S3Endpoint == "" {
		return fmt.Errorf("either S3_REGION or S3_ENDPOINT must be set")
	}
	return nil
}

// InitializeAdapter initializes the storage adapter with the given configuration
func InitializeAdapter(cfg *Config) (*storageadapter.StorageAdapter, error) {
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	// Parse database URL to extract connection parameters
	dbConfig, err := parseDatabaseURL(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Initialize database using the database package
	db, err := database.New("postgres")
	if err != nil {
		return nil, fmt.Errorf("failed to create database instance: %w", err)
	}

	// Connect to database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.Connect(ctx, dbConfig); err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test database connection
	if err := db.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Initialize metadata store
	metadataStore := metadata.NewPostgreSQLMetadataStore(db)

	// Initialize S3 file storage
	s3Config := &storage.S3Config{
		Region:          cfg.S3Region,
		Bucket:          cfg.S3Bucket,
		Endpoint:        cfg.S3Endpoint,
		AccessKeyID:     cfg.S3AccessKeyID,
		SecretAccessKey: cfg.S3SecretAccessKey,
		UsePathStyle:    cfg.S3UsePathStyle,
	}

	store, err := storage.NewS3FileStorage(s3Config)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize S3 storage: %w", err)
	}

	// Create storage adapter
	adapter := storageadapter.New(store, metadataStore)

	return adapter, nil
}

// Helper functions

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value == "true" || value == "1" || value == "yes"
}

// parseDatabaseURL parses a PostgreSQL connection URL into a database Config
func parseDatabaseURL(dbURL string) (database.Config, error) {
	// Parse PostgreSQL URL
	// Format: postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]
	
	// For simplicity, we'll parse the most common format
	// A more robust solution would use url.Parse and handle all cases
	
	config := database.Config{
		Driver:          "postgres",
		Host:            "localhost",
		Port:            5432,
		Database:        "storageadapter",
		Username:        "postgres",
		Password:        "",
		SSLMode:         "disable",
		MaxOpenConns:    25,
		MaxIdleConns:    5,
		ConnMaxLifetime: time.Hour,
		Extra:           make(map[string]interface{}),
	}
	
	// Simple extraction for common URLs like:
	// postgresql://localhost/storageadapter?sslmode=disable
	// postgresql://user:pass@host:port/database?sslmode=disable
	
	if dbURL == "" {
		return config, fmt.Errorf("empty database URL")
	}
	
	// Remove postgresql:// or postgres:// prefix
	if len(dbURL) > 13 && dbURL[:13] == "postgresql://" {
		dbURL = dbURL[13:]
	} else if len(dbURL) > 11 && dbURL[:11] == "postgres://" {
		dbURL = dbURL[11:]
	}
	
	// Split by ? to separate connection part from parameters
	parts := strings.Split(dbURL, "?")
	connPart := parts[0]
	
	// Parse parameters if present
	if len(parts) > 1 {
		params := strings.Split(parts[1], "&")
		for _, param := range params {
			kv := strings.Split(param, "=")
			if len(kv) == 2 {
				if kv[0] == "sslmode" {
					config.SSLMode = kv[1]
				} else {
					config.Extra[kv[0]] = kv[1]
				}
			}
		}
	}
	
	// Parse connection part
	// Check if it contains @ (has user info)
	if strings.Contains(connPart, "@") {
		userHost := strings.Split(connPart, "@")
		userInfo := userHost[0]
		hostInfo := userHost[1]
		
		// Parse user info
		if strings.Contains(userInfo, ":") {
			userPass := strings.Split(userInfo, ":")
			config.Username = userPass[0]
			if len(userPass) > 1 {
				config.Password = userPass[1]
			}
		} else {
			config.Username = userInfo
		}
		
		// Parse host info
		if strings.Contains(hostInfo, "/") {
			hostDB := strings.Split(hostInfo, "/")
			hostPort := hostDB[0]
			config.Database = hostDB[1]
			
			if strings.Contains(hostPort, ":") {
				hp := strings.Split(hostPort, ":")
				config.Host = hp[0]
				if port, err := strconv.Atoi(hp[1]); err == nil {
					config.Port = port
				}
			} else {
				config.Host = hostPort
			}
		}
	} else {
		// No user info, just host/database
		if strings.Contains(connPart, "/") {
			hostDB := strings.Split(connPart, "/")
			hostPort := hostDB[0]
			if len(hostDB) > 1 {
				config.Database = hostDB[1]
			}
			
			if strings.Contains(hostPort, ":") {
				hp := strings.Split(hostPort, ":")
				config.Host = hp[0]
				if port, err := strconv.Atoi(hp[1]); err == nil {
					config.Port = port
				}
			} else if hostPort != "" {
				config.Host = hostPort
			}
		}
	}
	
	return config, nil
}