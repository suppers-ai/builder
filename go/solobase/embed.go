package main

import (
	"embed"
	"io/fs"
	"net/http"
	"os"
)

//go:embed all:admin/build
var adminFiles embed.FS

// GetAdminFS returns the embedded admin UI filesystem
func GetAdminFS() (fs.FS, error) {
	// Check if build directory exists
	if _, err := os.Stat("admin/build"); os.IsNotExist(err) {
		// Return empty FS for development
		return embed.FS{}, nil
	}
	return fs.Sub(adminFiles, "admin/build")
}

// ServeAdmin serves the embedded admin UI
func ServeAdmin() http.Handler {
	adminFS, err := GetAdminFS()
	if err != nil {
		// For development, return a simple handler
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`<!DOCTYPE html>
<html>
<head><title>Solobase Admin</title></head>
<body>
<h1>Admin UI not built yet</h1>
<p>Run: cd admin && npm run build</p>
<p>Or for development, use: cd admin && npm run dev</p>
</body>
</html>`))
		})
	}

	return http.FileServer(http.FS(adminFS))
}