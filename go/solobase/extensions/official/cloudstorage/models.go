package cloudstorage

import (
	"time"
	"gorm.io/gorm"
)

// StorageShare represents a shared link for a file or folder
type StorageShare struct {
	ID             string    `gorm:"primaryKey" json:"id"`
	ObjectID       string    `gorm:"not null;index" json:"object_id"`
	BucketName     string    `gorm:"not null;index" json:"bucket_name"`
	ShareToken     string    `gorm:"uniqueIndex;not null" json:"share_token"`
	CreatedBy      string    `gorm:"not null;index" json:"created_by"`
	ExpiresAt      *time.Time `json:"expires_at,omitempty"`
	AccessCount    int       `gorm:"default:0" json:"access_count"`
	MaxAccessCount *int      `json:"max_access_count,omitempty"`
	Password       string    `json:"-"` // Hashed password for protected shares
	AllowDownload  bool      `gorm:"default:true" json:"allow_download"`
	AllowUpload    bool      `gorm:"default:false" json:"allow_upload"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// TableName specifies the table name
func (StorageShare) TableName() string {
	return "ext_cloudstorage_shares"
}

// StorageAccessLog tracks access to storage objects
type StorageAccessLog struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	ObjectID    string    `gorm:"index" json:"object_id"`
	BucketName  string    `gorm:"index" json:"bucket_name"`
	UserID      string    `gorm:"index" json:"user_id,omitempty"`
	ShareID     string    `gorm:"index" json:"share_id,omitempty"`
	Action      string    `gorm:"not null" json:"action"` // upload, download, delete, view
	IPAddress   string    `json:"ip_address"`
	UserAgent   string    `json:"user_agent"`
	Success     bool      `json:"success"`
	ErrorMsg    string    `json:"error_msg,omitempty"`
	BytesSize   int64     `json:"bytes_size,omitempty"`
	Duration    int64     `json:"duration_ms,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// TableName specifies the table name
func (StorageAccessLog) TableName() string {
	return "ext_cloudstorage_access_logs"
}

// StorageQuota defines storage limits for users
type StorageQuota struct {
	ID              string    `gorm:"primaryKey" json:"id"`
	UserID          string    `gorm:"uniqueIndex;not null" json:"user_id"`
	MaxStorage      int64     `gorm:"not null" json:"max_storage"` // Max storage in bytes
	UsedStorage     int64     `gorm:"default:0" json:"used_storage"` // Current usage in bytes
	MaxFileSize     int64     `json:"max_file_size,omitempty"` // Max size per file
	MaxFileCount    *int64    `json:"max_file_count,omitempty"` // Max number of files
	CurrentFileCount int64    `gorm:"default:0" json:"current_file_count"`
	AllowPublic     bool      `gorm:"default:false" json:"allow_public"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// TableName specifies the table name
func (StorageQuota) TableName() string {
	return "ext_cloudstorage_quotas"
}

// StorageVersion tracks file versions
type StorageVersion struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	ObjectID    string    `gorm:"index" json:"object_id"`
	BucketName  string    `gorm:"index" json:"bucket_name"`
	VersionNum  int       `gorm:"not null" json:"version_num"`
	ObjectKey   string    `gorm:"not null" json:"object_key"`
	Size        int64     `json:"size"`
	ContentType string    `json:"content_type"`
	Checksum    string    `json:"checksum"`
	CreatedBy   string    `json:"created_by"`
	Comment     string    `json:"comment,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// TableName specifies the table name
func (StorageVersion) TableName() string {
	return "ext_cloudstorage_versions"
}

// StorageTag represents tags for objects
type StorageTag struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	ObjectID   string    `gorm:"index" json:"object_id"`
	BucketName string    `gorm:"index" json:"bucket_name"`
	Key        string    `gorm:"not null;index" json:"key"`
	Value      string    `gorm:"not null" json:"value"`
	CreatedAt  time.Time `json:"created_at"`
}

// TableName specifies the table name
func (StorageTag) TableName() string {
	return "ext_cloudstorage_tags"
}

// StoragePolicy defines access policies for buckets
type StoragePolicy struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	BucketName  string    `gorm:"index;not null" json:"bucket_name"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Rules       string    `gorm:"type:text" json:"rules"` // JSON policy rules
	Priority    int       `gorm:"default:0" json:"priority"`
	Enabled     bool      `gorm:"default:true" json:"enabled"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName specifies the table name
func (StoragePolicy) TableName() string {
	return "ext_cloudstorage_policies"
}

// StorageWebhook defines webhooks for storage events
type StorageWebhook struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	BucketName string    `gorm:"index" json:"bucket_name,omitempty"`
	Name       string    `gorm:"not null" json:"name"`
	URL        string    `gorm:"not null" json:"url"`
	Events     string    `gorm:"type:text" json:"events"` // JSON array of events
	Headers    string    `gorm:"type:text" json:"headers,omitempty"` // JSON object of headers
	Active     bool      `gorm:"default:true" json:"active"`
	CreatedBy  string    `json:"created_by"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// TableName specifies the table name
func (StorageWebhook) TableName() string {
	return "ext_cloudstorage_webhooks"
}

// AutoMigrate runs GORM auto-migration for all CloudStorage models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&StorageShare{},
		&StorageAccessLog{},
		&StorageQuota{},
		&StorageVersion{},
		&StorageTag{},
		&StoragePolicy{},
		&StorageWebhook{},
	)
}