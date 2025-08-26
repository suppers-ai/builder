module github.com/suppers-ai/auth

go 1.21

require (
	github.com/gorilla/sessions v1.2.2
	github.com/jmoiron/sqlx v1.3.5
	github.com/lib/pq v1.10.9
	github.com/suppers-ai/database v0.0.0
	github.com/suppers-ai/mailer v0.0.0
	github.com/volatiletech/authboss/v3 v3.5.0
)

replace (
	github.com/suppers-ai/database => ../database
	github.com/suppers-ai/mailer => ../mailer
)

require (
	github.com/friendsofgo/errors v0.9.2 // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/gorilla/securecookie v1.1.2 // indirect
	golang.org/x/crypto v0.18.0 // indirect
	golang.org/x/net v0.17.0 // indirect
	golang.org/x/oauth2 v0.6.0 // indirect
	golang.org/x/xerrors v0.0.0-20220907171357-04be3eba64a2 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/protobuf v1.29.1 // indirect
)
