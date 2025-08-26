package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"dynamicproducts/middleware"
	"dynamicproducts/models"
	"dynamicproducts/templates"

	"github.com/gorilla/mux"
)

// AdminDashboard shows the admin dashboard
func AdminDashboard(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil || !user.IsAdmin() {
		http.Error(w, "Access forbidden", http.StatusForbidden)
		return
	}

	data := templates.AdminPageData{
		Title: "Admin Dashboard - Dynamic Products",
		User:  user,
	}

	if err := templates.AdminPage(data).Render(r.Context(), w); err != nil {
		http.Error(w, "Failed to render admin page", http.StatusInternalServerError)
		return
	}
}

// Entity Types Management

// EntityTypesHandler lists all entity types
func EntityTypesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		listEntityTypes(w, r)
	case http.MethodPost:
		createEntityType(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func listEntityTypes(w http.ResponseWriter, r *http.Request) {
	entityTypes, err := models.GetAllEntityTypes()
	if err != nil {
		http.Error(w, "Failed to get entity types", http.StatusInternalServerError)
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, map[string]interface{}{
			"success":      true,
			"entity_types": entityTypes,
		}, http.StatusOK)
		return
	}

	// Render HTML page for entity types
	renderEntityTypesPage(w, r, entityTypes, "")
}

func createEntityType(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name             string          `json:"name"`
		Description      string          `json:"description"`
		MetadataSchema   json.RawMessage `json:"metadata_schema"`
		FilterConfig     json.RawMessage `json:"filter_config"`
		LocationRequired bool            `json:"location_required"`
	}

	if isJSONRequest(r) {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": "Invalid request body",
			}, http.StatusBadRequest)
			return
		}
	} else {
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}
		req.Name = r.Form.Get("name")
		req.Description = r.Form.Get("description")
		req.LocationRequired = r.Form.Get("location_required") == "true"
		
		// Parse JSON fields if provided
		if metadataStr := r.Form.Get("metadata_schema"); metadataStr != "" {
			req.MetadataSchema = json.RawMessage(metadataStr)
		}
		if filterStr := r.Form.Get("filter_config"); filterStr != "" {
			req.FilterConfig = json.RawMessage(filterStr)
		}
	}

	if req.Name == "" {
		if isJSONRequest(r) {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": "Name is required",
			}, http.StatusBadRequest)
			return
		}
		renderEntityTypesPage(w, r, nil, "Name is required")
		return
	}

	entityType := &models.EntityType{
		Name:             req.Name,
		Description:      req.Description,
		MetadataSchema:   req.MetadataSchema,
		FilterConfig:     req.FilterConfig,
		LocationRequired: req.LocationRequired,
		IsActive:         true,
	}

	if err := entityType.Create(); err != nil {
		if isJSONRequest(r) {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": "Failed to create entity type",
			}, http.StatusInternalServerError)
			return
		}
		renderEntityTypesPage(w, r, nil, "Failed to create entity type")
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, map[string]interface{}{
			"success":     true,
			"message":     "Entity type created successfully",
			"entity_type": entityType,
		}, http.StatusCreated)
		return
	}

	http.Redirect(w, r, "/admin/entity-types?success=Entity type created successfully", http.StatusSeeOther)
}

// EntityTypeHandler handles individual entity type operations
func EntityTypeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	switch r.Method {
	case http.MethodGet:
		getEntityType(w, r, id)
	case http.MethodPut:
		updateEntityType(w, r, id)
	case http.MethodDelete:
		deleteEntityType(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getEntityType(w http.ResponseWriter, r *http.Request, id string) {
	entityType, err := models.GetEntityTypeByID(id)
	if err != nil {
		http.Error(w, "Failed to get entity type", http.StatusInternalServerError)
		return
	}

	if entityType == nil {
		http.Error(w, "Entity type not found", http.StatusNotFound)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success":     true,
		"entity_type": entityType,
	}, http.StatusOK)
}

func updateEntityType(w http.ResponseWriter, r *http.Request, id string) {
	entityType, err := models.GetEntityTypeByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get entity type",
		}, http.StatusInternalServerError)
		return
	}

	if entityType == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Entity type not found",
		}, http.StatusNotFound)
		return
	}

	var req struct {
		Name             string          `json:"name"`
		Description      string          `json:"description"`
		MetadataSchema   json.RawMessage `json:"metadata_schema"`
		FilterConfig     json.RawMessage `json:"filter_config"`
		LocationRequired bool            `json:"location_required"`
		IsActive         bool            `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Invalid request body",
		}, http.StatusBadRequest)
		return
	}

	// Update fields
	entityType.Name = req.Name
	entityType.Description = req.Description
	entityType.MetadataSchema = req.MetadataSchema
	entityType.FilterConfig = req.FilterConfig
	entityType.LocationRequired = req.LocationRequired
	entityType.IsActive = req.IsActive

	if err := entityType.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to update entity type",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success":     true,
		"message":     "Entity type updated successfully",
		"entity_type": entityType,
	}, http.StatusOK)
}

func deleteEntityType(w http.ResponseWriter, r *http.Request, id string) {
	entityType, err := models.GetEntityTypeByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get entity type",
		}, http.StatusInternalServerError)
		return
	}

	if entityType == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Entity type not found",
		}, http.StatusNotFound)
		return
	}

	entityType.IsActive = false
	if err := entityType.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to delete entity type",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"message": "Entity type deleted successfully",
	}, http.StatusOK)
}

// Product Types Management

// ProductTypesHandler lists all product types
func ProductTypesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		listProductTypes(w, r)
	case http.MethodPost:
		createProductType(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func listProductTypes(w http.ResponseWriter, r *http.Request) {
	productTypes, err := models.GetAllProductTypes()
	if err != nil {
		http.Error(w, "Failed to get product types", http.StatusInternalServerError)
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, map[string]interface{}{
			"success":      true,
			"product_types": productTypes,
		}, http.StatusOK)
		return
	}

	// Render HTML page for product types
	renderProductTypesPage(w, r, productTypes, "")
}

func createProductType(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name           string          `json:"name"`
		Description    string          `json:"description"`
		MetadataSchema json.RawMessage `json:"metadata_schema"`
		FilterConfig   json.RawMessage `json:"filter_config"`
	}

	if isJSONRequest(r) {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": "Invalid request body",
			}, http.StatusBadRequest)
			return
		}
	} else {
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}
		req.Name = r.Form.Get("name")
		req.Description = r.Form.Get("description")
		
		// Parse JSON fields if provided
		if metadataStr := r.Form.Get("metadata_schema"); metadataStr != "" {
			req.MetadataSchema = json.RawMessage(metadataStr)
		}
		if filterStr := r.Form.Get("filter_config"); filterStr != "" {
			req.FilterConfig = json.RawMessage(filterStr)
		}
	}

	if req.Name == "" {
		if isJSONRequest(r) {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": "Name is required",
			}, http.StatusBadRequest)
			return
		}
		renderProductTypesPage(w, r, nil, "Name is required")
		return
	}

	productType := &models.ProductType{
		Name:           req.Name,
		Description:    req.Description,
		MetadataSchema: req.MetadataSchema,
		FilterConfig:   req.FilterConfig,
		IsActive:       true,
	}

	if err := productType.Create(); err != nil {
		if isJSONRequest(r) {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": "Failed to create product type",
			}, http.StatusInternalServerError)
			return
		}
		renderProductTypesPage(w, r, nil, "Failed to create product type")
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, map[string]interface{}{
			"success":      true,
			"message":      "Product type created successfully",
			"product_type": productType,
		}, http.StatusCreated)
		return
	}

	http.Redirect(w, r, "/admin/product-types?success=Product type created successfully", http.StatusSeeOther)
}

// ProductTypeHandler handles individual product type operations
func ProductTypeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	switch r.Method {
	case http.MethodGet:
		getProductType(w, r, id)
	case http.MethodPut:
		updateProductType(w, r, id)
	case http.MethodDelete:
		deleteProductType(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getProductType(w http.ResponseWriter, r *http.Request, id string) {
	productType, err := models.GetProductTypeByID(id)
	if err != nil {
		http.Error(w, "Failed to get product type", http.StatusInternalServerError)
		return
	}

	if productType == nil {
		http.Error(w, "Product type not found", http.StatusNotFound)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success":      true,
		"product_type": productType,
	}, http.StatusOK)
}

func updateProductType(w http.ResponseWriter, r *http.Request, id string) {
	productType, err := models.GetProductTypeByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get product type",
		}, http.StatusInternalServerError)
		return
	}

	if productType == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Product type not found",
		}, http.StatusNotFound)
		return
	}

	var req struct {
		Name           string          `json:"name"`
		Description    string          `json:"description"`
		MetadataSchema json.RawMessage `json:"metadata_schema"`
		FilterConfig   json.RawMessage `json:"filter_config"`
		IsActive       bool            `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Invalid request body",
		}, http.StatusBadRequest)
		return
	}

	// Update fields
	productType.Name = req.Name
	productType.Description = req.Description
	productType.MetadataSchema = req.MetadataSchema
	productType.FilterConfig = req.FilterConfig
	productType.IsActive = req.IsActive

	if err := productType.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to update product type",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success":      true,
		"message":      "Product type updated successfully",
		"product_type": productType,
	}, http.StatusOK)
}

func deleteProductType(w http.ResponseWriter, r *http.Request, id string) {
	productType, err := models.GetProductTypeByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get product type",
		}, http.StatusInternalServerError)
		return
	}

	if productType == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Product type not found",
		}, http.StatusNotFound)
		return
	}

	productType.IsActive = false
	if err := productType.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to delete product type",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"message": "Product type deleted successfully",
	}, http.StatusOK)
}

// Users Management

// UsersHandler lists all users (admin only)
func UsersHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		listUsers(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func listUsers(w http.ResponseWriter, r *http.Request) {
	users, err := models.GetAllUsers()
	if err != nil {
		http.Error(w, "Failed to get users", http.StatusInternalServerError)
		return
	}

	if isJSONRequest(r) {
		// Clean password hashes before sending
		for i := range users {
			users[i].PasswordHash = ""
		}

		respondJSON(w, map[string]interface{}{
			"success": true,
			"users":   users,
		}, http.StatusOK)
		return
	}

	// Render HTML page for users
	renderUsersPage(w, r, users, "")
}

// UserHandler handles individual user operations
func UserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	switch r.Method {
	case http.MethodGet:
		getUser(w, r, id)
	case http.MethodPut:
		updateUser(w, r, id)
	case http.MethodDelete:
		deleteUser(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getUser(w http.ResponseWriter, r *http.Request, id string) {
	user, err := models.GetUserByID(id)
	if err != nil {
		http.Error(w, "Failed to get user", http.StatusInternalServerError)
		return
	}

	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Clean password hash
	user.PasswordHash = ""

	respondJSON(w, map[string]interface{}{
		"success": true,
		"user":    user,
	}, http.StatusOK)
}

func updateUser(w http.ResponseWriter, r *http.Request, id string) {
	user, err := models.GetUserByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get user",
		}, http.StatusInternalServerError)
		return
	}

	if user == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "User not found",
		}, http.StatusNotFound)
		return
	}

	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Role     string `json:"role"`
		IsActive bool   `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Invalid request body",
		}, http.StatusBadRequest)
		return
	}

	// Update fields
	user.Name = req.Name
	user.Email = req.Email
	user.Role = req.Role
	user.IsActive = req.IsActive

	if err := user.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to update user",
		}, http.StatusInternalServerError)
		return
	}

	// Clean password hash
	user.PasswordHash = ""

	respondJSON(w, map[string]interface{}{
		"success": true,
		"message": "User updated successfully",
		"user":    user,
	}, http.StatusOK)
}

func deleteUser(w http.ResponseWriter, r *http.Request, id string) {
	user, err := models.GetUserByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get user",
		}, http.StatusInternalServerError)
		return
	}

	if user == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "User not found",
		}, http.StatusNotFound)
		return
	}

	if err := user.Delete(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to delete user",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"message": "User deleted successfully",
	}, http.StatusOK)
}

// Purchases Management

// PurchasesHandler lists all purchases (admin only)
func PurchasesHandler(w http.ResponseWriter, r *http.Request) {
	limit := 50
	offset := 0

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil {
			offset = o
		}
	}

	purchases, err := models.GetAllPurchases(limit, offset)
	if err != nil {
		http.Error(w, "Failed to get purchases", http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success":   true,
		"purchases": purchases,
		"limit":     limit,
		"offset":    offset,
	}, http.StatusOK)
}

// Helper functions for rendering HTML pages

func renderEntityTypesPage(w http.ResponseWriter, r *http.Request, entityTypes []models.EntityType, errorMsg string) {
	// Simple HTML rendering - in a real app, use proper templates
	html := `<h1>Entity Types</h1><p>Admin interface for entity types would go here</p>`
	if errorMsg != "" {
		html = `<div class="error">` + errorMsg + `</div>` + html
	}
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}

func renderProductTypesPage(w http.ResponseWriter, r *http.Request, productTypes []models.ProductType, errorMsg string) {
	// Simple HTML rendering - in a real app, use proper templates
	html := `<h1>Product Types</h1><p>Admin interface for product types would go here</p>`
	if errorMsg != "" {
		html = `<div class="error">` + errorMsg + `</div>` + html
	}
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}

func renderUsersPage(w http.ResponseWriter, r *http.Request, users []models.User, errorMsg string) {
	// Simple HTML rendering - in a real app, use proper templates
	html := `<h1>Users</h1><p>Admin interface for users would go here</p>`
	if errorMsg != "" {
		html = `<div class="error">` + errorMsg + `</div>` + html
	}
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}