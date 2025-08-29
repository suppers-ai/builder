package handlers

import (
	"net/http"

	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/templates"
)

// FAQHandler handles requests to the FAQ section
func FAQHandler(log *logger.Logger) http.HandlerFunc {
	eh := NewErrorHandler(log)
	return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		if err := templates.FAQPage().Render(r.Context(), w); err != nil {
			eh.HandleTemplateError(w, r, err, "FAQ Page")
			return
		}
	}, "FAQHandler")
}

// DocsHandler handles requests to the documentation section
func DocsHandler(log *logger.Logger) http.HandlerFunc {
	eh := NewErrorHandler(log)
	return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		if err := templates.DocsPage().Render(r.Context(), w); err != nil {
			eh.HandleTemplateError(w, r, err, "Documentation Page")
			return
		}
	}, "DocsHandler")
}

// DemoHandler handles requests to the demo section
func DemoHandler(log *logger.Logger) http.HandlerFunc {
	eh := NewErrorHandler(log)
	return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		if err := templates.DemoPage().Render(r.Context(), w); err != nil {
			eh.HandleTemplateError(w, r, err, "Demo Page")
			return
		}
	}, "DemoHandler")
}

// APIReferenceHandler handles requests to the API reference section
func APIReferenceHandler(log *logger.Logger) http.HandlerFunc {
	eh := NewErrorHandler(log)
	return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		if err := templates.APIReferencePage().Render(r.Context(), w); err != nil {
			eh.HandleTemplateError(w, r, err, "API Reference Page")
			return
		}
	}, "APIReferenceHandler")
}

// ExamplesHandler handles requests to the examples section
func ExamplesHandler(log *logger.Logger) http.HandlerFunc {
	eh := NewErrorHandler(log)
	return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		if err := templates.ExamplesPage().Render(r.Context(), w); err != nil {
			eh.HandleTemplateError(w, r, err, "Examples Page")
			return
		}
	}, "ExamplesHandler")
}
