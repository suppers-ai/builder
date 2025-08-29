package web

import (
    "net/http"

    "github.com/suppers-ai/dufflebagbase/services"
    "github.com/suppers-ai/dufflebagbase/views/pages"
    "github.com/suppers-ai/logger"
)

// DashboardPage renders the dashboard
func DashboardPage(svc *services.Service) http.HandlerFunc {
    h := NewBaseHandler(svc)
    return func(w http.ResponseWriter, r *http.Request) {
        userEmail, _ := h.GetUserEmail(r)
        ctx := h.NewContext()
        
        // Get dashboard stats
        stats, err := svc.Stats().GetDashboardStats(ctx)
        if err != nil {
            // Log error but continue with partial data
            svc.Logger().Error(ctx, "Failed to get dashboard stats", logger.Err(err))
            stats = &services.DashboardStats{}
        }
        
        data := pages.DashboardData{
            UserEmail:   userEmail,
            Stats:       *stats,
        }
        
        h.RenderWithHTMX(w, r, pages.DashboardPage(data), pages.DashboardPartial(data))
    }
}

// GetCPUStats returns just the CPU stats as JSON (with accurate 1-second sampling)
func GetCPUStats(svc *services.Service) http.HandlerFunc {
    h := NewBaseHandler(svc)
    return func(w http.ResponseWriter, r *http.Request) {
        ctx := h.NewContext()
        
        // Get accurate CPU stats with 1-second sampling
        stats, err := svc.Stats().GetSystemStats(ctx)
        if err != nil {
            h.LogError(ctx, "Failed to get CPU stats", err)
            h.JSONError(w, http.StatusInternalServerError, "Failed to get CPU stats")
            return
        }
        
        // Return just the CPU usage as JSON
        h.JSONResponse(w, http.StatusOK, map[string]float64{
            "cpuUsage": stats.CPUUsage,
        })
    }
}