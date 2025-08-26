package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// EntityType represents a configurable entity type
type EntityType struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	MetadataSchema json.RawMessage `json:"metadata_schema"` // JSON schema for allowed metadata
	FilterConfig   json.RawMessage `json:"filter_config"`   // Configuration for filter columns
	LocationRequired bool          `json:"location_required"`
	IsActive       bool            `json:"is_active"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// EntitySubType represents a sub-type of an entity
type EntitySubType struct {
	ID             string          `json:"id"`
	EntityTypeID   string          `json:"entity_type_id"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	MetadataSchema json.RawMessage `json:"metadata_schema"`
	FilterConfig   json.RawMessage `json:"filter_config"`
	IsActive       bool            `json:"is_active"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// Entity represents an entity instance
type Entity struct {
	ID               string          `json:"id"`
	OwnerID          string          `json:"owner_id"`
	Name             string          `json:"name"`
	Description      string          `json:"description"`
	Photos           json.RawMessage `json:"photos"`
	Type             string          `json:"type"`
	SubType          string          `json:"sub_type"`
	Metadata         json.RawMessage `json:"metadata"`
	Location         *string         `json:"location"` // PostGIS geography
	ViewsCount       int             `json:"views_count"`
	LikesCount       int             `json:"likes_count"`
	
	// Dynamic filter columns
	FilterNumeric1  *float64   `json:"filter_numeric_1"`
	FilterNumeric2  *float64   `json:"filter_numeric_2"`
	FilterNumeric3  *float64   `json:"filter_numeric_3"`
	FilterNumeric4  *float64   `json:"filter_numeric_4"`
	FilterNumeric5  *float64   `json:"filter_numeric_5"`
	FilterText1     *string    `json:"filter_text_1"`
	FilterText2     *string    `json:"filter_text_2"`
	FilterText3     *string    `json:"filter_text_3"`
	FilterText4     *string    `json:"filter_text_4"`
	FilterText5     *string    `json:"filter_text_5"`
	FilterBoolean1  *bool      `json:"filter_boolean_1"`
	FilterBoolean2  *bool      `json:"filter_boolean_2"`
	FilterBoolean3  *bool      `json:"filter_boolean_3"`
	FilterBoolean4  *bool      `json:"filter_boolean_4"`
	FilterBoolean5  *bool      `json:"filter_boolean_5"`
	FilterDate1     *time.Time `json:"filter_date_1"`
	FilterDate2     *time.Time `json:"filter_date_2"`
	FilterDate3     *time.Time `json:"filter_date_3"`
	FilterDate4     *time.Time `json:"filter_date_4"`
	FilterDate5     *time.Time `json:"filter_date_5"`
	
	Status     string    `json:"status"` // active, pending, deleted
	Verified   bool      `json:"verified"`
	VersionID  int       `json:"version_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// EntityType methods

// Create creates a new entity type
func (et *EntityType) Create() error {
	query := `
		INSERT INTO entity_types (name, description, metadata_schema, filter_config, location_required, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at`
	
	err := DB.QueryRow(context.Background(), query, et.Name, et.Description, et.MetadataSchema, 
		et.FilterConfig, et.LocationRequired, et.IsActive).
		Scan(&et.ID, &et.CreatedAt, &et.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create entity type: %w", err)
	}
	return nil
}

// Update updates an entity type
func (et *EntityType) Update() error {
	query := `
		UPDATE entity_types 
		SET name = $2, description = $3, metadata_schema = $4, filter_config = $5, 
		    location_required = $6, is_active = $7
		WHERE id = $1
		RETURNING updated_at`
	
	err := DB.QueryRow(context.Background(), query, et.ID, et.Name, et.Description, et.MetadataSchema,
		et.FilterConfig, et.LocationRequired, et.IsActive).Scan(&et.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update entity type: %w", err)
	}
	return nil
}

// GetEntityTypeByID retrieves an entity type by ID
func GetEntityTypeByID(id string) (*EntityType, error) {
	et := &EntityType{}
	query := `
		SELECT id, name, description, metadata_schema, filter_config, location_required, 
		       is_active, created_at, updated_at
		FROM entity_types 
		WHERE id = $1`
	
	err := DB.QueryRow(context.Background(), query, id).Scan(
		&et.ID, &et.Name, &et.Description, &et.MetadataSchema, 
		&et.FilterConfig, &et.LocationRequired, &et.IsActive, 
		&et.CreatedAt, &et.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get entity type: %w", err)
	}
	return et, nil
}

// GetEntityTypeByName retrieves an entity type by name
func GetEntityTypeByName(name string) (*EntityType, error) {
	et := &EntityType{}
	query := `
		SELECT id, name, description, metadata_schema, filter_config, location_required, 
		       is_active, created_at, updated_at
		FROM entity_types 
		WHERE name = $1 AND is_active = true`
	
	err := DB.QueryRow(context.Background(), query, name).Scan(
		&et.ID, &et.Name, &et.Description, &et.MetadataSchema, 
		&et.FilterConfig, &et.LocationRequired, &et.IsActive, 
		&et.CreatedAt, &et.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get entity type: %w", err)
	}
	return et, nil
}

// GetAllEntityTypes retrieves all active entity types
func GetAllEntityTypes() ([]EntityType, error) {
	query := `
		SELECT id, name, description, metadata_schema, filter_config, location_required, 
		       is_active, created_at, updated_at
		FROM entity_types 
		WHERE is_active = true
		ORDER BY name`
	
	rows, err := DB.Query(context.Background(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to get entity types: %w", err)
	}
	defer rows.Close()
	
	var types []EntityType
	for rows.Next() {
		var et EntityType
		err := rows.Scan(
			&et.ID, &et.Name, &et.Description, &et.MetadataSchema, 
			&et.FilterConfig, &et.LocationRequired, &et.IsActive, 
			&et.CreatedAt, &et.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan entity type: %w", err)
		}
		types = append(types, et)
	}
	
	return types, nil
}

// EntitySubType methods

// Create creates a new entity sub-type
func (est *EntitySubType) Create() error {
	query := `
		INSERT INTO entity_sub_types (entity_type_id, name, description, metadata_schema, filter_config, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at`
	
	err := DB.QueryRow(context.Background(), query, est.EntityTypeID, est.Name, est.Description, 
		est.MetadataSchema, est.FilterConfig, est.IsActive).
		Scan(&est.ID, &est.CreatedAt, &est.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create entity sub-type: %w", err)
	}
	return nil
}

// Update updates an entity sub-type
func (est *EntitySubType) Update() error {
	query := `
		UPDATE entity_sub_types 
		SET name = $3, description = $4, metadata_schema = $5, filter_config = $6, is_active = $7
		WHERE id = $1 AND entity_type_id = $2
		RETURNING updated_at`
	
	err := DB.QueryRow(context.Background(), query, est.ID, est.EntityTypeID, est.Name, est.Description,
		est.MetadataSchema, est.FilterConfig, est.IsActive).Scan(&est.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update entity sub-type: %w", err)
	}
	return nil
}

// GetEntitySubTypesByTypeID retrieves sub-types for an entity type
func GetEntitySubTypesByTypeID(entityTypeID string) ([]EntitySubType, error) {
	query := `
		SELECT id, entity_type_id, name, description, metadata_schema, filter_config, 
		       is_active, created_at, updated_at
		FROM entity_sub_types 
		WHERE entity_type_id = $1 AND is_active = true
		ORDER BY name`
	
	rows, err := DB.Query(context.Background(), query, entityTypeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get entity sub-types: %w", err)
	}
	defer rows.Close()
	
	var subTypes []EntitySubType
	for rows.Next() {
		var est EntitySubType
		err := rows.Scan(
			&est.ID, &est.EntityTypeID, &est.Name, &est.Description, 
			&est.MetadataSchema, &est.FilterConfig, &est.IsActive, 
			&est.CreatedAt, &est.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan entity sub-type: %w", err)
		}
		subTypes = append(subTypes, est)
	}
	
	return subTypes, nil
}

// Entity methods

// Create creates a new entity
func (e *Entity) Create() error {
	query := `
		INSERT INTO entities (owner_id, name, description, photos, type, sub_type, metadata, location,
		                     filter_numeric_1, filter_numeric_2, filter_numeric_3, filter_numeric_4, filter_numeric_5,
		                     filter_text_1, filter_text_2, filter_text_3, filter_text_4, filter_text_5,
		                     filter_boolean_1, filter_boolean_2, filter_boolean_3, filter_boolean_4, filter_boolean_5,
		                     filter_date_1, filter_date_2, filter_date_3, filter_date_4, filter_date_5,
		                     status, verified, version_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
		        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
		RETURNING id, created_at, updated_at`
	
	err := DB.QueryRow(context.Background(), query,
		e.OwnerID, e.Name, e.Description, e.Photos, e.Type, e.SubType, e.Metadata, e.Location,
		e.FilterNumeric1, e.FilterNumeric2, e.FilterNumeric3, e.FilterNumeric4, e.FilterNumeric5,
		e.FilterText1, e.FilterText2, e.FilterText3, e.FilterText4, e.FilterText5,
		e.FilterBoolean1, e.FilterBoolean2, e.FilterBoolean3, e.FilterBoolean4, e.FilterBoolean5,
		e.FilterDate1, e.FilterDate2, e.FilterDate3, e.FilterDate4, e.FilterDate5,
		e.Status, e.Verified, e.VersionID).
		Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create entity: %w", err)
	}
	return nil
}

// Update updates an entity
func (e *Entity) Update() error {
	query := `
		UPDATE entities 
		SET name = $2, description = $3, photos = $4, type = $5, sub_type = $6, metadata = $7, location = $8,
		    filter_numeric_1 = $9, filter_numeric_2 = $10, filter_numeric_3 = $11, filter_numeric_4 = $12, filter_numeric_5 = $13,
		    filter_text_1 = $14, filter_text_2 = $15, filter_text_3 = $16, filter_text_4 = $17, filter_text_5 = $18,
		    filter_boolean_1 = $19, filter_boolean_2 = $20, filter_boolean_3 = $21, filter_boolean_4 = $22, filter_boolean_5 = $23,
		    filter_date_1 = $24, filter_date_2 = $25, filter_date_3 = $26, filter_date_4 = $27, filter_date_5 = $28,
		    status = $29, verified = $30, version_id = version_id + 1
		WHERE id = $1
		RETURNING updated_at, version_id`
	
	err := DB.QueryRow(context.Background(), query,
		e.ID, e.Name, e.Description, e.Photos, e.Type, e.SubType, e.Metadata, e.Location,
		e.FilterNumeric1, e.FilterNumeric2, e.FilterNumeric3, e.FilterNumeric4, e.FilterNumeric5,
		e.FilterText1, e.FilterText2, e.FilterText3, e.FilterText4, e.FilterText5,
		e.FilterBoolean1, e.FilterBoolean2, e.FilterBoolean3, e.FilterBoolean4, e.FilterBoolean5,
		e.FilterDate1, e.FilterDate2, e.FilterDate3, e.FilterDate4, e.FilterDate5,
		e.Status, e.Verified).
		Scan(&e.UpdatedAt, &e.VersionID)
	if err != nil {
		return fmt.Errorf("failed to update entity: %w", err)
	}
	return nil
}

// GetEntityByID retrieves an entity by ID
func GetEntityByID(id string) (*Entity, error) {
	e := &Entity{}
	query := `
		SELECT id, owner_id, name, description, photos, type, sub_type, metadata, location,
		       views_count, likes_count,
		       filter_numeric_1, filter_numeric_2, filter_numeric_3, filter_numeric_4, filter_numeric_5,
		       filter_text_1, filter_text_2, filter_text_3, filter_text_4, filter_text_5,
		       filter_boolean_1, filter_boolean_2, filter_boolean_3, filter_boolean_4, filter_boolean_5,
		       filter_date_1, filter_date_2, filter_date_3, filter_date_4, filter_date_5,
		       status, verified, version_id, created_at, updated_at
		FROM entities 
		WHERE id = $1 AND status != 'deleted'`
	
	err := DB.QueryRow(context.Background(), query, id).Scan(
		&e.ID, &e.OwnerID, &e.Name, &e.Description, &e.Photos, &e.Type, &e.SubType, &e.Metadata, &e.Location,
		&e.ViewsCount, &e.LikesCount,
		&e.FilterNumeric1, &e.FilterNumeric2, &e.FilterNumeric3, &e.FilterNumeric4, &e.FilterNumeric5,
		&e.FilterText1, &e.FilterText2, &e.FilterText3, &e.FilterText4, &e.FilterText5,
		&e.FilterBoolean1, &e.FilterBoolean2, &e.FilterBoolean3, &e.FilterBoolean4, &e.FilterBoolean5,
		&e.FilterDate1, &e.FilterDate2, &e.FilterDate3, &e.FilterDate4, &e.FilterDate5,
		&e.Status, &e.Verified, &e.VersionID, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get entity: %w", err)
	}
	return e, nil
}

// GetEntitiesByOwner retrieves entities for a specific owner
func GetEntitiesByOwner(ownerID string, limit, offset int) ([]Entity, error) {
	query := `
		SELECT id, owner_id, name, description, photos, type, sub_type, metadata, location,
		       views_count, likes_count,
		       filter_numeric_1, filter_numeric_2, filter_numeric_3, filter_numeric_4, filter_numeric_5,
		       filter_text_1, filter_text_2, filter_text_3, filter_text_4, filter_text_5,
		       filter_boolean_1, filter_boolean_2, filter_boolean_3, filter_boolean_4, filter_boolean_5,
		       filter_date_1, filter_date_2, filter_date_3, filter_date_4, filter_date_5,
		       status, verified, version_id, created_at, updated_at
		FROM entities 
		WHERE owner_id = $1 AND status != 'deleted'
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := DB.Query(context.Background(), query, ownerID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get entities by owner: %w", err)
	}
	defer rows.Close()
	
	var entities []Entity
	for rows.Next() {
		var e Entity
		err := rows.Scan(
			&e.ID, &e.OwnerID, &e.Name, &e.Description, &e.Photos, &e.Type, &e.SubType, &e.Metadata, &e.Location,
			&e.ViewsCount, &e.LikesCount,
			&e.FilterNumeric1, &e.FilterNumeric2, &e.FilterNumeric3, &e.FilterNumeric4, &e.FilterNumeric5,
			&e.FilterText1, &e.FilterText2, &e.FilterText3, &e.FilterText4, &e.FilterText5,
			&e.FilterBoolean1, &e.FilterBoolean2, &e.FilterBoolean3, &e.FilterBoolean4, &e.FilterBoolean5,
			&e.FilterDate1, &e.FilterDate2, &e.FilterDate3, &e.FilterDate4, &e.FilterDate5,
			&e.Status, &e.Verified, &e.VersionID, &e.CreatedAt, &e.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan entity: %w", err)
		}
		entities = append(entities, e)
	}
	
	return entities, nil
}

// IncrementViews increments the view count for an entity
func (e *Entity) IncrementViews() error {
	query := `UPDATE entities SET views_count = views_count + 1 WHERE id = $1`
	_, err := DB.Exec(context.Background(), query, e.ID)
	if err != nil {
		return fmt.Errorf("failed to increment views: %w", err)
	}
	e.ViewsCount++
	return nil
}