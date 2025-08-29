package services

import (
	"context"
	"runtime"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"

	"github.com/suppers-ai/dufflebagbase/models"
)

// SystemStats represents system statistics
type SystemStats struct {
	CPUUsage    float64   `json:"cpu_usage"`
	MemoryUsage float64   `json:"memory_usage"`
	MemoryUsed  int64     `json:"memory_used"`
	MemoryTotal int64     `json:"memory_total"`
	DiskUsage   float64   `json:"disk_usage"`
	DiskUsed    int64     `json:"disk_used"`
	DiskTotal   int64     `json:"disk_total"`
	Goroutines  int       `json:"goroutines"`
	Uptime      string    `json:"uptime"`
	Timestamp   time.Time `json:"timestamp"`
}

// DatabaseStats represents database statistics
type DatabaseStats struct {
	TotalUsers       int64 `json:"total_users"`
	TotalCollections int64 `json:"total_collections"`
	TotalRecords     int64 `json:"total_records"`
	TotalStorage     int64 `json:"total_storage"`
	DatabaseSize     int64 `json:"database_size"`
}

// StatsService provides system and database statistics
type StatsService struct {
	service *Service
}

// NewStatsService creates a new stats service
func NewStatsService(service *Service) *StatsService {
	return &StatsService{
		service: service,
	}
}

// GetSystemStats returns current system statistics
func (s *StatsService) GetSystemStats(ctx context.Context) (*SystemStats, error) {
	stats := &SystemStats{
		Timestamp: time.Now(),
	}

	// CPU usage
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err == nil && len(cpuPercent) > 0 {
		stats.CPUUsage = cpuPercent[0]
	}

	// Memory usage
	memStat, err := mem.VirtualMemory()
	if err == nil {
		stats.MemoryUsage = memStat.UsedPercent
		stats.MemoryUsed = int64(memStat.Used)
		stats.MemoryTotal = int64(memStat.Total)
	}

	// Disk usage
	diskStat, err := disk.Usage("/")
	if err == nil {
		stats.DiskUsage = diskStat.UsedPercent
		stats.DiskUsed = int64(diskStat.Used)
		stats.DiskTotal = int64(diskStat.Total)
	}

	// Goroutines
	stats.Goroutines = runtime.NumGoroutine()
	
	// Uptime (simplified)
	stats.Uptime = "N/A"

	return stats, nil
}

// GetDatabaseStats returns database statistics
func (s *StatsService) GetDatabaseStats(ctx context.Context) (*DatabaseStats, error) {
	stats := &DatabaseStats{}

	// Count users
	s.service.db.WithContext(ctx).Model(&models.User{}).Count(&stats.TotalUsers)

	// Count collections
	s.service.db.WithContext(ctx).Model(&models.Collection{}).Count(&stats.TotalCollections)

	// Count collection records
	s.service.db.WithContext(ctx).Model(&models.CollectionRecord{}).Count(&stats.TotalRecords)

	// Calculate total storage used
	var totalSize int64
	s.service.db.WithContext(ctx).
		Model(&models.Object{}).
		Select("COALESCE(SUM(size), 0)").
		Scan(&totalSize)
	stats.TotalStorage = totalSize

	// Get database size (approximation for SQLite, more accurate for PostgreSQL)
	stats.DatabaseSize = s.getDatabaseSize(ctx)

	return stats, nil
}

// GetStorageStats returns storage statistics per bucket
func (s *StatsService) GetStorageStats(ctx context.Context) (map[string]int64, error) {
	bucketSizes := make(map[string]int64)

	var buckets []models.Bucket
	if err := s.service.db.WithContext(ctx).Find(&buckets).Error; err != nil {
		return nil, err
	}

	for _, bucket := range buckets {
		var size int64
		s.service.db.WithContext(ctx).
			Model(&models.Object{}).
			Where("bucket_id = ?", bucket.ID).
			Select("COALESCE(SUM(size), 0)").
			Scan(&size)
		bucketSizes[bucket.Name] = size
	}

	return bucketSizes, nil
}

// GetUserActivity returns recent user activity statistics
func (s *StatsService) GetUserActivity(ctx context.Context, days int) (map[string]interface{}, error) {
	since := time.Now().AddDate(0, 0, -days)
	activity := make(map[string]interface{})

	// Active users (logged in recently)
	var activeUsers int64
	s.service.db.WithContext(ctx).
		Model(&models.Session{}).
		Where("created_at > ?", since).
		Distinct("user_id").
		Count(&activeUsers)
	activity["active_users"] = activeUsers

	// New users
	var newUsers int64
	s.service.db.WithContext(ctx).
		Model(&models.User{}).
		Where("created_at > ?", since).
		Count(&newUsers)
	activity["new_users"] = newUsers

	// New records created
	var newRecords int64
	s.service.db.WithContext(ctx).
		Model(&models.CollectionRecord{}).
		Where("created_at > ?", since).
		Count(&newRecords)
	activity["new_records"] = newRecords

	// Files uploaded
	var filesUploaded int64
	s.service.db.WithContext(ctx).
		Model(&models.Object{}).
		Where("created_at > ?", since).
		Count(&filesUploaded)
	activity["files_uploaded"] = filesUploaded

	return activity, nil
}

// getDatabaseSize returns the database size in bytes
func (s *StatsService) getDatabaseSize(ctx context.Context) int64 {
	if s.service.db.IsSQLite() {
		// For SQLite, get file size
		var pageCount, pageSize int64
		s.service.db.DB.Raw("PRAGMA page_count").Scan(&pageCount)
		s.service.db.DB.Raw("PRAGMA page_size").Scan(&pageSize)
		return pageCount * pageSize
	} else if s.service.db.IsPostgres() {
		// For PostgreSQL, use pg_database_size
		var size int64
		s.service.db.DB.Raw("SELECT pg_database_size(current_database())").Scan(&size)
		return size
	}
	return 0
}

// GetDashboardStats returns dashboard statistics
func (s *StatsService) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	stats := &DashboardStats{
		StorageStats: make(map[string]int64),
	}

	// Get basic counts
	s.service.db.DB.Model(&models.User{}).Count(&stats.TotalUsers)
	s.service.db.DB.Model(&models.Collection{}).Count(&stats.TotalCollections)
	s.service.db.DB.Model(&models.CollectionRecord{}).Count(&stats.TotalRecords)

	// Get storage statistics
	var totalSize int64
	s.service.db.DB.Model(&models.Object{}).
		Select("COALESCE(SUM(size), 0)").
		Scan(&totalSize)
	stats.TotalStorage = totalSize
	stats.FormattedStorage = FormatBytes(totalSize)

	// Storage stats map
	stats.StorageStats["total_size"] = totalSize
	
	// Count files
	var totalFiles int64
	s.service.db.DB.Model(&models.Object{}).Count(&totalFiles)
	stats.StorageStats["total_files"] = totalFiles
	
	// Count images
	var totalImages int64
	s.service.db.DB.Model(&models.Object{}).
		Where("content_type LIKE 'image/%'").
		Count(&totalImages)
	stats.StorageStats["total_images"] = totalImages
	
	// Recent files (last 7 days)
	var recentFiles int64
	s.service.db.DB.Model(&models.Object{}).
		Where("created_at > ?", time.Now().AddDate(0, 0, -7)).
		Count(&recentFiles)
	stats.StorageStats["recent_files"] = recentFiles

	// Get database size
	stats.DatabaseSize = s.getDatabaseSize(ctx)
	stats.FormattedDBSize = FormatBytes(stats.DatabaseSize)

	// Get system stats
	systemStats, err := s.GetSystemStats(ctx)
	if err == nil {
		stats.SystemStats = systemStats
	}

	// Active users (last 24 hours)
	s.service.db.DB.Model(&models.User{}).
		Where("updated_at > ?", time.Now().Add(-24*time.Hour)).
		Count(&stats.ActiveUsers)

	// API requests (simplified - count logs)
	s.service.db.DB.Model(&models.Log{}).
		Where("created_at > ?", time.Now().Add(-24*time.Hour)).
		Count(&stats.APIRequests)

	// Initialize chart data with empty slices
	stats.UserGrowth = []ChartDataPoint{}
	stats.APIActivity = []ChartDataPoint{}
	stats.LogStats = []ChartDataPoint{}

	// Populate chart data (last 7 days)
	for i := 6; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i)
		dateStr := date.Format("Jan 2")
		
		// User growth
		var userCount int64
		s.service.db.DB.Model(&models.User{}).
			Where("DATE(created_at) = DATE(?)", date).
			Count(&userCount)
		stats.UserGrowth = append(stats.UserGrowth, ChartDataPoint{
			Label: dateStr,
			Value: float64(userCount),
		})
		
		// API activity
		var apiCount int64
		s.service.db.DB.Model(&models.Log{}).
			Where("DATE(created_at) = DATE(?)", date).
			Count(&apiCount)
		stats.APIActivity = append(stats.APIActivity, ChartDataPoint{
			Label: dateStr,
			Value: float64(apiCount),
		})
		
		// Log stats
		stats.LogStats = append(stats.LogStats, ChartDataPoint{
			Label: dateStr,
			Value: float64(apiCount), // Using same data for simplicity
		})
	}

	return stats, nil
}