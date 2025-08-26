package web

import (
    "net/http"
    "path/filepath"
    "strings"
)

func ServeStatic(w http.ResponseWriter, r *http.Request) {
    // Get the file path from URL
    path := strings.TrimPrefix(r.URL.Path, "/static/")
    
    // Security: prevent directory traversal
    path = filepath.Clean(path)
    if strings.Contains(path, "..") {
        http.NotFound(w, r)
        return
    }
    
    // Construct full path
    fullPath := filepath.Join("static", path)
    
    // Set cache headers for static assets
    w.Header().Set("Cache-Control", "public, max-age=3600")
    
    // Serve the file
    http.ServeFile(w, r, fullPath)
}