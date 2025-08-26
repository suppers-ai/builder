package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/suppers-ai/storageadapter"
	"github.com/suppers-ai/storageadapter/config"
	"github.com/suppers-ai/storageadapter/metadata"
)

func main() {
	// Initialize configuration from environment
	cfg := config.NewFromEnv()

	// Override for local development if needed
	if cfg.S3Bucket == "" {
		cfg.S3Bucket = "test-bucket"
	}

	// Initialize the storage adapter
	adapter, err := config.InitializeAdapter(cfg)
	if err != nil {
		log.Fatal("Failed to initialize adapter:", err)
	}

	ctx := context.Background()

	// Example user ID
	userID := uuid.New()

	// Example 1: Upload a file
	fmt.Println("=== Example 1: Upload a file ===")
	content := []byte("Hello, World! This is a test file.")
	reader := bytes.NewReader(content)

	uploadResult, err := adapter.Upload(ctx, reader, int64(len(content)), &storageadapter.UploadOptions{
		UserID:   userID,
		Name:     "test.txt",
		MimeType: "text/plain",
		Metadata: map[string]interface{}{
			"source": "example",
			"version": "1.0",
		},
	})
	if err != nil {
		log.Printf("Failed to upload: %v", err)
	} else {
		fmt.Printf("Uploaded file with ID: %s\n", uploadResult.ObjectID)
		fmt.Printf("File path: %s\n", uploadResult.FilePath)
		fmt.Printf("File size: %d bytes\n", uploadResult.Size)
	}

	// Example 2: Create a folder structure
	fmt.Println("\n=== Example 2: Create folder structure ===")
	documentsFolder, err := adapter.CreateFolder(ctx, userID, "Documents", nil)
	if err != nil {
		log.Printf("Failed to create folder: %v", err)
	} else {
		fmt.Printf("Created folder: %s (ID: %s)\n", documentsFolder.Name, documentsFolder.ID)
	}

	projectsFolder, err := adapter.CreateFolder(ctx, userID, "Projects", &documentsFolder.ID)
	if err != nil {
		log.Printf("Failed to create subfolder: %v", err)
	} else {
		fmt.Printf("Created subfolder: %s (ID: %s)\n", projectsFolder.Name, projectsFolder.ID)
	}

	// Example 3: Upload a file to a folder
	fmt.Println("\n=== Example 3: Upload file to folder ===")
	projectContent := []byte("Project documentation content")
	projectReader := bytes.NewReader(projectContent)

	projectUpload, err := adapter.Upload(ctx, projectReader, int64(len(projectContent)), &storageadapter.UploadOptions{
		UserID:         userID,
		ParentFolderID: &projectsFolder.ID,
		Name:           "README.md",
		MimeType:       "text/markdown",
	})
	if err != nil {
		log.Printf("Failed to upload to folder: %v", err)
	} else {
		fmt.Printf("Uploaded file to folder: %s\n", projectUpload.ObjectID)
	}

	// Example 4: List objects
	fmt.Println("\n=== Example 4: List objects ===")
	objects, err := adapter.ListObjects(ctx, &metadata.ListObjectsOptions{
		UserID: userID,
		Limit:  10,
	})
	if err != nil {
		log.Printf("Failed to list objects: %v", err)
	} else {
		fmt.Println("User's files and folders:")
		for _, obj := range objects {
			fmt.Printf("  - %s (%s) - %d bytes\n", obj.Name, obj.ObjectType, obj.FileSize)
		}
	}

	// Example 5: Share a file
	fmt.Println("\n=== Example 5: Share a file ===")
	if uploadResult != nil {
		shareResult, err := adapter.Share(ctx, &storageadapter.ShareOptions{
			ObjectID:        uploadResult.ObjectID,
			PermissionLevel: metadata.PermissionView,
			CreatedBy:       userID,
			GenerateLink:    true,
			ExpiresAt:       timePtr(time.Now().Add(24 * time.Hour)),
		})
		if err != nil {
			log.Printf("Failed to share: %v", err)
		} else {
			fmt.Printf("Created share with ID: %s\n", shareResult.ShareID)
			if shareResult.ShareURL != nil {
				fmt.Printf("Share URL: %s\n", *shareResult.ShareURL)
			}
		}

		// Share with specific user
		anotherUserID := uuid.New()
		userShare, err := adapter.Share(ctx, &storageadapter.ShareOptions{
			ObjectID:         uploadResult.ObjectID,
			SharedWithUserID: &anotherUserID,
			PermissionLevel:  metadata.PermissionEdit,
			CreatedBy:        userID,
		})
		if err != nil {
			log.Printf("Failed to share with user: %v", err)
		} else {
			fmt.Printf("Shared with user %s (Share ID: %s)\n", anotherUserID, userShare.ShareID)
		}
	}

	// Example 6: Download a file
	fmt.Println("\n=== Example 6: Download a file ===")
	if uploadResult != nil {
		var downloadBuffer bytes.Buffer
		err = adapter.Download(ctx, uploadResult.ObjectID, userID, &downloadBuffer)
		if err != nil {
			log.Printf("Failed to download: %v", err)
		} else {
			fmt.Printf("Downloaded content: %s\n", downloadBuffer.String())
		}
	}

	// Example 7: Get quota information
	fmt.Println("\n=== Example 7: Get quota information ===")
	quota, err := adapter.GetQuota(ctx, userID)
	if err != nil {
		log.Printf("Failed to get quota: %v", err)
	} else {
		fmt.Printf("Storage used: %d / %d bytes\n", quota.StorageUsed, quota.MaxStorageBytes)
		fmt.Printf("Bandwidth used: %d / %d bytes\n", quota.BandwidthUsed, quota.MaxBandwidthBytes)
	}

	// Example 8: Generate presigned URL
	fmt.Println("\n=== Example 8: Generate presigned URL ===")
	if uploadResult != nil {
		presignedURL, err := adapter.GeneratePresignedURL(ctx, uploadResult.ObjectID, userID, 15*time.Minute)
		if err != nil {
			log.Printf("Failed to generate presigned URL: %v", err)
		} else {
			fmt.Printf("Presigned URL (valid for 15 minutes): %s\n", presignedURL)
		}
	}

	// Example 9: Move a file
	fmt.Println("\n=== Example 9: Move a file ===")
	if uploadResult != nil && documentsFolder != nil {
		err = adapter.Move(ctx, uploadResult.ObjectID, userID, &documentsFolder.ID, "moved-test.txt")
		if err != nil {
			log.Printf("Failed to move file: %v", err)
		} else {
			fmt.Println("File moved successfully")
		}
	}

	// Example 10: Copy a file
	fmt.Println("\n=== Example 10: Copy a file ===")
	if projectUpload != nil {
		copiedObj, err := adapter.Copy(ctx, projectUpload.ObjectID, userID, &documentsFolder.ID, "README-copy.md")
		if err != nil {
			log.Printf("Failed to copy file: %v", err)
		} else {
			fmt.Printf("File copied with new ID: %s\n", copiedObj.ID)
		}
	}

	// Example 11: Delete a file
	fmt.Println("\n=== Example 11: Delete a file ===")
	if uploadResult != nil {
		err = adapter.Delete(ctx, uploadResult.ObjectID, userID)
		if err != nil {
			log.Printf("Failed to delete: %v", err)
		} else {
			fmt.Println("File deleted successfully")
		}
	}

	fmt.Println("\n=== Examples completed ===")
}

func timePtr(t time.Time) *time.Time {
	return &t
}

func init() {
	// Set environment variables for local testing if not set
	if os.Getenv("DATABASE_URL") == "" {
		os.Setenv("DATABASE_URL", "postgresql://localhost/storageadapter_test?sslmode=disable")
	}
	if os.Getenv("S3_ENDPOINT") == "" {
		// For local testing with MinIO or LocalStack
		os.Setenv("S3_ENDPOINT", "http://localhost:9000")
		os.Setenv("S3_USE_PATH_STYLE", "true")
		os.Setenv("S3_ACCESS_KEY_ID", "minioadmin")
		os.Setenv("S3_SECRET_ACCESS_KEY", "minioadmin")
	}
}