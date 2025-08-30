package database

import (
	"database/sql"
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Config struct {
	Type     string
	Host     string
	Port     int
	Database string
	Username string
	Password string
	SSLMode  string
}

type DB struct {
	*gorm.DB
	sqlDB *sql.DB
}

func New(cfg Config) (*DB, error) {
	var dialector gorm.Dialector
	
	switch cfg.Type {
	case "postgres", "postgresql":
		dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
			cfg.Host, cfg.Port, cfg.Username, cfg.Password, cfg.Database, cfg.SSLMode)
		dialector = postgres.Open(dsn)
	case "sqlite":
		dialector = sqlite.Open(cfg.Database)
	default:
		return nil, fmt.Errorf("unsupported database type: %s", cfg.Type)
	}

	gormDB, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, err
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return &DB{
		DB:    gormDB,
		sqlDB: sqlDB,
	}, nil
}

func (db *DB) Close() error {
	return db.sqlDB.Close()
}

func (db *DB) Migrate() error {
	// Run auto migrations for models
	return nil
}