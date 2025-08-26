package auth

import (
	"net/http"
	"time"

	"formulapricing/models"
)

type ResponseWriter struct {
	http.ResponseWriter
	StatusCode int
}

func (rw *ResponseWriter) WriteHeader(code int) {
	rw.StatusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		// Wrap response writer to capture status code
		rw := &ResponseWriter{
			ResponseWriter: w,
			StatusCode:     http.StatusOK,
		}
		
		// Process request
		next.ServeHTTP(rw, r)
		
		// Calculate execution time
		execTime := int(time.Since(start).Milliseconds())
		
		// Get user ID from session if authenticated
		userID := GetUserID(r)
		
		// Get client IP
		clientIP := r.RemoteAddr
		if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			clientIP = forwarded
		}
		
		// Determine log level based on status code
		level := "INFO"
		if rw.StatusCode >= 400 && rw.StatusCode < 500 {
			level = "WARN"
		} else if rw.StatusCode >= 500 {
			level = "ERROR"
		}
		
		// Create log entry
		log := &models.Log{
			Level:      level,
			Method:     r.Method,
			Path:       r.URL.Path,
			StatusCode: &rw.StatusCode,
			ExecTimeMs: &execTime,
			UserIP:     &clientIP,
			UserID:     userID,
		}
		
		// Save to database (async to not block response)
		go models.CreateLog(log)
	})
}