package performance

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"runtime"
	"sync"
	"testing"
	"time"

	"github.com/gorilla/mux"

	"github.com/suppers-ai/formulapricing-site/config"
	"github.com/suppers-ai/formulapricing-site/handlers"
	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/middleware"
)

// setupPerformanceTestServer creates a test server for performance testing
func setupPerformanceTestServer() *httptest.Server {
	cfg := &config.Config{
		Port:        "8080",
		Environment: "test",
		LogLevel:    "error", // Minimize logging for performance tests
		StaticPath:  "static",
	}

	log := logger.New(cfg.LogLevel)
	router := setupPerformanceRoutes(cfg, log)

	return httptest.NewServer(router)
}

func setupPerformanceRoutes(cfg *config.Config, log *logger.Logger) *mux.Router {
	router := mux.NewRouter()

	// Apply middleware
	router.Use(middleware.Recovery(log))
	router.Use(middleware.SecurityHeaders)
	router.Use(middleware.ErrorHandler(log))
	router.Use(middleware.RequestLogger(log))
	router.Use(middleware.Timeout(30*time.Second, log))
	router.Use(middleware.GzipCompression)

	// Application routes
	router.HandleFunc("/", handlers.HomeHandler(log)).Methods("GET")
	router.HandleFunc("/health", handlers.EnhancedHealthHandler(log)).Methods("GET", "HEAD")
	router.HandleFunc("/faq", handlers.FAQHandler(log)).Methods("GET")
	router.HandleFunc("/docs", handlers.DocsHandler(log)).Methods("GET")
	router.HandleFunc("/demo", handlers.DemoHandler(log)).Methods("GET")
	router.HandleFunc("/api-reference", handlers.APIReferenceHandler(log)).Methods("GET")
	router.HandleFunc("/examples", handlers.ExamplesHandler(log)).Methods("GET")
	router.HandleFunc("/search", handlers.SearchHandler(log)).Methods("GET")
	router.NotFoundHandler = handlers.EnhancedNotFoundHandler(log)

	return router
}

// BenchmarkHomePage benchmarks the homepage handler
func BenchmarkHomePage(b *testing.B) {
	server := setupPerformanceTestServer()
	defer server.Close()

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			resp, err := http.Get(server.URL + "/")
			if err != nil {
				b.Fatalf("Failed to get homepage: %v", err)
			}
			resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				b.Errorf("Expected status 200, got %d", resp.StatusCode)
			}
		}
	})
}

// BenchmarkHealthCheck benchmarks the health check endpoint
func BenchmarkHealthCheck(b *testing.B) {
	server := setupPerformanceTestServer()
	defer server.Close()

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			resp, err := http.Get(server.URL + "/health")
			if err != nil {
				b.Fatalf("Failed to get health endpoint: %v", err)
			}
			resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				b.Errorf("Expected status 200, got %d", resp.StatusCode)
			}
		}
	})
}

// BenchmarkAllRoutes benchmarks all application routes
func BenchmarkAllRoutes(b *testing.B) {
	server := setupPerformanceTestServer()
	defer server.Close()

	routes := []string{"/", "/faq", "/docs", "/demo", "/api-reference", "/examples", "/search"}

	for _, route := range routes {
		b.Run(fmt.Sprintf("Route%s", route), func(b *testing.B) {
			b.RunParallel(func(pb *testing.PB) {
				for pb.Next() {
					resp, err := http.Get(server.URL + route)
					if err != nil {
						b.Fatalf("Failed to get %s: %v", route, err)
					}
					resp.Body.Close()

					if resp.StatusCode != http.StatusOK {
						b.Errorf("Expected status 200, got %d", resp.StatusCode)
					}
				}
			})
		})
	}
}

// TestResponseTime tests that responses are returned within acceptable time limits
func TestResponseTime(t *testing.T) {
	server := setupPerformanceTestServer()
	defer server.Close()

	maxResponseTime := 500 * time.Millisecond
	routes := []string{"/", "/health", "/faq", "/docs", "/demo", "/api-reference", "/examples", "/search"}

	for _, route := range routes {
		t.Run(fmt.Sprintf("ResponseTime%s", route), func(t *testing.T) {
			start := time.Now()
			resp, err := http.Get(server.URL + route)
			duration := time.Since(start)

			if err != nil {
				t.Fatalf("Failed to get %s: %v", route, err)
			}
			resp.Body.Close()

			if duration > maxResponseTime {
				t.Errorf("Response time for %s too slow: %v (max: %v)", route, duration, maxResponseTime)
			}

			t.Logf("Response time for %s: %v", route, duration)
		})
	}
}

// TestConcurrentRequests tests the server's ability to handle concurrent requests
func TestConcurrentRequests(t *testing.T) {
	server := setupPerformanceTestServer()
	defer server.Close()

	numGoroutines := 50
	numRequestsPerGoroutine := 10
	totalRequests := numGoroutines * numRequestsPerGoroutine

	var wg sync.WaitGroup
	errors := make(chan error, totalRequests)
	durations := make(chan time.Duration, totalRequests)

	start := time.Now()

	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(goroutineID int) {
			defer wg.Done()

			for j := 0; j < numRequestsPerGoroutine; j++ {
				requestStart := time.Now()
				resp, err := http.Get(server.URL + "/")
				requestDuration := time.Since(requestStart)

				if err != nil {
					errors <- fmt.Errorf("goroutine %d, request %d failed: %v", goroutineID, j, err)
					return
				}
				resp.Body.Close()

				if resp.StatusCode != http.StatusOK {
					errors <- fmt.Errorf("goroutine %d, request %d got status %d", goroutineID, j, resp.StatusCode)
					return
				}

				durations <- requestDuration
			}
		}(i)
	}

	wg.Wait()
	totalDuration := time.Since(start)

	close(errors)
	close(durations)

	// Check for errors
	errorCount := 0
	for err := range errors {
		t.Errorf("Concurrent request error: %v", err)
		errorCount++
	}

	if errorCount > 0 {
		t.Fatalf("Failed %d out of %d concurrent requests", errorCount, totalRequests)
	}

	// Calculate statistics
	var totalRequestTime time.Duration
	var maxRequestTime time.Duration
	var minRequestTime time.Duration = time.Hour // Initialize to a large value
	requestCount := 0

	for duration := range durations {
		totalRequestTime += duration
		requestCount++

		if duration > maxRequestTime {
			maxRequestTime = duration
		}
		if duration < minRequestTime {
			minRequestTime = duration
		}
	}

	avgRequestTime := totalRequestTime / time.Duration(requestCount)
	requestsPerSecond := float64(totalRequests) / totalDuration.Seconds()

	t.Logf("Concurrent requests test results:")
	t.Logf("  Total requests: %d", totalRequests)
	t.Logf("  Total time: %v", totalDuration)
	t.Logf("  Requests per second: %.2f", requestsPerSecond)
	t.Logf("  Average request time: %v", avgRequestTime)
	t.Logf("  Min request time: %v", minRequestTime)
	t.Logf("  Max request time: %v", maxRequestTime)

	// Performance assertions
	if requestsPerSecond < 100 {
		t.Errorf("Requests per second too low: %.2f (expected > 100)", requestsPerSecond)
	}

	if avgRequestTime > 100*time.Millisecond {
		t.Errorf("Average request time too high: %v (expected < 100ms)", avgRequestTime)
	}
}

// TestMemoryUsage tests memory usage under load
func TestMemoryUsage(t *testing.T) {
	server := setupPerformanceTestServer()
	defer server.Close()

	// Force garbage collection to get baseline
	runtime.GC()
	var m1 runtime.MemStats
	runtime.ReadMemStats(&m1)
	baselineAlloc := m1.Alloc

	// Make many requests to test memory usage
	numRequests := 1000
	for i := 0; i < numRequests; i++ {
		resp, err := http.Get(server.URL + "/")
		if err != nil {
			t.Fatalf("Request %d failed: %v", i, err)
		}
		resp.Body.Close()
	}

	// Force garbage collection and measure memory
	runtime.GC()
	var m2 runtime.MemStats
	runtime.ReadMemStats(&m2)
	finalAlloc := m2.Alloc

	var memoryIncrease uint64
	var memoryIncreasePerRequest uint64

	if finalAlloc > baselineAlloc {
		memoryIncrease = finalAlloc - baselineAlloc
		memoryIncreasePerRequest = memoryIncrease / uint64(numRequests)
	} else {
		// Memory decreased (GC was effective)
		memoryIncrease = 0
		memoryIncreasePerRequest = 0
	}

	t.Logf("Memory usage test results:")
	t.Logf("  Baseline memory: %d bytes", baselineAlloc)
	t.Logf("  Final memory: %d bytes", finalAlloc)
	t.Logf("  Memory increase: %d bytes", memoryIncrease)
	t.Logf("  Memory per request: %d bytes", memoryIncreasePerRequest)
	t.Logf("  Total allocations: %d", m2.TotalAlloc)
	t.Logf("  GC cycles: %d", m2.NumGC)

	// Memory leak detection - memory increase should be reasonable
	maxMemoryIncrease := uint64(10 * 1024 * 1024) // 10MB
	if memoryIncrease > maxMemoryIncrease {
		t.Errorf("Memory increase too high: %d bytes (max: %d bytes)", memoryIncrease, maxMemoryIncrease)
	}

	// Per-request memory usage should be reasonable
	maxMemoryPerRequest := uint64(1024) // 1KB per request
	if memoryIncreasePerRequest > maxMemoryPerRequest {
		t.Errorf("Memory per request too high: %d bytes (max: %d bytes)", memoryIncreasePerRequest, maxMemoryPerRequest)
	}
}

// TestGoroutineLeaks tests for goroutine leaks
func TestGoroutineLeaks(t *testing.T) {
	server := setupPerformanceTestServer()
	defer server.Close()

	initialGoroutines := runtime.NumGoroutine()

	// Make requests that could potentially create goroutines
	numRequests := 100
	var wg sync.WaitGroup

	for i := 0; i < numRequests; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			resp, err := http.Get(server.URL + "/")
			if err != nil {
				return
			}
			resp.Body.Close()
		}()
	}

	wg.Wait()

	// Give some time for cleanup
	time.Sleep(100 * time.Millisecond)

	finalGoroutines := runtime.NumGoroutine()
	goroutineIncrease := finalGoroutines - initialGoroutines

	t.Logf("Goroutine leak test results:")
	t.Logf("  Initial goroutines: %d", initialGoroutines)
	t.Logf("  Final goroutines: %d", finalGoroutines)
	t.Logf("  Goroutine increase: %d", goroutineIncrease)

	// Allow for some reasonable increase (server goroutines, etc.)
	maxGoroutineIncrease := 10
	if goroutineIncrease > maxGoroutineIncrease {
		t.Errorf("Too many goroutines created: %d (max increase: %d)", goroutineIncrease, maxGoroutineIncrease)
	}
}

// TestLoadUnderStress tests the server under sustained load
func TestLoadUnderStress(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping stress test in short mode")
	}

	server := setupPerformanceTestServer()
	defer server.Close()

	duration := 10 * time.Second
	numWorkers := 20

	ctx, cancel := context.WithTimeout(context.Background(), duration)
	defer cancel()

	var wg sync.WaitGroup
	requestCount := make(chan int, numWorkers)
	errorCount := make(chan int, numWorkers)

	start := time.Now()

	// Start workers
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			requests := 0
			errors := 0

			for {
				select {
				case <-ctx.Done():
					requestCount <- requests
					errorCount <- errors
					return
				default:
					resp, err := http.Get(server.URL + "/")
					requests++

					if err != nil {
						errors++
						continue
					}

					if resp.StatusCode != http.StatusOK {
						errors++
					}

					resp.Body.Close()
				}
			}
		}(i)
	}

	wg.Wait()
	actualDuration := time.Since(start)

	close(requestCount)
	close(errorCount)

	// Collect results
	totalRequests := 0
	totalErrors := 0

	for requests := range requestCount {
		totalRequests += requests
	}

	for errors := range errorCount {
		totalErrors += errors
	}

	requestsPerSecond := float64(totalRequests) / actualDuration.Seconds()
	errorRate := float64(totalErrors) / float64(totalRequests) * 100

	t.Logf("Stress test results:")
	t.Logf("  Duration: %v", actualDuration)
	t.Logf("  Workers: %d", numWorkers)
	t.Logf("  Total requests: %d", totalRequests)
	t.Logf("  Total errors: %d", totalErrors)
	t.Logf("  Requests per second: %.2f", requestsPerSecond)
	t.Logf("  Error rate: %.2f%%", errorRate)

	// Performance assertions
	if requestsPerSecond < 50 {
		t.Errorf("Requests per second under stress too low: %.2f (expected > 50)", requestsPerSecond)
	}

	if errorRate > 1.0 {
		t.Errorf("Error rate too high: %.2f%% (expected < 1%%)", errorRate)
	}
}

// BenchmarkTemplateRendering benchmarks template rendering performance
func BenchmarkTemplateRendering(b *testing.B) {
	log := logger.New("error")
	handler := handlers.HomeHandler(log)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/", nil)
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
	}
}

// BenchmarkMiddleware benchmarks middleware performance
func BenchmarkMiddleware(b *testing.B) {
	log := logger.New("error")

	// Create a simple handler
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Apply middleware
	middlewareHandler := middleware.Recovery(log)(
		middleware.SecurityHeaders(
			middleware.ErrorHandler(log)(
				middleware.RequestLogger(log)(
					middleware.Timeout(30*time.Second, log)(
						middleware.GzipCompression(handler),
					),
				),
			),
		),
	)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/", nil)
		w := httptest.NewRecorder()
		middlewareHandler.ServeHTTP(w, req)
	}
}
