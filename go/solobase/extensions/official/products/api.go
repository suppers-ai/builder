package products

import (
	"encoding/json"
	"net/http"
	"strconv"
	
	"github.com/gorilla/mux"
	"github.com/suppers-ai/solobase/extensions/official/products/models"
	"gorm.io/gorm"
)

// AdminAPI handles admin operations
type AdminAPI struct {
	db              *gorm.DB
	variableService *VariableService
	entityService   *EntityService
	productService  *ProductService
	pricingService  *PricingService
}

func NewAdminAPI(db *gorm.DB, vs *VariableService, es *EntityService, ps *ProductService, prs *PricingService) *AdminAPI {
	return &AdminAPI{
		db:              db,
		variableService: vs,
		entityService:   es,
		productService:  ps,
		pricingService:  prs,
	}
}

// Variable management
func (a *AdminAPI) ListVariables(w http.ResponseWriter, r *http.Request) {
	variables, err := a.variableService.List()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(variables)
}

func (a *AdminAPI) CreateVariable(w http.ResponseWriter, r *http.Request) {
	var variable models.Variable
	if err := json.NewDecoder(r.Body).Decode(&variable); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if err := a.variableService.Create(&variable); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(variable)
}

func (a *AdminAPI) UpdateVariable(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	var variable models.Variable
	if err := json.NewDecoder(r.Body).Decode(&variable); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if err := a.variableService.Update(uint(id), &variable); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(variable)
}

func (a *AdminAPI) DeleteVariable(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	if err := a.variableService.Delete(uint(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// Entity Template management
func (a *AdminAPI) ListEntityTypes(w http.ResponseWriter, r *http.Request) {
	var entityTemplates []models.EntityTemplate
	if err := a.db.Find(&entityTemplates).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entityTemplates)
}

func (a *AdminAPI) CreateEntityType(w http.ResponseWriter, r *http.Request) {
	var entityTemplate models.EntityTemplate
	if err := json.NewDecoder(r.Body).Decode(&entityTemplate); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if err := a.db.Create(&entityTemplate).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entityTemplate)
}

func (a *AdminAPI) UpdateEntityType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	var entityTemplate models.EntityTemplate
	if err := json.NewDecoder(r.Body).Decode(&entityTemplate); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if err := a.db.Model(&models.EntityTemplate{}).Where("id = ?", id).Updates(&entityTemplate).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entityTemplate)
}

func (a *AdminAPI) DeleteEntityType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	if err := a.db.Delete(&models.EntityTemplate{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// Product Template management
func (a *AdminAPI) ListProductTypes(w http.ResponseWriter, r *http.Request) {
	var productTemplates []models.ProductTemplate
	if err := a.db.Find(&productTemplates).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(productTemplates)
}

func (a *AdminAPI) CreateProductType(w http.ResponseWriter, r *http.Request) {
	var productTemplate models.ProductTemplate
	if err := json.NewDecoder(r.Body).Decode(&productTemplate); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if err := a.db.Create(&productTemplate).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(productTemplate)
}

func (a *AdminAPI) UpdateProductType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	var productTemplate models.ProductTemplate
	if err := json.NewDecoder(r.Body).Decode(&productTemplate); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if err := a.db.Model(&models.ProductTemplate{}).Where("id = ?", id).Updates(&productTemplate).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(productTemplate)
}

func (a *AdminAPI) DeleteProductType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	if err := a.db.Delete(&models.ProductTemplate{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// Pricing Template management
func (a *AdminAPI) ListPricingTemplates(w http.ResponseWriter, r *http.Request) {
	var templates []models.PricingTemplate
	if err := a.db.Find(&templates).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(templates)
}

func (a *AdminAPI) CreatePricingTemplate(w http.ResponseWriter, r *http.Request) {
	var template models.PricingTemplate
	if err := json.NewDecoder(r.Body).Decode(&template); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if err := a.db.Create(&template).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(template)
}

func (a *AdminAPI) UpdatePricingTemplate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	templateID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	var template models.PricingTemplate
	if err := json.NewDecoder(r.Body).Decode(&template); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Ensure the ID matches
	template.ID = uint(templateID)
	
	if err := a.db.Save(&template).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(template)
}

func (a *AdminAPI) DeletePricingTemplate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	templateID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	if err := a.db.Delete(&models.PricingTemplate{}, uint(templateID)).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// UserAPI handles user operations
type UserAPI struct {
	db             *gorm.DB
	entityService  *EntityService
	productService *ProductService
	pricingService *PricingService
}

func NewUserAPI(db *gorm.DB, es *EntityService, ps *ProductService, prs *PricingService) *UserAPI {
	return &UserAPI{
		db:             db,
		entityService:  es,
		productService: ps,
		pricingService: prs,
	}
}

// Entity management for users
func (u *UserAPI) ListMyEntities(w http.ResponseWriter, r *http.Request) {
	// TODO: Get user ID from context/session
	userID := uint(1) // Placeholder
	
	entities, err := u.entityService.ListByUser(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entities)
}

func (u *UserAPI) CreateEntity(w http.ResponseWriter, r *http.Request) {
	userID := uint(1) // TODO: Get from context
	
	var entity models.Entity
	if err := json.NewDecoder(r.Body).Decode(&entity); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	entity.UserID = userID
	if err := u.entityService.Create(&entity); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(entity)
}

func (u *UserAPI) UpdateEntity(w http.ResponseWriter, r *http.Request) {
	userID := uint(1) // TODO: Get from context
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	var entity models.Entity
	if err := json.NewDecoder(r.Body).Decode(&entity); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	if err := u.entityService.Update(uint(id), userID, &entity); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entity)
}

func (u *UserAPI) DeleteEntity(w http.ResponseWriter, r *http.Request) {
	userID := uint(1) // TODO: Get from context
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	if err := u.entityService.Delete(uint(id), userID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

func (u *UserAPI) GetEntity(w http.ResponseWriter, r *http.Request) {
	userID := uint(1) // TODO: Get from context
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	entity, err := u.entityService.GetByID(uint(id), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entity)
}

// Product management
func (u *UserAPI) ListEntityProducts(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	entityID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	
	products, err := u.productService.ListByEntity(uint(entityID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func (u *UserAPI) ListMyProducts(w http.ResponseWriter, r *http.Request) {
	userID := uint(1) // TODO: Get from context
	
	products, err := u.productService.ListByUser(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func (u *UserAPI) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var product models.Product
	if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// TODO: Verify user owns the entity
	
	if err := u.productService.Create(&product); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

func (u *UserAPI) CalculatePrice(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ProductID uint                   `json:"product_id"`
		Variables map[string]interface{} `json:"variables"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	price, err := u.pricingService.CalculatePrice(req.ProductID, req.Variables)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"price":     price,
		"currency":  "USD",
		"breakdown": []interface{}{}, // TODO: Add breakdown details
	})
}

func (u *UserAPI) GetProductStats(w http.ResponseWriter, r *http.Request) {
	userID := uint(1) // TODO: Get from context
	
	// Get counts
	var entityCount int64
	u.db.Model(&models.Entity{}).Where("user_id = ?", userID).Count(&entityCount)
	
	var productCount int64
	u.db.Model(&models.Product{}).
		Joins("JOIN entities ON products.entity_id = entities.id").
		Where("entities.user_id = ?", userID).
		Count(&productCount)
	
	stats := map[string]interface{}{
		"totalProducts":  productCount,
		"totalEntities":  entityCount,
		"activeProducts": productCount, // TODO: Filter by active
		"totalRevenue":   0,
		"avgPrice":       0,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// PublicAPI handles public operations
type PublicAPI struct {
	db             *gorm.DB
	productService *ProductService
}

func NewPublicAPI(db *gorm.DB, ps *ProductService) *PublicAPI {
	return &PublicAPI{
		db:             db,
		productService: ps,
	}
}

// Public product listing, search, etc can be added here