package handlers

import (
	"net/http"
	"strings"

	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/templates"
)

// SearchHandler handles search requests
func SearchHandler(log *logger.Logger) http.HandlerFunc {
	eh := NewErrorHandler(log)
	return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
		query := strings.TrimSpace(r.URL.Query().Get("q"))

		// If no query provided, redirect to home
		if query == "" {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		// Validate query length to prevent abuse
		if len(query) > 200 {
			eh.HandleBadRequest(w, r, "Search query is too long. Please limit your search to 200 characters.")
			return
		}

		log.Info("Search query: %s", query)

		// Perform basic search (this is a simple implementation)
		results := performSearch(query)

		searchData := templates.SearchData{
			Query:   query,
			Results: results,
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		if err := templates.SearchResultsPage(searchData).Render(r.Context(), w); err != nil {
			eh.HandleTemplateError(w, r, err, "Search Results Page")
			return
		}
	}, "SearchHandler")
}

// performSearch performs a basic search and returns results
func performSearch(query string) []templates.SearchResult {
	query = strings.ToLower(query)
	var results []templates.SearchResult

	// Define searchable content
	searchableContent := []templates.SearchResult{
		{
			Title:       "Formula Pricing Documentation",
			Description: "Complete documentation for Formula Pricing including API reference and examples",
			URL:         "/docs",
			Type:        "page",
		},
		{
			Title:       "Live Demo",
			Description: "Interactive demo showing Formula Pricing in action",
			URL:         "/demo",
			Type:        "page",
		},
		{
			Title:       "API Reference",
			Description: "Complete API reference for Formula Pricing",
			URL:         "/api-reference",
			Type:        "page",
		},
		{
			Title:       "Examples",
			Description: "Code examples and use cases for Formula Pricing",
			URL:         "/examples",
			Type:        "page",
		},
		{
			Title:       "FAQ",
			Description: "Frequently asked questions about Formula Pricing",
			URL:         "/faq",
			Type:        "page",
		},
		{
			Title:       "Mathematical Operations",
			Description: "Support for complex mathematical expressions including functions like min, max, round, and more",
			URL:         "/#features",
			Type:        "section",
		},
		{
			Title:       "Dynamic Variables",
			Description: "Define and manage variables that can be updated in real-time based on your business logic",
			URL:         "/#features",
			Type:        "section",
		},
		{
			Title:       "Analytics Ready",
			Description: "Track calculation history, analyze pricing trends, and optimize your formulas over time",
			URL:         "/#features",
			Type:        "section",
		},
	}

	// Simple search implementation - check if query matches title or description
	for _, content := range searchableContent {
		if strings.Contains(strings.ToLower(content.Title), query) ||
			strings.Contains(strings.ToLower(content.Description), query) {
			results = append(results, content)
		}
	}

	// If no results found, provide some default suggestions
	if len(results) == 0 {
		results = []templates.SearchResult{
			{
				Title:       "No results found",
				Description: "Try searching for 'documentation', 'demo', 'examples', or 'API'",
				URL:         "/",
				Type:        "suggestion",
			},
		}
	}

	return results
}
