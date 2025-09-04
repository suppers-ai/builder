#!/bin/bash

# Simple run script for standalone Solobase
# Default port: 8090 (to avoid conflict with SortedStorage on 8081)

PORT=${PORT:-8090}
DATABASE_TYPE=${DATABASE_TYPE:-sqlite}
DATABASE_URL=${DATABASE_URL:-"file:./.data/solobase.db"}
DEFAULT_ADMIN_EMAIL=${DEFAULT_ADMIN_EMAIL:-"admin@example.com"}
DEFAULT_ADMIN_PASSWORD=${DEFAULT_ADMIN_PASSWORD:-"admin123"}

echo "🚀 Starting Solobase on port $PORT"
echo "   Database: $DATABASE_TYPE"
echo "   Admin: $DEFAULT_ADMIN_EMAIL"
echo ""

DATABASE_TYPE=$DATABASE_TYPE \
DATABASE_URL=$DATABASE_URL \
DEFAULT_ADMIN_EMAIL=$DEFAULT_ADMIN_EMAIL \
DEFAULT_ADMIN_PASSWORD=$DEFAULT_ADMIN_PASSWORD \
PORT=$PORT \
go run ./cmd/solobase