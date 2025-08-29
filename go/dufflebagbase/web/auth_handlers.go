package web

import (
	"net/http"

	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/views/pages"
	"github.com/suppers-ai/logger"
)

// LoginPage renders the login page
func LoginPage(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			// Check if already logged in
			cookie, err := r.Cookie("session_id")
			if err == nil && cookie.Value != "" {
				// Verify session is valid
				ctx := r.Context()
				if session, err := svc.Sessions().GetSession(ctx, cookie.Value); err == nil && session != nil {
					http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
					return
				}
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
		ctx := r.Context()

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

		// Create database session
		dbSession, err := svc.Sessions().CreateSession(ctx, user.ID)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to create session", logger.Err(err))
			http.Error(w, "Failed to create session: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set session cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    dbSession.ID,
			Path:     "/",
			HttpOnly: true,
			Secure:   false, // Set to true in production with HTTPS
			SameSite: http.SameSiteLaxMode,
			MaxAge:   86400, // 24 hours
		})

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
		ctx := r.Context()

		svc.Logger().Info(ctx, "User signup attempt",
			logger.String("email", email),
			logger.String("name", name))

		// For now, create user directly since RegisterUser doesn't exist
		user, err := svc.Users().CreateUser(ctx, email, password, services.UserRoleUser)
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

		// Create database session
		dbSession, err := svc.Sessions().CreateSession(ctx, user.ID)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to create session", logger.Err(err))
			http.Error(w, "Failed to create session: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set session cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    dbSession.ID,
			Path:     "/",
			HttpOnly: true,
			Secure:   false, // Set to true in production with HTTPS
			SameSite: http.SameSiteLaxMode,
			MaxAge:   86400, // 24 hours
		})

		svc.Logger().Info(ctx, "User signed up and logged in successfully",
			logger.String("user_id", user.ID.String()),
			logger.String("email", email),
			logger.String("ip", r.RemoteAddr))

		http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
	}
}

// Logout handles logout
func Logout(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Get session cookie
		cookie, err := r.Cookie("session_id")
		if err == nil && cookie.Value != "" {
			// Delete session from database
			if err := svc.Sessions().DeleteSession(ctx, cookie.Value); err != nil {
				svc.Logger().Error(ctx, "Failed to delete session", logger.Err(err))
			}
		}

		// Clear session cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			MaxAge:   -1, // Delete cookie
		})

		svc.Logger().Info(ctx, "User logged out",
			logger.String("ip", r.RemoteAddr))

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
