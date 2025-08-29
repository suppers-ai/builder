package middleware

import (
	"compress/gzip"
	"context"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/metrics"
)

// SecurityHeaders adds security headers to all responses
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Security headers
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'")

		next.ServeHTTP(w, r)
	})
}

// RequestLogger logs HTTP requests with timing information in dufflebagbase format
func RequestLogger(log *logger.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Create a response writer wrapper to capture status code and response size
			wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK, size: 0}

			next.ServeHTTP(wrapped, r)

			duration := time.Since(start)

			// Log request in dufflebagbase format
			log.LogRequest(r, wrapped.statusCode, duration, wrapped.size)
		})
	}
}

// MetricsLogger logs HTTP requests and records metrics
func MetricsLogger(log *logger.Logger, m *metrics.Metrics) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			m.IncrementActiveConnections()
			defer m.DecrementActiveConnections()

			// Create a response writer wrapper to capture status code, response size, and compression
			wrapped := &metricsResponseWriter{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
				size:           0,
				compressed:     false,
			}

			next.ServeHTTP(wrapped, r)

			duration := time.Since(start)

			// Record metrics
			m.RecordRequest(wrapped.statusCode, duration, wrapped.size, wrapped.compressed)

			// Record static asset metrics if this is a static asset request
			if strings.HasPrefix(r.URL.Path, "/static/") ||
				strings.HasSuffix(r.URL.Path, ".png") ||
				strings.HasSuffix(r.URL.Path, ".svg") ||
				strings.HasSuffix(r.URL.Path, ".ico") {
				m.RecordStaticAssetRequest(wrapped.statusCode < 400)
			}

			// Log request in dufflebagbase format
			log.LogRequest(r, wrapped.statusCode, duration, wrapped.size)
		})
	}
}

// responseWriter wraps http.ResponseWriter to capture status code and response size
type responseWriter struct {
	http.ResponseWriter
	statusCode int
	size       int64
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	size, err := rw.ResponseWriter.Write(b)
	rw.size += int64(size)
	return size, err
}

// metricsResponseWriter wraps http.ResponseWriter to capture metrics data
type metricsResponseWriter struct {
	http.ResponseWriter
	statusCode int
	size       int64
	compressed bool
}

func (rw *metricsResponseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *metricsResponseWriter) Write(b []byte) (int, error) {
	size, err := rw.ResponseWriter.Write(b)
	rw.size += int64(size)

	// Check if response is compressed
	if rw.Header().Get("Content-Encoding") == "gzip" {
		rw.compressed = true
	}

	return size, err
}

// Recovery middleware to handle panics gracefully with detailed logging
func Recovery(log *logger.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					// Log panic with full context and stack trace
					log.LogPanic(r.Context(), err, r)

					// Check if headers have already been written
					if w.Header().Get("Content-Type") == "" {
						w.Header().Set("Content-Type", "text/html; charset=utf-8")
					}

					// Return appropriate error response
					if !headersSent(w) {
						http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					}
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// RecoveryWithMetrics middleware to handle panics gracefully with metrics recording
func RecoveryWithMetrics(log *logger.Logger, m *metrics.Metrics) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					// Record panic in metrics
					m.RecordPanic()

					// Log panic with full context and stack trace
					log.LogPanic(r.Context(), err, r)

					// Check if headers have already been written
					if w.Header().Get("Content-Type") == "" {
						w.Header().Set("Content-Type", "text/html; charset=utf-8")
					}

					// Return appropriate error response
					if !headersSent(w) {
						http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					}
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// ErrorHandler middleware provides centralized error handling
func ErrorHandler(log *logger.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Create error-aware response writer
			ew := &errorResponseWriter{
				ResponseWriter: w,
				request:        r,
				logger:         log,
			}

			next.ServeHTTP(ew, r)
		})
	}
}

// errorResponseWriter wraps http.ResponseWriter to provide error handling
type errorResponseWriter struct {
	http.ResponseWriter
	request    *http.Request
	logger     *logger.Logger
	statusCode int
}

func (ew *errorResponseWriter) WriteHeader(code int) {
	ew.statusCode = code

	// Log errors for 4xx and 5xx status codes
	if code >= 400 {
		ctx := ew.request.Context()
		switch {
		case code >= 500:
			ew.logger.LogError(ctx, "Server error", nil, ew.request)
		case code >= 400:
			ew.logger.LogWithContext(ctx, logger.WARN, "Client error: %d %s %s",
				code, ew.request.Method, ew.request.URL.Path)
		}
	}

	ew.ResponseWriter.WriteHeader(code)
}

// GzipCompression middleware compresses responses for supported content types
func GzipCompression(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if client accepts gzip
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}

		// Skip compression for certain content types or small responses
		if shouldSkipCompression(r) {
			next.ServeHTTP(w, r)
			return
		}

		// Create gzip writer
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Set("Vary", "Accept-Encoding")

		gz := gzip.NewWriter(w)
		defer func() {
			if err := gz.Close(); err != nil {
				// Log compression error but don't fail the request
			}
		}()

		// Wrap response writer
		gzw := &gzipResponseWriter{ResponseWriter: w, Writer: gz}
		next.ServeHTTP(gzw, r)
	})
}

// gzipResponseWriter wraps http.ResponseWriter with gzip compression
type gzipResponseWriter struct {
	http.ResponseWriter
	io.Writer
}

func (w *gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

// Timeout middleware adds request timeout handling
func Timeout(timeout time.Duration, log *logger.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, cancel := context.WithTimeout(r.Context(), timeout)
			defer cancel()

			r = r.WithContext(ctx)

			done := make(chan struct{})
			go func() {
				defer close(done)
				next.ServeHTTP(w, r)
			}()

			select {
			case <-done:
				// Request completed normally
			case <-ctx.Done():
				// Request timed out
				log.LogError(ctx, "Request timeout", ctx.Err(), r)
				if !headersSent(w) {
					http.Error(w, "Request Timeout", http.StatusRequestTimeout)
				}
			}
		})
	}
}

// TimeoutWithMetrics middleware adds request timeout handling with metrics recording
func TimeoutWithMetrics(timeout time.Duration, log *logger.Logger, m *metrics.Metrics) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, cancel := context.WithTimeout(r.Context(), timeout)
			defer cancel()

			r = r.WithContext(ctx)

			done := make(chan struct{})
			go func() {
				defer close(done)
				next.ServeHTTP(w, r)
			}()

			select {
			case <-done:
				// Request completed normally
			case <-ctx.Done():
				// Request timed out
				m.RecordTimeout()
				log.LogError(ctx, "Request timeout", ctx.Err(), r)
				if !headersSent(w) {
					http.Error(w, "Request Timeout", http.StatusRequestTimeout)
				}
			}
		})
	}
}

// Helper functions

// headersSent checks if HTTP headers have already been sent
func headersSent(w http.ResponseWriter) bool {
	// This is a simple heuristic - in practice, you might need a more sophisticated approach
	return false
}

// shouldSkipCompression determines if compression should be skipped for a request
func shouldSkipCompression(r *http.Request) bool {
	// Skip compression for images, videos, and already compressed content
	contentType := r.Header.Get("Content-Type")
	skipTypes := []string{
		"image/",
		"video/",
		"audio/",
		"application/zip",
		"application/gzip",
		"application/x-gzip",
	}

	for _, skipType := range skipTypes {
		if strings.HasPrefix(contentType, skipType) {
			return true
		}
	}

	return false
}
