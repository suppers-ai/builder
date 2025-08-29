package handlers

import (
	"fmt"
	"net/http"

	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/templates"
)

// ErrorHandler provides centralized error handling for the application
type ErrorHandler struct {
	logger *logger.Logger
}

// NewErrorHandler creates a new error handler
func NewErrorHandler(log *logger.Logger) *ErrorHandler {
	return &ErrorHandler{
		logger: log,
	}
}

// HandleTemplateError handles template rendering errors with fallback content
func (eh *ErrorHandler) HandleTemplateError(w http.ResponseWriter, r *http.Request, err error, fallbackTitle string) {
	ctx := r.Context()
	eh.logger.LogError(ctx, "Template rendering failed", err, r)

	// Set appropriate headers
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)

	// Try to render a fallback error page
	if fallbackErr := eh.renderFallbackErrorPage(w, r, fallbackTitle); fallbackErr != nil {
		// If even the fallback fails, send a basic HTML error
		eh.renderBasicErrorPage(w, "Internal Server Error", "The page could not be rendered due to a server error.")
	}
}

// HandleNotFound handles 404 errors with proper logging and fallback
func (eh *ErrorHandler) HandleNotFound(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	eh.logger.LogWithContext(ctx, logger.WARN, "Page not found: %s %s", r.Method, r.URL.Path)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusNotFound)

	// Try to render the custom 404 page
	if err := templates.NotFoundPage().Render(r.Context(), w); err != nil {
		eh.logger.LogError(ctx, "Failed to render 404 page", err, r)
		eh.renderBasicErrorPage(w, "Page Not Found", "The requested page could not be found.")
	}
}

// HandleInternalError handles 500 errors with proper logging and fallback
func (eh *ErrorHandler) HandleInternalError(w http.ResponseWriter, r *http.Request, err error, message string) {
	ctx := r.Context()
	eh.logger.LogError(ctx, message, err, r)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)

	// Try to render a fallback error page
	if fallbackErr := eh.renderFallbackErrorPage(w, r, "Internal Server Error"); fallbackErr != nil {
		eh.renderBasicErrorPage(w, "Internal Server Error", "An unexpected error occurred while processing your request.")
	}
}

// HandleBadRequest handles 400 errors with proper logging
func (eh *ErrorHandler) HandleBadRequest(w http.ResponseWriter, r *http.Request, message string) {
	ctx := r.Context()
	eh.logger.LogWithContext(ctx, logger.WARN, "Bad request: %s - %s %s", message, r.Method, r.URL.Path)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)

	eh.renderBasicErrorPage(w, "Bad Request", message)
}

// HandleMethodNotAllowed handles 405 errors
func (eh *ErrorHandler) HandleMethodNotAllowed(w http.ResponseWriter, r *http.Request, allowedMethods []string) {
	ctx := r.Context()
	eh.logger.LogWithContext(ctx, logger.WARN, "Method not allowed: %s %s", r.Method, r.URL.Path)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Allow", fmt.Sprintf("%v", allowedMethods))
	w.WriteHeader(http.StatusMethodNotAllowed)

	message := fmt.Sprintf("Method %s is not allowed for this resource. Allowed methods: %v", r.Method, allowedMethods)
	eh.renderBasicErrorPage(w, "Method Not Allowed", message)
}

// renderFallbackErrorPage attempts to render a simple error page using templates
func (eh *ErrorHandler) renderFallbackErrorPage(w http.ResponseWriter, r *http.Request, title string) error {
	// Create error page data
	errorData := templates.ErrorPageData{
		Title:        title,
		Message:      "An error occurred while processing your request. Please try again later.",
		StatusCode:   500,
		ShowHomeLink: true,
	}

	// Try to render the error template
	if err := templates.ErrorPage(errorData).Render(r.Context(), w); err != nil {
		// If template rendering fails, fall back to basic HTML
		return eh.renderBasicErrorPageHTML(w, errorData.Title, errorData.Message)
	}

	return nil
}

// renderBasicErrorPage renders a basic HTML error page
func (eh *ErrorHandler) renderBasicErrorPage(w http.ResponseWriter, title, message string) {
	eh.renderBasicErrorPageHTML(w, title, message)
}

// renderBasicErrorPageHTML renders a basic HTML error page
func (eh *ErrorHandler) renderBasicErrorPageHTML(w http.ResponseWriter, title, message string) error {
	html := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s - Formula Pricing</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .error-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            margin: 1rem;
        }
        .error-title {
            color: #e53e3e;
            font-size: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        .error-message {
            color: #4a5568;
            font-size: 1.1rem;
            margin-bottom: 2rem;
        }
        .error-link {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .error-link:hover {
            background: #5a67d8;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1 class="error-title">%s</h1>
        <p class="error-message">%s</p>
        <a href="/" class="error-link">Go Home</a>
    </div>
</body>
</html>`, title, title, message)

	_, err := w.Write([]byte(html))
	return err
}

// RecoverFromPanic recovers from panics and handles them appropriately
func (eh *ErrorHandler) RecoverFromPanic(w http.ResponseWriter, r *http.Request) {
	if recovered := recover(); recovered != nil {
		eh.logger.LogPanic(r.Context(), recovered, r)

		// Check if we can still write to the response
		if w.Header().Get("Content-Type") == "" {
			eh.HandleInternalError(w, r, fmt.Errorf("panic: %v", recovered), "Panic recovered")
		}
	}
}

// Enhanced NotFoundHandler with better error handling
func EnhancedNotFoundHandler(log *logger.Logger) http.Handler {
	eh := NewErrorHandler(log)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		eh.HandleNotFound(w, r)
	})
}

// Enhanced error handling wrapper for handlers
func WithErrorHandling(log *logger.Logger, handler http.HandlerFunc, handlerName string) http.HandlerFunc {
	eh := NewErrorHandler(log)
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				eh.logger.LogPanic(r.Context(), recovered, r)
				if w.Header().Get("Content-Type") == "" {
					eh.HandleInternalError(w, r, fmt.Errorf("panic in %s: %v", handlerName, recovered), "Handler panic")
				}
			}
		}()

		handler(w, r)
	}
}
