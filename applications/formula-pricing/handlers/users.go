package handlers

import (
	"encoding/json"
	"net/http"
	"formula-pricing/database"
	"formula-pricing/models"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type CreateUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type UpdatePasswordRequest struct {
	Password string `json:"password"`
}

type UpdateRoleRequest struct {
	Role string `json:"role"`
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Email == "" || req.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	if len(req.Password) < 8 {
		respondWithError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	// Default to viewer role if not specified
	if req.Role == "" {
		req.Role = "viewer"
	}

	if req.Role != "admin" && req.Role != "viewer" {
		respondWithError(w, http.StatusBadRequest, "Invalid role, must be 'admin' or 'viewer'")
		return
	}

	user, err := models.CreateUser(database.DB, req.Email, req.Password, req.Role)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	respondWithJSON(w, http.StatusCreated, user)
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	users, err := models.GetAllUsers(database.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get users")
		return
	}

	respondWithJSON(w, http.StatusOK, users)
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := models.GetUserByID(database.DB, id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get user")
		return
	}

	if user == nil {
		respondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	respondWithJSON(w, http.StatusOK, user)
}

func UpdateUserPassword(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Password is required")
		return
	}

	if len(req.Password) < 8 {
		respondWithError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	err = models.UpdateUserPassword(database.DB, id, req.Password)
	if err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "User not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Failed to update password")
		}
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Password updated successfully"})
}

func UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req UpdateRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Role != "admin" && req.Role != "viewer" {
		respondWithError(w, http.StatusBadRequest, "Invalid role, must be 'admin' or 'viewer'")
		return
	}

	// Don't allow removing the last admin
	if req.Role == "viewer" {
		users, err := models.GetAllUsers(database.DB)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to check users")
			return
		}

		adminCount := 0
		for _, u := range users {
			if u.Role == "admin" {
				adminCount++
			}
		}

		if adminCount <= 1 {
			// Check if this user is an admin
			user, err := models.GetUserByID(database.DB, id)
			if err == nil && user != nil && user.Role == "admin" {
				respondWithError(w, http.StatusBadRequest, "Cannot remove the last admin")
				return
			}
		}
	}

	if err := models.UpdateUserRole(database.DB, id, req.Role); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "User not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Failed to update role")
		}
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Role updated successfully"})
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// Check if there will be at least one admin left
	users, err := models.GetAllUsers(database.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check users")
		return
	}

	if len(users) <= 1 {
		respondWithError(w, http.StatusBadRequest, "Cannot delete the last user")
		return
	}

	// Check if we're deleting the last admin
	adminCount := 0
	var userToDelete *models.User
	for _, u := range users {
		if u.ID == id {
			userToDelete = &u
		}
		if u.Role == "admin" {
			adminCount++
		}
	}

	if userToDelete != nil && userToDelete.Role == "admin" && adminCount <= 1 {
		respondWithError(w, http.StatusBadRequest, "Cannot delete the last admin")
		return
	}

	err = models.DeleteUser(database.DB, id)
	if err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "User not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "User deleted successfully"})
}