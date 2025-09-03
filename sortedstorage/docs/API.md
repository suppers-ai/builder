# SortedStorage API Documentation

## Overview

SortedStorage provides a comprehensive REST API for file storage, management, and sharing operations. All API endpoints are prefixed with `/api` and require authentication unless otherwise specified.

## Base URL

```
Production: https://api.sortedstorage.com
Staging: https://staging-api.sortedstorage.com
Development: http://localhost:8090
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <token>
```

### Obtaining a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Refreshing a Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

## Storage Endpoints

### List Files and Folders

```http
GET /api/storage/items?path=/&page=1&limit=50&sort=name&order=asc
```

**Query Parameters:**
- `path` (string): Directory path (default: "/")
- `page` (number): Page number for pagination
- `limit` (number): Items per page (max: 100)
- `sort` (string): Sort field (name, size, date, type)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "items": [
    {
      "id": "file123",
      "name": "document.pdf",
      "type": "file",
      "mimeType": "application/pdf",
      "size": 1048576,
      "path": "/documents",
      "createdAt": "2024-01-01T12:00:00Z",
      "modifiedAt": "2024-01-02T12:00:00Z",
      "thumbnail": "https://cdn.example.com/thumbs/file123.jpg"
    },
    {
      "id": "folder456",
      "name": "Photos",
      "type": "folder",
      "path": "/",
      "itemCount": 25,
      "size": 52428800,
      "createdAt": "2024-01-01T10:00:00Z",
      "modifiedAt": "2024-01-05T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Upload File

```http
POST /api/storage/upload
Content-Type: multipart/form-data

file: <binary>
path: /documents
parentId: folder123 (optional)
```

**Response:**
```json
{
  "id": "file789",
  "name": "uploaded-file.pdf",
  "type": "file",
  "mimeType": "application/pdf",
  "size": 2097152,
  "path": "/documents",
  "url": "https://storage.example.com/files/file789",
  "createdAt": "2024-01-10T12:00:00Z"
}
```

### Download File

```http
GET /api/storage/download/{fileId}
```

**Response:** Binary file data with appropriate Content-Type and Content-Disposition headers

### Download Multiple Files (ZIP)

```http
POST /api/storage/download-multiple
Content-Type: application/json

{
  "ids": ["file1", "file2", "file3"]
}
```

**Response:** ZIP archive containing all requested files

### Create Folder

```http
POST /api/storage/folders
Content-Type: application/json

{
  "name": "New Folder",
  "path": "/documents",
  "parentId": "folder123" (optional)
}
```

### Rename Item

```http
PUT /api/storage/items/{id}/rename
Content-Type: application/json

{
  "name": "new-name.pdf"
}
```

### Move Items

```http
POST /api/storage/move
Content-Type: application/json

{
  "ids": ["file1", "file2"],
  "targetPath": "/documents/archive",
  "targetId": "folder789" (optional)
}
```

### Copy Items

```http
POST /api/storage/copy
Content-Type: application/json

{
  "ids": ["file1", "file2"],
  "targetPath": "/backup",
  "targetId": "folder456" (optional)
}
```

### Delete Items

```http
DELETE /api/storage/items
Content-Type: application/json

{
  "ids": ["file1", "file2", "folder3"]
}
```

### Get Storage Quota

```http
GET /api/storage/quota
```

**Response:**
```json
{
  "used": 1073741824,
  "total": 10737418240,
  "percentage": 10,
  "fileCount": 150,
  "breakdown": {
    "images": 524288000,
    "documents": 209715200,
    "videos": 339738624,
    "other": 0
  }
}
```

## Sharing Endpoints

### Create Share Link

```http
POST /api/sharing/links
Content-Type: application/json

{
  "itemId": "file123",
  "expiresIn": "7d",
  "password": "optional_password",
  "maxDownloads": 10,
  "allowUpload": false
}
```

**Response:**
```json
{
  "shareId": "share789",
  "url": "https://sortedstorage.com/s/abc123def",
  "shortUrl": "https://srtd.st/abc123",
  "qrCode": "data:image/png;base64,...",
  "expiresAt": "2024-01-17T12:00:00Z",
  "password": true,
  "stats": {
    "views": 0,
    "downloads": 0
  }
}
```

### Share with Users

```http
POST /api/sharing/users
Content-Type: application/json

{
  "itemId": "file123",
  "users": ["user1@example.com", "user2@example.com"],
  "permissions": ["view", "download"],
  "message": "Check out this file",
  "sendEmail": true
}
```

### Get Share Info

```http
GET /api/sharing/links/{shareId}
```

### Update Share Settings

```http
PUT /api/sharing/links/{shareId}
Content-Type: application/json

{
  "expiresAt": "2024-02-01T00:00:00Z",
  "password": "new_password",
  "maxDownloads": 20,
  "enabled": true
}
```

### Revoke Share

```http
DELETE /api/sharing/links/{shareId}
```

### Get Share Statistics

```http
GET /api/sharing/links/{shareId}/stats
```

**Response:**
```json
{
  "views": 45,
  "uniqueViews": 23,
  "downloads": 12,
  "lastAccessed": "2024-01-15T14:30:00Z",
  "accessLog": [
    {
      "timestamp": "2024-01-15T14:30:00Z",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "action": "download"
    }
  ]
}
```

## Search Endpoints

### Search Files

```http
GET /api/search?q=document&type=file&dateFrom=2024-01-01&dateTo=2024-01-31
```

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Filter by type (file, folder, image, document, etc.)
- `dateFrom` (date): Filter by creation date from
- `dateTo` (date): Filter by creation date to
- `sizeMin` (number): Minimum file size in bytes
- `sizeMax` (number): Maximum file size in bytes
- `owner` (string): Filter by owner ID
- `shared` (boolean): Filter shared items only
- `starred` (boolean): Filter starred items only

## User Endpoints

### Get Profile

```http
GET /api/users/profile
```

### Update Profile

```http
PUT /api/users/profile
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Software Developer",
  "avatar": "data:image/jpeg;base64,..."
}
```

### Change Password

```http
POST /api/users/change-password
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password"
}
```

### Enable Two-Factor Authentication

```http
POST /api/users/2fa/enable
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": [
    "ABC123DEF",
    "GHI456JKL",
    "MNO789PQR"
  ]
}
```

### Verify 2FA Code

```http
POST /api/users/2fa/verify
Content-Type: application/json

{
  "code": "123456"
}
```

## WebSocket Events

Connect to WebSocket for real-time updates:

```javascript
const ws = new WebSocket('wss://api.sortedstorage.com/ws');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  // Handle event
});
```

### Event Types

**File Upload Progress:**
```json
{
  "type": "upload_progress",
  "fileId": "file123",
  "progress": 75,
  "bytesUploaded": 786432,
  "totalBytes": 1048576
}
```

**File Added:**
```json
{
  "type": "file_added",
  "file": {
    "id": "file456",
    "name": "new-file.pdf",
    "path": "/documents"
  }
}
```

**File Deleted:**
```json
{
  "type": "file_deleted",
  "fileId": "file789",
  "path": "/documents"
}
```

**Share Created:**
```json
{
  "type": "share_created",
  "share": {
    "id": "share123",
    "fileId": "file456",
    "url": "https://srtd.st/abc123"
  }
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "The requested file was not found",
    "details": {
      "fileId": "file123"
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing authentication token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request parameters
- `QUOTA_EXCEEDED` - Storage quota exceeded
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authenticated requests:** 1000 per hour
- **Upload endpoints:** 100 per hour
- **Download endpoints:** 500 per hour
- **Search endpoints:** 100 per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1704103200
```

## Pagination

All list endpoints support pagination:

```http
GET /api/storage/items?page=2&limit=50
```

Pagination info is included in responses:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 245,
    "pages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Webhooks

Configure webhooks to receive notifications about events:

```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["file.uploaded", "file.deleted", "share.created"],
  "secret": "webhook_secret_key"
}
```

Webhook payloads are signed with HMAC-SHA256:
```http
X-Signature: sha256=abc123def456...
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { SortedStorageClient } from '@sortedstorage/sdk';

const client = new SortedStorageClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.sortedstorage.com'
});

// Upload file
const file = await client.storage.upload({
  file: fileBlob,
  path: '/documents',
  onProgress: (progress) => console.log(`${progress}% uploaded`)
});

// Create share link
const share = await client.sharing.createLink({
  itemId: file.id,
  expiresIn: '7d'
});

console.log(`Share URL: ${share.url}`);
```

### Python

```python
from sortedstorage import Client

client = Client(api_key='your_api_key')

# Upload file
with open('document.pdf', 'rb') as f:
    file = client.storage.upload(
        file=f,
        path='/documents'
    )

# Create share link
share = client.sharing.create_link(
    item_id=file.id,
    expires_in='7d'
)

print(f"Share URL: {share.url}")
```

### cURL

```bash
# Upload file
curl -X POST https://api.sortedstorage.com/api/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "path=/documents"

# Create share link
curl -X POST https://api.sortedstorage.com/api/sharing/links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemId":"file123","expiresIn":"7d"}'
```

## Support

For API support, contact:
- Email: api-support@sortedstorage.com
- Documentation: https://docs.sortedstorage.com
- Status Page: https://status.sortedstorage.com