package main

import (
    "database/sql"
    "fmt"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

func main() {
    db, err := sql.Open("sqlite3", "./test_hooks.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Check if CloudStorage tables exist
    var tableCount int
    err = db.QueryRow(`
        SELECT COUNT(*) 
        FROM sqlite_master 
        WHERE type='table' AND name LIKE 'ext_cloudstorage%'
    `).Scan(&tableCount)
    
    if err != nil {
        fmt.Println("❌ Error checking tables:", err)
    } else if tableCount > 0 {
        fmt.Printf("✅ Found %d CloudStorage tables\n", tableCount)
        
        // Check for quota records
        var quotaCount int
        err = db.QueryRow("SELECT COUNT(*) FROM ext_cloudstorage_storage_quotas").Scan(&quotaCount)
        if err == nil && quotaCount > 0 {
            fmt.Printf("✅ Found %d quota records\n", quotaCount)
            
            // Get quota details
            var storageUsed, bandwidthUsed int64
            err = db.QueryRow(`
                SELECT COALESCE(storage_used, 0), COALESCE(bandwidth_used, 0) 
                FROM ext_cloudstorage_storage_quotas 
                LIMIT 1
            `).Scan(&storageUsed, &bandwidthUsed)
            
            if err == nil {
                if storageUsed > 0 {
                    fmt.Printf("✅ Storage tracking: %d bytes used\n", storageUsed)
                } else {
                    fmt.Println("⚠️  Storage tracking: 0 bytes")
                }
                if bandwidthUsed > 0 {
                    fmt.Printf("✅ Bandwidth tracking: %d bytes used\n", bandwidthUsed)
                } else {
                    fmt.Println("⚠️  Bandwidth tracking: 0 bytes")
                }
            }
        } else {
            fmt.Println("⚠️  No quota records found")
        }
        
        // Check for access logs
        var logCount int
        err = db.QueryRow("SELECT COUNT(*) FROM ext_cloudstorage_storage_access_logs").Scan(&logCount)
        if err == nil && logCount > 0 {
            fmt.Printf("✅ Found %d access log entries\n", logCount)
        } else {
            fmt.Println("⚠️  No access logs found")
        }
    } else {
        fmt.Println("⚠️  CloudStorage tables not created")
    }
}
