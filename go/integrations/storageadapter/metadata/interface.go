package metadata

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ObjectType represents the type of storage object
type ObjectType string

const (
	ObjectTypeFile   ObjectType = "file"
	ObjectTypeFolder ObjectType = "folder"
)

// PermissionLevel represents the permission level for sharing
type PermissionLevel string

const (
	PermissionView  PermissionLevel = "view"
	PermissionEdit  PermissionLevel = "edit"
	PermissionAdmin PermissionLevel = "admin"
)

// ActionType represents the type of action in access logs
type ActionType string

const (
	ActionView     ActionType = "view"
	ActionDownload ActionType = "download"
	ActionUpload   ActionType = "upload"
	ActionDelete   ActionType = "delete"
	ActionShare    ActionType = "share"
	ActionEdit     ActionType = "edit"
)

// JSONB represents a JSONB field
type JSONB map[string]interface{}

// Value implements the driver.Valuer interface
func (j JSONB) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = make(map[string]interface{})
		return nil
	}
	
	bytes, ok := value.([]byte)
	if !ok {
		return json.Unmarshal([]byte(value.(string)), j)
	}
	return json.Unmarshal(bytes, j)
}

// StorageObject represents a file or folder in storage
type StorageObject struct {
	ID              uuid.UUID  `json:"id"`
	UserID          uuid.UUID  `json:"user_id"`
	Name            string     `json:"name"`
	ParentFolderID  *uuid.UUID `json:"parent_folder_id,omitempty"`
	ObjectType      ObjectType `json:"object_type"`
	PathSegments    []string   `json:"path_segments"`
	FilePath        string     `json:"file_path"`
	FileSize        int64      `json:"file_size"`
	MimeType        string     `json:"mime_type"`
	Metadata        JSONB      `json:"metadata"`
	ThumbnailURL    *string    `json:"thumbnail_url,omitempty"`
	Checksum        *string    `json:"checksum,omitempty"`
	StorageProvider string     `json:"storage_provider"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// StorageShare represents a sharing configuration for an object
type StorageShare struct {
	ID               uuid.UUID        `json:"id"`
	ObjectID         uuid.UUID        `json:"object_id"`
	SharedWithUserID *uuid.UUID       `json:"shared_with_user_id,omitempty"`
	SharedWithEmail  *string          `json:"shared_with_email,omitempty"`
	PermissionLevel  PermissionLevel  `json:"permission_level"`
	InheritToChildren bool            `json:"inherit_to_children"`
	ShareToken       *string          `json:"share_token,omitempty"`
	IsPublic         bool             `json:"is_public"`
	ExpiresAt        *time.Time       `json:"expires_at,omitempty"`
	CreatedBy        uuid.UUID        `json:"created_by"`
	CreatedAt        time.Time        `json:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at"`
}

// AccessLog represents an access log entry
type AccessLog struct {
	ID         uuid.UUID  `json:"id"`
	ObjectID   uuid.UUID  `json:"object_id"`
	UserID     *uuid.UUID `json:"user_id,omitempty"`
	IPAddress  *string    `json:"ip_address,omitempty"`
	Action     ActionType `json:"action"`
	UserAgent  *string    `json:"user_agent,omitempty"`
	Metadata   JSONB      `json:"metadata"`
	CreatedAt  time.Time  `json:"created_at"`
}

// StorageQuota represents storage quota for a user
type StorageQuota struct {
	ID               uuid.UUID  `json:"id"`
	UserID           uuid.UUID  `json:"user_id"`
	MaxStorageBytes  int64      `json:"max_storage_bytes"`
	MaxBandwidthBytes int64     `json:"max_bandwidth_bytes"`
	StorageUsed      int64      `json:"storage_used"`
	BandwidthUsed    int64      `json:"bandwidth_used"`
	ResetBandwidthAt *time.Time `json:"reset_bandwidth_at,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// ListObjectsOptions contains options for listing objects
type ListObjectsOptions struct {
	UserID         uuid.UUID
	ParentFolderID *uuid.UUID
	ObjectType     *ObjectType
	Prefix         string
	Limit          int
	Offset         int
}

// CreateShareOptions contains options for creating a share
type CreateShareOptions struct {
	ObjectID         uuid.UUID
	SharedWithUserID *uuid.UUID
	SharedWithEmail  *string
	PermissionLevel  PermissionLevel
	InheritToChildren bool
	ExpiresAt        *time.Time
	CreatedBy        uuid.UUID
}

// MetadataStore is the interface for metadata storage operations
type MetadataStore interface {
	// Object operations
	CreateObject(ctx context.Context, obj *StorageObject) error
	GetObject(ctx context.Context, id uuid.UUID) (*StorageObject, error)
	GetObjectByPath(ctx context.Context, userID uuid.UUID, path string) (*StorageObject, error)
	UpdateObject(ctx context.Context, obj *StorageObject) error
	DeleteObject(ctx context.Context, id uuid.UUID) error
	ListObjects(ctx context.Context, opts *ListObjectsOptions) ([]*StorageObject, error)
	GetObjectChildren(ctx context.Context, parentID uuid.UUID) ([]*StorageObject, error)
	
	// Share operations
	CreateShare(ctx context.Context, share *StorageShare) error
	GetShare(ctx context.Context, id uuid.UUID) (*StorageShare, error)
	GetShareByToken(ctx context.Context, token string) (*StorageShare, error)
	UpdateShare(ctx context.Context, share *StorageShare) error
	DeleteShare(ctx context.Context, id uuid.UUID) error
	ListSharesForObject(ctx context.Context, objectID uuid.UUID) ([]*StorageShare, error)
	ListSharesForUser(ctx context.Context, userID uuid.UUID) ([]*StorageShare, error)
	CheckPermission(ctx context.Context, userID, objectID uuid.UUID, permission PermissionLevel) (bool, error)
	
	// Access log operations
	LogAccess(ctx context.Context, log *AccessLog) error
	GetAccessLogs(ctx context.Context, objectID uuid.UUID, limit int) ([]*AccessLog, error)
	
	// Quota operations
	GetQuota(ctx context.Context, userID uuid.UUID) (*StorageQuota, error)
	CreateOrUpdateQuota(ctx context.Context, quota *StorageQuota) error
	IncrementStorageUsage(ctx context.Context, userID uuid.UUID, delta int64) error
	IncrementBandwidthUsage(ctx context.Context, userID uuid.UUID, delta int64) error
	
	// Transaction support
	BeginTx(ctx context.Context) (MetadataStore, error)
	Commit() error
	Rollback() error
}