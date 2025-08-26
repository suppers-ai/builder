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

// SellerDashboard shows the seller dashboard
func SellerDashboard(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	// Get seller stats
	stats, err := models.GetSalesStats(user.ID)
	if err != nil {
		http.Error(w, "Failed to get sales statistics", http.StatusInternalServerError)
		return
	}

	data := templates.DashboardData{
		Title: "Seller Dashboard - Dynamic Products",
		User:  user,
		Stats: stats,
	}

	if err := templates.Dashboard(data).Render(r.Context(), w); err != nil {
		http.Error(w, "Failed to render dashboard", http.StatusInternalServerError)
		return
	}
}

// Entities Management

// EntitiesHandler lists entities for the current seller
func EntitiesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		listSellerEntities(w, r)
	case http.MethodPost:
		createEntity(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func listSellerEntities(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	limit := 20
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

	entities, err := models.GetEntitiesByOwner(user.ID, limit, offset)
	if err != nil {
		http.Error(w, "Failed to get entities", http.StatusInternalServerError)
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, map[string]interface{}{
			"success":  true,
			"entities": entities,
			"limit":    limit,
			"offset":   offset,
		}, http.StatusOK)
		return
	}

	// Render HTML page for entities
	renderEntitiesPage(w, r, entities, "")
}

func createEntity(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	var req struct {
		Name            string          `json:"name"`
		Description     string          `json:"description"`
		Type            string          `json:"type"`
		SubType         string          `json:"sub_type"`
		Photos          json.RawMessage `json:"photos"`
		Metadata        json.RawMessage `json:"metadata"`
		Location        *string         `json:"location"`
		FilterNumeric1  *float64        `json:"filter_numeric_1"`
		FilterNumeric2  *float64        `json:"filter_numeric_2"`
		FilterText1     *string         `json:"filter_text_1"`
		FilterText2     *string         `json:"filter_text_2"`
		FilterBoolean1  *bool           `json:"filter_boolean_1"`
		FilterDate1     *string         `json:"filter_date_1"` // Will be parsed to time.Time
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
		req.Type = r.Form.Get("type")
		req.SubType = r.Form.Get("sub_type")
		
		// Parse numeric fields
		if val := r.Form.Get("filter_numeric_1"); val != "" {
			if f, err := strconv.ParseFloat(val, 64); err == nil {
				req.FilterNumeric1 = &f
			}
		}
		if val := r.Form.Get("filter_numeric_2"); val != "" {
			if f, err := strconv.ParseFloat(val, 64); err == nil {
				req.FilterNumeric2 = &f
			}
		}
		
		// Parse text fields
		if val := r.Form.Get("filter_text_1"); val != "" {
			req.FilterText1 = &val
		}
		if val := r.Form.Get("filter_text_2"); val != "" {
			req.FilterText2 = &val
		}
		
		// Parse boolean fields
		if val := r.Form.Get("filter_boolean_1"); val != "" {
			b := val == "true" || val == "1"
			req.FilterBoolean1 = &b
		}
	}

	if req.Name == "" {
		message := "Name is required"
		if isJSONRequest(r) {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": message,
			}, http.StatusBadRequest)
			return
		}
		renderEntitiesPage(w, r, nil, message)
		return
	}

	// Set default type if not provided
	if req.Type == "" {
		req.Type = "general"
	}

	entity := &models.Entity{
		OwnerID:        user.ID,
		Name:           req.Name,
		Description:    req.Description,
		Type:           req.Type,
		SubType:        req.SubType,
		Photos:         req.Photos,
		Metadata:       req.Metadata,
		Location:       req.Location,
		FilterNumeric1: req.FilterNumeric1,
		FilterNumeric2: req.FilterNumeric2,
		FilterText1:    req.FilterText1,
		FilterText2:    req.FilterText2,
		FilterBoolean1: req.FilterBoolean1,
		Status:         "active",
		Verified:       true,
		VersionID:      1,
	}

	if err := entity.Create(); err != nil {
		message := "Failed to create entity"
		if isJSONRequest(r) {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": message,
			}, http.StatusInternalServerError)
			return
		}
		renderEntitiesPage(w, r, nil, message)
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, map[string]interface{}{
			"success": true,
			"message": "Entity created successfully",
			"entity":  entity,
		}, http.StatusCreated)
		return
	}

	http.Redirect(w, r, "/seller/entities?success=Entity created successfully", http.StatusSeeOther)
}

// EntityHandler handles individual entity operations
func EntityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	switch r.Method {
	case http.MethodGet:
		getEntity(w, r, id)
	case http.MethodPut:
		updateEntity(w, r, id)
	case http.MethodDelete:
		deleteEntity(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getEntity(w http.ResponseWriter, r *http.Request, id string) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	entity, err := models.GetEntityByID(id)
	if err != nil {
		http.Error(w, "Failed to get entity", http.StatusInternalServerError)
		return
	}

	if entity == nil {
		http.Error(w, "Entity not found", http.StatusNotFound)
		return
	}

	// Check ownership (unless admin)
	if !user.IsAdmin() && entity.OwnerID != user.ID {
		http.Error(w, "Access forbidden", http.StatusForbidden)
		return
	}

	// Track view (if not owner)
	if entity.OwnerID != user.ID {
		entity.IncrementViews()
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"entity":  entity,
	}, http.StatusOK)
}

func updateEntity(w http.ResponseWriter, r *http.Request, id string) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Authentication required",
		}, http.StatusUnauthorized)
		return
	}

	entity, err := models.GetEntityByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get entity",
		}, http.StatusInternalServerError)
		return
	}

	if entity == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Entity not found",
		}, http.StatusNotFound)
		return
	}

	// Check ownership (unless admin)
	if !user.IsAdmin() && entity.OwnerID != user.ID {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Access forbidden",
		}, http.StatusForbidden)
		return
	}

	var req struct {
		Name            string          `json:"name"`
		Description     string          `json:"description"`
		Type            string          `json:"type"`
		SubType         string          `json:"sub_type"`
		Photos          json.RawMessage `json:"photos"`
		Metadata        json.RawMessage `json:"metadata"`
		Location        *string         `json:"location"`
		FilterNumeric1  *float64        `json:"filter_numeric_1"`
		FilterNumeric2  *float64        `json:"filter_numeric_2"`
		FilterText1     *string         `json:"filter_text_1"`
		FilterText2     *string         `json:"filter_text_2"`
		FilterBoolean1  *bool           `json:"filter_boolean_1"`
		Status          string          `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Invalid request body",
		}, http.StatusBadRequest)
		return
	}

	// Update fields
	if req.Name != "" {
		entity.Name = req.Name
	}
	entity.Description = req.Description
	entity.Type = req.Type
	entity.SubType = req.SubType
	entity.Photos = req.Photos
	entity.Metadata = req.Metadata
	entity.Location = req.Location
	entity.FilterNumeric1 = req.FilterNumeric1
	entity.FilterNumeric2 = req.FilterNumeric2
	entity.FilterText1 = req.FilterText1
	entity.FilterText2 = req.FilterText2
	entity.FilterBoolean1 = req.FilterBoolean1
	
	if req.Status != "" {
		entity.Status = req.Status
	}

	if err := entity.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to update entity",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"message": "Entity updated successfully",
		"entity":  entity,
	}, http.StatusOK)
}

func deleteEntity(w http.ResponseWriter, r *http.Request, id string) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Authentication required",
		}, http.StatusUnauthorized)
		return
	}

	entity, err := models.GetEntityByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get entity",
		}, http.StatusInternalServerError)
		return
	}

	if entity == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Entity not found",
		}, http.StatusNotFound)
		return
	}

	// Check ownership (unless admin)
	if !user.IsAdmin() && entity.OwnerID != user.ID {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Access forbidden",
		}, http.StatusForbidden)
		return
	}

	// Soft delete by setting status to deleted
	entity.Status = "deleted"
	if err := entity.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to delete entity",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"message": "Entity deleted successfully",
	}, http.StatusOK)
}

// Products Management

// ProductsHandler lists products for the current seller
func ProductsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		listSellerProducts(w, r)
	case http.MethodPost:
		createProduct(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func listSellerProducts(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	limit := 20
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

	products, err := models.GetProductsBySeller(user.ID, limit, offset)
	if err != nil {
		http.Error(w, "Failed to get products", http.StatusInternalServerError)
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, map[string]interface{}{
			"success":  true,
			"products": products,
			"limit":    limit,
			"offset":   offset,
		}, http.StatusOK)
		return
	}

	// Render HTML page for products
	renderProductsPage(w, r, products, "")
}

func createProduct(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	var req struct {
		EntityID       *string         `json:"entity_id"`
		Name           string          `json:"name"`
		Description    string          `json:"description"`
		Price          *float64        `json:"price"`
		Currency       string          `json:"currency"`
		ThumbnailURL   *string         `json:"thumbnail_url"`
		Photos         json.RawMessage `json:"photos"`
		Type           string          `json:"type"`
		SubType        string          `json:"sub_type"`
		Metadata       json.RawMessage `json:"metadata"`
		FilterNumeric1 *float64        `json:"filter_numeric_1"`
		FilterNumeric2 *float64        `json:"filter_numeric_2"`
		FilterText1    *string         `json:"filter_text_1"`
		FilterText2    *string         `json:"filter_text_2"`
		FilterBoolean1 *bool           `json:"filter_boolean_1"`
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
		req.Type = r.Form.Get("type")
		req.SubType = r.Form.Get("sub_type")
		req.Currency = r.Form.Get("currency")
		
		if val := r.Form.Get("entity_id"); val != "" {
			req.EntityID = &val
		}
		if val := r.Form.Get("thumbnail_url"); val != "" {
			req.ThumbnailURL = &val
		}
		
		// Parse price
		if val := r.Form.Get("price"); val != "" {
			if f, err := strconv.ParseFloat(val, 64); err == nil {
				req.Price = &f
			}
		}
		
		// Parse filter fields
		if val := r.Form.Get("filter_numeric_1"); val != "" {
			if f, err := strconv.ParseFloat(val, 64); err == nil {
				req.FilterNumeric1 = &f
			}
		}
		if val := r.Form.Get("filter_text_1"); val != "" {
			req.FilterText1 = &val
		}
	}

	if req.Name == "" {
		message := "Name is required"
		if isJSONRequest(r) {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": message,
			}, http.StatusBadRequest)
			return
		}
		renderProductsPage(w, r, nil, message)
		return
	}

	// Set defaults
	if req.Type == "" {
		req.Type = "service"
	}
	if req.Currency == "" {
		req.Currency = "USD"
	}

	product := &models.Product{
		SellerID:       user.ID,
		EntityID:       req.EntityID,
		Name:           req.Name,
		Description:    req.Description,
		Price:          req.Price,
		Currency:       req.Currency,
		ThumbnailURL:   req.ThumbnailURL,
		Photos:         req.Photos,
		Type:           req.Type,
		SubType:        req.SubType,
		Metadata:       req.Metadata,
		FilterNumeric1: req.FilterNumeric1,
		FilterNumeric2: req.FilterNumeric2,
		FilterText1:    req.FilterText1,
		FilterText2:    req.FilterText2,
		FilterBoolean1: req.FilterBoolean1,
		Status:         "active",
		VersionID:      1,
	}

	if err := product.Create(); err != nil {
		message := "Failed to create product"
		if isJSONRequest(r) {
			respondJSON(w, map[string]interface{}{
				"success": false,
				"message": message,
			}, http.StatusInternalServerError)
			return
		}
		renderProductsPage(w, r, nil, message)
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, map[string]interface{}{
			"success": true,
			"message": "Product created successfully",
			"product": product,
		}, http.StatusCreated)
		return
	}

	http.Redirect(w, r, "/seller/products?success=Product created successfully", http.StatusSeeOther)
}

// ProductHandler handles individual product operations
func ProductHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	switch r.Method {
	case http.MethodGet:
		getProduct(w, r, id)
	case http.MethodPut:
		updateProduct(w, r, id)
	case http.MethodDelete:
		deleteProduct(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getProduct(w http.ResponseWriter, r *http.Request, id string) {
	user := middleware.GetCurrentUser(r)
	
	product, err := models.GetProductByID(id)
	if err != nil {
		http.Error(w, "Failed to get product", http.StatusInternalServerError)
		return
	}

	if product == nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	// Check access (unless admin or public product)
	if user != nil && !user.IsAdmin() && product.SellerID != user.ID {
		// Track view if not the owner
		product.IncrementViews()
	} else if user == nil && product.Status != "active" {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"product": product,
	}, http.StatusOK)
}

func updateProduct(w http.ResponseWriter, r *http.Request, id string) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Authentication required",
		}, http.StatusUnauthorized)
		return
	}

	product, err := models.GetProductByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get product",
		}, http.StatusInternalServerError)
		return
	}

	if product == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Product not found",
		}, http.StatusNotFound)
		return
	}

	// Check ownership (unless admin)
	if !user.IsAdmin() && product.SellerID != user.ID {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Access forbidden",
		}, http.StatusForbidden)
		return
	}

	var req struct {
		EntityID       *string         `json:"entity_id"`
		Name           string          `json:"name"`
		Description    string          `json:"description"`
		Price          *float64        `json:"price"`
		Currency       string          `json:"currency"`
		ThumbnailURL   *string         `json:"thumbnail_url"`
		Photos         json.RawMessage `json:"photos"`
		Type           string          `json:"type"`
		SubType        string          `json:"sub_type"`
		Metadata       json.RawMessage `json:"metadata"`
		FilterNumeric1 *float64        `json:"filter_numeric_1"`
		FilterNumeric2 *float64        `json:"filter_numeric_2"`
		FilterText1    *string         `json:"filter_text_1"`
		FilterText2    *string         `json:"filter_text_2"`
		FilterBoolean1 *bool           `json:"filter_boolean_1"`
		Status         string          `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Invalid request body",
		}, http.StatusBadRequest)
		return
	}

	// Update fields
	product.EntityID = req.EntityID
	if req.Name != "" {
		product.Name = req.Name
	}
	product.Description = req.Description
	product.Price = req.Price
	if req.Currency != "" {
		product.Currency = req.Currency
	}
	product.ThumbnailURL = req.ThumbnailURL
	product.Photos = req.Photos
	product.Type = req.Type
	product.SubType = req.SubType
	product.Metadata = req.Metadata
	product.FilterNumeric1 = req.FilterNumeric1
	product.FilterNumeric2 = req.FilterNumeric2
	product.FilterText1 = req.FilterText1
	product.FilterText2 = req.FilterText2
	product.FilterBoolean1 = req.FilterBoolean1
	
	if req.Status != "" {
		product.Status = req.Status
	}

	if err := product.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to update product",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"message": "Product updated successfully",
		"product": product,
	}, http.StatusOK)
}

func deleteProduct(w http.ResponseWriter, r *http.Request, id string) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Authentication required",
		}, http.StatusUnauthorized)
		return
	}

	product, err := models.GetProductByID(id)
	if err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to get product",
		}, http.StatusInternalServerError)
		return
	}

	if product == nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Product not found",
		}, http.StatusNotFound)
		return
	}

	// Check ownership (unless admin)
	if !user.IsAdmin() && product.SellerID != user.ID {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Access forbidden",
		}, http.StatusForbidden)
		return
	}

	// Soft delete by setting status to deleted
	product.Status = "deleted"
	if err := product.Update(); err != nil {
		respondJSON(w, map[string]interface{}{
			"success": false,
			"message": "Failed to delete product",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"success": true,
		"message": "Product deleted successfully",
	}, http.StatusOK)
}

// Helper functions for rendering HTML pages

func renderEntitiesPage(w http.ResponseWriter, r *http.Request, entities []models.Entity, errorMsg string) {
	// Simple HTML rendering - in a real app, use proper templates
	html := `<h1>My Entities</h1><p>Seller interface for entities would go here</p>`
	if errorMsg != "" {
		html = `<div class="error">` + errorMsg + `</div>` + html
	}
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}

func renderProductsPage(w http.ResponseWriter, r *http.Request, products []models.Product, errorMsg string) {
	// Simple HTML rendering - in a real app, use proper templates
	html := `<h1>My Products</h1><p>Seller interface for products would go here</p>`
	if errorMsg != "" {
		html = `<div class="error">` + errorMsg + `</div>` + html
	}
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}