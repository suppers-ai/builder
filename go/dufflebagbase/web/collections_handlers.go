package web

import (
    "context"
    "net/http"

    "github.com/suppers-ai/dufflebagbase/services"
    "github.com/suppers-ai/dufflebagbase/views/pages"
)

// CollectionsPage renders the collections page
func CollectionsPage(svc *services.Service) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Get authboss session store
        store := svc.Auth().SessionStore()
        session, _ := store.Get(r, "dufflebag-session")
        userEmail, _ := session.Values["user_email"].(string)
        
        ctx := context.Background()
        
        // Get all collections
        collections, err := svc.Collections().ListCollectionInfo(ctx)
        if err != nil {
            collections = []services.CollectionInfo{}
        }
        
        data := pages.CollectionsPageData{
            UserEmail:   userEmail,
            Collections: collections,
        }
        
        component := pages.CollectionsPage(data)
        Render(w, r, component)
    }
}