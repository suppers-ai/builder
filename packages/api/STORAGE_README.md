# Application Storage System

This directory contains a complete file storage solution for applications using the `userId/applicationSlug/filename` structure.

## ✅ Everything is in `database-schema.sql`

The **complete storage system** is now consolidated in the main `database-schema.sql` file, including:

- ✅ Storage bucket creation (`application-files`)
- ✅ All 9 storage policies with proper access control
- ✅ Error handling for permission issues
- ✅ userId/applicationSlug/filename file organization
- ✅ Comprehensive documentation

## 🚀 Quick Setup

### Option 1: Run the Complete Schema (Recommended)

```bash
# With service_role connection (has all permissions)
psql "postgresql://postgres:[password]@[host]:5432/postgres" -f database-schema.sql
```

### Option 2: Supabase Dashboard

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the entire `database-schema.sql` file
3. Click **Run**

The script includes automatic error handling - if it can't create storage policies due to permissions, it will:
- ✅ Still create the storage bucket successfully
- ⚠️  Show helpful warnings about policies
- 💡 Guide you to create policies manually if needed

## 📁 File Organization

Files are organized as: `userId/applicationSlug/filename`

**Examples:**
```
550e8400-e29b-41d4-a716-446655440000/my-blog/config/settings.json
550e8400-e29b-41d4-a716-446655440000/ecommerce-site/images/logo.png
550e8400-e29b-41d4-a716-446655440000/portfolio/documents/resume.pdf
```

## 🔐 Security Features

- **User Isolation**: Each user's files are in their own folder
- **Application-based Access**: Files organized by application slug
- **Granular Permissions**: Read/write/admin access levels
- **Row Level Security**: Database-enforced access control
- **Admin Override**: Administrators can access all files

## 💻 Usage

```typescript
import { DirectAuthClient } from "../auth-client/src/direct-auth-client.ts";

const authClient = new DirectAuthClient(supabaseUrl, supabaseAnonKey);

// Upload a file
const result = await authClient.uploadFile('my-app', file, 'documents/report.pdf');

// List all files in an application
const files = await authClient.listFiles('my-app');

// Download a file
const blob = await authClient.downloadFile('my-app', 'documents/report.pdf');

// Delete a file
await authClient.deleteFile('my-app', 'documents/report.pdf');
```

## 📋 API Endpoints

All storage operations use these endpoints:

- `POST /api/v1/storage/{applicationSlug}/{filePath}` - Upload file
- `GET /api/v1/storage/{applicationSlug}?list=true` - List files
- `GET /api/v1/storage/{applicationSlug}/{filePath}` - Get file info
- `GET /api/v1/storage/{applicationSlug}/{filePath}?content=true` - Download file
- `DELETE /api/v1/storage/{applicationSlug}/{filePath}` - Delete file

## 🏗️ Architecture Benefits

The `userId/applicationSlug/filename` structure provides:

1. **Easy Ownership**: First path segment shows the file owner
2. **Simple Permissions**: Database policies can easily parse the path
3. **Natural Organization**: User files are grouped together
4. **Scalability**: Enables user-based sharding
5. **Conflict Prevention**: Multiple users can have same application slug

## 📚 Additional Files

- `storage-usage-example.ts` - Comprehensive usage examples
- `test-storage-setup.ts` - Verification script for setup
- Legacy files (no longer needed but kept for reference):
  - `storage-policies.sql` 
  - `storage-setup.md`

**Everything you need is in `database-schema.sql`** - just run it and you're ready to go! 🎉