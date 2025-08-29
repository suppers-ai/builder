package handlers

import (
	"net/http"

	"github.com/suppers-ai/formulapricing-site/logger"
	"github.com/suppers-ai/formulapricing-site/templates"
)

func HomeHandler(log *logger.Logger) http.HandlerFunc {
	eh := NewErrorHandler(log)
	return WithErrorHandling(log, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		if err := templates.HomePage().Render(r.Context(), w); err != nil {
			eh.HandleTemplateError(w, r, err, "Home Page")
			return
		}
	}, "HomeHandler")
}
