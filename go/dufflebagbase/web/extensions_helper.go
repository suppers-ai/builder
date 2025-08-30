package web

import (
	"context"
	"strings"
	
	"github.com/suppers-ai/dufflebagbase/middleware"
	"github.com/suppers-ai/dufflebagbase/views/components"
)

// GetExtensionsForSidebar retrieves extensions from the registry and formats them for the sidebar
func GetExtensionsForSidebar(ctx context.Context) []components.ExtensionItem {
	registry := middleware.GetExtensionRegistry(ctx)
	if registry == nil {
		return []components.ExtensionItem{}
	}
	
	extensions := registry.List()
	items := make([]components.ExtensionItem, 0, len(extensions))
	
	for _, metadata := range extensions {
		// Check if enabled
		status, _ := registry.GetStatus(metadata.Name)
		enabled := status != nil && status.Enabled
		
		// Only show enabled extensions in sidebar
		if !enabled {
			continue
		}
		
		items = append(items, components.ExtensionItem{
			ID:      metadata.Name,
			Name:    formatExtensionName(metadata.Name),
			Icon:    getIconForExtension(metadata.Name),
			Enabled: enabled,
			Path:    "/ext/" + metadata.Name + "/dashboard",
		})
	}
	
	return items
}

// formatExtensionName formats the extension name for display
func formatExtensionName(id string) string {
	// Remove prefix if present
	name := id
	if strings.HasPrefix(name, "official/") {
		name = strings.TrimPrefix(name, "official/")
	} else if strings.HasPrefix(name, "community/") {
		name = strings.TrimPrefix(name, "community/")
	}
	
	// Convert to title case
	parts := strings.Split(name, "-")
	for i, part := range parts {
		if len(part) > 0 {
			parts[i] = strings.ToUpper(part[:1]) + part[1:]
		}
	}
	
	return strings.Join(parts, " ")
}