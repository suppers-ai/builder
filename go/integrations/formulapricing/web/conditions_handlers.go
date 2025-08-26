package web

import (
    "net/http"
    "formulapricing/auth"
    "formulapricing/models"
    "formulapricing/views/pages"
)

func ConditionsPage(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    // Get all conditions from database
    conditions, _ := models.GetAllConditions()
    
    component := pages.ConditionsPage(pages.ConditionsPageData{
        UserEmail:  email,
        UserRole:   role,
        Conditions: conditions,
    })
    
    Render(w, r, component)
}