package models

import (
	"time"
)

// Site status constants
const (
	SiteStatusActive   = "active"
	SiteStatusInactive = "inactive"
	SiteStatusBuilding = "building"
	SiteStatusError    = "error"
)

// Build status constants
const (
	BuildStatusPending    = "pending"
	BuildStatusInProgress = "in_progress"
	BuildStatusCompleted  = "completed"
	BuildStatusFailed     = "failed"
)

// Backup status constants
const (
	BackupStatusPending    = "pending"
	BackupStatusInProgress = "in_progress"
	BackupStatusCompleted  = "completed"
	BackupStatusFailed     = "failed"
)

// Restore status constants
const (
	RestoreStatusPending    = "pending"
	RestoreStatusInProgress = "in_progress"
	RestoreStatusCompleted  = "completed"
	RestoreStatusFailed     = "failed"
)

// HugoSite represents a Hugo static site
type HugoSite struct {
	ID          string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UserID      string    `gorm:"type:varchar(36);index" json:"user_id"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Theme       string    `gorm:"type:varchar(100)" json:"theme"`
	Status      string    `gorm:"type:varchar(20);default:'active'" json:"status"`
	StoragePath string    `gorm:"type:varchar(500)" json:"storage_path"`
	BaseURL     string    `gorm:"type:varchar(500)" json:"base_url"`
	Config      string    `gorm:"type:text" json:"config"` // JSON config
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// HugoBuild represents a build of a Hugo site
type HugoBuild struct {
	ID          string     `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SiteID      string     `gorm:"type:varchar(36);index" json:"site_id"`
	Version     string     `gorm:"type:varchar(50)" json:"version"`
	Status      string     `gorm:"type:varchar(20)" json:"status"`
	StartedAt   time.Time  `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	Error       string     `gorm:"type:text" json:"error,omitempty"`
	OutputPath  string     `gorm:"type:varchar(500)" json:"output_path"`
	LogPath     string     `gorm:"type:varchar(500)" json:"log_path"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// HugoTheme represents an available Hugo theme
type HugoTheme struct {
	ID          string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name        string    `gorm:"type:varchar(100);unique;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Version     string    `gorm:"type:varchar(50)" json:"version"`
	Author      string    `gorm:"type:varchar(255)" json:"author"`
	Repository  string    `gorm:"type:varchar(500)" json:"repository"`
	Preview     string    `gorm:"type:varchar(500)" json:"preview"`
	Config      string    `gorm:"type:text" json:"config"` // Default config JSON
	Active      bool      `gorm:"default:true" json:"active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// HugoDomain represents a custom domain for a Hugo site
type HugoDomain struct {
	ID               string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SiteID           string    `gorm:"type:varchar(36);index" json:"site_id"`
	Domain           string    `gorm:"type:varchar(255);unique;not null" json:"domain"`
	Verified         bool      `gorm:"default:false" json:"verified"`
	VerificationCode string    `gorm:"type:varchar(100)" json:"verification_code"`
	SSL              bool      `gorm:"default:false" json:"ssl"`
	SSLCertificate   string    `gorm:"type:text" json:"ssl_certificate,omitempty"`
	SSLKey           string    `gorm:"type:text" json:"ssl_key,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// HugoBackup represents a backup of a Hugo site
type HugoBackup struct {
	ID          string     `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SiteID      string     `gorm:"type:varchar(36);index" json:"site_id"`
	Name        string     `gorm:"type:varchar(255);not null" json:"name"`
	Description string     `gorm:"type:text" json:"description"`
	Status      string     `gorm:"type:varchar(20)" json:"status"`
	Size        int64      `json:"size"`
	StoragePath string     `gorm:"type:varchar(500)" json:"storage_path"`
	Error       string     `gorm:"type:text" json:"error,omitempty"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// HugoRestore represents a restore operation from a backup
type HugoRestore struct {
	ID          string     `gorm:"primaryKey;type:varchar(36)" json:"id"`
	BackupID    string     `gorm:"type:varchar(36);index" json:"backup_id"`
	SiteID      string     `gorm:"type:varchar(36);index" json:"site_id"`
	Status      string     `gorm:"type:varchar(20)" json:"status"`
	Error       string     `gorm:"type:text" json:"error,omitempty"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// HugoAnalytics represents analytics data for a Hugo site
type HugoAnalytics struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SiteID    string    `gorm:"type:varchar(36);index" json:"site_id"`
	Date      time.Time `gorm:"type:date;index" json:"date"`
	Views     int64     `json:"views"`
	Visitors  int64     `json:"visitors"`
	Bandwidth int64     `json:"bandwidth"` // in bytes
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// HugoAnalyticsDaily represents daily analytics aggregation
type HugoAnalyticsDaily struct {
	ID           string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SiteID       string    `gorm:"type:varchar(36);index" json:"site_id"`
	Date         time.Time `gorm:"type:date;index" json:"date"`
	PageViews    int64     `json:"page_views"`
	UniqueVisits int64     `json:"unique_visits"`
	Bandwidth    int64     `json:"bandwidth"`
	TopPages     string    `gorm:"type:text" json:"top_pages"`     // JSON array
	TopReferrers string    `gorm:"type:text" json:"top_referrers"` // JSON array
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// HugoAnalyticsConfig represents analytics configuration for a site
type HugoAnalyticsConfig struct {
	ID              string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SiteID          string    `gorm:"type:varchar(36);unique;index" json:"site_id"`
	Enabled         bool      `gorm:"default:true" json:"enabled"`
	TrackingCode    string    `gorm:"type:varchar(100)" json:"tracking_code"`
	ExcludePatterns string    `gorm:"type:text" json:"exclude_patterns"` // JSON array
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// AnalyticsReport represents a generated analytics report
type AnalyticsReport struct {
	ID         string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SiteID     string    `gorm:"type:varchar(36);index" json:"site_id"`
	Type       string    `gorm:"type:varchar(50)" json:"type"` // daily, weekly, monthly
	StartDate  time.Time `json:"start_date"`
	EndDate    time.Time `json:"end_date"`
	Data       string    `gorm:"type:text" json:"data"` // JSON data
	FilePath   string    `gorm:"type:varchar(500)" json:"file_path"`
	GenerateAt time.Time `json:"generated_at"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// HugoVersion represents Hugo version information
type HugoVersion struct {
	ID          string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Version     string    `gorm:"type:varchar(50);unique;not null" json:"version"`
	ReleaseDate time.Time `json:"release_date"`
	Changelog   string    `gorm:"type:text" json:"changelog"`
	Features    string    `gorm:"type:text" json:"features"` // JSON array
	IsLatest    bool      `gorm:"default:false" json:"is_latest"`
	IsStable    bool      `gorm:"default:true" json:"is_stable"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// HugoVersionMigration represents a version migration record
type HugoVersionMigration struct {
	ID          string     `gorm:"primaryKey;type:varchar(36)" json:"id"`
	SiteID      string     `gorm:"type:varchar(36);index" json:"site_id"`
	FromVersion string     `gorm:"type:varchar(50)" json:"from_version"`
	ToVersion   string     `gorm:"type:varchar(50)" json:"to_version"`
	Status      string     `gorm:"type:varchar(20)" json:"status"`
	StartedAt   time.Time  `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	Error       string     `gorm:"type:text" json:"error,omitempty"`
	BackupID    string     `gorm:"type:varchar(36)" json:"backup_id"` // Auto backup before migration
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// HugoVersionNotification represents version update notifications
type HugoVersionNotification struct {
	ID          string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UserID      string    `gorm:"type:varchar(36);index" json:"user_id"`
	Version     string    `gorm:"type:varchar(50)" json:"version"`
	Type        string    `gorm:"type:varchar(50)" json:"type"` // update, security, feature
	Title       string    `gorm:"type:varchar(255)" json:"title"`
	Message     string    `gorm:"type:text" json:"message"`
	Read        bool      `gorm:"default:false" json:"read"`
	Dismissed   bool      `gorm:"default:false" json:"dismissed"`
	ActionURL   string    `gorm:"type:varchar(500)" json:"action_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}