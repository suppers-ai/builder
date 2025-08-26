package web

import (
    "net/http"
    "formulapricing/auth"
    "formulapricing/models"
    "formulapricing/views/pages"
)

func PricingPage(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    // Get all pricing from database
    pricing, _ := models.GetAllPricing()
    
    component := pages.PricingPage(pages.PricingPageData{
        UserEmail: email,
        UserRole:  role,
        Pricing:   pricing,
    })
    
    Render(w, r, component)
}