package unit

import (
	"bytes"
	"context"
	"strings"
	"testing"

	"github.com/suppers-ai/formulapricing-site/templates"
	"github.com/suppers-ai/formulapricing-site/tests/fixtures"
)

func TestLayoutTemplate(t *testing.T) {
	// Create a simple content component for testing
	content := templates.HomePage()

	// Render the layout with content
	layout := templates.Layout("Test Title", content)

	var buf bytes.Buffer
	err := layout.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render layout template: %v", err)
	}

	html := buf.String()

	// Check for proper HTML structure
	expectedElements := []string{
		"<html",
		"<head>",
		"</head>",
		"<body>",
		"</body>",
		"</html>",
		"Test Title",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Logf("HTML preview: %s", html[:fixtures.Min(500, len(html))])
			t.Errorf("Layout template missing expected element: %s", element)
		}
	}

	// Check DOCTYPE separately (case insensitive)
	if !strings.Contains(strings.ToLower(html), "<!doctype html>") {
		t.Error("Layout template missing DOCTYPE declaration")
	}

	// Check for meta tags
	expectedMeta := []string{
		`<meta charset="UTF-8"`,
		`<meta name="viewport"`,
		`content="width=device-width, initial-scale=1.0"`,
	}

	for _, meta := range expectedMeta {
		if !strings.Contains(html, meta) {
			t.Errorf("Layout template missing expected meta tag: %s", meta)
		}
	}

	// Check for CSS link
	if !strings.Contains(html, `<link rel="stylesheet"`) {
		t.Error("Layout template missing CSS link")
	}

	if !strings.Contains(html, `href="/static/css/styles.css"`) {
		t.Error("Layout template missing correct CSS href")
	}
}

func TestHomePageTemplate(t *testing.T) {
	homePage := templates.HomePage()

	var buf bytes.Buffer
	err := homePage.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render home page template: %v", err)
	}

	html := buf.String()

	// Check for key homepage elements
	expectedElements := []string{
		"Formula Pricing",
		"Professor Gopher",
		"Live Demo",
		"Read the documentation",
		"professor-gopher.png",
		"Open Source Formula Pricing",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Errorf("Home page template missing expected element: %s", element)
		}
	}

	// Check for navigation elements
	navigationElements := []string{
		"FAQ",
		"Documentation",
		"/demo",
		"/docs",
	}

	for _, nav := range navigationElements {
		if !strings.Contains(html, nav) {
			t.Errorf("Home page template missing navigation element: %s", nav)
		}
	}

	// Check for search functionality
	if !strings.Contains(html, `type="text"`) && !strings.Contains(html, `name="q"`) {
		t.Error("Home page template missing search input")
	}

	// Check for JavaScript inclusion
	if !strings.Contains(html, "professor-gopher.js") {
		t.Error("Home page template missing JavaScript file reference")
	}
}

func TestNotFoundPageTemplate(t *testing.T) {
	notFoundPage := templates.NotFoundPage()

	var buf bytes.Buffer
	err := notFoundPage.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render 404 page template: %v", err)
	}

	html := buf.String()

	// Check for 404 page elements
	expectedElements := []string{
		"404",
		"Page Not Found",
		"Go Home",
		"href=\"/\"",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Errorf("404 page template missing expected element: %s", element)
		}
	}

	// Check for proper styling classes
	if !strings.Contains(html, "text-center") || !strings.Contains(html, "min-h-screen") {
		t.Error("404 page template missing expected CSS classes")
	}
}

func TestFAQPageTemplate(t *testing.T) {
	faqPage := templates.FAQPage()

	var buf bytes.Buffer
	err := faqPage.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render FAQ page template: %v", err)
	}

	html := buf.String()

	// Check for FAQ page elements
	expectedElements := []string{
		"FAQ",
		"Frequently Asked Questions",
		"Formula Pricing",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Errorf("FAQ page template missing expected element: %s", element)
		}
	}
}

func TestDocsPageTemplate(t *testing.T) {
	docsPage := templates.DocsPage()

	var buf bytes.Buffer
	err := docsPage.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render docs page template: %v", err)
	}

	html := buf.String()

	// Check for docs page elements
	expectedElements := []string{
		"Documentation",
		"Formula Pricing",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Errorf("Docs page template missing expected element: %s", element)
		}
	}
}

func TestDemoPageTemplate(t *testing.T) {
	demoPage := templates.DemoPage()

	var buf bytes.Buffer
	err := demoPage.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render demo page template: %v", err)
	}

	html := buf.String()

	// Check for demo page elements
	expectedElements := []string{
		"Demo",
		"Formula Pricing",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Errorf("Demo page template missing expected element: %s", element)
		}
	}
}

func TestAPIReferencePageTemplate(t *testing.T) {
	apiPage := templates.APIReferencePage()

	var buf bytes.Buffer
	err := apiPage.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render API reference page template: %v", err)
	}

	html := buf.String()

	// Check for API reference page elements
	expectedElements := []string{
		"API Reference",
		"Formula Pricing",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Errorf("API reference page template missing expected element: %s", element)
		}
	}
}

func TestExamplesPageTemplate(t *testing.T) {
	examplesPage := templates.ExamplesPage()

	var buf bytes.Buffer
	err := examplesPage.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render examples page template: %v", err)
	}

	html := buf.String()

	// Check for examples page elements
	expectedElements := []string{
		"Examples",
		"Formula Pricing",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Errorf("Examples page template missing expected element: %s", element)
		}
	}
}

func TestSearchResultsTemplate(t *testing.T) {
	searchData := templates.SearchData{
		Query: "test query",
		Results: []templates.SearchResult{
			{
				Title:       "Test Result",
				Description: "This is a test search result",
				URL:         "/test",
				Type:        "page",
			},
		},
	}
	searchResults := templates.SearchResultsPage(searchData)

	var buf bytes.Buffer
	err := searchResults.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render search results template: %v", err)
	}

	html := buf.String()

	// Check for search results elements
	expectedElements := []string{
		"Search Results",
		"test query",
		"Formula Pricing",
	}

	for _, element := range expectedElements {
		if !strings.Contains(html, element) {
			t.Errorf("Search results template missing expected element: %s", element)
		}
	}
}

func TestTemplateDataBinding(t *testing.T) {
	// Test that templates properly handle data binding
	testQuery := "pricing calculation"
	testSearchData := templates.SearchData{
		Query: testQuery,
		Results: []templates.SearchResult{
			{
				Title:       "Pricing Guide",
				Description: "Learn about pricing calculations",
				URL:         "/pricing-guide",
				Type:        "page",
			},
		},
	}
	searchResults := templates.SearchResultsPage(testSearchData)

	var buf bytes.Buffer
	err := searchResults.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render search results with data: %v", err)
	}

	html := buf.String()

	// Verify the query is properly escaped and displayed
	if !strings.Contains(html, testQuery) {
		t.Errorf("Template did not properly bind data: expected %s in output", testQuery)
	}

	// Test with special characters that need escaping
	specialQuery := "<script>alert('test')</script>"
	specialSearchData := templates.SearchData{
		Query:   specialQuery,
		Results: []templates.SearchResult{},
	}
	searchResultsSpecial := templates.SearchResultsPage(specialSearchData)

	buf.Reset()
	err = searchResultsSpecial.Render(context.Background(), &buf)
	if err != nil {
		t.Fatalf("Failed to render search results with special characters: %v", err)
	}

	html = buf.String()

	// Verify that special characters are properly escaped
	if strings.Contains(html, "<script>") {
		t.Error("Template did not properly escape special characters")
	}

	// Should contain escaped version
	if !strings.Contains(html, "&lt;script&gt;") {
		t.Error("Template did not properly escape HTML entities")
	}
}
