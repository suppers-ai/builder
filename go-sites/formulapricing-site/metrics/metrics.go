package metrics

import (
	"sync"
	"sync/atomic"
	"time"
)

// Metrics holds performance metrics for the application
type Metrics struct {
	// Request metrics
	totalRequests int64
	totalErrors   int64
	totalPanics   int64
	totalTimeouts int64

	// Response time metrics
	totalResponseTime int64
	minResponseTime   int64
	maxResponseTime   int64

	// Status code counters
	status2xx int64
	status3xx int64
	status4xx int64
	status5xx int64

	// Asset serving metrics
	staticAssetRequests int64
	staticAssetErrors   int64

	// Compression metrics
	compressedResponses int64
	compressionSavings  int64

	// Memory and performance
	activeConnections int64

	// Mutex for thread-safe operations on complex metrics
	mu sync.RWMutex

	// Response time histogram (simple buckets)
	responseTimeBuckets map[string]int64

	// Start time for uptime calculation
	startTime time.Time
}

// NewMetrics creates a new metrics instance
func NewMetrics() *Metrics {
	return &Metrics{
		minResponseTime: int64(^uint64(0) >> 1), // Max int64 value
		responseTimeBuckets: map[string]int64{
			"<10ms":     0,
			"10-50ms":   0,
			"50-100ms":  0,
			"100-500ms": 0,
			"500ms-1s":  0,
			">1s":       0,
		},
		startTime: time.Now(),
	}
}

// RecordRequest records a completed HTTP request
func (m *Metrics) RecordRequest(statusCode int, duration time.Duration, responseSize int64, compressed bool) {
	atomic.AddInt64(&m.totalRequests, 1)

	durationMs := duration.Nanoseconds() / 1000000 // Convert to milliseconds
	atomic.AddInt64(&m.totalResponseTime, durationMs)

	// Update min/max response times
	for {
		current := atomic.LoadInt64(&m.minResponseTime)
		if durationMs >= current || atomic.CompareAndSwapInt64(&m.minResponseTime, current, durationMs) {
			break
		}
	}

	for {
		current := atomic.LoadInt64(&m.maxResponseTime)
		if durationMs <= current || atomic.CompareAndSwapInt64(&m.maxResponseTime, current, durationMs) {
			break
		}
	}

	// Update status code counters
	switch {
	case statusCode >= 200 && statusCode < 300:
		atomic.AddInt64(&m.status2xx, 1)
	case statusCode >= 300 && statusCode < 400:
		atomic.AddInt64(&m.status3xx, 1)
	case statusCode >= 400 && statusCode < 500:
		atomic.AddInt64(&m.status4xx, 1)
		atomic.AddInt64(&m.totalErrors, 1)
	case statusCode >= 500:
		atomic.AddInt64(&m.status5xx, 1)
		atomic.AddInt64(&m.totalErrors, 1)
	}

	// Update response time histogram
	m.mu.Lock()
	switch {
	case durationMs < 10:
		m.responseTimeBuckets["<10ms"]++
	case durationMs < 50:
		m.responseTimeBuckets["10-50ms"]++
	case durationMs < 100:
		m.responseTimeBuckets["50-100ms"]++
	case durationMs < 500:
		m.responseTimeBuckets["100-500ms"]++
	case durationMs < 1000:
		m.responseTimeBuckets["500ms-1s"]++
	default:
		m.responseTimeBuckets[">1s"]++
	}
	m.mu.Unlock()

	// Record compression metrics
	if compressed {
		atomic.AddInt64(&m.compressedResponses, 1)
		// Estimate compression savings (rough estimate: 30% for text content)
		if responseSize > 0 {
			savings := responseSize * 30 / 100
			atomic.AddInt64(&m.compressionSavings, savings)
		}
	}
}

// RecordStaticAssetRequest records a static asset request
func (m *Metrics) RecordStaticAssetRequest(success bool) {
	atomic.AddInt64(&m.staticAssetRequests, 1)
	if !success {
		atomic.AddInt64(&m.staticAssetErrors, 1)
	}
}

// RecordPanic records a panic occurrence
func (m *Metrics) RecordPanic() {
	atomic.AddInt64(&m.totalPanics, 1)
}

// RecordTimeout records a request timeout
func (m *Metrics) RecordTimeout() {
	atomic.AddInt64(&m.totalTimeouts, 1)
}

// IncrementActiveConnections increments the active connection counter
func (m *Metrics) IncrementActiveConnections() {
	atomic.AddInt64(&m.activeConnections, 1)
}

// DecrementActiveConnections decrements the active connection counter
func (m *Metrics) DecrementActiveConnections() {
	atomic.AddInt64(&m.activeConnections, -1)
}

// GetSnapshot returns a snapshot of current metrics
func (m *Metrics) GetSnapshot() MetricsSnapshot {
	m.mu.RLock()
	buckets := make(map[string]int64)
	for k, v := range m.responseTimeBuckets {
		buckets[k] = v
	}
	m.mu.RUnlock()

	totalRequests := atomic.LoadInt64(&m.totalRequests)
	totalResponseTime := atomic.LoadInt64(&m.totalResponseTime)

	var avgResponseTime float64
	if totalRequests > 0 {
		avgResponseTime = float64(totalResponseTime) / float64(totalRequests)
	}

	return MetricsSnapshot{
		TotalRequests:       totalRequests,
		TotalErrors:         atomic.LoadInt64(&m.totalErrors),
		TotalPanics:         atomic.LoadInt64(&m.totalPanics),
		TotalTimeouts:       atomic.LoadInt64(&m.totalTimeouts),
		AverageResponseTime: avgResponseTime,
		MinResponseTime:     atomic.LoadInt64(&m.minResponseTime),
		MaxResponseTime:     atomic.LoadInt64(&m.maxResponseTime),
		Status2xx:           atomic.LoadInt64(&m.status2xx),
		Status3xx:           atomic.LoadInt64(&m.status3xx),
		Status4xx:           atomic.LoadInt64(&m.status4xx),
		Status5xx:           atomic.LoadInt64(&m.status5xx),
		StaticAssetRequests: atomic.LoadInt64(&m.staticAssetRequests),
		StaticAssetErrors:   atomic.LoadInt64(&m.staticAssetErrors),
		CompressedResponses: atomic.LoadInt64(&m.compressedResponses),
		CompressionSavings:  atomic.LoadInt64(&m.compressionSavings),
		ActiveConnections:   atomic.LoadInt64(&m.activeConnections),
		ResponseTimeBuckets: buckets,
		Uptime:              time.Since(m.startTime),
	}
}

// MetricsSnapshot represents a point-in-time snapshot of metrics
type MetricsSnapshot struct {
	TotalRequests       int64            `json:"total_requests"`
	TotalErrors         int64            `json:"total_errors"`
	TotalPanics         int64            `json:"total_panics"`
	TotalTimeouts       int64            `json:"total_timeouts"`
	AverageResponseTime float64          `json:"average_response_time_ms"`
	MinResponseTime     int64            `json:"min_response_time_ms"`
	MaxResponseTime     int64            `json:"max_response_time_ms"`
	Status2xx           int64            `json:"status_2xx"`
	Status3xx           int64            `json:"status_3xx"`
	Status4xx           int64            `json:"status_4xx"`
	Status5xx           int64            `json:"status_5xx"`
	StaticAssetRequests int64            `json:"static_asset_requests"`
	StaticAssetErrors   int64            `json:"static_asset_errors"`
	CompressedResponses int64            `json:"compressed_responses"`
	CompressionSavings  int64            `json:"compression_savings_bytes"`
	ActiveConnections   int64            `json:"active_connections"`
	ResponseTimeBuckets map[string]int64 `json:"response_time_buckets"`
	Uptime              time.Duration    `json:"uptime"`
}

// ErrorRate calculates the error rate as a percentage
func (s MetricsSnapshot) ErrorRate() float64 {
	if s.TotalRequests == 0 {
		return 0
	}
	return float64(s.TotalErrors) / float64(s.TotalRequests) * 100
}

// CompressionRate calculates the compression rate as a percentage
func (s MetricsSnapshot) CompressionRate() float64 {
	if s.TotalRequests == 0 {
		return 0
	}
	return float64(s.CompressedResponses) / float64(s.TotalRequests) * 100
}

// StaticAssetErrorRate calculates the static asset error rate as a percentage
func (s MetricsSnapshot) StaticAssetErrorRate() float64 {
	if s.StaticAssetRequests == 0 {
		return 0
	}
	return float64(s.StaticAssetErrors) / float64(s.StaticAssetRequests) * 100
}
