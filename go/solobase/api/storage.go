package api

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/solobase/services"
)

func HandleGetStorageBuckets(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		buckets, err := storageService.GetBuckets()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to fetch buckets")
			return
		}

		respondWithJSON(w, http.StatusOK, buckets)
	}
}

func HandleGetBucketObjects(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		
		// Get path from query parameters
		path := r.URL.Query().Get("path")

		objects, err := storageService.GetBucketObjectsWithPath(bucket, path)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to fetch objects")
			return
		}

		respondWithJSON(w, http.StatusOK, objects)
	}
}

func HandleCreateBucket(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request struct {
			Name   string `json:"name"`
			Public bool   `json:"public"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		
		if request.Name == "" {
			respondWithError(w, http.StatusBadRequest, "Bucket name is required")
			return
		}
		
		err := storageService.CreateBucket(request.Name, request.Public)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		
		respondWithJSON(w, http.StatusCreated, map[string]interface{}{
			"message": "Bucket created successfully",
			"name":    request.Name,
		})
	}
}

func HandleDeleteBucket(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		
		err := storageService.DeleteBucket(bucket)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		
		respondWithJSON(w, http.StatusOK, map[string]string{
			"message": "Bucket deleted successfully",
		})
	}
}

func HandleUploadFile(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		bucket := vars["bucket"]

		// Parse multipart form
		err := r.ParseMultipartForm(32 << 20) // 32MB max
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Failed to parse form")
			return
		}

		file, header, err := r.FormFile("file")
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Failed to get file")
			return
		}
		defer file.Close()

		// Get path from form (optional)
		path := r.FormValue("path")
		
		// Construct full key with path
		key := header.Filename
		if path != "" {
			// Clean up path - remove leading/trailing slashes
			path = strings.Trim(path, "/")
			if path != "" {
				key = path + "/" + header.Filename
			}
		}

		// Get content type
		contentType := header.Header.Get("Content-Type")
		if contentType == "" {
			contentType = "application/octet-stream"
		}

		// Upload file directly using the reader with full key including path
		object, err := storageService.UploadFile(bucket, key, file, header.Size, contentType)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to upload file: " + err.Error())
			return
		}

		respondWithJSON(w, http.StatusCreated, object)
	}
}

func HandleDeleteObject(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		objectID := vars["id"]

		err := storageService.DeleteObject(bucket, objectID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to delete object: " + err.Error())
			return
		}

		respondWithJSON(w, http.StatusOK, map[string]string{"message": "Object deleted successfully"})
	}
}

func HandleDownloadObject(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		objectID := vars["id"]
		
		// Get the file from storage service
		reader, filename, contentType, err := storageService.GetObject(bucket, objectID)
		if err != nil {
			respondWithError(w, http.StatusNotFound, "Object not found")
			return
		}
		defer reader.Close()
		
		// Set headers for download
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", "attachment; filename=\""+filename+"\"")
		
		// Stream the file to the response
		if _, err := io.Copy(w, reader); err != nil {
			// Log error but can't send error response as headers are already sent
			return
		}
	}
}

func HandleRenameObject(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		objectID := vars["id"]
		
		var request struct {
			NewName string `json:"newName"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		
		if request.NewName == "" {
			respondWithError(w, http.StatusBadRequest, "New name is required")
			return
		}
		
		if err := storageService.RenameObject(bucket, objectID, request.NewName); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		
		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"message": "Object renamed successfully",
		})
	}
}

func HandleCreateFolder(storageService *services.StorageService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		bucket := vars["bucket"]
		
		var request struct {
			Name string `json:"name"`
			Path string `json:"path"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		
		if request.Name == "" {
			respondWithError(w, http.StatusBadRequest, "Folder name is required")
			return
		}
		
		// Construct the full folder path
		folderPath := request.Name
		if request.Path != "" {
			folderPath = strings.TrimSuffix(request.Path, "/") + "/" + request.Name
		}
		
		err := storageService.CreateFolder(bucket, folderPath)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create folder: " + err.Error())
			return
		}
		
		respondWithJSON(w, http.StatusCreated, map[string]string{
			"message": "Folder created successfully",
			"folder":  folderPath,
		})
	}
}