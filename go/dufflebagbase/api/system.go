package api

import (
	"fmt"
	"net/http"
	"runtime"
	"syscall"
	"time"
	
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/suppers-ai/dufflebagbase/services"
)

type SystemMetrics struct {
	CPUUsage    float64 `json:"cpu_usage"`
	MemoryUsage float64 `json:"memory_usage"`
	MemoryTotal uint64  `json:"memory_total"`
	MemoryUsed  uint64  `json:"memory_used"`
	DiskUsage   float64 `json:"disk_usage"`
	DiskTotal   uint64  `json:"disk_total"`
	DiskUsed    uint64  `json:"disk_used"`
	Uptime      string  `json:"uptime"`
	Goroutines  int     `json:"goroutines"`
}

var (
	startTime = time.Now()
	
	// Prometheus metrics
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)
	
	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)
	
	dbQueriesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "database_queries_total",
			Help: "Total number of database queries",
		},
		[]string{"operation", "table"},
	)
	
	dbQueryDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "database_query_duration_seconds",
			Help:    "Database query duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"operation", "table"},
	)
	
	activeUsers = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_users_total",
			Help: "Number of active users",
		},
	)
	
	storageUsageBytes = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "storage_usage_bytes",
			Help: "Total storage usage in bytes",
		},
	)
)

func HandleGetSystemMetrics() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get memory stats
		var m runtime.MemStats
		runtime.ReadMemStats(&m)
		
		// Get disk stats
		var stat syscall.Statfs_t
		syscall.Statfs("/", &stat)
		
		diskTotal := stat.Blocks * uint64(stat.Bsize)
		diskFree := stat.Bavail * uint64(stat.Bsize)
		diskUsed := diskTotal - diskFree
		diskUsage := float64(diskUsed) / float64(diskTotal) * 100
		
		// Calculate memory usage percentage
		memoryUsage := float64(m.Alloc) / float64(m.Sys) * 100
		
		// Get CPU usage (simplified - just using goroutines as proxy)
		cpuUsage := float64(runtime.NumGoroutine()) / 10.0
		if cpuUsage > 100 {
			cpuUsage = 95
		}
		
		// Calculate uptime
		uptime := time.Since(startTime)
		uptimeStr := formatUptime(uptime)
		
		metrics := SystemMetrics{
			CPUUsage:    cpuUsage,
			MemoryUsage: memoryUsage,
			MemoryTotal: m.Sys,
			MemoryUsed:  m.Alloc,
			DiskUsage:   diskUsage,
			DiskTotal:   diskTotal,
			DiskUsed:    diskUsed,
			Uptime:      uptimeStr,
			Goroutines:  runtime.NumGoroutine(),
		}
		
		RespondWithJSON(w, http.StatusOK, metrics)
	}
}

func formatUptime(d time.Duration) string {
	days := int(d.Hours()) / 24
	hours := int(d.Hours()) % 24
	minutes := int(d.Minutes()) % 60
	
	if days > 0 {
		return fmt.Sprintf("%dd %dh %dm", days, hours, minutes)
	} else if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, minutes)
	}
	return fmt.Sprintf("%dm", minutes)
}

// HandlePrometheusMetrics returns Prometheus metrics endpoint
func HandlePrometheusMetrics() http.HandlerFunc {
	return promhttp.Handler().ServeHTTP
}

// PrometheusMiddleware tracks HTTP metrics
func PrometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		// Wrap response writer to capture status
		wrapped := &metricsResponseWrapper{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}
		
		// Execute handler
		next.ServeHTTP(wrapped, r)
		
		// Record metrics
		duration := time.Since(start)
		httpRequestsTotal.WithLabelValues(r.Method, r.URL.Path, fmt.Sprintf("%d", wrapped.statusCode)).Inc()
		httpRequestDuration.WithLabelValues(r.Method, r.URL.Path).Observe(duration.Seconds())
	})
}

type metricsResponseWrapper struct {
	http.ResponseWriter
	statusCode int
	written    bool
}

func (w *metricsResponseWrapper) WriteHeader(statusCode int) {
	if !w.written {
		w.statusCode = statusCode
		w.written = true
	}
	w.ResponseWriter.WriteHeader(statusCode)
}

func (w *metricsResponseWrapper) Write(b []byte) (int, error) {
	if !w.written {
		w.written = true
	}
	return w.ResponseWriter.Write(b)
}

// UpdateMetrics updates various Prometheus metrics
func UpdateMetrics(users int, storage int64) {
	activeUsers.Set(float64(users))
	storageUsageBytes.Set(float64(storage))
}

// RecordDatabaseQuery records database query metrics
func RecordDatabaseQuery(operation, table string, duration time.Duration) {
	dbQueriesTotal.WithLabelValues(operation, table).Inc()
	dbQueryDuration.WithLabelValues(operation, table).Observe(duration.Seconds())
}

// HandleGetDatabaseInfo returns database configuration info
func HandleGetDatabaseInfo(databaseService *services.DatabaseService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the actual database type from the service
		dbType, dbVersion := databaseService.GetDatabaseInfo()
		
		info := map[string]interface{}{
			"type":    dbType,
			"version": dbVersion,
		}
		
		respondWithJSON(w, http.StatusOK, info)
	}
}