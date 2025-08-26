package web

import (
    "net/http"
    "formulapricing/auth"
    "formulapricing/models"
    "formulapricing/views/pages"
)

func VariablesPage(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    // Get all variables from database
    variables, _ := models.GetAllVariables()
    
    component := pages.VariablesPage(pages.VariablesPageData{
        UserEmail: email,
        UserRole:  role,
        Variables: variables,
    })
    
    Render(w, r, component)
}