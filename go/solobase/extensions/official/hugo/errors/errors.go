package errors

import (
	"fmt"
)

// ErrorType represents the type of Hugo error
type ErrorType string

const (
	// Error types
	ErrorInvalidRequest    ErrorType = "invalid_request"
	ErrorSiteNotFound      ErrorType = "site_not_found"
	ErrorThemeNotFound     ErrorType = "theme_not_found"
	ErrorBuildFailed       ErrorType = "build_failed"
	ErrorStorageError      ErrorType = "storage_error"
	ErrorDatabaseError     ErrorType = "database_error"
	ErrorInternalError     ErrorType = "internal_error"
	ErrorUnauthorized      ErrorType = "unauthorized"
	ErrorQuotaExceeded     ErrorType = "quota_exceeded"
	ErrorDomainVerification ErrorType = "domain_verification_failed"
)

// HugoError represents a Hugo extension error
type HugoError struct {
	Type        ErrorType      `json:"type"`
	Message     string         `json:"message"`
	UserMessage string         `json:"user_message,omitempty"`
	SiteID      string         `json:"site_id,omitempty"`
	Details     map[string]any `json:"details,omitempty"`
	Retryable   bool           `json:"retryable"`
}

// Error implements the error interface
func (e *HugoError) Error() string {
	if e.UserMessage != "" {
		return e.UserMessage
	}
	return e.Message
}

// New creates a new Hugo error
func New(errType ErrorType, message string) *HugoError {
	return &HugoError{
		Type:    errType,
		Message: message,
	}
}

// NewWithDetails creates a new Hugo error with details
func NewWithDetails(errType ErrorType, message string, details map[string]any) *HugoError {
	return &HugoError{
		Type:    errType,
		Message: message,
		Details: details,
	}
}

// InvalidRequest creates an invalid request error
func InvalidRequest(message string) *HugoError {
	return &HugoError{
		Type:        ErrorInvalidRequest,
		Message:     message,
		UserMessage: message,
		Retryable:   false,
	}
}

// SiteNotFound creates a site not found error
func SiteNotFound(siteID string) *HugoError {
	return &HugoError{
		Type:        ErrorSiteNotFound,
		Message:     fmt.Sprintf("site not found: %s", siteID),
		UserMessage: "The requested site could not be found.",
		SiteID:      siteID,
		Retryable:   false,
	}
}

// BuildFailed creates a build failed error
func BuildFailed(siteID string, err error) *HugoError {
	return &HugoError{
		Type:        ErrorBuildFailed,
		Message:     fmt.Sprintf("build failed: %v", err),
		UserMessage: "The site build failed. Please check your configuration and try again.",
		SiteID:      siteID,
		Details:     map[string]any{"error": err.Error()},
		Retryable:   true,
	}
}

// StorageError creates a storage error
func StorageError(operation string, err error) *HugoError {
	return &HugoError{
		Type:        ErrorStorageError,
		Message:     fmt.Sprintf("storage %s failed: %v", operation, err),
		UserMessage: "A storage operation failed. Please try again.",
		Details:     map[string]any{"operation": operation, "error": err.Error()},
		Retryable:   true,
	}
}

// DatabaseError creates a database error
func DatabaseError(operation string, err error) *HugoError {
	return &HugoError{
		Type:        ErrorDatabaseError,
		Message:     fmt.Sprintf("database %s failed: %v", operation, err),
		UserMessage: "A database operation failed. Please try again.",
		Details:     map[string]any{"operation": operation, "error": err.Error()},
		Retryable:   true,
	}
}

// InternalError creates an internal error
func InternalError(err error) *HugoError {
	return &HugoError{
		Type:        ErrorInternalError,
		Message:     fmt.Sprintf("internal error: %v", err),
		UserMessage: "An internal error occurred. Please try again later.",
		Details:     map[string]any{"error": err.Error()},
		Retryable:   true,
	}
}

// Unauthorized creates an unauthorized error
func Unauthorized(message string) *HugoError {
	return &HugoError{
		Type:        ErrorUnauthorized,
		Message:     message,
		UserMessage: "You are not authorized to perform this action.",
		Retryable:   false,
	}
}

// QuotaExceeded creates a quota exceeded error
func QuotaExceeded(resource string, limit int) *HugoError {
	return &HugoError{
		Type:        ErrorQuotaExceeded,
		Message:     fmt.Sprintf("quota exceeded for %s: limit %d", resource, limit),
		UserMessage: fmt.Sprintf("You have exceeded your %s quota (limit: %d).", resource, limit),
		Details:     map[string]any{"resource": resource, "limit": limit},
		Retryable:   false,
	}
}