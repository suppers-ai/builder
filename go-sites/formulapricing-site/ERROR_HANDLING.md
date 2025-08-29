# Error Handling and Logging System

This document describes the comprehensive error handling and logging system implemented for the Formula Pricing Site Go application.

## Overview

The error handling system provides:
- Centralized error handling with proper HTTP status codes
- Request logging in dufflebagbase format
- Template rendering error recovery with fallback content
- Panic recovery with detailed logging
- Proper error boundaries and graceful degradation

## Components

### 1. Enhanced Logger (`logger/logger.go`)

The logger provides structured logging with context support:

```go
// Basic logging
log.Info("Server starting on port %s", port)
log.Error("Database connection failed: %v", err)

// Context-aware logging
log.LogWithContext(ctx, logger.ERROR, "Operation failed: %v", err)

// Request logging (dufflebagbase format)
log.LogRequest(r, statusCode, duration, responseSize)

// Error logging with request context
log.LogError(ctx, "Template rendering failed", err, r)

// Panic logging with stack trace
log.LogPanic(ctx, recovered, r)
```

**Features:**
- Structured log format with timestamps
- Context-aware logging
- Request logging in dufflebagbase format
- Stack trace capture for panics
- Client IP extraction from headers

### 2. Enhanced Middleware (`middleware/middleware.go`)

#### Recovery Middleware
- Catches panics and logs them with full context
- Provides graceful error responses
- Includes stack trace logging

#### Request Logger Middleware
- Logs all HTTP requests in dufflebagbase format
- Captures response status codes and sizes
- Measures request duration

#### Error Handler Middleware
- Centralized error handling for HTTP responses
- Automatic logging of 4xx and 5xx status codes
- Context-aware error reporting

#### Timeout Middleware
- Adds request timeout handling
- Prevents long-running requests from hanging
- Logs timeout events

### 3. Error Handler (`handlers/errors.go`)

Centralized error handling with fallback mechanisms:

```go
eh := handlers.NewErrorHandler(log)

// Handle template errors with fallback
eh.HandleTemplateError(w, r, err, "Page Title")

// Handle 404 errors
eh.HandleNotFound(w, r)

// Handle internal server errors
eh.HandleInternalError(w, r, err, "Operation failed")

// Handle bad requests
eh.HandleBadRequest(w, r, "Invalid input")
```

**Features:**
- Template rendering error recovery
- Fallback error pages when templates fail
- Proper HTTP status code handling
- Context-aware error logging
- Graceful degradation

### 4. Enhanced Handlers

All handlers now use the error handling system:

```go
func HomeHandler(log *logger.Logger) http.HandlerFunc {
    eh := NewErrorHandler(log)
    return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
        if err := templates.HomePage().Render(r.Context(), w); err != nil {
            eh.HandleTemplateError(w, r, err, "Home Page")
            return
        }
    }, "HomeHandler")
}
```

## Error Types and Responses

### 1. Template Rendering Errors (500)
- Logged with full context and stack trace
- Fallback to error template
- If error template fails, basic HTML response

### 2. Not Found Errors (404)
- Custom 404 page with site styling
- Fallback to basic HTML if template fails
- Logged as warnings

### 3. Bad Request Errors (400)
- Input validation failures
- Malformed requests
- Logged as warnings

### 4. Internal Server Errors (500)
- Unexpected application errors
- Database connection failures
- Logged as errors with full context

### 5. Panic Recovery
- Catches all panics in handlers
- Logs with stack trace
- Returns 500 error response

## Logging Format

### Request Logging (dufflebagbase format)
```
[2025-08-29 15:04:05] INFO: 192.168.1.100 - "GET /docs HTTP/1.1" 200 1234 15.2ms "Mozilla/5.0..."
```

### Error Logging
```
[2025-08-29 15:04:05] ERROR: Template rendering failed: template not found [GET /docs] [IP: 192.168.1.100] [UA: Mozilla/5.0...] [caller: handlers/docs.go:25]
```

### Panic Logging
```
[2025-08-29 15:04:05] FATAL: PANIC RECOVERED: runtime error: nil pointer dereference [GET /docs] [IP: 192.168.1.100]
Stack Trace:
goroutine 1 [running]:
...
```

## Configuration

### Log Levels
- `DEBUG`: Detailed debugging information
- `INFO`: General information (default)
- `WARN`: Warning conditions
- `ERROR`: Error conditions
- `FATAL`: Fatal errors (causes exit)

### Environment Variables
```bash
LOG_LEVEL=info          # Set logging level
ENVIRONMENT=production  # Environment setting
```

## Middleware Stack Order

The middleware is applied in this specific order:

1. **Recovery** - Catch panics first
2. **SecurityHeaders** - Set security headers
3. **ErrorHandler** - Centralized error handling
4. **RequestLogger** - Log requests
5. **Timeout** - Request timeout handling
6. **GzipCompression** - Compress responses (last)

## Error Page Templates

### Custom Error Template (`templates/error.templ`)
- Styled error pages matching site design
- Configurable error codes and messages
- Home link for navigation

### Fallback HTML
- Basic HTML when templates fail
- Minimal styling for readability
- Always available as last resort

## Best Practices

### 1. Handler Error Handling
```go
// Always use WithErrorHandling wrapper
return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
    // Handler logic here
    if err := someOperation(); err != nil {
        eh.HandleInternalError(w, r, err, "Operation failed")
        return
    }
}, "HandlerName")
```

### 2. Template Error Handling
```go
if err := template.Render(r.Context(), w); err != nil {
    eh.HandleTemplateError(w, r, err, "Page Title")
    return
}
```

### 3. Input Validation
```go
if len(input) > maxLength {
    eh.HandleBadRequest(w, r, "Input too long")
    return
}
```

### 4. Static Asset Handling
```go
// Use enhanced static asset handler
router.HandleFunc("/asset.png", serveStaticAssetWithErrorHandling(path, log))
```

## Monitoring and Observability

### Health Checks
- Enhanced health endpoint with error handling
- Panic recovery in health checks
- JSON response with uptime and version

### Error Metrics
- All errors are logged with context
- Request timing and status codes
- Client IP and user agent tracking

### Debugging
- Stack traces for panics
- Caller information for errors
- Request context in all error logs

## Testing

The error handling system includes:
- Unit tests for error handlers
- Integration tests for middleware
- Panic recovery testing
- Template fallback testing

## Performance Considerations

- Minimal overhead for normal requests
- Efficient error logging
- Graceful degradation under load
- Request timeout protection

This comprehensive error handling system ensures the Formula Pricing Site provides a robust, maintainable, and observable web application that gracefully handles all error conditions while maintaining compatibility with dufflebagbase patterns.