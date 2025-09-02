package api

import (
	"net/http"
	"github.com/suppers-ai/solobase/extensions/official/products"
	"gorm.io/gorm"
)

// ProductsExtensionHandlers wraps the products extension for the API router
type ProductsExtensionHandlers struct {
	ext *products.ProductsExtension
}

// NewProductsExtensionHandlers creates a new wrapper for products extension handlers
func NewProductsExtensionHandlers() *ProductsExtensionHandlers {
	ext := products.NewProductsExtensionWithDB(nil)
	return &ProductsExtensionHandlers{ext: ext}
}

// NewProductsExtensionHandlersWithDB creates handlers with database
func NewProductsExtensionHandlersWithDB(db *gorm.DB) *ProductsExtensionHandlers {
	ext := products.NewProductsExtensionWithDB(db)
	ext.SetDatabase(db)
	return &ProductsExtensionHandlers{ext: ext}
}

// SetExtension sets the extension instance (called after initialization)
func (h *ProductsExtensionHandlers) SetExtension(ext *products.ProductsExtension) {
	h.ext = ext
}

// Admin API handlers - Variables
func (h *ProductsExtensionHandlers) HandleListVariables() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().ListVariables(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleCreateVariable() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().CreateVariable(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleUpdateVariable() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().UpdateVariable(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleDeleteVariable() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().DeleteVariable(w, r)
	}
}

// Admin API handlers - Entity Types
func (h *ProductsExtensionHandlers) HandleListEntityTypes() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().ListEntityTypes(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleCreateEntityType() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().CreateEntityType(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleUpdateEntityType() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().UpdateEntityType(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleDeleteEntityType() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().DeleteEntityType(w, r)
	}
}

// User API handlers - Entities (user's actual entities)
func (h *ProductsExtensionHandlers) HandleListEntities() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().ListMyEntities(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleCreateEntity() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().CreateEntity(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleUpdateEntity() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().UpdateEntity(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleDeleteEntity() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().DeleteEntity(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleGetEntity() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().GetEntity(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleEntityProducts() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().ListEntityProducts(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleCalculatePrice() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().CalculatePrice(w, r)
	}
}

// Admin API handlers - Product Types
func (h *ProductsExtensionHandlers) HandleListProductTypes() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().ListProductTypes(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleCreateProductType() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().CreateProductType(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleUpdateProductType() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().UpdateProductType(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleDeleteProductType() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().DeleteProductType(w, r)
	}
}

// Admin API handlers - Pricing Templates
func (h *ProductsExtensionHandlers) HandleListPricingTemplates() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().ListPricingTemplates(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleCreatePricingTemplate() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetAdminAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetAdminAPI().CreatePricingTemplate(w, r)
	}
}

// Simple handlers for basic product CRUD (temporary compatibility)
func (h *ProductsExtensionHandlers) HandleProductsList() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		// List all products across all user's entities
		h.ext.GetUserAPI().ListMyProducts(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleProductsCreate() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().CreateProduct(w, r)
	}
}

func (h *ProductsExtensionHandlers) HandleProductsStats() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.ext == nil || h.ext.GetUserAPI() == nil {
			http.Error(w, "Extension not initialized", http.StatusServiceUnavailable)
			return
		}
		h.ext.GetUserAPI().GetProductStats(w, r)
	}
}