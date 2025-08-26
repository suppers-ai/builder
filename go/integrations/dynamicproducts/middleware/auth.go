package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"dynamicproducts/models"
	"github.com/gorilla/sessions"
)

// SessionStore holds the session store
var SessionStore *sessions.CookieStore

// InitSessionStore initializes the session store
func InitSessionStore(secret string) {
	SessionStore = sessions.NewCookieStore([]byte(secret))
	SessionStore.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
}

// UserContextKey is the context key for the user
type contextKey string

const UserContextKey contextKey = "user"

// RequireAuth middleware ensures user is authenticated
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := GetCurrentUser(r)
		if user == nil {
			// Redirect to login for web requests
			if isWebRequest(r) {
				http.Redirect(w, r, "/login?redirect="+r.URL.Path, http.StatusSeeOther)
				return
			}
			// Return JSON error for API requests
			http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
			return
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next(w, r.WithContext(ctx))
	}
}

// RequireAdmin middleware ensures user is authenticated and is an admin
func RequireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := GetCurrentUser(r)
		if user == nil {
			// Redirect to login for web requests
			if isWebRequest(r) {
				http.Redirect(w, r, "/login?redirect="+r.URL.Path, http.StatusSeeOther)
				return
			}
			// Return JSON error for API requests
			http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
			return
		}

		if !user.IsAdmin() {
			// Return forbidden for both web and API requests
			if isWebRequest(r) {
				http.Error(w, "Access forbidden: Admin role required", http.StatusForbidden)
				return
			}
			http.Error(w, `{"error":"Admin role required"}`, http.StatusForbidden)
			return
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next(w, r.WithContext(ctx))
	}
}

// RequireAdminAPI middleware for API endpoints that require admin access
func RequireAdminAPI(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := GetCurrentUser(r)
		if user == nil {
			w.Header().Set("Content-Type", "application/json")
			http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
			return
		}

		if !user.IsAdmin() {
			w.Header().Set("Content-Type", "application/json")
			http.Error(w, `{"error":"Admin role required"}`, http.StatusForbidden)
			return
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next(w, r.WithContext(ctx))
	}
}

// RequireSeller middleware ensures user is authenticated and is a seller or admin
func RequireSeller(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := GetCurrentUser(r)
		if user == nil {
			// Redirect to login for web requests
			if isWebRequest(r) {
				http.Redirect(w, r, "/login?redirect="+r.URL.Path, http.StatusSeeOther)
				return
			}
			// Return JSON error for API requests
			http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
			return
		}

		if !user.IsSeller() && !user.IsAdmin() {
			// Return forbidden for both web and API requests
			if isWebRequest(r) {
				http.Error(w, "Access forbidden: Seller role required", http.StatusForbidden)
				return
			}
			http.Error(w, `{"error":"Seller role required"}`, http.StatusForbidden)
			return
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next(w, r.WithContext(ctx))
	}
}

// GetCurrentUser retrieves the current user from session or authorization header
func GetCurrentUser(r *http.Request) *models.User {
	// First try to get user from session (for web requests)
	if user := getUserFromSession(r); user != nil {
		return user
	}

	// Then try to get user from Authorization header (for API requests)
	if user := getUserFromToken(r); user != nil {
		return user
	}

	return nil
}

// getUserFromSession gets user from session cookie
func getUserFromSession(r *http.Request) *models.User {
	if SessionStore == nil {
		return nil
	}

	session, err := SessionStore.Get(r, "session")
	if err != nil {
		log.Printf("Failed to get session: %v", err)
		return nil
	}

	userID, ok := session.Values["user_id"]
	if !ok {
		return nil
	}

	userIDStr, ok := userID.(string)
	if !ok {
		return nil
	}

	user, err := models.GetUserByID(userIDStr)
	if err != nil {
		log.Printf("Failed to get user from session: %v", err)
		return nil
	}

	return user
}

// getUserFromToken gets user from Authorization header token
func getUserFromToken(r *http.Request) *models.User {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return nil
	}

	// Support both "Bearer token" and "token" formats
	token := authHeader
	if strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	}

	user, err := models.GetUserBySessionToken(token)
	if err != nil {
		log.Printf("Failed to get user from token: %v", err)
		return nil
	}

	return user
}

// LoginUser logs in a user by creating a session
func LoginUser(w http.ResponseWriter, r *http.Request, user *models.User) error {
	session, err := SessionStore.Get(r, "session")
	if err != nil {
		return err
	}

	session.Values["user_id"] = user.ID
	session.Values["user_email"] = user.Email
	session.Values["user_role"] = user.Role

	return session.Save(r, w)
}

// LogoutUser logs out a user by clearing the session
func LogoutUser(w http.ResponseWriter, r *http.Request) error {
	session, err := SessionStore.Get(r, "session")
	if err != nil {
		return err
	}

	// Clear session values
	session.Values = make(map[interface{}]interface{})
	session.Options.MaxAge = -1

	return session.Save(r, w)
}

// IsAuthenticated checks if user is authenticated
func IsAuthenticated(r *http.Request) bool {
	return GetCurrentUser(r) != nil
}

// GetUserFromContext gets user from request context
func GetUserFromContext(r *http.Request) *models.User {
	user, ok := r.Context().Value(UserContextKey).(*models.User)
	if !ok {
		return nil
	}
	return user
}

// LoggingMiddleware logs HTTP requests
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s %s", r.RemoteAddr, r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

// CORSMiddleware adds CORS headers for API requests
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only apply CORS headers to API routes
		if strings.HasPrefix(r.URL.Path, "/api") {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

// SecurityHeadersMiddleware adds security headers
func SecurityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		next.ServeHTTP(w, r)
	})
}

// isWebRequest determines if the request is a web request (not API)
func isWebRequest(r *http.Request) bool {
	// Check if it's an API request
	if strings.HasPrefix(r.URL.Path, "/api/") {
		return false
	}

	// Check Accept header for JSON preference
	accept := r.Header.Get("Accept")
	if strings.Contains(accept, "application/json") && !strings.Contains(accept, "text/html") {
		return false
	}

	return true
}

// RateLimitMiddleware provides simple rate limiting (basic implementation)
func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: Implement proper rate limiting with Redis or in-memory store
		// For now, just pass through
		next.ServeHTTP(w, r)
	})
}