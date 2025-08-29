#!/bin/bash
export DATABASE_TYPE=postgres
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
export DEFAULT_ADMIN_EMAIL="admin@example.com"  
export DEFAULT_ADMIN_PASSWORD="AdminSecurePass2024!"
export PORT=8091
./dufflebag