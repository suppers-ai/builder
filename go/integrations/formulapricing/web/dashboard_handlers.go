package web

import (
    "context"
    "net/http"
    "formulapricing/auth"
    "formulapricing/database"
    "formulapricing/views/pages"
)

func Dashboard(w http.ResponseWriter, r *http.Request) {
    // Prevent caching
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    w.Header().Set("Pragma", "no-cache")
    w.Header().Set("Expires", "0")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    // Get collection counts
    collections := getCollectionInfo()
    
    component := pages.DashboardPage(pages.DashboardData{
        UserEmail:   email,
        UserRole:    role,
        Collections: collections,
        ActiveTab:   "dashboard",
    })
    
    Render(w, r, component)
}

func getCollectionInfo() []pages.CollectionInfo {
    collections := []pages.CollectionInfo{}
    
    // Get counts from database
    var variableCount, calculationCount, conditionCount, pricingCount int
    
    ctx := context.Background()
    database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM formulapricing.variables").Scan(&variableCount)
    database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM formulapricing.calculations").Scan(&calculationCount)
    database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM formulapricing.conditions").Scan(&conditionCount)
    database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM formulapricing.pricing").Scan(&pricingCount)
    
    collections = append(collections,
        pages.CollectionInfo{Name: "Variables", Type: "Base Collection", Count: variableCount},
        pages.CollectionInfo{Name: "Calculations", Type: "Base Collection", Count: calculationCount},
        pages.CollectionInfo{Name: "Conditions", Type: "Base Collection", Count: conditionCount},
        pages.CollectionInfo{Name: "Pricing", Type: "Base Collection", Count: pricingCount},
    )
    
    return collections
}