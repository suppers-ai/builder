# SortedStorage Integrated Backend

This directory contains the Go backend for SortedStorage that imports and uses Solobase as a package.

## Architecture

The backend:
- Imports Solobase's API, services, and database packages
- Embeds the built SvelteKit frontend
- Serves both API and frontend from a single binary
- Runs on a single port (default: 3000)

## Development

### Prerequisites
- Go 1.23+
- Node.js 20+
- Access to Solobase packages (in `../../go/solobase`)

### Running in Development

1. **Frontend Development (with external Solobase)**:
```bash
# Terminal 1: Run Solobase backend
cd ../../go/solobase
./run-dev.sh sqlite

# Terminal 2: Run SvelteKit dev server
cd sortedstorage
npm run dev
```

2. **Integrated Development**:
```bash
# Run the integrated backend (serves API + static frontend)
npm run backend:dev
```

### Building

Build the complete integrated application:
```bash
# From sortedstorage directory
npm run build:full
```

This will:
1. Build the SvelteKit frontend
2. Copy build files to backend/build
3. Compile Go backend with embedded frontend
4. Output: `sortedstorage-server` binary

### Configuration

Configure via environment variables or `.env` file:

```env
# Server
PORT=3000

# Database
DATABASE_TYPE=sqlite
DATABASE_URL=file:./sortedstorage.db

# Admin
DEFAULT_ADMIN_EMAIL=admin@sortedstorage.com
DEFAULT_ADMIN_PASSWORD=YourSecurePassword

# Storage
STORAGE_TYPE=local
STORAGE_PATH=./storage

# JWT
JWT_SECRET=your-secret-key
```

## Deployment

### Single Binary Deployment

The built binary includes everything:
```bash
./sortedstorage-server
```

### Docker Deployment

Build Docker image with integrated backend:
```bash
docker build -f Dockerfile.integrated -t sortedstorage:integrated .
docker run -p 3000:3000 sortedstorage:integrated
```

## API Endpoints

The backend exposes all Solobase API endpoints under `/api/`:

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/storage/*` - File storage operations
- `/api/collections/*` - Data collections
- `/api/settings/*` - Application settings
- `/api/system/*` - System information

## Benefits

1. **Single Binary**: Entire application in one executable
2. **No Docker Required**: Can run directly on any system
3. **Better Performance**: No network overhead between frontend/backend
4. **Simplified Deployment**: One process, one port
5. **Reuses Solobase**: All backend logic from Solobase packages

## Project Structure

```
backend/
├── main.go          # Entry point with embedded frontend
├── go.mod           # Go module with Solobase imports
├── go.sum           # Dependency lock file
├── .env             # Configuration (not in git)
├── build/           # SvelteKit build output (generated)
└── README.md        # This file
```

## Troubleshooting

### Build Errors

If the build fails with "no matching files found":
1. Ensure you've built the frontend first: `npm run build`
2. Check that `build/` directory exists in backend/

### Database Issues

If database initialization fails:
1. Check DATABASE_URL format
2. For SQLite: Ensure write permissions in directory
3. For PostgreSQL: Ensure database server is running

### Port Conflicts

If port 3000 is in use:
1. Change PORT in .env file
2. Or set environment variable: `PORT=8080 ./sortedstorage-server`