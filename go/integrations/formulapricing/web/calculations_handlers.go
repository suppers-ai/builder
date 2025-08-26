package web

import (
    "net/http"
    "formulapricing/auth"
    "formulapricing/models"
    "formulapricing/views/pages"
)

func CalculationsPage(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    // Get all calculations from database
    calculations, _ := models.GetAllCalculations()
    
    component := pages.CalculationsPage(pages.CalculationsPageData{
        UserEmail:    email,
        UserRole:     role,
        Calculations: calculations,
    })
    
    Render(w, r, component)
}