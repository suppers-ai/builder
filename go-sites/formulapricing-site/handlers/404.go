package handlers

import (
	"net/http"

	"github.com/suppers-ai/formulapricing-site/logger"
)

func NotFoundHandler(log *logger.Logger) http.Handler {
	eh := NewErrorHandler(log)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		eh.HandleNotFound(w, r)
	})
}
