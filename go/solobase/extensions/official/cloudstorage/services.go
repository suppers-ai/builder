package cloudstorage

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"
	pkgstorage "github.com/suppers-ai/storage"
	"gorm.io/gorm"
)

// ShareService manages file sharing
type ShareService struct {
	db      *gorm.DB
	manager *pkgstorage.Manager
}

// NewShareService creates a new share service
func NewShareService(db *gorm.DB, manager *pkgstorage.Manager) *ShareService {
	return &ShareService{
		db:      db,
		manager: manager,
	}
}

// CreateShare creates a shareable link for an object
func (s *ShareService) CreateShare(ctx context.Context, objectID, bucketName, userID string, opts ShareOptions) (*StorageShare, error) {
	// Verify object exists
	var obj pkgstorage.StorageObject
	if err := s.db.Where("id = ? AND bucket_name = ?", objectID, bucketName).First(&obj).Error; err != nil {
		return nil, fmt.Errorf("object not found: %w", err)
	}
	
	// Generate unique share token
	tokenBytes := make([]byte, 16)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)
	
	share := &StorageShare{
		ID:             uuid.New().String(),
		ObjectID:       objectID,
		BucketName:     bucketName,
		ShareToken:     token,
		CreatedBy:      userID,
		ExpiresAt:      opts.ExpiresAt,
		MaxAccessCount: opts.MaxAccessCount,
		AllowDownload:  opts.AllowDownload,
		AllowUpload:    opts.AllowUpload,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	
	// Store password in plain text for now (should be hashed in production)
	// TODO: Add proper password hashing
	if opts.Password != "" {
		share.Password = opts.Password
	}
	
	if err := s.db.Create(share).Error; err != nil {
		return nil, fmt.Errorf("failed to create share: %w", err)
	}
	
	return share, nil
}

// GetShare retrieves a share by token
func (s *ShareService) GetShare(ctx context.Context, token string) (*StorageShare, error) {
	var share StorageShare
	if err := s.db.Where("share_token = ?", token).First(&share).Error; err != nil {
		return nil, fmt.Errorf("share not found: %w", err)
	}
	
	// Check expiration
	if share.ExpiresAt != nil && share.ExpiresAt.Before(time.Now()) {
		return nil, fmt.Errorf("share has expired")
	}
	
	// Check access count
	if share.MaxAccessCount != nil && share.AccessCount >= *share.MaxAccessCount {
		return nil, fmt.Errorf("share access limit reached")
	}
	
	return &share, nil
}

// ValidateSharePassword validates a share's password
func (s *ShareService) ValidateSharePassword(share *StorageShare, password string) error {
	if share.Password == "" {
		return nil // No password required
	}
	
	// TODO: Add proper password comparison with hashing
	if share.Password != password {
		return fmt.Errorf("invalid password")
	}
	
	return nil
}

// IncrementShareAccess increments the access count for a share
func (s *ShareService) IncrementShareAccess(ctx context.Context, shareID string) error {
	return s.db.Model(&StorageShare{}).
		Where("id = ?", shareID).
		Update("access_count", gorm.Expr("access_count + 1")).Error
}

// ShareOptions defines options for creating a share
type ShareOptions struct {
	ExpiresAt      *time.Time
	MaxAccessCount *int
	Password       string
	AllowDownload  bool
	AllowUpload    bool
}

// QuotaService manages storage quotas
type QuotaService struct {
	db *gorm.DB
}

// NewQuotaService creates a new quota service
func NewQuotaService(db *gorm.DB) *QuotaService {
	return &QuotaService{db: db}
}

// GetOrCreateQuota gets or creates a quota for a user
func (q *QuotaService) GetOrCreateQuota(ctx context.Context, userID string, defaultMax int64) (*StorageQuota, error) {
	var quota StorageQuota
	err := q.db.Where("user_id = ?", userID).First(&quota).Error
	
	if err == gorm.ErrRecordNotFound {
		// Create default quota
		quota = StorageQuota{
			ID:          uuid.New().String(),
			UserID:      userID,
			MaxStorage:  defaultMax,
			UsedStorage: 0,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		
		if err := q.db.Create(&quota).Error; err != nil {
			return nil, fmt.Errorf("failed to create quota: %w", err)
		}
	} else if err != nil {
		return nil, fmt.Errorf("failed to get quota: %w", err)
	}
	
	return &quota, nil
}

// CheckQuota checks if a user has enough quota for an upload
func (q *QuotaService) CheckQuota(ctx context.Context, userID string, size int64) error {
	var quota StorageQuota
	if err := q.db.Where("user_id = ?", userID).First(&quota).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil // No quota set, allow upload
		}
		return fmt.Errorf("failed to check quota: %w", err)
	}
	
	if quota.UsedStorage+size > quota.MaxStorage {
		return fmt.Errorf("storage quota exceeded: %s available", 
			formatBytes(quota.MaxStorage - quota.UsedStorage))
	}
	
	if quota.MaxFileSize > 0 && size > quota.MaxFileSize {
		return fmt.Errorf("file size exceeds limit: max %s", formatBytes(quota.MaxFileSize))
	}
	
	if quota.MaxFileCount != nil && quota.CurrentFileCount >= *quota.MaxFileCount {
		return fmt.Errorf("file count limit reached: max %d files", *quota.MaxFileCount)
	}
	
	return nil
}

// UpdateQuotaUsage updates the quota usage for a user
func (q *QuotaService) UpdateQuotaUsage(ctx context.Context, userID string, sizeDelta int64, countDelta int64) error {
	return q.db.Model(&StorageQuota{}).
		Where("user_id = ?", userID).
		Updates(map[string]interface{}{
			"used_storage":      gorm.Expr("used_storage + ?", sizeDelta),
			"current_file_count": gorm.Expr("current_file_count + ?", countDelta),
			"updated_at":        time.Now(),
		}).Error
}

// AccessLogService manages access logging
type AccessLogService struct {
	db *gorm.DB
}

// NewAccessLogService creates a new access log service
func NewAccessLogService(db *gorm.DB) *AccessLogService {
	return &AccessLogService{db: db}
}

// LogAccess logs an access event
func (a *AccessLogService) LogAccess(ctx context.Context, log *StorageAccessLog) error {
	log.ID = uuid.New().String()
	log.CreatedAt = time.Now()
	return a.db.Create(log).Error
}

// GetAccessLogs retrieves access logs with filters
func (a *AccessLogService) GetAccessLogs(ctx context.Context, filters AccessLogFilters) ([]StorageAccessLog, error) {
	query := a.db.Model(&StorageAccessLog{})
	
	if filters.ObjectID != "" {
		query = query.Where("object_id = ?", filters.ObjectID)
	}
	if filters.BucketName != "" {
		query = query.Where("bucket_name = ?", filters.BucketName)
	}
	if filters.UserID != "" {
		query = query.Where("user_id = ?", filters.UserID)
	}
	if filters.Action != "" {
		query = query.Where("action = ?", filters.Action)
	}
	if filters.StartDate != nil {
		query = query.Where("created_at >= ?", filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("created_at <= ?", filters.EndDate)
	}
	
	query = query.Order("created_at DESC").Limit(filters.Limit)
	
	var logs []StorageAccessLog
	if err := query.Find(&logs).Error; err != nil {
		return nil, fmt.Errorf("failed to get access logs: %w", err)
	}
	
	return logs, nil
}

// AccessLogFilters defines filters for access log queries
type AccessLogFilters struct {
	ObjectID   string
	BucketName string
	UserID     string
	Action     string
	StartDate  *time.Time
	EndDate    *time.Time
	Limit      int
}

// VersionService manages file versioning
type VersionService struct {
	db      *gorm.DB
	manager *pkgstorage.Manager
	enabled bool
}

// NewVersionService creates a new version service
func NewVersionService(db *gorm.DB, manager *pkgstorage.Manager, enabled bool) *VersionService {
	return &VersionService{
		db:      db,
		manager: manager,
		enabled: enabled,
	}
}

// CreateVersion creates a new version of an object
func (v *VersionService) CreateVersion(ctx context.Context, objectID, bucketName, userID string, comment string) (*StorageVersion, error) {
	if !v.enabled {
		return nil, nil // Versioning disabled
	}
	
	// Get current object
	var obj pkgstorage.StorageObject
	if err := v.db.Where("id = ? AND bucket_name = ?", objectID, bucketName).First(&obj).Error; err != nil {
		return nil, fmt.Errorf("object not found: %w", err)
	}
	
	// Get next version number
	var maxVersion int
	v.db.Model(&StorageVersion{}).
		Where("object_id = ?", objectID).
		Select("COALESCE(MAX(version_num), 0)").
		Scan(&maxVersion)
	
	version := &StorageVersion{
		ID:          uuid.New().String(),
		ObjectID:    objectID,
		BucketName:  bucketName,
		VersionNum:  maxVersion + 1,
		ObjectKey:   obj.ObjectKey,
		Size:        obj.Size,
		ContentType: obj.ContentType,
		Checksum:    obj.Checksum,
		CreatedBy:   userID,
		Comment:     comment,
		CreatedAt:   time.Now(),
	}
	
	if err := v.db.Create(version).Error; err != nil {
		return nil, fmt.Errorf("failed to create version: %w", err)
	}
	
	return version, nil
}

// GetVersions retrieves all versions of an object
func (v *VersionService) GetVersions(ctx context.Context, objectID string) ([]StorageVersion, error) {
	var versions []StorageVersion
	if err := v.db.Where("object_id = ?", objectID).
		Order("version_num DESC").
		Find(&versions).Error; err != nil {
		return nil, fmt.Errorf("failed to get versions: %w", err)
	}
	
	return versions, nil
}

// RestoreVersion restores an object to a specific version
func (v *VersionService) RestoreVersion(ctx context.Context, objectID string, versionID string) error {
	// Get the version to restore
	var version StorageVersion
	if err := v.db.Where("id = ?", versionID).First(&version).Error; err != nil {
		return fmt.Errorf("version not found: %w", err)
	}
	
	// Get the versioned content from storage
	versionKey := fmt.Sprintf(".versions/%s/%d", objectID, version.VersionNum)
	content, _, err := v.manager.GetFile(ctx, version.BucketName, versionKey)
	if err != nil {
		return fmt.Errorf("failed to get version content: %w", err)
	}
	
	// Update the current object with versioned content
	return v.manager.UpdateFile(ctx, version.BucketName, version.ObjectKey, content)
}

// TagService manages object tags
type TagService struct {
	db *gorm.DB
}

// NewTagService creates a new tag service
func NewTagService(db *gorm.DB) *TagService {
	return &TagService{db: db}
}

// AddTags adds tags to an object
func (t *TagService) AddTags(ctx context.Context, objectID, bucketName string, tags map[string]string) error {
	for key, value := range tags {
		tag := &StorageTag{
			ID:         uuid.New().String(),
			ObjectID:   objectID,
			BucketName: bucketName,
			Key:        key,
			Value:      value,
			CreatedAt:  time.Now(),
		}
		
		if err := t.db.Create(tag).Error; err != nil {
			return fmt.Errorf("failed to add tag: %w", err)
		}
	}
	
	return nil
}

// GetTags retrieves tags for an object
func (t *TagService) GetTags(ctx context.Context, objectID string) (map[string]string, error) {
	var tags []StorageTag
	if err := t.db.Where("object_id = ?", objectID).Find(&tags).Error; err != nil {
		return nil, fmt.Errorf("failed to get tags: %w", err)
	}
	
	result := make(map[string]string)
	for _, tag := range tags {
		result[tag.Key] = tag.Value
	}
	
	return result, nil
}

// RemoveTag removes a tag from an object
func (t *TagService) RemoveTag(ctx context.Context, objectID, key string) error {
	return t.db.Where("object_id = ? AND key = ?", objectID, key).
		Delete(&StorageTag{}).Error
}

// SearchByTags searches objects by tags
func (t *TagService) SearchByTags(ctx context.Context, bucketName string, tags map[string]string) ([]string, error) {
	query := t.db.Model(&StorageTag{}).
		Select("DISTINCT object_id").
		Where("bucket_name = ?", bucketName)
	
	for key, value := range tags {
		query = query.Where("(key = ? AND value = ?)", key, value)
	}
	
	var objectIDs []string
	if err := query.Pluck("object_id", &objectIDs).Error; err != nil {
		return nil, fmt.Errorf("failed to search by tags: %w", err)
	}
	
	return objectIDs, nil
}