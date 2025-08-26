package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"formulapricing/database"
	"formulapricing/models"
	"github.com/gorilla/mux"
	"github.com/google/uuid"
	"database/sql"
	"time"
)

type UpdateProviderConfigRequest struct {
	APIKey        string `json:"api_key"`
	WebhookSecret string `json:"webhook_secret"`
}

func GetPaymentProviders(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT id, name, is_active, configuration, created_at, updated_at
		FROM formulapricing.payment_providers
		ORDER BY name
	`
	
	ctx := context.Background()
	rows, err := database.DB.Query(ctx, query)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get payment providers")
		return
	}
	defer rows.Close()
	
	var providers []models.PaymentProvider
	for rows.Next() {
		var provider models.PaymentProvider
		err := rows.Scan(&provider.ID, &provider.Name, &provider.IsActive,
			&provider.Configuration, &provider.CreatedAt, &provider.UpdatedAt)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan provider")
			return
		}
		providers = append(providers, provider)
	}
	
	respondWithJSON(w, http.StatusOK, providers)
}

func GetPaymentProvider(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]
	
	provider, err := models.GetPaymentProviderByName(name)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get payment provider")
		return
	}
	
	if provider == nil {
		respondWithError(w, http.StatusNotFound, "Payment provider not found")
		return
	}
	
	respondWithJSON(w, http.StatusOK, provider)
}

func UpdatePaymentProvider(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]
	
	var req UpdateProviderConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	
	// Build configuration JSON
	config := map[string]string{
		"api_key":        req.APIKey,
		"webhook_secret": req.WebhookSecret,
	}
	
	configJSON, err := json.Marshal(config)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to encode configuration")
		return
	}
	
	// Check if provider exists
	provider, err := models.GetPaymentProviderByName(name)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check provider")
		return
	}
	
	if provider == nil {
		// Create new provider
		query := `
			INSERT INTO formulapricing.payment_providers (name, is_active, configuration)
			VALUES ($1, true, $2)
		`
		ctx := context.Background()
		_, err = database.DB.Exec(ctx, query, name, configJSON)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create provider")
			return
		}
	} else {
		// Update existing provider
		query := `
			UPDATE formulapricing.payment_providers
			SET configuration = $1, updated_at = CURRENT_TIMESTAMP
			WHERE name = $2
		`
		ctx := context.Background()
		_, err = database.DB.Exec(ctx, query, configJSON, name)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to update provider")
			return
		}
	}
	
	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Payment provider configuration updated successfully",
	})
}

func GetPurchases(w http.ResponseWriter, r *http.Request) {
	// Get user_id from query parameter for filtering
	userIDStr := r.URL.Query().Get("user_id")
	
	var query string
	var args []interface{}
	
	if userIDStr != "" {
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid user ID")
			return
		}
		
		purchases, err := models.GetUserPurchases(userID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to get purchases")
			return
		}
		
		// Also fetch user information
		for i := range purchases {
			user, _ := models.GetUserByID(purchases[i].UserID)
			if user != nil {
				purchases[i].User = user
			}
		}
		
		respondWithJSON(w, http.StatusOK, purchases)
		return
	}
	
	// Get all purchases
	query = `
		SELECT p.id, p.user_id, p.payment_session_id, p.provider_id, p.provider_payment_id,
		       p.pricing_name, p.calculation_data, p.amount, p.currency, p.status,
		       p.payment_method, p.receipt_url, p.metadata, p.created_at, p.updated_at,
		       u.email, u.role,
		       pp.name, pp.configuration
		FROM formulapricing.purchases p
		LEFT JOIN formulapricing.users u ON p.user_id = u.id
		LEFT JOIN formulapricing.payment_providers pp ON p.provider_id = pp.id
		ORDER BY p.created_at DESC
	`
	
	ctx := context.Background()
	rows, err := database.DB.Query(ctx, query, args...)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get purchases")
		return
	}
	defer rows.Close()
	
	var purchases []models.Purchase
	for rows.Next() {
		var p models.Purchase
		var user models.User
		var provider models.PaymentProvider
		var calcData, paymentMethod, metadata, providerConfig []byte
		var userEmail, userRole sql.NullString
		
		err := rows.Scan(
			&p.ID, &p.UserID, &p.PaymentSessionID, &p.ProviderID, &p.ProviderPaymentID,
			&p.PricingName, &calcData, &p.Amount, &p.Currency, &p.Status,
			&paymentMethod, &p.ReceiptURL, &metadata, &p.CreatedAt, &p.UpdatedAt,
			&userEmail, &userRole,
			&provider.Name, &providerConfig,
		)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to scan purchase")
			return
		}
		
		json.Unmarshal(calcData, &p.CalculationData)
		json.Unmarshal(paymentMethod, &p.PaymentMethod)
		json.Unmarshal(metadata, &p.Metadata)
		
		if userEmail.Valid {
			user.ID = p.UserID
			user.Email = userEmail.String
			user.Role = userRole.String
			p.User = &user
		}
		
		provider.ID = p.ProviderID
		provider.Configuration = providerConfig
		p.Provider = &provider
		
		purchases = append(purchases, p)
	}
	
	respondWithJSON(w, http.StatusOK, purchases)
}

// Simple calculation evaluator for simulation
func evaluateCalculation(calc *models.Calculation, variables map[string]interface{}, results map[string]interface{}) (interface{}, error) {
	// This is a simplified version - in production you'd use the full calculator
	// For now, just return a dummy value
	if calc.CalculationName == "finalAmount" {
		// Check if we have a base price
		if basePrice, ok := variables["basePrice"].(float64); ok {
			return basePrice, nil
		}
		return 100.0, nil // Default amount
	}
	return 0.0, nil
}

func SimulatePurchase(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID       uuid.UUID              `json:"user_id"`
		PricingName  string                 `json:"pricing_name"`
		Variables    map[string]interface{} `json:"variables"`
		ProviderName string                 `json:"provider_name"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	
	// Validate user exists
	user, err := models.GetUserByID(req.UserID)
	if err != nil || user == nil {
		respondWithError(w, http.StatusNotFound, "User not found")
		return
	}
	
	// Get pricing
	pricing, err := models.GetPricingByName(req.PricingName)
	if err != nil || pricing == nil {
		respondWithError(w, http.StatusNotFound, "Pricing not found")
		return
	}
	
	// Calculate the price (reuse logic from calculate handler)
	variables, err := models.GetAllVariables()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get variables")
		return
	}
	
	// Build variable map and validate
	varMap := make(map[string]interface{})
	for _, v := range variables {
		if val, ok := req.Variables[v.VariableName]; ok {
			varMap[v.VariableName] = val
		} else if v.DefaultValue != nil {
			varMap[v.VariableName] = *v.DefaultValue
		}
	}
	
	// Simple calculation for simulation - just use first pricing rule
	results := make(map[string]interface{})
	amount := 100.0 // default amount
	
	// Try to extract calculation names from pricing rules
	if len(pricing.Pricing) > 0 {
		// For each rule, try to get the calculation
		for _, rule := range pricing.Pricing {
			if rule.Calculation != "" {
				// Try to get the calculation by name
				calc, err := models.GetCalculationByName(rule.Calculation)
				if err == nil && calc != nil {
					result, _ := evaluateCalculation(calc, varMap, results)
					results[calc.CalculationName] = result
					// Use the last result as the amount
					if val, ok := result.(float64); ok {
						amount = val
					}
				}
			}
		}
	}
	
	// Use finalAmount if available, otherwise use the calculated amount
	if finalAmount, ok := results["finalAmount"].(float64); ok {
		amount = finalAmount
	}
	
	// Get provider
	if req.ProviderName == "" {
		req.ProviderName = "stripe"
	}
	
	provider, err := models.GetPaymentProviderByName(req.ProviderName)
	if err != nil || provider == nil {
		respondWithError(w, http.StatusNotFound, "Payment provider not found")
		return
	}
	
	// Create a simulated purchase
	purchase := models.Purchase{
		UserID:          req.UserID,
		ProviderID:      provider.ID,
		PricingName:     req.PricingName,
		CalculationData: results,
		Amount:          amount,
		Currency:        "usd",
		Status:          "simulated",
		PaymentMethod: map[string]interface{}{
			"type": "simulation",
		},
		Metadata: map[string]interface{}{
			"simulated": true,
			"timestamp": time.Now(),
		},
	}
	
	// Save the purchase
	if err := models.CreatePurchase(&purchase); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create purchase")
		return
	}
	
	// Return the purchase with calculation details
	response := map[string]interface{}{
		"purchase_id": purchase.ID,
		"user_id":     req.UserID,
		"amount":      amount,
		"currency":    "usd",
		"status":      "simulated",
		"calculation": results,
	}
	
	respondWithJSON(w, http.StatusCreated, response)
}