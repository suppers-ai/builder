package web

import (
    "net/http"
    "formulapricing/auth"
    "formulapricing/views/pages"
)

func PurchasesPage(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    component := pages.PurchasesPage(pages.PurchasesPageData{
        UserEmail: email,
        UserRole:  role,
    })
    
    Render(w, r, component)
}