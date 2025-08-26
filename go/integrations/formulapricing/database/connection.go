package database

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/suppers-ai/builder/go/packages/database"
)

var DB database.Database

// GetDB returns the database instance for the logger
func GetDB() interface{} {
	return DB
}

func InitDB() error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5433/pricing_db?sslmode=disable"
	}

	// Parse the database URL to extract components
	config, err := parsePostgresURL(dbURL)
	if err != nil {
		return fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Create database instance
	DB, err = database.New("postgres")
	if err != nil {
		return fmt.Errorf("failed to create database instance: %w", err)
	}

	// Connect to database
	ctx := context.Background()
	if err := DB.Connect(ctx, *config); err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}

// parsePostgresURL parses a PostgreSQL connection URL into a Config struct
func parsePostgresURL(dbURL string) (*database.Config, error) {
	u, err := url.Parse(dbURL)
	if err != nil {
		return nil, err
	}

	config := &database.Config{
		Driver:       "postgres",
		Host:         u.Hostname(),
		Database:     strings.TrimPrefix(u.Path, "/"),
		MaxOpenConns: 25,
		MaxIdleConns: 5,
		Extra:        make(map[string]interface{}),
	}

	// Parse port
	port := u.Port()
	if port != "" {
		portInt, err := strconv.Atoi(port)
		if err != nil {
			return nil, fmt.Errorf("invalid port: %s", port)
		}
		config.Port = portInt
	} else {
		config.Port = 5432
	}

	// Parse user info
	if u.User != nil {
		config.Username = u.User.Username()
		if password, ok := u.User.Password(); ok {
			config.Password = password
		}
	}

	// Parse query parameters
	params := u.Query()
	if sslmode := params.Get("sslmode"); sslmode != "" {
		config.SSLMode = sslmode
	} else {
		config.SSLMode = "disable"
	}

	// Add any other parameters to Extra
	for key, values := range params {
		if key != "sslmode" && len(values) > 0 {
			config.Extra[key] = values[0]
		}
	}

	return config, nil
}