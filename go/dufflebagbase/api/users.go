package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/dufflebagbase/models"
	"github.com/suppers-ai/dufflebagbase/services"
)

type PaginatedUsersResponse struct {
	Data       []*models.User `json:"data"`
	Total      int            `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
	TotalPages int            `json:"total_pages"`
}

func HandleGetUsers(userService *services.UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		page, _ := strconv.Atoi(r.URL.Query().Get("page"))
		if page < 1 {
			page = 1
		}

		pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
		if pageSize < 1 || pageSize > 100 {
			pageSize = 20
		}

		users, total, err := userService.GetUsers(page, pageSize)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to fetch users")
			return
		}

		totalPages := (total + pageSize - 1) / pageSize

		respondWithJSON(w, http.StatusOK, PaginatedUsersResponse{
			Data:       users,
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		})
	}
}

func HandleGetUser(userService *services.UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		userID := vars["id"]

		user, err := userService.GetUserByID(userID)
		if err != nil {
			respondWithError(w, http.StatusNotFound, "User not found")
			return
		}

		respondWithJSON(w, http.StatusOK, user)
	}
}

func HandleUpdateUser(userService *services.UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		userID := vars["id"]

		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		user, err := userService.UpdateUser(userID, updates)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to update user")
			return
		}

		respondWithJSON(w, http.StatusOK, user)
	}
}

func HandleDeleteUser(userService *services.UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		userID := vars["id"]

		if err := userService.DeleteUser(userID); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to delete user")
			return
		}

		respondWithJSON(w, http.StatusOK, map[string]string{"message": "User deleted successfully"})
	}
}