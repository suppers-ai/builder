package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
	
	"github.com/google/uuid"

	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/views/pages"
	"github.com/suppers-ai/logger"
)

// LogsPage renders the logs management page
func LogsPage(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		userEmail, _ := h.GetUserEmail(r)
		ctx := h.NewContext()
		
		// Get query params
		searchQuery := r.URL.Query().Get("search")
		level := r.URL.Query().Get("level")
		timeRange := r.URL.Query().Get("range")
		if timeRange == "" {
			timeRange = "24h"
		}
		
		// Get pagination params
		page := 1
		if p := r.URL.Query().Get("page"); p != "" {
			if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
				page = parsed
			}
		}
		
		pageSize := 100
		if ps := r.URL.Query().Get("size"); ps != "" {
			if parsed, err := strconv.Atoi(ps); err == nil && parsed > 0 {
				pageSize = parsed
			}
		}
		
		offset := (page - 1) * pageSize
		
		// Calculate time filter (for future use)
		// var startTime time.Time
		// now := time.Now()
		// switch timeRange {
		// case "1h":
		// 	startTime = now.Add(-1 * time.Hour)
		// case "6h":
		// 	startTime = now.Add(-6 * time.Hour)
		// case "24h":
		// 	startTime = now.Add(-24 * time.Hour)
		// case "7d":
		// 	startTime = now.Add(-7 * 24 * time.Hour)
		// case "30d":
		// 	startTime = now.Add(-30 * 24 * time.Hour)
		// default:
		// 	startTime = time.Time{}
		// }
		
		// Get logs from database
		logs, total, err := svc.GetLogs(ctx, level, pageSize, offset)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to get logs", logger.Err(err))
			logs = []services.LogEntry{}
		}
		
		// Convert to page data format
		pageLogs := make([]pages.LogEntry, len(logs))
		for i, log := range logs {
			// Extract additional fields from context if available
			path := ""
			method := ""
			status := 0
			duration := ""
			userIP := ""
			userID := ""
			errorMsg := ""
			
			if log.Context != nil {
				if v, ok := log.Context["path"].(string); ok {
					path = v
				}
				if v, ok := log.Context["method"].(string); ok {
					method = v
				}
				if v, ok := log.Context["status"].(float64); ok {
					status = int(v)
				}
				if v, ok := log.Context["duration"].(float64); ok {
					duration = formatDuration(time.Duration(v))
				}
				if v, ok := log.Context["user_ip"].(string); ok {
					userIP = v
				}
				if v, ok := log.Context["user_id"].(string); ok {
					userID = v
				}
				if v, ok := log.Context["error"].(string); ok {
					errorMsg = v
				}
			}
			
			pageLogs[i] = pages.LogEntry{
				ID:        log.ID.String(),
				Level:     log.Level,
				Message:   log.Message,
				Path:      path,
				Method:    method,
				Status:    status,
				Duration:  duration,
				UserIP:    userIP,
				UserID:    userID,
				Error:     errorMsg,
				Details:   log.Context,
				CreatedAt: log.CreatedAt,
			}
		}
		
		data := pages.LogsPageData{
			UserEmail:     userEmail,
			Logs:          pageLogs,
			TotalLogs:     int(total),
			CurrentPage:   page,
			PageSize:      pageSize,
			LogLevels:     []string{"DEBUG", "INFO", "WARN", "ERROR"},
			SelectedLevel: level,
			SearchQuery:   searchQuery,
			TimeRange:     timeRange,
		}
		
		// Render with HTMX support
		h.RenderWithHTMX(w, r, pages.LogsPage(data), pages.LogsPartial(data))
	}
}

// LogDetailsHandler returns details for a specific log entry
func LogDetailsHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		logID := r.URL.Query().Get("id")
		if logID == "" {
			http.Error(w, "Log ID is required", http.StatusBadRequest)
			return
		}
		
		logUUID, err := uuid.Parse(logID)
		if err != nil {
			http.Error(w, "Invalid log ID", http.StatusBadRequest)
			return
		}
		
		log, err := svc.GetLogByID(ctx, logUUID)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to get log details", logger.Err(err))
			http.Error(w, "Log not found", http.StatusNotFound)
			return
		}
		
		// Extract additional fields from context if available
		path := ""
		method := ""
		status := 0
		duration := ""
		userIP := ""
		userID := ""
		errorMsg := ""
		stack := ""
		caller := ""
		
		if log.Context != nil {
			if v, ok := log.Context["path"].(string); ok {
				path = v
			}
			if v, ok := log.Context["method"].(string); ok {
				method = v
			}
			if v, ok := log.Context["status"].(float64); ok {
				status = int(v)
			}
			if v, ok := log.Context["duration"].(float64); ok {
				duration = formatDuration(time.Duration(v))
			}
			if v, ok := log.Context["user_ip"].(string); ok {
				userIP = v
			}
			if v, ok := log.Context["user_id"].(string); ok {
				userID = v
			}
			if v, ok := log.Context["error"].(string); ok {
				errorMsg = v
			}
			if v, ok := log.Context["stack"].(string); ok {
				stack = v
			}
			if v, ok := log.Context["caller"].(string); ok {
				caller = v
			}
		}
		
		// Format log details for display
		details := map[string]interface{}{
			"id":        log.ID,
			"level":     log.Level,
			"message":   log.Message,
			"path":      path,
			"method":    method,
			"status":    status,
			"duration":  duration,
			"userIP":    userIP,
			"userID":    userID,
			"error":     errorMsg,
			"details":   log.Context,
			"createdAt": log.CreatedAt.Format("2006-01-02 15:04:05"),
			"stack":     stack,
			"caller":    caller,
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(details)
	}
}

// LogsStatsHandler returns statistics for the logs graph
func LogsStatsHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		timeRange := r.URL.Query().Get("range")
		if timeRange == "" {
			timeRange = "24h"
		}
		
		// Calculate time filter (for future use)
		// now := time.Now()
		// var startTime time.Time
		// var interval string
		// 
		// switch timeRange {
		// case "1h":
		// 	startTime = now.Add(-1 * time.Hour)
		// 	interval = "5m"
		// case "6h":
		// 	startTime = now.Add(-6 * time.Hour)
		// 	interval = "30m"
		// case "24h":
		// 	startTime = now.Add(-24 * time.Hour)
		// 	interval = "1h"
		// case "7d":
		// 	startTime = now.Add(-7 * 24 * time.Hour)
		// 	interval = "6h"
		// case "30d":
		// 	startTime = now.Add(-30 * 24 * time.Hour)
		// 	interval = "1d"
		// default:
		// 	startTime = now.Add(-24 * time.Hour)
		// 	interval = "1h"
		// }
		
		stats, err := svc.GetLogStats(ctx)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to get log stats", logger.Err(err))
			http.Error(w, "Failed to get statistics", http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
	}
}

// ClearLogsHandler deletes old logs
func ClearLogsHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		// Parse request body
		var req struct {
			OlderThan string `json:"olderThan"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		
		var olderThan time.Duration
		switch req.OlderThan {
		case "1h":
			olderThan = 1 * time.Hour
		case "24h":
			olderThan = 24 * time.Hour
		case "7d":
			olderThan = 7 * 24 * time.Hour
		case "30d":
			olderThan = 30 * 24 * time.Hour
		case "all":
			olderThan = 100 * 365 * 24 * time.Hour // Very old
		default:
			olderThan = 7 * 24 * time.Hour
		}
		
		count, err := svc.ClearLogs(ctx, olderThan)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to clear logs", logger.Err(err))
			http.Error(w, "Failed to clear logs", http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": fmt.Sprintf("Cleared %d logs", count),
			"count":   count,
		})
	}
}

// ExportLogsHandler exports logs to CSV
func ExportLogsHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		// Get query params
		// searchQuery := r.URL.Query().Get("search")  // For future filtering
		level := r.URL.Query().Get("level")
		// timeRange := r.URL.Query().Get("range")  // For future filtering
		
		// Calculate time filter (for future use)
		// var startTime time.Time
		// now := time.Now()
		// switch timeRange {
		// case "1h":
		// 	startTime = now.Add(-1 * time.Hour)
		// case "6h":
		// 	startTime = now.Add(-6 * time.Hour)
		// case "24h":
		// 	startTime = now.Add(-24 * time.Hour)
		// case "7d":
		// 	startTime = now.Add(-7 * 24 * time.Hour)
		// case "30d":
		// 	startTime = now.Add(-30 * 24 * time.Hour)
		// default:
		// 	startTime = time.Time{}
		// }
		
		// Get all matching logs (no pagination for export)
		logs, _, err := svc.GetLogs(ctx, level, 10000, 0)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to export logs", logger.Err(err))
			http.Error(w, "Failed to export logs", http.StatusInternalServerError)
			return
		}
		
		// Create CSV content
		var csv strings.Builder
		csv.WriteString("Time,Level,Method,Path,Status,Duration,Message,User,IP,Error\n")
		
		for _, log := range logs {
			// Extract fields from context
			method := ""
			path := ""
			status := 0
			duration := ""
			userID := ""
			userIP := ""
			errorMsg := ""
			
			if log.Context != nil {
				if v, ok := log.Context["method"].(string); ok {
					method = v
				}
				if v, ok := log.Context["path"].(string); ok {
					path = v
				}
				if v, ok := log.Context["status"].(float64); ok {
					status = int(v)
				}
				if v, ok := log.Context["duration"].(float64); ok {
					duration = formatDuration(time.Duration(v))
				}
				if v, ok := log.Context["user_id"].(string); ok {
					userID = v
				}
				if v, ok := log.Context["user_ip"].(string); ok {
					userIP = v
				}
				if v, ok := log.Context["error"].(string); ok {
					errorMsg = v
				}
			}
			
			csv.WriteString(fmt.Sprintf("%s,%s,%s,%s,%d,%s,\"%s\",%s,%s,\"%s\"\n",
				log.CreatedAt.Format("2006-01-02 15:04:05"),
				log.Level,
				method,
				path,
				status,
				duration,
				strings.ReplaceAll(log.Message, "\"", "\"\""),
				userID,
				userIP,
				strings.ReplaceAll(errorMsg, "\"", "\"\""),
			))
		}
		
		// Set headers for download
		fileName := fmt.Sprintf("logs_%s.csv", time.Now().Format("2006-01-02"))
		w.Header().Set("Content-Type", "text/csv")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileName))
		
		w.Write([]byte(csv.String()))
	}
}

// Helper function to format duration
func formatDuration(d time.Duration) string {
	if d == 0 {
		return "-"
	}
	if d < time.Millisecond {
		return fmt.Sprintf("%dµs", d.Microseconds())
	}
	if d < time.Second {
		return fmt.Sprintf("%dms", d.Milliseconds())
	}
	return fmt.Sprintf("%.2fs", d.Seconds())
}