package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Bucket represents a storage bucket
type Bucket struct {
	ID              uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	Name            string    `gorm:"uniqueIndex;not null;size:255" json:"name"`
	Public          bool      `gorm:"default:false" json:"public"`
	FileSizeLimit   *int64    `json:"file_size_limit,omitempty"`
	AllowedMimeTypes JSON      `gorm:"type:text" json:"allowed_mime_types,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// Relationships
	Objects []Object `gorm:"foreignKey:BucketID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name
func (Bucket) TableName() string {
	return "storage_buckets"
}

// BeforeCreate hook
func (b *Bucket) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// Object represents a stored file/object
type Object struct {
	ID          uuid.UUID  `gorm:"type:char(36);primary_key" json:"id"`
	BucketID    uuid.UUID  `gorm:"type:char(36);not null;index" json:"bucket_id"`
	Name        string     `gorm:"not null;size:255" json:"name"`
	Path        string     `gorm:"not null;index" json:"path"`
	MimeType    string     `gorm:"size:255" json:"mime_type,omitempty"`
	Size        int64      `json:"size"`
	Content     []byte     `json:"-"` // Store file content - GORM will use bytea for PostgreSQL
	Metadata    JSON       `gorm:"type:text" json:"metadata,omitempty"`
	UserID      *uuid.UUID `gorm:"type:char(36);index" json:"user_id,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Relationships
	Bucket Bucket `gorm:"foreignKey:BucketID" json:"-"`
	User   *User  `gorm:"foreignKey:UserID" json:"-"`
}

// TableName specifies the table name
func (Object) TableName() string {
	return "storage_objects"
}

// BeforeCreate hook
func (o *Object) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// Add compound unique index for bucket_id, path, and name
func (o *Object) AfterCreate(tx *gorm.DB) error {
	return tx.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_bucket_path_name ON storage_objects(bucket_id, path, name)").Error
}