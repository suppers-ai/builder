package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"dynamicproducts/middleware"
	"dynamicproducts/models"

	"github.com/gorilla/mux"
)

// API Response structures

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// Health check endpoint
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, APIResponse{
		Success: true,
		Message: "Dynamic Products API is healthy",
		Data: map[string]interface{}{
			"service": "dynamicproducts",
			"status":  "healthy",
		},
	}, http.StatusOK)
}

// Public API endpoints (no authentication required)

// ListActiveProducts returns all active products (public endpoint)
func ListActiveProducts(w http.ResponseWriter, r *http.Request) {
	limit := 20
	offset := 0

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	products, err := models.GetActiveProducts(limit, offset)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get products",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"products": products,
			"limit":    limit,
			"offset":   offset,
		},
	}, http.StatusOK)
}

// GetPublicProduct returns product details (public endpoint)
func GetPublicProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	product, err := models.GetProductByID(id)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get product",
		}, http.StatusInternalServerError)
		return
	}

	if product == nil || product.Status != "active" {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Product not found",
		}, http.StatusNotFound)
		return
	}

	// Track view
	product.IncrementViews()

	respondJSON(w, APIResponse{
		Success: true,
		Data:    product,
	}, http.StatusOK)
}

// Purchase Management API

// CreatePurchase creates a new purchase record
func CreatePurchase(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Method not allowed",
		}, http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ProductID     string          `json:"product_id"`
		BuyerEmail    string          `json:"buyer_email"`
		BuyerName     string          `json:"buyer_name"`
		Quantity      int             `json:"quantity"`
		PaymentMethod string          `json:"payment_method"`
		PaymentID     string          `json:"payment_id"`
		Metadata      json.RawMessage `json:"metadata"`
		Source        string          `json:"source"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Invalid request body",
		}, http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.ProductID == "" || req.BuyerEmail == "" || req.Quantity <= 0 {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Product ID, buyer email, and valid quantity are required",
		}, http.StatusBadRequest)
		return
	}

	// Get product to calculate price
	product, err := models.GetProductByID(req.ProductID)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get product",
		}, http.StatusInternalServerError)
		return
	}

	if product == nil || product.Status != "active" {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Product not found or not available",
		}, http.StatusNotFound)
		return
	}

	if product.Price == nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Product price not set",
		}, http.StatusBadRequest)
		return
	}

	// Create purchase
	purchase := &models.Purchase{
		ProductID:     req.ProductID,
		BuyerEmail:    req.BuyerEmail,
		BuyerName:     &req.BuyerName,
		Quantity:      req.Quantity,
		UnitPrice:     *product.Price,
		Currency:      product.Currency,
		Status:        "pending",
		PaymentMethod: &req.PaymentMethod,
		PaymentID:     &req.PaymentID,
		Metadata:      req.Metadata,
		Source:        &req.Source,
	}

	// Calculate total amount
	purchase.CalculateTotalAmount()

	if err := purchase.Create(); err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to create purchase",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, APIResponse{
		Success: true,
		Message: "Purchase created successfully",
		Data:    purchase,
	}, http.StatusCreated)
}

// UpdatePurchaseStatus updates the status of a purchase
func UpdatePurchaseStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Method not allowed",
		}, http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	id := vars["id"]

	var req struct {
		Status        string `json:"status"`
		PaymentID     string `json:"payment_id"`
		PaymentMethod string `json:"payment_method"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Invalid request body",
		}, http.StatusBadRequest)
		return
	}

	// Validate status
	validStatuses := map[string]bool{
		"pending":   true,
		"completed": true,
		"cancelled": true,
		"refunded":  true,
	}

	if !validStatuses[req.Status] {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Invalid status. Must be one of: pending, completed, cancelled, refunded",
		}, http.StatusBadRequest)
		return
	}

	// Get purchase
	purchase, err := models.GetPurchaseByID(id)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get purchase",
		}, http.StatusInternalServerError)
		return
	}

	if purchase == nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Purchase not found",
		}, http.StatusNotFound)
		return
	}

	// Update status
	paymentIDPtr := &req.PaymentID
	if req.PaymentID == "" {
		paymentIDPtr = nil
	}

	paymentMethodPtr := &req.PaymentMethod
	if req.PaymentMethod == "" {
		paymentMethodPtr = nil
	}

	if err := purchase.UpdateStatus(req.Status, paymentIDPtr, paymentMethodPtr); err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to update purchase status",
		}, http.StatusInternalServerError)
		return
	}

	// If purchase is completed, increment product sales count
	if req.Status == "completed" {
		if product, err := models.GetProductByID(purchase.ProductID); err == nil && product != nil {
			product.IncrementSales()
		}
	}

	respondJSON(w, APIResponse{
		Success: true,
		Message: "Purchase status updated successfully",
		Data:    purchase,
	}, http.StatusOK)
}

// GetPurchase returns purchase details
func GetPurchase(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	purchase, err := models.GetPurchaseByID(id)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get purchase",
		}, http.StatusInternalServerError)
		return
	}

	if purchase == nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Purchase not found",
		}, http.StatusNotFound)
		return
	}

	respondJSON(w, APIResponse{
		Success: true,
		Data:    purchase,
	}, http.StatusOK)
}

// GetPurchaseByPaymentID returns purchase details by payment ID
func GetPurchaseByPaymentID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	paymentID := vars["payment_id"]

	purchase, err := models.GetPurchaseByPaymentID(paymentID)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get purchase",
		}, http.StatusInternalServerError)
		return
	}

	if purchase == nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Purchase not found",
		}, http.StatusNotFound)
		return
	}

	respondJSON(w, APIResponse{
		Success: true,
		Data:    purchase,
	}, http.StatusOK)
}

// Authenticated API endpoints

// GetMyPurchases returns purchases for the current authenticated user (seller)
func GetMyPurchases(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Authentication required",
		}, http.StatusUnauthorized)
		return
	}

	limit := 20
	offset := 0

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	purchases, err := models.GetPurchasesBySeller(user.ID, limit, offset)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get purchases",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"purchases": purchases,
			"limit":     limit,
			"offset":    offset,
		},
	}, http.StatusOK)
}

// GetMyStats returns sales statistics for the current authenticated user
func GetMyStats(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Authentication required",
		}, http.StatusUnauthorized)
		return
	}

	stats, err := models.GetSalesStats(user.ID)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get sales statistics",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, APIResponse{
		Success: true,
		Data:    stats,
	}, http.StatusOK)
}

// GetPurchasesByBuyer returns purchases for a specific buyer email
func GetPurchasesByBuyer(w http.ResponseWriter, r *http.Request) {
	buyerEmail := r.URL.Query().Get("email")
	if buyerEmail == "" {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Buyer email is required",
		}, http.StatusBadRequest)
		return
	}

	limit := 20
	offset := 0

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	purchases, err := models.GetPurchasesByBuyer(buyerEmail, limit, offset)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to get purchases",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"purchases": purchases,
			"limit":     limit,
			"offset":    offset,
		},
	}, http.StatusOK)
}

// Search and filter endpoints

// SearchProducts searches for products based on filters
func SearchProducts(w http.ResponseWriter, r *http.Request) {
	// Basic search implementation - in production you'd want more sophisticated search
	limit := 20
	offset := 0

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	// For now, just return active products
	// TODO: Implement proper search with filters
	products, err := models.GetActiveProducts(limit, offset)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to search products",
		}, http.StatusInternalServerError)
		return
	}

	respondJSON(w, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"products": products,
			"limit":    limit,
			"offset":   offset,
			"filters":  r.URL.Query(),
		},
	}, http.StatusOK)
}

// Webhook endpoint for payment providers
func PaymentWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Method not allowed",
		}, http.StatusMethodNotAllowed)
		return
	}

	// Parse webhook payload
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Invalid webhook payload",
		}, http.StatusBadRequest)
		return
	}

	// Extract payment information (this would vary by payment provider)
	paymentID, ok := payload["payment_id"].(string)
	if !ok {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Missing payment_id in webhook",
		}, http.StatusBadRequest)
		return
	}

	status, ok := payload["status"].(string)
	if !ok {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Missing status in webhook",
		}, http.StatusBadRequest)
		return
	}

	// Find purchase by payment ID
	purchase, err := models.GetPurchaseByPaymentID(paymentID)
	if err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to find purchase",
		}, http.StatusInternalServerError)
		return
	}

	if purchase == nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Purchase not found for payment ID",
		}, http.StatusNotFound)
		return
	}

	// Update purchase status based on webhook
	var newStatus string
	switch status {
	case "succeeded", "completed", "paid":
		newStatus = "completed"
	case "failed", "cancelled":
		newStatus = "cancelled"
	case "refunded":
		newStatus = "refunded"
	default:
		newStatus = "pending"
	}

	if err := purchase.UpdateStatus(newStatus, &paymentID, nil); err != nil {
		respondJSON(w, APIResponse{
			Success: false,
			Error:   "Failed to update purchase status",
		}, http.StatusInternalServerError)
		return
	}

	// If completed, increment product sales
	if newStatus == "completed" {
		if product, err := models.GetProductByID(purchase.ProductID); err == nil && product != nil {
			product.IncrementSales()
		}
	}

	respondJSON(w, APIResponse{
		Success: true,
		Message: "Webhook processed successfully",
	}, http.StatusOK)
}

// Utility functions

// SetJSONHeader sets the Content-Type header to application/json
func SetJSONHeader(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
}