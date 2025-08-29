package web

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/dufflebagbase/constants"
	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/views/pages"
	"github.com/suppers-ai/logger"
)

// StoragePage renders the storage management page
// TODO: Fix storage page templating issues with onclick handlers
func StoragePage(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		userEmail, _ := h.GetUserEmail(r)
		ctx := h.NewContext()
		
		// Get selected bucket from query params
		selectedBucket := r.URL.Query().Get("bucket")
		selectedPath := r.URL.Query().Get("path")
		
		// Get pagination params for storage
		page, pageSize, _ := h.GetPaginationWithSize(r, constants.StoragePageSize)
		
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
				Public:    b.Public,
			}
			totalFiles += b.FileCount
			totalSize += b.TotalSize
		}
		
		var files []pages.StorageFile
		var folders []string
		totalItemsInBucket := 0
		
		// If a bucket is selected, get its files and folders
		if selectedBucket != "" {
			// Get folders and files for the current path
			objects, folderList, err := svc.Storage().ListFilesWithFolders(ctx, selectedBucket, selectedPath)
			if err != nil {
				svc.Logger().Error(ctx, "Failed to list files", 
					logger.String("bucket", selectedBucket),
					logger.String("path", selectedPath),
					logger.Err(err))
			} else {
				folders = folderList
				totalItemsInBucket = len(objects) + len(folderList)
				
				// Convert objects to files
				for _, obj := range objects {
					files = append(files, pages.StorageFile{
						Name:         obj.Name,
						Size:         obj.Size,
						ContentType:  obj.MimeType,
						LastModified: obj.UpdatedAt,
						URL:          fmt.Sprintf("/storage/%s/%s/%s", selectedBucket, obj.Path, obj.Name),
						Path:         obj.Path,
					})
				}
			}
		}
		
		// Build breadcrumb from path
		var breadcrumbs []pages.Breadcrumb
		if selectedBucket != "" {
			breadcrumbs = append(breadcrumbs, pages.Breadcrumb{
				Name: selectedBucket,
				Path: fmt.Sprintf("/storage?bucket=%s", selectedBucket),
			})
			
			if selectedPath != "" {
				parts := strings.Split(strings.TrimSuffix(selectedPath, "/"), "/")
				currentPath := ""
				for _, part := range parts {
					if part != "" {
						currentPath = path.Join(currentPath, part)
						breadcrumbs = append(breadcrumbs, pages.Breadcrumb{
							Name: part,
							Path: fmt.Sprintf("/storage?bucket=%s&path=%s", selectedBucket, currentPath),
						})
					}
				}
			}
		}
		
		data := pages.StoragePageData{
			UserEmail:      userEmail,
			Buckets:        pageBuckets,
			SelectedBucket: selectedBucket,
			SelectedPath:   selectedPath,
			Files:          files,
			Folders:        folders,
			Breadcrumbs:    breadcrumbs,
			TotalFiles:     totalFiles,
			TotalSize:      totalSize,
			CurrentPage:    page,
			PageSize:       pageSize,
			TotalItems:     totalItemsInBucket,
		}
		
		h.RenderWithHTMX(w, r, pages.StoragePage(data), pages.StoragePartial(data))
	}
}

// CreateBucketHandler handles bucket creation
func CreateBucketHandler(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		
		var req struct {
			Name   string `json:"name"`
			Public bool   `json:"public"`
		}
		
		if err := h.ParseJSON(r, &req); err != nil {
			h.JSONError(w, http.StatusBadRequest, "Invalid request")
			return
		}
		
		if req.Name == "" {
			h.JSONError(w, http.StatusBadRequest, "Bucket name is required")
			return
		}
		
		_, err := svc.Storage().CreateBucket(ctx, req.Name, req.Public)
		if err != nil {
			h.LogError(ctx, "Failed to create bucket", err)
			h.JSONError(w, http.StatusInternalServerError, "Failed to create bucket")
			return
		}
		
		h.JSONSuccessMessage(w, constants.MsgCreated)
	}
}

// DeleteBucketHandler handles bucket deletion
func DeleteBucketHandler(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		bucketName := h.GetBucketFromPath(r)
		
		if bucketName == "" {
			h.JSONError(w, http.StatusBadRequest, constants.ErrBucketRequired)
			return
		}
		
		err := svc.Storage().DeleteBucket(ctx, bucketName)
		if err != nil {
			h.LogError(ctx, "Failed to delete bucket", err)
			h.JSONError(w, http.StatusInternalServerError, "Failed to delete bucket")
			return
		}
		
		h.JSONSuccessMessage(w, constants.MsgDeleted)
	}
}

// CreateFolderHandler handles folder creation
func CreateFolderHandler(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		
		var req struct {
			Bucket string `json:"bucket"`
			Path   string `json:"path"`
			Name   string `json:"name"`
		}
		
		if err := h.ParseJSON(r, &req); err != nil {
			h.JSONError(w, http.StatusBadRequest, "Invalid request")
			return
		}
		
		if req.Bucket == "" || req.Name == "" {
			h.JSONError(w, http.StatusBadRequest, "Bucket and folder name are required")
			return
		}
		
		// Create folder path
		folderPath := path.Join(req.Path, req.Name)
		if !strings.HasSuffix(folderPath, "/") {
			folderPath += "/"
		}
		
		err := svc.Storage().CreateFolder(ctx, req.Bucket, folderPath)
		if err != nil {
			h.LogError(ctx, "Failed to create folder", err)
			h.JSONError(w, http.StatusInternalServerError, "Failed to create folder")
			return
		}
		
		h.JSONSuccessMessage(w, constants.MsgCreated)
	}
}

// UploadFileHandler handles file uploads
func UploadFileHandler(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		
		// Parse multipart form (max 100MB)
		err := r.ParseMultipartForm(constants.MaxUploadSize)
		if err != nil {
			h.JSONError(w, http.StatusBadRequest, "Failed to parse form")
			return
		}
		
		bucket := r.FormValue("bucket")
		filePath := r.FormValue("path")
		
		if bucket == "" {
			h.JSONError(w, http.StatusBadRequest, constants.ErrBucketRequired)
			return
		}
		
		// Get the file
		file, header, err := r.FormFile("file")
		if err != nil {
			h.JSONError(w, http.StatusBadRequest, "Failed to get file")
			return
		}
		defer file.Close()
		
		// Read file content
		content, err := io.ReadAll(file)
		if err != nil {
			h.JSONError(w, http.StatusInternalServerError, "Failed to read file")
			return
		}
		
		// Upload the file (pass nil for userID since it's not required here)
		_, err = svc.Storage().UploadFileWithContent(ctx, bucket, filePath, header.Filename, content, header.Header.Get("Content-Type"), nil)
		if err != nil {
			h.LogError(ctx, "Failed to upload file", err)
			h.JSONError(w, http.StatusInternalServerError, "Failed to upload file")
			return
		}
		
		h.JSONSuccessData(w, constants.MsgCreated,
			map[string]interface{}{
				"name": header.Filename,
				"size": header.Size,
				"path": path.Join(filePath, header.Filename),
			})
	}
}

// DeleteFileHandler handles file deletion
func DeleteFileHandler(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		
		// Get the file path from the request body or query params
		var req struct {
			Path string `json:"path"`
		}
		
		if r.Method == "DELETE" {
			if err := h.ParseJSON(r, &req); err != nil {
				req.Path = r.URL.Query().Get("path")
			}
		}
		
		if bucket == "" || req.Path == "" {
			h.JSONError(w, http.StatusBadRequest, "Bucket and path are required")
			return
		}
		
		// Split path into directory and filename
		dir := path.Dir(req.Path)
		filename := path.Base(req.Path)
		if dir == "." {
			dir = ""
		}
		
		err := svc.Storage().DeleteFile(ctx, bucket, dir, filename)
		if err != nil {
			h.LogError(ctx, "Failed to delete file", err)
			h.JSONError(w, http.StatusInternalServerError, "Failed to delete file")
			return
		}
		
		h.JSONSuccess(w, "File deleted successfully")
	}
}

// DownloadFileHandler handles file downloads
func DownloadFileHandler(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		filePath := r.URL.Query().Get("path")
		
		if bucket == "" || filePath == "" {
			h.JSONError(w, http.StatusBadRequest, "Bucket and path are required")
			return
		}
		
		content, contentType, err := svc.Storage().GetFile(ctx, bucket, filePath)
		if err != nil {
			h.LogError(ctx, "Failed to get file", err)
			h.JSONError(w, http.StatusInternalServerError, "Failed to get file")
			return
		}
		
		// Set headers for download
		fileName := path.Base(filePath)
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileName))
		
		w.Write(content)
	}
}

// ViewFileHandler handles file viewing/editing
func ViewFileHandler(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		filePath := r.URL.Query().Get("path")
		
		if bucket == "" || filePath == "" {
			h.JSONError(w, http.StatusBadRequest, "Bucket and path are required")
			return
		}
		
		content, contentType, err := svc.Storage().GetFile(ctx, bucket, filePath)
		if err != nil {
			h.LogError(ctx, "Failed to get file", err)
			h.JSONError(w, http.StatusInternalServerError, "Failed to get file")
			return
		}
		
		// Check if it's an update request
		if r.Method == "POST" {
			// Update file content
			var req struct {
				Content string `json:"content"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, "Invalid request", http.StatusBadRequest)
				return
			}
			
			err = svc.Storage().UpdateFile(ctx, bucket, filePath, []byte(req.Content))
			if err != nil {
				svc.Logger().Error(ctx, "Failed to update file", logger.Err(err))
				http.Error(w, "Failed to update file", http.StatusInternalServerError)
				return
			}
			
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{"message": "File updated successfully"})
			return
		}
		
		// Return file content for viewing
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"content":     string(content),
			"contentType": contentType,
			"path":        filePath,
			"editable":    isTextFile(contentType),
		})
	}
}

// Helper function to check if file is editable
func isTextFile(contentType string) bool {
	textTypes := []string{
		"text/",
		"application/json",
		"application/xml",
		"application/javascript",
		"application/x-yaml",
		"application/toml",
	}
	
	for _, t := range textTypes {
		if strings.HasPrefix(contentType, t) {
			return true
		}
	}
	return false
}

// GenerateSignedURLHandler generates a signed URL for secure file access
func GenerateSignedURLHandler(svc *services.Service) http.HandlerFunc {
	h := NewBaseHandler(svc)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := h.NewContext()
		
		var req struct {
			Bucket string `json:"bucket"`
			Path   string `json:"path"`
			Expiry int    `json:"expiry"` // in seconds
		}
		
		if err := h.ParseJSON(r, &req); err != nil {
			h.JSONError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		
		// Validate expiry (min 60 seconds, max 1 year)
		if req.Expiry < 60 || req.Expiry > 31536000 {
			h.JSONError(w, http.StatusBadRequest, "Invalid expiry time (must be between 60 and 31536000 seconds)")
			return
		}
		
		// Generate signed URL
		signedURL, err := svc.Storage().GenerateSignedURL(ctx, req.Bucket, req.Path, time.Duration(req.Expiry)*time.Second)
		if err != nil {
			h.LogError(ctx, "Failed to generate signed URL", err)
			h.JSONError(w, http.StatusInternalServerError, "Failed to generate signed URL")
			return
		}
		
		h.JSONResponse(w, http.StatusOK, map[string]string{
			"url": signedURL,
		})
	}
}

// SignedDownloadHandler handles downloads via signed URLs
func SignedDownloadHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		vars := mux.Vars(r)
		bucketName := vars["bucket"]
		token := r.URL.Query().Get("token")
		
		if token == "" {
			http.Error(w, "Missing token", http.StatusBadRequest)
			return
		}
		
		// Validate the signed URL token
		valid, err := svc.Storage().ValidateSignedURL(ctx, token)
		if err != nil || !valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}
		
		// Get the path from the URL
		path := r.URL.Query().Get("path")
		if path == "" {
			http.Error(w, "Missing path", http.StatusBadRequest)
			return
		}
		
		// Get the file content
		content, contentType, err := svc.Storage().GetFile(ctx, bucketName, path)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to get file for signed download", 
				logger.String("bucket", bucketName),
				logger.String("path", path),
				logger.Err(err))
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		
		// Set appropriate headers
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filepath.Base(path)))
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(content)))
		
		// Write the file content
		w.Write(content)
	}
}