module github.com/suppers-ai/dufflebagbase

go 1.23.0

require (
	github.com/a-h/templ v0.3.943
	github.com/golang-jwt/jwt/v5 v5.2.0
	github.com/google/uuid v1.6.0
	github.com/gorilla/mux v1.8.1
	github.com/gorilla/sessions v1.2.2
	github.com/joho/godotenv v1.5.1
	github.com/suppers-ai/auth v0.0.0-local
	github.com/suppers-ai/database v0.1.0
	github.com/suppers-ai/logger v0.0.0-local
	github.com/suppers-ai/mailer v0.0.0
	golang.org/x/crypto v0.40.0
)

require (
	github.com/friendsofgo/errors v0.9.2 // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/gorilla/securecookie v1.1.2 // indirect
	github.com/jmoiron/sqlx v1.4.0 // indirect
	github.com/lib/pq v1.10.9 // indirect
	github.com/volatiletech/authboss/v3 v3.5.0 // indirect
	golang.org/x/net v0.42.0 // indirect
	golang.org/x/oauth2 v0.14.0 // indirect
	golang.org/x/xerrors v0.0.0-20220907171357-04be3eba64a2 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/protobuf v1.31.0 // indirect
)

replace github.com/suppers-ai/auth => ../packages/auth

replace github.com/suppers-ai/database => ../packages/database

replace github.com/suppers-ai/logger => ../packages/logger

replace github.com/suppers-ai/mailer => ../packages/mailer

replace github.com/suppers-ai/storageadapter => ../integrations/storageadapter
