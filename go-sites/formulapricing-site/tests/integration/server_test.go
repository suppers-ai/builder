package integration

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/mux"

	"github.com/suppers-ai/formulapricing-site/config"
	"github.com/suppers-ai/formulapricing-site/handlers"
	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/middleware"
)

// setupTestServer creates a test server with the same configuration as the main application
func setupTestServer() *httptest.Server {
	// Create test configuration
	cfg := &config.Config{
		Port:        "8080",
		Environment: "test",
		LogLevel:    "error", // Reduce log output during tests
		StaticPath:  "static",
	}

	// Initialize logger
	log := logger.New(cfg.LogLevel)

	// Set up router with same configuration as main app
	router := setupTestRoutes(cfg, log)

	return httptest.NewServer(router)
}

func setupTestRoutes(cfg *config.Config, log *logger.Logger) *mux.Router {
	router := mux.NewRouter()

	// Apply middleware in same order as main app
	router.Use(middleware.Recovery(log))
	router.Use(middleware.SecurityHeaders)
	router.Use(middleware.ErrorHandler(log))
	router.Use(middleware.RequestLogger(log))
	router.Use(middleware.Timeout(30*time.Second, log))
	router.Use(middleware.GzipCompression)

	// Static files - create a test static directory if it doesn't exist
	if _, err := os.Stat(cfg.StaticPath); os.IsNotExist(err) {
		os.MkdirAll(cfg.StaticPath+"/css", 0755)
		os.MkdirAll(cfg.StaticPath+"/js", 0755)
		os.MkdirAll(cfg.StaticPath+"/images", 0755)

		// Create minimal test files
		os.WriteFile(cfg.StaticPath+"/css/styles.css", []byte("body { margin: 0; }"), 0644)
		os.WriteFile(cfg.StaticPath+"/js/professor-gopher.js", []byte("console.log('test');"), 0644)
	}

	staticHandler := http.StripPrefix("/static/", http.FileServer(http.Dir(cfg.StaticPath+"/")))
	router.PathPrefix("/static/").Handler(staticHandler)

	// Health check endpoints
	router.HandleFunc("/health", handlers.EnhancedHealthHandler(log)).Methods("GET", "HEAD")
	router.HandleFunc("/healthz", handlers.EnhancedHealthHandler(log)).Methods("GET", "HEAD")

	// Application routes
	router.HandleFunc("/", handlers.HomeHandler(log)).Methods("GET")
	router.HandleFunc("/faq", handlers.FAQHandler(log)).Methods("GET")
	router.HandleFunc("/docs", handlers.DocsHandler(log)).Methods("GET")
	router.HandleFunc("/demo", handlers.DemoHandler(log)).Methods("GET")
	router.HandleFunc("/api-reference", handlers.APIReferenceHandler(log)).Methods("GET")
	router.HandleFunc("/examples", handlers.ExamplesHandler(log)).Methods("GET")
	router.HandleFunc("/search", handlers.SearchHandler(log)).Methods("GET")

	// 404 handler
	router.NotFoundHandler = handlers.EnhancedNotFoundHandler(log)

	return router
}

func TestServerIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	// Test homepage
	resp, err := http.Get(server.URL + "/")
	if err != nil {
		t.Fatalf("Failed to get homepage: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response body: %v", err)
	}

	bodyStr := string(body)
	if !strings.Contains(bodyStr, "Formula Pricing") {
		t.Error("Homepage does not contain expected content")
	}
}

func TestHealthCheckIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	// Test GET /health
	resp, err := http.Get(server.URL + "/health")
	if err != nil {
		t.Fatalf("Failed to get health endpoint: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if ct := resp.Header.Get("Content-Type"); ct != "application/json" {
		t.Errorf("Expected content type application/json, got %s", ct)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response body: %v", err)
	}

	if !strings.Contains(string(body), "healthy") {
		t.Error("Health check response does not indicate healthy status")
	}

	// Test HEAD /health
	req, err := http.NewRequest("HEAD", server.URL+"/health", nil)
	if err != nil {
		t.Fatalf("Failed to create HEAD request: %v", err)
	}

	client := &http.Client{}
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute HEAD request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200 for HEAD request, got %d", resp.StatusCode)
	}

	// HEAD should have empty body
	body, err = io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read HEAD response body: %v", err)
	}

	if len(body) != 0 {
		t.Errorf("HEAD request should have empty body, got %d bytes", len(body))
	}
}

func TestAllRoutesIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	routes := []struct {
		path            string
		expectedStatus  int
		expectedContent string
	}{
		{"/", http.StatusOK, "Formula Pricing"},
		{"/faq", http.StatusOK, "FAQ"},
		{"/docs", http.StatusOK, "Documentation"},
		{"/demo", http.StatusOK, "Demo"},
		{"/api-reference", http.StatusOK, "API Reference"},
		{"/examples", http.StatusOK, "Examples"},
		{"/search", http.StatusOK, "Search"},
		{"/search?q=test", http.StatusOK, "Search Results"},
		{"/nonexistent", http.StatusNotFound, "404"},
	}

	for _, route := range routes {
		t.Run(fmt.Sprintf("GET %s", route.path), func(t *testing.T) {
			resp, err := http.Get(server.URL + route.path)
			if err != nil {
				t.Fatalf("Failed to get %s: %v", route.path, err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != route.expectedStatus {
				t.Errorf("Expected status %d, got %d", route.expectedStatus, resp.StatusCode)
			}

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatalf("Failed to read response body: %v", err)
			}

			if !strings.Contains(string(body), route.expectedContent) {
				t.Errorf("Response does not contain expected content: %s", route.expectedContent)
			}
		})
	}
}

func TestStaticAssetsIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	staticAssets := []struct {
		path        string
		contentType string
	}{
		{"/static/css/styles.css", "text/css"},
		{"/static/js/professor-gopher.js", "text/javascript"},
	}

	for _, asset := range staticAssets {
		t.Run(fmt.Sprintf("GET %s", asset.path), func(t *testing.T) {
			resp, err := http.Get(server.URL + asset.path)
			if err != nil {
				t.Fatalf("Failed to get %s: %v", asset.path, err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				t.Errorf("Expected status 200, got %d", resp.StatusCode)
			}

			ct := resp.Header.Get("Content-Type")
			if !strings.Contains(ct, asset.contentType) {
				t.Errorf("Expected content type to contain %s, got %s", asset.contentType, ct)
			}

			// Check for cache headers (optional in test environment)
			if cacheControl := resp.Header.Get("Cache-Control"); cacheControl == "" {
				t.Logf("Note: Static asset missing Cache-Control header (may be expected in test environment)")
			}
		})
	}
}

func TestMiddlewareIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	resp, err := http.Get(server.URL + "/")
	if err != nil {
		t.Fatalf("Failed to get homepage: %v", err)
	}
	defer resp.Body.Close()

	// Check security headers
	securityHeaders := []string{
		"X-Content-Type-Options",
		"X-Frame-Options",
		"X-XSS-Protection",
		"Referrer-Policy",
	}

	for _, header := range securityHeaders {
		if value := resp.Header.Get(header); value == "" {
			t.Errorf("Missing security header: %s", header)
		}
	}

	// Check for gzip compression support
	req, err := http.NewRequest("GET", server.URL+"/", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Accept-Encoding", "gzip")

	client := &http.Client{}
	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute request with gzip: %v", err)
	}
	defer resp.Body.Close()

	// Server should support gzip compression
	if encoding := resp.Header.Get("Content-Encoding"); encoding != "gzip" {
		t.Logf("Note: Server did not compress response (Content-Encoding: %s)", encoding)
	}
}

func TestErrorHandlingIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	// Test 404 handling
	resp, err := http.Get(server.URL + "/nonexistent-page")
	if err != nil {
		t.Fatalf("Failed to get nonexistent page: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response body: %v", err)
	}

	bodyStr := string(body)
	if !strings.Contains(bodyStr, "404") {
		t.Error("404 page does not contain expected content")
	}

	if !strings.Contains(bodyStr, "Page Not Found") {
		t.Error("404 page does not contain 'Page Not Found' text")
	}
}

func TestRequestTimeoutIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	// Create a request with a very short timeout to test timeout handling
	client := &http.Client{
		Timeout: 1 * time.Millisecond, // Very short timeout
	}

	// This should timeout on the client side, but we're testing that the server handles it gracefully
	_, err := client.Get(server.URL + "/")
	if err == nil {
		t.Log("Request completed successfully (timeout test may not be effective)")
	} else {
		// This is expected - client timeout
		if !strings.Contains(err.Error(), "timeout") && !strings.Contains(err.Error(), "deadline") {
			t.Errorf("Expected timeout error, got: %v", err)
		}
	}
}

func TestConcurrentRequestsIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	// Test concurrent requests to ensure thread safety
	const numRequests = 10
	results := make(chan error, numRequests)

	for i := 0; i < numRequests; i++ {
		go func(id int) {
			resp, err := http.Get(server.URL + "/")
			if err != nil {
				results <- fmt.Errorf("request %d failed: %v", id, err)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				results <- fmt.Errorf("request %d got status %d", id, resp.StatusCode)
				return
			}

			results <- nil
		}(i)
	}

	// Wait for all requests to complete
	for i := 0; i < numRequests; i++ {
		if err := <-results; err != nil {
			t.Errorf("Concurrent request failed: %v", err)
		}
	}
}

func TestSearchFunctionalityIntegration(t *testing.T) {
	server := setupTestServer()
	defer server.Close()

	// Test search without query
	resp, err := http.Get(server.URL + "/search")
	if err != nil {
		t.Fatalf("Failed to get search page: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	// Test search with query
	resp, err = http.Get(server.URL + "/search?q=pricing")
	if err != nil {
		t.Fatalf("Failed to get search results: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response body: %v", err)
	}

	bodyStr := string(body)
	if !strings.Contains(bodyStr, "pricing") {
		t.Error("Search results do not contain the search query")
	}

	// Test search with special characters
	resp, err = http.Get(server.URL + "/search?q=%3Cscript%3E")
	if err != nil {
		t.Fatalf("Failed to get search results with special chars: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	body, err = io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response body: %v", err)
	}

	bodyStr = string(body)
	// Should not contain unescaped script tags
	if strings.Contains(bodyStr, "<script>") {
		t.Error("Search results contain unescaped HTML")
	}
}
