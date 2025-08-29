package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/suppers-ai/dufflebagbase/extensions/core"
	"github.com/suppers-ai/logger"
)

// TestExtension is a simple test extension
type TestExtension struct {
	services *core.ExtensionServices
	config   TestConfig
}

type TestConfig struct {
	Message string `json:"message"`
	Enabled bool   `json:"enabled"`
}

// NewTestExtension creates a new test extension
func NewTestExtension() core.Extension {
	return &TestExtension{}
}

func (e *TestExtension) Metadata() core.ExtensionMetadata {
	return core.ExtensionMetadata{
		Name:        "test-extension",
		Version:     "1.0.0",
		Description: "A test extension for end-to-end testing",
		Author:      "Test",
		License:     "MIT",
	}
}

func (e *TestExtension) Initialize(ctx context.Context, services *core.ExtensionServices) error {
	log.Println("TestExtension: Initializing")
	e.services = services
	return nil
}

func (e *TestExtension) Start(ctx context.Context) error {
	log.Println("TestExtension: Starting")
	return nil
}

func (e *TestExtension) Stop(ctx context.Context) error {
	log.Println("TestExtension: Stopping")
	return nil
}

func (e *TestExtension) Health(ctx context.Context) (*core.HealthStatus, error) {
	return &core.HealthStatus{
		Status:  "healthy",
		Message: "Test extension is healthy",
	}, nil
}

func (e *TestExtension) RegisterRoutes(router core.ExtensionRouter) error {
	router.HandleFunc("/test", e.handleTest)
	router.HandleFunc("/config", e.handleConfig)
	return nil
}

func (e *TestExtension) RegisterMiddleware() []core.MiddlewareRegistration {
	return []core.MiddlewareRegistration{
		{
			Extension: "test-extension",
			Name:      "test-logger",
			Priority:  10,
			Handler: func(next http.Handler) http.Handler {
				return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					log.Printf("TestExtension: Request to %s", r.URL.Path)
					next.ServeHTTP(w, r)
				})
			},
		},
	}
}

func (e *TestExtension) RegisterHooks() []core.HookRegistration {
	return []core.HookRegistration{
		{
			Extension: "test-extension",
			Name:      "test-pre-request",
			Type:      core.HookPreRequest,
			Priority:  10,
			Handler: func(ctx context.Context, hctx *core.HookContext) error {
				log.Println("TestExtension: Pre-request hook executed")
				hctx.Data["test-extension"] = "executed"
				return nil
			},
		},
	}
}

func (e *TestExtension) RegisterTemplates() []core.TemplateRegistration {
	return nil
}

func (e *TestExtension) RegisterStaticAssets() []core.StaticAssetRegistration {
	return nil
}

func (e *TestExtension) ConfigSchema() json.RawMessage {
	return json.RawMessage(`{
		"type": "object",
		"properties": {
			"message": {"type": "string"},
			"enabled": {"type": "boolean"}
		}
	}`)
}

func (e *TestExtension) ValidateConfig(config json.RawMessage) error {
	var cfg TestConfig
	if err := json.Unmarshal(config, &cfg); err != nil {
		return fmt.Errorf("invalid config format: %w", err)
	}
	return nil
}

func (e *TestExtension) ApplyConfig(config json.RawMessage) error {
	var cfg TestConfig
	if err := json.Unmarshal(config, &cfg); err != nil {
		return fmt.Errorf("invalid config format: %w", err)
	}
	e.config = cfg
	log.Printf("TestExtension: Config applied - Message: %s, Enabled: %v", cfg.Message, cfg.Enabled)
	return nil
}

func (e *TestExtension) DatabaseSchema() string {
	return "test_extension"
}

func (e *TestExtension) Migrations() []core.Migration {
	return []core.Migration{
		{
			Version:     "001",
			Description: "Create test table",
			Extension:   "test-extension",
			Up: `CREATE TABLE IF NOT EXISTS test_extension.test_data (
				id SERIAL PRIMARY KEY,
				data TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);`,
			Down: `DROP TABLE IF EXISTS test_extension.test_data;`,
		},
	}
}

func (e *TestExtension) RequiredPermissions() []core.Permission {
	return []core.Permission{
		{
			Name:        "test.read",
			Description: "Read test data",
			Resource:    "test",
			Actions:     []string{"read"},
		},
		{
			Name:        "test.write",
			Description: "Write test data",
			Resource:    "test",
			Actions:     []string{"write"},
		},
	}
}

// Route handlers
func (e *TestExtension) handleTest(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"message": e.config.Message,
		"enabled": e.config.Enabled,
		"status":  "ok",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (e *TestExtension) handleConfig(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(e.config)
	case http.MethodPost:
		var cfg TestConfig
		if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		e.config = cfg
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// Test function to register and enable the extension
func TestExtensionSystem() {
	// This function would be called in a test file
	testLogger, _ := logger.New(logger.Config{
		Level:  logger.LevelDebug,
		Output: "console",
		Format: "text",
	})
	services := &core.ExtensionServices{}
	registry := core.NewExtensionRegistry(testLogger, services)

	// Register the test extension
	testExt := NewTestExtension()
	if err := registry.Register(testExt); err != nil {
		log.Fatalf("Failed to register test extension: %v", err)
	}

	// Enable the extension
	if err := registry.Enable("test-extension"); err != nil {
		log.Fatalf("Failed to enable test extension: %v", err)
	}

	// Get status
	status, err := registry.GetStatus("test-extension")
	if err != nil {
		log.Fatalf("Failed to get status: %v", err)
	}

	log.Printf("Test extension status: %+v", status)

	// Test configuration
	config := json.RawMessage(`{"message": "Hello from test", "enabled": true}`)
	if err := testExt.ApplyConfig(config); err != nil {
		log.Fatalf("Failed to apply config: %v", err)
	}

	log.Println("Test extension system test completed successfully!")
}
