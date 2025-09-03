# SortedStorage JavaScript SDK

Official JavaScript/TypeScript SDK for interacting with the SortedStorage API.

## Installation

```bash
npm install @sortedstorage/sdk
# or
yarn add @sortedstorage/sdk
# or
pnpm add @sortedstorage/sdk
```

## Quick Start

```javascript
import { SortedStorageClient } from '@sortedstorage/sdk';

// Initialize client
const client = new SortedStorageClient({
  apiKey: 'your-api-key', // or use accessToken
  baseUrl: 'https://api.sortedstorage.com' // optional
});

// Login (if not using API key)
const { user, token } = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Upload a file
const file = await client.storage.uploadFile(fileBlob, {
  path: '/documents',
  onProgress: (progress) => console.log(`${progress}% uploaded`)
});

// Create a share link
const share = await client.sharing.createShareLink(file.id, {
  expiresIn: '7d',
  password: 'optional-password'
});

console.log(`Share URL: ${share.url}`);
```

## Authentication

### API Key Authentication

```javascript
const client = new SortedStorageClient({
  apiKey: 'your-api-key'
});
```

### Username/Password Authentication

```javascript
const client = new SortedStorageClient();

const { user, token } = await client.auth.login({
  email: 'user@example.com',
  password: 'password',
  rememberMe: true
});
```

### OAuth Authentication

```javascript
// Redirect to OAuth provider
window.location.href = 'https://api.sortedstorage.com/auth/google';

// Handle callback
const client = new SortedStorageClient({
  accessToken: tokenFromCallback
});
```

## Storage Operations

### List Files

```javascript
const { items, pagination } = await client.storage.listFiles('/', {
  page: 1,
  limit: 50,
  sort: 'name',
  order: 'asc'
});
```

### Upload Files

```javascript
// Upload single file
const file = await client.storage.uploadFile(fileBlob, {
  path: '/documents',
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
});

// Upload with metadata
const fileWithMeta = await client.storage.uploadFile(fileBlob, {
  path: '/images',
  metadata: {
    description: 'Product photo',
    tags: ['product', 'hero-image']
  }
});
```

### Download Files

```javascript
// Download as Blob
const blob = await client.storage.downloadFile(fileId);

// Create download link
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'filename.pdf';
a.click();
```

### Manage Files

```javascript
// Create folder
const folder = await client.storage.createFolder('New Folder', '/documents');

// Rename file
await client.storage.rename(fileId, 'new-name.pdf');

// Move files
await client.storage.move([fileId1, fileId2], '/archive');

// Copy files
const copies = await client.storage.copy([fileId], '/backup');

// Delete files
await client.storage.deleteFile(fileId);
await client.storage.deleteMultiple([fileId1, fileId2, fileId3]);
```

### Search Files

```javascript
const results = await client.storage.search('invoice', {
  type: 'document',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  sizeMin: 1024,
  sizeMax: 10485760
});
```

## Sharing

### Create Share Links

```javascript
const share = await client.sharing.createShareLink(fileId, {
  expiresIn: '7d', // or specific date
  password: 'secret123',
  maxDownloads: 10,
  allowUpload: false
});

console.log(`Share URL: ${share.url}`);
console.log(`QR Code: ${share.qrCode}`);
```

### Manage Shares

```javascript
// Get share info
const shareInfo = await client.sharing.getShareLink(shareId);

// Update share settings
await client.sharing.updateShareLink(shareId, {
  expiresIn: '30d',
  password: 'new-password'
});

// Revoke share
await client.sharing.revokeShareLink(shareId);

// Get share statistics
const stats = await client.sharing.getShareStats(shareId);
```

### Share with Users

```javascript
await client.sharing.shareWithUsers(
  fileId,
  ['user1@example.com', 'user2@example.com'],
  ['view', 'download']
);
```

## User Management

### Profile Management

```javascript
// Get profile
const user = await client.users.getProfile();

// Update profile
await client.users.updateProfile({
  name: 'John Doe',
  bio: 'Software Developer'
});

// Change password
await client.users.changePassword('current-password', 'new-password');
```

### Two-Factor Authentication

```javascript
// Enable 2FA
const { secret, qrCode, backupCodes } = await client.users.enable2FA();

// Verify 2FA code
await client.users.verify2FA('123456');

// Disable 2FA
await client.users.disable2FA('123456');
```

## Error Handling

```javascript
import { SortedStorageClient } from '@sortedstorage/sdk';

const client = new SortedStorageClient({ apiKey: 'your-api-key' });

try {
  const file = await client.storage.uploadFile(blob);
} catch (error) {
  if (error.response) {
    // API error response
    console.error('Error:', error.response.data.error.message);
    console.error('Code:', error.response.data.error.code);
  } else if (error.request) {
    // Network error
    console.error('Network error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { 
  SortedStorageClient, 
  FileItem, 
  FolderItem,
  ShareLink,
  User 
} from '@sortedstorage/sdk';

const client = new SortedStorageClient({
  apiKey: process.env.SORTEDSTORAGE_API_KEY
});

// All methods are fully typed
const file: FileItem = await client.storage.uploadFile(blob, {
  path: '/documents',
  onProgress: (progress: number) => {
    console.log(`Progress: ${progress}%`);
  }
});
```

## Configuration

```javascript
const client = new SortedStorageClient({
  // API key or access token
  apiKey: 'your-api-key',
  accessToken: 'jwt-token',
  
  // API endpoint
  baseUrl: 'https://api.sortedstorage.com',
  
  // Request timeout (ms)
  timeout: 30000,
  
  // Max retry attempts
  maxRetries: 3,
  
  // Token refresh callback
  onTokenRefresh: (token) => {
    // Save new token
    localStorage.setItem('token', token);
  }
});
```

## Browser Support

The SDK supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For older browsers, use a transpiler like Babel.

## Node.js Support

The SDK works in Node.js 14+ environments:

```javascript
const { SortedStorageClient } = require('@sortedstorage/sdk');
const fs = require('fs');

const client = new SortedStorageClient({
  apiKey: process.env.SORTEDSTORAGE_API_KEY
});

// Upload file from filesystem
const buffer = fs.readFileSync('./document.pdf');
const file = await client.storage.uploadFile(buffer, {
  path: '/documents'
});
```

## Examples

### React Component

```jsx
import React, { useState } from 'react';
import { SortedStorageClient } from '@sortedstorage/sdk';

const FileUploader = () => {
  const [progress, setProgress] = useState(0);
  const client = new SortedStorageClient({ apiKey: 'your-api-key' });

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    
    const uploaded = await client.storage.uploadFile(file, {
      onProgress: setProgress
    });
    
    console.log('Uploaded:', uploaded);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {progress > 0 && <progress value={progress} max="100" />}
    </div>
  );
};
```

### Vue Component

```vue
<template>
  <div>
    <input type="file" @change="handleUpload" />
    <progress v-if="progress > 0" :value="progress" max="100"></progress>
  </div>
</template>

<script>
import { SortedStorageClient } from '@sortedstorage/sdk';

export default {
  data() {
    return {
      progress: 0,
      client: new SortedStorageClient({ apiKey: 'your-api-key' })
    };
  },
  methods: {
    async handleUpload(event) {
      const file = event.target.files[0];
      
      const uploaded = await this.client.storage.uploadFile(file, {
        onProgress: (p) => this.progress = p
      });
      
      console.log('Uploaded:', uploaded);
    }
  }
};
</script>
```

## Contributing

See [CONTRIBUTING.md](https://github.com/sortedstorage/sdk-javascript/blob/main/CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](https://github.com/sortedstorage/sdk-javascript/blob/main/LICENSE) for details.

## Support

- [Documentation](https://docs.sortedstorage.com/sdk/javascript)
- [API Reference](https://api.sortedstorage.com/docs)
- [GitHub Issues](https://github.com/sortedstorage/sdk-javascript/issues)
- [Discord Community](https://discord.gg/sortedstorage)