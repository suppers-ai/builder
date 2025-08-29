package services

import (
	"context"
	"fmt"
	
	"github.com/suppers-ai/database"
	"github.com/suppers-ai/dufflebagbase/utils"
	"github.com/suppers-ai/logger"
)

// BaseService provides common functionality for all services
type BaseService struct {
	db     database.Database
	logger logger.Logger
	dbHelper *utils.DatabaseHelper
}

// NewBaseService creates a new base service
func NewBaseService(db database.Database, logger logger.Logger) BaseService {
	return BaseService{
		db:       db,
		logger:   logger,
		dbHelper: utils.NewDatabaseHelper(db),
	}
}

// DB returns the database instance
func (s *BaseService) DB() database.Database {
	return s.db
}

// Logger returns the logger instance
func (s *BaseService) Logger() logger.Logger {
	return s.logger
}

// WithTransaction executes a function within a transaction
func (s *BaseService) WithTransaction(ctx context.Context, fn func(tx database.Transaction) error) error {
	return s.dbHelper.WithTransaction(ctx, fn)
}

// QueryWithCount executes a query with a count query in parallel
func (s *BaseService) QueryWithCount(ctx context.Context, query, countQuery string, args ...interface{}) (database.Rows, int, error) {
	rows, total, err := s.dbHelper.QueryWithCount(ctx, query, countQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

// Exists checks if a record exists
func (s *BaseService) Exists(ctx context.Context, query string, args ...interface{}) (bool, error) {
	return s.dbHelper.Exists(ctx, query, args...)
}

// GetOne retrieves a single record
func (s *BaseService) GetOne(ctx context.Context, dest interface{}, query string, args ...interface{}) error {
	return s.dbHelper.GetOne(ctx, dest, query, args...)
}

// LogInfo logs an info message with structured fields
func (s *BaseService) LogInfo(ctx context.Context, message string, fields ...logger.Field) {
	s.logger.Info(ctx, message, fields...)
}

// LogError logs an error message with structured fields
func (s *BaseService) LogError(ctx context.Context, message string, err error, fields ...logger.Field) {
	allFields := append(fields, logger.Err(err))
	s.logger.Error(ctx, message, allFields...)
}

// WrapError wraps an error with a descriptive message
func (s *BaseService) WrapError(operation string, err error) error {
	return fmt.Errorf("failed to %s: %w", operation, err)
}