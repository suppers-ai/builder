package web

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/suppers-ai/dufflebagbase/constants"
	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/views/pages"
	"github.com/suppers-ai/logger"
)

// UsersPage renders the users management page
func UsersPage(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		userEmail, _ := h.GetUserEmail(r)
		ctx := h.NewContext()
		
		// Get pagination params with default page size for users
		page, pageSize, offset := h.GetPaginationWithSize(r, constants.UsersPageSize)
		
		// Get all users from users service
		users, totalUsers, err := svc.Users().ListUsersInfo(ctx, offset, pageSize)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to list users", logger.Err(err))
			users = []services.UserInfo{}
			totalUsers = 0
		}
		
		// Convert to page data
		pageUsers := make([]pages.User, len(users))
		for i, u := range users {
			pageUsers[i] = pages.User{
				ID:        u.ID,
				Email:     u.Email,
				Confirmed: u.Confirmed,
				Role:      u.Role,
				Locked:    nil, // Not tracked in UserInfo
				CreatedAt: u.CreatedAt,
				UpdatedAt: u.UpdatedAt,
				Metadata:  nil, // Not tracked in UserInfo
			}
		}
		
		data := pages.UsersPageData{
			UserEmail:   userEmail,
			Users:       pageUsers,
			TotalUsers:  int(totalUsers),
			CurrentPage: page,
			PageSize:    pageSize,
		}
		
		h.RenderWithHTMX(w, r, pages.UsersPage(data), pages.UsersPartial(data))
	}
}

// UpdateUserRole handles role update requests
func UpdateUserRole(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		userID := h.GetUserIDFromPath(r)
		
		var req struct {
			Role string `json:"role"`
		}
		
		if err := h.ParseJSON(r, &req); err != nil {
			h.LogError(ctx, "Failed to decode request", err)
			h.JSONError(w, http.StatusBadRequest, constants.ErrInvalidRequest)
			return
		}
		
		uid, err := uuid.Parse(userID)
		if err != nil {
			h.JSONError(w, http.StatusBadRequest, "Invalid user ID")
			return
		}
		
		err = svc.Users().UpdateUserRole(ctx, uid, services.UserRole(req.Role))
		if err != nil {
			svc.Logger().Error(ctx, "Failed to update user role", 
				logger.String("userID", userID),
				logger.String("role", req.Role),
				logger.Err(err))
			h.JSONError(w, http.StatusInternalServerError, "Failed to update role")
			return
		}
		
		h.JSONSuccessMessage(w, "Role updated successfully")
	}
}

// SendPasswordReset handles password reset email requests
func SendPasswordReset(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		userID := h.GetUserIDFromPath(r)
		
		err := svc.Users().SendPasswordResetEmail(ctx, userID)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to send password reset", 
				logger.String("userID", userID),
				logger.Err(err))
			h.JSONError(w, http.StatusInternalServerError, "Failed to send password reset")
			return
		}
		
		h.JSONSuccessMessage(w, constants.MsgPasswordResetSent)
	}
}

// LockUser handles user lock requests
func LockUser(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		userID := h.GetUserIDFromPath(r)
		
		uid, err := uuid.Parse(userID)
		if err != nil {
			h.JSONError(w, http.StatusBadRequest, "Invalid user ID")
			return
		}
		
		// Lock for 24 hours by default
		err = svc.Users().LockUser(ctx, uid, 24*time.Hour)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to lock user", 
				logger.String("userID", userID),
				logger.Err(err))
			h.JSONError(w, http.StatusInternalServerError, "Failed to lock user")
			return
		}
		
		h.JSONSuccessMessage(w, "User locked successfully")
	}
}

// UnlockUser handles user unlock requests  
func UnlockUser(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		userID := h.GetUserIDFromPath(r)
		
		uid, err := uuid.Parse(userID)
		if err != nil {
			h.JSONError(w, http.StatusBadRequest, "Invalid user ID")
			return
		}
		
		err = svc.Users().UnlockUser(ctx, uid)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to unlock user", 
				logger.String("userID", userID),
				logger.Err(err))
			h.JSONError(w, http.StatusInternalServerError, "Failed to unlock user")
			return
		}
		
		h.JSONSuccessMessage(w, "User unlocked successfully")
	}
}