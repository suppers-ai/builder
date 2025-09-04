package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

const (
	baseURL      = "http://localhost:8093"
	testEmail    = "admin@example.com"
	testPassword = "Test123456789!"
)

type LoginResponse struct {
	Token string `json:"token"`
	User  struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	} `json:"user"`
}

type DownloadURLResponse struct {
	URL       string    `json:"url"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	FileSize  int64     `json:"file_size"`
	Method    string    `json:"method"`
}

func main() {
	fmt.Println("=== Testing Unified Download System with Callbacks ===")
	
	// Step 1: Login
	fmt.Println("\n1. Logging in...")
	token, userID := login()
	if token == "" {
		fmt.Println("❌ Login failed")
		return
	}
	fmt.Printf("✅ Logged in. User ID: %s\n", userID)
	
	// Step 2: Create test bucket
	fmt.Println("\n2. Creating test bucket...")
	bucketName := fmt.Sprintf("test-presigned-%d", time.Now().Unix())
	if !createBucket(token, bucketName) {
		fmt.Println("❌ Failed to create bucket")
		return
	}
	fmt.Printf("✅ Created bucket: %s\n", bucketName)
	
	// Step 3: Upload a test file
	fmt.Println("\n3. Uploading test file...")
	testContent := bytes.Repeat([]byte("Hello World! "), 1000) // ~13KB
	fileSize := int64(len(testContent))
	objectID := uploadFile(token, bucketName, testContent, "test-file.txt")
	if objectID == "" {
		fmt.Println("❌ Failed to upload file")
		cleanup(token, bucketName)
		return
	}
	fmt.Printf("✅ Uploaded file (ID: %s, Size: %d bytes)\n", objectID, fileSize)
	
	// Step 4: Generate download URL
	fmt.Println("\n4. Generating download URL...")
	downloadResp := generateDownloadURL(token, bucketName, objectID)
	if downloadResp == nil {
		fmt.Println("❌ Failed to generate download URL")
		cleanup(token, bucketName)
		return
	}
	fmt.Printf("✅ Generated download URL:\n")
	fmt.Printf("   Method: %s\n", downloadResp.Method)
	fmt.Printf("   Token: %s...\n", downloadResp.Token[:8])
	fmt.Printf("   URL: %s\n", downloadResp.URL)
	fmt.Printf("   Expires: %s\n", downloadResp.ExpiresAt.Format("15:04:05"))
	
	// Step 5: Download using the generated URL (no auth needed)
	fmt.Println("\n5. Downloading file using generated URL...")
	downloadedContent := downloadUsingURL(downloadResp.URL)
	if downloadedContent == nil {
		fmt.Println("❌ Failed to download using URL")
	} else {
		fmt.Printf("✅ Downloaded %d bytes\n", len(downloadedContent))
		
		// Verify content
		if bytes.Equal(downloadedContent, testContent) {
			fmt.Println("✅ Content matches!")
		} else {
			fmt.Printf("⚠️  Content mismatch: got %d bytes, expected %d bytes\n", 
				len(downloadedContent), len(testContent))
		}
	}
	
	// Step 6: Send download callback
	fmt.Println("\n6. Sending download completion callback...")
	if sendCallback(token, downloadResp.Token, int64(len(downloadedContent)), true) {
		fmt.Println("✅ Callback sent successfully")
	} else {
		fmt.Println("⚠️  Failed to send callback")
	}
	
	// Step 7: Test token expiry/reuse prevention
	fmt.Println("\n7. Testing token reuse prevention...")
	redownloadContent := downloadUsingURL(downloadResp.URL)
	if redownloadContent != nil && downloadResp.Method == "token" {
		fmt.Println("⚠️  Token can still be used after callback (might be within cache period)")
	} else if redownloadContent == nil && downloadResp.Method == "token" {
		fmt.Println("✅ Token properly restricted after use")
	} else if downloadResp.Method == "direct" {
		fmt.Println("✅ Direct S3 URL still works (as expected)")
	}
	
	// Cleanup
	fmt.Println("\n8. Cleaning up...")
	cleanup(token, bucketName)
	fmt.Println("✅ Test completed!")
}

func login() (string, string) {
	payload := map[string]string{
		"email":    testEmail,
		"password": testPassword,
	}
	
	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(baseURL+"/api/auth/login", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", ""
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return "", ""
	}
	
	var loginResp LoginResponse
	json.NewDecoder(resp.Body).Decode(&loginResp)
	return loginResp.Token, loginResp.User.ID
}

func createBucket(token, bucketName string) bool {
	payload := map[string]interface{}{
		"name":   bucketName,
		"public": false,
	}
	
	jsonData, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", baseURL+"/api/storage/buckets", bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	
	return resp.StatusCode == http.StatusCreated
}

func uploadFile(token, bucketName string, content []byte, filename string) string {
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)
	
	part, _ := writer.CreateFormFile("file", filename)
	part.Write(content)
	writer.Close()
	
	req, _ := http.NewRequest("POST", baseURL+"/api/storage/buckets/"+bucketName+"/upload", &requestBody)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		return ""
	}
	
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	
	if id, ok := result["id"].(string); ok {
		return id
	}
	return ""
}

func generateDownloadURL(token, bucketName, objectID string) *DownloadURLResponse {
	req, _ := http.NewRequest("GET", 
		fmt.Sprintf("%s/api/storage/buckets/%s/objects/%s/download-url?expiry=10m", 
			baseURL, bucketName, objectID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("Error response: %s\n", body)
		return nil
	}
	
	var result DownloadURLResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil
	}
	
	return &result
}

func downloadUsingURL(url string) []byte {
	resp, err := http.Get(url)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil
	}
	
	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil
	}
	
	return content
}

func sendCallback(token, downloadToken string, bytesDownloaded int64, completed bool) bool {
	payload := map[string]interface{}{
		"token":            downloadToken,
		"bytes_downloaded": bytesDownloaded,
		"completed":        completed,
	}
	
	jsonData, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", baseURL+"/api/storage/download-callback", bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	
	return resp.StatusCode == http.StatusOK
}

func cleanup(token, bucketName string) {
	// Delete bucket (this should cascade delete objects)
	req, _ := http.NewRequest("DELETE", baseURL+"/api/storage/buckets/"+bucketName, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	
	client := &http.Client{}
	client.Do(req)
}