package web

import (
    "context"
    "net/http"

    "github.com/suppers-ai/dufflebagbase/services"
    "github.com/suppers-ai/dufflebagbase/views/pages"
)

// DashboardPage renders the dashboard
func DashboardPage(svc *services.Service) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Get authboss session store
        store := svc.Auth().SessionStore()
        session, _ := store.Get(r, "dufflebag-session")
        userEmail, _ := session.Values["user_email"].(string)
        
        ctx := context.Background()
        
        // Get collections
        collections, err := svc.Collections().ListCollectionInfo(ctx)
        if err != nil {
            collections = []services.CollectionInfo{}
        }
        
        // Calculate stats
        totalRecords := 0
        for _, col := range collections {
            totalRecords += col.RecordCount
        }
        
        data := pages.DashboardData{
            UserEmail:   userEmail,
            Collections: collections,
            Stats: pages.DashboardStats{
                TotalCollections: len(collections),
                TotalRecords:     totalRecords,
                APIRequests:      0, // TODO: Implement API request tracking
            },
        }
        
        component := pages.DashboardPage(data)
        Render(w, r, component)
    }
}