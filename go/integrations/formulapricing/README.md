# FormulaPricing

A Go-based pricing management system with a web interface and API for managing dynamic pricing with formulas and conditions. Similar to PocketBase but focused on pricing calculations.

## Features

### Web Interface
- **Dashboard**: View and manage all collections (variables, calculations, conditions, pricing)
- **Logs**: Track all API requests and system activity
- **Settings**: View system configuration and database settings
- **Authentication**: Secure login system with session management

### API Features
- **Variables**: Define reusable variables for calculations
- **Calculations**: Create named formulas using variables and operators
- **Conditions**: Define conditions for when calculations should apply
- **Pricing Rules**: Combine conditions and calculations for dynamic pricing
- **Calculate API**: Evaluate pricing rules with provided variable values

## Quick Start

### Using Docker Compose

```bash
# Start the service with PostgreSQL
docker-compose up

# Access the web interface at http://localhost:8080
# Default login: admin@example.com / admin123
```

## Development

### Quick Start (Recommended for Development)

1. **Start PostgreSQL only**:
```bash
docker compose -f docker-compose.dev.yml up postgres -d
```

2. **Run the application locally** (with auto-restart on changes):
```bash
# Set environment variables and run
DATABASE_URL=postgres://postgres:postgres@localhost:5433/pricing_db?sslmode=disable go run .

# Or use the .env file (create one first - see below)
go run .
```

3. **Access the application**:
- Web interface: http://localhost:8080
- API: http://localhost:8080/api
- Default login: admin@example.com / admin123

### Development Options

#### Option 1: Local Development with Docker PostgreSQL (Fastest)
```bash
# Start only PostgreSQL
docker compose -f docker-compose.dev.yml up postgres -d

# Run app locally (port 8080 by default)
DATABASE_URL=postgres://postgres:postgres@localhost:5433/pricing_db?sslmode=disable go run .

# If port 8080 is in use, specify a different port
PORT=8090 DATABASE_URL=postgres://postgres:postgres@localhost:5433/pricing_db?sslmode=disable go run .
```

#### Option 2: Hot Reload with Air
```bash
# Install air for hot-reload
go install github.com/cosmtrek/air@latest

# Run with auto-reload
DATABASE_URL=postgres://postgres:postgres@localhost:5433/pricing_db?sslmode=disable air
```

#### Option 3: Full Docker Development (Auto-reload)
```bash
# Uses docker-compose.dev.yml which mounts code as volume
docker compose -f docker-compose.dev.yml up

# Code changes will auto-reload
```

#### Option 4: Production Docker (Requires Rebuild)
```bash
# Build and run everything in Docker
docker compose up -d

# After code changes, rebuild:
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Managing Ports

If you get "address already in use" error:

```bash
# Check what's using the port
lsof -i :8080

# Kill the process (Linux/Mac)
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use a different port
PORT=8090 go run .
```

### Environment Variables

Create a `.env` file for consistent configuration:

```env
# .env
SESSION_SECRET=a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447
SUPERUSER_EMAIL=admin@example.com
SUPERUSER_PASSWORD=admin123
PORT=8080
DATABASE_URL=postgres://postgres:postgres@localhost:5433/pricing_db?sslmode=disable
```

### Viewing the Database

Connect to PostgreSQL database running in Docker:

```bash
# Using docker exec
docker exec -it formulapricing-postgres-1 psql -U postgres -d pricing_db

# View all tables
docker exec formulapricing-postgres-1 psql -U postgres -d pricing_db -c "\dt pricing.*"

# Query data
docker exec formulapricing-postgres-1 psql -U postgres -d pricing_db -c "SELECT * FROM pricing.variables;"

# Using psql directly (if installed)
psql -h localhost -p 5433 -U postgres -d pricing_db
# Password: postgres
```

GUI tools can connect with:
- Host: localhost
- Port: 5433
- Database: pricing_db
- Username: postgres
- Password: postgres

## API Endpoints

### Variables
- `GET /api/variables` - List all variables
- `POST /api/variables` - Create a variable
- `GET /api/variables/{id}` - Get a variable
- `PUT /api/variables/{id}` - Update a variable
- `DELETE /api/variables/{id}` - Delete a variable

### Calculations
- `GET /api/calculations` - List all calculations
- `POST /api/calculations` - Create a calculation
- `GET /api/calculations/{id}` - Get a calculation
- `PUT /api/calculations/{id}` - Update a calculation
- `DELETE /api/calculations/{id}` - Delete a calculation

### Conditions
- `GET /api/conditions` - List all conditions
- `POST /api/conditions` - Create a condition
- `GET /api/conditions/{id}` - Get a condition
- `PUT /api/conditions/{id}` - Update a condition
- `DELETE /api/conditions/{id}` - Delete a condition

### Pricing
- `GET /api/pricing` - List all pricing configurations
- `POST /api/pricing` - Create a pricing configuration
- `GET /api/pricing/{id}` - Get a pricing configuration
- `PUT /api/pricing/{id}` - Update a pricing configuration
- `DELETE /api/pricing/{id}` - Delete a pricing configuration

### Calculate
- `POST /api/calculate` - Calculate pricing based on rules and variables

## Example Usage

### 1. Create Variables
```json
POST /api/variables
{
  "variable_name": "adultPrice",
  "display_name": "Adult Price",
  "description": "Price per adult",
  "value_type": "number"
}
```

### 2. Create Calculations
```json
POST /api/calculations
{
  "calculation_name": "adultsCost",
  "display_name": "Adults Cost",
  "description": "Total cost for adults",
  "calculation": ["adultPrice", "*", "numberOfAdults"]
}
```

### 3. Create Conditions
```json
POST /api/conditions
{
  "condition_name": "hasAdults",
  "display_name": "Has Adults",
  "description": "Check if there are adults",
  "condition": ["numberOfAdults", ">", "0"]
}
```

### 4. Create Pricing Configuration
```json
POST /api/pricing
{
  "name": "standard_family_pricing",
  "description": "Standard pricing for family bookings",
  "pricing": [
    {"condition": "hasAdults", "calculation": "adultsCost"},
    {"condition": "hasChildren", "calculation": "childrenCost"}
  ]
}
```

### 5. Calculate Pricing
```json
POST /api/calculate
{
  "pricing_name": "standard_family_pricing",
  "variables": {
    "numberOfAdults": 2,
    "numberOfChildren": 1,
    "adultPrice": 100,
    "childPrice": 50
  }
}
```

Response:
```json
{
  "results": [
    {
      "condition_name": "hasAdults",
      "condition_met": true,
      "calculation_name": "adultsCost",
      "display_name": "Adults Cost",
      "value": 200
    },
    {
      "condition_name": "hasChildren",
      "condition_met": true,
      "calculation_name": "childrenCost",
      "display_name": "Children Cost",
      "value": 50
    }
  ],
  "total": 250,
  "summary": {
    "adultsCost": {
      "display_name": "Adults Cost",
      "value": 200
    },
    "childrenCost": {
      "display_name": "Children Cost",
      "value": 50
    }
  }
}
```

## Database Schema

The service uses PostgreSQL with a `pricing` schema containing:

- `variables` - Variable definitions
- `calculations` - Calculation formulas
- `conditions` - Condition definitions
- `pricing` - Pricing configurations combining conditions and calculations

## Database Migrations

The application includes automatic database migration support using golang-migrate.

### Automatic Migrations

By default, migrations run automatically when the application starts. This can be controlled with the `AUTO_MIGRATE` environment variable:

```bash
# Enable auto-migration (default)
AUTO_MIGRATE=true go run main.go

# Disable auto-migration
AUTO_MIGRATE=false go run main.go
```

### Manual Migration Management

A CLI tool is provided for manual migration management:

```bash
# Build the migration tool
go build -o migrate cmd/migrate/main.go

# Show current migration status
./migrate -status

# Run all pending migrations
./migrate

# Run specific number of migrations
./migrate -steps 1

# Rollback last migration
./migrate -direction down -steps 1

# Rollback all migrations
./migrate -direction down

# Force to specific version (use with caution)
./migrate -force 1
```

### Connecting to External PostgreSQL

When connecting to an external PostgreSQL database, set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgres://username:password@host:port/database?sslmode=require"
go run main.go
```

Migrations will run automatically on startup unless disabled with `AUTO_MIGRATE=false`.

### Migration Files

Migrations are located in `database/migrations/` and follow this naming convention:
- `{version}_{description}.up.sql` - Migration to apply
- `{version}_{description}.down.sql` - Migration rollback

Current migrations:
1. `001_create_schema.up.sql` - Creates all database tables and indexes
2. `002_default_data.up.sql` - Inserts default variables, calculations, conditions, and pricing rules

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - HTTP server port (default: 8080)
- `SESSION_SECRET` - Secret key for session encryption
- `SUPERUSER_EMAIL` - Default superuser email (default: admin@example.com)
- `SUPERUSER_PASSWORD` - Default superuser password (default: admin123)
- `AUTO_MIGRATE` - Enable/disable automatic migrations on startup (default: true)
- `USE_FILE_MIGRATIONS` - Use file-based migrations instead of embedded (default: false)
- `MIGRATIONS_PATH` - Path to migration files when using file-based migrations (default: database/migrations)

## Building a Single Binary

To compile everything into a single executable:

```bash
# Build for current platform
go build -o formulapricing

# Build for Linux
GOOS=linux GOARCH=amd64 go build -o formulapricing-linux

# Build for Windows
GOOS=windows GOARCH=amd64 go build -o formulapricing.exe

# Build for macOS
GOOS=darwin GOARCH=amd64 go build -o formulapricing-mac
```

The binary includes all templates and can be deployed as a single file.