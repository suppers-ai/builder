package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// Purchase represents a purchase/sale transaction
type Purchase struct {
	ID            string          `json:"id"`
	ProductID     string          `json:"product_id"`
	BuyerEmail    string          `json:"buyer_email"`
	BuyerName     *string         `json:"buyer_name"`
	Quantity      int             `json:"quantity"`
	UnitPrice     float64         `json:"unit_price"`
	TotalAmount   float64         `json:"total_amount"`
	Currency      string          `json:"currency"`
	Status        string          `json:"status"` // pending, completed, cancelled, refunded
	PaymentMethod *string         `json:"payment_method"`
	PaymentID     *string         `json:"payment_id"`
	Metadata      json.RawMessage `json:"metadata"`
	Source        *string         `json:"source"` // api, web, etc.
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

// PurchaseWithProduct represents a purchase with embedded product info
type PurchaseWithProduct struct {
	Purchase
	Product *Product `json:"product"`
}

// Create creates a new purchase record
func (p *Purchase) Create() error {
	query := `
		INSERT INTO purchases (product_id, buyer_email, buyer_name, quantity, unit_price, total_amount, 
		                      currency, status, payment_method, payment_id, metadata, source)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at`
	
	err := DB.QueryRow(context.Background(), query,
		p.ProductID, p.BuyerEmail, p.BuyerName, p.Quantity, p.UnitPrice, p.TotalAmount,
		p.Currency, p.Status, p.PaymentMethod, p.PaymentID, p.Metadata, p.Source).
		Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create purchase: %w", err)
	}
	return nil
}

// Update updates a purchase record
func (p *Purchase) Update() error {
	query := `
		UPDATE purchases 
		SET buyer_name = $2, quantity = $3, unit_price = $4, total_amount = $5, 
		    currency = $6, status = $7, payment_method = $8, payment_id = $9, 
		    metadata = $10, source = $11
		WHERE id = $1
		RETURNING updated_at`
	
	err := DB.QueryRow(context.Background(), query,
		p.ID, p.BuyerName, p.Quantity, p.UnitPrice, p.TotalAmount,
		p.Currency, p.Status, p.PaymentMethod, p.PaymentID, p.Metadata, p.Source).
		Scan(&p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update purchase: %w", err)
	}
	return nil
}

// UpdateStatus updates only the status and payment info of a purchase
func (p *Purchase) UpdateStatus(status string, paymentID *string, paymentMethod *string) error {
	query := `
		UPDATE purchases 
		SET status = $2, payment_id = $3, payment_method = $4
		WHERE id = $1
		RETURNING updated_at`
	
	err := DB.QueryRow(context.Background(), query, p.ID, status, paymentID, paymentMethod).Scan(&p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update purchase status: %w", err)
	}
	
	p.Status = status
	p.PaymentID = paymentID
	p.PaymentMethod = paymentMethod
	return nil
}

// GetPurchaseByID retrieves a purchase by ID
func GetPurchaseByID(id string) (*Purchase, error) {
	p := &Purchase{}
	query := `
		SELECT id, product_id, buyer_email, buyer_name, quantity, unit_price, total_amount,
		       currency, status, payment_method, payment_id, metadata, source, created_at, updated_at
		FROM purchases 
		WHERE id = $1`
	
	err := DB.QueryRow(context.Background(), query, id).Scan(
		&p.ID, &p.ProductID, &p.BuyerEmail, &p.BuyerName, &p.Quantity, &p.UnitPrice, &p.TotalAmount,
		&p.Currency, &p.Status, &p.PaymentMethod, &p.PaymentID, &p.Metadata, &p.Source,
		&p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get purchase: %w", err)
	}
	return p, nil
}

// GetPurchaseByPaymentID retrieves a purchase by payment ID
func GetPurchaseByPaymentID(paymentID string) (*Purchase, error) {
	p := &Purchase{}
	query := `
		SELECT id, product_id, buyer_email, buyer_name, quantity, unit_price, total_amount,
		       currency, status, payment_method, payment_id, metadata, source, created_at, updated_at
		FROM purchases 
		WHERE payment_id = $1`
	
	err := DB.QueryRow(context.Background(), query, paymentID).Scan(
		&p.ID, &p.ProductID, &p.BuyerEmail, &p.BuyerName, &p.Quantity, &p.UnitPrice, &p.TotalAmount,
		&p.Currency, &p.Status, &p.PaymentMethod, &p.PaymentID, &p.Metadata, &p.Source,
		&p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get purchase by payment ID: %w", err)
	}
	return p, nil
}

// GetPurchasesByProduct retrieves purchases for a specific product
func GetPurchasesByProduct(productID string, limit, offset int) ([]Purchase, error) {
	query := `
		SELECT id, product_id, buyer_email, buyer_name, quantity, unit_price, total_amount,
		       currency, status, payment_method, payment_id, metadata, source, created_at, updated_at
		FROM purchases 
		WHERE product_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := DB.Query(context.Background(), query, productID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchases by product: %w", err)
	}
	defer rows.Close()
	
	var purchases []Purchase
	for rows.Next() {
		var p Purchase
		err := rows.Scan(
			&p.ID, &p.ProductID, &p.BuyerEmail, &p.BuyerName, &p.Quantity, &p.UnitPrice, &p.TotalAmount,
			&p.Currency, &p.Status, &p.PaymentMethod, &p.PaymentID, &p.Metadata, &p.Source,
			&p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan purchase: %w", err)
		}
		purchases = append(purchases, p)
	}
	
	return purchases, nil
}

// GetPurchasesBySeller retrieves purchases for all products by a specific seller
func GetPurchasesBySeller(sellerID string, limit, offset int) ([]PurchaseWithProduct, error) {
	query := `
		SELECT p.id, p.product_id, p.buyer_email, p.buyer_name, p.quantity, p.unit_price, p.total_amount,
		       p.currency, p.status, p.payment_method, p.payment_id, p.metadata, p.source, p.created_at, p.updated_at,
		       pr.id, pr.seller_id, pr.entity_id, pr.name, pr.description, pr.price, pr.currency, pr.thumbnail_url,
		       pr.photos, pr.type, pr.sub_type, pr.metadata, pr.views_count, pr.likes_count, pr.sales_count,
		       pr.status, pr.version_id, pr.created_at, pr.updated_at
		FROM purchases p
		JOIN products pr ON p.product_id = pr.id
		WHERE pr.seller_id = $1
		ORDER BY p.created_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := DB.Query(context.Background(), query, sellerID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchases by seller: %w", err)
	}
	defer rows.Close()
	
	var purchases []PurchaseWithProduct
	for rows.Next() {
		var pwp PurchaseWithProduct
		var p = &pwp.Purchase
		var pr = &Product{}
		
		err := rows.Scan(
			&p.ID, &p.ProductID, &p.BuyerEmail, &p.BuyerName, &p.Quantity, &p.UnitPrice, &p.TotalAmount,
			&p.Currency, &p.Status, &p.PaymentMethod, &p.PaymentID, &p.Metadata, &p.Source,
			&p.CreatedAt, &p.UpdatedAt,
			&pr.ID, &pr.SellerID, &pr.EntityID, &pr.Name, &pr.Description, &pr.Price, &pr.Currency, &pr.ThumbnailURL,
			&pr.Photos, &pr.Type, &pr.SubType, &pr.Metadata, &pr.ViewsCount, &pr.LikesCount, &pr.SalesCount,
			&pr.Status, &pr.VersionID, &pr.CreatedAt, &pr.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan purchase with product: %w", err)
		}
		
		pwp.Product = pr
		purchases = append(purchases, pwp)
	}
	
	return purchases, nil
}

// GetPurchasesByBuyer retrieves purchases by a specific buyer email
func GetPurchasesByBuyer(buyerEmail string, limit, offset int) ([]PurchaseWithProduct, error) {
	query := `
		SELECT p.id, p.product_id, p.buyer_email, p.buyer_name, p.quantity, p.unit_price, p.total_amount,
		       p.currency, p.status, p.payment_method, p.payment_id, p.metadata, p.source, p.created_at, p.updated_at,
		       pr.id, pr.seller_id, pr.entity_id, pr.name, pr.description, pr.price, pr.currency, pr.thumbnail_url,
		       pr.photos, pr.type, pr.sub_type, pr.metadata, pr.views_count, pr.likes_count, pr.sales_count,
		       pr.status, pr.version_id, pr.created_at, pr.updated_at
		FROM purchases p
		JOIN products pr ON p.product_id = pr.id
		WHERE p.buyer_email = $1
		ORDER BY p.created_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := DB.Query(context.Background(), query, buyerEmail, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchases by buyer: %w", err)
	}
	defer rows.Close()
	
	var purchases []PurchaseWithProduct
	for rows.Next() {
		var pwp PurchaseWithProduct
		var p = &pwp.Purchase
		var pr = &Product{}
		
		err := rows.Scan(
			&p.ID, &p.ProductID, &p.BuyerEmail, &p.BuyerName, &p.Quantity, &p.UnitPrice, &p.TotalAmount,
			&p.Currency, &p.Status, &p.PaymentMethod, &p.PaymentID, &p.Metadata, &p.Source,
			&p.CreatedAt, &p.UpdatedAt,
			&pr.ID, &pr.SellerID, &pr.EntityID, &pr.Name, &pr.Description, &pr.Price, &pr.Currency, &pr.ThumbnailURL,
			&pr.Photos, &pr.Type, &pr.SubType, &pr.Metadata, &pr.ViewsCount, &pr.LikesCount, &pr.SalesCount,
			&pr.Status, &pr.VersionID, &pr.CreatedAt, &pr.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan purchase with product: %w", err)
		}
		
		pwp.Product = pr
		purchases = append(purchases, pwp)
	}
	
	return purchases, nil
}

// GetAllPurchases retrieves all purchases with pagination
func GetAllPurchases(limit, offset int) ([]PurchaseWithProduct, error) {
	query := `
		SELECT p.id, p.product_id, p.buyer_email, p.buyer_name, p.quantity, p.unit_price, p.total_amount,
		       p.currency, p.status, p.payment_method, p.payment_id, p.metadata, p.source, p.created_at, p.updated_at,
		       pr.id, pr.seller_id, pr.entity_id, pr.name, pr.description, pr.price, pr.currency, pr.thumbnail_url,
		       pr.photos, pr.type, pr.sub_type, pr.metadata, pr.views_count, pr.likes_count, pr.sales_count,
		       pr.status, pr.version_id, pr.created_at, pr.updated_at
		FROM purchases p
		JOIN products pr ON p.product_id = pr.id
		ORDER BY p.created_at DESC
		LIMIT $1 OFFSET $2`
	
	rows, err := DB.Query(context.Background(), query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get all purchases: %w", err)
	}
	defer rows.Close()
	
	var purchases []PurchaseWithProduct
	for rows.Next() {
		var pwp PurchaseWithProduct
		var p = &pwp.Purchase
		var pr = &Product{}
		
		err := rows.Scan(
			&p.ID, &p.ProductID, &p.BuyerEmail, &p.BuyerName, &p.Quantity, &p.UnitPrice, &p.TotalAmount,
			&p.Currency, &p.Status, &p.PaymentMethod, &p.PaymentID, &p.Metadata, &p.Source,
			&p.CreatedAt, &p.UpdatedAt,
			&pr.ID, &pr.SellerID, &pr.EntityID, &pr.Name, &pr.Description, &pr.Price, &pr.Currency, &pr.ThumbnailURL,
			&pr.Photos, &pr.Type, &pr.SubType, &pr.Metadata, &pr.ViewsCount, &pr.LikesCount, &pr.SalesCount,
			&pr.Status, &pr.VersionID, &pr.CreatedAt, &pr.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan purchase with product: %w", err)
		}
		
		pwp.Product = pr
		purchases = append(purchases, pwp)
	}
	
	return purchases, nil
}

// GetSalesStats retrieves sales statistics for a seller
func GetSalesStats(sellerID string) (*SalesStats, error) {
	stats := &SalesStats{}
	
	// Get total sales count and revenue
	query := `
		SELECT 
			COUNT(p.id) as total_sales,
			COALESCE(SUM(p.total_amount), 0) as total_revenue,
			COUNT(DISTINCT p.product_id) as products_sold
		FROM purchases p
		JOIN products pr ON p.product_id = pr.id
		WHERE pr.seller_id = $1 AND p.status = 'completed'`
	
	err := DB.QueryRow(context.Background(), query, sellerID).Scan(&stats.TotalSales, &stats.TotalRevenue, &stats.ProductsSold)
	if err != nil {
		return nil, fmt.Errorf("failed to get sales stats: %w", err)
	}
	
	// Get this month's stats
	query = `
		SELECT 
			COUNT(p.id) as monthly_sales,
			COALESCE(SUM(p.total_amount), 0) as monthly_revenue
		FROM purchases p
		JOIN products pr ON p.product_id = pr.id
		WHERE pr.seller_id = $1 AND p.status = 'completed' 
		  AND p.created_at >= date_trunc('month', CURRENT_DATE)`
	
	err = DB.QueryRow(context.Background(), query, sellerID).Scan(&stats.MonthlySales, &stats.MonthlyRevenue)
	if err != nil {
		return nil, fmt.Errorf("failed to get monthly sales stats: %w", err)
	}
	
	return stats, nil
}

// SalesStats represents sales statistics
type SalesStats struct {
	TotalSales     int     `json:"total_sales"`
	TotalRevenue   float64 `json:"total_revenue"`
	ProductsSold   int     `json:"products_sold"`
	MonthlySales   int     `json:"monthly_sales"`
	MonthlyRevenue float64 `json:"monthly_revenue"`
}

// IsCompleted checks if the purchase is completed
func (p *Purchase) IsCompleted() bool {
	return p.Status == "completed"
}

// IsPending checks if the purchase is pending
func (p *Purchase) IsPending() bool {
	return p.Status == "pending"
}

// CalculateTotalAmount calculates the total amount based on quantity and unit price
func (p *Purchase) CalculateTotalAmount() {
	p.TotalAmount = float64(p.Quantity) * p.UnitPrice
}