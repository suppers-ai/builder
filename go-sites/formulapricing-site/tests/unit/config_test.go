package unit

import (
	"os"
	"testing"

	"github.com/suppers-ai/formulapricing-site/config"
)

func TestConfigLoad(t *testing.T) {
	// Save original environment
	originalPort := os.Getenv("PORT")
	originalEnv := os.Getenv("ENVIRONMENT")
	originalLogLevel := os.Getenv("LOG_LEVEL")
	originalStaticPath := os.Getenv("STATIC_PATH")

	// Clean up after test
	defer func() {
		os.Setenv("PORT", originalPort)
		os.Setenv("ENVIRONMENT", originalEnv)
		os.Setenv("LOG_LEVEL", originalLogLevel)
		os.Setenv("STATIC_PATH", originalStaticPath)
	}()

	// Test default values
	os.Unsetenv("PORT")
	os.Unsetenv("ENVIRONMENT")
	os.Unsetenv("LOG_LEVEL")
	os.Unsetenv("STATIC_PATH")

	cfg := config.Load()

	if cfg.Port != "8080" {
		t.Errorf("Expected default port 8080, got %s", cfg.Port)
	}

	if cfg.Environment != "development" {
		t.Errorf("Expected default environment 'development', got %s", cfg.Environment)
	}

	if cfg.LogLevel != "INFO" {
		t.Errorf("Expected default log level 'INFO', got %s", cfg.LogLevel)
	}

	if cfg.StaticPath != "./static" {
		t.Errorf("Expected default static path './static', got %s", cfg.StaticPath)
	}
}

func TestConfigLoadWithEnvironmentVariables(t *testing.T) {
	// Save original environment
	originalPort := os.Getenv("PORT")
	originalEnv := os.Getenv("ENVIRONMENT")
	originalLogLevel := os.Getenv("LOG_LEVEL")
	originalStaticPath := os.Getenv("STATIC_PATH")

	// Clean up after test
	defer func() {
		os.Setenv("PORT", originalPort)
		os.Setenv("ENVIRONMENT", originalEnv)
		os.Setenv("LOG_LEVEL", originalLogLevel)
		os.Setenv("STATIC_PATH", originalStaticPath)
	}()

	// Set test environment variables
	os.Setenv("PORT", "3000")
	os.Setenv("ENVIRONMENT", "production")
	os.Setenv("LOG_LEVEL", "debug")
	os.Setenv("STATIC_PATH", "/custom/static")

	cfg := config.Load()

	if cfg.Port != "3000" {
		t.Errorf("Expected port 3000, got %s", cfg.Port)
	}

	if cfg.Environment != "production" {
		t.Errorf("Expected environment 'production', got %s", cfg.Environment)
	}

	if cfg.LogLevel != "debug" {
		t.Errorf("Expected log level 'debug', got %s", cfg.LogLevel)
	}

	if cfg.StaticPath != "/custom/static" {
		t.Errorf("Expected static path '/custom/static', got %s", cfg.StaticPath)
	}
}

func TestConfigValidation(t *testing.T) {
	// Save original environment
	originalPort := os.Getenv("PORT")
	originalEnv := os.Getenv("ENVIRONMENT")
	originalLogLevel := os.Getenv("LOG_LEVEL")

	// Clean up after test
	defer func() {
		os.Setenv("PORT", originalPort)
		os.Setenv("ENVIRONMENT", originalEnv)
		os.Setenv("LOG_LEVEL", originalLogLevel)
	}()

	// Test valid environments
	validEnvironments := []string{"development", "production", "staging", "test"}
	for _, env := range validEnvironments {
		os.Setenv("ENVIRONMENT", env)
		cfg := config.Load()
		if cfg.Environment != env {
			t.Errorf("Expected environment %s, got %s", env, cfg.Environment)
		}
	}

	// Test valid log levels
	validLogLevels := []string{"debug", "info", "warn", "error"}
	for _, level := range validLogLevels {
		os.Setenv("LOG_LEVEL", level)
		cfg := config.Load()
		if cfg.LogLevel != level {
			t.Errorf("Expected log level %s, got %s", level, cfg.LogLevel)
		}
	}
}

func TestConfigPortValidation(t *testing.T) {
	// Save original environment
	originalPort := os.Getenv("PORT")

	// Clean up after test
	defer func() {
		os.Setenv("PORT", originalPort)
	}()

	// Test valid port numbers
	validPorts := []string{"80", "443", "8080", "3000", "5000"}
	for _, port := range validPorts {
		os.Setenv("PORT", port)
		cfg := config.Load()
		if cfg.Port != port {
			t.Errorf("Expected port %s, got %s", port, cfg.Port)
		}
	}

	// Test empty port (should use default)
	os.Setenv("PORT", "")
	cfg := config.Load()
	if cfg.Port != "8080" {
		t.Errorf("Expected default port 8080 for empty PORT, got %s", cfg.Port)
	}
}
