/**
 * Storage API Usage Example
 * 
 * This file demonstrates how to use the application storage functionality
 * with the DirectAuthClient.
 */

import { DirectAuthClient } from "../auth-client/src/direct-auth-client.ts";

// Example usage of the storage API
export async function storageUsageExample() {
  // Initialize the auth client (would normally be done in your app)
  const authClient = new DirectAuthClient(
    "your-supabase-url",
    "your-supabase-anon-key"
  );

  // Assume user is authenticated
  const applicationSlug = "my-awesome-app";

  console.log("📁 Storage API Usage Examples");
  console.log("=============================\n");

  // 1. Upload a file from a form input
  console.log("1. Upload File Example:");
  console.log(`
// From a file input in your application:
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  const result = await authClient.uploadFile('${applicationSlug}', file, 'uploads/document.pdf');
  
  if (result.success) {
    console.log('File uploaded successfully:', result.data.publicUrl);
  } else {
    console.error('Upload failed:', result.error);
  }
}
`);

  // 2. Upload text content
  console.log("2. Upload Text Content Example:");
  console.log(`
// Save a JSON configuration file:
const config = { theme: 'dark', language: 'en' };
const result = await authClient.uploadContent(
  '${applicationSlug}',
  'config/settings.json',
  JSON.stringify(config, null, 2),
  'application/json'
);

if (result.success) {
  console.log('Config saved:', result.data.publicUrl);
}
`);

  // 3. List files
  console.log("3. List Files Example:");
  console.log(`
// Get all files for the application:
const result = await authClient.listFiles('${applicationSlug}');

if (result.success) {
  console.log('Found files:', result.data.files);
  result.data.files.forEach(file => {
    console.log(\`- \${file.name} (\${file.size} bytes)\`);
  });
}
`);

  // 4. Get file info
  console.log("4. Get File Info Example:");
  console.log(`
// Get metadata for a specific file:
const result = await authClient.getFileInfo('${applicationSlug}', 'config/settings.json');

if (result.success) {
  const file = result.data;
  console.log('File info:', {
    name: file.name,
    size: file.size,
    contentType: file.contentType,
    publicUrl: file.publicUrl
  });
}
`);

  // 5. Download file
  console.log("5. Download File Example:");
  console.log(`
// Download file content:
const result = await authClient.downloadFile('${applicationSlug}', 'config/settings.json');

if (result.success) {
  const text = await result.data.text(); // or .arrayBuffer() for binary files
  const config = JSON.parse(text);
  console.log('Downloaded config:', config);
}
`);

  // 6. Delete file
  console.log("6. Delete File Example:");
  console.log(`
// Delete a file:
const result = await authClient.deleteFile('${applicationSlug}', 'old-file.txt');

if (result.success) {
  console.log('File deleted successfully');
} else {
  console.error('Delete failed:', result.error);
}
`);

  // 7. Error handling
  console.log("7. Error Handling:");
  console.log(`
// All storage methods return a consistent response format:
interface StorageResponse {
  success: boolean;
  data?: any;        // Contains result data on success
  error?: string;    // Contains error message on failure
}

// Always check the success flag:
const result = await authClient.uploadFile(applicationSlug, file);

if (result.success) {
  // Handle success
  console.log('Operation successful:', result.data);
} else {
  // Handle error
  console.error('Operation failed:', result.error);
  
  // Common errors:
  // - "Authentication required" - User not logged in
  // - "Application not found or access denied" - Invalid app slug or no access
  // - "Write access required" - User doesn't have write permissions
  // - "File not found" - File doesn't exist (for get/delete operations)
}
`);

  console.log("\n🔐 Security & Access Control");
  console.log("==============================");
  console.log(`
File access is controlled by:

1. Application Ownership:
   - Application owners can read/write/delete all files in their app folder
   
2. User Access Permissions:
   - Users with "read" access can list and download files
   - Users with "write" or "admin" access can upload and delete files
   - Access is managed through the user_access table

3. File Organization (userId/applicationSlug/filename):
   - All files are stored under /{userId}/{applicationSlug}/ folders
   - Each user's application files are isolated from others
   - File paths support nested folders: "images/photos/vacation.jpg"
   - Benefits of this structure:
     * Easy identification of file ownership
     * Simpler permission checking at database level
     * Natural user-based file organization
     * Better scalability with user-based sharding
     * Prevents conflicts between applications with same slug

4. Storage Policies:
   - Row Level Security (RLS) enforces access control at the database level
   - Policies use split_part(name, '/', 1) to get userId from path
   - Policies use split_part(name, '/', 2) to get applicationSlug from path
   - Administrators can access all files
   - File operations are logged and auditable
`);

  console.log("\n📋 API Endpoints");
  console.log("==================");
  console.log(`
Direct API usage (if not using auth client methods):

POST   /api/v1/storage/{applicationSlug}/{filePath}  - Upload file
GET    /api/v1/storage/{applicationSlug}?list=true   - List files  
GET    /api/v1/storage/{applicationSlug}/{filePath}  - Get file info
GET    /api/v1/storage/{applicationSlug}/{filePath}?content=true - Download file
DELETE /api/v1/storage/{applicationSlug}/{filePath}  - Delete file

All endpoints require:
- Authorization: Bearer {jwt-token} header
- Valid application access permissions
`);
}

// Run the example if this file is executed directly
if (import.meta.main) {
  storageUsageExample();
}