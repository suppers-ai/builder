package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"formulapricing/database"
	"time"

	"github.com/google/uuid"
)

type PaymentProvider struct {
	ID            uuid.UUID       `json:"id"`
	Name          string          `json:"name"`
	IsActive      bool            `json:"is_active"`
	Configuration json.RawMessage `json:"configuration"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

type PaymentSession struct {
	ID                 uuid.UUID              `json:"id"`
	UserID             uuid.UUID              `json:"user_id"`
	User               *User                  `json:"user,omitempty"`
	ProviderID         uuid.UUID              `json:"provider_id"`
	Provider           *PaymentProvider       `json:"provider,omitempty"`
	ProviderSessionID  string                 `json:"provider_session_id"`
	PricingName        string                 `json:"pricing_name"`
	CalculationData    map[string]interface{} `json:"calculation_data"`
	Amount             float64                `json:"amount"`
	Currency           string                 `json:"currency"`
	Status             string                 `json:"status"`
	Metadata           map[string]interface{} `json:"metadata"`
	ExpiresAt          *time.Time             `json:"expires_at"`
	CreatedAt          time.Time              `json:"created_at"`
	UpdatedAt          time.Time              `json:"updated_at"`
}

type Purchase struct {
	ID                uuid.UUID              `json:"id"`
	UserID            uuid.UUID              `json:"user_id"`
	User              *User                  `json:"user,omitempty"`
	PaymentSessionID  *uuid.UUID             `json:"payment_session_id"`
	PaymentSession    *PaymentSession        `json:"payment_session,omitempty"`
	ProviderID        uuid.UUID              `json:"provider_id"`
	Provider          *PaymentProvider       `json:"provider,omitempty"`
	ProviderPaymentID *string                `json:"provider_payment_id"`
	PricingName       string                 `json:"pricing_name"`
	CalculationData   map[string]interface{} `json:"calculation_data"`
	Amount            float64                `json:"amount"`
	Currency          string                 `json:"currency"`
	Status            string                 `json:"status"`
	PaymentMethod     map[string]interface{} `json:"payment_method"`
	ReceiptURL        *string                `json:"receipt_url"`
	Metadata          map[string]interface{} `json:"metadata"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
}

type PaymentWebhook struct {
	ID              uuid.UUID       `json:"id"`
	ProviderID      uuid.UUID       `json:"provider_id"`
	Provider        *PaymentProvider `json:"provider,omitempty"`
	ProviderEventID string          `json:"provider_event_id"`
	EventType       string          `json:"event_type"`
	Payload         json.RawMessage `json:"payload"`
	Processed       bool            `json:"processed"`
	ProcessedAt     *time.Time      `json:"processed_at"`
	Error           *string         `json:"error"`
	CreatedAt       time.Time       `json:"created_at"`
}

// Helper methods
func GetPaymentProviderByName(name string) (*PaymentProvider, error) {
	query := `
		SELECT id, name, is_active, configuration, created_at, updated_at
		FROM formulapricing.payment_providers
		WHERE name = $1 AND is_active = true
	`
	
	var provider PaymentProvider
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, name)
	err := row.Scan(
		&provider.ID, &provider.Name, &provider.IsActive,
		&provider.Configuration, &provider.CreatedAt, &provider.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &provider, nil
}

func CreatePaymentSession(session *PaymentSession) error {
	session.ID = uuid.New()
	
	calcData, err := json.Marshal(session.CalculationData)
	if err != nil {
		return err
	}
	
	metadata, err := json.Marshal(session.Metadata)
	if err != nil {
		return err
	}
	
	query := `
		INSERT INTO formulapricing.payment_sessions 
		(id, user_id, provider_id, provider_session_id, pricing_name, calculation_data, 
		 amount, currency, status, metadata, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	
	ctx := context.Background()
	_, err = database.DB.Exec(ctx, query, 
		session.ID, session.UserID, session.ProviderID, session.ProviderSessionID,
		session.PricingName, calcData, session.Amount, session.Currency, 
		session.Status, metadata, session.ExpiresAt,
	)
	return err
}

func GetPaymentSessionByID(id uuid.UUID) (*PaymentSession, error) {
	query := `
		SELECT ps.id, ps.user_id, ps.provider_id, ps.provider_session_id, 
			   ps.pricing_name, ps.calculation_data, ps.amount, ps.currency, 
			   ps.status, ps.metadata, ps.expires_at, ps.created_at, ps.updated_at
		FROM formulapricing.payment_sessions ps
		WHERE ps.id = $1
	`
	
	var session PaymentSession
	var calcData, metadata []byte
	
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, id)
	err := row.Scan(
		&session.ID, &session.UserID, &session.ProviderID, &session.ProviderSessionID,
		&session.PricingName, &calcData, &session.Amount, &session.Currency,
		&session.Status, &metadata, &session.ExpiresAt, &session.CreatedAt, &session.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	
	json.Unmarshal(calcData, &session.CalculationData)
	json.Unmarshal(metadata, &session.Metadata)
	
	return &session, nil
}

func GetPaymentSessionByProviderSessionID(providerID uuid.UUID, providerSessionID string) (*PaymentSession, error) {
	query := `
		SELECT ps.id, ps.user_id, ps.provider_id, ps.provider_session_id, 
			   ps.pricing_name, ps.calculation_data, ps.amount, ps.currency, 
			   ps.status, ps.metadata, ps.expires_at, ps.created_at, ps.updated_at
		FROM formulapricing.payment_sessions ps
		WHERE ps.provider_id = $1 AND ps.provider_session_id = $2
	`
	
	var session PaymentSession
	var calcData, metadata []byte
	
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, providerID, providerSessionID)
	err := row.Scan(
		&session.ID, &session.UserID, &session.ProviderID, &session.ProviderSessionID,
		&session.PricingName, &calcData, &session.Amount, &session.Currency,
		&session.Status, &metadata, &session.ExpiresAt, &session.CreatedAt, &session.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	
	json.Unmarshal(calcData, &session.CalculationData)
	json.Unmarshal(metadata, &session.Metadata)
	
	return &session, nil
}

func UpdatePaymentSessionStatus(id uuid.UUID, status string) error {
	query := `
		UPDATE formulapricing.payment_sessions 
		SET status = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`
	ctx := context.Background()
	_, err := database.DB.Exec(ctx, query, status, id)
	return err
}

func CreatePurchase(purchase *Purchase) error {
	purchase.ID = uuid.New()
	
	calcData, err := json.Marshal(purchase.CalculationData)
	if err != nil {
		return err
	}
	
	paymentMethod, err := json.Marshal(purchase.PaymentMethod)
	if err != nil {
		return err
	}
	
	metadata, err := json.Marshal(purchase.Metadata)
	if err != nil {
		return err
	}
	
	query := `
		INSERT INTO formulapricing.purchases 
		(id, user_id, payment_session_id, provider_id, provider_payment_id, 
		 pricing_name, calculation_data, amount, currency, status, 
		 payment_method, receipt_url, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`
	
	ctx := context.Background()
	_, err = database.DB.Exec(ctx, query,
		purchase.ID, purchase.UserID, purchase.PaymentSessionID, purchase.ProviderID,
		purchase.ProviderPaymentID, purchase.PricingName, calcData, purchase.Amount,
		purchase.Currency, purchase.Status, paymentMethod, purchase.ReceiptURL, metadata,
	)
	return err
}

func GetUserPurchases(userID uuid.UUID) ([]Purchase, error) {
	query := `
		SELECT p.id, p.user_id, p.payment_session_id, p.provider_id, p.provider_payment_id,
			   p.pricing_name, p.calculation_data, p.amount, p.currency, p.status,
			   p.payment_method, p.receipt_url, p.metadata, p.created_at, p.updated_at,
			   pp.name, pp.configuration
		FROM formulapricing.purchases p
		LEFT JOIN formulapricing.payment_providers pp ON p.provider_id = pp.id
		WHERE p.user_id = $1
		ORDER BY p.created_at DESC
	`
	
	ctx := context.Background()
	rows, err := database.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var purchases []Purchase
	for rows.Next() {
		var p Purchase
		var provider PaymentProvider
		var calcData, paymentMethod, metadata, providerConfig []byte
		
		err := rows.Scan(
			&p.ID, &p.UserID, &p.PaymentSessionID, &p.ProviderID, &p.ProviderPaymentID,
			&p.PricingName, &calcData, &p.Amount, &p.Currency, &p.Status,
			&paymentMethod, &p.ReceiptURL, &metadata, &p.CreatedAt, &p.UpdatedAt,
			&provider.Name, &providerConfig,
		)
		if err != nil {
			return nil, err
		}
		
		json.Unmarshal(calcData, &p.CalculationData)
		json.Unmarshal(paymentMethod, &p.PaymentMethod)
		json.Unmarshal(metadata, &p.Metadata)
		
		provider.ID = p.ProviderID
		provider.Configuration = providerConfig
		p.Provider = &provider
		
		purchases = append(purchases, p)
	}
	
	return purchases, rows.Err()
}

func CreatePaymentWebhook(webhook *PaymentWebhook) error {
	webhook.ID = uuid.New()
	
	query := `
		INSERT INTO formulapricing.payment_webhooks 
		(id, provider_id, provider_event_id, event_type, payload, processed)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (provider_id, provider_event_id) DO NOTHING
	`
	
	ctx := context.Background()
	_, err := database.DB.Exec(ctx, query,
		webhook.ID, webhook.ProviderID, webhook.ProviderEventID,
		webhook.EventType, webhook.Payload, webhook.Processed,
	)
	return err
}

func GetPaymentWebhookByEventID(providerID uuid.UUID, eventID string) (*PaymentWebhook, error) {
	query := `
		SELECT id, provider_id, provider_event_id, event_type, payload, 
			   processed, processed_at, error, created_at
		FROM formulapricing.payment_webhooks
		WHERE provider_id = $1 AND provider_event_id = $2
	`
	
	var webhook PaymentWebhook
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, query, providerID, eventID)
	err := row.Scan(
		&webhook.ID, &webhook.ProviderID, &webhook.ProviderEventID,
		&webhook.EventType, &webhook.Payload, &webhook.Processed,
		&webhook.ProcessedAt, &webhook.Error, &webhook.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &webhook, nil
}

func MarkWebhookProcessed(id uuid.UUID, errorMsg *string) error {
	query := `
		UPDATE formulapricing.payment_webhooks 
		SET processed = true, processed_at = CURRENT_TIMESTAMP, error = $1
		WHERE id = $2
	`
	ctx := context.Background()
	_, err := database.DB.Exec(ctx, query, errorMsg, id)
	return err
}