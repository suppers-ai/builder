package web

import (
    "context"
    "net/http"
    "time"

    "github.com/volatiletech/authboss/v3"
    "github.com/suppers-ai/dufflebagbase/services"
    "github.com/suppers-ai/dufflebagbase/views/pages"
    "github.com/suppers-ai/logger"
)

// LoginPage renders the login page
func LoginPage(svc *services.Service) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Get authboss session store
        store := svc.Auth().SessionStore()
        
        if r.Method == "GET" {
            // Check if already logged in
            session, _ := store.Get(r, "dufflebag-session")
            if userID, ok := session.Values["user_id"].(string); ok && userID != "" {
                http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
                return
            }
            
            // Render login template
            component := pages.LoginPage(pages.LoginPageData{})
            Render(w, r, component)
            return
        }
        
        // Handle POST
        email := r.FormValue("email")
        password := r.FormValue("password")
        
        // Authenticate user
        ctx := context.Background()
        
        // Debug logging
        svc.Logger().Info(ctx, "Login attempt", 
            logger.String("email", email),
            logger.Bool("has_password", password != ""))
        
        user, err := svc.Auth().AuthenticateUser(ctx, email, password)
        if err != nil {
            svc.Logger().Warn(ctx, "Login failed", 
                logger.String("email", email),
                logger.Err(err))
            
            component := pages.LoginPage(pages.LoginPageData{
                Error: "Invalid email or password",
            })
            Render(w, r, component)
            return
        }
        
        // Create session compatible with authboss
        session, _ := store.Get(r, "dufflebag-session")
        
        // Authboss expects these keys
        session.Values[authboss.SessionKey] = user.GetPID()
        session.Values[authboss.SessionHalfAuthKey] = "false"
        
        // Our custom keys
        session.Values["user_id"] = user.GetPID()
        session.Values["user_email"] = email // Store the actual email
        session.Values["logged_in_at"] = time.Now().Unix()
        err = session.Save(r, w)
        if err != nil {
            svc.Logger().Error(ctx, "Failed to save session", logger.Err(err))
            http.Error(w, "Failed to save session: " + err.Error(), http.StatusInternalServerError)
            return
        }
        
        svc.Logger().Info(ctx, "User logged in successfully",
            logger.String("user_id", user.GetPID()),
            logger.String("email", email),
            logger.String("ip", r.RemoteAddr))
        
        http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
    }
}

// SignupPage renders the signup page
func SignupPage(svc *services.Service) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Get authboss session store
        store := svc.Auth().SessionStore()
        
        if !svc.Config().EnableSignup {
            http.Error(w, "Signup is disabled", http.StatusForbidden)
            return
        }
        
        if r.Method == "GET" {
            component := pages.SignupPage(pages.SignupPageData{})
            Render(w, r, component)
            return
        }
        
        // Handle POST
        email := r.FormValue("email")
        password := r.FormValue("password")
        name := r.FormValue("name")
        
        // Register user
        ctx := context.Background()
        
        svc.Logger().Info(ctx, "User signup attempt",
            logger.String("email", email),
            logger.String("name", name))
        
        user, err := svc.Auth().RegisterUser(ctx, email, password, map[string]interface{}{
            "name": name,
        })
        if err != nil {
            svc.Logger().Warn(ctx, "User signup failed",
                logger.String("email", email),
                logger.Err(err))
            component := pages.SignupPage(pages.SignupPageData{
                Error: err.Error(),
            })
            Render(w, r, component)
            return
        }
        
        // Create session compatible with authboss
        session, _ := store.Get(r, "dufflebag-session")
        
        // Authboss expects these keys
        session.Values[authboss.SessionKey] = user.GetPID()
        session.Values[authboss.SessionHalfAuthKey] = "false"
        
        // Our custom keys
        session.Values["user_id"] = user.GetPID()
        session.Values["user_email"] = email // Store the actual email
        session.Values["logged_in_at"] = time.Now().Unix()
        err = session.Save(r, w)
        if err != nil {
            svc.Logger().Error(ctx, "Failed to save session", logger.Err(err))
            http.Error(w, "Failed to save session: " + err.Error(), http.StatusInternalServerError)
            return
        }
        
        svc.Logger().Info(ctx, "User logged in successfully",
            logger.String("user_id", user.GetPID()),
            logger.String("email", email),
            logger.String("ip", r.RemoteAddr))
        
        http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
    }
}

// Logout handles logout
func Logout(svc *services.Service) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        ctx := context.Background()
        // Get authboss session store
        store := svc.Auth().SessionStore()
        
        // Clear session
        session, _ := store.Get(r, "dufflebag-session")
        
        // Log before clearing
        if userEmail, ok := session.Values["user_email"].(string); ok {
            svc.Logger().Info(ctx, "User logged out",
                logger.String("email", userEmail),
                logger.String("ip", r.RemoteAddr))
        }
        
        session.Values = make(map[interface{}]interface{})
        session.Options.MaxAge = -1
        err := session.Save(r, w)
        if err != nil {
            svc.Logger().Error(ctx, "Failed to clear session", logger.Err(err))
            http.Error(w, "Failed to clear session", http.StatusInternalServerError)
            return
        }
        
        http.Redirect(w, r, "/auth/login", http.StatusSeeOther)
    }
}

// ForgotPassword handles password reset requests
func ForgotPassword(svc *services.Service) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // For now, just redirect to login
        http.Redirect(w, r, "/auth/login", http.StatusSeeOther)
    }
}