package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"dynamicproducts/middleware"
	"dynamicproducts/models"
	"dynamicproducts/templates"
)

// LoginRequest represents a login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterRequest represents a registration request
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role,omitempty"` // Optional, defaults to seller
}

// AuthResponse represents an authentication response
type AuthResponse struct {
	User    *models.User `json:"user,omitempty"`
	Token   string       `json:"token,omitempty"`
	Message string       `json:"message"`
	Success bool         `json:"success"`
}

// LoginPage handles GET requests to show login form, POST requests to process login
func LoginPage(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		showLoginPage(w, r)
	case http.MethodPost:
		processLogin(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// showLoginPage renders the login form
func showLoginPage(w http.ResponseWriter, r *http.Request) {
	// If already authenticated, redirect to dashboard
	if middleware.IsAuthenticated(r) {
		http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
		return
	}

	// Get redirect URL from query parameter
	redirectURL := r.URL.Query().Get("redirect")
	if redirectURL == "" {
		redirectURL = "/dashboard"
	}

	data := templates.LoginPageData{
		Title:       "Login - Dynamic Products",
		RedirectURL: redirectURL,
		Error:       "",
	}

	// Render login template
	if err := templates.LoginPage(data).Render(r.Context(), w); err != nil {
		http.Error(w, "Failed to render login page", http.StatusInternalServerError)
		return
	}
}

// processLogin handles login form submission
func processLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	
	// Handle both JSON and form data
	contentType := r.Header.Get("Content-Type")
	if strings.Contains(contentType, "application/json") {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
	} else {
		// Parse form data
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}
		req.Email = r.Form.Get("email")
		req.Password = r.Form.Get("password")
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "Email and password are required",
			}, http.StatusBadRequest)
			return
		}
		
		// Show login page with error
		data := templates.LoginPageData{
			Title:       "Login - Dynamic Products",
			RedirectURL: r.Form.Get("redirect"),
			Error:       "Email and password are required",
		}
		templates.LoginPage(data).Render(r.Context(), w)
		return
	}

	// Find user
	user, err := models.GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if user == nil || !user.CheckPassword(req.Password) {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "Invalid email or password",
			}, http.StatusUnauthorized)
			return
		}
		
		// Show login page with error
		data := templates.LoginPageData{
			Title:       "Login - Dynamic Products",
			RedirectURL: r.Form.Get("redirect"),
			Error:       "Invalid email or password",
		}
		templates.LoginPage(data).Render(r.Context(), w)
		return
	}

	// Create session for web requests
	if !isJSONRequest(r) {
		if err := middleware.LoginUser(w, r, user); err != nil {
			http.Error(w, "Failed to create session", http.StatusInternalServerError)
			return
		}

		// Redirect to intended page or dashboard
		redirectURL := r.Form.Get("redirect")
		if redirectURL == "" {
			redirectURL = "/dashboard"
		}
		http.Redirect(w, r, redirectURL, http.StatusSeeOther)
		return
	}

	// For JSON requests, create a session token
	session, err := user.CreateSession()
	if err != nil {
		respondJSON(w, AuthResponse{
			Success: false,
			Message: "Failed to create session",
		}, http.StatusInternalServerError)
		return
	}

	// Clean password hash before sending
	user.PasswordHash = ""
	
	respondJSON(w, AuthResponse{
		Success: true,
		Message: "Login successful",
		User:    user,
		Token:   session.Token,
	}, http.StatusOK)
}

// RegisterPage handles user registration (admin only for creating sellers)
func RegisterPage(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		showRegisterPage(w, r)
	case http.MethodPost:
		processRegister(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// showRegisterPage renders the registration form (admin only)
func showRegisterPage(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetCurrentUser(r)
	if user == nil || !user.IsAdmin() {
		http.Error(w, "Access forbidden", http.StatusForbidden)
		return
	}

	data := templates.RegisterPageData{
		Title: "Register User - Dynamic Products",
		Error: "",
	}

	if err := templates.RegisterPage(data).Render(r.Context(), w); err != nil {
		http.Error(w, "Failed to render register page", http.StatusInternalServerError)
		return
	}
}

// processRegister handles user registration
func processRegister(w http.ResponseWriter, r *http.Request) {
	// Only admins can register new users
	currentUser := middleware.GetCurrentUser(r)
	if currentUser == nil || !currentUser.IsAdmin() {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "Admin access required",
			}, http.StatusForbidden)
			return
		}
		http.Error(w, "Access forbidden", http.StatusForbidden)
		return
	}

	var req RegisterRequest
	
	// Handle both JSON and form data
	contentType := r.Header.Get("Content-Type")
	if strings.Contains(contentType, "application/json") {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
	} else {
		// Parse form data
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}
		req.Email = r.Form.Get("email")
		req.Password = r.Form.Get("password")
		req.Name = r.Form.Get("name")
		req.Role = r.Form.Get("role")
	}

	// Validate input
	if req.Email == "" || req.Password == "" || req.Name == "" {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "Email, password, and name are required",
			}, http.StatusBadRequest)
			return
		}
		
		data := templates.RegisterPageData{
			Title: "Register User - Dynamic Products",
			Error: "Email, password, and name are required",
		}
		templates.RegisterPage(data).Render(r.Context(), w)
		return
	}

	// Default role is seller
	if req.Role == "" {
		req.Role = "seller"
	}

	// Validate role
	if req.Role != "seller" && req.Role != "admin" {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "Invalid role. Must be 'seller' or 'admin'",
			}, http.StatusBadRequest)
			return
		}
		
		data := templates.RegisterPageData{
			Title: "Register User - Dynamic Products",
			Error: "Invalid role. Must be 'seller' or 'admin'",
		}
		templates.RegisterPage(data).Render(r.Context(), w)
		return
	}

	// Check if user already exists
	existingUser, err := models.GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if existingUser != nil {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "User with this email already exists",
			}, http.StatusConflict)
			return
		}
		
		data := templates.RegisterPageData{
			Title: "Register User - Dynamic Products",
			Error: "User with this email already exists",
		}
		templates.RegisterPage(data).Render(r.Context(), w)
		return
	}

	// Create new user
	newUser := &models.User{
		Email:    req.Email,
		Name:     req.Name,
		Role:     req.Role,
		IsActive: true,
	}

	if err := newUser.SetPassword(req.Password); err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	if err := newUser.Create(); err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Clean password hash before sending
	newUser.PasswordHash = ""

	if isJSONRequest(r) {
		respondJSON(w, AuthResponse{
			Success: true,
			Message: "User created successfully",
			User:    newUser,
		}, http.StatusCreated)
		return
	}

	// Redirect to users page for web requests
	http.Redirect(w, r, "/admin/users?success=User created successfully", http.StatusSeeOther)
}

// LogoutHandler handles user logout
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Clear session
	if err := middleware.LogoutUser(w, r); err != nil {
		http.Error(w, "Failed to logout", http.StatusInternalServerError)
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, AuthResponse{
			Success: true,
			Message: "Logged out successfully",
		}, http.StatusOK)
		return
	}

	// Redirect to login page
	http.Redirect(w, r, "/login", http.StatusSeeOther)
}

// ChangePasswordHandler handles password change requests
func ChangePasswordHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user := middleware.GetCurrentUser(r)
	if user == nil {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "Authentication required",
			}, http.StatusUnauthorized)
			return
		}
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	type ChangePasswordRequest struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	var req ChangePasswordRequest
	
	// Handle both JSON and form data
	contentType := r.Header.Get("Content-Type")
	if strings.Contains(contentType, "application/json") {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
	} else {
		if err := r.ParseForm(); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}
		req.CurrentPassword = r.Form.Get("current_password")
		req.NewPassword = r.Form.Get("new_password")
	}

	// Validate input
	if req.CurrentPassword == "" || req.NewPassword == "" {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "Current password and new password are required",
			}, http.StatusBadRequest)
			return
		}
		http.Error(w, "Current password and new password are required", http.StatusBadRequest)
		return
	}

	// Verify current password
	if !user.CheckPassword(req.CurrentPassword) {
		if isJSONRequest(r) {
			respondJSON(w, AuthResponse{
				Success: false,
				Message: "Current password is incorrect",
			}, http.StatusUnauthorized)
			return
		}
		http.Error(w, "Current password is incorrect", http.StatusUnauthorized)
		return
	}

	// Update password
	if err := user.UpdatePassword(req.NewPassword); err != nil {
		http.Error(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	if isJSONRequest(r) {
		respondJSON(w, AuthResponse{
			Success: true,
			Message: "Password updated successfully",
		}, http.StatusOK)
		return
	}

	// Redirect back with success message
	http.Redirect(w, r, "/dashboard?success=Password updated successfully", http.StatusSeeOther)
}

// APILoginHandler handles API login requests
func APILoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, AuthResponse{
			Success: false,
			Message: "Method not allowed",
		}, http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, AuthResponse{
			Success: false,
			Message: "Invalid request body",
		}, http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		respondJSON(w, AuthResponse{
			Success: false,
			Message: "Email and password are required",
		}, http.StatusBadRequest)
		return
	}

	// Find and validate user
	user, err := models.GetUserByEmail(req.Email)
	if err != nil {
		respondJSON(w, AuthResponse{
			Success: false,
			Message: "Internal server error",
		}, http.StatusInternalServerError)
		return
	}

	if user == nil || !user.CheckPassword(req.Password) {
		respondJSON(w, AuthResponse{
			Success: false,
			Message: "Invalid email or password",
		}, http.StatusUnauthorized)
		return
	}

	// Create session token
	session, err := user.CreateSession()
	if err != nil {
		respondJSON(w, AuthResponse{
			Success: false,
			Message: "Failed to create session",
		}, http.StatusInternalServerError)
		return
	}

	// Clean password hash
	user.PasswordHash = ""
	
	respondJSON(w, AuthResponse{
		Success: true,
		Message: "Login successful",
		User:    user,
		Token:   session.Token,
	}, http.StatusOK)
}

// Helper functions

// isJSONRequest checks if the request expects a JSON response
func isJSONRequest(r *http.Request) bool {
	accept := r.Header.Get("Accept")
	contentType := r.Header.Get("Content-Type")
	
	return strings.Contains(accept, "application/json") || 
		   strings.Contains(contentType, "application/json") ||
		   strings.HasPrefix(r.URL.Path, "/api/")
}

// respondJSON sends a JSON response
func respondJSON(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}