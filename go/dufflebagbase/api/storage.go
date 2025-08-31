package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/suppers-ai/dufflebagbase/services"
)

type StorageObject struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Bucket    string    `json:"bucket"`
	Size      int64     `json:"size"`
	MimeType  string    `json:"mime_type"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	PublicURL string    `json:"public_url,omitempty"`
}

type StorageBucket struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Public       bool      `json:"public"`
	CreatedAt    time.Time `json:"created_at"`
	ObjectsCount int       `json:"objects_count"`
	TotalSize    int64     `json:"total_size"`
}

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

		objects, err := storageService.GetBucketObjects(bucket)
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

		// Get content type
		contentType := header.Header.Get("Content-Type")
		if contentType == "" {
			contentType = "application/octet-stream"
		}

		// Upload file directly using the reader
		object, err := storageService.UploadFile(bucket, header.Filename, file, header.Size, contentType)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to upload file")
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
			respondWithError(w, http.StatusInternalServerError, "Failed to delete object")
			return
		}

		respondWithJSON(w, http.StatusOK, map[string]string{"message": "Object deleted successfully"})
	}
}