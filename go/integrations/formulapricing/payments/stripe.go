package payments

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/stripe/stripe-go/v75"
	"github.com/stripe/stripe-go/v75/checkout/session"
	"github.com/stripe/stripe-go/v75/webhook"
)

var (
	ErrUnsupportedProvider = errors.New("unsupported payment provider")
	ErrInvalidWebhook      = errors.New("invalid webhook signature")
	ErrSessionNotFound     = errors.New("session not found")
)

// StripeProvider implements PaymentProvider for Stripe
type StripeProvider struct {
	apiKey          string
	webhookSecret   string
	apiVersion      string
}

// NewStripeProvider creates a new Stripe payment provider
func NewStripeProvider(config json.RawMessage) (*StripeProvider, error) {
	// Get API key from environment
	apiKey := os.Getenv("STRIPE_API_KEY")
	if apiKey == "" {
		return nil, errors.New("STRIPE_API_KEY not set")
	}

	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if webhookSecret == "" {
		return nil, errors.New("STRIPE_WEBHOOK_SECRET not set")
	}

	// Parse configuration
	var cfg struct {
		APIVersion string `json:"api_version"`
	}
	if err := json.Unmarshal(config, &cfg); err != nil {
		return nil, err
	}

	stripe.Key = apiKey
	
	return &StripeProvider{
		apiKey:        apiKey,
		webhookSecret: webhookSecret,
		apiVersion:    cfg.APIVersion,
	}, nil
}

// CreateCheckoutSession creates a new Stripe checkout session
func (s *StripeProvider) CreateCheckoutSession(params CheckoutParams) (*CheckoutSession, error) {
	// Convert amount to cents
	amountCents := int64(params.Amount * 100)
	
	// Build metadata
	metadata := map[string]string{
		"user_id":      params.UserID.String(),
		"pricing_name": params.PricingName,
	}
	
	// Add calculation data as JSON string
	if calcData, err := json.Marshal(params.CalculationData); err == nil {
		metadata["calculation_data"] = string(calcData)
	}
	
	// Add custom metadata
	for k, v := range params.Metadata {
		if str, ok := v.(string); ok {
			metadata[k] = str
		} else if data, err := json.Marshal(v); err == nil {
			metadata[k] = string(data)
		}
	}

	// Create line items
	lineItems := []*stripe.CheckoutSessionLineItemParams{
		{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String(params.Currency),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name:        stripe.String(fmt.Sprintf("Pricing: %s", params.PricingName)),
					Description: stripe.String("Calculated pricing based on your input"),
				},
				UnitAmount: stripe.Int64(amountCents),
			},
			Quantity: stripe.Int64(1),
		},
	}

	// Create checkout session
	sessionParams := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems:          lineItems,
		Mode:               stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL:         stripe.String(params.SuccessURL),
		CancelURL:          stripe.String(params.CancelURL),
		Metadata:           metadata,
		ExpiresAt:          stripe.Int64(time.Now().Add(30 * time.Minute).Unix()),
	}

	sess, err := session.New(sessionParams)
	if err != nil {
		return nil, fmt.Errorf("failed to create Stripe session: %w", err)
	}

	return &CheckoutSession{
		SessionID:    sess.ID,
		PaymentURL:   sess.URL,
		ExpiresAt:    sess.ExpiresAt,
		ProviderData: sess,
	}, nil
}

// GetSession retrieves session details from Stripe
func (s *StripeProvider) GetSession(sessionID string) (*SessionDetails, error) {
	sess, err := session.Get(sessionID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get Stripe session: %w", err)
	}

	details := &SessionDetails{
		SessionID:     sess.ID,
		Status:        string(sess.Status),
		PaymentStatus: string(sess.PaymentStatus),
		Amount:        float64(sess.AmountTotal) / 100,
		Currency:      string(sess.Currency),
		Metadata:      make(map[string]interface{}),
	}

	// Copy metadata
	for k, v := range sess.Metadata {
		details.Metadata[k] = v
	}

	if sess.PaymentIntent != nil {
		details.PaymentIntentID = sess.PaymentIntent.ID
	}

	if sess.CustomerDetails != nil {
		details.CustomerEmail = sess.CustomerDetails.Email
	}

	return details, nil
}

// HandleWebhook processes Stripe webhook events
func (s *StripeProvider) HandleWebhook(payload []byte, signature string) (*WebhookEvent, error) {
	// Verify webhook signature
	event, err := webhook.ConstructEvent(payload, signature, s.webhookSecret)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrInvalidWebhook, err)
	}

	webhookEvent := &WebhookEvent{
		EventID:   event.ID,
		EventType: string(event.Type),
		RawData:   event,
	}

	// Handle different event types
	switch event.Type {
	case "checkout.session.completed":
		var sess stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
			return nil, fmt.Errorf("error parsing webhook JSON: %w", err)
		}

		webhookEvent.SessionID = sess.ID
		webhookEvent.Status = string(sess.PaymentStatus)
		webhookEvent.Amount = float64(sess.AmountTotal) / 100
		webhookEvent.Currency = string(sess.Currency)
		webhookEvent.Metadata = make(map[string]interface{})
		
		// Copy metadata
		for k, v := range sess.Metadata {
			webhookEvent.Metadata[k] = v
		}

		if sess.PaymentIntent != nil {
			webhookEvent.PaymentIntent = sess.PaymentIntent.ID
		}

	case "checkout.session.expired":
		var sess stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
			return nil, fmt.Errorf("error parsing webhook JSON: %w", err)
		}
		webhookEvent.SessionID = sess.ID
		webhookEvent.Status = "expired"

	case "payment_intent.succeeded":
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
			return nil, fmt.Errorf("error parsing webhook JSON: %w", err)
		}
		webhookEvent.PaymentIntent = pi.ID
		webhookEvent.Status = "succeeded"
		webhookEvent.Amount = float64(pi.Amount) / 100
		webhookEvent.Currency = string(pi.Currency)
		
		// Copy metadata
		webhookEvent.Metadata = make(map[string]interface{})
		for k, v := range pi.Metadata {
			webhookEvent.Metadata[k] = v
		}

	case "payment_intent.payment_failed":
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
			return nil, fmt.Errorf("error parsing webhook JSON: %w", err)
		}
		webhookEvent.PaymentIntent = pi.ID
		webhookEvent.Status = "failed"
	}

	return webhookEvent, nil
}

// GetProviderName returns the provider name
func (s *StripeProvider) GetProviderName() string {
	return "stripe"
}