package database

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// MigrateConfig holds configuration for migrations
type MigrateConfig struct {
	// Use embedded migrations (true) or file system (false)
	UseEmbedded bool
	// Path to migrations directory (used when UseEmbedded is false)
	MigrationsPath string
	// Database connection
	DB *sql.DB
	// Database URL (alternative to DB)
	DatabaseURL string
	// Force a specific version (0 means latest)
	ForceVersion int
	// Direction: "up", "down", or specific number of steps
	Direction string
	// Number of steps (for up/down operations)
	Steps int
}

// RunMigrations runs database migrations based on config
func RunMigrations(config MigrateConfig) error {
	var m *migrate.Migrate
	var err error

	// Create migrate instance
	if config.UseEmbedded {
		// Use embedded migrations
		sourceDriver, err := iofs.New(migrationsFS, "migrations")
		if err != nil {
			return fmt.Errorf("failed to create embedded source driver: %w", err)
		}

		if config.DB != nil {
			// Use existing database connection
			driver, err := postgres.WithInstance(config.DB, &postgres.Config{})
			if err != nil {
				return fmt.Errorf("failed to create database driver: %w", err)
			}
			m, err = migrate.NewWithInstance("iofs", sourceDriver, "postgres", driver)
		} else if config.DatabaseURL != "" {
			// Use database URL - create connection first
			db, err := sql.Open("postgres", config.DatabaseURL)
			if err != nil {
				return fmt.Errorf("failed to open database: %w", err)
			}
			defer db.Close() // Close this connection since we created it
			
			dbDriver, err := postgres.WithInstance(db, &postgres.Config{})
			if err != nil {
				return fmt.Errorf("failed to create database driver: %w", err)
			}
			m, err = migrate.NewWithInstance("iofs", sourceDriver, "postgres", dbDriver)
		} else {
			return fmt.Errorf("either DB or DatabaseURL must be provided")
		}
	} else {
		// Use file system migrations
		if config.MigrationsPath == "" {
			config.MigrationsPath = "database/migrations"
		}

		sourcePath := fmt.Sprintf("file://%s", config.MigrationsPath)
		
		if config.DatabaseURL != "" {
			m, err = migrate.New(sourcePath, config.DatabaseURL)
		} else if config.DB != nil {
			driver, err := postgres.WithInstance(config.DB, &postgres.Config{})
			if err != nil {
				return fmt.Errorf("failed to create database driver: %w", err)
			}
			m, err = migrate.NewWithInstance("file", nil, "postgres", driver)
			if err != nil {
				// Fallback to creating with path
				m, err = migrate.New(sourcePath, getDatabaseURL())
			}
		} else {
			return fmt.Errorf("either DB or DatabaseURL must be provided")
		}
	}

	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}
	defer m.Close()

	// Handle force version
	if config.ForceVersion > 0 {
		if err := m.Force(config.ForceVersion); err != nil {
			return fmt.Errorf("failed to force version %d: %w", config.ForceVersion, err)
		}
		log.Printf("Forced migration version to %d", config.ForceVersion)
		return nil
	}

	// Get current version
	currentVersion, dirty, err := m.Version()
	if err != nil && err != migrate.ErrNilVersion {
		return fmt.Errorf("failed to get current version: %w", err)
	}

	if dirty {
		log.Printf("WARNING: Database is in dirty state at version %d. You may need to force a version.", currentVersion)
	}

	// Run migrations based on direction
	switch strings.ToLower(config.Direction) {
	case "up":
		if config.Steps > 0 {
			err = m.Steps(config.Steps)
		} else {
			err = m.Up()
		}
	case "down":
		if config.Steps > 0 {
			err = m.Steps(-config.Steps)
		} else {
			err = m.Down()
		}
	case "":
		// Default to up
		err = m.Up()
	default:
		// Try to parse as steps
		var steps int
		if _, parseErr := fmt.Sscanf(config.Direction, "%d", &steps); parseErr == nil {
			err = m.Steps(steps)
		} else {
			return fmt.Errorf("invalid direction: %s", config.Direction)
		}
	}

	if err != nil {
		if err == migrate.ErrNoChange {
			log.Println("No migrations to apply")
			return nil
		}
		return fmt.Errorf("migration failed: %w", err)
	}

	// Get new version
	newVersion, _, err := m.Version()
	if err != nil && err != migrate.ErrNilVersion {
		log.Printf("Migration completed but failed to get new version: %v", err)
	} else {
		log.Printf("Migration completed. Version: %d", newVersion)
	}

	return nil
}

// AutoMigrate runs migrations automatically on startup
func AutoMigrate(db *sql.DB) error {
	// Check if auto-migration is enabled
	autoMigrate := os.Getenv("AUTO_MIGRATE")
	if autoMigrate == "false" {
		log.Println("Auto-migration is disabled (AUTO_MIGRATE=false)")
		return nil
	}

	log.Println("Running database migrations...")
	
	// Use DatabaseURL instead of passing DB connection to avoid closing it
	dbURL := getDatabaseURL()
	
	config := MigrateConfig{
		UseEmbedded: true, // Use embedded migrations by default
		DatabaseURL: dbURL,
		Direction:   "up",
	}

	// Allow override to use file system migrations for development
	if os.Getenv("USE_FILE_MIGRATIONS") == "true" {
		config.UseEmbedded = false
		config.MigrationsPath = os.Getenv("MIGRATIONS_PATH")
		if config.MigrationsPath == "" {
			config.MigrationsPath = "database/migrations"
		}
		log.Printf("Using file system migrations from: %s", config.MigrationsPath)
	}

	return RunMigrations(config)
}

// MigrateStatus returns the current migration version and dirty state
func MigrateStatus(db *sql.DB) (version uint, dirty bool, err error) {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return 0, false, fmt.Errorf("failed to create database driver: %w", err)
	}

	sourceDriver, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return 0, false, fmt.Errorf("failed to create embedded source driver: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", sourceDriver, "postgres", driver)
	if err != nil {
		return 0, false, fmt.Errorf("failed to create migrate instance: %w", err)
	}
	defer m.Close()

	version, dirty, err = m.Version()
	if err == migrate.ErrNilVersion {
		return 0, false, nil // No migrations applied yet
	}
	return version, dirty, err
}

// getDatabaseURL gets the database URL from environment or returns default
func getDatabaseURL() string {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5433/pricing_db?sslmode=disable"
	}
	return dbURL
}