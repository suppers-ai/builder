package database

import (
	"context"
	"database/sql"
	"time"
)

// Common errors
var (
	ErrNoRows = sql.ErrNoRows
)

// Database defines the universal interface for database operations
type Database interface {
	// Connection management
	Connect(ctx context.Context, config Config) error
	Close() error
	Ping(ctx context.Context) error

	// Transaction management
	BeginTx(ctx context.Context) (Transaction, error)

	// Query operations
	Query(ctx context.Context, query string, args ...interface{}) (Rows, error)
	QueryRow(ctx context.Context, query string, args ...interface{}) Row
	Exec(ctx context.Context, query string, args ...interface{}) (Result, error)

	// Structured query operations (sqlx-like)
	Get(ctx context.Context, dest interface{}, query string, args ...interface{}) error
	Select(ctx context.Context, dest interface{}, query string, args ...interface{}) error
	NamedExec(ctx context.Context, query string, arg interface{}) (Result, error)
	NamedQuery(ctx context.Context, query string, arg interface{}) (Rows, error)

	// Prepared statements
	Prepare(ctx context.Context, query string) (Statement, error)
	
	// Get underlying SQL DB (for migration tools and special cases)
	GetDB() *sql.DB
}

// Transaction represents a database transaction
type Transaction interface {
	Commit() error
	Rollback() error
	Query(ctx context.Context, query string, args ...interface{}) (Rows, error)
	QueryRow(ctx context.Context, query string, args ...interface{}) Row
	Exec(ctx context.Context, query string, args ...interface{}) (Result, error)
	
	// Structured query operations in transaction
	Get(ctx context.Context, dest interface{}, query string, args ...interface{}) error
	Select(ctx context.Context, dest interface{}, query string, args ...interface{}) error
	NamedExec(ctx context.Context, query string, arg interface{}) (Result, error)
}

// Statement represents a prepared statement
type Statement interface {
	Query(ctx context.Context, args ...interface{}) (Rows, error)
	QueryRow(ctx context.Context, args ...interface{}) Row
	Exec(ctx context.Context, args ...interface{}) (Result, error)
	Close() error
}

// Rows represents the result of a query
type Rows interface {
	Next() bool
	Scan(dest ...interface{}) error
	Close() error
	Err() error
}

// Row represents a single row result
type Row interface {
	Scan(dest ...interface{}) error
}

// Result represents the result of an exec operation
type Result interface {
	LastInsertId() (int64, error)
	RowsAffected() (int64, error)
}

// Config holds database configuration
type Config struct {
	Driver          string                 `json:"driver"`
	Host            string                 `json:"host"`
	Port            int                    `json:"port"`
	Database        string                 `json:"database"`
	Username        string                 `json:"username"`
	Password        string                 `json:"password"`
	SSLMode         string                 `json:"ssl_mode"`
	MaxOpenConns    int                    `json:"max_open_conns"`
	MaxIdleConns    int                    `json:"max_idle_conns"`
	ConnMaxLifetime time.Duration          `json:"conn_max_lifetime"`
	Extra           map[string]interface{} `json:"extra"`
}

// Factory creates a database instance based on the driver type
func New(driver string) (Database, error) {
	switch driver {
	case "postgres", "postgresql":
		return NewPostgres(), nil
	default:
		return nil, ErrUnsupportedDriver
	}
}