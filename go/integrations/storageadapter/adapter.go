package storageadapter

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"path"
	"time"

	"github.com/google/uuid"
	storage "github.com/suppers-ai/storage"
	"github.com/suppers-ai/storageadapter/metadata"
)

// StorageAdapter is the main interface for the storage adapter
type StorageAdapter struct {
	storage       storage.Storage
	metadataStore metadata.MetadataStore
}

// New creates a new StorageAdapter instance
func New(store storage.Storage, metadataStore metadata.MetadataStore) *StorageAdapter {
	return &StorageAdapter{
		storage:       store,
		metadataStore: metadataStore,
	}
}

// UploadOptions contains options for uploading a file
type UploadOptions struct {
	UserID         uuid.UUID
	ParentFolderID *uuid.UUID
	Name           string
	MimeType       string
	Metadata       map[string]interface{}
	ThumbnailURL   *string
	Checksum       *string
}

// UploadResult contains the result of an upload operation
type UploadResult struct {
	ObjectID uuid.UUID
	FilePath string
	Size     int64
}

// Upload uploads a file and creates metadata
func (sa *StorageAdapter) Upload(ctx context.Context, reader io.Reader, size int64, opts *UploadOptions) (*UploadResult, error) {
	// Begin transaction
	txStore, err := sa.metadataStore.BeginTx(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = txStore.Rollback()
		}
	}()

	// Check user quota
	quota, err := txStore.GetQuota(ctx, opts.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get quota: %w", err)
	}

	if quota.StorageUsed+size > quota.MaxStorageBytes {
		return nil, fmt.Errorf("storage quota exceeded")
	}

	// Generate unique file path
	objectID := uuid.New()
	filePath := sa.generateFilePath(opts.UserID, objectID, opts.Name)

	// Upload to file storage
	uploadOpts := &storage.UploadOptions{
		ContentType: opts.MimeType,
		Metadata: map[string]string{
			"user_id":   opts.UserID.String(),
			"object_id": objectID.String(),
		},
	}

	if _, err := sa.storage.Upload(ctx, filePath, reader, uploadOpts); err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Create metadata
	obj := &metadata.StorageObject{
		ID:              objectID,
		UserID:          opts.UserID,
		Name:            opts.Name,
		ParentFolderID:  opts.ParentFolderID,
		ObjectType:      metadata.ObjectTypeFile,
		FilePath:        filePath,
		FileSize:        size,
		MimeType:        opts.MimeType,
		Metadata:        metadata.JSONB(opts.Metadata),
		ThumbnailURL:    opts.ThumbnailURL,
		Checksum:        opts.Checksum,
		StorageProvider: "s3",
	}

	if err := txStore.CreateObject(ctx, obj); err != nil {
		// Rollback file upload
		_ = sa.storage.Delete(ctx, filePath)
		return nil, fmt.Errorf("failed to create metadata: %w", err)
	}

	// Update user quota
	if err := txStore.IncrementStorageUsage(ctx, opts.UserID, size); err != nil {
		// Rollback file upload
		_ = sa.storage.Delete(ctx, filePath)
		return nil, fmt.Errorf("failed to update quota: %w", err)
	}

	// Log access
	_ = txStore.LogAccess(ctx, &metadata.AccessLog{
		ObjectID: objectID,
		UserID:   &opts.UserID,
		Action:   metadata.ActionUpload,
	})

	// Commit transaction
	if err := txStore.Commit(); err != nil {
		// Rollback file upload
		_ = sa.storage.Delete(ctx, filePath)
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &UploadResult{
		ObjectID: objectID,
		FilePath: filePath,
		Size:     size,
	}, nil
}

// Download downloads a file
func (sa *StorageAdapter) Download(ctx context.Context, objectID uuid.UUID, userID uuid.UUID, writer io.Writer) error {
	// Check permission
	hasPermission, err := sa.metadataStore.CheckPermission(ctx, userID, objectID, metadata.PermissionView)
	if err != nil {
		return fmt.Errorf("failed to check permission: %w", err)
	}
	if !hasPermission {
		return fmt.Errorf("permission denied")
	}

	// Get object metadata
	obj, err := sa.metadataStore.GetObject(ctx, objectID)
	if err != nil {
		return fmt.Errorf("failed to get object: %w", err)
	}

	// Download file
	reader, err := sa.storage.Download(ctx, obj.FilePath)
	if err != nil {
		return fmt.Errorf("failed to download file: %w", err)
	}
	defer reader.Close()
	
	if _, err := io.Copy(writer, reader); err != nil {
		return fmt.Errorf("failed to copy data: %w", err)
	}

	// Update bandwidth usage
	_ = sa.metadataStore.IncrementBandwidthUsage(ctx, userID, obj.FileSize)

	// Log access
	_ = sa.metadataStore.LogAccess(ctx, &metadata.AccessLog{
		ObjectID: objectID,
		UserID:   &userID,
		Action:   metadata.ActionDownload,
	})

	return nil
}

// GetReader returns a reader for streaming file content
func (sa *StorageAdapter) GetReader(ctx context.Context, objectID uuid.UUID, userID uuid.UUID) (io.ReadCloser, error) {
	// Check permission
	hasPermission, err := sa.metadataStore.CheckPermission(ctx, userID, objectID, metadata.PermissionView)
	if err != nil {
		return nil, fmt.Errorf("failed to check permission: %w", err)
	}
	if !hasPermission {
		return nil, fmt.Errorf("permission denied")
	}

	// Get object metadata
	obj, err := sa.metadataStore.GetObject(ctx, objectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get object: %w", err)
	}

	// Get reader
	reader, err := sa.storage.Download(ctx, obj.FilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to get reader: %w", err)
	}

	// Update bandwidth usage
	_ = sa.metadataStore.IncrementBandwidthUsage(ctx, userID, obj.FileSize)

	// Log access
	_ = sa.metadataStore.LogAccess(ctx, &metadata.AccessLog{
		ObjectID: objectID,
		UserID:   &userID,
		Action:   metadata.ActionView,
	})

	return reader, nil
}

// Delete deletes a file
func (sa *StorageAdapter) Delete(ctx context.Context, objectID uuid.UUID, userID uuid.UUID) error {
	// Check permission
	hasPermission, err := sa.metadataStore.CheckPermission(ctx, userID, objectID, metadata.PermissionAdmin)
	if err != nil {
		return fmt.Errorf("failed to check permission: %w", err)
	}
	if !hasPermission {
		// Check if user owns the object
		obj, err := sa.metadataStore.GetObject(ctx, objectID)
		if err != nil {
			return fmt.Errorf("failed to get object: %w", err)
		}
		if obj.UserID != userID {
			return fmt.Errorf("permission denied")
		}
	}

	// Begin transaction
	txStore, err := sa.metadataStore.BeginTx(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = txStore.Rollback()
		}
	}()

	// Get object metadata
	obj, err := txStore.GetObject(ctx, objectID)
	if err != nil {
		return fmt.Errorf("failed to get object: %w", err)
	}

	// Delete from file storage
	if err := sa.storage.Delete(ctx, obj.FilePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	// Delete metadata
	if err := txStore.DeleteObject(ctx, objectID); err != nil {
		return fmt.Errorf("failed to delete metadata: %w", err)
	}

	// Update user quota
	if err := txStore.IncrementStorageUsage(ctx, obj.UserID, -obj.FileSize); err != nil {
		return fmt.Errorf("failed to update quota: %w", err)
	}

	// Log access
	_ = txStore.LogAccess(ctx, &metadata.AccessLog{
		ObjectID: objectID,
		UserID:   &userID,
		Action:   metadata.ActionDelete,
	})

	// Commit transaction
	if err := txStore.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// ShareOptions contains options for sharing a file
type ShareOptions struct {
	ObjectID         uuid.UUID
	SharedWithUserID *uuid.UUID
	SharedWithEmail  *string
	PermissionLevel  metadata.PermissionLevel
	InheritToChildren bool
	ExpiresAt        *time.Time
	CreatedBy        uuid.UUID
	GenerateLink     bool
}

// ShareResult contains the result of a share operation
type ShareResult struct {
	ShareID    uuid.UUID
	ShareToken *string
	ShareURL   *string
}

// Share creates a share for a file
func (sa *StorageAdapter) Share(ctx context.Context, opts *ShareOptions) (*ShareResult, error) {
	// Check if creator has admin permission or owns the object
	hasPermission, err := sa.metadataStore.CheckPermission(ctx, opts.CreatedBy, opts.ObjectID, metadata.PermissionAdmin)
	if err != nil {
		return nil, fmt.Errorf("failed to check permission: %w", err)
	}
	if !hasPermission {
		obj, err := sa.metadataStore.GetObject(ctx, opts.ObjectID)
		if err != nil {
			return nil, fmt.Errorf("failed to get object: %w", err)
		}
		if obj.UserID != opts.CreatedBy {
			return nil, fmt.Errorf("permission denied")
		}
	}

	share := &metadata.StorageShare{
		ObjectID:          opts.ObjectID,
		SharedWithUserID:  opts.SharedWithUserID,
		SharedWithEmail:   opts.SharedWithEmail,
		PermissionLevel:   opts.PermissionLevel,
		InheritToChildren: opts.InheritToChildren,
		ExpiresAt:         opts.ExpiresAt,
		CreatedBy:         opts.CreatedBy,
	}

	// Generate share token if link sharing is requested
	if opts.GenerateLink {
		token := sa.generateShareToken()
		share.ShareToken = &token
		share.IsPublic = true
	}

	if err := sa.metadataStore.CreateShare(ctx, share); err != nil {
		return nil, fmt.Errorf("failed to create share: %w", err)
	}

	// Log access
	_ = sa.metadataStore.LogAccess(ctx, &metadata.AccessLog{
		ObjectID: opts.ObjectID,
		UserID:   &opts.CreatedBy,
		Action:   metadata.ActionShare,
	})

	result := &ShareResult{
		ShareID:    share.ID,
		ShareToken: share.ShareToken,
	}

	// Generate share URL if token was created
	if share.ShareToken != nil {
		url := sa.generateShareURL(*share.ShareToken)
		result.ShareURL = &url
	}

	return result, nil
}

// GetShareByToken retrieves a share by its token
func (sa *StorageAdapter) GetShareByToken(ctx context.Context, token string) (*metadata.StorageShare, error) {
	return sa.metadataStore.GetShareByToken(ctx, token)
}

// CreateFolder creates a folder
func (sa *StorageAdapter) CreateFolder(ctx context.Context, userID uuid.UUID, name string, parentFolderID *uuid.UUID) (*metadata.StorageObject, error) {
	folder := &metadata.StorageObject{
		ID:             uuid.New(),
		UserID:         userID,
		Name:           name,
		ParentFolderID: parentFolderID,
		ObjectType:     metadata.ObjectTypeFolder,
		FilePath:       "", // Folders don't have physical files
		FileSize:       0,
		MimeType:       "application/folder",
		Metadata:       metadata.JSONB{},
		StorageProvider: "s3",
	}

	if err := sa.metadataStore.CreateObject(ctx, folder); err != nil {
		return nil, fmt.Errorf("failed to create folder: %w", err)
	}

	return folder, nil
}

// ListObjects lists objects for a user
func (sa *StorageAdapter) ListObjects(ctx context.Context, opts *metadata.ListObjectsOptions) ([]*metadata.StorageObject, error) {
	return sa.metadataStore.ListObjects(ctx, opts)
}

// GetObject retrieves object metadata
func (sa *StorageAdapter) GetObject(ctx context.Context, objectID uuid.UUID) (*metadata.StorageObject, error) {
	return sa.metadataStore.GetObject(ctx, objectID)
}

// GetQuota retrieves quota information
func (sa *StorageAdapter) GetQuota(ctx context.Context, userID uuid.UUID) (*metadata.StorageQuota, error) {
	return sa.metadataStore.GetQuota(ctx, userID)
}

// GeneratePresignedURL generates a pre-signed URL for direct access
func (sa *StorageAdapter) GeneratePresignedURL(ctx context.Context, objectID uuid.UUID, userID uuid.UUID, expiration time.Duration) (string, error) {
	// Check permission
	hasPermission, err := sa.metadataStore.CheckPermission(ctx, userID, objectID, metadata.PermissionView)
	if err != nil {
		return "", fmt.Errorf("failed to check permission: %w", err)
	}
	if !hasPermission {
		return "", fmt.Errorf("permission denied")
	}

	// Get object metadata
	obj, err := sa.metadataStore.GetObject(ctx, objectID)
	if err != nil {
		return "", fmt.Errorf("failed to get object: %w", err)
	}

	// Generate presigned URL
	url, err := sa.storage.GetSignedURL(ctx, obj.FilePath, &storage.SignedURLOptions{
		Expires: expiration,
		Method:  "GET",
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return url, nil
}

// Move moves an object to a different location
func (sa *StorageAdapter) Move(ctx context.Context, objectID uuid.UUID, userID uuid.UUID, newParentID *uuid.UUID, newName string) error {
	// Check permission on source
	hasPermission, err := sa.metadataStore.CheckPermission(ctx, userID, objectID, metadata.PermissionEdit)
	if err != nil {
		return fmt.Errorf("failed to check permission: %w", err)
	}
	if !hasPermission {
		obj, err := sa.metadataStore.GetObject(ctx, objectID)
		if err != nil {
			return fmt.Errorf("failed to get object: %w", err)
		}
		if obj.UserID != userID {
			return fmt.Errorf("permission denied")
		}
	}

	// Get object
	obj, err := sa.metadataStore.GetObject(ctx, objectID)
	if err != nil {
		return fmt.Errorf("failed to get object: %w", err)
	}

	// Update metadata
	obj.ParentFolderID = newParentID
	if newName != "" {
		obj.Name = newName
	}

	if err := sa.metadataStore.UpdateObject(ctx, obj); err != nil {
		return fmt.Errorf("failed to update object: %w", err)
	}

	return nil
}

// Copy copies an object
func (sa *StorageAdapter) Copy(ctx context.Context, objectID uuid.UUID, userID uuid.UUID, newParentID *uuid.UUID, newName string) (*metadata.StorageObject, error) {
	// Check permission
	hasPermission, err := sa.metadataStore.CheckPermission(ctx, userID, objectID, metadata.PermissionView)
	if err != nil {
		return nil, fmt.Errorf("failed to check permission: %w", err)
	}
	if !hasPermission {
		return nil, fmt.Errorf("permission denied")
	}

	// Get source object
	srcObj, err := sa.metadataStore.GetObject(ctx, objectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get source object: %w", err)
	}

	// Generate new object ID and file path
	newObjectID := uuid.New()
	newFilePath := sa.generateFilePath(userID, newObjectID, newName)

	// Copy in file storage
	if err := sa.storage.Copy(ctx, srcObj.FilePath, newFilePath); err != nil {
		return nil, fmt.Errorf("failed to copy file: %w", err)
	}

	// Create new metadata
	newObj := &metadata.StorageObject{
		ID:              newObjectID,
		UserID:          userID,
		Name:            newName,
		ParentFolderID:  newParentID,
		ObjectType:      srcObj.ObjectType,
		FilePath:        newFilePath,
		FileSize:        srcObj.FileSize,
		MimeType:        srcObj.MimeType,
		Metadata:        srcObj.Metadata,
		ThumbnailURL:    srcObj.ThumbnailURL,
		Checksum:        srcObj.Checksum,
		StorageProvider: srcObj.StorageProvider,
	}

	if err := sa.metadataStore.CreateObject(ctx, newObj); err != nil {
		// Rollback file copy
		_ = sa.storage.Delete(ctx, newFilePath)
		return nil, fmt.Errorf("failed to create metadata: %w", err)
	}

	// Update quota
	_ = sa.metadataStore.IncrementStorageUsage(ctx, userID, srcObj.FileSize)

	return newObj, nil
}

// Helper methods

func (sa *StorageAdapter) generateFilePath(userID uuid.UUID, objectID uuid.UUID, fileName string) string {
	// Format: userID/objectID/filename
	// This ensures unique paths and easy organization
	return path.Join(userID.String(), objectID.String(), fileName)
}

func (sa *StorageAdapter) generateShareToken() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (sa *StorageAdapter) generateShareURL(token string) string {
	// This should be configured based on your application's URL
	// For now, returning a placeholder
	return fmt.Sprintf("https://storage.example.com/share/%s", token)
}