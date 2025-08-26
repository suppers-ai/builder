package payments

import (
	"formulapricing/models"
	"github.com/google/uuid"
)

// PaymentProvider interface for different payment providers
type PaymentProvider interface {
	// CreateCheckoutSession creates a new payment session
	CreateCheckoutSession(params CheckoutParams) (*CheckoutSession, error)
	
	// GetSession retrieves session details
	GetSession(sessionID string) (*SessionDetails, error)
	
	// HandleWebhook processes webhook events
	HandleWebhook(payload []byte, signature string) (*WebhookEvent, error)
	
	// GetProviderName returns the provider name
	GetProviderName() string
}

// CheckoutParams contains parameters for creating a checkout session
type CheckoutParams struct {
	UserID          uuid.UUID
	PricingName     string
	CalculationData map[string]interface{}
	Amount          float64
	Currency        string
	SuccessURL      string
	CancelURL       string
	Metadata        map[string]interface{}
}

// CheckoutSession represents a payment session response
type CheckoutSession struct {
	SessionID     string
	PaymentURL    string
	ExpiresAt     int64
	ProviderData  interface{}
}

// SessionDetails contains details about a payment session
type SessionDetails struct {
	SessionID       string
	Status          string
	PaymentStatus   string
	PaymentIntentID string
	Amount          float64
	Currency        string
	CustomerEmail   string
	Metadata        map[string]interface{}
}

// WebhookEvent represents a webhook event from payment provider
type WebhookEvent struct {
	EventID       string
	EventType     string
	SessionID     string
	PaymentIntent string
	Status        string
	Amount        float64
	Currency      string
	Metadata      map[string]interface{}
	RawData       interface{}
}

// Factory for creating payment providers
func NewPaymentProvider(provider *models.PaymentProvider) (PaymentProvider, error) {
	switch provider.Name {
	case "stripe":
		return NewStripeProvider(provider.Configuration)
	// Add other providers here as needed
	// case "paypal":
	//     return NewPayPalProvider(provider.Configuration)
	default:
		return nil, ErrUnsupportedProvider
	}
}