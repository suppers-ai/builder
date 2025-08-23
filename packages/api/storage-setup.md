# Storage Setup Guide

This guide explains how to set up the application file storage system with proper permissions.

## 1. Create Storage Bucket

Go to your Supabase Dashboard → Storage, and create a new bucket with these settings:

- **Bucket Name**: `application-files`
- **Public**: `false` (private bucket)
- **File Size Limit**: `50MB` (52428800 bytes)
- **Allowed MIME Types**:
  - `image/*`
  - `text/*`
  - `application/json`
  - `application/pdf`
  - `video/*`
  - `audio/*`

Or use the SQL command:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-files', 
  'application-files', 
  false, 
  52428800, 
  ARRAY['image/*', 'text/*', 'application/json', 'application/pdf', 'video/*', 'audio/*']
) ON CONFLICT (id) DO NOTHING;
```

## 2. Apply Storage Policies

### Option A: Using Supabase Dashboard

1. Go to **Authentication** → **Policies**
2. Find the `storage.objects` table
3. Add the following policies:

#### Policy 1: "Users can manage files in their own applications"

- **Action**: `ALL`
- **Target roles**: `authenticated`
- **Using expression**:

```sql
bucket_id = 'application-files' 
AND (storage.foldername(name))[1] = auth.uid()::text 
AND EXISTS (
  SELECT 1 FROM public.applications
  WHERE slug = (storage.foldername(name))[2]
)
```

#### Policy 2: "Application collaborators can access files"

- **Action**: `ALL`
- **Target roles**: `authenticated`
- **Using expression**:

```sql
bucket_id = 'application-files' 
AND EXISTS (
  SELECT 1 FROM public.applications a
  JOIN public.user_access ua ON a.id = ua.application_id
  WHERE a.slug = (storage.foldername(name))[2]
    AND ua.user_id = auth.uid()
    AND (
      ua.access_level IN ('write', 'admin') 
      OR (ua.access_level = 'read' AND current_setting('request.method') = 'GET')
    )
)
```

#### Policy 3: "Admins can manage all application files"

- **Action**: `ALL`
- **Target roles**: `authenticated`
- **Using expression**:

```sql
bucket_id = 'application-files' 
AND EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
)
```

### Option B: Using SQL (Service Role Required)

Run the `storage-policies.sql` file with service role permissions:

```bash
# Using Supabase CLI
supabase db reset --linked
psql "your-database-url" -f packages/api/storage-policies.sql

# Or through the SQL Editor in Supabase Dashboard with service role
```

## 3. File Organization Structure

Files are organized as: `userId/applicationSlug/filename`

Examples:

- `550e8400-e29b-41d4-a716-446655440000/my-blog/config/settings.json`
- `550e8400-e29b-41d4-a716-446655440000/ecommerce-site/images/logo.png`
- `550e8400-e29b-41d4-a716-446655440000/portfolio/documents/resume.pdf`

## 4. Benefits of This Structure

1. **Easy ownership identification**: First path segment shows the owner
2. **Simple permission checking**: Policies can easily extract userId and applicationSlug
3. **Natural organization**: Each user's files are grouped together
4. **Scalability**: Enables user-based sharding
5. **Conflict prevention**: Multiple users can have apps with the same slug

## 5. Testing

After setup, you can test the storage functionality:

```typescript
// Test file upload
const result = await authClient.uploadFile("my-app", file, "documents/test.pdf");
console.log(result.success ? "Upload successful" : "Upload failed:", result.error);

// Test file listing
const files = await authClient.listFiles("my-app");
console.log("Files:", files.data?.files);
```

## 6. Troubleshooting

### Error: "42501: must be owner of table objects"

This means you're trying to create policies without sufficient permissions. Use one of these
solutions:

1. **Use Supabase Dashboard**: Create policies through the web interface
2. **Use Service Role**: Run SQL with service role connection string
3. **Use Supabase CLI**: Apply policies through the CLI with proper authentication

### Error: "new row violates row-level security policy"

This indicates the storage policies are not correctly configured. Verify:

1. Policies are applied to the correct table (`storage.objects`)
2. The `application-files` bucket exists
3. User has valid application ownership or access permissions

### Files not accessible

Check that:

1. The file path follows the `userId/applicationSlug/filename` structure
2. User has appropriate permissions for the application
3. The application slug matches exactly (case-sensitive)
