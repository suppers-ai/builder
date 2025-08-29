package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/logger"
)

// LogsService handles log operations
type LogsService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewLogsService creates a new logs service
func NewLogsService(db *gorm.DB, logger logger.Logger) *LogsService {
	return &LogsService{
		db:     db,
		logger: logger,
	}
}

// LogEntry represents a log entry for the UI
type LogEntry struct {
	ID        uuid.UUID              `json:"id"`
	Level     string                 `json:"level"`
	Message   string                 `json:"message"`
	Context   map[string]interface{} `json:"context"`
	CreatedAt time.Time              `json:"created_at"`
}

// GetLogs retrieves logs with pagination and filtering
func (s *LogsService) GetLogs(ctx context.Context, level string, limit, offset int) ([]LogEntry, int64, error) {
	query := s.db.WithContext(ctx).Model(&models.Log{})
	
	if level != "" && level != "all" {
		query = query.Where("level = ?", level)
	}
	
	var total int64
	query.Count(&total)
	
	var logs []models.Log
	err := query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&logs).Error
	
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get logs: %w", err)
	}
	
	entries := make([]LogEntry, len(logs))
	for i, log := range logs {
		contextMap := make(map[string]interface{})
		if err := log.Fields.Unmarshal(&contextMap); err != nil {
			s.logger.Error(ctx, "Failed to unmarshal log context", logger.Err(err))
		}
		
		entries[i] = LogEntry{
			ID:        log.ID,
			Level:     log.Level,
			Message:   log.Message,
			Context:   contextMap,
			CreatedAt: log.CreatedAt,
		}
	}
	
	return entries, total, nil
}

// GetLogByID retrieves a specific log by ID
func (s *LogsService) GetLogByID(ctx context.Context, id uuid.UUID) (*LogEntry, error) {
	var log models.Log
	err := s.db.WithContext(ctx).Where("id = ?", id).First(&log).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("log not found")
		}
		return nil, fmt.Errorf("failed to get log: %w", err)
	}
	
	contextMap := make(map[string]interface{})
	if err := log.Fields.Unmarshal(&contextMap); err != nil {
		s.logger.Error(ctx, "Failed to unmarshal log context", logger.Err(err))
	}
	
	entry := &LogEntry{
		ID:        log.ID,
		Level:     log.Level,
		Message:   log.Message,
		Context:   contextMap,
		CreatedAt: log.CreatedAt,
	}
	
	return entry, nil
}

// GetLogStats retrieves log statistics
func (s *LogsService) GetLogStats(ctx context.Context) (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	
	// Total logs
	var total int64
	s.db.WithContext(ctx).Model(&models.Log{}).Count(&total)
	stats["total"] = total
	
	// Logs by level
	type LevelCount struct {
		Level string
		Count int64
	}
	var levelCounts []LevelCount
	s.db.WithContext(ctx).Model(&models.Log{}).
		Select("level, COUNT(*) as count").
		Group("level").
		Scan(&levelCounts)
	
	levelMap := make(map[string]int64)
	for _, lc := range levelCounts {
		levelMap[lc.Level] = lc.Count
	}
	stats["by_level"] = levelMap
	
	// Recent logs (last 24 hours)
	var recent int64
	s.db.WithContext(ctx).Model(&models.Log{}).
		Where("created_at > ?", time.Now().Add(-24*time.Hour)).
		Count(&recent)
	stats["recent_24h"] = recent
	
	// Error rate (errors / total)
	var errors int64
	s.db.WithContext(ctx).Model(&models.Log{}).
		Where("level = ?", "error").
		Count(&errors)
	
	errorRate := float64(0)
	if total > 0 {
		errorRate = float64(errors) / float64(total) * 100
	}
	stats["error_rate"] = errorRate
	
	return stats, nil
}

// ClearLogs clears logs older than the specified duration
func (s *LogsService) ClearLogs(ctx context.Context, olderThan time.Duration) (int64, error) {
	cutoff := time.Now().Add(-olderThan)
	
	result := s.db.WithContext(ctx).
		Where("created_at < ?", cutoff).
		Delete(&models.Log{})
	
	if result.Error != nil {
		return 0, fmt.Errorf("failed to clear logs: %w", result.Error)
	}
	
	return result.RowsAffected, nil
}