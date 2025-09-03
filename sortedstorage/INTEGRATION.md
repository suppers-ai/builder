# SortedStorage + Solobase Integration

This document describes how SortedStorage has been integrated with Solobase to create a single deployable binary.

## Architecture

The integration follows a clean package-based approach:
- **Solobase** remains in its original location and acts as a reusable Go package
- **SortedStorage** includes a backend directory that imports Solobase
- The frontend (SvelteKit) is built to static files and embedded in the Go binary

## Structure

```
sortedstorage/
├── src/               # SvelteKit frontend source
├── build/             # Built frontend (static files)
├── backend/           # Integrated Go backend
│   ├── main.go       # Entry point - imports Solobase
│   ├── go.mod        # Module with local replacements
│   └── build/        # Embedded frontend files
└── run-*.sh          # Various run scripts
```

## Key Features

1. **Single Binary Deployment**: The Go binary includes both backend and frontend
2. **Package Reusability**: Solobase remains a separate, reusable package
3. **Local Development**: Uses Go module replacements for local development
4. **Database Flexibility**: Supports both SQLite and PostgreSQL
5. **Embedded Assets**: Frontend is embedded using Go's `embed` package

## Running the Application

### Simple Development
```bash
./run-simple.sh
```
This builds the frontend and starts the integrated backend.

### Full Development with Hot Reload
```bash
./run-dev-integrated.sh
```
This includes hot reload support (requires fswatch).

### Manual Start
```bash
# Build frontend
npm run build

# Copy to backend
cp -r build backend/

# Start backend
cd backend
DATABASE_TYPE=sqlite \
DATABASE_URL=file:./test.db \
PORT=3000 \
DEFAULT_ADMIN_EMAIL=admin@sortedstorage.com \
DEFAULT_ADMIN_PASSWORD=Test123456! \
go run .
```

## Configuration

The backend uses environment variables for configuration:
- `DATABASE_TYPE`: sqlite or postgres
- `DATABASE_URL`: Database connection string
- `PORT`: Server port (default: 3000)
- `DEFAULT_ADMIN_EMAIL`: Admin user email
- `DEFAULT_ADMIN_PASSWORD`: Admin user password (min 12 chars)

## API Endpoints

The integrated backend serves:
- Frontend: `http://localhost:PORT/`
- API: `http://localhost:PORT/api/`

## Authentication

The system uses JWT-based authentication with:
- Default admin account created on first run
- Secure password requirements (12+ characters)
- Token-based session management

## Database

Supports two database types:
- **SQLite**: For development and small deployments
- **PostgreSQL**: For production deployments

Auto-migrations run on startup to ensure schema is up to date.

## Production Deployment

1. Build the binary:
```bash
cd backend
go build -o sortedstorage
```

2. Deploy with configuration:
```bash
DATABASE_TYPE=postgres \
DATABASE_URL="postgresql://user:pass@host/db" \
PORT=8080 \
./sortedstorage
```

## Benefits of This Approach

1. **Modularity**: Solobase remains independent and reusable
2. **Simplicity**: Single binary deployment
3. **Performance**: Static frontend served directly from binary
4. **Flexibility**: Can switch databases without code changes
5. **Security**: Built-in authentication and authorization