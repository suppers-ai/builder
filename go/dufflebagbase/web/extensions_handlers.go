package web

import (
    "encoding/json"
    "net/http"
    "strings"

    "github.com/suppers-ai/dufflebagbase/extensions/core"
    "github.com/suppers-ai/dufflebagbase/views/pages"
)

type ExtensionsHandlers struct {
    registry *core.ExtensionRegistry
}

func NewExtensionsHandlers(registry *core.ExtensionRegistry) *ExtensionsHandlers {
    return &ExtensionsHandlers{
        registry: registry,
    }
}

func (h *ExtensionsHandlers) ExtensionsPage(w http.ResponseWriter, r *http.Request) {
    // Get all registered extensions
    extensions := h.registry.List()
    
    // Convert to view model
    var extensionInfos []pages.ExtensionInfo
    for _, metadata := range extensions {
        category := "community"
        if strings.HasPrefix(metadata.Name, "official/") {
            category = "official"
        }
        
        // Check if enabled
        status, _ := h.registry.GetStatus(metadata.Name)
        enabled := status != nil && status.Enabled
        
        extensionInfos = append(extensionInfos, pages.ExtensionInfo{
            ID:          metadata.Name,
            Name:        metadata.Name,
            Description: metadata.Description,
            Version:     metadata.Version,
            Author:      metadata.Author,
            Enabled:     enabled,
            Category:    category,
            Icon:        getIconForExtension(metadata.Name),
        })
    }
    
    data := pages.ExtensionsPageData{
        Extensions: extensionInfos,
    }
    
    // Render the page
    component := pages.ExtensionsPage(data)
    if err := Render(w, r, component); err != nil {
        http.Error(w, "Failed to render page", http.StatusInternalServerError)
    }
}

func (h *ExtensionsHandlers) ToggleExtension(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    
    var req struct {
        ExtensionID string `json:"extension_id"`
        Enabled     bool   `json:"enabled"`
    }
    
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    if req.Enabled {
        if err := h.registry.Enable(req.ExtensionID); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    } else {
        if err := h.registry.Disable(req.ExtensionID); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    }
    
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *ExtensionsHandlers) GetExtensionConfig(w http.ResponseWriter, r *http.Request) {
    extensionID := r.URL.Query().Get("id")
    if extensionID == "" {
        http.Error(w, "Extension ID required", http.StatusBadRequest)
        return
    }
    
    _, exists := h.registry.Get(extensionID)
    if !exists {
        http.Error(w, "Extension not found", http.StatusNotFound)
        return
    }
    
    // TODO: Implement config retrieval when extensions support it
    config := map[string]interface{}{}
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(config)
}

func (h *ExtensionsHandlers) SaveExtensionConfig(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    
    extensionID := r.URL.Query().Get("id")
    if extensionID == "" {
        http.Error(w, "Extension ID required", http.StatusBadRequest)
        return
    }
    
    _, exists := h.registry.Get(extensionID)
    if !exists {
        http.Error(w, "Extension not found", http.StatusNotFound)
        return
    }
    
    var config map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
        http.Error(w, "Invalid config", http.StatusBadRequest)
        return
    }
    
    // TODO: Implement config saving when extensions support it
    // For now, just return success
    
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func getIconForExtension(id string) string {
    // Map extension IDs to appropriate icons
    iconMap := map[string]string{
        "webhooks":  "webhook",
        "analytics": "bar-chart-2",
        "auth":      "shield",
        "storage":   "hard-drive",
        "email":     "mail",
        "payment":   "credit-card",
    }
    
    // Check if full ID matches
    if icon, ok := iconMap[id]; ok {
        return icon
    }
    
    // Check if ID contains known keywords
    for key, icon := range iconMap {
        if strings.Contains(strings.ToLower(id), key) {
            return icon
        }
    }
    
    return "puzzle"
}