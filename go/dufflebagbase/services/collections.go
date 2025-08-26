package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/suppers-ai/database"
	"github.com/suppers-ai/logger"
)

// CollectionInfo provides summary information about a collection
type CollectionInfo struct {
	Name          string `json:"name"`
	Type          string `json:"type"`
	RecordCount   int    `json:"record_count"`
	SchemaPreview string `json:"schema_preview"`
	CreatedAt     string `json:"created_at"`
}

// CollectionsService handles collection operations
type CollectionsService struct {
	db     database.Database
	logger logger.Logger
}

type Collection struct {
	ID          string                 `json:"id" db:"id"`
	Name        string                 `json:"name" db:"name"`
	DisplayName string                 `json:"display_name" db:"display_name"`
	Description string                 `json:"description" db:"description"`
	Schema      map[string]interface{} `json:"schema" db:"schema"`
	Indexes     []Index                `json:"indexes" db:"indexes"`
	AuthRules   AuthRules              `json:"auth_rules" db:"auth_rules"`
	CreatedAt   time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at" db:"updated_at"`
}

type Index struct {
	Name    string   `json:"name"`
	Fields  []string `json:"fields"`
	Unique  bool     `json:"unique"`
	Primary bool     `json:"primary"`
}

type AuthRules struct {
	ListRule   string `json:"list_rule"`
	ViewRule   string `json:"view_rule"`
	CreateRule string `json:"create_rule"`
	UpdateRule string `json:"update_rule"`
	DeleteRule string `json:"delete_rule"`
}

type Field struct {
	Name         string      `json:"name"`
	Type         string      `json:"type"` // text, number, boolean, date, json, uuid, reference
	Required     bool        `json:"required"`
	Unique       bool        `json:"unique"`
	Default      interface{} `json:"default"`
	Reference    string      `json:"reference,omitempty"`    // For reference types
	OnDelete     string      `json:"on_delete,omitempty"`     // cascade, restrict, set null
	MinLength    *int        `json:"min_length,omitempty"`
	MaxLength    *int        `json:"max_length,omitempty"`
	Min          *float64    `json:"min,omitempty"`
	Max          *float64    `json:"max,omitempty"`
	Pattern      string      `json:"pattern,omitempty"`
	Enum         []string    `json:"enum,omitempty"`
	Indexed      bool        `json:"indexed"`
	Searchable   bool        `json:"searchable"`
}

// ListCollections returns all collections
func (cs *CollectionsService) ListCollections(ctx context.Context) ([]Collection, error) {
	var collections []Collection
	
	query := `
		SELECT 
			id, name, display_name, description, 
			schema, indexes, auth_rules,
			created_at, updated_at
		FROM collections.collections
		ORDER BY name
	`
	
	rows, err := cs.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list collections: %w", err)
	}
	defer rows.Close()
	
	for rows.Next() {
		var c Collection
		var schemaJSON, indexesJSON, authRulesJSON []byte
		
		err := rows.Scan(
			&c.ID, &c.Name, &c.DisplayName, &c.Description,
			&schemaJSON, &indexesJSON, &authRulesJSON,
			&c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Parse JSON fields
		if err := json.Unmarshal(schemaJSON, &c.Schema); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(indexesJSON, &c.Indexes); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(authRulesJSON, &c.AuthRules); err != nil {
			return nil, err
		}
		
		collections = append(collections, c)
	}
	
	return collections, nil
}

// ListCollectionInfo returns summary information for all collections
func (cs *CollectionsService) ListCollectionInfo(ctx context.Context) ([]CollectionInfo, error) {
	collections, err := cs.ListCollections(ctx)
	if err != nil {
		return nil, err
	}
	
	var infos []CollectionInfo
	for _, c := range collections {
		// Get record count for this collection
		var count int
		countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM collections.%s`, c.Name)
		_ = cs.db.Get(ctx, &count, countQuery) // Ignore error, use 0 if fails
		
		// Create schema preview
		schemaPreview := "No fields defined"
		if fields, ok := c.Schema["fields"].([]interface{}); ok && len(fields) > 0 {
			var fieldNames []string
			for i, f := range fields {
				if i >= 3 { // Show only first 3 fields
					fieldNames = append(fieldNames, "...")
					break
				}
				if field, ok := f.(map[string]interface{}); ok {
					if name, ok := field["name"].(string); ok {
						fieldNames = append(fieldNames, name)
					}
				}
			}
			schemaPreview = strings.Join(fieldNames, ", ")
		}
		
		info := CollectionInfo{
			Name:          c.Name,
			Type:          "user", // or determine from metadata
			RecordCount:   count,
			SchemaPreview: schemaPreview,
			CreatedAt:     c.CreatedAt.Format("2006-01-02 15:04"),
		}
		infos = append(infos, info)
	}
	
	return infos, nil
}

// GetCollection returns a collection by name
func (cs *CollectionsService) GetCollection(ctx context.Context, name string) (*Collection, error) {
	var c Collection
	var schemaJSON, indexesJSON, authRulesJSON []byte
	
	query := `
		SELECT 
			id, name, display_name, description,
			schema, indexes, auth_rules,
			created_at, updated_at
		FROM collections.collections
		WHERE name = $1
	`
	
	err := cs.db.Get(ctx, &struct {
		*Collection
		SchemaJSON    []byte `db:"schema"`
		IndexesJSON   []byte `db:"indexes"`
		AuthRulesJSON []byte `db:"auth_rules"`
	}{
		Collection: &c,
	}, query, name)
	
	if err != nil {
		return nil, fmt.Errorf("failed to get collection: %w", err)
	}
	
	// Parse JSON fields
	if err := json.Unmarshal(schemaJSON, &c.Schema); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(indexesJSON, &c.Indexes); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(authRulesJSON, &c.AuthRules); err != nil {
		return nil, err
	}
	
	return &c, nil
}

// CreateCollection creates a new collection and its table
func (cs *CollectionsService) CreateCollection(ctx context.Context, collection *Collection) error {
	// Validate collection name
	if !isValidCollectionName(collection.Name) {
		return fmt.Errorf("invalid collection name: must be lowercase alphanumeric with underscores")
	}
	
	// Generate ID if not provided
	if collection.ID == "" {
		collection.ID = uuid.New().String()
	}
	
	// Set timestamps
	now := time.Now()
	collection.CreatedAt = now
	collection.UpdatedAt = now
	
	// Begin transaction
	tx, err := cs.db.BeginTx(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()
	
	// Marshal JSON fields
	schemaJSON, err := json.Marshal(collection.Schema)
	if err != nil {
		return err
	}
	indexesJSON, err := json.Marshal(collection.Indexes)
	if err != nil {
		return err
	}
	authRulesJSON, err := json.Marshal(collection.AuthRules)
	if err != nil {
		return err
	}
	
	// Insert collection metadata
	insertQuery := `
		INSERT INTO collections.collections 
		(id, name, display_name, description, schema, indexes, auth_rules, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	
	_, err = tx.Exec(ctx, insertQuery,
		collection.ID, collection.Name, collection.DisplayName, collection.Description,
		schemaJSON, indexesJSON, authRulesJSON,
		collection.CreatedAt, collection.UpdatedAt,
	)
	
	if err != nil {
		return fmt.Errorf("failed to insert collection: %w", err)
	}
	
	// Create the actual table for the collection
	if err := cs.createCollectionTable(ctx, tx, collection); err != nil {
		return fmt.Errorf("failed to create collection table: %w", err)
	}
	
	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	
	cs.logger.Info(ctx, "Collection created",
		logger.String("name", collection.Name),
		logger.String("id", collection.ID))
	
	return nil
}

// createCollectionTable creates the actual database table for a collection
func (cs *CollectionsService) createCollectionTable(ctx context.Context, tx database.Transaction, collection *Collection) error {
	// Build CREATE TABLE statement
	var columns []string
	
	// Always add system columns
	columns = append(columns,
		"id UUID PRIMARY KEY DEFAULT gen_random_uuid()",
		"created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())",
		"updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())",
		"created_by UUID",
		"updated_by UUID",
	)
	
	// Parse schema and add user-defined columns
	if fields, ok := collection.Schema["fields"].([]interface{}); ok {
		for _, f := range fields {
			if field, ok := f.(map[string]interface{}); ok {
				column := cs.buildColumnDefinition(field)
				if column != "" {
					columns = append(columns, column)
				}
			}
		}
	}
	
	// Create table
	tableName := fmt.Sprintf("collections.%s", collection.Name)
	createSQL := fmt.Sprintf("CREATE TABLE %s (\n  %s\n)",
		tableName,
		strings.Join(columns, ",\n  "))
	
	if _, err := tx.Exec(ctx, createSQL); err != nil {
		return fmt.Errorf("failed to create table: %w", err)
	}
	
	// Create indexes
	for _, index := range collection.Indexes {
		if err := cs.createIndex(ctx, tx, collection.Name, index); err != nil {
			return fmt.Errorf("failed to create index %s: %w", index.Name, err)
		}
	}
	
	// Create RLS policies based on auth rules
	if err := cs.createRLSPolicies(ctx, tx, collection); err != nil {
		return fmt.Errorf("failed to create RLS policies: %w", err)
	}
	
	return nil
}

// buildColumnDefinition builds SQL column definition from field schema
func (cs *CollectionsService) buildColumnDefinition(field map[string]interface{}) string {
	name, _ := field["name"].(string)
	fieldType, _ := field["type"].(string)
	required, _ := field["required"].(bool)
	unique, _ := field["unique"].(bool)
	
	if name == "" || fieldType == "" {
		return ""
	}
	
	// Map field types to SQL types
	var sqlType string
	switch fieldType {
	case "text":
		if maxLen, ok := field["max_length"].(float64); ok {
			sqlType = fmt.Sprintf("VARCHAR(%d)", int(maxLen))
		} else {
			sqlType = "TEXT"
		}
	case "number":
		sqlType = "NUMERIC"
	case "boolean":
		sqlType = "BOOLEAN"
	case "date":
		sqlType = "TIMESTAMP WITH TIME ZONE"
	case "json":
		sqlType = "JSONB"
	case "uuid":
		sqlType = "UUID"
	case "reference":
		sqlType = "UUID"
	default:
		sqlType = "TEXT"
	}
	
	column := fmt.Sprintf("%s %s", name, sqlType)
	
	if required {
		column += " NOT NULL"
	}
	
	if unique {
		column += " UNIQUE"
	}
	
	if defaultVal := field["default"]; defaultVal != nil {
		switch v := defaultVal.(type) {
		case string:
			column += fmt.Sprintf(" DEFAULT '%s'", v)
		case float64:
			column += fmt.Sprintf(" DEFAULT %f", v)
		case bool:
			column += fmt.Sprintf(" DEFAULT %t", v)
		}
	}
	
	// Add foreign key constraint for references
	if fieldType == "reference" {
		if ref, ok := field["reference"].(string); ok {
			onDelete := field["on_delete"]
			if onDelete == "" {
				onDelete = "CASCADE"
			}
			column += fmt.Sprintf(" REFERENCES collections.%s(id) ON DELETE %s", ref, onDelete)
		}
	}
	
	return column
}

// createIndex creates a database index
func (cs *CollectionsService) createIndex(ctx context.Context, tx database.Transaction, tableName string, index Index) error {
	if len(index.Fields) == 0 {
		return nil
	}
	
	indexType := ""
	if index.Unique {
		indexType = "UNIQUE "
	}
	
	indexName := index.Name
	if indexName == "" {
		indexName = fmt.Sprintf("idx_%s_%s", tableName, strings.Join(index.Fields, "_"))
	}
	
	createSQL := fmt.Sprintf("CREATE %sINDEX %s ON collections.%s (%s)",
		indexType,
		indexName,
		tableName,
		strings.Join(index.Fields, ", "))
	
	_, err := tx.Exec(ctx, createSQL)
	return err
}

// createRLSPolicies creates Row Level Security policies
func (cs *CollectionsService) createRLSPolicies(ctx context.Context, tx database.Transaction, collection *Collection) error {
	tableName := fmt.Sprintf("collections.%s", collection.Name)
	
	// Enable RLS
	if _, err := tx.Exec(ctx, fmt.Sprintf("ALTER TABLE %s ENABLE ROW LEVEL SECURITY", tableName)); err != nil {
		return err
	}
	
	// Create policies based on auth rules
	// This is a simplified version - in production you'd want more sophisticated rule parsing
	
	// List/Select policy
	if collection.AuthRules.ListRule != "" {
		policySQL := fmt.Sprintf(`
			CREATE POLICY "%s_select" ON %s
			FOR SELECT
			USING (%s)
		`, collection.Name, tableName, cs.parseAuthRule(collection.AuthRules.ListRule))
		
		if _, err := tx.Exec(ctx, policySQL); err != nil {
			return err
		}
	}
	
	// Insert policy
	if collection.AuthRules.CreateRule != "" {
		policySQL := fmt.Sprintf(`
			CREATE POLICY "%s_insert" ON %s
			FOR INSERT
			WITH CHECK (%s)
		`, collection.Name, tableName, cs.parseAuthRule(collection.AuthRules.CreateRule))
		
		if _, err := tx.Exec(ctx, policySQL); err != nil {
			return err
		}
	}
	
	// Update policy
	if collection.AuthRules.UpdateRule != "" {
		policySQL := fmt.Sprintf(`
			CREATE POLICY "%s_update" ON %s
			FOR UPDATE
			USING (%s)
			WITH CHECK (%s)
		`, collection.Name, tableName, 
			cs.parseAuthRule(collection.AuthRules.UpdateRule),
			cs.parseAuthRule(collection.AuthRules.UpdateRule))
		
		if _, err := tx.Exec(ctx, policySQL); err != nil {
			return err
		}
	}
	
	// Delete policy
	if collection.AuthRules.DeleteRule != "" {
		policySQL := fmt.Sprintf(`
			CREATE POLICY "%s_delete" ON %s
			FOR DELETE
			USING (%s)
		`, collection.Name, tableName, cs.parseAuthRule(collection.AuthRules.DeleteRule))
		
		if _, err := tx.Exec(ctx, policySQL); err != nil {
			return err
		}
	}
	
	return nil
}

// parseAuthRule converts a simple auth rule to SQL
func (cs *CollectionsService) parseAuthRule(rule string) string {
	// Simple rule parsing - in production you'd want a proper parser
	switch rule {
	case "@everyone":
		return "true"
	case "@authenticated":
		return "auth.uid() IS NOT NULL"
	case "@admin":
		return "auth.role() = 'admin'"
	default:
		// Custom rule - pass through as-is for now
		return rule
	}
}

// UpdateCollection updates a collection
func (cs *CollectionsService) UpdateCollection(ctx context.Context, name string, updates map[string]interface{}) error {
	// This is simplified - in production you'd handle schema migrations
	updates["updated_at"] = time.Now()
	
	schemaJSON, _ := json.Marshal(updates["schema"])
	indexesJSON, _ := json.Marshal(updates["indexes"])
	authRulesJSON, _ := json.Marshal(updates["auth_rules"])
	
	query := `
		UPDATE collections.collections
		SET display_name = $2, description = $3, 
		    schema = $4, indexes = $5, auth_rules = $6,
		    updated_at = $7
		WHERE name = $1
	`
	
	_, err := cs.db.Exec(ctx, query,
		name,
		updates["display_name"],
		updates["description"],
		schemaJSON,
		indexesJSON,
		authRulesJSON,
		updates["updated_at"],
	)
	
	return err
}

// DeleteCollection deletes a collection and its table
func (cs *CollectionsService) DeleteCollection(ctx context.Context, name string) error {
	tx, err := cs.db.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Drop the table
	dropSQL := fmt.Sprintf("DROP TABLE IF EXISTS collections.%s CASCADE", name)
	if _, err := tx.Exec(ctx, dropSQL); err != nil {
		return err
	}
	
	// Delete metadata
	deleteQuery := "DELETE FROM collections.collections WHERE name = $1"
	if _, err := tx.Exec(ctx, deleteQuery, name); err != nil {
		return err
	}
	
	return tx.Commit()
}

// GetCollectionData gets data from a collection for display in the database page
func (cs *CollectionsService) GetCollectionData(ctx context.Context, collectionName string, offset, pageSize int) ([]map[string]interface{}, int, error) {
	return cs.ListRecords(ctx, collectionName, pageSize, offset)
}

// ListRecords lists records from a collection
func (cs *CollectionsService) ListRecords(ctx context.Context, collectionName string, limit, offset int) ([]map[string]interface{}, int, error) {
	// First get collection to ensure it exists
	collection, err := cs.GetCollection(ctx, collectionName)
	if err != nil {
		return nil, 0, fmt.Errorf("collection not found: %w", err)
	}
	
	tableName := fmt.Sprintf("collections.%s", collection.Name)
	
	// Count total records
	var total int
	err = cs.db.Get(ctx, &total, fmt.Sprintf(`
		SELECT COUNT(*) FROM %s
	`, tableName))
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count records: %w", err)
	}
	
	// Get records - using a dynamic query
	query := fmt.Sprintf(`
		SELECT row_to_json(t.*) as data FROM %s t
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, tableName)
	
	rows, err := cs.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query records: %w", err)
	}
	defer rows.Close()
	
	var records []map[string]interface{}
	for rows.Next() {
		var data json.RawMessage
		if err := rows.Scan(&data); err != nil {
			return nil, 0, err
		}
		
		var record map[string]interface{}
		if err := json.Unmarshal(data, &record); err != nil {
			return nil, 0, err
		}
		
		records = append(records, record)
	}
	
	return records, total, nil
}

// CreateRecord creates a new record in a collection
func (cs *CollectionsService) CreateRecord(ctx context.Context, collectionName string, data map[string]interface{}) (string, error) {
	// First get collection to ensure it exists
	collection, err := cs.GetCollection(ctx, collectionName)
	if err != nil {
		return "", fmt.Errorf("collection not found: %w", err)
	}
	
	tableName := fmt.Sprintf("collections.%s", collection.Name)
	
	// Generate ID if not provided
	id, ok := data["id"].(string)
	if !ok || id == "" {
		id = uuid.New().String()
		data["id"] = id
	}
	
	// Set timestamps if not provided
	if _, ok := data["created_at"]; !ok {
		data["created_at"] = time.Now()
	}
	if _, ok := data["updated_at"]; !ok {
		data["updated_at"] = time.Now()
	}
	
	// Build dynamic INSERT query based on data keys
	var columns []string
	var placeholders []string
	var values []interface{}
	i := 1
	
	for key, value := range data {
		columns = append(columns, key)
		placeholders = append(placeholders, fmt.Sprintf("$%d", i))
		values = append(values, value)
		i++
	}
	
	query := fmt.Sprintf(`
		INSERT INTO %s (%s)
		VALUES (%s)
	`, tableName, strings.Join(columns, ", "), strings.Join(placeholders, ", "))
	
	_, err = cs.db.Exec(ctx, query, values...)
	if err != nil {
		return "", fmt.Errorf("failed to insert record: %w", err)
	}
	
	return id, nil
}

// Helper function to validate collection names
func isValidCollectionName(name string) bool {
	if len(name) == 0 || len(name) > 63 {
		return false
	}
	
	for i, c := range name {
		if !((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9' && i > 0) || c == '_') {
			return false
		}
	}
	
	return true
}