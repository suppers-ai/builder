package api

import (
	"net/http"
	"time"

	"github.com/suppers-ai/dufflebagbase/services"
)

type DashboardStats struct {
	TotalUsers        int        `json:"total_users"`
	TotalCollections  int        `json:"total_collections"`
	TotalStorageUsed  int64      `json:"total_storage_used"`
	TotalAPICalls     int        `json:"total_api_calls"`
	UsersGrowth       float64    `json:"users_growth"`
	StorageGrowth     float64    `json:"storage_growth"`
	RecentActivities  []Activity `json:"recent_activities"`
}

type Activity struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	UserID      string    `json:"user_id,omitempty"`
	UserEmail   string    `json:"user_email,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

func HandleGetDashboardStats(
	userService *services.UserService,
	storageService *services.StorageService,
	collectionService *services.CollectionService,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get total users
		totalUsers, err := userService.GetUserCount()
		if err != nil {
			totalUsers = 0
		}

		// Get total collections
		totalCollections, err := collectionService.GetCollectionCount()
		if err != nil {
			totalCollections = 0
		}

		// Get storage usage
		totalStorage, err := storageService.GetTotalStorageUsed()
		if err != nil {
			totalStorage = 0
		}

		// Calculate growth - set to 0 for now until we implement historical tracking
		usersGrowth := 0.0
		storageGrowth := 0.0

		// Get recent activities - empty for now until we implement activity logging
		activities := []Activity{}

		stats := DashboardStats{
			TotalUsers:       totalUsers,
			TotalCollections: totalCollections,
			TotalStorageUsed: totalStorage,
			TotalAPICalls:    0, // Set to 0 until we implement API call tracking
			UsersGrowth:      usersGrowth,
			StorageGrowth:    storageGrowth,
			RecentActivities: activities,
		}

		RespondWithJSON(w, http.StatusOK, stats)
	}
}