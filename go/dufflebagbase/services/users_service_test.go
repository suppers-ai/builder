package services

import (
	"encoding/base64"
	"testing"
)

// TestGenerateSecureToken tests the secure token generation
func TestGenerateSecureToken(t *testing.T) {
	tests := []struct {
		name   string
		length int
	}{
		{"16 bytes", 16},
		{"32 bytes", 32},
		{"64 bytes", 64},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Generate multiple tokens to ensure randomness
			tokens := make(map[string]bool)
			
			for i := 0; i < 10; i++ {
				token := generateSecureToken(tt.length)
				
				// Check token is not empty
				if token == "" {
					t.Error("Generated token is empty")
				}
				
				// Check token is base64 encoded
				decoded, err := base64.URLEncoding.DecodeString(token)
				if err != nil {
					t.Errorf("Token is not valid base64: %v", err)
				}
				
				// Check decoded length matches requested length
				if len(decoded) != tt.length {
					t.Errorf("Decoded token length = %d, want %d", len(decoded), tt.length)
				}
				
				// Check for uniqueness (no duplicates)
				if tokens[token] {
					t.Error("Duplicate token generated!")
				}
				tokens[token] = true
			}
			
			// All 10 tokens should be unique
			if len(tokens) != 10 {
				t.Errorf("Expected 10 unique tokens, got %d", len(tokens))
			}
		})
	}
}

// BenchmarkGenerateSecureToken benchmarks token generation
func BenchmarkGenerateSecureToken(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_ = generateSecureToken(32)
	}
}