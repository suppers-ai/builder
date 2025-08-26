package web

import (
    "net/http"
    "formulapricing/auth"
    "formulapricing/models"
    "formulapricing/views/pages"
    "golang.org/x/crypto/bcrypt"
)

func LoginPage(w http.ResponseWriter, r *http.Request) {
    if r.Method == "GET" {
        // Show login page
        component := pages.LoginPage(pages.LoginPageData{})
        Render(w, r, component)
        return
    }
    
    // Handle POST - login attempt
    email := r.FormValue("email")
    password := r.FormValue("password")
    
    if email == "" || password == "" {
        component := pages.LoginPage(pages.LoginPageData{
            Error: "Email and password are required",
        })
        Render(w, r, component)
        return
    }
    
    // Get user from database
    user, err := models.GetUserByEmail(email)
    if err != nil || user == nil {
        component := pages.LoginPage(pages.LoginPageData{
            Error: "Invalid email or password",
        })
        Render(w, r, component)
        return
    }
    
    // Check password
    err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
    if err != nil {
        component := pages.LoginPage(pages.LoginPageData{
            Error: "Invalid email or password",
        })
        Render(w, r, component)
        return
    }
    
    // Create session
    session, _ := auth.GetSession(r)
    session.Values["user_id"] = user.ID.String()
    session.Values["email"] = user.Email
    session.Values["role"] = user.Role
    session.Save(r, w)
    
    // Log successful login
    go func() {
        loginLog := &models.Log{
            Level:  "INFO",
            Method: "POST",
            Path:   "/login",
            UserID: &user.ID,
        }
        models.CreateLog(loginLog)
    }()
    
    // Redirect to dashboard
    http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
}

func Logout(w http.ResponseWriter, r *http.Request) {
    auth.ClearSession(w, r)
    http.Redirect(w, r, "/login", http.StatusSeeOther)
}