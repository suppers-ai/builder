package storage

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/datatypes"
)

var dbType = "postgres" // Default to postgres

// InitModels initializes the models with the database type
func InitModels(databaseType string) {
	dbType = databaseType
}

// getTableName returns the table name based on database type
func getTableName(schema, table string) string {
	// SQLite doesn't support schemas
	if dbType == "sqlite" || dbType == "sqlite3" {
		return table
	}
	// PostgreSQL and MySQL support schemas
	return schema + "." + table
}

// Bucket represents a storage bucket
type Bucket struct {
	ID               uuid.UUID      `gorm:"type:char(36);primary_key" json:"id"`
	Name             string         `gorm:"uniqueIndex;not null;size:255" json:"name"`
	Public           bool           `gorm:"default:false" json:"public"`
	FileSizeLimit    *int64         `json:"file_size_limit,omitempty"`
	AllowedMimeTypes datatypes.JSON `gorm:"type:text" json:"allowed_mime_types,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`

	// Relationships
	Objects []StorageObject `gorm:"foreignKey:BucketID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name
func (Bucket) TableName() string {
	return getTableName("storage", "buckets")
}

// BeforeCreate hook
func (b *Bucket) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// StorageObject represents a stored file/object in the database
// Named StorageObject to avoid conflict with the Object struct used for provider operations
type StorageObject struct {
	ID        uuid.UUID      `gorm:"type:char(36);primary_key" json:"id"`
	BucketID  uuid.UUID      `gorm:"type:char(36);not null;index" json:"bucket_id"`
	Name      string         `gorm:"not null;size:255" json:"name"`
	Path      string         `gorm:"not null;index" json:"path"`
	MimeType  string         `gorm:"size:255" json:"mime_type,omitempty"`
	Size      int64          `json:"size"`
	Content   []byte         `json:"-"` // Store file content - GORM will use bytea for PostgreSQL
	Metadata  datatypes.JSON `gorm:"type:text" json:"metadata,omitempty"`
	UserID    *uuid.UUID     `gorm:"type:char(36);index" json:"user_id,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`

	// Relationships
	Bucket Bucket `gorm:"foreignKey:BucketID" json:"-"`
}

// TableName specifies the table name
func (StorageObject) TableName() string {
	return getTableName("storage", "objects")
}

// BeforeCreate hook
func (o *StorageObject) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}