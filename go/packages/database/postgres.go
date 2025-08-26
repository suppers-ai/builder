package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// Postgres implements the Database interface for PostgreSQL
type Postgres struct {
	db     *sqlx.DB
	config Config
}

// NewPostgres creates a new PostgreSQL database instance
func NewPostgres() *Postgres {
	return &Postgres{}
}

// Connect establishes a connection to the PostgreSQL database
func (p *Postgres) Connect(ctx context.Context, config Config) error {
	p.config = config

	// Build connection string
	connStr := p.buildConnectionString(config)

	// Open database connection with sqlx
	db, err := sqlx.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrConnectionFailed, err)
	}

	// Configure connection pool
	if config.MaxOpenConns > 0 {
		db.SetMaxOpenConns(config.MaxOpenConns)
	}
	if config.MaxIdleConns > 0 {
		db.SetMaxIdleConns(config.MaxIdleConns)
	}
	if config.ConnMaxLifetime > 0 {
		db.SetConnMaxLifetime(config.ConnMaxLifetime)
	}

	// Test connection
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return fmt.Errorf("%w: %v", ErrConnectionFailed, err)
	}

	p.db = db
	return nil
}

// buildConnectionString builds PostgreSQL connection string
func (p *Postgres) buildConnectionString(config Config) string {
	sslMode := config.SSLMode
	if sslMode == "" {
		sslMode = "disable"
	}

	// Basic connection string
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.Username, config.Password, config.Database, sslMode)

	// Add extra parameters if any
	for key, value := range config.Extra {
		connStr += fmt.Sprintf(" %s=%v", key, value)
	}

	return connStr
}

// Close closes the database connection
func (p *Postgres) Close() error {
	if p.db == nil {
		return ErrNoConnection
	}
	return p.db.Close()
}

// Ping verifies the database connection
func (p *Postgres) Ping(ctx context.Context) error {
	if p.db == nil {
		return ErrNoConnection
	}
	return p.db.PingContext(ctx)
}

// BeginTx starts a new transaction
func (p *Postgres) BeginTx(ctx context.Context) (Transaction, error) {
	if p.db == nil {
		return nil, ErrNoConnection
	}

	tx, err := p.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrTransactionFailed, err)
	}

	return &PostgresTransaction{tx: tx}, nil
}

// Query executes a query that returns rows
func (p *Postgres) Query(ctx context.Context, query string, args ...interface{}) (Rows, error) {
	if p.db == nil {
		return nil, ErrNoConnection
	}

	rows, err := p.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrQueryFailed, err)
	}

	return &PostgresRows{rows: rows}, nil
}

// QueryRow executes a query that returns a single row
func (p *Postgres) QueryRow(ctx context.Context, query string, args ...interface{}) Row {
	if p.db == nil {
		return &PostgresRow{err: ErrNoConnection}
	}

	row := p.db.QueryRowContext(ctx, query, args...)
	return &PostgresRow{row: row}
}

// Exec executes a query that doesn't return rows
func (p *Postgres) Exec(ctx context.Context, query string, args ...interface{}) (Result, error) {
	if p.db == nil {
		return nil, ErrNoConnection
	}

	result, err := p.db.ExecContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrQueryFailed, err)
	}

	return &PostgresResult{result: result}, nil
}

// Get executes a query and scans the result into dest (single row)
func (p *Postgres) Get(ctx context.Context, dest interface{}, query string, args ...interface{}) error {
	if p.db == nil {
		return ErrNoConnection
	}
	return p.db.GetContext(ctx, dest, query, args...)
}

// Select executes a query and scans the results into dest (multiple rows)
func (p *Postgres) Select(ctx context.Context, dest interface{}, query string, args ...interface{}) error {
	if p.db == nil {
		return ErrNoConnection
	}
	return p.db.SelectContext(ctx, dest, query, args...)
}

// NamedExec executes a named query with named parameters
func (p *Postgres) NamedExec(ctx context.Context, query string, arg interface{}) (Result, error) {
	if p.db == nil {
		return nil, ErrNoConnection
	}
	result, err := p.db.NamedExecContext(ctx, query, arg)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrQueryFailed, err)
	}
	return &PostgresResult{result: result}, nil
}

// NamedQuery executes a named query with named parameters
func (p *Postgres) NamedQuery(ctx context.Context, query string, arg interface{}) (Rows, error) {
	if p.db == nil {
		return nil, ErrNoConnection
	}
	rows, err := p.db.NamedQueryContext(ctx, query, arg)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrQueryFailed, err)
	}
	return &PostgresSqlxRows{rows: rows}, nil
}

// GetDB returns the underlying sql.DB
func (p *Postgres) GetDB() *sql.DB {
	if p.db == nil {
		return nil
	}
	return p.db.DB
}

// Prepare creates a prepared statement
func (p *Postgres) Prepare(ctx context.Context, query string) (Statement, error) {
	if p.db == nil {
		return nil, ErrNoConnection
	}

	stmt, err := p.db.PrepareContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrQueryFailed, err)
	}

	return &PostgresStatement{stmt: stmt}, nil
}

// PostgresTransaction wraps sqlx.Tx to implement Transaction interface
type PostgresTransaction struct {
	tx *sqlx.Tx
}

func (t *PostgresTransaction) Commit() error {
	return t.tx.Commit()
}

func (t *PostgresTransaction) Rollback() error {
	return t.tx.Rollback()
}

func (t *PostgresTransaction) Query(ctx context.Context, query string, args ...interface{}) (Rows, error) {
	rows, err := t.tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	return &PostgresRows{rows: rows}, nil
}

func (t *PostgresTransaction) QueryRow(ctx context.Context, query string, args ...interface{}) Row {
	row := t.tx.QueryRowContext(ctx, query, args...)
	return &PostgresRow{row: row}
}

func (t *PostgresTransaction) Exec(ctx context.Context, query string, args ...interface{}) (Result, error) {
	result, err := t.tx.ExecContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	return &PostgresResult{result: result}, nil
}

func (t *PostgresTransaction) Get(ctx context.Context, dest interface{}, query string, args ...interface{}) error {
	return t.tx.GetContext(ctx, dest, query, args...)
}

func (t *PostgresTransaction) Select(ctx context.Context, dest interface{}, query string, args ...interface{}) error {
	return t.tx.SelectContext(ctx, dest, query, args...)
}

func (t *PostgresTransaction) NamedExec(ctx context.Context, query string, arg interface{}) (Result, error) {
	result, err := t.tx.NamedExecContext(ctx, query, arg)
	if err != nil {
		return nil, err
	}
	return &PostgresResult{result: result}, nil
}

// PostgresStatement wraps sql.Stmt to implement Statement interface
type PostgresStatement struct {
	stmt *sql.Stmt
}

func (s *PostgresStatement) Query(ctx context.Context, args ...interface{}) (Rows, error) {
	rows, err := s.stmt.QueryContext(ctx, args...)
	if err != nil {
		return nil, err
	}
	return &PostgresRows{rows: rows}, nil
}

func (s *PostgresStatement) QueryRow(ctx context.Context, args ...interface{}) Row {
	row := s.stmt.QueryRowContext(ctx, args...)
	return &PostgresRow{row: row}
}

func (s *PostgresStatement) Exec(ctx context.Context, args ...interface{}) (Result, error) {
	result, err := s.stmt.ExecContext(ctx, args...)
	if err != nil {
		return nil, err
	}
	return &PostgresResult{result: result}, nil
}

func (s *PostgresStatement) Close() error {
	return s.stmt.Close()
}

// PostgresRows wraps sql.Rows to implement Rows interface
type PostgresRows struct {
	rows *sql.Rows
}

func (r *PostgresRows) Next() bool {
	return r.rows.Next()
}

func (r *PostgresRows) Scan(dest ...interface{}) error {
	return r.rows.Scan(dest...)
}

func (r *PostgresRows) Close() error {
	return r.rows.Close()
}

func (r *PostgresRows) Err() error {
	return r.rows.Err()
}

// PostgresRow wraps sql.Row to implement Row interface
type PostgresRow struct {
	row *sql.Row
	err error
}

func (r *PostgresRow) Scan(dest ...interface{}) error {
	if r.err != nil {
		return r.err
	}
	return r.row.Scan(dest...)
}

// PostgresResult wraps sql.Result to implement Result interface
type PostgresResult struct {
	result sql.Result
}

func (r *PostgresResult) LastInsertId() (int64, error) {
	return r.result.LastInsertId()
}

func (r *PostgresResult) RowsAffected() (int64, error) {
	return r.result.RowsAffected()
}

// PostgresSqlxRows wraps sqlx.Rows to implement Rows interface
type PostgresSqlxRows struct {
	rows *sqlx.Rows
}

func (r *PostgresSqlxRows) Next() bool {
	return r.rows.Next()
}

func (r *PostgresSqlxRows) Scan(dest ...interface{}) error {
	return r.rows.Scan(dest...)
}

func (r *PostgresSqlxRows) Close() error {
	return r.rows.Close()
}

func (r *PostgresSqlxRows) Err() error {
	return r.rows.Err()
}