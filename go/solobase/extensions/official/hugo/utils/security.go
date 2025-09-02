package utils

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
)

var (
	// Safe filename pattern - alphanumeric, dash, underscore, dot
	safeFilenamePattern = regexp.MustCompile(`^[a-zA-Z0-9._-]+$`)
	
	// Safe path pattern - no double dots, no absolute paths
	safePathPattern = regexp.MustCompile(`^[a-zA-Z0-9._/-]+$`)
	
	// Domain validation pattern
	domainPattern = regexp.MustCompile(`^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$`)
	
	// Blocked extensions for security
	blockedExtensions = map[string]bool{
		".exe": true,
		".bat": true,
		".sh":  true,
		".cmd": true,
		".com": true,
		".app": true,
	}
)

// SanitizePath sanitizes a file path to prevent directory traversal
func SanitizePath(path string) (string, error) {
	// Clean the path
	cleaned := filepath.Clean(path)
	
	// Ensure no absolute paths
	if filepath.IsAbs(cleaned) {
		return "", fmt.Errorf("absolute paths are not allowed")
	}
	
	// Check for directory traversal
	if strings.Contains(cleaned, "..") {
		return "", fmt.Errorf("directory traversal detected")
	}
	
	// Check for unsafe characters
	if !safePathPattern.MatchString(cleaned) {
		return "", fmt.Errorf("path contains unsafe characters")
	}
	
	return cleaned, nil
}

// SanitizeFilename sanitizes a filename
func SanitizeFilename(filename string) (string, error) {
	// Remove any path components
	base := filepath.Base(filename)
	
	// Check for safe characters
	if !safeFilenamePattern.MatchString(base) {
		return "", fmt.Errorf("filename contains unsafe characters")
	}
	
	// Check extension
	ext := filepath.Ext(base)
	if blockedExtensions[strings.ToLower(ext)] {
		return "", fmt.Errorf("file extension %s is not allowed", ext)
	}
	
	return base, nil
}

// ValidateDomain validates a domain name
func ValidateDomain(domain string) bool {
	// Convert to lowercase for validation
	domain = strings.ToLower(domain)
	
	// Remove protocol if present
	domain = strings.TrimPrefix(domain, "http://")
	domain = strings.TrimPrefix(domain, "https://")
	
	// Remove port if present
	if idx := strings.Index(domain, ":"); idx != -1 {
		domain = domain[:idx]
	}
	
	// Remove path if present
	if idx := strings.Index(domain, "/"); idx != -1 {
		domain = domain[:idx]
	}
	
	// Check domain pattern
	return domainPattern.MatchString(domain)
}

// IsAllowedContentType checks if a content type is allowed for upload
func IsAllowedContentType(contentType string) bool {
	allowedTypes := map[string]bool{
		"text/html":       true,
		"text/css":        true,
		"text/javascript": true,
		"text/plain":      true,
		"text/markdown":   true,
		"text/yaml":       true,
		"text/toml":       true,
		"application/javascript": true,
		"application/json":       true,
		"application/yaml":       true,
		"application/toml":       true,
		"image/jpeg":      true,
		"image/jpg":       true,
		"image/png":       true,
		"image/gif":       true,
		"image/svg+xml":   true,
		"image/webp":      true,
	}
	
	return allowedTypes[strings.ToLower(contentType)]
}

// SanitizeHTML removes potentially dangerous HTML tags and attributes
func SanitizeHTML(html string) string {
	// This is a basic implementation
	// In production, use a proper HTML sanitization library
	
	// Remove script tags
	html = regexp.MustCompile(`<script[^>]*>.*?</script>`).ReplaceAllString(html, "")
	
	// Remove iframe tags
	html = regexp.MustCompile(`<iframe[^>]*>.*?</iframe>`).ReplaceAllString(html, "")
	
	// Remove object/embed tags
	html = regexp.MustCompile(`<(object|embed)[^>]*>.*?</(object|embed)>`).ReplaceAllString(html, "")
	
	// Remove on* event handlers
	html = regexp.MustCompile(`\s*on\w+\s*=\s*["'][^"']*["']`).ReplaceAllString(html, "")
	
	// Remove javascript: protocol
	html = regexp.MustCompile(`javascript:`).ReplaceAllString(html, "")
	
	return html
}

// ValidateSiteSize checks if a site's total size is within limits
func ValidateSiteSize(currentSize, newFileSize, maxSize int64) error {
	if currentSize+newFileSize > maxSize {
		return fmt.Errorf("site size would exceed maximum allowed size of %d bytes", maxSize)
	}
	return nil
}

// GenerateSecureToken generates a secure random token
func GenerateSecureToken(length int) (string, error) {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[i%len(charset)]
	}
	return string(b), nil
}