package services

import (
	"fmt"
	"time"
)

// FormatBytes formats bytes to human readable string
func FormatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// CollectionInfo represents collection information for the UI
type CollectionInfo struct {
	Name          string                 `json:"name"`
	DisplayName   string                 `json:"display_name"`
	RecordCount   int64                  `json:"record_count"`
	Schema        map[string]interface{} `json:"schema"`
	SchemaPreview string                 `json:"schema_preview"`
	Type          string                 `json:"type"`
	CreatedAt     string                 `json:"created_at"`
	LastUpdated   string                 `json:"last_updated"`
}

// DashboardStats represents dashboard statistics
type DashboardStats struct {
	TotalUsers       int64              `json:"total_users"`
	TotalCollections int64              `json:"total_collections"`
	TotalRecords     int64              `json:"total_records"`
	TotalStorage     int64              `json:"total_storage"`
	DatabaseSize     int64              `json:"database_size"`
	FormattedStorage string             `json:"formatted_storage"`
	FormattedDBSize  string             `json:"formatted_db_size"`
	SystemStats      *SystemStats       `json:"system_stats"`
	ActiveUsers      int64              `json:"active_users"`
	APIRequests      int64              `json:"api_requests"`
	StorageStats     map[string]int64   `json:"storage_stats"`
	UserGrowth       []ChartDataPoint   `json:"user_growth"`
	APIActivity      []ChartDataPoint   `json:"api_activity"`
	LogStats         []ChartDataPoint   `json:"log_stats"`
}

// ChartDataPoint represents a data point for charts
type ChartDataPoint struct {
	Label string  `json:"label"`
	Value float64 `json:"value"`
}

// BucketInfo represents storage bucket information with stats
type BucketInfo struct {
	Name      string    `json:"name"`
	Public    bool      `json:"public"`
	FileCount int       `json:"file_count"`
	TotalSize int64     `json:"total_size"`
	CreatedAt time.Time `json:"created_at"`
}

// UserInfo represents user information for UI display
type UserInfo struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	Role        string    `json:"role"`
	Confirmed   bool      `json:"confirmed"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
}

// UserRole represents a user role
type UserRole string

const (
	UserRoleUser    UserRole = "user"
	UserRoleManager UserRole = "manager"
	UserRoleAdmin   UserRole = "admin"
	UserRoleDeleted UserRole = "deleted"
)