package fixtures

import (
	"net/http"
	"net/http/httptest"
	"time"

	"github.com/suppers-ai/formulapricing-site/config"
	"github.com/suppers-ai/formulapricing-site/logger"
)

// TestConfig returns a configuration suitable for testing
func TestConfig() *config.Config {
	return &config.Config{
		Port:        "8080",
		Environment: "test",
		LogLevel:    "error", // Reduce log output during tests
		StaticPath:  "static",
	}
}

// TestLogger returns a logger suitable for testing
func TestLogger() *logger.Logger {
	return logger.New("error")
}

// MockRequest creates a mock HTTP request for testing
func MockRequest(method, url string) *http.Request {
	req, _ := http.NewRequest(method, url, nil)
	return req
}

// MockResponseWriter creates a mock HTTP response writer for testing
func MockResponseWriter() *httptest.ResponseRecorder {
	return httptest.NewRecorder()
}

// TestServer creates a test server with timeout
func TestServer(handler http.Handler) *httptest.Server {
	server := httptest.NewServer(handler)
	// Set a reasonable timeout for tests
	server.Config.ReadTimeout = 5 * time.Second
	server.Config.WriteTimeout = 5 * time.Second
	return server
}

// ExpectedHTMLElements returns common HTML elements that should be present in pages
func ExpectedHTMLElements() []string {
	return []string{
		"<!DOCTYPE html>",
		"<html",
		"<head>",
		"<meta charset=\"utf-8\">",
		"<meta name=\"viewport\"",
		"<title>",
		"<body>",
		"</body>",
		"</html>",
	}
}

// ExpectedSecurityHeaders returns security headers that should be present
func ExpectedSecurityHeaders() []string {
	return []string{
		"X-Content-Type-Options",
		"X-Frame-Options",
		"X-XSS-Protection",
		"Referrer-Policy",
	}
}

// ExpectedHomePageContent returns content that should be present on the homepage
func ExpectedHomePageContent() []string {
	return []string{
		"Formula Pricing",
		"Professor Gopher",
		"Live Demo",
		"Read the documentation",
		"eye-tracking",
		"professor-gopher.png",
	}
}

// ExpectedNavigationElements returns navigation elements that should be present
func ExpectedNavigationElements() []string {
	return []string{
		"FAQ",
		"Docs",
		"Demo",
		"API Reference",
		"Examples",
	}
}

// Expected404Content returns content that should be present on 404 pages
func Expected404Content() []string {
	return []string{
		"404",
		"Page Not Found",
		"Go Home",
		"href=\"/\"",
	}
}

// ExpectedHealthCheckResponse returns the expected health check response
func ExpectedHealthCheckResponse() map[string]interface{} {
	return map[string]interface{}{
		"status": "healthy",
	}
}

// StaticAssetTests returns test cases for static assets
func StaticAssetTests() []struct {
	Path        string
	ContentType string
	MinSize     int
} {
	return []struct {
		Path        string
		ContentType string
		MinSize     int
	}{
		{"/static/css/styles.css", "text/css", 100},
		{"/static/js/professor-gopher.js", "text/javascript", 50},
	}
}

// RouteTests returns test cases for all routes
func RouteTests() []struct {
	Path            string
	Method          string
	ExpectedStatus  int
	ExpectedContent string
} {
	return []struct {
		Path            string
		Method          string
		ExpectedStatus  int
		ExpectedContent string
	}{
		{"/", "GET", http.StatusOK, "Formula Pricing"},
		{"/faq", "GET", http.StatusOK, "FAQ"},
		{"/docs", "GET", http.StatusOK, "Documentation"},
		{"/demo", "GET", http.StatusOK, "Demo"},
		{"/api-reference", "GET", http.StatusOK, "API Reference"},
		{"/examples", "GET", http.StatusOK, "Examples"},
		{"/search", "GET", http.StatusOK, "Search"},
		{"/search?q=test", "GET", http.StatusOK, "Search Results"},
		{"/health", "GET", http.StatusOK, "healthy"},
		{"/healthz", "GET", http.StatusOK, "healthy"},
		{"/nonexistent", "GET", http.StatusNotFound, "404"},
	}
}

// ResponsiveBreakpoints returns CSS breakpoints that should be tested
func ResponsiveBreakpoints() []struct {
	Name       string
	MaxWidth   string
	MediaQuery string
} {
	return []struct {
		Name       string
		MaxWidth   string
		MediaQuery string
	}{
		{"Mobile", "480px", "@media (max-width: 480px)"},
		{"Tablet", "768px", "@media (max-width: 768px)"},
		{"Desktop", "1200px", "@media (min-width: 1201px)"},
	}
}

// CSSCustomProperties returns CSS custom properties that should be present
func CSSCustomProperties() []string {
	return []string{
		"--primary-color",
		"--secondary-color",
		"--background-color",
		"--text-color",
		"--border-color",
	}
}

// JavaScriptFeatures returns JavaScript features that should be present
func JavaScriptFeatures() []string {
	return []string{
		"DOMContentLoaded",
		"mousemove",
		"professor-gopher",
		"addEventListener",
		"getBoundingClientRect",
	}
}

// SearchTestCases returns test cases for search functionality
func SearchTestCases() []struct {
	Query           string
	ExpectedContent string
	ShouldEscape    bool
} {
	return []struct {
		Query           string
		ExpectedContent string
		ShouldEscape    bool
	}{
		{"pricing", "pricing", false},
		{"formula", "formula", false},
		{"<script>alert('test')</script>", "&lt;script&gt;", true},
		{"test & example", "test &amp; example", true},
		{"", "Search", false},
	}
}

// PerformanceThresholds returns performance thresholds for testing
func PerformanceThresholds() struct {
	MaxResponseTime time.Duration
	MaxMemoryUsage  int64
	MaxCPUUsage     float64
} {
	return struct {
		MaxResponseTime time.Duration
		MaxMemoryUsage  int64
		MaxCPUUsage     float64
	}{
		MaxResponseTime: 500 * time.Millisecond,
		MaxMemoryUsage:  100 * 1024 * 1024, // 100MB
		MaxCPUUsage:     80.0,              // 80%
	}
}

// ConcurrencyTestConfig returns configuration for concurrency testing
func ConcurrencyTestConfig() struct {
	NumRequests    int
	NumGoroutines  int
	RequestTimeout time.Duration
} {
	return struct {
		NumRequests    int
		NumGoroutines  int
		RequestTimeout time.Duration
	}{
		NumRequests:    100,
		NumGoroutines:  10,
		RequestTimeout: 5 * time.Second,
	}
}

// ErrorTestCases returns test cases for error handling
func ErrorTestCases() []struct {
	Scenario        string
	Path            string
	ExpectedStatus  int
	ExpectedContent string
} {
	return []struct {
		Scenario        string
		Path            string
		ExpectedStatus  int
		ExpectedContent string
	}{
		{"Not Found", "/nonexistent", http.StatusNotFound, "404"},
		{"Invalid Path", "/../../etc/passwd", http.StatusNotFound, "404"},
		{"Long Path", "/" + string(make([]byte, 2048)), http.StatusNotFound, "404"},
	}
}

// CacheTestCases returns test cases for cache header testing
func CacheTestCases() []struct {
	Path                 string
	ExpectedCacheControl string
	ExpectedMaxAge       string
} {
	return []struct {
		Path                 string
		ExpectedCacheControl string
		ExpectedMaxAge       string
	}{
		{"/static/css/styles.css", "public", "3600"},
		{"/static/js/professor-gopher.js", "public", "3600"},
		{"/static/images/professor-gopher.png", "public", "86400"},
		{"/static/images/wave-background-tile-512-thinner-seamless.svg", "public", "86400"},
	}
}

// AccessibilityTestElements returns elements that should be tested for accessibility
func AccessibilityTestElements() []string {
	return []string{
		"alt=",        // Image alt attributes
		"aria-label=", // ARIA labels
		"role=",       // ARIA roles
		"tabindex=",   // Tab navigation
		"<h1",         // Heading hierarchy
		"<h2",
		"<h3",
		"<nav",     // Navigation landmarks
		"<main",    // Main content landmark
		"<button",  // Interactive elements
		"<a href=", // Links
	}
}

// SEOTestElements returns elements that should be tested for SEO
func SEOTestElements() []string {
	return []string{
		"<title>",
		"<meta name=\"description\"",
		"<meta name=\"keywords\"",
		"<meta property=\"og:",
		"<meta name=\"twitter:",
		"<link rel=\"canonical\"",
		"<h1",
		"<h2",
		"<h3",
	}
}

// Min returns the minimum of two integers
func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
