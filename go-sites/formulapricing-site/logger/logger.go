package logger

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"
)

type Level int

const (
	DEBUG Level = iota
	INFO
	WARN
	ERROR
	FATAL
)

func (l Level) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	case FATAL:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

type Logger struct {
	level  Level
	logger *log.Logger
}

func New(level string) *Logger {
	l := &Logger{
		level:  parseLevel(level),
		logger: log.New(os.Stdout, "", 0),
	}
	return l
}

func parseLevel(level string) Level {
	switch strings.ToUpper(level) {
	case "DEBUG":
		return DEBUG
	case "INFO":
		return INFO
	case "WARN":
		return WARN
	case "ERROR":
		return ERROR
	case "FATAL":
		return FATAL
	default:
		return INFO
	}
}

func (l *Logger) log(level Level, msg string, args ...interface{}) {
	if level < l.level {
		return
	}

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	prefix := fmt.Sprintf("[%s] %s: ", timestamp, level.String())

	if len(args) > 0 {
		msg = fmt.Sprintf(msg, args...)
	}

	l.logger.Printf("%s%s", prefix, msg)

	if level == FATAL {
		os.Exit(1)
	}
}

// LogWithContext logs a message with context information
func (l *Logger) LogWithContext(ctx context.Context, level Level, msg string, args ...interface{}) {
	if level < l.level {
		return
	}

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	prefix := fmt.Sprintf("[%s] %s: ", timestamp, level.String())

	if len(args) > 0 {
		msg = fmt.Sprintf(msg, args...)
	}

	l.logger.Printf("%s%s", prefix, msg)

	if level == FATAL {
		os.Exit(1)
	}
}

// LogError logs an error with stack trace information
func (l *Logger) LogError(ctx context.Context, msg string, err error, r *http.Request) {
	if l.level > ERROR {
		return
	}

	timestamp := time.Now().Format("2006-01-02 15:04:05")

	// Get caller information
	_, file, line, ok := runtime.Caller(1)
	caller := "unknown"
	if ok {
		caller = fmt.Sprintf("%s:%d", file, line)
	}

	// Build error message with context
	errorMsg := fmt.Sprintf("%s", msg)
	if err != nil {
		errorMsg = fmt.Sprintf("%s: %v", msg, err)
	}

	// Add request context if available
	if r != nil {
		errorMsg = fmt.Sprintf("%s [%s %s] [IP: %s] [UA: %s]",
			errorMsg, r.Method, r.URL.Path, getClientIP(r), r.UserAgent())
	}

	l.logger.Printf("[%s] ERROR: %s [caller: %s]", timestamp, errorMsg, caller)
}

// LogRequest logs HTTP request details in dufflebagbase format
func (l *Logger) LogRequest(r *http.Request, statusCode int, duration time.Duration, responseSize int64) {
	if l.level > INFO {
		return
	}

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	clientIP := getClientIP(r)

	// Format similar to dufflebagbase: IP - [timestamp] "METHOD /path HTTP/1.1" status size duration "user-agent"
	logLine := fmt.Sprintf("[%s] INFO: %s - \"%s %s %s\" %d %d %v \"%s\"",
		timestamp,
		clientIP,
		r.Method,
		r.URL.Path,
		r.Proto,
		statusCode,
		responseSize,
		duration,
		r.UserAgent(),
	)

	l.logger.Println(logLine)
}

// LogPanic logs panic recovery information
func (l *Logger) LogPanic(ctx context.Context, recovered interface{}, r *http.Request) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")

	// Get stack trace
	buf := make([]byte, 4096)
	n := runtime.Stack(buf, false)
	stackTrace := string(buf[:n])

	// Build panic message with context
	panicMsg := fmt.Sprintf("PANIC RECOVERED: %v", recovered)
	if r != nil {
		panicMsg = fmt.Sprintf("%s [%s %s] [IP: %s]",
			panicMsg, r.Method, r.URL.Path, getClientIP(r))
	}

	l.logger.Printf("[%s] FATAL: %s\nStack Trace:\n%s", timestamp, panicMsg, stackTrace)
}

func (l *Logger) Debug(msg string, args ...interface{}) {
	l.log(DEBUG, msg, args...)
}

func (l *Logger) Info(msg string, args ...interface{}) {
	l.log(INFO, msg, args...)
}

func (l *Logger) Warn(msg string, args ...interface{}) {
	l.log(WARN, msg, args...)
}

func (l *Logger) Error(msg string, args ...interface{}) {
	l.log(ERROR, msg, args...)
}

func (l *Logger) Fatal(msg string, args ...interface{}) {
	l.log(FATAL, msg, args...)
}

// getClientIP extracts the real client IP from request headers
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header first (for proxies/load balancers)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// X-Forwarded-For can contain multiple IPs, take the first one
		if idx := strings.Index(xff, ","); idx != -1 {
			return strings.TrimSpace(xff[:idx])
		}
		return strings.TrimSpace(xff)
	}

	// Check X-Real-IP header (for nginx proxy)
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}

	// Fall back to RemoteAddr
	if idx := strings.LastIndex(r.RemoteAddr, ":"); idx != -1 {
		return r.RemoteAddr[:idx]
	}
	return r.RemoteAddr
}
