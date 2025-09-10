package main

import (
	"database/sql"
	"fmt"
	"log"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "test-appid.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT id, object_name, user_id, app_id FROM storage_objects WHERE object_name='My Files'")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("My Files folders in database:")
	fmt.Println("ID | Name | UserID | AppID")
	fmt.Println("----------------------------------------")
	
	for rows.Next() {
		var id, name, userID string
		var appID sql.NullString
		
		err := rows.Scan(&id, &name, &userID, &appID)
		if err != nil {
			log.Fatal(err)
		}
		
		appIDStr := "NULL"
		if appID.Valid {
			appIDStr = appID.String
		}
		
		fmt.Printf("%s | %s | %s | %s\n", id[:8], name, userID[:8], appIDStr)
	}
}