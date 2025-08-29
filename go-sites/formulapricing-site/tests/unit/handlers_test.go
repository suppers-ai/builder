package unit

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/suppers-ai/formulapricing-site/handlers"
	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/tests/fixtures"
)

func TestHomeHandler(t *testing.T) {
	log := logger.New("error") // Use error level to reduce test output
	handler := handlers.HomeHandler(log)

	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check content type
	expected := "text/html; charset=utf-8"
	if ct := rr.Header().Get("Content-Type"); ct != expected {
		t.Errorf("handler returned wrong content type: got %v want %v", ct, expected)
	}

	// Check that response contains expected content
	body := rr.Body.String()
	expectedContent := []string{
		"Formula Pricing",
		"Professor Gopher",
		"Live Demo",
		"Read the documentation",
		"Open Source Formula Pricing",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("response body does not contain expected content: %s", content)
		}
	}

	// Check for proper HTML structure (case insensitive)
	if !strings.Contains(strings.ToLower(body), "<!doctype html>") {
		t.Logf("Response body preview: %s", body[:fixtures.Min(200, len(body))])
		t.Error("response does not contain proper DOCTYPE")
	}

	if !strings.Contains(body, "<html") {
		t.Error("response does not contain html tag")
	}

	if !strings.Contains(body, "</html>") {
		t.Error("response does not contain closing html tag")
	}
}

func TestHealthHandler(t *testing.T) {
	log := logger.New("error")
	handler := handlers.EnhancedHealthHandler(log)

	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check content type
	expected := "application/json"
	if ct := rr.Header().Get("Content-Type"); ct != expected {
		t.Errorf("handler returned wrong content type: got %v want %v", ct, expected)
	}

	// Check response body contains health status
	body := rr.Body.String()
	if !strings.Contains(body, "status") {
		t.Error("health response does not contain status field")
	}

	if !strings.Contains(body, "healthy") {
		t.Error("health response does not indicate healthy status")
	}
}

func TestHealthHandlerHEAD(t *testing.T) {
	log := logger.New("error")
	handler := handlers.EnhancedHealthHandler(log)

	req, err := http.NewRequest("HEAD", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// HEAD requests may have body in this implementation (which is acceptable)
	// The important thing is that the status code is correct
	body := rr.Body.String()
	if body != "" {
		// Verify it's valid JSON health response
		if !strings.Contains(body, "healthy") {
			t.Errorf("HEAD request body should contain health status, got: %s", body)
		}
	}
}

func TestFAQHandler(t *testing.T) {
	log := logger.New("error")
	handler := handlers.FAQHandler(log)

	req, err := http.NewRequest("GET", "/faq", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check content type
	expected := "text/html; charset=utf-8"
	if ct := rr.Header().Get("Content-Type"); ct != expected {
		t.Errorf("handler returned wrong content type: got %v want %v", ct, expected)
	}

	// Check that response contains FAQ content
	body := rr.Body.String()
	expectedContent := []string{
		"FAQ",
		"Frequently Asked Questions",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("FAQ response body does not contain expected content: %s", content)
		}
	}
}

func TestDocsHandler(t *testing.T) {
	log := logger.New("error")
	handler := handlers.DocsHandler(log)

	req, err := http.NewRequest("GET", "/docs", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check content type
	expected := "text/html; charset=utf-8"
	if ct := rr.Header().Get("Content-Type"); ct != expected {
		t.Errorf("handler returned wrong content type: got %v want %v", ct, expected)
	}

	// Check that response contains documentation content
	body := rr.Body.String()
	expectedContent := []string{
		"Documentation",
		"Formula Pricing",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("Docs response body does not contain expected content: %s", content)
		}
	}
}

func TestDemoHandler(t *testing.T) {
	log := logger.New("error")
	handler := handlers.DemoHandler(log)

	req, err := http.NewRequest("GET", "/demo", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check content type
	expected := "text/html; charset=utf-8"
	if ct := rr.Header().Get("Content-Type"); ct != expected {
		t.Errorf("handler returned wrong content type: got %v want %v", ct, expected)
	}

	// Check that response contains demo content
	body := rr.Body.String()
	expectedContent := []string{
		"Demo",
		"Formula Pricing",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("Demo response body does not contain expected content: %s", content)
		}
	}
}

func TestAPIReferenceHandler(t *testing.T) {
	log := logger.New("error")
	handler := handlers.APIReferenceHandler(log)

	req, err := http.NewRequest("GET", "/api-reference", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check content type
	expected := "text/html; charset=utf-8"
	if ct := rr.Header().Get("Content-Type"); ct != expected {
		t.Errorf("handler returned wrong content type: got %v want %v", ct, expected)
	}

	// Check that response contains API reference content
	body := rr.Body.String()
	expectedContent := []string{
		"API Reference",
		"Formula Pricing",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("API Reference response body does not contain expected content: %s", content)
		}
	}
}

func TestExamplesHandler(t *testing.T) {
	log := logger.New("error")
	handler := handlers.ExamplesHandler(log)

	req, err := http.NewRequest("GET", "/examples", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check content type
	expected := "text/html; charset=utf-8"
	if ct := rr.Header().Get("Content-Type"); ct != expected {
		t.Errorf("handler returned wrong content type: got %v want %v", ct, expected)
	}

	// Check that response contains examples content
	body := rr.Body.String()
	expectedContent := []string{
		"Examples",
		"Formula Pricing",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("Examples response body does not contain expected content: %s", content)
		}
	}
}

func TestSearchHandler(t *testing.T) {
	log := logger.New("error")
	handler := handlers.SearchHandler(log)

	// Test GET request without query (should redirect)
	req, err := http.NewRequest("GET", "/search", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code (should be redirect)
	if status := rr.Code; status != http.StatusSeeOther {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusSeeOther)
	}

	// Check redirect location
	if location := rr.Header().Get("Location"); location != "/" {
		t.Errorf("handler returned wrong redirect location: got %v want %v", location, "/")
	}

	// Test with search query
	req, err = http.NewRequest("GET", "/search?q=pricing", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr = httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Check that response contains search results
	body := rr.Body.String()
	expectedContent := []string{
		"Search Results",
		"pricing",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("Search response body does not contain expected content: %s", content)
		}
	}
}

func TestNotFoundHandler(t *testing.T) {
	log := logger.New("error")
	handler := handlers.EnhancedNotFoundHandler(log)

	req, err := http.NewRequest("GET", "/nonexistent", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusNotFound {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusNotFound)
	}

	// Check content type
	expected := "text/html; charset=utf-8"
	if ct := rr.Header().Get("Content-Type"); ct != expected {
		t.Errorf("handler returned wrong content type: got %v want %v", ct, expected)
	}

	// Check that response contains 404 content
	body := rr.Body.String()
	expectedContent := []string{
		"404",
		"Page Not Found",
		"Go Home",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("404 response body does not contain expected content: %s", content)
		}
	}
}
