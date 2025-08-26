package storage_test

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/suppers-ai/storage"
	_ "github.com/suppers-ai/storage/providers"
)

func ExampleStorage_basic() {
	config := &storage.Config{
		Provider:        storage.ProviderS3,
		Region:          "us-east-1",
		Bucket:          "my-bucket",
		AccessKeyID:     "your-access-key",
		SecretAccessKey: "your-secret-key",
	}

	store, err := storage.New(config)
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	data := []byte("Hello, World!")
	reader := bytes.NewReader(data)

	obj, err := store.Upload(ctx, "hello.txt", reader, &storage.UploadOptions{
		ContentType: "text/plain",
		Metadata: map[string]string{
			"author": "example",
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Uploaded object: %s (ETag: %s)\n", obj.Key, obj.ETag)

	body, err := store.Download(ctx, "hello.txt")
	if err != nil {
		log.Fatal(err)
	}
	defer body.Close()

	content, err := io.ReadAll(body)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Downloaded content: %s\n", string(content))
}

func ExampleStorage_signedURL() {
	config := &storage.Config{
		Provider:        storage.ProviderS3,
		Region:          "us-east-1",
		Bucket:          "my-bucket",
		AccessKeyID:     "your-access-key",
		SecretAccessKey: "your-secret-key",
	}

	store, err := storage.New(config)
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	uploadURL, err := store.GetSignedURL(ctx, "upload/file.pdf", &storage.SignedURLOptions{
		Method:      "PUT",
		Expires:     30 * time.Minute,
		ContentType: "application/pdf",
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Upload URL: %s\n", uploadURL)

	downloadURL, err := store.GetSignedURL(ctx, "documents/report.pdf", &storage.SignedURLOptions{
		Method:  "GET",
		Expires: 1 * time.Hour,
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Download URL: %s\n", downloadURL)
}

func ExampleStorage_listObjects() {
	config := &storage.Config{
		Provider:        storage.ProviderS3,
		Region:          "us-east-1",
		Bucket:          "my-bucket",
		AccessKeyID:     "your-access-key",
		SecretAccessKey: "your-secret-key",
	}

	store, err := storage.New(config)
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	objects, err := store.List(ctx, "images/", &storage.ListOptions{
		MaxKeys:   100,
		Delimiter: "/",
	})
	if err != nil {
		log.Fatal(err)
	}

	for _, obj := range objects {
		fmt.Printf("Object: %s (Size: %d, Modified: %s)\n",
			obj.Key, obj.Size, obj.LastModified.Format(time.RFC3339))
	}
}

func ExampleStorage_localstack() {
	config := &storage.Config{
		Provider:        storage.ProviderS3,
		Region:          "us-east-1",
		Bucket:          "test-bucket",
		AccessKeyID:     "test",
		SecretAccessKey: "test",
		Endpoint:        "http://localhost:4566",
		UsePathStyle:    true,
		DisableSSL:      true,
	}

	store, err := storage.New(config)
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	exists, err := store.Exists(ctx, "test-file.txt")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("File exists: %v\n", exists)
}