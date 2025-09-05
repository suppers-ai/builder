package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/suppers-ai/solobase"
)

//go:embed static/*
var sortedStorageFiles embed.FS

func main() {
	// Create a new Solobase application
	app := solobase.NewWithOptions(&solobase.Options{
		DatabaseType:         os.Getenv("DATABASE_TYPE"),
		DatabaseURL:          os.Getenv("DATABASE_URL"),
		StorageType:          os.Getenv("STORAGE_TYPE"),
		StoragePath:          os.Getenv("STORAGE_PATH"),
		DefaultAdminEmail:    os.Getenv("DEFAULT_ADMIN_EMAIL"),
		DefaultAdminPassword: os.Getenv("DEFAULT_ADMIN_PASSWORD"),
		JWTSecret:            os.Getenv("JWT_SECRET"),
		Port:                 os.Getenv("PORT"),
		DisableAdminUI:       false, // We want to keep the admin UI
	})

	// Add OnServe hook to serve SortedStorage frontend
	app.OnServe().BindFunc(func(se *solobase.ServeEvent) error {
		// Serve SortedStorage frontend for root routes
		se.Router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip API, auth, admin, profile, and storage routes - these are handled by Solobase
			if strings.HasPrefix(r.URL.Path, "/api/") || 
			   strings.HasPrefix(r.URL.Path, "/auth/") ||
			   strings.HasPrefix(r.URL.Path, "/admin/") || 
			   strings.HasPrefix(r.URL.Path, "/profile") ||
			   strings.HasPrefix(r.URL.Path, "/storage/") {
				// These are handled by Solobase
				http.NotFound(w, r)
				return
			}

			// Check if we have embedded static files
			staticFS, err := fs.Sub(sortedStorageFiles, "static")
			if err != nil {
				// If no embedded files (development mode), serve from filesystem
				staticDir := "../build/"
				if _, err := os.Stat(staticDir); err == nil {
					http.FileServer(http.Dir(staticDir)).ServeHTTP(w, r)
				} else {
					http.Error(w, "SortedStorage frontend not found", http.StatusNotFound)
				}
				return
			}

			// Serve embedded SortedStorage frontend
			path := r.URL.Path
			if path == "/" {
				path = "/index.html"
			}

			// Try to open the file
			file, err := staticFS.Open(strings.TrimPrefix(path, "/"))
			if err != nil {
				// For SPA routing, serve index.html for non-asset routes
				if !strings.Contains(path, ".") {
					indexFile, err := staticFS.Open("index.html")
					if err != nil {
						http.Error(w, "Not found", http.StatusNotFound)
						return
					}
					defer indexFile.Close()
					
					// Serve index.html
					w.Header().Set("Content-Type", "text/html; charset=utf-8")
					if indexData, err := fs.ReadFile(staticFS, "index.html"); err == nil {
						w.Write(indexData)
					}
					return
				}
				http.NotFound(w, r)
				return
			}
			file.Close()

			http.FileServer(http.FS(staticFS)).ServeHTTP(w, r)
		})
		
		return se.Next()
	})

	// Print startup message
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("=========================================")
	log.Printf("      🗄️  SortedStorage  🗄️")
	log.Printf("    Powered by Solobase Backend")
	log.Printf("=========================================")
	log.Printf("📍 SortedStorage UI: http://localhost:%s", port)
	log.Printf("📍 Admin UI: http://localhost:%s/admin/", port)
	log.Printf("=========================================")

	// Start the application
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}