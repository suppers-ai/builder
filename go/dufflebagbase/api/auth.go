package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/dufflebagbase/services"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("your-secret-key") // TODO: Move to config

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

type SignupRequest struct {
	Email    string                 `json:"email"`
	Password string                 `json:"password"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func HandleLogin(authService *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		user, err := authService.AuthenticateUser(req.Email, req.Password)
		if err != nil {
			respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
			return
		}

		// Generate JWT token
		token, err := generateToken(user)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to generate token")
			return
		}

		respondWithJSON(w, http.StatusOK, LoginResponse{
			Token: token,
			User:  user,
		})
	}
}

func HandleLogout() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// In a JWT-based system, logout is handled client-side
		// We could implement a token blacklist here if needed
		respondWithJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
	}
}

func HandleSignup(authService *services.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req SignupRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to process password")
			return
		}

		user := &models.User{
			Email:    req.Email,
			Password: string(hashedPassword),
			Role:     "user",
			// Metadata can be handled separately if needed
		}

		if err := authService.CreateUser(user); err != nil {
			respondWithError(w, http.StatusBadRequest, "Failed to create user")
			return
		}

		respondWithJSON(w, http.StatusCreated, user)
	}
}

func HandleGetCurrentUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := r.Context().Value("user").(*models.User)
		respondWithJSON(w, http.StatusOK, user)
	}
}

func generateToken(user *models.User) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}