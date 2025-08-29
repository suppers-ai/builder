package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/suppers-ai/dufflebagbase/constants"
	"github.com/suppers-ai/dufflebagbase/utils"
	"github.com/volatiletech/authboss/v3"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// JWTAuth middleware for API authentication
func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				respondWithError(w, http.StatusUnauthorized, constants.ErrMissingAuthHeader)
				return
			}
			
			// Check Bearer prefix
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				respondWithError(w, http.StatusUnauthorized, constants.ErrInvalidAuthFormat)
				return
			}
			
			tokenString := parts[1]
			
			// Parse and validate token
			token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
				return []byte(secret), nil
			})
			
			if err != nil || !token.Valid {
				respondWithError(w, http.StatusUnauthorized, constants.ErrInvalidToken)
				return
			}
			
			// Extract claims
			if claims, ok := token.Claims.(*Claims); ok {
				// Add user info to context
				ctx := context.WithValue(r.Context(), constants.ContextKeyUserID, claims.UserID)
				ctx = context.WithValue(ctx, constants.ContextKeyUserEmail, claims.Email)
				ctx = context.WithValue(ctx, constants.ContextKeyUserRole, claims.Role)
				
				next.ServeHTTP(w, r.WithContext(ctx))
			} else {
				respondWithError(w, http.StatusUnauthorized, "Invalid token claims")
			}
		})
	}
}

// RequireAdmin middleware is now in rbac.go with service parameter

// GenerateToken generates a JWT token for a user
func GenerateToken(secret string, userID, email, role string) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	utils.JSONError(w, code, message)
}

// AuthBossBridge extracts the user from authboss context and sets it for RBAC middleware
func AuthBossBridge(authService interface{ CurrentUser(*http.Request) (authboss.User, error) }) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get authboss user from context
			user, err := authService.CurrentUser(r)
			if err != nil || user == nil {
				// No user in context, likely not authenticated
				next.ServeHTTP(w, r)
				return
			}
			
			// Extract user ID and add it to context for RBAC middleware
			userID := user.GetPID()
			ctx := context.WithValue(r.Context(), "user_id", userID)
			
			// Continue with updated context
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}