package web

import (
	"context"
	"net/http"

	"github.com/a-h/templ"
	"github.com/gorilla/mux"
	"github.com/suppers-ai/dufflebagbase/constants"
	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/utils"
)

// BaseHandler provides common functionality for all handlers
type BaseHandler struct {
	Service *services.Service
	Session *utils.SessionHelper
}

// NewBaseHandler creates a new base handler
func NewBaseHandler(svc *services.Service) *BaseHandler {
	return &BaseHandler{
		Service: svc,
		Session: utils.NewSessionHelper(svc.SessionStore(), constants.SessionName),
	}
}

// GetUserEmail retrieves user email from session
func (h *BaseHandler) GetUserEmail(r *http.Request) (string, error) {
	return h.Session.GetUserEmail(r)
}

// GetUserID retrieves user ID from session
func (h *BaseHandler) GetUserID(r *http.Request) (string, error) {
	return h.Session.GetUserID(r)
}

// RenderWithHTMX renders a component with HTMX support
func (h *BaseHandler) RenderWithHTMX(w http.ResponseWriter, r *http.Request, fullPage, partial templ.Component) error {
	var component templ.Component
	if utils.IsHTMXRequest(r) {
		component = partial
	} else {
		component = fullPage
	}
	return Render(w, r, component)
}

// JSONSuccess sends a success JSON response
func (h *BaseHandler) JSONSuccess(w http.ResponseWriter, message string) {
	h.JSONSuccessMessage(w, message)
}

// JSONError sends an error JSON response
func (h *BaseHandler) JSONError(w http.ResponseWriter, status int, message string) {
	utils.JSONError(w, status, message)
}

// JSONResponse sends a JSON response
func (h *BaseHandler) JSONResponse(w http.ResponseWriter, status int, data interface{}) error {
	return utils.JSONResponse(w, status, data)
}

// ParseJSON parses JSON request body
func (h *BaseHandler) ParseJSON(r *http.Request, dest interface{}) error {
	return utils.ParseJSONRequest(r, dest)
}

// GetPaginationParams extracts pagination parameters with default size
func (h *BaseHandler) GetPaginationParams(r *http.Request) (page, pageSize, offset int) {
	return utils.GetPaginationParams(r, constants.DefaultPageSize)
}

// GetPaginationWithSize extracts pagination parameters with custom default size
func (h *BaseHandler) GetPaginationWithSize(r *http.Request, defaultSize int) (page, pageSize, offset int) {
	return utils.GetPaginationParams(r, defaultSize)
}

// GetPathVar gets a path variable from the request
func (h *BaseHandler) GetPathVar(r *http.Request, key string) string {
	vars := mux.Vars(r)
	return vars[key]
}

// GetUserIDFromPath gets the user ID from the path
func (h *BaseHandler) GetUserIDFromPath(r *http.Request) string {
	return h.GetPathVar(r, "id")
}

// GetBucketFromPath gets the bucket name from the path
func (h *BaseHandler) GetBucketFromPath(r *http.Request) string {
	return h.GetPathVar(r, "bucket")
}

// GetTableFromPath gets the table name from the path
func (h *BaseHandler) GetTableFromPath(r *http.Request) string {
	return h.GetPathVar(r, "table")
}

// JSONSuccessMessage sends a success message response
func (h *BaseHandler) JSONSuccessMessage(w http.ResponseWriter, message string) {
	h.JSONResponse(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": message,
	})
}

// JSONSuccessData sends a success response with data
func (h *BaseHandler) JSONSuccessData(w http.ResponseWriter, message string, data interface{}) {
	h.JSONResponse(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// ValidateAndGetUserID validates and returns user ID from path
func (h *BaseHandler) ValidateAndGetUserID(r *http.Request) (string, error) {
	userID := h.GetUserIDFromPath(r)
	if err := utils.ValidateUserID(userID); err != nil {
		return "", err
	}
	return userID, nil
}

// GetContextWithUser adds user info to context
func (h *BaseHandler) GetContextWithUser(r *http.Request) context.Context {
	ctx := h.NewContext()
	if userID, err := h.GetUserID(r); err == nil && userID != "" {
		ctx = context.WithValue(ctx, constants.ContextKeyUserID, userID)
	}
	if email, err := h.GetUserEmail(r); err == nil && email != "" {
		ctx = context.WithValue(ctx, constants.ContextKeyUserEmail, email)
	}
	return ctx
}

// NewContext creates a new context (can be extended with request ID, etc.)
func (h *BaseHandler) NewContext() context.Context {
	return context.Background()
}

// LogError logs an error with context
func (h *BaseHandler) LogError(ctx context.Context, message string, err error) {
	h.Service.Logger().Error(ctx, message)
}
