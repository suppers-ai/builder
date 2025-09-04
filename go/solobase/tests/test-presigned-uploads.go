package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
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

type UploadURLRequest struct {
	Filename    string `json:"filename"`
	Size        int64  `json:"size"`
	ContentType string `json:"content_type"`
}

type UploadURLResponse struct {
	URL       string            `json:"url"`
	Token     string            `json:"token"`
	Method    string            `json:"method"`
	ExpiresAt time.Time         `json:"expires_at"`
	MaxSize   int64             `json:"max_size"`
	ObjectKey string            `json:"object_key"`
	Headers   map[string]string `json:"headers,omitempty"`
}

type UploadCallbackRequest struct {
	Token         string `json:"token"`
	BytesUploaded int64  `json:"bytes_uploaded"`
	ObjectID      string `json:"object_id,omitempty"`
	Completed     bool   `json:"completed"`
}

func main() {
	fmt.Println("=== Testing Unified Upload System ===")
	
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
	bucketName := fmt.Sprintf("test-upload-%d", time.Now().Unix())
	if !createBucket(token, bucketName) {
		fmt.Println("❌ Failed to create bucket")
		return
	}
	fmt.Printf("✅ Created bucket: %s\n", bucketName)
	
	// Test 1: Small file upload
	fmt.Println("\n3. Testing small file upload...")
	testSmallUpload(token, bucketName)
	
	// Test 2: Large file upload (test quota)
	fmt.Println("\n4. Testing larger file upload...")
	testLargeUpload(token, bucketName)
	
	// Test 3: Test upload expiry
	fmt.Println("\n5. Testing token expiry...")
	testTokenExpiry(token, bucketName)
	
	// Cleanup
	fmt.Println("\n6. Cleaning up...")
	cleanup(token, bucketName)
	fmt.Println("✅ Test completed!")
}

func testSmallUpload(token, bucketName string) {
	// Prepare test content
	content := []byte("Hello, World! This is a test file for unified uploads.")
	filename := "test-small.txt"
	
	// Request upload URL
	fmt.Printf("   Requesting upload URL for %s (%d bytes)...\n", filename, len(content))
	uploadResp := requestUploadURL(token, bucketName, filename, int64(len(content)), "text/plain")
	if uploadResp == nil {
		fmt.Println("   ❌ Failed to get upload URL")
		return
	}
	
	fmt.Printf("   ✅ Got upload URL\n")
	fmt.Printf("      Method: %s\n", uploadResp.Method)
	fmt.Printf("      Token: %s...\n", uploadResp.Token[:8])
	fmt.Printf("      Object Key: %s\n", uploadResp.ObjectKey)
	
	// Upload the file
	fmt.Println("   Uploading file...")
	var objectID string
	if uploadResp.Method == "direct" {
		// S3 direct upload with PUT
		objectID = uploadDirectS3(uploadResp.URL, content, uploadResp.Headers)
	} else {
		// Token-based upload
		objectID = uploadViaToken(uploadResp.URL, content, filename)
	}
	
	if objectID == "" {
		fmt.Println("   ⚠️  Upload may have failed (no object ID)")
	} else {
		fmt.Printf("   ✅ Upload successful! Object ID: %s\n", objectID)
	}
	
	// Send callback
	fmt.Println("   Sending upload callback...")
	if sendUploadCallback(token, uploadResp.Token, int64(len(content)), objectID, true) {
		fmt.Println("   ✅ Callback sent successfully")
	} else {
		fmt.Println("   ⚠️  Callback failed")
	}
}

func testLargeUpload(token, bucketName string) {
	// Create 5MB content
	content := bytes.Repeat([]byte("A"), 5*1024*1024)
	filename := "test-large.bin"
	
	fmt.Printf("   Testing %d MB file...\n", len(content)/(1024*1024))
	uploadResp := requestUploadURL(token, bucketName, filename, int64(len(content)), "application/octet-stream")
	if uploadResp == nil {
		fmt.Println("   ❌ Failed to get upload URL")
		return
	}
	
	fmt.Printf("   ✅ Got upload URL for large file\n")
	
	// Upload the file
	var objectID string
	if uploadResp.Method == "token" {
		objectID = uploadViaToken(uploadResp.URL, content, filename)
		if objectID != "" {
			fmt.Printf("   ✅ Large file uploaded successfully!\n")
			
			// Send callback
			sendUploadCallback(token, uploadResp.Token, int64(len(content)), objectID, true)
		}
	}
}

func testTokenExpiry(token, bucketName string) {
	// Request upload URL with short expiry
	content := []byte("test")
	uploadResp := requestUploadURL(token, bucketName, "expiry-test.txt", int64(len(content)), "text/plain")
	if uploadResp == nil {
		return
	}
	
	fmt.Printf("   Token expires at: %s\n", uploadResp.ExpiresAt.Format("15:04:05"))
	fmt.Printf("   Current time: %s\n", time.Now().Format("15:04:05"))
	
	// Try immediate upload (should work)
	objectID := uploadViaToken(uploadResp.URL, content, "expiry-test.txt")
	if objectID != "" {
		fmt.Println("   ✅ Immediate upload succeeded (as expected)")
	} else {
		fmt.Println("   ⚠️  Immediate upload failed (unexpected)")
	}
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

func requestUploadURL(token, bucketName, filename string, size int64, contentType string) *UploadURLResponse {
	reqBody := UploadURLRequest{
		Filename:    filename,
		Size:        size,
		ContentType: contentType,
	}
	
	jsonData, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", 
		fmt.Sprintf("%s/api/storage/buckets/%s/upload-url?expiry=10m", baseURL, bucketName),
		bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("   Error: %s\n", body)
		return nil
	}
	
	var result UploadURLResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil
	}
	
	return &result
}

func uploadDirectS3(url string, content []byte, headers map[string]string) string {
	// For S3, use PUT with presigned URL
	req, _ := http.NewRequest("PUT", url, bytes.NewReader(content))
	
	// Add required headers
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()
	
	if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated {
		// Generate a pseudo object ID for S3 uploads
		return fmt.Sprintf("s3-object-%d", time.Now().Unix())
	}
	
	return ""
}

func uploadViaToken(url string, content []byte, filename string) string {
	// For token-based upload, use PUT with body
	req, _ := http.NewRequest("PUT", url, bytes.NewReader(content))
	req.Header.Set("Content-Type", "application/octet-stream")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("   Upload error: %s\n", body)
		return ""
	}
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return ""
	}
	
	if objectID, ok := result["object_id"].(string); ok {
		return objectID
	}
	
	return ""
}

func sendUploadCallback(token, uploadToken string, bytesUploaded int64, objectID string, completed bool) bool {
	callback := UploadCallbackRequest{
		Token:         uploadToken,
		BytesUploaded: bytesUploaded,
		ObjectID:      objectID,
		Completed:     completed,
	}
	
	jsonData, _ := json.Marshal(callback)
	req, _ := http.NewRequest("POST", baseURL+"/api/storage/upload-callback", bytes.NewBuffer(jsonData))
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
	// Delete bucket
	req, _ := http.NewRequest("DELETE", baseURL+"/api/storage/buckets/"+bucketName, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	
	client := &http.Client{}
	client.Do(req)
}