package web

import (
	"context"
	"net/http"
	"strconv"

	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/views/pages"
	"github.com/suppers-ai/logger"
)

// UsersPage renders the users management page
func UsersPage(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get authboss session store
		store := svc.Auth().SessionStore()
		session, _ := store.Get(r, "dufflebag-session")
		userEmail, _ := session.Values["user_email"].(string)
		
		ctx := context.Background()
		
		// Get pagination params
		page := 1
		if p := r.URL.Query().Get("page"); p != "" {
			if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
				page = parsed
			}
		}
		
		pageSize := 20
		offset := (page - 1) * pageSize
		
		// Get all users from auth service
		users, totalUsers, err := svc.Auth().ListUsers(ctx, offset, pageSize)
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
				Username:  u.Username,
				Role:      u.Role,
				Confirmed: u.Confirmed,
				CreatedAt: u.CreatedAt,
				UpdatedAt: u.UpdatedAt,
			}
		}
		
		data := pages.UsersPageData{
			UserEmail:   userEmail,
			Users:       pageUsers,
			TotalUsers:  totalUsers,
			CurrentPage: page,
			PageSize:    pageSize,
		}
		
		component := pages.UsersPage(data)
		Render(w, r, component)
	}
}