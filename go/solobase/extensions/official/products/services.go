package products

import (
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

func (s *VariableService) Create(variable *models.Variable) error {
	return s.db.Create(variable).Error
}

func (s *VariableService) Update(id uint, variable *models.Variable) error {
	return s.db.Model(&models.Variable{}).Where("id = ?", id).Updates(variable).Error
}

func (s *VariableService) Delete(id uint) error {
	return s.db.Delete(&models.Variable{}, id).Error
}

// EntityService handles entity operations
type EntityService struct {
	db *gorm.DB
}

func NewEntityService(db *gorm.DB) *EntityService {
	return &EntityService{db: db}
}

func (s *EntityService) ListByUser(userID uint) ([]models.Entity, error) {
	var entities []models.Entity
	err := s.db.Preload("EntityType").Where("user_id = ?", userID).Find(&entities).Error
	return entities, err
}

func (s *EntityService) Create(entity *models.Entity) error {
	return s.db.Create(entity).Error
}

func (s *EntityService) Update(id uint, userID uint, entity *models.Entity) error {
	return s.db.Model(&models.Entity{}).Where("id = ? AND user_id = ?", id, userID).Updates(entity).Error
}

func (s *EntityService) Delete(id uint, userID uint) error {
	return s.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Entity{}).Error
}

func (s *EntityService) GetByID(id uint, userID uint) (*models.Entity, error) {
	var entity models.Entity
	err := s.db.Preload("EntityType").Where("id = ? AND user_id = ?", id, userID).First(&entity).Error
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
	err := s.db.Preload("ProductType").Where("entity_id = ?", entityID).Find(&products).Error
	return products, err
}

func (s *ProductService) ListByUser(userID uint) ([]models.Product, error) {
	var products []models.Product
	err := s.db.Preload("Entity").Preload("ProductType").
		Joins("JOIN entities ON products.entity_id = entities.id").
		Where("entities.user_id = ?", userID).
		Find(&products).Error
	return products, err
}

func (s *ProductService) Create(product *models.Product) error {
	return s.db.Create(product).Error
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