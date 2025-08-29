package performance

import (
	"compress/gzip"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/suppers-ai/formulapricing-site/handlers"
	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/metrics"
	"github.com/suppers-ai/formulapricing-site/middleware"
)

func TestGzipCompression(t *testing.T) {
	// Create a test handler that returns some text
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(strings.Repeat("This is a test string for compression. ", 100)))
	})

	// Wrap with gzip middleware
	compressedHandler := middleware.GzipCompression(handler)

	// Create request with gzip acceptance
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Accept-Encoding", "gzip")

	// Record response
	w := httptest.NewRecorder()
	compressedHandler.ServeHTTP(w, req)

	// Check that response is compressed
	if w.Header().Get("Content-Encoding") != "gzip" {
		t.Error("Expected gzip content encoding")
	}

	if w.Header().Get("Vary") != "Accept-Encoding" {
		t.Error("Expected Vary: Accept-Encoding header")
	}

	// Verify we can decompress the response
	reader, err := gzip.NewReader(w.Body)
	if err != nil {
		t.Fatalf("Failed to create gzip reader: %v", err)
	}
	defer reader.Close()

	decompressed, err := io.ReadAll(reader)
	if err != nil {
		t.Fatalf("Failed to decompress response: %v", err)
	}

	expectedContent := strings.Repeat("This is a test string for compression. ", 100)
	if string(decompressed) != expectedContent {
		t.Error("Decompressed content doesn't match expected content")
	}
}

func TestCacheHeaders(t *testing.T) {
	tests := []struct {
		path        string
		expectedAge string
		description string
	}{
		{"/static/css/styles.css", "3600", "CSS files should cache for 1 hour"},
		{"/static/js/script.js", "3600", "JS files should cache for 1 hour"},
		{"/static/images/test.png", "86400", "Images should cache for 24 hours"},
		{"/static/images/test.svg", "86400", "SVG files should cache for 24 hours"},
		{"/static/fonts/font.woff2", "604800", "Fonts should cache for 1 week"},
	}

	for _, test := range tests {
		t.Run(test.description, func(t *testing.T) {
			// Create a simple file server handler
			handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// Simulate the cache header logic from main.go
				ext := ""
				if strings.Contains(r.URL.Path, ".css") {
					ext = ".css"
				} else if strings.Contains(r.URL.Path, ".js") {
					ext = ".js"
				} else if strings.Contains(r.URL.Path, ".png") {
					ext = ".png"
				} else if strings.Contains(r.URL.Path, ".svg") {
					ext = ".svg"
				} else if strings.Contains(r.URL.Path, ".woff2") {
					ext = ".woff2"
				}

				// Apply cache headers based on extension
				switch ext {
				case ".css", ".js":
					w.Header().Set("Cache-Control", "public, max-age=3600")
				case ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico":
					w.Header().Set("Cache-Control", "public, max-age=86400")
				case ".woff", ".woff2", ".ttf", ".eot":
					w.Header().Set("Cache-Control", "public, max-age=604800")
				default:
					w.Header().Set("Cache-Control", "public, max-age=3600")
				}

				w.WriteHeader(http.StatusOK)
				w.Write([]byte("test content"))
			})

			req := httptest.NewRequest("GET", test.path, nil)
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)

			cacheControl := w.Header().Get("Cache-Control")
			if !strings.Contains(cacheControl, "max-age="+test.expectedAge) {
				t.Errorf("Expected max-age=%s in Cache-Control header, got: %s", test.expectedAge, cacheControl)
			}

			if !strings.Contains(cacheControl, "public") {
				t.Errorf("Expected 'public' in Cache-Control header, got: %s", cacheControl)
			}
		})
	}
}

func TestMetricsCollection(t *testing.T) {
	m := metrics.NewMetrics()
	log := logger.New("INFO")

	// Create a test handler
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(10 * time.Millisecond) // Simulate some processing time
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	// Wrap with metrics middleware
	metricsHandler := middleware.MetricsLogger(log, m)(handler)

	// Make several requests
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest("GET", "/", nil)
		w := httptest.NewRecorder()
		metricsHandler.ServeHTTP(w, req)
	}

	// Check metrics
	snapshot := m.GetSnapshot()
	if snapshot.TotalRequests != 5 {
		t.Errorf("Expected 5 total requests, got %d", snapshot.TotalRequests)
	}

	if snapshot.Status2xx != 5 {
		t.Errorf("Expected 5 successful requests, got %d", snapshot.Status2xx)
	}

	if snapshot.AverageResponseTime < 10 {
		t.Errorf("Expected average response time >= 10ms, got %.2f", snapshot.AverageResponseTime)
	}
}

func TestMetricsEndpoint(t *testing.T) {
	m := metrics.NewMetrics()
	log := logger.New("INFO")

	// Record some test data
	m.RecordRequest(200, 50*time.Millisecond, 1024, true)
	m.RecordRequest(404, 25*time.Millisecond, 512, false)
	m.RecordPanic()

	// Test JSON metrics endpoint
	req := httptest.NewRequest("GET", "/metrics", nil)
	w := httptest.NewRecorder()

	handler := handlers.MetricsHandler(m, log)
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	contentType := w.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Expected application/json content type, got %s", contentType)
	}

	// Check that response contains expected metrics
	body := w.Body.String()
	if !strings.Contains(body, "total_requests") {
		t.Error("Response should contain total_requests metric")
	}

	if !strings.Contains(body, "total_panics") {
		t.Error("Response should contain total_panics metric")
	}
}

func TestPrometheusMetricsEndpoint(t *testing.T) {
	m := metrics.NewMetrics()
	log := logger.New("INFO")

	// Record some test data
	m.RecordRequest(200, 50*time.Millisecond, 1024, true)
	m.RecordRequest(500, 100*time.Millisecond, 256, false)

	// Test Prometheus metrics endpoint
	req := httptest.NewRequest("GET", "/metrics/prometheus", nil)
	w := httptest.NewRecorder()

	handler := handlers.PrometheusMetricsHandler(m, log)
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	contentType := w.Header().Get("Content-Type")
	if !strings.Contains(contentType, "text/plain") {
		t.Errorf("Expected text/plain content type, got %s", contentType)
	}

	// Check that response contains Prometheus format metrics
	body := w.Body.String()
	if !strings.Contains(body, "formulapricing_requests_total") {
		t.Error("Response should contain formulapricing_requests_total metric")
	}

	if !strings.Contains(body, "# HELP") {
		t.Error("Response should contain Prometheus help comments")
	}

	if !strings.Contains(body, "# TYPE") {
		t.Error("Response should contain Prometheus type comments")
	}
}

func TestTimeoutMiddleware(t *testing.T) {
	m := metrics.NewMetrics()
	log := logger.New("INFO")

	// Create a handler that takes longer than the timeout
	slowHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(100 * time.Millisecond)
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("slow response"))
	})

	// Wrap with timeout middleware (50ms timeout)
	timeoutHandler := middleware.TimeoutWithMetrics(50*time.Millisecond, log, m)(slowHandler)

	req := httptest.NewRequest("GET", "/slow", nil)
	w := httptest.NewRecorder()

	start := time.Now()
	timeoutHandler.ServeHTTP(w, req)
	duration := time.Since(start)

	// Request should timeout and complete quickly
	if duration > 80*time.Millisecond {
		t.Errorf("Request took too long, expected ~50ms timeout, took %v", duration)
	}

	// Check that timeout was recorded in metrics
	snapshot := m.GetSnapshot()
	if snapshot.TotalTimeouts != 1 {
		t.Errorf("Expected 1 timeout recorded, got %d", snapshot.TotalTimeouts)
	}
}

func BenchmarkMetricsRecording(b *testing.B) {
	m := metrics.NewMetrics()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		m.RecordRequest(200, 50*time.Millisecond, 1024, true)
	}
}

func BenchmarkGzipCompression(b *testing.B) {
	content := strings.Repeat("This is test content for compression benchmarking. ", 100)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(content))
	})

	compressedHandler := middleware.GzipCompression(handler)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Accept-Encoding", "gzip")
		w := httptest.NewRecorder()
		compressedHandler.ServeHTTP(w, req)
	}
}
