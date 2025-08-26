package models

import "errors"

var (
	ErrNotFound     = errors.New("resource not found")
	ErrDuplicateKey = errors.New("duplicate key value")
	ErrInvalidInput = errors.New("invalid input")
)