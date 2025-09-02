package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
	"gorm.io/gorm"
)

// JSONB handles JSON data in database
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSONB)
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// Variable represents a pricing variable
type Variable struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null" json:"name"`
	DisplayName string    `json:"display_name"`
	Type        string    `json:"type"` // number, string, boolean, date
	Source      string    `json:"source"` // system, user_input, product, calculated, entity
	Category    string    `json:"category"`
	DefaultValue interface{} `gorm:"type:jsonb" json:"default_value"`
	Description string    `json:"description"`
	Formula     string    `json:"formula,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// EntityType represents a type of business entity
type EntityType struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null" json:"name"`
	DisplayName string    `json:"display_name"`
	Description string    `json:"description"`
	Schema      JSONB     `gorm:"type:jsonb" json:"schema"` // JSON schema for custom fields
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Entity represents a business entity (restaurant, store, etc)
type Entity struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"index;not null" json:"user_id"`
	EntityTypeID uint      `gorm:"index;not null" json:"entity_type_id"`
	EntityType   EntityType `json:"entity_type,omitempty"`
	Name         string    `gorm:"not null" json:"name"`
	Description  string    `json:"description"`
	CustomFields JSONB     `gorm:"type:jsonb" json:"custom_fields"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ProductType represents a type of product
type ProductType struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"uniqueIndex;not null" json:"name"`
	DisplayName     string    `json:"display_name"`
	Description     string    `json:"description"`
	Category        string    `json:"category,omitempty"`
	Icon            string    `json:"icon,omitempty"`
	Schema          JSONB     `gorm:"type:jsonb" json:"schema"` // JSON schema for custom fields
	PricingModel    string    `json:"pricing_model,omitempty"`
	BaseFormula     string    `json:"base_formula"` // Default pricing formula
	DefaultVariables JSONB    `gorm:"type:jsonb" json:"default_variables,omitempty"`
	Settings        JSONB     `gorm:"type:jsonb" json:"settings,omitempty"`
	IsActive        bool      `gorm:"default:true" json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Product represents a product
type Product struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	EntityID      uint        `gorm:"index;not null" json:"entity_id"`
	Entity        Entity      `json:"entity,omitempty"`
	ProductTypeID uint        `gorm:"index;not null" json:"product_type_id"`
	ProductType   ProductType `json:"product_type,omitempty"`
	Name          string      `gorm:"not null" json:"name"`
	Description   string      `json:"description"`
	BasePrice     float64     `json:"base_price"`
	Currency      string      `gorm:"default:'USD'" json:"currency"`
	CustomFields  JSONB       `gorm:"type:jsonb" json:"custom_fields"`
	Variables     JSONB       `gorm:"type:jsonb" json:"variables"` // Product-specific variable values
	PricingFormula string     `json:"pricing_formula"` // Override formula
	Active        bool        `gorm:"default:true" json:"active"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
}

// PricingTemplate represents a reusable pricing template
type PricingTemplate struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null" json:"name"`
	DisplayName string    `json:"display_name"`
	Description string    `json:"description"`
	Formula     string    `gorm:"not null" json:"formula"`
	Variables   JSONB     `gorm:"type:jsonb" json:"variables"` // Required variables
	Category    string    `json:"category"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// RegisterModels registers all models with GORM for auto-migration
func RegisterModels(db *gorm.DB) error {
	return db.AutoMigrate(
		&Variable{},
		&EntityType{},
		&Entity{},
		&ProductType{},
		&Product{},
		&PricingTemplate{},
	)
}