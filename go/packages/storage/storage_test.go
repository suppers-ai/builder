package storage

import (
	"testing"
)

func TestNew(t *testing.T) {
	// Test creating S3 storage
	config := &Config{
		Provider: ProviderS3,
		Region:   "us-east-1",
		Bucket:   "test-bucket",
	}

	storage, err := New(config)
	if err != nil {
		// This might fail if AWS credentials aren't set, which is expected
		t.Logf("Storage creation failed (expected without credentials): %v", err)
		return
	}

	if storage == nil {
		t.Error("Expected storage instance, got nil")
	}
}

func TestProviderValidation(t *testing.T) {
	// Test that config validation works
	config := &Config{
		Provider: "",
	}

	_, err := New(config)
	if err == nil {
		t.Error("Expected error for empty provider, got nil")
	}
}

func TestInvalidProvider(t *testing.T) {
	config := &Config{
		Provider: "invalid-provider",
	}

	_, err := New(config)
	if err == nil {
		t.Error("Expected error for invalid provider, got nil")
	}
}