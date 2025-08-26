package auth

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/sessions"
)

var Store *sessions.CookieStore

func InitSessionStore(secret string) {
	// Convert secret to bytes and ensure it's exactly 32 bytes
	key := []byte(secret)
	if len(key) > 32 {
		key = key[:32]
	} else if len(key) < 32 {
		// Pad with zeros if too short
		padded := make([]byte, 32)
		copy(padded, key)
		key = padded
	}
	
	Store = sessions.NewCookieStore(key)
	// Set default options that will be used for all sessions
	Store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		Domain:   "", // Empty string means current domain
	}
	
	// Also set MaxAge directly on the store to ensure it's applied
	Store.MaxAge(86400 * 7)
}

func GetSession(r *http.Request) (*sessions.Session, error) {
	session, err := Store.Get(r, "pricing-session")
	if err != nil {
		// If there's an error (like invalid cookie), create a new empty session
		// This allows the request to continue with an unauthenticated session
		session, _ = Store.New(r, "pricing-session")
		// Don't return the error since we've handled it
		return session, nil
	}
	return session, nil
}

func SetUserSession(w http.ResponseWriter, r *http.Request, userID uuid.UUID, email string, role string) error {
	// Always create a fresh session on login to avoid issues with old/invalid cookies
	session, err := Store.New(r, "pricing-session")
	if err != nil {
		return err
	}

	session.Values["user_id"] = userID.String()
	session.Values["email"] = email
	session.Values["role"] = role
	session.Values["authenticated"] = true
	
	// Ensure the session has proper options
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
	
	return session.Save(r, w)
}

func ClearSession(w http.ResponseWriter, r *http.Request) error {
	// Get or create a session
	session, _ := GetSession(r)
	
	// Clear all values
	for key := range session.Values {
		delete(session.Values, key)
	}
	
	// Set MaxAge to -1 to delete the cookie
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   -1, // This tells the browser to delete the cookie
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	return session.Save(r, w)
}

func IsAuthenticated(r *http.Request) bool {
	session, err := GetSession(r)
	if err != nil {
		return false
	}

	auth, ok := session.Values["authenticated"].(bool)
	return ok && auth
}

func GetUserID(r *http.Request) *uuid.UUID {
	session, err := GetSession(r)
	if err != nil {
		return nil
	}

	userIDStr, ok := session.Values["user_id"].(string)
	if !ok {
		return nil
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil
	}

	return &userID
}

func GetUserRole(r *http.Request) string {
	session, err := GetSession(r)
	if err != nil {
		return ""
	}

	role, ok := session.Values["role"].(string)
	if !ok {
		return ""
	}

	return role
}

func IsAdmin(r *http.Request) bool {
	return GetUserRole(r) == "admin"
}

func IsViewer(r *http.Request) bool {
	return GetUserRole(r) == "viewer"
}

func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !IsAuthenticated(r) {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		next(w, r)
	}
}

func RequireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !IsAuthenticated(r) {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		if !IsAdmin(r) {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

// For API endpoints
func RequireAdminAPI(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !IsAuthenticated(r) {
			http.Error(w, "Authentication required", http.StatusUnauthorized)
			return
		}
		if !IsAdmin(r) {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}