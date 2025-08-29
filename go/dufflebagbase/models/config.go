package models

import "os"

// Global variable to store database type
var dbType string

// InitModels initializes the models package with database type
func InitModels(databaseType string) {
	dbType = databaseType
}

// getTableName returns the appropriate table name based on database type
func getTableName(schema, table string) string {
	// Check environment variable if dbType not set
	if dbType == "" {
		dbType = os.Getenv("DATABASE_TYPE")
	}
	
	// For SQLite, don't use schema prefix
	if dbType == "sqlite" || dbType == "sqlite3" {
		return table
	}
	
	// For PostgreSQL, use schema.table format
	return schema + "." + table
}