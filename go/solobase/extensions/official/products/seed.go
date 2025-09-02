package products

import (
	"github.com/suppers-ai/solobase/extensions/official/products/models"
	"gorm.io/gorm"
)

// SeedData seeds initial data for the products extension
func SeedData(db *gorm.DB) error {
	// Check if data already exists
	var count int64
	db.Model(&models.Variable{}).Count(&count)
	if count > 0 {
		return nil // Data already seeded
	}
	
	// Seed system variables
	systemVariables := []models.Variable{
		// Product variables
		{Name: "quantity", DisplayName: "Quantity", Type: "number", Source: "user_input", Category: "Product", DefaultValue: 1.0, Description: "Number of items"},
		{Name: "weight", DisplayName: "Weight (kg)", Type: "number", Source: "product", Category: "Product", DefaultValue: 0.0, Description: "Product weight in kilograms"},
		{Name: "volume", DisplayName: "Volume (L)", Type: "number", Source: "product", Category: "Product", DefaultValue: 0.0, Description: "Product volume in liters"},
		{Name: "dimensions_length", DisplayName: "Length (cm)", Type: "number", Source: "product", Category: "Product", DefaultValue: 0.0, Description: "Product length"},
		{Name: "dimensions_width", DisplayName: "Width (cm)", Type: "number", Source: "product", Category: "Product", DefaultValue: 0.0, Description: "Product width"},
		{Name: "dimensions_height", DisplayName: "Height (cm)", Type: "number", Source: "product", Category: "Product", DefaultValue: 0.0, Description: "Product height"},
		
		// Order variables
		{Name: "order_total", DisplayName: "Order Total", Type: "number", Source: "calculated", Category: "Order", DefaultValue: 0.0, Description: "Total order value before discounts"},
		{Name: "order_item_count", DisplayName: "Item Count", Type: "number", Source: "calculated", Category: "Order", DefaultValue: 0.0, Description: "Number of different items in order"},
		{Name: "order_quantity_total", DisplayName: "Total Quantity", Type: "number", Source: "calculated", Category: "Order", DefaultValue: 0.0, Description: "Total quantity of all items"},
		
		// Shipping variables
		{Name: "shipping_distance", DisplayName: "Shipping Distance (km)", Type: "number", Source: "calculated", Category: "Shipping", DefaultValue: 0.0, Description: "Distance to shipping destination"},
		{Name: "shipping_method", DisplayName: "Shipping Method", Type: "string", Source: "user_input", Category: "Shipping", DefaultValue: "standard", Description: "Selected shipping method"},
		{Name: "shipping_zone", DisplayName: "Shipping Zone", Type: "string", Source: "calculated", Category: "Shipping", DefaultValue: "local", Description: "Shipping zone based on destination"},
		{Name: "shipping_rate_per_kg", DisplayName: "Rate per kg", Type: "number", Source: "system", Category: "Shipping", DefaultValue: 4.99, Description: "Shipping rate per kilogram"},
		{Name: "express_shipping", DisplayName: "Express Shipping", Type: "boolean", Source: "user_input", Category: "Shipping", DefaultValue: false, Description: "Whether express shipping is selected"},
		{Name: "express_shipping_surcharge", DisplayName: "Express Surcharge", Type: "number", Source: "system", Category: "Shipping", DefaultValue: 20.0, Description: "Additional charge for express shipping"},
		
		// Promotion variables
		{Name: "discount_percentage", DisplayName: "Discount %", Type: "number", Source: "system", Category: "Promotion", DefaultValue: 0.0, Description: "Discount percentage"},
		{Name: "discount_amount", DisplayName: "Discount Amount", Type: "number", Source: "system", Category: "Promotion", DefaultValue: 0.0, Description: "Fixed discount amount"},
		{Name: "promo_code", DisplayName: "Promo Code", Type: "string", Source: "user_input", Category: "Promotion", DefaultValue: "", Description: "Applied promotional code"},
		{Name: "bulk_discount_threshold", DisplayName: "Bulk Threshold", Type: "number", Source: "system", Category: "Promotion", DefaultValue: 10.0, Description: "Minimum quantity for bulk discount"},
		{Name: "bulk_discount_rate", DisplayName: "Bulk Discount Rate", Type: "number", Source: "system", Category: "Promotion", DefaultValue: 0.1, Description: "Discount rate for bulk purchases"},
		
		// Location variables
		{Name: "tax_rate", DisplayName: "Tax Rate", Type: "number", Source: "system", Category: "Location", DefaultValue: 0.08, Description: "Local tax rate"},
		{Name: "currency", DisplayName: "Currency", Type: "string", Source: "system", Category: "Location", DefaultValue: "USD", Description: "Transaction currency"},
		{Name: "country", DisplayName: "Country", Type: "string", Source: "user_input", Category: "Location", DefaultValue: "US", Description: "Destination country"},
		{Name: "state", DisplayName: "State/Province", Type: "string", Source: "user_input", Category: "Location", DefaultValue: "", Description: "Destination state or province"},
		{Name: "city", DisplayName: "City", Type: "string", Source: "user_input", Category: "Location", DefaultValue: "", Description: "Destination city"},
		{Name: "postal_code", DisplayName: "Postal Code", Type: "string", Source: "user_input", Category: "Location", DefaultValue: "", Description: "Destination postal code"},
		
		// Service variables
		{Name: "urgency", DisplayName: "Urgency Level", Type: "string", Source: "user_input", Category: "Service", DefaultValue: "normal", Description: "Service urgency level"},
		{Name: "complexity", DisplayName: "Complexity", Type: "number", Source: "user_input", Category: "Service", DefaultValue: 1.0, Description: "Service complexity (1-5 scale)"},
		{Name: "hourly_rate", DisplayName: "Hourly Rate", Type: "number", Source: "entity", Category: "Service", DefaultValue: 100.0, Description: "Base hourly rate for services"},
		{Name: "hours", DisplayName: "Hours", Type: "number", Source: "user_input", Category: "Service", DefaultValue: 1.0, Description: "Number of service hours"},
		{Name: "service_level", DisplayName: "Service Level", Type: "string", Source: "user_input", Category: "Service", DefaultValue: "standard", Description: "Selected service level"},
		
		// System variables
		{Name: "base_price", DisplayName: "Base Price", Type: "number", Source: "product", Category: "System", DefaultValue: 0.0, Description: "Base product price"},
		{Name: "cost", DisplayName: "Cost", Type: "number", Source: "product", Category: "System", DefaultValue: 0.0, Description: "Product cost"},
		{Name: "margin", DisplayName: "Margin", Type: "number", Source: "system", Category: "System", DefaultValue: 0.3, Description: "Default profit margin"},
		{Name: "running_total", DisplayName: "Running Total", Type: "number", Source: "calculated", Category: "System", DefaultValue: 0.0, Description: "Running total during price calculation"},
		{Name: "subtotal", DisplayName: "Subtotal", Type: "number", Source: "calculated", Category: "System", DefaultValue: 0.0, Description: "Subtotal before taxes and fees"},
		{Name: "total_discount", DisplayName: "Total Discount", Type: "number", Source: "calculated", Category: "System", DefaultValue: 0.0, Description: "Total discount amount applied"},
		{Name: "total_tax", DisplayName: "Total Tax", Type: "number", Source: "calculated", Category: "System", DefaultValue: 0.0, Description: "Total tax amount"},
		{Name: "total_fees", DisplayName: "Total Fees", Type: "number", Source: "calculated", Category: "System", DefaultValue: 0.0, Description: "Total fees amount"},
		{Name: "final_price", DisplayName: "Final Price", Type: "number", Source: "calculated", Category: "System", DefaultValue: 0.0, Description: "Final calculated price"},
		{Name: "calculation_date", DisplayName: "Calculation Date", Type: "date", Source: "system", Category: "System", DefaultValue: "now", Description: "Date of price calculation"},
		{Name: "is_taxable", DisplayName: "Is Taxable", Type: "boolean", Source: "product", Category: "System", DefaultValue: true, Description: "Whether product is taxable"},
		{Name: "tax_exempt", DisplayName: "Tax Exempt", Type: "boolean", Source: "user_input", Category: "System", DefaultValue: false, Description: "Whether customer is tax exempt"},
		
		// Time-based variables
		{Name: "current_hour", DisplayName: "Current Hour", Type: "number", Source: "system", Category: "Time", DefaultValue: 12, Description: "Current hour (0-23)"},
		{Name: "current_day_of_week", DisplayName: "Day of Week", Type: "number", Source: "system", Category: "Time", DefaultValue: 1, Description: "Current day of week (1-7)"},
		{Name: "current_month", DisplayName: "Current Month", Type: "number", Source: "system", Category: "Time", DefaultValue: 1, Description: "Current month (1-12)"},
		{Name: "is_weekend", DisplayName: "Is Weekend", Type: "boolean", Source: "calculated", Category: "Time", DefaultValue: false, Description: "Whether it's weekend"},
		{Name: "is_holiday", DisplayName: "Is Holiday", Type: "boolean", Source: "system", Category: "Time", DefaultValue: false, Description: "Whether it's a holiday"},
		{Name: "is_peak_time", DisplayName: "Is Peak Time", Type: "boolean", Source: "calculated", Category: "Time", DefaultValue: false, Description: "Whether it's peak hours"},
		{Name: "days_until_delivery", DisplayName: "Days Until Delivery", Type: "number", Source: "calculated", Category: "Time", DefaultValue: 0, Description: "Number of days until delivery"},
		{Name: "lead_time", DisplayName: "Lead Time", Type: "number", Source: "product", Category: "Time", DefaultValue: 1, Description: "Product lead time in days"},
		
		// Customer variables
		{Name: "customer_type", DisplayName: "Customer Type", Type: "string", Source: "user_input", Category: "Customer", DefaultValue: "regular", Description: "Type of customer"},
		{Name: "is_member", DisplayName: "Is Member", Type: "boolean", Source: "user_input", Category: "Customer", DefaultValue: false, Description: "Whether customer is a member"},
		{Name: "is_premium_member", DisplayName: "Is Premium Member", Type: "boolean", Source: "user_input", Category: "Customer", DefaultValue: false, Description: "Whether customer is a premium member"},
		{Name: "customer_loyalty_points", DisplayName: "Loyalty Points", Type: "number", Source: "user_input", Category: "Customer", DefaultValue: 0, Description: "Customer's loyalty points"},
		{Name: "customer_lifetime_value", DisplayName: "Customer LTV", Type: "number", Source: "calculated", Category: "Customer", DefaultValue: 0, Description: "Customer lifetime value"},
		{Name: "is_first_purchase", DisplayName: "First Purchase", Type: "boolean", Source: "calculated", Category: "Customer", DefaultValue: false, Description: "Whether this is customer's first purchase"},
		{Name: "referral_code", DisplayName: "Referral Code", Type: "string", Source: "user_input", Category: "Customer", DefaultValue: "", Description: "Referral code used"},
		
		// Inventory variables
		{Name: "stock_level", DisplayName: "Stock Level", Type: "number", Source: "product", Category: "Inventory", DefaultValue: 100, Description: "Current stock level"},
		{Name: "low_stock_threshold", DisplayName: "Low Stock Threshold", Type: "number", Source: "system", Category: "Inventory", DefaultValue: 10, Description: "Low stock alert threshold"},
		{Name: "is_low_stock", DisplayName: "Is Low Stock", Type: "boolean", Source: "calculated", Category: "Inventory", DefaultValue: false, Description: "Whether stock is low"},
		{Name: "backorder_allowed", DisplayName: "Backorder Allowed", Type: "boolean", Source: "product", Category: "Inventory", DefaultValue: false, Description: "Whether backorders are allowed"},
		{Name: "reserved_quantity", DisplayName: "Reserved Quantity", Type: "number", Source: "calculated", Category: "Inventory", DefaultValue: 0, Description: "Quantity reserved in other orders"},
		
		// Fee variables
		{Name: "processing_fee", DisplayName: "Processing Fee", Type: "number", Source: "system", Category: "Fees", DefaultValue: 2.99, Description: "Payment processing fee"},
		{Name: "handling_fee", DisplayName: "Handling Fee", Type: "number", Source: "system", Category: "Fees", DefaultValue: 0.0, Description: "Order handling fee"},
		{Name: "rush_fee", DisplayName: "Rush Fee", Type: "number", Source: "system", Category: "Fees", DefaultValue: 25.0, Description: "Rush order fee"},
		{Name: "cancellation_fee", DisplayName: "Cancellation Fee", Type: "number", Source: "system", Category: "Fees", DefaultValue: 10.0, Description: "Order cancellation fee"},
		{Name: "restocking_fee", DisplayName: "Restocking Fee", Type: "number", Source: "system", Category: "Fees", DefaultValue: 0.15, Description: "Restocking fee percentage"},
	}
	
	for _, v := range systemVariables {
		if err := db.Create(&v).Error; err != nil {
			return err
		}
	}
	
	// Seed entity types
	entityTypes := []models.EntityType{
		{
			Name:        "restaurant",
			DisplayName: "Restaurant",
			Description: "Food service establishment",
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"cuisine_type":    map[string]string{"type": "string"},
					"seating_capacity": map[string]string{"type": "number"},
					"delivery_radius": map[string]string{"type": "number"},
					"operating_hours": map[string]string{"type": "string"},
				},
			},
		},
		{
			Name:        "retail_store",
			DisplayName: "Retail Store",
			Description: "Physical or online retail business",
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"store_type":      map[string]string{"type": "string"},
					"location":        map[string]string{"type": "string"},
					"inventory_size":  map[string]string{"type": "number"},
					"shipping_zones":  map[string]string{"type": "array"},
				},
			},
		},
		{
			Name:        "service_provider",
			DisplayName: "Service Provider",
			Description: "Professional or technical services",
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"service_type":    map[string]string{"type": "string"},
					"certification":   map[string]string{"type": "string"},
					"service_area":    map[string]string{"type": "string"},
					"team_size":       map[string]string{"type": "number"},
				},
			},
		},
		{
			Name:        "subscription_service",
			DisplayName: "Subscription Service",
			Description: "Recurring subscription-based business",
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"billing_cycle":   map[string]string{"type": "string"},
					"trial_period":    map[string]string{"type": "number"},
					"auto_renewal":    map[string]string{"type": "boolean"},
				},
			},
		},
	}
	
	for _, et := range entityTypes {
		if err := db.Create(&et).Error; err != nil {
			return err
		}
	}
	
	// Seed product types
	productTypes := []models.ProductType{
		{
			Name:        "physical_product",
			DisplayName: "Physical Product",
			Description: "Tangible goods that require shipping",
			Category:    "physical",
			Icon:        "package",
			PricingModel: "fixed",
			BaseFormula: "base_price * quantity * (1 - discount_percentage / 100) + (weight * shipping_rate_per_kg) + (express_shipping ? express_shipping_surcharge : 0)",
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"sku":           map[string]string{"type": "string"},
					"barcode":       map[string]string{"type": "string"},
					"manufacturer":  map[string]string{"type": "string"},
					"warranty":      map[string]string{"type": "string"},
				},
			},
			DefaultVariables: models.JSONB{
				"shipping_rate_per_kg": 5.0,
				"express_shipping_surcharge": 15.0,
			},
			IsActive: true,
		},
		{
			Name:        "digital_product",
			DisplayName: "Digital Product",
			Description: "Downloadable or online products",
			Category:    "digital",
			Icon:        "download",
			PricingModel: "fixed",
			BaseFormula: "base_price * quantity * (1 - discount_percentage / 100)",
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"file_size":     map[string]string{"type": "number"},
					"format":        map[string]string{"type": "string"},
					"license_type":  map[string]string{"type": "string"},
				},
			},
			DefaultVariables: models.JSONB{
				"discount_percentage": 0,
			},
			IsActive: true,
		},
		{
			Name:        "service",
			DisplayName: "Service",
			Description: "Time-based or project-based services",
			Category:    "service",
			Icon:        "briefcase",
			PricingModel: "dynamic",
			BaseFormula: "hourly_rate * hours * (urgency == 'emergency' ? 2.0 : urgency == 'urgent' ? 1.5 : 1.0) * (1 + complexity * 0.1)",
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"duration":      map[string]string{"type": "number"},
					"location":      map[string]string{"type": "string"},
					"requirements":  map[string]string{"type": "string"},
				},
			},
			DefaultVariables: models.JSONB{
				"hourly_rate": 50.0,
				"complexity": 1.0,
			},
			IsActive: true,
		},
		{
			Name:        "subscription",
			DisplayName: "Subscription",
			Description: "Recurring subscription products",
			Category:    "subscription",
			Icon:        "calendar",
			PricingModel: "tiered",
			BaseFormula: "base_price * (billing_cycle == 'annual' ? 10 : billing_cycle == 'quarterly' ? 2.7 : 1)",
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"billing_cycle": map[string]string{"type": "string"},
					"features":      map[string]string{"type": "array"},
					"user_limit":    map[string]string{"type": "number"},
				},
			},
			DefaultVariables: models.JSONB{
				"billing_cycle": "monthly",
			},
			IsActive: true,
		},
		{
			Name:        "bundle",
			DisplayName: "Product Bundle",
			Description: "Collection of multiple products",
			Category:    "physical",
			Icon:        "box",
			PricingModel: "fixed",
			BaseFormula: "base_price * quantity * 0.9", // 10% bundle discount
			Schema: models.JSONB{
				"type": "object",
				"properties": map[string]interface{}{
					"included_items": map[string]string{"type": "array"},
					"savings":        map[string]string{"type": "number"},
				},
			},
			DefaultVariables: models.JSONB{
				"bundle_discount": 10,
			},
			IsActive: true,
		},
	}
	
	for _, pt := range productTypes {
		if err := db.Create(&pt).Error; err != nil {
			return err
		}
	}
	
	// Seed pricing templates
	pricingTemplates := []models.PricingTemplate{
		{
			Name:        "volume_discount",
			DisplayName: "Volume Discount",
			Description: "Quantity-based tiered pricing",
			Category:    "discount",
			Formula:     "base_price * quantity * (quantity >= 100 ? 0.7 : quantity >= 50 ? 0.8 : quantity >= 10 ? 0.9 : 1.0)",
			Variables: models.JSONB{
				"required": []string{"base_price", "quantity"},
			},
		},
		{
			Name:        "progressive_calculation",
			DisplayName: "Progressive Calculation",
			Description: "Step-by-step price calculation with running total",
			Category:    "complex",
			Formula:     "((running_total = base_price * quantity) + (running_total * tax_rate * (tax_exempt ? 0 : 1)) + processing_fee + (express_shipping ? express_shipping_surcharge : 0))",
			Variables: models.JSONB{
				"required": []string{"base_price", "quantity", "running_total", "tax_rate", "tax_exempt", "processing_fee"},
			},
		},
		{
			Name:        "time_based_pricing",
			DisplayName: "Time-based Pricing",
			Description: "Different prices based on time of day or day of week",
			Category:    "dynamic",
			Formula:     "base_price * (is_peak_time ? 1.5 : is_weekend ? 1.2 : 1.0)",
			Variables: models.JSONB{
				"required": []string{"base_price", "is_peak_time", "is_weekend"},
			},
		},
		{
			Name:        "zone_based_shipping",
			DisplayName: "Zone-based Shipping",
			Description: "Shipping costs based on delivery zones",
			Category:    "shipping",
			Formula:     "weight * (shipping_zone == 'international' ? 15.99 : shipping_zone == 'national' ? 7.99 : 3.99)",
			Variables: models.JSONB{
				"required": []string{"weight", "shipping_zone"},
			},
		},
		{
			Name:        "membership_discount",
			DisplayName: "Membership Discount",
			Description: "Special pricing for members",
			Category:    "membership",
			Formula:     "base_price * (is_premium_member ? 0.75 : is_member ? 0.9 : 1.0)",
			Variables: models.JSONB{
				"required": []string{"base_price", "is_member", "is_premium_member"},
			},
		},
		{
			Name:        "cost_plus_margin",
			DisplayName: "Cost Plus Margin",
			Description: "Simple cost plus margin pricing",
			Category:    "standard",
			Formula:     "cost * (1 + margin)",
			Variables: models.JSONB{
				"required": []string{"cost", "margin"},
			},
		},
		{
			Name:        "bundle_pricing",
			DisplayName: "Bundle Pricing",
			Description: "Discounted pricing for product bundles",
			Category:    "bundle",
			Formula:     "(item1_price + item2_price + item3_price) * bundle_discount_rate",
			Variables: models.JSONB{
				"required": []string{"item1_price", "item2_price", "item3_price", "bundle_discount_rate"},
			},
		},
		{
			Name:        "surge_pricing",
			DisplayName: "Surge Pricing",
			Description: "Dynamic pricing based on demand",
			Category:    "dynamic",
			Formula:     "base_price * demand_multiplier * (1 + (current_utilization / 100))",
			Variables: models.JSONB{
				"required": []string{"base_price", "demand_multiplier", "current_utilization"},
			},
		},
		{
			Name:        "subscription_tiers",
			DisplayName: "Subscription Tiers",
			Description: "Tiered subscription pricing",
			Category:    "subscription",
			Formula:     "seats * (seats > 100 ? 8 : seats > 20 ? 10 : seats > 5 ? 12 : 15) * (billing_cycle == 'annual' ? 10 : 1)",
			Variables: models.JSONB{
				"required": []string{"seats", "billing_cycle"},
			},
		},
		{
			Name:        "complete_pricing",
			DisplayName: "Complete Pricing with All Factors",
			Description: "Comprehensive pricing including all discounts, taxes, and fees",
			Category:    "complete",
			Formula:     "((subtotal = base_price * quantity) - (total_discount = subtotal * (discount_percentage / 100 + (is_member ? 0.1 : 0) + (is_first_purchase ? 0.15 : 0))) + (total_tax = (subtotal - total_discount) * tax_rate * (tax_exempt ? 0 : 1)) + (total_fees = processing_fee + handling_fee + (express_shipping ? rush_fee : 0)))",
			Variables: models.JSONB{
				"required": []string{"base_price", "quantity", "subtotal", "total_discount", "total_tax", "total_fees", "tax_rate"},
			},
		},
		{
			Name:        "dynamic_markup",
			DisplayName: "Dynamic Markup Based on Inventory",
			Description: "Adjust pricing based on stock levels and demand",
			Category:    "dynamic",
			Formula:     "base_price * (1 + margin) * (is_low_stock ? 1.2 : 1.0) * (is_peak_time ? 1.15 : 1.0) * quantity",
			Variables: models.JSONB{
				"required": []string{"base_price", "margin", "is_low_stock", "is_peak_time", "quantity"},
			},
		},
		{
			Name:        "loyalty_rewards",
			DisplayName: "Loyalty Rewards Pricing",
			Description: "Price calculation with loyalty points redemption",
			Category:    "loyalty",
			Formula:     "max(0, (base_price * quantity * (1 - discount_percentage / 100)) - (customer_loyalty_points * 0.01))",
			Variables: models.JSONB{
				"required": []string{"base_price", "quantity", "discount_percentage", "customer_loyalty_points"},
			},
		},
	}
	
	for _, pt := range pricingTemplates {
		if err := db.Create(&pt).Error; err != nil {
			return err
		}
	}
	
	return nil
}