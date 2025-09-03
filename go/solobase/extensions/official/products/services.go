package products

import (
	"strings"
	
	"github.com/suppers-ai/solobase/extensions/official/products/models"
	"gorm.io/gorm"
)

// VariableService handles variable operations
type VariableService struct {
	db *gorm.DB
}

func NewVariableService(db *gorm.DB) *VariableService {
	return &VariableService{db: db}
}

func (s *VariableService) List() ([]models.Variable, error) {
	var variables []models.Variable
	err := s.db.Find(&variables).Error
	return variables, err
}

func (s *VariableService) ListBySource(sourceType string, sourceID *uint) ([]models.Variable, error) {
	var variables []models.Variable
	query := s.db.Where("source_type = ?", sourceType)
	if sourceID != nil {
		query = query.Where("source_id = ?", *sourceID)
	} else {
		query = query.Where("source_id IS NULL")
	}
	err := query.Find(&variables).Error
	return variables, err
}

func (s *VariableService) Create(variable *models.Variable) error {
	return s.db.Create(variable).Error
}

func (s *VariableService) CreateFromField(field models.FieldDefinition, sourceType string, sourceID *uint) (*models.Variable, error) {
	variable := &models.Variable{
		Name:        field.Name,
		DisplayName: field.Name,
		ValueType:   field.Type,
		Type:        "seller_input",
		SourceType:  sourceType,
		SourceID:    sourceID,
		Description: field.Description,
		DefaultValue: field.Constraints.Default,
		IsActive:    true,
	}
	
	// Handle select fields
	if field.Type == "select" && len(field.Constraints.Options) > 0 {
		variable.Options = field.Constraints.Options
	}
	
	// Convert constraints to JSONB
	variable.Constraints = models.JSONB{
		"required":   field.Constraints.Required,
		"min":        field.Constraints.Min,
		"max":        field.Constraints.Max,
		"min_length": field.Constraints.MinLength,
		"max_length": field.Constraints.MaxLength,
		"pattern":    field.Constraints.Pattern,
	}
	
	if err := s.db.Create(variable).Error; err != nil {
		return nil, err
	}
	return variable, nil
}

func (s *VariableService) Update(id uint, variable *models.Variable) error {
	return s.db.Model(&models.Variable{}).Where("id = ?", id).Updates(variable).Error
}

func (s *VariableService) Delete(id uint) error {
	return s.db.Delete(&models.Variable{}, id).Error
}

func (s *VariableService) DeleteBySource(sourceType string, sourceID uint) error {
	return s.db.Where("source_type = ? AND source_id = ?", sourceType, sourceID).Delete(&models.Variable{}).Error
}

// EntityService handles entity operations
type EntityService struct {
	db              *gorm.DB
	variableService *VariableService
}

func NewEntityService(db *gorm.DB) *EntityService {
	return &EntityService{
		db:              db,
		variableService: NewVariableService(db),
	}
}

func (s *EntityService) ListByUser(userID uint) ([]models.Entity, error) {
	var entities []models.Entity
	err := s.db.Preload("EntityTemplate").Where("user_id = ?", userID).Find(&entities).Error
	return entities, err
}

func (s *EntityService) Create(entity *models.Entity) error {
	// Start a transaction
	tx := s.db.Begin()
	
	// Create the entity
	if err := tx.Create(entity).Error; err != nil {
		tx.Rollback()
		return err
	}
	
	// Load the entity template to get field definitions
	var entityTemplate models.EntityTemplate
	if err := tx.First(&entityTemplate, entity.EntityTemplateID).Error; err == nil && len(entityTemplate.Fields) > 0 {
		// Map field values to filter columns based on field IDs
		if customFields, ok := entity.CustomFields["fields"].(map[string]interface{}); ok {
			for _, field := range entityTemplate.Fields {
				if value, exists := customFields[field.Name]; exists {
					// Map to appropriate filter column based on field ID
					s.mapToFilterColumn(tx, entity, field.ID, value)
				}
			}
		}
		
		// Create variables for each field using the transaction
		txVariableService := &VariableService{db: tx}
		for _, field := range entityTemplate.Fields {
			variable := &models.Variable{
				Name:        field.ID,
				DisplayName: field.Name,
				ValueType:   field.Type,
				Type:        "seller_input",
				SourceType:  "entity",
				SourceID:    &entity.ID,
				Description: field.Description,
				Constraints: models.JSONB{
					"required":   field.Required,
					"min":        field.Constraints.Min,
					"max":        field.Constraints.Max,
					"min_length": field.Constraints.MinLength,
					"max_length": field.Constraints.MaxLength,
					"pattern":    field.Constraints.Pattern,
					"options":    field.Constraints.Options,
				},
				IsActive:    true,
			}
			txVariableService.Create(variable)
		}
	}
	
	tx.Commit()
	return nil
}

// mapToFilterColumn maps a value to the appropriate filter column
func (s *EntityService) mapToFilterColumn(tx *gorm.DB, entity *models.Entity, fieldID string, value interface{}) {
	// Parse the field ID to get type and index (e.g., "filter_numeric_1" -> type: "numeric", index: 1)
	parts := strings.Split(fieldID, "_")
	if len(parts) != 3 || parts[0] != "filter" {
		return
	}
	
	fieldType := parts[1]
	index := parts[2]
	
	updates := map[string]interface{}{}
	
	switch fieldType {
	case "numeric":
		if v, ok := value.(float64); ok {
			updates["filter_numeric_"+index] = v
		}
	case "text":
		if v, ok := value.(string); ok {
			updates["filter_text_"+index] = v
		}
	case "boolean":
		if v, ok := value.(bool); ok {
			updates["filter_boolean_"+index] = v
		}
	case "enum":
		if v, ok := value.(string); ok {
			updates["filter_enum_"+index] = v
		}
	case "location":
		if v, ok := value.(string); ok {
			updates["filter_location_"+index] = v
		}
	}
	
	if len(updates) > 0 {
		tx.Model(&models.Entity{}).Where("id = ?", entity.ID).Updates(updates)
	}
}

func (s *EntityService) Update(id uint, userID uint, entity *models.Entity) error {
	return s.db.Model(&models.Entity{}).Where("id = ? AND user_id = ?", id, userID).Updates(entity).Error
}

func (s *EntityService) Delete(id uint, userID uint) error {
	return s.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Entity{}).Error
}

func (s *EntityService) GetByID(id uint, userID uint) (*models.Entity, error) {
	var entity models.Entity
	err := s.db.Preload("EntityTemplate").Where("id = ? AND user_id = ?", id, userID).First(&entity).Error
	if err != nil {
		return nil, err
	}
	return &entity, nil
}

// ProductService handles product operations
type ProductService struct {
	db              *gorm.DB
	variableService *VariableService
}

func NewProductService(db *gorm.DB, variableService *VariableService) *ProductService {
	return &ProductService{
		db:              db,
		variableService: variableService,
	}
}

func (s *ProductService) ListByEntity(entityID uint) ([]models.Product, error) {
	var products []models.Product
	err := s.db.Preload("ProductTemplate").Where("entity_id = ?", entityID).Find(&products).Error
	return products, err
}

func (s *ProductService) ListByUser(userID uint) ([]models.Product, error) {
	var products []models.Product
	
	// First, get all entity IDs for the user
	var entityIDs []uint
	if err := s.db.Table("entity").Where("user_id = ?", userID).Pluck("id", &entityIDs).Error; err != nil {
		return nil, err
	}
	
	// Then get products for those entities
	if len(entityIDs) > 0 {
		err := s.db.Preload("Entity").Preload("ProductTemplate").
			Where("entity_id IN ?", entityIDs).
			Find(&products).Error
		return products, err
	}
	
	return products, nil
}

func (s *ProductService) Create(product *models.Product) error {
	// Start a transaction
	tx := s.db.Begin()
	
	// Create the product
	if err := tx.Create(product).Error; err != nil {
		tx.Rollback()
		return err
	}
	
	// Load the product template to get field definitions
	var productTemplate models.ProductTemplate
	if err := tx.First(&productTemplate, product.ProductTemplateID).Error; err == nil && len(productTemplate.Fields) > 0 {
		// Map field values to filter columns based on field IDs
		if customFields, ok := product.CustomFields["fields"].(map[string]interface{}); ok {
			for _, field := range productTemplate.Fields {
				if value, exists := customFields[field.Name]; exists {
					// Map to appropriate filter column based on field ID
					s.mapProductToFilterColumn(tx, product, field.ID, value)
				}
			}
		}
		
		// Create variables for each field using the transaction
		txVariableService := &VariableService{db: tx}
		for _, field := range productTemplate.Fields {
			variable := &models.Variable{
				Name:        field.ID,
				DisplayName: field.Name,
				ValueType:   field.Type,
				Type:        "seller_input",
				SourceType:  "product",
				SourceID:    &product.ID,
				Description: field.Description,
				Constraints: models.JSONB{
					"required":   field.Required,
					"min":        field.Constraints.Min,
					"max":        field.Constraints.Max,
					"min_length": field.Constraints.MinLength,
					"max_length": field.Constraints.MaxLength,
					"pattern":    field.Constraints.Pattern,
					"options":    field.Constraints.Options,
				},
				IsActive:    true,
			}
			txVariableService.Create(variable)
		}
	}
	
	tx.Commit()
	return nil
}

// mapProductToFilterColumn maps a value to the appropriate filter column for products
func (s *ProductService) mapProductToFilterColumn(tx *gorm.DB, product *models.Product, fieldID string, value interface{}) {
	// Parse the field ID to get type and index
	parts := strings.Split(fieldID, "_")
	if len(parts) != 3 || parts[0] != "filter" {
		return
	}
	
	fieldType := parts[1]
	index := parts[2]
	
	updates := map[string]interface{}{}
	
	switch fieldType {
	case "numeric":
		if v, ok := value.(float64); ok {
			updates["filter_numeric_"+index] = v
		}
	case "text":
		if v, ok := value.(string); ok {
			updates["filter_text_"+index] = v
		}
	case "boolean":
		if v, ok := value.(bool); ok {
			updates["filter_boolean_"+index] = v
		}
	case "enum":
		if v, ok := value.(string); ok {
			updates["filter_enum_"+index] = v
		}
	case "location":
		if v, ok := value.(string); ok {
			updates["filter_location_"+index] = v
		}
	}
	
	if len(updates) > 0 {
		tx.Model(&models.Product{}).Where("id = ?", product.ID).Updates(updates)
	}
}

func (s *ProductService) Update(id uint, product *models.Product) error {
	return s.db.Model(&models.Product{}).Where("id = ?", id).Updates(product).Error
}

func (s *ProductService) Delete(id uint) error {
	return s.db.Delete(&models.Product{}, id).Error
}

// PricingService handles pricing calculations
type PricingService struct {
	db              *gorm.DB
	variableService *VariableService
}

func NewPricingService(db *gorm.DB, variableService *VariableService) *PricingService {
	return &PricingService{
		db:              db,
		variableService: variableService,
	}
}

func (s *PricingService) CalculatePrice(productID uint, variables map[string]interface{}) (float64, error) {
	// For now, return a simple calculation
	// TODO: Implement formula engine integration
	var product models.Product
	if err := s.db.First(&product, productID).Error; err != nil {
		return 0, err
	}
	
	// Simple calculation for now
	basePrice := product.BasePrice
	if quantity, ok := variables["quantity"].(float64); ok {
		return basePrice * quantity, nil
	}
	
	return basePrice, nil
}