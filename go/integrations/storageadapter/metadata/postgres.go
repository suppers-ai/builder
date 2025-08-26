package metadata

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/suppers-ai/database"
)

// PostgreSQLMetadataStore implements MetadataStore using PostgreSQL
type PostgreSQLMetadataStore struct {
	db database.Database
	tx database.Transaction // For transaction support
}

// NewPostgreSQLMetadataStore creates a new PostgreSQL metadata store
func NewPostgreSQLMetadataStore(db database.Database) *PostgreSQLMetadataStore {
	return &PostgreSQLMetadataStore{db: db}
}

// BeginTx begins a new transaction
func (s *PostgreSQLMetadataStore) BeginTx(ctx context.Context) (MetadataStore, error) {
	tx, err := s.db.BeginTx(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	
	return &PostgreSQLMetadataStore{
		db: s.db,
		tx: tx,
	}, nil
}

// Commit commits the transaction
func (s *PostgreSQLMetadataStore) Commit() error {
	if s.tx == nil {
		return fmt.Errorf("no transaction to commit")
	}
	return s.tx.Commit()
}

// Rollback rolls back the transaction
func (s *PostgreSQLMetadataStore) Rollback() error {
	if s.tx == nil {
		return fmt.Errorf("no transaction to rollback")
	}
	return s.tx.Rollback()
}

// query executes a query using either the transaction or database
func (s *PostgreSQLMetadataStore) query(ctx context.Context, query string, args ...interface{}) (database.Rows, error) {
	if s.tx != nil {
		return s.tx.Query(ctx, query, args...)
	}
	return s.db.Query(ctx, query, args...)
}

// queryRow executes a query that returns a single row
func (s *PostgreSQLMetadataStore) queryRow(ctx context.Context, query string, args ...interface{}) database.Row {
	if s.tx != nil {
		return s.tx.QueryRow(ctx, query, args...)
	}
	return s.db.QueryRow(ctx, query, args...)
}

// exec executes a query that doesn't return rows
func (s *PostgreSQLMetadataStore) exec(ctx context.Context, query string, args ...interface{}) (database.Result, error) {
	if s.tx != nil {
		return s.tx.Exec(ctx, query, args...)
	}
	return s.db.Exec(ctx, query, args...)
}

// CreateObject creates a new storage object
func (s *PostgreSQLMetadataStore) CreateObject(ctx context.Context, obj *StorageObject) error {
	query := `
		INSERT INTO storageadapter.storage_objects (
			id, user_id, name, parent_folder_id, object_type, file_path,
			file_size, mime_type, metadata, thumbnail_url, checksum, storage_provider
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING created_at, updated_at, path_segments`

	if obj.ID == uuid.Nil {
		obj.ID = uuid.New()
	}

	row := s.queryRow(ctx, query,
		obj.ID, obj.UserID, obj.Name, obj.ParentFolderID, obj.ObjectType,
		obj.FilePath, obj.FileSize, obj.MimeType, obj.Metadata,
		obj.ThumbnailURL, obj.Checksum, obj.StorageProvider,
	)
	
	return row.Scan(&obj.CreatedAt, &obj.UpdatedAt, pq.Array(&obj.PathSegments))
}

// GetObject retrieves a storage object by ID
func (s *PostgreSQLMetadataStore) GetObject(ctx context.Context, id uuid.UUID) (*StorageObject, error) {
	query := `
		SELECT id, user_id, name, parent_folder_id, object_type, path_segments,
			file_path, file_size, mime_type, metadata, thumbnail_url, checksum,
			storage_provider, created_at, updated_at
		FROM storageadapter.storage_objects
		WHERE id = $1`

	obj := &StorageObject{}
	row := s.queryRow(ctx, query, id)
	err := row.Scan(
		&obj.ID, &obj.UserID, &obj.Name, &obj.ParentFolderID, &obj.ObjectType,
		pq.Array(&obj.PathSegments), &obj.FilePath, &obj.FileSize, &obj.MimeType,
		&obj.Metadata, &obj.ThumbnailURL, &obj.Checksum, &obj.StorageProvider,
		&obj.CreatedAt, &obj.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get object: %w", err)
	}
	return obj, nil
}

// GetObjectByPath retrieves a storage object by its path
func (s *PostgreSQLMetadataStore) GetObjectByPath(ctx context.Context, userID uuid.UUID, path string) (*StorageObject, error) {
	segments := strings.Split(strings.Trim(path, "/"), "/")
	
	query := `
		SELECT id, user_id, name, parent_folder_id, object_type, path_segments,
			file_path, file_size, mime_type, metadata, thumbnail_url, checksum,
			storage_provider, created_at, updated_at
		FROM storageadapter.storage_objects
		WHERE user_id = $1 AND path_segments = $2`

	obj := &StorageObject{}
	row := s.queryRow(ctx, query, userID, pq.Array(segments))
	err := row.Scan(
		&obj.ID, &obj.UserID, &obj.Name, &obj.ParentFolderID, &obj.ObjectType,
		pq.Array(&obj.PathSegments), &obj.FilePath, &obj.FileSize, &obj.MimeType,
		&obj.Metadata, &obj.ThumbnailURL, &obj.Checksum, &obj.StorageProvider,
		&obj.CreatedAt, &obj.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("object not found: %w", err)
	}
	return obj, nil
}

// UpdateObject updates a storage object
func (s *PostgreSQLMetadataStore) UpdateObject(ctx context.Context, obj *StorageObject) error {
	query := `
		UPDATE storageadapter.storage_objects
		SET name = $2, parent_folder_id = $3, file_size = $4, mime_type = $5,
			metadata = $6, thumbnail_url = $7, checksum = $8, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1`

	_, err := s.exec(ctx, query,
		obj.ID, obj.Name, obj.ParentFolderID, obj.FileSize, obj.MimeType,
		obj.Metadata, obj.ThumbnailURL, obj.Checksum,
	)

	return err
}

// DeleteObject deletes a storage object
func (s *PostgreSQLMetadataStore) DeleteObject(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM storageadapter.storage_objects WHERE id = $1`
	_, err := s.exec(ctx, query, id)
	return err
}

// ListObjects lists storage objects with filtering and pagination
func (s *PostgreSQLMetadataStore) ListObjects(ctx context.Context, opts *ListObjectsOptions) ([]*StorageObject, error) {
	query := `
		SELECT id, user_id, name, parent_folder_id, object_type, path_segments,
			file_path, file_size, mime_type, metadata, thumbnail_url, checksum,
			storage_provider, created_at, updated_at
		FROM storageadapter.storage_objects
		WHERE 1=1`

	args := []interface{}{}
	argCount := 0

	if opts.UserID != uuid.Nil {
		argCount++
		query += fmt.Sprintf(" AND user_id = $%d", argCount)
		args = append(args, opts.UserID)
	}

	if opts.ParentFolderID != nil {
		argCount++
		query += fmt.Sprintf(" AND parent_folder_id = $%d", argCount)
		args = append(args, *opts.ParentFolderID)
	}

	if opts.ObjectType != nil && *opts.ObjectType != "" {
		argCount++
		query += fmt.Sprintf(" AND object_type = $%d", argCount)
		args = append(args, *opts.ObjectType)
	}

	// Add ordering
	query += " ORDER BY created_at DESC"

	// Add pagination
	if opts.Limit > 0 {
		argCount++
		query += fmt.Sprintf(" LIMIT $%d", argCount)
		args = append(args, opts.Limit)
	}

	if opts.Offset > 0 {
		argCount++
		query += fmt.Sprintf(" OFFSET $%d", argCount)
		args = append(args, opts.Offset)
	}

	rows, err := s.query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var objects []*StorageObject
	for rows.Next() {
		obj := &StorageObject{}
		err := rows.Scan(
			&obj.ID, &obj.UserID, &obj.Name, &obj.ParentFolderID, &obj.ObjectType,
			pq.Array(&obj.PathSegments), &obj.FilePath, &obj.FileSize, &obj.MimeType,
			&obj.Metadata, &obj.ThumbnailURL, &obj.Checksum, &obj.StorageProvider,
			&obj.CreatedAt, &obj.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		objects = append(objects, obj)
	}

	return objects, rows.Err()
}

// GetObjectChildren gets all children of a folder
func (s *PostgreSQLMetadataStore) GetObjectChildren(ctx context.Context, parentID uuid.UUID) ([]*StorageObject, error) {
	query := `
		SELECT id, user_id, name, parent_folder_id, object_type, path_segments,
			file_path, file_size, mime_type, metadata, thumbnail_url, checksum,
			storage_provider, created_at, updated_at
		FROM storageadapter.storage_objects
		WHERE parent_folder_id = $1
		ORDER BY object_type DESC, name ASC`

	rows, err := s.query(ctx, query, parentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var objects []*StorageObject
	for rows.Next() {
		obj := &StorageObject{}
		err := rows.Scan(
			&obj.ID, &obj.UserID, &obj.Name, &obj.ParentFolderID, &obj.ObjectType,
			pq.Array(&obj.PathSegments), &obj.FilePath, &obj.FileSize, &obj.MimeType,
			&obj.Metadata, &obj.ThumbnailURL, &obj.Checksum, &obj.StorageProvider,
			&obj.CreatedAt, &obj.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		objects = append(objects, obj)
	}

	return objects, rows.Err()
}

// CreateShare creates a new share
func (s *PostgreSQLMetadataStore) CreateShare(ctx context.Context, share *StorageShare) error {
	query := `
		INSERT INTO storageadapter.storage_shares (
			id, object_id, shared_with_user_id, shared_with_email, permission_level,
			inherit_to_children, share_token, is_public, expires_at, created_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING created_at, updated_at`

	if share.ID == uuid.Nil {
		share.ID = uuid.New()
	}

	if share.ShareToken != nil && *share.ShareToken != "" {
		share.IsPublic = true
	}

	row := s.queryRow(ctx, query,
		share.ID, share.ObjectID, share.SharedWithUserID, share.SharedWithEmail,
		share.PermissionLevel, share.InheritToChildren, share.ShareToken,
		share.IsPublic, share.ExpiresAt, share.CreatedBy,
	)

	return row.Scan(&share.CreatedAt, &share.UpdatedAt)
}

// GetShare retrieves a share by ID
func (s *PostgreSQLMetadataStore) GetShare(ctx context.Context, id uuid.UUID) (*StorageShare, error) {
	query := `
		SELECT id, object_id, shared_with_user_id, shared_with_email, permission_level,
			inherit_to_children, share_token, is_public, expires_at, created_by,
			created_at, updated_at
		FROM storageadapter.storage_shares
		WHERE id = $1`

	share := &StorageShare{}
	row := s.queryRow(ctx, query, id)
	err := row.Scan(
		&share.ID, &share.ObjectID, &share.SharedWithUserID, &share.SharedWithEmail,
		&share.PermissionLevel, &share.InheritToChildren, &share.ShareToken,
		&share.IsPublic, &share.ExpiresAt, &share.CreatedBy,
		&share.CreatedAt, &share.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("share not found: %w", err)
	}
	return share, nil
}

// GetShareByToken retrieves a share by its token
func (s *PostgreSQLMetadataStore) GetShareByToken(ctx context.Context, token string) (*StorageShare, error) {
	query := `
		SELECT id, object_id, shared_with_user_id, shared_with_email, permission_level,
			inherit_to_children, share_token, is_public, expires_at, created_by,
			created_at, updated_at
		FROM storageadapter.storage_shares
		WHERE share_token = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`

	share := &StorageShare{}
	row := s.queryRow(ctx, query, token)
	err := row.Scan(
		&share.ID, &share.ObjectID, &share.SharedWithUserID, &share.SharedWithEmail,
		&share.PermissionLevel, &share.InheritToChildren, &share.ShareToken,
		&share.IsPublic, &share.ExpiresAt, &share.CreatedBy,
		&share.CreatedAt, &share.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("share not found: %w", err)
	}
	return share, nil
}

// GetObjectShares gets all shares for an object
func (s *PostgreSQLMetadataStore) GetObjectShares(ctx context.Context, objectID uuid.UUID) ([]*StorageShare, error) {
	query := `
		SELECT id, object_id, shared_with_user_id, shared_with_email, permission_level,
			inherit_to_children, share_token, is_public, expires_at, created_by,
			created_at, updated_at
		FROM storageadapter.storage_shares
		WHERE object_id = $1`

	rows, err := s.query(ctx, query, objectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var shares []*StorageShare
	for rows.Next() {
		share := &StorageShare{}
		err := rows.Scan(
			&share.ID, &share.ObjectID, &share.SharedWithUserID, &share.SharedWithEmail,
			&share.PermissionLevel, &share.InheritToChildren, &share.ShareToken,
			&share.IsPublic, &share.ExpiresAt, &share.CreatedBy,
			&share.CreatedAt, &share.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		shares = append(shares, share)
	}

	return shares, rows.Err()
}

// ListSharesForObject lists all shares for a specific object
// This is an alias for GetObjectShares to satisfy the interface
func (s *PostgreSQLMetadataStore) ListSharesForObject(ctx context.Context, objectID uuid.UUID) ([]*StorageShare, error) {
	return s.GetObjectShares(ctx, objectID)
}

// ListSharesForUser lists all shares for a specific user
func (s *PostgreSQLMetadataStore) ListSharesForUser(ctx context.Context, userID uuid.UUID) ([]*StorageShare, error) {
	query := `
		SELECT id, object_id, shared_with_user_id, shared_with_email, permission_level,
		       inherit_to_children, share_token, is_public, expires_at, created_by,
		       created_at, updated_at
		FROM storageadapter.storage_shares
		WHERE shared_with_user_id = $1
		ORDER BY created_at DESC`

	rows, err := s.query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var shares []*StorageShare
	for rows.Next() {
		var share StorageShare
		err := rows.Scan(
			&share.ID, &share.ObjectID, &share.SharedWithUserID, &share.SharedWithEmail,
			&share.PermissionLevel, &share.InheritToChildren, &share.ShareToken,
			&share.IsPublic, &share.ExpiresAt, &share.CreatedBy,
			&share.CreatedAt, &share.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		shares = append(shares, &share)
	}

	return shares, nil
}

// CheckPermission checks if a user has permission to access an object
func (s *PostgreSQLMetadataStore) CheckPermission(ctx context.Context, userID uuid.UUID, objectID uuid.UUID, requiredLevel PermissionLevel) (bool, error) {
	// First check if user owns the object
	query := `SELECT user_id FROM storageadapter.storage_objects WHERE id = $1`
	var ownerID uuid.UUID
	err := s.queryRow(ctx, query, objectID).Scan(&ownerID)
	if err != nil {
		return false, err
	}

	if ownerID == userID {
		return true, nil
	}

	// Check shares
	shareQuery := `
		SELECT permission_level 
		FROM storageadapter.storage_shares
		WHERE object_id = $1 AND shared_with_user_id = $2
		AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`

	var level PermissionLevel
	err = s.queryRow(ctx, shareQuery, objectID, userID).Scan(&level)
	if err != nil {
		// No share found
		return false, nil
	}

	// Check if the granted permission level is sufficient
	return hasPermission(level, requiredLevel), nil
}

// UpdateShare updates an existing share
func (s *PostgreSQLMetadataStore) UpdateShare(ctx context.Context, share *StorageShare) error {
	query := `
		UPDATE storageadapter.storage_shares
		SET shared_with_user_id = $2,
		    shared_with_email = $3,
		    permission_level = $4,
		    inherit_to_children = $5,
		    share_token = $6,
		    is_public = $7,
		    expires_at = $8,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $1`

	_, err := s.exec(ctx, query,
		share.ID, share.SharedWithUserID, share.SharedWithEmail,
		share.PermissionLevel, share.InheritToChildren, share.ShareToken,
		share.IsPublic, share.ExpiresAt,
	)
	return err
}

// CreateQuota creates or updates a user quota
func (s *PostgreSQLMetadataStore) CreateQuota(ctx context.Context, quota *StorageQuota) error {
	query := `
		INSERT INTO storageadapter.storage_quotas (
			user_id, max_storage_bytes, max_bandwidth_bytes, storage_used, bandwidth_used
		) VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE SET
			max_storage_bytes = EXCLUDED.max_storage_bytes,
			max_bandwidth_bytes = EXCLUDED.max_bandwidth_bytes,
			updated_at = CURRENT_TIMESTAMP
		RETURNING created_at, updated_at`

	row := s.queryRow(ctx, query,
		quota.UserID, quota.MaxStorageBytes, quota.MaxBandwidthBytes,
		quota.StorageUsed, quota.BandwidthUsed,
	)

	return row.Scan(&quota.CreatedAt, &quota.UpdatedAt)
}

// GetQuota retrieves a user's quota
func (s *PostgreSQLMetadataStore) GetQuota(ctx context.Context, userID uuid.UUID) (*StorageQuota, error) {
	query := `
		SELECT user_id, max_storage_bytes, max_bandwidth_bytes, storage_used, bandwidth_used,
			created_at, updated_at
		FROM storageadapter.storage_quotas
		WHERE user_id = $1`

	quota := &StorageQuota{}
	row := s.queryRow(ctx, query, userID)
	err := row.Scan(
		&quota.UserID, &quota.MaxStorageBytes, &quota.MaxBandwidthBytes,
		&quota.StorageUsed, &quota.BandwidthUsed,
		&quota.CreatedAt, &quota.UpdatedAt,
	)

	if err != nil {
		// If no quota exists, create a default one
		quota = &StorageQuota{
			UserID:             userID,
			MaxStorageBytes:    10 * 1024 * 1024 * 1024, // 10 GB default
			MaxBandwidthBytes:  100 * 1024 * 1024 * 1024, // 100 GB default
			StorageUsed:        0,
			BandwidthUsed:      0,
		}
		if err := s.CreateQuota(ctx, quota); err != nil {
			return nil, err
		}
	}

	return quota, nil
}

// IncrementStorageUsage increments storage usage for a user
func (s *PostgreSQLMetadataStore) IncrementStorageUsage(ctx context.Context, userID uuid.UUID, delta int64) error {
	query := `
		UPDATE storageadapter.storage_quotas
		SET storage_used = storage_used + $2, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $1`

	_, err := s.exec(ctx, query, userID, delta)
	return err
}

// IncrementBandwidthUsage increments bandwidth usage for a user
func (s *PostgreSQLMetadataStore) IncrementBandwidthUsage(ctx context.Context, userID uuid.UUID, delta int64) error {
	query := `
		UPDATE storageadapter.storage_quotas
		SET bandwidth_used = bandwidth_used + $2, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $1`

	_, err := s.exec(ctx, query, userID, delta)
	return err
}

// CreateOrUpdateQuota creates or updates a storage quota
func (s *PostgreSQLMetadataStore) CreateOrUpdateQuota(ctx context.Context, quota *StorageQuota) error {
	query := `
		INSERT INTO storageadapter.storage_quotas (
			id, user_id, max_storage_bytes, max_bandwidth_bytes,
			storage_used, bandwidth_used, reset_bandwidth_at,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (user_id) DO UPDATE SET
			max_storage_bytes = EXCLUDED.max_storage_bytes,
			max_bandwidth_bytes = EXCLUDED.max_bandwidth_bytes,
			storage_used = EXCLUDED.storage_used,
			bandwidth_used = EXCLUDED.bandwidth_used,
			reset_bandwidth_at = EXCLUDED.reset_bandwidth_at,
			updated_at = EXCLUDED.updated_at
		RETURNING id, created_at, updated_at`

	if quota.ID == uuid.Nil {
		quota.ID = uuid.New()
	}

	now := time.Now()
	err := s.queryRow(ctx, query,
		quota.ID, quota.UserID, quota.MaxStorageBytes, quota.MaxBandwidthBytes,
		quota.StorageUsed, quota.BandwidthUsed, quota.ResetBandwidthAt,
		now, now,
	).Scan(&quota.ID, &quota.CreatedAt, &quota.UpdatedAt)

	return err
}

// LogAccess logs an access event
func (s *PostgreSQLMetadataStore) LogAccess(ctx context.Context, log *AccessLog) error {
	query := `
		INSERT INTO storageadapter.access_logs (
			id, object_id, user_id, action, ip_address, user_agent, metadata
		) VALUES ($1, $2, $3, $4, $5, $6, $7)`

	if log.ID == uuid.Nil {
		log.ID = uuid.New()
	}

	_, err := s.exec(ctx, query,
		log.ID, log.ObjectID, log.UserID, log.Action,
		log.IPAddress, log.UserAgent, log.Metadata,
	)

	return err
}

// GetAccessLogs retrieves access logs for an object
func (s *PostgreSQLMetadataStore) GetAccessLogs(ctx context.Context, objectID uuid.UUID, limit int) ([]*AccessLog, error) {
	query := `
		SELECT id, object_id, user_id, action, ip_address, user_agent, metadata, created_at
		FROM storageadapter.access_logs
		WHERE object_id = $1
		ORDER BY created_at DESC
		LIMIT $2`

	rows, err := s.query(ctx, query, objectID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*AccessLog
	for rows.Next() {
		log := &AccessLog{}
		err := rows.Scan(
			&log.ID, &log.ObjectID, &log.UserID, &log.Action,
			&log.IPAddress, &log.UserAgent, &log.Metadata, &log.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}

	return logs, rows.Err()
}

// DeleteShare deletes a share
func (s *PostgreSQLMetadataStore) DeleteShare(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM storageadapter.storage_shares WHERE id = $1`
	_, err := s.exec(ctx, query, id)
	return err
}

// hasPermission checks if a permission level grants the required access
func hasPermission(granted, required PermissionLevel) bool {
	permLevels := map[PermissionLevel]int{
		PermissionView:  1,
		PermissionEdit:  2,
		PermissionAdmin: 3,
	}
	
	grantedLevel, gok := permLevels[granted]
	requiredLevel, rok := permLevels[required]
	
	if !gok || !rok {
		return false
	}
	
	return grantedLevel >= requiredLevel
}