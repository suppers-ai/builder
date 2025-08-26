package web

import (
    "net/http"
    "formulapricing/auth"
    "formulapricing/models"
    "formulapricing/views/pages"
)

func UsersPage(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    // Only admin can view users page
    if role != "admin" {
        http.Error(w, "Unauthorized", http.StatusForbidden)
        return
    }
    
    // Get all users from database
    users, _ := models.GetAllUsers()
    
    component := pages.UsersPage(pages.UsersPageData{
        UserEmail: email,
        UserRole:  role,
        Users:     users,
    })
    
    Render(w, r, component)
}