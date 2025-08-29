package unit

import (
	"testing"
	"time"

	"github.com/suppers-ai/formulapricing-site/metrics"
)

func TestMetricsBasicFunctionality(t *testing.T) {
	m := metrics.NewMetrics()

	// Test initial state
	snapshot := m.GetSnapshot()
	if snapshot.TotalRequests != 0 {
		t.Errorf("Expected 0 total requests, got %d", snapshot.TotalRequests)
	}

	// Record a successful request
	m.RecordRequest(200, 50*time.Millisecond, 1024, true)

	snapshot = m.GetSnapshot()
	if snapshot.TotalRequests != 1 {
		t.Errorf("Expected 1 total request, got %d", snapshot.TotalRequests)
	}

	if snapshot.Status2xx != 1 {
		t.Errorf("Expected 1 2xx status, got %d", snapshot.Status2xx)
	}

	if snapshot.CompressedResponses != 1 {
		t.Errorf("Expected 1 compressed response, got %d", snapshot.CompressedResponses)
	}

	if snapshot.AverageResponseTime != 50.0 {
		t.Errorf("Expected 50ms average response time, got %.2f", snapshot.AverageResponseTime)
	}
}

func TestMetricsErrorTracking(t *testing.T) {
	m := metrics.NewMetrics()

	// Record error requests
	m.RecordRequest(404, 10*time.Millisecond, 512, false)
	m.RecordRequest(500, 100*time.Millisecond, 256, false)

	snapshot := m.GetSnapshot()
	if snapshot.TotalErrors != 2 {
		t.Errorf("Expected 2 total errors, got %d", snapshot.TotalErrors)
	}

	if snapshot.Status4xx != 1 {
		t.Errorf("Expected 1 4xx status, got %d", snapshot.Status4xx)
	}

	if snapshot.Status5xx != 1 {
		t.Errorf("Expected 1 5xx status, got %d", snapshot.Status5xx)
	}

	errorRate := snapshot.ErrorRate()
	if errorRate != 100.0 {
		t.Errorf("Expected 100%% error rate, got %.2f%%", errorRate)
	}
}

func TestMetricsStaticAssets(t *testing.T) {
	m := metrics.NewMetrics()

	// Record static asset requests
	m.RecordStaticAssetRequest(true)
	m.RecordStaticAssetRequest(true)
	m.RecordStaticAssetRequest(false) // Error

	snapshot := m.GetSnapshot()
	if snapshot.StaticAssetRequests != 3 {
		t.Errorf("Expected 3 static asset requests, got %d", snapshot.StaticAssetRequests)
	}

	if snapshot.StaticAssetErrors != 1 {
		t.Errorf("Expected 1 static asset error, got %d", snapshot.StaticAssetErrors)
	}

	errorRate := snapshot.StaticAssetErrorRate()
	expectedRate := 100.0 / 3.0
	if errorRate < expectedRate-0.1 || errorRate > expectedRate+0.1 {
		t.Errorf("Expected %.2f%% static asset error rate, got %.2f%%", expectedRate, errorRate)
	}
}

func TestMetricsPanicAndTimeout(t *testing.T) {
	m := metrics.NewMetrics()

	// Record panics and timeouts
	m.RecordPanic()
	m.RecordPanic()
	m.RecordTimeout()

	snapshot := m.GetSnapshot()
	if snapshot.TotalPanics != 2 {
		t.Errorf("Expected 2 panics, got %d", snapshot.TotalPanics)
	}

	if snapshot.TotalTimeouts != 1 {
		t.Errorf("Expected 1 timeout, got %d", snapshot.TotalTimeouts)
	}
}

func TestMetricsActiveConnections(t *testing.T) {
	m := metrics.NewMetrics()

	// Test connection tracking
	m.IncrementActiveConnections()
	m.IncrementActiveConnections()
	m.IncrementActiveConnections()

	snapshot := m.GetSnapshot()
	if snapshot.ActiveConnections != 3 {
		t.Errorf("Expected 3 active connections, got %d", snapshot.ActiveConnections)
	}

	m.DecrementActiveConnections()
	snapshot = m.GetSnapshot()
	if snapshot.ActiveConnections != 2 {
		t.Errorf("Expected 2 active connections after decrement, got %d", snapshot.ActiveConnections)
	}
}

func TestMetricsResponseTimeHistogram(t *testing.T) {
	m := metrics.NewMetrics()

	// Record requests with different response times
	m.RecordRequest(200, 5*time.Millisecond, 100, false)    // <10ms
	m.RecordRequest(200, 25*time.Millisecond, 100, false)   // 10-50ms
	m.RecordRequest(200, 75*time.Millisecond, 100, false)   // 50-100ms
	m.RecordRequest(200, 250*time.Millisecond, 100, false)  // 100-500ms
	m.RecordRequest(200, 750*time.Millisecond, 100, false)  // 500ms-1s
	m.RecordRequest(200, 1500*time.Millisecond, 100, false) // >1s

	snapshot := m.GetSnapshot()

	if snapshot.ResponseTimeBuckets["<10ms"] != 1 {
		t.Errorf("Expected 1 request in <10ms bucket, got %d", snapshot.ResponseTimeBuckets["<10ms"])
	}

	if snapshot.ResponseTimeBuckets["10-50ms"] != 1 {
		t.Errorf("Expected 1 request in 10-50ms bucket, got %d", snapshot.ResponseTimeBuckets["10-50ms"])
	}

	if snapshot.ResponseTimeBuckets[">1s"] != 1 {
		t.Errorf("Expected 1 request in >1s bucket, got %d", snapshot.ResponseTimeBuckets[">1s"])
	}
}
