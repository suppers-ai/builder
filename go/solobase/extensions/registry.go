package extensions

import (
	"fmt"
	"github.com/suppers-ai/solobase/extensions/core"
	"github.com/suppers-ai/solobase/extensions/official/analytics"
	"github.com/suppers-ai/solobase/extensions/official/cloudstorage"
	"github.com/suppers-ai/solobase/extensions/official/hugo"
	"github.com/suppers-ai/solobase/extensions/official/products"
	"github.com/suppers-ai/solobase/extensions/official/webhooks"
	"gorm.io/gorm"
)

// RegisterAllExtensions registers all discovered extensions with the registry
func RegisterAllExtensions(registry *core.ExtensionRegistry, db *gorm.DB) error {
	// Register Products extension with database
	productsExt := products.NewProductsExtensionWithDB(db)
	if err := registry.Register(productsExt); err != nil {
		return fmt.Errorf("failed to register products extension: %w", err)
	}
	// Set the database to trigger migrations
	productsExt.SetDatabase(db)

	// Register Hugo extension
	if err := registry.Register(hugo.NewHugoExtension()); err != nil {
		return fmt.Errorf("failed to register hugo extension: %w", err)
	}

	// Register Analytics extension
	if err := registry.Register(analytics.NewAnalyticsExtension()); err != nil {
		return fmt.Errorf("failed to register analytics extension: %w", err)
	}

	// Register Cloud Storage extension
	if err := registry.Register(cloudstorage.NewCloudStorageExtension(nil)); err != nil {
		return fmt.Errorf("failed to register cloud storage extension: %w", err)
	}

	// Register Webhooks extension
	if err := registry.Register(webhooks.NewWebhooksExtension()); err != nil {
		return fmt.Errorf("failed to register webhooks extension: %w", err)
	}

	return nil
}

// GetAvailableExtensions returns a list of all available extensions
func GetAvailableExtensions() []string {
	return []string{
		"products",
		"hugo",
		"analytics",
		"cloudstorage",
		"webhooks",
	}
}
