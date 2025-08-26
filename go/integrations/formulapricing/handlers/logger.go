package handlers

import (
	"github.com/suppers-ai/logger"
)

// getLogger returns the default logger instance
func getLogger() logger.Logger {
	return logger.GetDefault()
}