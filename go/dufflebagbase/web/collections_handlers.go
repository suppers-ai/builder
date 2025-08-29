package web

import (
    "net/http"

    "github.com/suppers-ai/dufflebagbase/services"
    "github.com/suppers-ai/dufflebagbase/views/pages"
)

// CollectionsPage renders the collections page
func CollectionsPage(svc *services.Service) http.HandlerFunc {
    h := NewBaseHandler(svc)
    return func(w http.ResponseWriter, r *http.Request) {
        userEmail, _ := h.GetUserEmail(r)
        ctx := h.NewContext()
        
        // Get all collections
        collections, err := svc.Collections().ListCollectionInfo(ctx)
        if err != nil {
            collections = []services.CollectionInfo{}
        }
        
        data := pages.CollectionsPageData{
            UserEmail:   userEmail,
            Collections: collections,
        }
        
        h.RenderWithHTMX(w, r, pages.CollectionsPage(data), pages.CollectionsPartial(data))
    }
}