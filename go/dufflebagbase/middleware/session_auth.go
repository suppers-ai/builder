package middleware

import (
	"context"
	"net/http"
	"strings"
	
	"github.com/suppers-ai/dufflebagbase/constants"
	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/logger"
)

// SessionAuth checks if user is logged in via session
func SessionAuth(svc *services.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get session
			store := svc.Auth().SessionStore()
			session, err := store.Get(r, "dufflebag-session")
			if err != nil {
				svc.Logger().Debug(r.Context(), "Failed to get session",
					logger.Err(err),
					logger.String("path", r.URL.Path))
				handleUnauthorized(w, r)
				return
			}
			
			// Check if user ID exists in session
			userID, ok := session.Values["user_id"].(string)
			if !ok || userID == "" {
				svc.Logger().Debug(r.Context(), "No user_id in session",
					logger.String("path", r.URL.Path))
				handleUnauthorized(w, r)
				return
			}
			
			// Add user ID to context for downstream handlers using the constant
			ctx := r.Context()
			ctx = context.WithValue(ctx, constants.ContextKeyUserID, userID)
			
			// Also add email if present
			if email, ok := session.Values["user_email"].(string); ok {
				ctx = context.WithValue(ctx, constants.ContextKeyUserEmail, email)
			}
			
			svc.Logger().Debug(ctx, "Session auth successful",
				logger.String("user_id", userID),
				logger.String("path", r.URL.Path))
			
			// Continue with the request
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// handleUnauthorized handles unauthorized requests by either redirecting to login or returning 401
func handleUnauthorized(w http.ResponseWriter, r *http.Request) {
	// Check if this is an API request
	if strings.HasPrefix(r.URL.Path, "/api/") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	// Check Accept header to determine if this is an AJAX request
	accept := r.Header.Get("Accept")
	if strings.Contains(accept, "application/json") {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"error":"Unauthorized"}`))
		return
	}
	
	// For HTML requests, redirect to login page
	http.Redirect(w, r, "/auth/login", http.StatusSeeOther)
}