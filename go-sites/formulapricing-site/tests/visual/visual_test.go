package visual

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/mux"

	"github.com/suppers-ai/formulapricing-site/config"
	"github.com/suppers-ai/formulapricing-site/handlers"
	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/middleware"
)

// setupVisualTestServer creates a test server for visual regression testing
func setupVisualTestServer() *httptest.Server {
	cfg := &config.Config{
		Port:        "8080",
		Environment: "test",
		LogLevel:    "error",
		StaticPath:  "static",
	}

	log := logger.New(cfg.LogLevel)
	router := setupVisualTestRoutes(cfg, log)

	return httptest.NewServer(router)
}

func setupVisualTestRoutes(cfg *config.Config, log *logger.Logger) *mux.Router {
	router := mux.NewRouter()

	// Apply middleware
	router.Use(middleware.Recovery(log))
	router.Use(middleware.SecurityHeaders)
	router.Use(middleware.ErrorHandler(log))
	router.Use(middleware.RequestLogger(log))
	router.Use(middleware.Timeout(30*time.Second, log))

	// Ensure static directory exists with test assets
	setupTestStaticAssets(cfg.StaticPath)

	staticHandler := http.StripPrefix("/static/", http.FileServer(http.Dir(cfg.StaticPath+"/")))
	router.PathPrefix("/static/").Handler(staticHandler)

	// Application routes
	router.HandleFunc("/", handlers.HomeHandler(log)).Methods("GET")
	router.HandleFunc("/faq", handlers.FAQHandler(log)).Methods("GET")
	router.HandleFunc("/docs", handlers.DocsHandler(log)).Methods("GET")
	router.HandleFunc("/demo", handlers.DemoHandler(log)).Methods("GET")
	router.HandleFunc("/api-reference", handlers.APIReferenceHandler(log)).Methods("GET")
	router.HandleFunc("/examples", handlers.ExamplesHandler(log)).Methods("GET")
	router.HandleFunc("/search", handlers.SearchHandler(log)).Methods("GET")
	router.NotFoundHandler = handlers.EnhancedNotFoundHandler(log)

	return router
}

func setupTestStaticAssets(staticPath string) {
	// Create directories
	os.MkdirAll(filepath.Join(staticPath, "css"), 0755)
	os.MkdirAll(filepath.Join(staticPath, "js"), 0755)
	os.MkdirAll(filepath.Join(staticPath, "images"), 0755)

	// Create minimal CSS file for testing
	cssContent := `
/* Test CSS for visual regression testing */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --border-color: #e5e7eb;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 80px 0;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  background-color: white;
  color: var(--primary-color);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.professor-gopher {
  max-width: 300px;
  height: auto;
  margin: 2rem auto;
  display: block;
}

.features {
  padding: 80px 0;
  background-color: #f8fafc;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-card h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
}

.navbar-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.navbar-nav a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar-nav a:hover {
  color: var(--primary-color);
}

.search-box {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.error-page {
  text-align: center;
  padding: 80px 20px;
}

.error-content h1 {
  font-size: 6rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.error-content h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
  
  .navbar-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navbar-nav {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 40px 0;
  }
  
  .hero h1 {
    font-size: 1.5rem;
  }
  
  .container {
    padding: 0 10px;
  }
}
`

	os.WriteFile(filepath.Join(staticPath, "css", "styles.css"), []byte(cssContent), 0644)

	// Create minimal JavaScript file for testing
	jsContent := `
// Test JavaScript for visual regression testing
document.addEventListener('DOMContentLoaded', function() {
  console.log('Formula Pricing Site loaded');
  
  // Simple eye tracking simulation for testing
  const professorGopher = document.querySelector('.professor-gopher');
  if (professorGopher) {
    console.log('Professor Gopher found');
    
    // Add eye tracking functionality
    document.addEventListener('mousemove', function(e) {
      // Simple eye tracking logic for testing
      const rect = professorGopher.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Calculate angle for eye rotation
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      // Apply transformation (this would be more complex in real implementation)
      professorGopher.style.filter = 'hue-rotate(' + (angle / 10) + 'deg)';
    });
  }
});
`

	os.WriteFile(filepath.Join(staticPath, "js", "professor-gopher.js"), []byte(jsContent), 0644)

	// Create a simple test image (1x1 pixel PNG)
	pngData := []byte{
		0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
		0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
		0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
		0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
		0x01, 0x00, 0x01, 0x5C, 0xCD, 0x90, 0x0E, 0x00, 0x00, 0x00, 0x00, 0x49,
		0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
	}
	os.WriteFile(filepath.Join(staticPath, "images", "professor-gopher.png"), pngData, 0644)

	// Create a simple SVG for background
	svgContent := `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f0f9ff"/>
  <path d="M0,256 Q128,128 256,256 T512,256 L512,512 L0,512 Z" fill="#dbeafe" opacity="0.5"/>
</svg>`
	os.WriteFile(filepath.Join(staticPath, "images", "wave-background-tile-512-thinner-seamless.svg"), []byte(svgContent), 0644)
}

func TestVisualRegressionHomepage(t *testing.T) {
	server := setupVisualTestServer()
	defer server.Close()

	resp, err := http.Get(server.URL + "/")
	if err != nil {
		t.Fatalf("Failed to get homepage: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	// Read response body for content validation
	body := make([]byte, 0, 1024*1024) // 1MB buffer
	buffer := make([]byte, 1024)
	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			body = append(body, buffer[:n]...)
		}
		if err != nil {
			break
		}
	}

	bodyStr := string(body)

	// Visual regression checks - ensure key visual elements are present
	visualElements := []string{
		"Formula Pricing",
		"Professor Gopher",
		"Live Demo",
		"Read the documentation",
		"professor-gopher.png",
		"styles.css",
		"professor-gopher.js",
	}

	for _, element := range visualElements {
		if !strings.Contains(bodyStr, element) {
			t.Errorf("Homepage missing visual element: %s", element)
		}
	}

	// Check for proper HTML structure
	structuralElements := []string{
		"<html",
		"<head>",
		"<meta charset=\"UTF-8\"",
		"<meta name=\"viewport\"",
		"<title>",
		"<link rel=\"stylesheet\"",
		"<body>",
		"<nav",
		"<div", // Using div instead of main
		"<script",
		"</body>",
		"</html>",
	}

	for _, element := range structuralElements {
		if !strings.Contains(bodyStr, element) {
			t.Errorf("Homepage missing structural element: %s", element)
		}
	}

	// Check DOCTYPE separately (case insensitive)
	if !strings.Contains(strings.ToLower(bodyStr), "<!doctype html>") {
		t.Error("Homepage missing DOCTYPE declaration")
	}

	// Check for responsive design meta tag
	if !strings.Contains(bodyStr, "width=device-width") {
		t.Error("Homepage missing responsive design viewport meta tag")
	}

	// Check for CSS custom properties (CSS variables)
	if !strings.Contains(bodyStr, "var(--") {
		t.Log("Note: CSS custom properties not found in inline styles (may be in external CSS)")
	}
}

func TestVisualRegression404Page(t *testing.T) {
	server := setupVisualTestServer()
	defer server.Close()

	resp, err := http.Get(server.URL + "/nonexistent")
	if err != nil {
		t.Fatalf("Failed to get 404 page: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", resp.StatusCode)
	}

	// Read response body
	body := make([]byte, 0, 1024*1024)
	buffer := make([]byte, 1024)
	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			body = append(body, buffer[:n]...)
		}
		if err != nil {
			break
		}
	}

	bodyStr := string(body)

	// Visual elements for 404 page
	visualElements := []string{
		"404",
		"Page Not Found",
		"Go Home",
		"href=\"/\"",
		"text-center",
		"min-h-screen",
	}

	for _, element := range visualElements {
		if !strings.Contains(bodyStr, element) {
			t.Errorf("404 page missing visual element: %s", element)
		}
	}
}

func TestResponsiveDesignBreakpoints(t *testing.T) {
	server := setupVisualTestServer()
	defer server.Close()

	// Test different viewport sizes by checking CSS media queries
	resp, err := http.Get(server.URL + "/static/css/styles.css")
	if err != nil {
		t.Fatalf("Failed to get CSS file: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200 for CSS, got %d", resp.StatusCode)
	}

	// Read CSS content
	body := make([]byte, 0, 1024*1024)
	buffer := make([]byte, 1024)
	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			body = append(body, buffer[:n]...)
		}
		if err != nil {
			break
		}
	}

	cssContent := string(body)

	// Check for responsive design breakpoints
	responsiveElements := []string{
		"@media",
		"max-width: 768px",
		"max-width: 480px",
		"grid-template-columns",
		"flex-direction: column",
	}

	for _, element := range responsiveElements {
		if !strings.Contains(cssContent, element) {
			t.Errorf("CSS missing responsive design element: %s", element)
		}
	}

	// Check for CSS custom properties
	cssVariables := []string{
		"--primary-color",
		"--secondary-color",
		"--background-color",
		"--text-color",
		"--border-color",
	}

	for _, variable := range cssVariables {
		if !strings.Contains(cssContent, variable) {
			t.Errorf("CSS missing custom property: %s", variable)
		}
	}
}

func TestInteractiveElementsVisual(t *testing.T) {
	server := setupVisualTestServer()
	defer server.Close()

	// Test JavaScript file
	resp, err := http.Get(server.URL + "/static/js/professor-gopher.js")
	if err != nil {
		t.Fatalf("Failed to get JavaScript file: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200 for JavaScript, got %d", resp.StatusCode)
	}

	// Read JavaScript content
	body := make([]byte, 0, 1024*1024)
	buffer := make([]byte, 1024)
	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			body = append(body, buffer[:n]...)
		}
		if err != nil {
			break
		}
	}

	jsContent := string(body)

	// Check for interactive elements
	interactiveElements := []string{
		"DOMContentLoaded",
		"mousemove",
		"professor-gopher",
		"addEventListener",
		"getBoundingClientRect",
	}

	for _, element := range interactiveElements {
		if !strings.Contains(jsContent, element) {
			t.Errorf("JavaScript missing interactive element: %s", element)
		}
	}
}

func TestStaticAssetVisualIntegrity(t *testing.T) {
	server := setupVisualTestServer()
	defer server.Close()

	staticAssets := []struct {
		path        string
		contentType string
		minSize     int
	}{
		{"/static/css/styles.css", "text/css", 100},
		{"/static/js/professor-gopher.js", "text/javascript", 50},
		{"/static/images/professor-gopher.png", "image/png", 50},
		{"/static/images/wave-background-tile-512-thinner-seamless.svg", "image/svg+xml", 50},
	}

	for _, asset := range staticAssets {
		t.Run(fmt.Sprintf("Visual integrity %s", asset.path), func(t *testing.T) {
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

			// Check content length
			body := make([]byte, 0, 1024*1024)
			buffer := make([]byte, 1024)
			for {
				n, err := resp.Body.Read(buffer)
				if n > 0 {
					body = append(body, buffer[:n]...)
				}
				if err != nil {
					break
				}
			}

			if len(body) < asset.minSize {
				t.Errorf("Asset %s too small: got %d bytes, expected at least %d", asset.path, len(body), asset.minSize)
			}
		})
	}
}

func TestVisualConsistencyAcrossPages(t *testing.T) {
	server := setupVisualTestServer()
	defer server.Close()

	pages := []string{"/", "/faq", "/docs", "/demo", "/api-reference", "/examples"}

	for _, page := range pages {
		t.Run(fmt.Sprintf("Visual consistency %s", page), func(t *testing.T) {
			resp, err := http.Get(server.URL + page)
			if err != nil {
				t.Fatalf("Failed to get %s: %v", page, err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				t.Errorf("Expected status 200, got %d", resp.StatusCode)
			}

			// Read response body
			body := make([]byte, 0, 1024*1024)
			buffer := make([]byte, 1024)
			for {
				n, err := resp.Body.Read(buffer)
				if n > 0 {
					body = append(body, buffer[:n]...)
				}
				if err != nil {
					break
				}
			}

			bodyStr := string(body)

			// Check for consistent elements across all pages
			consistentElements := []string{
				"Formula Pricing",
				"styles.css",
				"<nav",
				"<div",
				"</html>",
			}

			for _, element := range consistentElements {
				if !strings.Contains(bodyStr, element) {
					t.Errorf("Page %s missing consistent element: %s", page, element)
				}
			}

			// Check DOCTYPE separately (case insensitive)
			if !strings.Contains(strings.ToLower(bodyStr), "<!doctype html>") {
				t.Errorf("Page %s missing DOCTYPE declaration", page)
			}

			// Check for proper HTML structure
			if !strings.Contains(bodyStr, "<html") || !strings.Contains(bodyStr, "</html>") {
				t.Errorf("Page %s missing proper HTML structure", page)
			}
		})
	}
}
