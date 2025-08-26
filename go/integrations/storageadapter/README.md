# Storage Adapter

A flexible Go library for handling file storage with S3 and PostgreSQL metadata management. This library provides a unified interface for storing files in S3-compatible storage while maintaining rich metadata, permissions, and sharing capabilities in PostgreSQL.

## Features

- **Flexible Storage Backend**: Interface-based design allows for different storage implementations (S3, MinIO, etc.)
- **Rich Metadata Management**: PostgreSQL-based metadata store with full JSONB support
- **Advanced Permissions**: Fine-grained permission system with view, edit, and admin levels
- **File Sharing**: Support for user-based and token-based (public link) sharing
- **Folder Hierarchy**: Full folder/directory structure support with path materialization
- **Storage Quotas**: User-based storage and bandwidth quota management
- **Access Logging**: Comprehensive access logging for audit trails
- **Multipart Upload**: Support for large file uploads via multipart upload
- **Presigned URLs**: Generate temporary direct access URLs
- **Transaction Support**: Atomic operations with transaction support

## Installation

```bash
go get github.com/suppers-ai/storageadapter
```

## Quick Start

### 1. Run Database Migrations

Apply the database migrations to set up the required schema:

```bash
psql $DATABASE_URL -f migrations/001_create_storageadapter_schema.up.sql
```

### 2. Initialize the Adapter

```go
package main

import (
    "github.com/suppers-ai/storageadapter"
    "github.com/suppers-ai/storageadapter/config"
)

func main() {
    // Load configuration from environment
    cfg := config.NewFromEnv()
    
    // Initialize the adapter
    adapter, err := config.InitializeAdapter(cfg)
    if err != nil {
        log.Fatal(err)
    }
    
    // Use the adapter...
}
```

### 3. Upload a File

```go
content := []byte("Hello, World!")
reader := bytes.NewReader(content)

result, err := adapter.Upload(ctx, reader, int64(len(content)), &storageadapter.UploadOptions{
    UserID:   userID,
    Name:     "hello.txt",
    MimeType: "text/plain",
    Metadata: map[string]interface{}{
        "description": "Test file",
    },
})
```

## Configuration

Set the following environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/dbname?sslmode=disable

# S3 Storage
S3_REGION=us-east-1
S3_BUCKET=my-bucket
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Optional: For S3-compatible services (MinIO, etc.)
S3_ENDPOINT=http://localhost:9000
S3_USE_PATH_STYLE=true

# Application
SHARE_BASE_URL=https://yourdomain.com
```

## Architecture

The library is built with extensibility in mind:

### Storage Layer
- **FileStorage Interface**: Defines operations for file storage
- **S3FileStorage**: Implementation using AWS S3 SDK

### Metadata Layer
- **MetadataStore Interface**: Defines operations for metadata management
- **PostgreSQLMetadataStore**: Implementation using PostgreSQL

### Main Adapter
- **StorageAdapter**: Coordinates between storage and metadata layers

## Core Operations

### File Operations
- `Upload()`: Upload files with metadata
- `Download()`: Download files with permission checks
- `Delete()`: Delete files with permission validation
- `Copy()`: Create copies of files
- `Move()`: Move files within the hierarchy

### Folder Operations
- `CreateFolder()`: Create folders for organization
- `ListObjects()`: List files and folders with filtering

### Sharing Operations
- `Share()`: Create shares with specific users or public links
- `GetShareByToken()`: Retrieve share information by token

### Quota Operations
- `GetQuota()`: Get user's storage quota information
- `IncrementStorageUsage()`: Update storage usage
- `IncrementBandwidthUsage()`: Update bandwidth usage

## Database Schema

The library uses a PostgreSQL schema (`storageadapter`) with the following main tables:

- `storage_objects`: File and folder metadata
- `storage_shares`: Sharing configurations
- `storage_access_logs`: Access audit logs
- `storage_quotas`: User quota management

## Security Features

- **Permission Levels**: View, Edit, Admin
- **Hierarchical Permissions**: Inherit permissions to child objects
- **Token-based Sharing**: Secure public link generation
- **Expiring Shares**: Time-limited access
- **Access Logging**: Complete audit trail

## Development

### Running Tests

```bash
go test ./...
```

### Local Development with MinIO

For local development, you can use MinIO as an S3-compatible storage:

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

## Examples

See the `examples/` directory for comprehensive usage examples.

## License

MIT License