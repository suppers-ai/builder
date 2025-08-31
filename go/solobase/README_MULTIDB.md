# Solobase - Multi-Database Support

Solobase now supports multiple database backends, allowing you to choose the best option for your use case.

## Supported Databases

### SQLite
- **Best for**: Development, testing, small deployments, embedded applications
- **Pros**: Zero configuration, single file database, no server required
- **Cons**: Limited concurrent writes, no network access
- **Configuration**: `DATABASE_TYPE=sqlite`

### PostgreSQL  
- **Best for**: Production deployments, high concurrency, cloud deployments
- **Pros**: Full ACID compliance, advanced features, excellent performance
- **Cons**: Requires separate server, more complex setup
- **Configuration**: `DATABASE_TYPE=postgres`

## Quick Start

### Using SQLite (Development)

1. Copy the SQLite example configuration:
```bash
cp .env.sqlite.example .env
```

2. Run the application:
```bash
go run .
```

That's it! The SQLite database will be created automatically at `./.data/solobase.db`.

### Using PostgreSQL (Production)

1. Start PostgreSQL (using Docker):
```bash
docker-compose up -d postgres
```

2. Copy the PostgreSQL example configuration:
```bash
cp .env.postgres.example .env
```

3. Run the application:
```bash
go run .
```

## Configuration Options

### SQLite Configuration

```env
DATABASE_TYPE=sqlite
DATABASE_URL=file:./.data/solobase.db?cache=shared&mode=rwc

# For in-memory database (testing only):
DATABASE_URL=:memory:

# For read-only mode:
DATABASE_URL=file:./.data/solobase.db?mode=ro

# For custom location:
DATABASE_URL=file:/var/lib/solobase/data.db
```

**Note**: By default, SQLite database is stored in `.data/` directory which is automatically created and excluded from version control.

### PostgreSQL Configuration

```env
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/dbname?sslmode=disable

# Or use individual settings:
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=solobase
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_SSLMODE=disable
```

## Migration from PostgreSQL to SQLite

If you have an existing PostgreSQL database and want to migrate to SQLite:

1. Export your data (implement a data export feature)
2. Switch the configuration to SQLite
3. Import your data (implement a data import feature)

## Migration from SQLite to PostgreSQL

If you're moving from development (SQLite) to production (PostgreSQL):

1. Export your SQLite data
2. Set up PostgreSQL
3. Switch the configuration
4. Import your data

## Architecture Changes

### Database Abstraction
- All database operations now go through GORM ORM
- No more raw SQL queries
- Database-specific features abstracted away

### Model Changes
- UUIDs generated in application code (not database)
- Password hashing in application code (not database) 
- JSON fields stored as TEXT (works in all databases)
- No database-specific types or functions

### Schema Changes
- PostgreSQL schemas replaced with table prefixes
- `auth.users` → `auth_users`
- `storage.buckets` → `storage_buckets`
- etc.

### Feature Compatibility

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Basic CRUD | ✅ | ✅ |
| Transactions | ✅ | ✅ |
| Foreign Keys | ✅ | ✅ |
| JSON Fields | ✅ (as TEXT) | ✅ (as JSONB) |
| Full Text Search | Limited | ✅ |
| Concurrent Writes | Limited | ✅ |
| Network Access | ❌ | ✅ |
| Replication | ❌ | ✅ |

## Performance Considerations

### SQLite Performance Tips
- Use WAL mode (enabled by default)
- Keep database file on SSD
- Vacuum periodically
- Limit concurrent writes

### PostgreSQL Performance Tips
- Tune connection pool settings
- Use connection pooler (PgBouncer) for high load
- Configure proper indexes
- Monitor with pg_stat_statements

## Testing

Run tests with different databases:

```bash
# Test with SQLite (default)
DATABASE_TYPE=sqlite go test ./...

# Test with in-memory SQLite (fastest)
DATABASE_TYPE=sqlite DATABASE_URL=:memory: go test ./...

# Test with PostgreSQL
DATABASE_TYPE=postgres DATABASE_URL=postgresql://test:test@localhost:5432/test go test ./...
```

## Deployment Examples

### Docker with SQLite
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o solobase .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/solobase .
# Create data directory and volume
RUN mkdir -p /root/.data
VOLUME ["/root/.data"]
ENV DATABASE_TYPE=sqlite
ENV DATABASE_URL=file:/root/.data/solobase.db
EXPOSE 8080
CMD ["./solobase"]
```

### Docker with PostgreSQL
```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      DATABASE_TYPE: postgres
      DATABASE_URL: postgresql://postgres:password@db:5432/solobase
    depends_on:
      - db
    ports:
      - "8080:8080"
  
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: solobase
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Troubleshooting

### SQLite Issues

**"database is locked"**
- Reduce concurrent writes
- Increase busy timeout
- Check for long-running transactions

**"no such table"**
- Ensure migrations ran successfully
- Check database file path
- Verify file permissions

### PostgreSQL Issues

**"connection refused"**
- Check PostgreSQL is running
- Verify connection settings
- Check firewall/network settings

**"permission denied"**
- Check database user permissions
- Verify database ownership
- Review pg_hba.conf settings

## Future Database Support

Planned support for:
- MySQL/MariaDB
- CockroachDB
- TiDB
- MongoDB (partial - for document collections)