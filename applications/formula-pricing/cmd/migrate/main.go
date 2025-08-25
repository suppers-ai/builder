package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"formula-pricing/database"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists
	godotenv.Load()

	// Define command-line flags
	var (
		direction   = flag.String("direction", "up", "Migration direction: up, down, or number of steps")
		steps       = flag.Int("steps", 0, "Number of migration steps (0 = all)")
		force       = flag.Int("force", 0, "Force migration to specific version")
		status      = flag.Bool("status", false, "Show migration status")
		useFiles    = flag.Bool("use-files", false, "Use file-based migrations instead of embedded")
		path        = flag.String("path", "database/migrations", "Path to migration files (when using files)")
		databaseURL = flag.String("database-url", "", "Database URL (overrides environment variable)")
	)

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage: %s [options]\n\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "Database migration tool for Formula Pricing\n\n")
		fmt.Fprintf(os.Stderr, "Options:\n")
		flag.PrintDefaults()
		fmt.Fprintf(os.Stderr, "\nExamples:\n")
		fmt.Fprintf(os.Stderr, "  %s                     # Run all pending migrations\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -status             # Show current migration version\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -direction down     # Rollback all migrations\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -direction down -steps 1  # Rollback one migration\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -force 1            # Force database to version 1\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "\nEnvironment Variables:\n")
		fmt.Fprintf(os.Stderr, "  DATABASE_URL           Database connection string\n")
		fmt.Fprintf(os.Stderr, "  USE_FILE_MIGRATIONS    Use file-based migrations (true/false)\n")
		fmt.Fprintf(os.Stderr, "  MIGRATIONS_PATH        Path to migration files\n")
	}

	flag.Parse()

	// Override database URL if provided
	if *databaseURL != "" {
		os.Setenv("DATABASE_URL", *databaseURL)
	}

	// Initialize database connection
	if err := database.InitDB(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.CloseDB()

	// Show status if requested
	if *status {
		version, dirty, err := database.MigrateStatus(database.DB)
		if err != nil {
			log.Fatal("Failed to get migration status:", err)
		}

		fmt.Printf("Current migration version: %d\n", version)
		if dirty {
			fmt.Println("WARNING: Database is in dirty state!")
			fmt.Println("You may need to manually fix the issue or use -force flag")
		}
		
		if version == 0 {
			fmt.Println("No migrations have been applied yet")
		}
		
		os.Exit(0)
	}

	// Prepare migration config
	config := database.MigrateConfig{
		UseEmbedded:    !*useFiles,
		MigrationsPath: *path,
		DB:             database.DB,
		ForceVersion:   *force,
		Direction:      *direction,
		Steps:          *steps,
	}

	// Override with environment variables if set
	if os.Getenv("USE_FILE_MIGRATIONS") == "true" {
		config.UseEmbedded = false
	}
	if migPath := os.Getenv("MIGRATIONS_PATH"); migPath != "" {
		config.MigrationsPath = migPath
	}

	// Run migrations
	fmt.Println("Running migrations...")
	if err := database.RunMigrations(config); err != nil {
		log.Fatal("Migration failed:", err)
	}

	// Show final status
	version, dirty, err := database.MigrateStatus(database.DB)
	if err != nil {
		log.Printf("Warning: Failed to get final migration status: %v", err)
	} else {
		fmt.Printf("Migration completed successfully. Current version: %d\n", version)
		if dirty {
			fmt.Println("WARNING: Database is still in dirty state!")
		}
	}
}