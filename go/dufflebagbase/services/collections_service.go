package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/logger"
)

// CollectionsService handles dynamic collections
type CollectionsService struct {
	db     *gorm.DB
	logger logger.Logger
}

// NewCollectionsService creates a new collections service
func NewCollectionsService(db *gorm.DB, logger logger.Logger) *CollectionsService {
	return &CollectionsService{
		db:     db,
		logger: logger,
	}
}

// CreateCollection creates a new collection
func (s *CollectionsService) CreateCollection(ctx context.Context, name, displayName, description string, schema map[string]interface{}) (*models.Collection, error) {
	collection := &models.Collection{
		Name:        name,
		DisplayName: displayName,
		Description: description,
		Schema:      models.JSON(schema),
	}

	if err := s.db.WithContext(ctx).Create(collection).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, fmt.Errorf("collection %s already exists", name)
		}
		return nil, fmt.Errorf("failed to create collection: %w", err)
	}

	return collection, nil
}

// GetCollection retrieves a collection by name
func (s *CollectionsService) GetCollection(ctx context.Context, name string) (*models.Collection, error) {
	var collection models.Collection
	err := s.db.WithContext(ctx).Where("name = ?", name).First(&collection).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("collection not found")
		}
		return nil, fmt.Errorf("failed to get collection: %w", err)
	}
	return &collection, nil
}

// ListCollections lists all collections
func (s *CollectionsService) ListCollections(ctx context.Context) ([]models.Collection, error) {
	var collections []models.Collection
	err := s.db.WithContext(ctx).Order("name").Find(&collections).Error
	if err != nil {
		return nil, fmt.Errorf("failed to list collections: %w", err)
	}
	return collections, nil
}

// UpdateCollection updates a collection's metadata
func (s *CollectionsService) UpdateCollection(ctx context.Context, name string, updates map[string]interface{}) error {
	collection, err := s.GetCollection(ctx, name)
	if err != nil {
		return err
	}

	// Update fields
	if displayName, ok := updates["display_name"].(string); ok {
		collection.DisplayName = displayName
	}
	if description, ok := updates["description"].(string); ok {
		collection.Description = description
	}
	if schema, ok := updates["schema"].(map[string]interface{}); ok {
		collection.Schema = models.JSON(schema)
	}
	if indexes, ok := updates["indexes"].(map[string]interface{}); ok {
		collection.Indexes = models.JSON(indexes)
	}
	if authRules, ok := updates["auth_rules"].(map[string]interface{}); ok {
		collection.AuthRules = models.JSON(authRules)
	}

	if err := s.db.WithContext(ctx).Save(collection).Error; err != nil {
		return fmt.Errorf("failed to update collection: %w", err)
	}

	return nil
}

// DeleteCollection deletes a collection and all its records
func (s *CollectionsService) DeleteCollection(ctx context.Context, name string) error {
	collection, err := s.GetCollection(ctx, name)
	if err != nil {
		return err
	}

	// Delete collection (cascade will delete records)
	if err := s.db.WithContext(ctx).Delete(collection).Error; err != nil {
		return fmt.Errorf("failed to delete collection: %w", err)
	}

	return nil
}

// CreateRecord creates a new record in a collection
func (s *CollectionsService) CreateRecord(ctx context.Context, collectionName string, data map[string]interface{}, userID *uuid.UUID) (*models.CollectionRecord, error) {
	collection, err := s.GetCollection(ctx, collectionName)
	if err != nil {
		return nil, err
	}

	// Validate data against schema
	if err := s.validateData(data, collection.Schema); err != nil {
		return nil, fmt.Errorf("data validation failed: %w", err)
	}

	record := &models.CollectionRecord{
		CollectionID: collection.ID,
		Data:         models.JSON(data),
		UserID:       userID,
	}

	if err := s.db.WithContext(ctx).Create(record).Error; err != nil {
		return nil, fmt.Errorf("failed to create record: %w", err)
	}

	return record, nil
}

// GetRecord retrieves a record by ID
func (s *CollectionsService) GetRecord(ctx context.Context, collectionName string, recordID uuid.UUID) (*models.CollectionRecord, error) {
	collection, err := s.GetCollection(ctx, collectionName)
	if err != nil {
		return nil, err
	}

	var record models.CollectionRecord
	err = s.db.WithContext(ctx).
		Where("id = ? AND collection_id = ?", recordID, collection.ID).
		First(&record).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("record not found")
		}
		return nil, fmt.Errorf("failed to get record: %w", err)
	}

	return &record, nil
}

// ListRecords lists records in a collection with pagination
func (s *CollectionsService) ListRecords(ctx context.Context, collectionName string, offset, limit int, filters map[string]interface{}) ([]models.CollectionRecord, int64, error) {
	collection, err := s.GetCollection(ctx, collectionName)
	if err != nil {
		return nil, 0, err
	}

	query := s.db.WithContext(ctx).Model(&models.CollectionRecord{}).
		Where("collection_id = ?", collection.ID)

	// Apply filters if any
	// Note: This is simplified - in production you'd want more sophisticated filtering
	for key, value := range filters {
		jsonPath := fmt.Sprintf("data->>'%s'", key)
		query = query.Where(jsonPath+" = ?", value)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count records: %w", err)
	}

	var records []models.CollectionRecord
	err = query.
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&records).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to list records: %w", err)
	}

	return records, total, nil
}

// UpdateRecord updates a record's data
func (s *CollectionsService) UpdateRecord(ctx context.Context, collectionName string, recordID uuid.UUID, data map[string]interface{}) error {
	collection, err := s.GetCollection(ctx, collectionName)
	if err != nil {
		return err
	}

	// Validate data against schema
	if err := s.validateData(data, collection.Schema); err != nil {
		return fmt.Errorf("data validation failed: %w", err)
	}

	result := s.db.WithContext(ctx).
		Model(&models.CollectionRecord{}).
		Where("id = ? AND collection_id = ?", recordID, collection.ID).
		Update("data", models.JSON(data))

	if result.Error != nil {
		return fmt.Errorf("failed to update record: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("record not found")
	}

	return nil
}

// DeleteRecord deletes a record from a collection
func (s *CollectionsService) DeleteRecord(ctx context.Context, collectionName string, recordID uuid.UUID) error {
	collection, err := s.GetCollection(ctx, collectionName)
	if err != nil {
		return err
	}

	result := s.db.WithContext(ctx).
		Where("id = ? AND collection_id = ?", recordID, collection.ID).
		Delete(&models.CollectionRecord{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete record: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("record not found")
	}

	return nil
}

// GetUserRecords gets all records created by a user
func (s *CollectionsService) GetUserRecords(ctx context.Context, userID uuid.UUID) ([]models.CollectionRecord, error) {
	var records []models.CollectionRecord
	err := s.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&records).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get user records: %w", err)
	}

	return records, nil
}

// validateData validates data against a collection schema
func (s *CollectionsService) validateData(data map[string]interface{}, schema models.JSON) error {
	// This is a simplified validation
	// In production, you'd want to use a proper JSON schema validator
	
	if schema == nil {
		return nil // No schema to validate against
	}

	schemaMap, ok := map[string]interface{}(schema)["fields"].(map[string]interface{})
	if !ok {
		return nil // Schema doesn't have fields definition
	}

	// Check required fields
	for fieldName, fieldDef := range schemaMap {
		fieldDefMap, ok := fieldDef.(map[string]interface{})
		if !ok {
			continue
		}

		required, _ := fieldDefMap["required"].(bool)
		if required {
			if _, exists := data[fieldName]; !exists {
				return fmt.Errorf("required field '%s' is missing", fieldName)
			}
		}

		// Type validation (simplified)
		if value, exists := data[fieldName]; exists && value != nil {
			expectedType, _ := fieldDefMap["type"].(string)
			if !validateType(value, expectedType) {
				return fmt.Errorf("field '%s' has invalid type", fieldName)
			}
		}
	}

	return nil
}

// validateType checks if a value matches the expected type
func validateType(value interface{}, expectedType string) bool {
	switch expectedType {
	case "string":
		_, ok := value.(string)
		return ok
	case "number":
		switch value.(type) {
		case int, int32, int64, float32, float64, json.Number:
			return true
		}
		return false
	case "boolean":
		_, ok := value.(bool)
		return ok
	case "object":
		_, ok := value.(map[string]interface{})
		return ok
	case "array":
		_, ok := value.([]interface{})
		return ok
	default:
		return true // Unknown type, allow it
	}
}

// ListCollectionInfo returns collection information for UI display
func (s *CollectionsService) ListCollectionInfo(ctx context.Context) ([]CollectionInfo, error) {
	var collections []models.Collection
	if err := s.db.WithContext(ctx).Find(&collections).Error; err != nil {
		return nil, fmt.Errorf("failed to list collections: %w", err)
	}

	var infos []CollectionInfo
	for _, col := range collections {
		// Count records for this collection
		var count int64
		s.db.WithContext(ctx).Model(&models.CollectionRecord{}).
			Where("collection_id = ?", col.ID).
			Count(&count)

		// Parse schema for preview
		schemaMap := make(map[string]interface{})
		if err := col.Schema.Unmarshal(&schemaMap); err != nil {
			s.logger.Error(ctx, "Failed to unmarshal schema", logger.Err(err))
		}

		info := CollectionInfo{
			Name:          col.Name,
			DisplayName:   col.DisplayName,
			RecordCount:   count,
			Schema:        schemaMap,
			SchemaPreview: fmt.Sprintf("%d fields", len(schemaMap)),
			Type:          "collection",
			CreatedAt:     col.CreatedAt.Format("2006-01-02"),
			LastUpdated:   col.UpdatedAt.Format("2006-01-02"),
		}
		infos = append(infos, info)
	}

	return infos, nil
}