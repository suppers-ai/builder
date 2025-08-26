package web

import (
	"context"
	"net/http"
	"strconv"

	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/views/pages"
	"github.com/suppers-ai/logger"
)

// StoragePage renders the storage management page
func StoragePage(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get authboss session store
		store := svc.Auth().SessionStore()
		session, _ := store.Get(r, "dufflebag-session")
		userEmail, _ := session.Values["user_email"].(string)
		
		ctx := context.Background()
		
		// Get selected bucket from query params
		selectedBucket := r.URL.Query().Get("bucket")
		
		// Get pagination params
		page := 1
		if p := r.URL.Query().Get("page"); p != "" {
			if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
				page = parsed
			}
		}
		
		pageSize := 50
		offset := (page - 1) * pageSize
		
		// Get all buckets
		buckets, err := svc.Storage().ListBuckets(ctx)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to list buckets", logger.Err(err))
			buckets = []services.BucketInfo{}
		}
		
		// Convert to page data format
		pageBuckets := make([]pages.StorageBucket, len(buckets))
		totalFiles := 0
		totalSize := int64(0)
		
		for i, b := range buckets {
			pageBuckets[i] = pages.StorageBucket{
				Name:      b.Name,
				FileCount: b.FileCount,
				TotalSize: b.TotalSize,
				CreatedAt: b.CreatedAt,
			}
			totalFiles += b.FileCount
			totalSize += b.TotalSize
		}
		
		var files []pages.StorageFile
		
		// If a bucket is selected, get its files
		if selectedBucket != "" {
			storageFiles, _, err := svc.Storage().ListFiles(ctx, selectedBucket, "", offset, pageSize)
			if err != nil {
				svc.Logger().Error(ctx, "Failed to list files", 
					logger.String("bucket", selectedBucket),
					logger.Err(err))
				files = []pages.StorageFile{}
			} else {
				// Convert to page data format
				files = make([]pages.StorageFile, len(storageFiles))
				for i, f := range storageFiles {
					files[i] = pages.StorageFile{
						Name:         f.Name,
						Size:         f.Size,
						ContentType:  f.ContentType,
						LastModified: f.LastModified,
						URL:          f.PublicURL,
					}
				}
			}
		}
		
		data := pages.StoragePageData{
			UserEmail:      userEmail,
			Buckets:        pageBuckets,
			SelectedBucket: selectedBucket,
			Files:          files,
			TotalFiles:     totalFiles,
			TotalSize:      totalSize,
			CurrentPage:    page,
			PageSize:       pageSize,
		}
		
		component := pages.StoragePage(data)
		Render(w, r, component)
	}
}