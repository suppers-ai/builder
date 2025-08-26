package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// ProductType represents a configurable product type
type ProductType struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	MetadataSchema json.RawMessage `json:"metadata_schema"` // JSON schema for allowed metadata
	FilterConfig   json.RawMessage `json:"filter_config"`   // Configuration for filter columns
	IsActive       bool            `json:"is_active"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// ProductSubType represents a sub-type of a product
type ProductSubType struct {
	ID             string          `json:"id"`
	ProductTypeID  string          `json:"product_type_id"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	MetadataSchema json.RawMessage `json:"metadata_schema"`
	FilterConfig   json.RawMessage `json:"filter_config"`
	IsActive       bool            `json:"is_active"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// Product represents a product instance
type Product struct {
	ID              string          `json:"id"`
	SellerID        string          `json:"seller_id"`
	EntityID        *string         `json:"entity_id"`
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	Price           *float64        `json:"price"`
	Currency        string          `json:"currency"`
	ThumbnailURL    *string         `json:"thumbnail_url"`
	Photos          json.RawMessage `json:"photos"`
	Type            string          `json:"type"`
	SubType         string          `json:"sub_type"`
	Metadata        json.RawMessage `json:"metadata"`
	ViewsCount      int             `json:"views_count"`
	LikesCount      int             `json:"likes_count"`
	SalesCount      int             `json:"sales_count"`
	
	// Dynamic filter columns
	FilterNumeric1  *float64   `json:"filter_numeric_1"`
	FilterNumeric2  *float64   `json:"filter_numeric_2"`
	FilterNumeric3  *float64   `json:"filter_numeric_3"`
	FilterNumeric4  *float64   `json:"filter_numeric_4"`
	FilterNumeric5  *float64   `json:"filter_numeric_5"`
	FilterText1     *string    `json:"filter_text_1"`
	FilterText2     *string    `json:"filter_text_2"`
	FilterText3     *string    `json:"filter_text_3"`
	FilterText4     *string    `json:"filter_text_4"`
	FilterText5     *string    `json:"filter_text_5"`
	FilterBoolean1  *bool      `json:"filter_boolean_1"`
	FilterBoolean2  *bool      `json:"filter_boolean_2"`
	FilterBoolean3  *bool      `json:"filter_boolean_3"`
	FilterBoolean4  *bool      `json:"filter_boolean_4"`
	FilterBoolean5  *bool      `json:"filter_boolean_5"`
	FilterDate1     *time.Time `json:"filter_date_1"`
	FilterDate2     *time.Time `json:"filter_date_2"`
	FilterDate3     *time.Time `json:"filter_date_3"`
	FilterDate4     *time.Time `json:"filter_date_4"`
	FilterDate5     *time.Time `json:"filter_date_5"`
	
	Status     string    `json:"status"` // active, inactive, deleted
	VersionID  int       `json:"version_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ProductType methods

// Create creates a new product type
func (pt *ProductType) Create() error {
	query := `
		INSERT INTO product_types (name, description, metadata_schema, filter_config, is_active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`
	
	err := DB.QueryRow(context.Background(), query, pt.Name, pt.Description, pt.MetadataSchema, 
		pt.FilterConfig, pt.IsActive).
		Scan(&pt.ID, &pt.CreatedAt, &pt.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create product type: %w", err)
	}
	return nil
}

// Update updates a product type
func (pt *ProductType) Update() error {
	query := `
		UPDATE product_types 
		SET name = $2, description = $3, metadata_schema = $4, filter_config = $5, is_active = $6
		WHERE id = $1
		RETURNING updated_at`
	
	err := DB.QueryRow(context.Background(), query, pt.ID, pt.Name, pt.Description, pt.MetadataSchema,
		pt.FilterConfig, pt.IsActive).Scan(&pt.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update product type: %w", err)
	}
	return nil
}

// GetProductTypeByID retrieves a product type by ID
func GetProductTypeByID(id string) (*ProductType, error) {
	pt := &ProductType{}
	query := `
		SELECT id, name, description, metadata_schema, filter_config, is_active, created_at, updated_at
		FROM product_types 
		WHERE id = $1`
	
	err := DB.QueryRow(context.Background(), query, id).Scan(
		&pt.ID, &pt.Name, &pt.Description, &pt.MetadataSchema, 
		&pt.FilterConfig, &pt.IsActive, &pt.CreatedAt, &pt.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get product type: %w", err)
	}
	return pt, nil
}

// GetProductTypeByName retrieves a product type by name
func GetProductTypeByName(name string) (*ProductType, error) {
	pt := &ProductType{}
	query := `
		SELECT id, name, description, metadata_schema, filter_config, is_active, created_at, updated_at
		FROM product_types 
		WHERE name = $1 AND is_active = true`
	
	err := DB.QueryRow(context.Background(), query, name).Scan(
		&pt.ID, &pt.Name, &pt.Description, &pt.MetadataSchema, 
		&pt.FilterConfig, &pt.IsActive, &pt.CreatedAt, &pt.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get product type: %w", err)
	}
	return pt, nil
}

// GetAllProductTypes retrieves all active product types
func GetAllProductTypes() ([]ProductType, error) {
	query := `
		SELECT id, name, description, metadata_schema, filter_config, is_active, created_at, updated_at
		FROM product_types 
		WHERE is_active = true
		ORDER BY name`
	
	rows, err := DB.Query(context.Background(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to get product types: %w", err)
	}
	defer rows.Close()
	
	var types []ProductType
	for rows.Next() {
		var pt ProductType
		err := rows.Scan(
			&pt.ID, &pt.Name, &pt.Description, &pt.MetadataSchema, 
			&pt.FilterConfig, &pt.IsActive, &pt.CreatedAt, &pt.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan product type: %w", err)
		}
		types = append(types, pt)
	}
	
	return types, nil
}

// ProductSubType methods

// Create creates a new product sub-type
func (pst *ProductSubType) Create() error {
	query := `
		INSERT INTO product_sub_types (product_type_id, name, description, metadata_schema, filter_config, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at`
	
	err := DB.QueryRow(context.Background(), query, pst.ProductTypeID, pst.Name, pst.Description, 
		pst.MetadataSchema, pst.FilterConfig, pst.IsActive).
		Scan(&pst.ID, &pst.CreatedAt, &pst.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create product sub-type: %w", err)
	}
	return nil
}

// Update updates a product sub-type
func (pst *ProductSubType) Update() error {
	query := `
		UPDATE product_sub_types 
		SET name = $3, description = $4, metadata_schema = $5, filter_config = $6, is_active = $7
		WHERE id = $1 AND product_type_id = $2
		RETURNING updated_at`
	
	err := DB.QueryRow(context.Background(), query, pst.ID, pst.ProductTypeID, pst.Name, pst.Description,
		pst.MetadataSchema, pst.FilterConfig, pst.IsActive).Scan(&pst.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update product sub-type: %w", err)
	}
	return nil
}

// GetProductSubTypesByTypeID retrieves sub-types for a product type
func GetProductSubTypesByTypeID(productTypeID string) ([]ProductSubType, error) {
	query := `
		SELECT id, product_type_id, name, description, metadata_schema, filter_config, 
		       is_active, created_at, updated_at
		FROM product_sub_types 
		WHERE product_type_id = $1 AND is_active = true
		ORDER BY name`
	
	rows, err := DB.Query(context.Background(), query, productTypeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get product sub-types: %w", err)
	}
	defer rows.Close()
	
	var subTypes []ProductSubType
	for rows.Next() {
		var pst ProductSubType
		err := rows.Scan(
			&pst.ID, &pst.ProductTypeID, &pst.Name, &pst.Description, 
			&pst.MetadataSchema, &pst.FilterConfig, &pst.IsActive, 
			&pst.CreatedAt, &pst.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan product sub-type: %w", err)
		}
		subTypes = append(subTypes, pst)
	}
	
	return subTypes, nil
}

// Product methods

// Create creates a new product
func (p *Product) Create() error {
	query := `
		INSERT INTO products (seller_id, entity_id, name, description, price, currency, thumbnail_url, 
		                     photos, type, sub_type, metadata,
		                     filter_numeric_1, filter_numeric_2, filter_numeric_3, filter_numeric_4, filter_numeric_5,
		                     filter_text_1, filter_text_2, filter_text_3, filter_text_4, filter_text_5,
		                     filter_boolean_1, filter_boolean_2, filter_boolean_3, filter_boolean_4, filter_boolean_5,
		                     filter_date_1, filter_date_2, filter_date_3, filter_date_4, filter_date_5,
		                     status, version_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 
		        $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
		RETURNING id, created_at, updated_at`
	
	err := DB.QueryRow(context.Background(), query,
		p.SellerID, p.EntityID, p.Name, p.Description, p.Price, p.Currency, p.ThumbnailURL,
		p.Photos, p.Type, p.SubType, p.Metadata,
		p.FilterNumeric1, p.FilterNumeric2, p.FilterNumeric3, p.FilterNumeric4, p.FilterNumeric5,
		p.FilterText1, p.FilterText2, p.FilterText3, p.FilterText4, p.FilterText5,
		p.FilterBoolean1, p.FilterBoolean2, p.FilterBoolean3, p.FilterBoolean4, p.FilterBoolean5,
		p.FilterDate1, p.FilterDate2, p.FilterDate3, p.FilterDate4, p.FilterDate5,
		p.Status, p.VersionID).
		Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}
	return nil
}

// Update updates a product
func (p *Product) Update() error {
	query := `
		UPDATE products 
		SET entity_id = $2, name = $3, description = $4, price = $5, currency = $6, thumbnail_url = $7,
		    photos = $8, type = $9, sub_type = $10, metadata = $11,
		    filter_numeric_1 = $12, filter_numeric_2 = $13, filter_numeric_3 = $14, filter_numeric_4 = $15, filter_numeric_5 = $16,
		    filter_text_1 = $17, filter_text_2 = $18, filter_text_3 = $19, filter_text_4 = $20, filter_text_5 = $21,
		    filter_boolean_1 = $22, filter_boolean_2 = $23, filter_boolean_3 = $24, filter_boolean_4 = $25, filter_boolean_5 = $26,
		    filter_date_1 = $27, filter_date_2 = $28, filter_date_3 = $29, filter_date_4 = $30, filter_date_5 = $31,
		    status = $32, version_id = version_id + 1
		WHERE id = $1
		RETURNING updated_at, version_id`
	
	err := DB.QueryRow(context.Background(), query,
		p.ID, p.EntityID, p.Name, p.Description, p.Price, p.Currency, p.ThumbnailURL,
		p.Photos, p.Type, p.SubType, p.Metadata,
		p.FilterNumeric1, p.FilterNumeric2, p.FilterNumeric3, p.FilterNumeric4, p.FilterNumeric5,
		p.FilterText1, p.FilterText2, p.FilterText3, p.FilterText4, p.FilterText5,
		p.FilterBoolean1, p.FilterBoolean2, p.FilterBoolean3, p.FilterBoolean4, p.FilterBoolean5,
		p.FilterDate1, p.FilterDate2, p.FilterDate3, p.FilterDate4, p.FilterDate5,
		p.Status).
		Scan(&p.UpdatedAt, &p.VersionID)
	if err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}
	return nil
}

// GetProductByID retrieves a product by ID
func GetProductByID(id string) (*Product, error) {
	p := &Product{}
	query := `
		SELECT id, seller_id, entity_id, name, description, price, currency, thumbnail_url,
		       photos, type, sub_type, metadata, views_count, likes_count, sales_count,
		       filter_numeric_1, filter_numeric_2, filter_numeric_3, filter_numeric_4, filter_numeric_5,
		       filter_text_1, filter_text_2, filter_text_3, filter_text_4, filter_text_5,
		       filter_boolean_1, filter_boolean_2, filter_boolean_3, filter_boolean_4, filter_boolean_5,
		       filter_date_1, filter_date_2, filter_date_3, filter_date_4, filter_date_5,
		       status, version_id, created_at, updated_at
		FROM products 
		WHERE id = $1 AND status != 'deleted'`
	
	err := DB.QueryRow(context.Background(), query, id).Scan(
		&p.ID, &p.SellerID, &p.EntityID, &p.Name, &p.Description, &p.Price, &p.Currency, &p.ThumbnailURL,
		&p.Photos, &p.Type, &p.SubType, &p.Metadata, &p.ViewsCount, &p.LikesCount, &p.SalesCount,
		&p.FilterNumeric1, &p.FilterNumeric2, &p.FilterNumeric3, &p.FilterNumeric4, &p.FilterNumeric5,
		&p.FilterText1, &p.FilterText2, &p.FilterText3, &p.FilterText4, &p.FilterText5,
		&p.FilterBoolean1, &p.FilterBoolean2, &p.FilterBoolean3, &p.FilterBoolean4, &p.FilterBoolean5,
		&p.FilterDate1, &p.FilterDate2, &p.FilterDate3, &p.FilterDate4, &p.FilterDate5,
		&p.Status, &p.VersionID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get product: %w", err)
	}
	return p, nil
}

// GetProductsBySeller retrieves products for a specific seller
func GetProductsBySeller(sellerID string, limit, offset int) ([]Product, error) {
	query := `
		SELECT id, seller_id, entity_id, name, description, price, currency, thumbnail_url,
		       photos, type, sub_type, metadata, views_count, likes_count, sales_count,
		       filter_numeric_1, filter_numeric_2, filter_numeric_3, filter_numeric_4, filter_numeric_5,
		       filter_text_1, filter_text_2, filter_text_3, filter_text_4, filter_text_5,
		       filter_boolean_1, filter_boolean_2, filter_boolean_3, filter_boolean_4, filter_boolean_5,
		       filter_date_1, filter_date_2, filter_date_3, filter_date_4, filter_date_5,
		       status, version_id, created_at, updated_at
		FROM products 
		WHERE seller_id = $1 AND status != 'deleted'
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := DB.Query(context.Background(), query, sellerID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get products by seller: %w", err)
	}
	defer rows.Close()
	
	var products []Product
	for rows.Next() {
		var p Product
		err := rows.Scan(
			&p.ID, &p.SellerID, &p.EntityID, &p.Name, &p.Description, &p.Price, &p.Currency, &p.ThumbnailURL,
			&p.Photos, &p.Type, &p.SubType, &p.Metadata, &p.ViewsCount, &p.LikesCount, &p.SalesCount,
			&p.FilterNumeric1, &p.FilterNumeric2, &p.FilterNumeric3, &p.FilterNumeric4, &p.FilterNumeric5,
			&p.FilterText1, &p.FilterText2, &p.FilterText3, &p.FilterText4, &p.FilterText5,
			&p.FilterBoolean1, &p.FilterBoolean2, &p.FilterBoolean3, &p.FilterBoolean4, &p.FilterBoolean5,
			&p.FilterDate1, &p.FilterDate2, &p.FilterDate3, &p.FilterDate4, &p.FilterDate5,
			&p.Status, &p.VersionID, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, p)
	}
	
	return products, nil
}

// GetActiveProducts retrieves all active products
func GetActiveProducts(limit, offset int) ([]Product, error) {
	query := `
		SELECT id, seller_id, entity_id, name, description, price, currency, thumbnail_url,
		       photos, type, sub_type, metadata, views_count, likes_count, sales_count,
		       filter_numeric_1, filter_numeric_2, filter_numeric_3, filter_numeric_4, filter_numeric_5,
		       filter_text_1, filter_text_2, filter_text_3, filter_text_4, filter_text_5,
		       filter_boolean_1, filter_boolean_2, filter_boolean_3, filter_boolean_4, filter_boolean_5,
		       filter_date_1, filter_date_2, filter_date_3, filter_date_4, filter_date_5,
		       status, version_id, created_at, updated_at
		FROM products 
		WHERE status = 'active'
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`
	
	rows, err := DB.Query(context.Background(), query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get active products: %w", err)
	}
	defer rows.Close()
	
	var products []Product
	for rows.Next() {
		var p Product
		err := rows.Scan(
			&p.ID, &p.SellerID, &p.EntityID, &p.Name, &p.Description, &p.Price, &p.Currency, &p.ThumbnailURL,
			&p.Photos, &p.Type, &p.SubType, &p.Metadata, &p.ViewsCount, &p.LikesCount, &p.SalesCount,
			&p.FilterNumeric1, &p.FilterNumeric2, &p.FilterNumeric3, &p.FilterNumeric4, &p.FilterNumeric5,
			&p.FilterText1, &p.FilterText2, &p.FilterText3, &p.FilterText4, &p.FilterText5,
			&p.FilterBoolean1, &p.FilterBoolean2, &p.FilterBoolean3, &p.FilterBoolean4, &p.FilterBoolean5,
			&p.FilterDate1, &p.FilterDate2, &p.FilterDate3, &p.FilterDate4, &p.FilterDate5,
			&p.Status, &p.VersionID, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, p)
	}
	
	return products, nil
}

// IncrementViews increments the view count for a product
func (p *Product) IncrementViews() error {
	query := `UPDATE products SET views_count = views_count + 1 WHERE id = $1`
	_, err := DB.Exec(context.Background(), query, p.ID)
	if err != nil {
		return fmt.Errorf("failed to increment views: %w", err)
	}
	p.ViewsCount++
	return nil
}

// IncrementSales increments the sales count for a product
func (p *Product) IncrementSales() error {
	query := `UPDATE products SET sales_count = sales_count + 1 WHERE id = $1`
	_, err := DB.Exec(context.Background(), query, p.ID)
	if err != nil {
		return fmt.Errorf("failed to increment sales: %w", err)
	}
	p.SalesCount++
	return nil
}