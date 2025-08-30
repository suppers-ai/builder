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

		// Calculate growth (mock data for now)
		usersGrowth := 12.5  // 12.5% growth
		storageGrowth := 8.3  // 8.3% growth

		// Get recent activities (mock data for now)
		activities := []Activity{
			{
				ID:          "1",
				Type:        "user_signup",
				Description: "New user signed up",
				UserEmail:   "john@example.com",
				CreatedAt:   time.Now().Add(-1 * time.Hour),
			},
			{
				ID:          "2",
				Type:        "file_uploaded",
				Description: "File uploaded to storage",
				UserEmail:   "admin@example.com",
				CreatedAt:   time.Now().Add(-2 * time.Hour),
			},
			{
				ID:          "3",
				Type:        "collection_created",
				Description: "New collection created",
				UserEmail:   "admin@example.com",
				CreatedAt:   time.Now().Add(-3 * time.Hour),
			},
		}

		stats := DashboardStats{
			TotalUsers:       totalUsers,
			TotalCollections: totalCollections,
			TotalStorageUsed: totalStorage,
			TotalAPICalls:    1000, // Mock value
			UsersGrowth:      usersGrowth,
			StorageGrowth:    storageGrowth,
			RecentActivities: activities,
		}

		respondWithJSON(w, http.StatusOK, stats)
	}
}