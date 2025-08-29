package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
	"github.com/suppers-ai/dufflebagbase/extensions/core"
	"github.com/suppers-ai/logger"
)

func TestExtensionSystemE2E(t *testing.T) {
	// Create mock services
	testLogger, _ := logger.New(logger.Config{
		Level:  logger.LevelDebug,
		Output: "console",
		Format: "text",
	})
	services := &core.ExtensionServices{}

	// Create registry
	registry := core.NewExtensionRegistry(testLogger, services)
	assert.NotNil(t, registry)

	// Create and register test extension
	testExt := NewTestExtension()
	err := registry.Register(testExt)
	assert.NoError(t, err)

	// Verify extension is registered but not enabled
	extensions := registry.List()
	assert.Len(t, extensions, 1)
	assert.Equal(t, "test-extension", extensions[0].Name)

	status, err := registry.GetStatus("test-extension")
	assert.NoError(t, err)
	assert.Equal(t, "disabled", status.State)
	assert.False(t, status.Enabled)

	// Enable the extension
	err = registry.Enable("test-extension")
	assert.NoError(t, err)

	// Verify extension is now enabled
	status, err = registry.GetStatus("test-extension")
	assert.NoError(t, err)
	assert.Equal(t, "enabled", status.State)
	assert.True(t, status.Enabled)
	assert.True(t, status.Loaded)

	// Test configuration
	config := json.RawMessage(`{"message": "Test Message", "enabled": true}`)
	err = testExt.ApplyConfig(config)
	assert.NoError(t, err)

	// Test routes
	router := mux.NewRouter()
	extRouter := router.PathPrefix("/ext/test-extension").Subrouter()
	registry.RegisterRoutes(router)

	// Register test extension routes manually (since RegisterRoutes doesn't do it automatically)
	testExt.RegisterRoutes(&testExtensionRouter{router: extRouter})

	// Test the /test endpoint
	req := httptest.NewRequest("GET", "/ext/test-extension/test", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	var response map[string]interface{}
	err = json.NewDecoder(rec.Body).Decode(&response)
	assert.NoError(t, err)
	assert.Equal(t, "Test Message", response["message"])
	assert.Equal(t, true, response["enabled"])
	assert.Equal(t, "ok", response["status"])

	// Test hooks
	ctx := context.Background()
	hookCtx := &core.HookContext{
		Data: make(map[string]interface{}),
	}

	err = registry.ExecuteHooks(ctx, core.HookPreRequest, hookCtx)
	assert.NoError(t, err)
	assert.Equal(t, "executed", hookCtx.Data["test-extension"])

	// Test health check
	health, err := testExt.Health(ctx)
	assert.NoError(t, err)
	assert.Equal(t, "healthy", health.Status)

	// Test disabling
	err = registry.Disable("test-extension")
	assert.NoError(t, err)

	status, err = registry.GetStatus("test-extension")
	assert.NoError(t, err)
	assert.Equal(t, "disabled", status.State)
	assert.False(t, status.Enabled)

	// Test unregistering
	err = registry.Unregister("test-extension")
	assert.NoError(t, err)

	extensions = registry.List()
	assert.Len(t, extensions, 0)

	t.Log("End-to-end test completed successfully!")
}

func TestExtensionHotReload(t *testing.T) {
	// Create temporary config file
	configFile := "/tmp/test_extension_config.yaml"
	initialConfig := `
enabled:
  test-extension: true
config:
  test-extension:
    message: "Initial message"
    enabled: true
`
	err := os.WriteFile(configFile, []byte(initialConfig), 0644)
	assert.NoError(t, err)
	defer os.Remove(configFile)

	// Create extension config
	extConfig := core.NewExtensionConfig()
	err = extConfig.LoadFromFile(configFile)
	assert.NoError(t, err)

	// Verify config loaded
	assert.True(t, extConfig.IsEnabled("test-extension"))

	cfg, exists := extConfig.GetExtensionConfig("test-extension")
	assert.True(t, exists)
	assert.Equal(t, "Initial message", cfg["message"])

	// Test config watcher
	configChanged := false
	watcher := core.NewConfigWatcher(configFile, func(config *core.ExtensionConfig) {
		configChanged = true
	})

	err = watcher.Start()
	assert.NoError(t, err)
	defer watcher.Stop()

	// Update config file
	updatedConfig := `
enabled:
  test-extension: true
config:
  test-extension:
    message: "Updated message"
    enabled: false
`
	err = os.WriteFile(configFile, []byte(updatedConfig), 0644)
	assert.NoError(t, err)

	// Wait for config to reload (polling interval is 5 seconds in the implementation)
	time.Sleep(6 * time.Second)

	assert.True(t, configChanged, "Config should have been reloaded")

	t.Log("Hot reload test completed successfully!")
}

func TestExtensionConcurrency(t *testing.T) {
	testLogger, _ := logger.New(logger.Config{
		Level:  logger.LevelDebug,
		Output: "console",
		Format: "text",
	})
	services := &core.ExtensionServices{}
	registry := core.NewExtensionRegistry(testLogger, services)

	// Test concurrent registration
	done := make(chan bool, 10)

	for i := 0; i < 10; i++ {
		go func(n int) {
			ext := &TestConcurrentExtension{id: n}
			err := registry.Register(ext)
			assert.NoError(t, err)
			done <- true
		}(i)
	}

	// Wait for all registrations
	for i := 0; i < 10; i++ {
		<-done
	}

	// Verify all extensions registered
	extensions := registry.List()
	assert.Len(t, extensions, 10)

	// Test concurrent enable/disable
	for i := 0; i < 10; i++ {
		go func(n int) {
			name := fmt.Sprintf("concurrent-%d", n)
			err := registry.Enable(name)
			assert.NoError(t, err)

			// Get status
			status, err := registry.GetStatus(name)
			assert.NoError(t, err)
			assert.NotNil(t, status)

			// Disable
			err = registry.Disable(name)
			assert.NoError(t, err)

			done <- true
		}(i)
	}

	// Wait for all operations
	for i := 0; i < 10; i++ {
		<-done
	}

	t.Log("Concurrency test completed successfully!")
}

// TestConcurrentExtension for concurrency testing
type TestConcurrentExtension struct {
	id int
}

func (e *TestConcurrentExtension) Metadata() core.ExtensionMetadata {
	return core.ExtensionMetadata{
		Name:    fmt.Sprintf("concurrent-%d", e.id),
		Version: "1.0.0",
	}
}

func (e *TestConcurrentExtension) Initialize(ctx context.Context, services *core.ExtensionServices) error {
	return nil
}

func (e *TestConcurrentExtension) Start(ctx context.Context) error {
	return nil
}

func (e *TestConcurrentExtension) Stop(ctx context.Context) error {
	return nil
}

func (e *TestConcurrentExtension) Health(ctx context.Context) (*core.HealthStatus, error) {
	return &core.HealthStatus{Status: "healthy"}, nil
}

func (e *TestConcurrentExtension) RegisterRoutes(router core.ExtensionRouter) error {
	return nil
}

func (e *TestConcurrentExtension) RegisterMiddleware() []core.MiddlewareRegistration {
	return nil
}

func (e *TestConcurrentExtension) RegisterHooks() []core.HookRegistration {
	return nil
}

func (e *TestConcurrentExtension) RegisterTemplates() []core.TemplateRegistration {
	return nil
}

func (e *TestConcurrentExtension) RegisterStaticAssets() []core.StaticAssetRegistration {
	return nil
}

func (e *TestConcurrentExtension) ConfigSchema() json.RawMessage {
	return json.RawMessage(`{"type": "object"}`)
}

func (e *TestConcurrentExtension) ValidateConfig(config json.RawMessage) error {
	return nil
}

func (e *TestConcurrentExtension) ApplyConfig(config json.RawMessage) error {
	return nil
}

func (e *TestConcurrentExtension) DatabaseSchema() string {
	return ""
}

func (e *TestConcurrentExtension) Migrations() []core.Migration {
	return nil
}

func (e *TestConcurrentExtension) RequiredPermissions() []core.Permission {
	return nil
}

// testExtensionRouter implements core.ExtensionRouter
type testExtensionRouter struct {
	router *mux.Router
}

func (r *testExtensionRouter) HandleFunc(path string, handler http.HandlerFunc) core.RouteRegistration {
	r.router.HandleFunc(path, handler)
	return core.RouteRegistration{
		Path: path,
	}
}

func (r *testExtensionRouter) Handle(path string, handler http.Handler) core.RouteRegistration {
	r.router.Handle(path, handler)
	return core.RouteRegistration{
		Path: path,
	}
}

func (r *testExtensionRouter) PathPrefix(prefix string) core.ExtensionRouter {
	return &testExtensionRouter{
		router: r.router.PathPrefix(prefix).Subrouter(),
	}
}

func (r *testExtensionRouter) Use(middleware ...mux.MiddlewareFunc) {
	r.router.Use(middleware...)
}

func (r *testExtensionRouter) RequireAuth(handler http.Handler) http.Handler {
	// Simple mock implementation - just returns the handler unchanged
	return handler
}

func (r *testExtensionRouter) RequireRole(role string, handler http.Handler) http.Handler {
	// Simple mock implementation - just returns the handler unchanged
	return handler
}
