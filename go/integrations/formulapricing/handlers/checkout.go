package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"formulapricing/engine"
	"formulapricing/models"
	"formulapricing/payments"

	"github.com/google/uuid"
)

type CheckoutRequest struct {
	UserID      string                 `json:"user_id"`
	PricingName string                 `json:"pricing_name"`
	Variables   map[string]interface{} `json:"variables"`
}

type CheckoutResponse struct {
	SessionID  string `json:"session_id"`
	PaymentURL string `json:"payment_url"`
	ExpiresAt  int64  `json:"expires_at"`
}

func CreateCheckout(w http.ResponseWriter, r *http.Request) {
	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate required fields
	if req.UserID == "" || req.PricingName == "" || req.Variables == nil {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: user_id, pricing_name, variables")
		return
	}

	// Parse user ID
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID format")
		return
	}

	// Verify user exists
	user, err := models.GetUserByID(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to verify user")
		return
	}
	if user == nil {
		respondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	// First, calculate the pricing using the existing calculate logic
	calcReq := CalculateRequest{
		PricingName: req.PricingName,
		Variables:   req.Variables,
	}

	// Perform the calculation
	calcResponse, err := performCalculation(calcReq)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Failed to calculate pricing: %v", err))
		return
	}

	// Check if total is valid
	if calcResponse.Total <= 0 {
		respondWithError(w, http.StatusBadRequest, "Calculated amount must be greater than zero")
		return
	}

	// Get the payment provider (Stripe for now)
	provider, err := models.GetPaymentProviderByName("stripe")
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get payment provider")
		return
	}
	if provider == nil || !provider.IsActive {
		respondWithError(w, http.StatusServiceUnavailable, "Payment provider not available")
		return
	}

	// Initialize the payment provider
	paymentProvider, err := payments.NewPaymentProvider(provider)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to initialize payment provider: %v", err))
		return
	}

	// Build URLs
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = fmt.Sprintf("http://localhost:%s", os.Getenv("PORT"))
		if os.Getenv("PORT") == "" {
			baseURL = "http://localhost:8080"
		}
	}

	successURL := fmt.Sprintf("%s/api/payments/success?session_id={CHECKOUT_SESSION_ID}", baseURL)
	cancelURL := fmt.Sprintf("%s/api/payments/cancel", baseURL)

	// Create checkout session with the payment provider
	checkoutParams := payments.CheckoutParams{
		UserID:      userID,
		PricingName: req.PricingName,
		CalculationData: map[string]interface{}{
			"variables": req.Variables,
			"results":   calcResponse.Results,
			"summary":   calcResponse.Summary,
		},
		Amount:     calcResponse.Total,
		Currency:   "USD",
		SuccessURL: successURL,
		CancelURL:  cancelURL,
		Metadata: map[string]interface{}{
			"user_email": user.Email,
		},
	}

	checkoutSession, err := paymentProvider.CreateCheckoutSession(checkoutParams)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create payment session: %v", err))
		return
	}

	// Save the session to database
	expiresAt := time.Unix(checkoutSession.ExpiresAt, 0)
	dbSession := &models.PaymentSession{
		UserID:            userID,
		ProviderID:        provider.ID,
		ProviderSessionID: checkoutSession.SessionID,
		PricingName:       req.PricingName,
		CalculationData:   checkoutParams.CalculationData,
		Amount:            calcResponse.Total,
		Currency:          "USD",
		Status:            "pending",
		Metadata:          checkoutParams.Metadata,
		ExpiresAt:         &expiresAt,
	}

	if err := models.CreatePaymentSession(dbSession); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save payment session")
		return
	}

	// Return the checkout URL
	response := CheckoutResponse{
		SessionID:  checkoutSession.SessionID,
		PaymentURL: checkoutSession.PaymentURL,
		ExpiresAt:  checkoutSession.ExpiresAt,
	}

	respondWithJSON(w, http.StatusOK, response)
}

// Helper function to perform calculation
func performCalculation(req CalculateRequest) (*CalculateResponse, error) {
	// This replicates the logic from Calculate handler
	// but returns the response instead of writing to HTTP

	// Get the pricing configuration
	pricing, err := models.GetPricingByName(req.PricingName)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch pricing configuration: %w", err)
	}
	if pricing == nil {
		return nil, fmt.Errorf("pricing configuration '%s' not found", req.PricingName)
	}

	// Get all calculations and conditions
	calculations, err := models.GetAllCalculations()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch calculations: %w", err)
	}

	conditions, err := models.GetAllConditions()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch conditions: %w", err)
	}

	// Get all variables for metadata
	allVariables, err := models.GetAllVariables()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch variables: %w", err)
	}

	// Create a map for quick variable lookup
	variableMap := make(map[string]models.Variable)
	for _, v := range allVariables {
		variableMap[v.VariableName] = v
	}

	// Create a map for quick calculation lookup
	calculationMap := make(map[string]models.Calculation)
	for _, c := range calculations {
		calculationMap[c.CalculationName] = c
	}

	// Create calculator and load data
	calc := engine.NewCalculator()
	
	// Set variables from request
	for name, value := range req.Variables {
		calc.SetVariable(name, value)
	}

	// Load calculations
	for _, c := range calculations {
		calc.SetCalculation(c.CalculationName, c.Calculation)
	}

	// Load conditions
	for _, c := range conditions {
		calc.SetCondition(c.ConditionName, c.Condition)
	}

	// Process pricing rules
	var results []CalculationResult
	total := 0.0
	summary := make(map[string]interface{})

	// Reset runningTotal at the start
	calc.ResetRunningTotal()

	for _, rule := range pricing.Pricing {
		// Evaluate condition
		conditionMet, err := calc.EvaluateCondition(rule.Condition)
		if err != nil {
			results = append(results, CalculationResult{
				ConditionName:   rule.Condition,
				ConditionMet:    false,
				CalculationName: rule.Calculation,
				Error:           fmt.Sprintf("Failed to evaluate condition: %v", err),
			})
			continue
		}

		result := CalculationResult{
			ConditionName:   rule.Condition,
			ConditionMet:    conditionMet,
			CalculationName: rule.Calculation,
		}

		if conditionMet {
			// Find the calculation and its formula
			for _, c := range calculations {
				if c.CalculationName == rule.Calculation {
					result.DisplayName = c.DisplayName
					result.Formula = c.Calculation
					break
				}
			}

			// Perform calculation
			value, err := calc.Calculate(rule.Calculation)
			if err != nil {
				result.Error = fmt.Sprintf("Failed to calculate: %v", err)
			} else {
				result.Value = value
				total += value
				
				// Update the runningTotal system variable after each successful calculation
				calc.AddToRunningTotal(value)
				
				// Add to summary
				summary[rule.Calculation] = map[string]interface{}{
					"display_name": result.DisplayName,
					"value":        value,
					"formula":      result.Formula,
				}
			}
		}

		results = append(results, result)
	}

	// Create response
	response := &CalculateResponse{
		Results: results,
		Total:   total,
		Summary: summary,
	}

	return response, nil
}