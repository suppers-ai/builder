package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"formulapricing/models"
	"formulapricing/payments"

	"github.com/google/uuid"
)

func HandlePaymentWebhook(w http.ResponseWriter, r *http.Request) {
	// Read the webhook payload
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}

	// Get the Stripe signature header
	signature := r.Header.Get("Stripe-Signature")
	if signature == "" {
		respondWithError(w, http.StatusBadRequest, "Missing webhook signature")
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
		respondWithError(w, http.StatusInternalServerError, "Failed to initialize payment provider")
		return
	}

	// Handle the webhook
	event, err := paymentProvider.HandleWebhook(payload, signature)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid webhook: %v", err))
		return
	}

	// Check if we've already processed this event (idempotency)
	existingWebhook, err := models.GetPaymentWebhookByEventID(provider.ID, event.EventID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check webhook status")
		return
	}
	
	if existingWebhook != nil && existingWebhook.Processed {
		// Already processed, return success
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"already_processed"}`)
		return
	}

	// Save the webhook event
	webhook := &models.PaymentWebhook{
		ProviderID:      provider.ID,
		ProviderEventID: event.EventID,
		EventType:       event.EventType,
		Payload:         payload,
	}
	
	if existingWebhook == nil {
		if err := models.CreatePaymentWebhook(webhook); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to save webhook event")
			return
		}
	} else {
		webhook = existingWebhook
	}

	// Process the event based on type
	var processingError *string
	
	switch event.EventType {
	case "checkout.session.completed":
		processingError = handleCheckoutCompleted(event, provider.ID)
	case "checkout.session.expired":
		processingError = handleCheckoutExpired(event, provider.ID)
	case "payment_intent.succeeded":
		// Additional confirmation - usually handled via checkout.session.completed
		processingError = handlePaymentSucceeded(event, provider.ID)
	case "payment_intent.payment_failed":
		processingError = handlePaymentFailed(event, provider.ID)
	}

	// Mark webhook as processed
	if err := models.MarkWebhookProcessed(webhook.ID, processingError); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update webhook status")
		return
	}

	if processingError != nil {
		respondWithError(w, http.StatusInternalServerError, *processingError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"processed"}`)
}

func handleCheckoutCompleted(event *payments.WebhookEvent, providerID uuid.UUID) *string {
	// Get the payment session from database
	session, err := models.GetPaymentSessionByProviderSessionID(providerID, event.SessionID)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to get payment session: %v", err)
		return &errMsg
	}
	if session == nil {
		errMsg := fmt.Sprintf("Payment session not found for ID: %s", event.SessionID)
		return &errMsg
	}

	// Update session status
	if err := models.UpdatePaymentSessionStatus(session.ID, "completed"); err != nil {
		errMsg := fmt.Sprintf("Failed to update session status: %v", err)
		return &errMsg
	}

	// Extract calculation data from metadata
	var calculationData map[string]interface{}
	if calcDataStr, ok := event.Metadata["calculation_data"].(string); ok {
		json.Unmarshal([]byte(calcDataStr), &calculationData)
	} else {
		calculationData = session.CalculationData
	}

	// Create purchase record
	purchase := &models.Purchase{
		UserID:           session.UserID,
		PaymentSessionID: &session.ID,
		ProviderID:       providerID,
		ProviderPaymentID: &event.PaymentIntent,
		PricingName:      session.PricingName,
		CalculationData:  calculationData,
		Amount:           event.Amount,
		Currency:         event.Currency,
		Status:           "completed",
		PaymentMethod:    map[string]interface{}{
			"type": "card", // Default for Stripe checkout
		},
		Metadata:         event.Metadata,
	}

	if err := models.CreatePurchase(purchase); err != nil {
		errMsg := fmt.Sprintf("Failed to create purchase record: %v", err)
		return &errMsg
	}

	return nil
}

func handleCheckoutExpired(event *payments.WebhookEvent, providerID uuid.UUID) *string {
	// Get the payment session from database
	session, err := models.GetPaymentSessionByProviderSessionID(providerID, event.SessionID)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to get payment session: %v", err)
		return &errMsg
	}
	if session == nil {
		// Session not found, might have been deleted already
		return nil
	}

	// Update session status to expired
	if err := models.UpdatePaymentSessionStatus(session.ID, "expired"); err != nil {
		errMsg := fmt.Sprintf("Failed to update session status: %v", err)
		return &errMsg
	}

	return nil
}

func handlePaymentSucceeded(event *payments.WebhookEvent, providerID uuid.UUID) *string {
	// This is usually a duplicate of checkout.session.completed
	// We can use it for additional verification if needed
	return nil
}

func handlePaymentFailed(event *payments.WebhookEvent, providerID uuid.UUID) *string {
	// Find the session by payment intent ID if available
	// Update status to failed
	// This would require adding a method to find session by payment intent
	return nil
}

// Payment success and cancel endpoints for redirect handling
func PaymentSuccess(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		respondWithError(w, http.StatusBadRequest, "Missing session ID")
		return
	}

	// Get the payment provider
	provider, err := models.GetPaymentProviderByName("stripe")
	if err != nil || provider == nil {
		respondWithError(w, http.StatusInternalServerError, "Payment provider not available")
		return
	}

	// Get session details from provider
	paymentProvider, err := payments.NewPaymentProvider(provider)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to initialize payment provider")
		return
	}

	sessionDetails, err := paymentProvider.GetSession(sessionID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get session details: %v", err))
		return
	}

	// Return success response
	response := map[string]interface{}{
		"status":         "success",
		"session_id":     sessionID,
		"payment_status": sessionDetails.PaymentStatus,
		"amount":         sessionDetails.Amount,
		"currency":       sessionDetails.Currency,
	}

	respondWithJSON(w, http.StatusOK, response)
}

func PaymentCancel(w http.ResponseWriter, r *http.Request) {
	// Handle payment cancellation
	response := map[string]interface{}{
		"status":  "cancelled",
		"message": "Payment was cancelled by user",
	}

	respondWithJSON(w, http.StatusOK, response)
}

// Get user's purchase history
func GetUserPurchases(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	if userIDStr == "" {
		respondWithError(w, http.StatusBadRequest, "Missing user_id parameter")
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID format")
		return
	}

	purchases, err := models.GetUserPurchases(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch purchases")
		return
	}

	respondWithJSON(w, http.StatusOK, purchases)
}