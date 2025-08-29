package config

import (
	"os"
	"strconv"
)

type Config struct {
	// Server
	Port        string
	Environment string

	// Logging
	LogLevel string

	// Static assets
	StaticPath string

	// Performance settings
	ReadTimeout    int // seconds
	WriteTimeout   int // seconds
	IdleTimeout    int // seconds
	MaxHeaderBytes int // bytes
	RequestTimeout int // seconds
	EnableMetrics  bool
}

func Load() *Config {
	cfg := &Config{
		Port:           getEnv("PORT", "8080"),
		Environment:    getEnv("ENVIRONMENT", "development"),
		LogLevel:       getEnv("LOG_LEVEL", "INFO"),
		StaticPath:     getEnv("STATIC_PATH", "./static"),
		ReadTimeout:    getEnvInt("READ_TIMEOUT", 15),
		WriteTimeout:   getEnvInt("WRITE_TIMEOUT", 15),
		IdleTimeout:    getEnvInt("IDLE_TIMEOUT", 60),
		MaxHeaderBytes: getEnvInt("MAX_HEADER_BYTES", 1048576), // 1MB
		RequestTimeout: getEnvInt("REQUEST_TIMEOUT", 30),
		EnableMetrics:  getEnvBool("ENABLE_METRICS", true),
	}

	return cfg
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
