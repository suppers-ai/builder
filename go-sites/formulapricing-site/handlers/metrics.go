package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/metrics"
)

// MetricsHandler returns an HTTP handler for exposing application metrics
func MetricsHandler(m *metrics.Metrics, log *logger.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				log.LogPanic(r.Context(), recovered, r)
				w.Header().Set("Content-Type", "text/plain")
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("Metrics endpoint panic"))
			}
		}()

		// Get current metrics snapshot
		snapshot := m.GetSnapshot()

		// Set appropriate headers
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")

		// Encode and send metrics
		if err := json.NewEncoder(w).Encode(snapshot); err != nil {
			log.LogError(r.Context(), "Failed to encode metrics", err, r)
			w.Header().Set("Content-Type", "text/plain")
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Failed to encode metrics"))
			return
		}
	}
}

// PrometheusMetricsHandler returns metrics in Prometheus format
func PrometheusMetricsHandler(m *metrics.Metrics, log *logger.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				log.LogPanic(r.Context(), recovered, r)
				w.Header().Set("Content-Type", "text/plain")
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("Prometheus metrics endpoint panic"))
			}
		}()

		snapshot := m.GetSnapshot()

		w.Header().Set("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")

		// Write Prometheus format metrics
		w.Write([]byte("# HELP formulapricing_requests_total Total number of HTTP requests\n"))
		w.Write([]byte("# TYPE formulapricing_requests_total counter\n"))
		w.Write([]byte("formulapricing_requests_total " + formatInt64(snapshot.TotalRequests) + "\n\n"))

		w.Write([]byte("# HELP formulapricing_errors_total Total number of HTTP errors\n"))
		w.Write([]byte("# TYPE formulapricing_errors_total counter\n"))
		w.Write([]byte("formulapricing_errors_total " + formatInt64(snapshot.TotalErrors) + "\n\n"))

		w.Write([]byte("# HELP formulapricing_panics_total Total number of panics\n"))
		w.Write([]byte("# TYPE formulapricing_panics_total counter\n"))
		w.Write([]byte("formulapricing_panics_total " + formatInt64(snapshot.TotalPanics) + "\n\n"))

		w.Write([]byte("# HELP formulapricing_response_time_avg Average response time in milliseconds\n"))
		w.Write([]byte("# TYPE formulapricing_response_time_avg gauge\n"))
		w.Write([]byte("formulapricing_response_time_avg " + formatFloat64(snapshot.AverageResponseTime) + "\n\n"))

		w.Write([]byte("# HELP formulapricing_response_time_min Minimum response time in milliseconds\n"))
		w.Write([]byte("# TYPE formulapricing_response_time_min gauge\n"))
		w.Write([]byte("formulapricing_response_time_min " + formatInt64(snapshot.MinResponseTime) + "\n\n"))

		w.Write([]byte("# HELP formulapricing_response_time_max Maximum response time in milliseconds\n"))
		w.Write([]byte("# TYPE formulapricing_response_time_max gauge\n"))
		w.Write([]byte("formulapricing_response_time_max " + formatInt64(snapshot.MaxResponseTime) + "\n\n"))

		// Status code metrics
		w.Write([]byte("# HELP formulapricing_requests_by_status HTTP requests by status code\n"))
		w.Write([]byte("# TYPE formulapricing_requests_by_status counter\n"))
		w.Write([]byte("formulapricing_requests_by_status{status=\"2xx\"} " + formatInt64(snapshot.Status2xx) + "\n"))
		w.Write([]byte("formulapricing_requests_by_status{status=\"3xx\"} " + formatInt64(snapshot.Status3xx) + "\n"))
		w.Write([]byte("formulapricing_requests_by_status{status=\"4xx\"} " + formatInt64(snapshot.Status4xx) + "\n"))
		w.Write([]byte("formulapricing_requests_by_status{status=\"5xx\"} " + formatInt64(snapshot.Status5xx) + "\n\n"))

		// Static asset metrics
		w.Write([]byte("# HELP formulapricing_static_requests_total Total static asset requests\n"))
		w.Write([]byte("# TYPE formulapricing_static_requests_total counter\n"))
		w.Write([]byte("formulapricing_static_requests_total " + formatInt64(snapshot.StaticAssetRequests) + "\n\n"))

		w.Write([]byte("# HELP formulapricing_static_errors_total Total static asset errors\n"))
		w.Write([]byte("# TYPE formulapricing_static_errors_total counter\n"))
		w.Write([]byte("formulapricing_static_errors_total " + formatInt64(snapshot.StaticAssetErrors) + "\n\n"))

		// Compression metrics
		w.Write([]byte("# HELP formulapricing_compressed_responses_total Total compressed responses\n"))
		w.Write([]byte("# TYPE formulapricing_compressed_responses_total counter\n"))
		w.Write([]byte("formulapricing_compressed_responses_total " + formatInt64(snapshot.CompressedResponses) + "\n\n"))

		w.Write([]byte("# HELP formulapricing_compression_savings_bytes Total bytes saved through compression\n"))
		w.Write([]byte("# TYPE formulapricing_compression_savings_bytes counter\n"))
		w.Write([]byte("formulapricing_compression_savings_bytes " + formatInt64(snapshot.CompressionSavings) + "\n\n"))

		// Active connections
		w.Write([]byte("# HELP formulapricing_active_connections Current active connections\n"))
		w.Write([]byte("# TYPE formulapricing_active_connections gauge\n"))
		w.Write([]byte("formulapricing_active_connections " + formatInt64(snapshot.ActiveConnections) + "\n\n"))

		// Response time histogram
		w.Write([]byte("# HELP formulapricing_response_time_histogram Response time distribution\n"))
		w.Write([]byte("# TYPE formulapricing_response_time_histogram counter\n"))
		for bucket, count := range snapshot.ResponseTimeBuckets {
			w.Write([]byte("formulapricing_response_time_histogram{bucket=\"" + bucket + "\"} " + formatInt64(count) + "\n"))
		}
		w.Write([]byte("\n"))

		// Uptime
		w.Write([]byte("# HELP formulapricing_uptime_seconds Application uptime in seconds\n"))
		w.Write([]byte("# TYPE formulapricing_uptime_seconds gauge\n"))
		w.Write([]byte("formulapricing_uptime_seconds " + formatFloat64(snapshot.Uptime.Seconds()) + "\n\n"))
	}
}

// Helper functions for formatting metrics values
func formatInt64(value int64) string {
	if value == int64(^uint64(0)>>1) { // Max int64 value (used for uninitialized min)
		return "0"
	}
	return fmt.Sprintf("%d", value)
}

func formatFloat64(value float64) string {
	return fmt.Sprintf("%.2f", value)
}
