# DuffleBagBase

A Supabase/PocketBase alternative built in Go that compiles to a single binary. DuffleBagBase provides a complete Backend-as-a-Service (BaaS) solution with authentication, database management, storage, and real-time capabilities.

## Features

- **🔐 Authentication & Authorization**
  - Built-in user management with email/password authentication
  - OAuth providers support (Google, GitHub, etc.)
  - JWT-based API authentication
  - Row Level Security (RLS) policies
  - Session management for web UI

- **🗄️ Dynamic Database Management**
  - Create collections (tables) dynamically through UI or API
  - Schema definition with field types and constraints
  - Automatic index management
  - PostgreSQL with schema isolation
  - CRUD operations via REST API

- **📁 File Storage**
  - S3-compatible storage (MinIO for local development)
  - Bucket management
  - File upload/download with permissions
  - Storage metadata tracking

- **📊 Admin Dashboard**
  - Web-based admin interface
  - Collection management UI
  - User management
  - Logs viewer
  - System settings

- **🔌 Real-time Subscriptions**
  - WebSocket support for real-time updates
  - Subscribe to database changes
  - Live queries

- **📝 Comprehensive Logging**
  - Request/response logging
  - Error tracking
  - Database query logging
  - Structured logging with multiple outputs

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dufflebagbase.git
cd dufflebagbase
```

2. Start the development environment:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- MinIO (S3-compatible storage) on port 9000
- MailHog (email testing) on port 8025
- DuffleBagBase on port 8080

3. Access the dashboard:
```
http://localhost:8080
```

Default admin credentials:
- Email: `admin@dufflebagbase.local`
- Password: `admin123`

### Building from Source

Requirements:
- Go 1.21+
- PostgreSQL 14+

1. Install dependencies:
```bash
go mod download
```

2. Set environment variables:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/dufflebagbase?sslmode=disable"
export PORT=8080
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=secretpassword
```

3. Build and run:
```bash
go build -o dufflebag
./dufflebag
```

## Configuration

DuffleBagBase can be configured through environment variables or a `.env` file:

```env
# Server
PORT=8080
ENVIRONMENT=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=dufflebagbase
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_SSL_MODE=disable

# Admin
ADMIN_EMAIL=admin@dufflebagbase.local
ADMIN_PASSWORD=admin123

# Security
JWT_SECRET=your-secret-key-change-in-production
SESSION_SECRET=your-session-secret-change-in-production

# Features
ENABLE_API=true
ENABLE_SIGNUP=true
ENABLE_STORAGE=true

# Storage (S3-compatible)
S3_ENDPOINT=localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_USE_SSL=false
LOCAL_STORAGE_PATH=./storage

# Email
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@dufflebagbase.local

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

## API Documentation

### Authentication

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Signup
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Collections

#### List Collections
```http
GET /api/v1/collections
Authorization: Bearer <token>
```

#### Create Collection
```http
POST /api/v1/collections
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "posts",
  "display_name": "Blog Posts",
  "description": "Blog posts collection",
  "schema": {
    "fields": [
      {
        "name": "title",
        "type": "text",
        "required": true,
        "max_length": 200
      },
      {
        "name": "content",
        "type": "text",
        "required": true
      },
      {
        "name": "author_id",
        "type": "uuid",
        "reference": "users",
        "required": true
      },
      {
        "name": "published",
        "type": "boolean",
        "default": false
      }
    ]
  },
  "indexes": [
    {
      "name": "idx_posts_author",
      "fields": ["author_id"]
    }
  ],
  "auth_rules": {
    "list_rule": "@authenticated",
    "view_rule": "@authenticated",
    "create_rule": "@authenticated",
    "update_rule": "created_by = auth.uid()",
    "delete_rule": "@admin"
  }
}
```

### Records

#### List Records
```http
GET /api/v1/collections/{collection}/records?limit=100&offset=0
Authorization: Bearer <token>
```

#### Create Record
```http
POST /api/v1/collections/{collection}/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Post",
  "content": "Hello, world!",
  "author_id": "uuid-here",
  "published": true
}
```

#### Get Record
```http
GET /api/v1/collections/{collection}/records/{id}
Authorization: Bearer <token>
```

#### Update Record
```http
PUT /api/v1/collections/{collection}/records/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title"
}
```

#### Delete Record
```http
DELETE /api/v1/collections/{collection}/records/{id}
Authorization: Bearer <token>
```

### Storage

#### List Buckets
```http
GET /api/v1/storage/buckets
Authorization: Bearer <token>
```

#### Upload File
```http
POST /api/v1/storage/{bucket}/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=@/path/to/file.jpg
```

#### Get File
```http
GET /api/v1/storage/{bucket}/{path}
Authorization: Bearer <token>
```

## Architecture

DuffleBagBase is built with a modular architecture:

```
dufflebagbase/
├── main.go              # Application entry point
├── config/              # Configuration management
├── handlers/            # HTTP request handlers
├── middleware/          # HTTP middleware
├── services/            # Business logic
├── web/                 # Web UI templates
└── static/              # Static assets
```

### Package Dependencies

- **auth**: Authentication and authorization
- **database**: Database abstraction layer
- **logger**: Structured logging
- **mailer**: Email service
- **storageadapter**: File storage abstraction

## Development

### Running Tests
```bash
go test ./...
```

### Database Migrations
The application automatically runs migrations on startup. Custom migrations can be added to the `migrations/` directory.

### Adding a New Collection Type
Collections can be created dynamically through the UI or API. Each collection automatically gets:
- UUID primary key
- Created/updated timestamps
- Created/updated by tracking
- Row Level Security policies

## Production Deployment

### Single Binary Deployment

1. Build for production:
```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o dufflebag .
```

2. Create a systemd service:
```ini
[Unit]
Description=DuffleBagBase
After=network.target

[Service]
Type=simple
User=dufflebag
WorkingDirectory=/opt/dufflebagbase
ExecStart=/opt/dufflebagbase/dufflebag
Restart=always
EnvironmentFile=/opt/dufflebagbase/.env

[Install]
WantedBy=multi-user.target
```

### Docker Deployment

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o dufflebag

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/dufflebag .
CMD ["./dufflebag"]
```

## Security Considerations

- Always use HTTPS in production
- Change default admin credentials immediately
- Use strong JWT and session secrets
- Enable rate limiting
- Configure CORS appropriately
- Use Row Level Security for multi-tenant applications
- Regular security updates

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- Documentation: [docs.dufflebagbase.com](https://docs.dufflebagbase.com)
- Issues: [GitHub Issues](https://github.com/yourusername/dufflebagbase/issues)
- Discord: [Join our community](https://discord.gg/dufflebagbase)

## Acknowledgments

Inspired by:
- [Supabase](https://supabase.com)
- [PocketBase](https://pocketbase.io)
- [Firebase](https://firebase.google.com)

Built with:
- [Go](https://golang.org)
- [PostgreSQL](https://www.postgresql.org)
- [Authboss](https://github.com/volatiletech/authboss)
- [Gorilla Mux](https://github.com/gorilla/mux)