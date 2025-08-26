package models

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/suppers-ai/builder/go/packages/database"
)

var DB database.Database

// InitDB initializes the database connection using the new database package
func InitDB() error {
	var err error
	
	// Get database configuration from environment variables
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	
	dbPortInt, err := strconv.Atoi(dbPort)
	if err != nil {
		dbPortInt = 5432
	}
	
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}
	
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}
	
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "dynamicproducts"
	}
	
	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		sslMode = "disable"
	}

	// Create database instance using the new package
	DB, err = database.New("postgres")
	if err != nil {
		return fmt.Errorf("failed to create database instance: %w", err)
	}

	// Configure database connection
	config := database.Config{
		Driver:   "postgres",
		Host:     dbHost,
		Port:     dbPortInt,
		Database: dbName,
		Username: dbUser,
		Password: dbPassword,
		SSLMode:  sslMode,
		MaxOpenConns:    25,
		MaxIdleConns:    25,
		ConnMaxLifetime: 0,
		Extra: map[string]interface{}{
			"search_path": "dynamicproducts",
		},
	}
	
	log.Printf("Connecting to database: host=%s port=%d user=%s dbname=%s sslmode=%s", dbHost, dbPortInt, dbUser, dbName, sslMode)
	
	ctx := context.Background()
	if err := DB.Connect(ctx, config); err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	
	log.Println("Successfully connected to database")
	return nil
}

// CloseDB closes the database connection
func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

// RunMigrations runs the database migrations
func RunMigrations() error {
	ctx := context.Background()
	
	// Check if we can query the users table to see if migrations are needed
	var count int
	row := DB.QueryRow(ctx, "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'dynamicproducts' AND table_name = 'users'")
	err := row.Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check if migrations are needed: %w", err)
	}
	
	if count == 0 {
		log.Println("Database tables not found. Please run migrations manually using the SQL files in database/migrations/")
		return fmt.Errorf("database tables not found - run migrations first")
	}
	
	log.Println("Database tables found")
	return nil
}

// CreateDefaultUser creates a default admin user if one doesn't exist
func CreateDefaultUser(email, password string) error {
	user, err := GetUserByEmail(email)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to check for existing user: %w", err)
	}
	
	// If user already exists, skip creation
	if user != nil {
		log.Printf("Default user %s already exists", email)
		return nil
	}
	
	// Create new admin user
	newUser := &User{
		Email: email,
		Name:  "Administrator",
		Role:  "admin",
		IsActive: true,
	}
	
	if err := newUser.SetPassword(password); err != nil {
		return fmt.Errorf("failed to set password: %w", err)
	}
	
	if err := newUser.Create(); err != nil {
		return fmt.Errorf("failed to create default user: %w", err)
	}
	
	log.Printf("Created default admin user: %s", email)
	return nil
}