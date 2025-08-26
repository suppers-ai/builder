package web

import (
    "net/http"
    "formulapricing/auth"
)

func DashboardLogs(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    // For now, just redirect to dashboard
    _ = email
    _ = role
    http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
}

func DashboardSettings(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    // For now, just redirect to dashboard
    _ = email
    _ = role
    http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
}