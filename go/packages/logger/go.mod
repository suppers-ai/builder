module github.com/suppers-ai/logger

go 1.21

require (
	github.com/google/uuid v1.6.0
	github.com/suppers-ai/database v0.0.0-local
)

require (
	github.com/jmoiron/sqlx v1.4.0 // indirect
	github.com/lib/pq v1.10.9 // indirect
)

replace github.com/suppers-ai/database => ../database
