#!/bin/bash

# Database connection details
DB_USER="postgres"
DB_PASSWORD="your_secure_password_here"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="postgres"

echo "Resetting FormulaPricing database..."

# Drop the schema and recreate it
docker exec -i formula-pricing-postgres psql -U $DB_USER -d $DB_NAME <<EOF
DROP SCHEMA IF EXISTS formulapricing CASCADE;
EOF

echo "Schema dropped. Restarting application to recreate..."

# Kill the running application
pkill -f "go run main.go" 2>/dev/null || true

# Start the application again (it will run migrations automatically)
echo "Starting application (migrations will run automatically)..."
go run main.go &

echo "Database reset complete! Application is starting..."
echo "Wait a few seconds for the server to be ready at http://localhost:8090"