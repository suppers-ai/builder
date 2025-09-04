package main

import (
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "../test.db")
	if err != nil {
		fmt.Printf("Failed to open database: %v\n", err)
		return
	}
	defer db.Close()

	fmt.Println("Recent storage objects:")
	rows, err := db.Query(`
		SELECT id, bucket_name, object_key, size, created_at 
		FROM storage_objects 
		ORDER BY created_at DESC 
		LIMIT 10
	`)
	if err != nil {
		fmt.Printf("Query error: %v\n", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id, bucket, key string
		var size int64
		var created string
		
		err = rows.Scan(&id, &bucket, &key, &size, &created)
		if err != nil {
			fmt.Printf("Scan error: %v\n", err)
			continue
		}
		
		fmt.Printf("ID: %s\n", id)
		fmt.Printf("   Bucket: %s, Key: %s, Size: %d, Created: %s\n", bucket, key, size, created)
	}
}