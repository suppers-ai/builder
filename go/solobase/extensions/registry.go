package extensions

import (
	"fmt"

	"github.com/suppers-ai/solobase/extensions/core"
	"github.com/suppers-ai/solobase/extensions/official/analytics"
	"github.com/suppers-ai/solobase/extensions/official/cloudstorage"
	"github.com/suppers-ai/solobase/extensions/official/hugo"
	"github.com/suppers-ai/solobase/extensions/official/products"
	"github.com/suppers-ai/solobase/extensions/official/webhooks"
)

// RegisterAllExtensions registers all discovered extensions with the registry
func RegisterAllExtensions(registry *core.ExtensionRegistry) error {
	fmt.Println("DEBUG: RegisterAllExtensions called")
	
	// Register Products extension
	fmt.Println("DEBUG: Registering Products extension")
	if err := registry.Register(products.NewProductsExtension()); err != nil {
		return fmt.Errorf("failed to register products extension: %w", err)
	}
	fmt.Println("DEBUG: Products extension registered successfully")

	// Register Hugo extension (now fixed and working)
	fmt.Println("DEBUG: Registering Hugo extension")
	if err := registry.Register(hugo.NewHugoExtension()); err != nil {
		return fmt.Errorf("failed to register hugo extension: %w", err)
	}
	fmt.Println("DEBUG: Hugo extension registered successfully")

	// Register Analytics extension
	fmt.Println("DEBUG: Registering Analytics extension")
	if err := registry.Register(analytics.NewAnalyticsExtension()); err != nil {
		return fmt.Errorf("failed to register analytics extension: %w", err)
	}
	fmt.Println("DEBUG: Analytics extension registered successfully")

	// Register Cloud Storage extension
	fmt.Println("DEBUG: Registering CloudStorage extension")
	if err := registry.Register(cloudstorage.NewCloudStorageExtension(nil)); err != nil {
		return fmt.Errorf("failed to register cloud storage extension: %w", err)
	}
	fmt.Println("DEBUG: CloudStorage extension registered successfully")

	// Register Webhooks extension
	fmt.Println("DEBUG: Registering Webhooks extension")
	if err := registry.Register(webhooks.NewWebhooksExtension()); err != nil {
		return fmt.Errorf("failed to register webhooks extension: %w", err)
	}
	fmt.Println("DEBUG: Webhooks extension registered successfully")
	
	fmt.Printf("DEBUG: Total extensions registered: %d\n", len(registry.GetAll()))
	for _, ext := range registry.GetAll() {
		fmt.Printf("DEBUG: Extension registered: %s\n", ext.Metadata().Name)
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
