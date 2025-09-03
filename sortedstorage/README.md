# SortedStorage - Cloud Storage Solution

SortedStorage is a modern, feature-rich cloud storage application built with SvelteKit and powered by Solobase backend. It provides a seamless file management experience with advanced features like real-time collaboration, intelligent search, and comprehensive sharing capabilities.

## Features

### Core Functionality
- **File Management**: Upload, download, move, copy, and organize files and folders
- **Drag & Drop**: Intuitive drag-and-drop interface for file operations
- **Batch Operations**: Select and manage multiple files at once
- **Real-time Updates**: WebSocket-powered live updates across all connected clients

### Advanced Features
- **Smart Search**: Full-text search with filters for type, date, size, and more
- **Command Palette**: VS Code-style command palette (Ctrl+K) for quick actions
- **Recent Files**: Track and quickly access recently viewed or edited files
- **Favorites**: Star important files for quick access
- **File Preview**: In-browser preview for images, videos, documents, and more
- **Version History**: Track changes and restore previous versions

### Sharing & Collaboration
- **Public Links**: Generate shareable links with expiration and password protection
- **User Sharing**: Share files and folders with specific users
- **Permission Management**: Fine-grained access control (view, edit, admin)
- **QR Codes**: Generate QR codes for easy mobile sharing

### Security
- **End-to-end Encryption**: Optional client-side encryption for sensitive files
- **Two-Factor Authentication**: Enhanced account security with 2FA
- **Access Logs**: Track all file access and modifications
- **Password-Protected Shares**: Add passwords to shared links

## Tech Stack

- **Frontend**: SvelteKit, TypeScript, TailwindCSS
- **Backend**: Solobase (Go-based backend platform)
- **Database**: PostgreSQL / SQLite
- **Storage**: Local filesystem / S3-compatible object storage
- **Real-time**: WebSockets
- **Authentication**: JWT with refresh tokens

## Quick Start

### Prerequisites

- Node.js 20+ 
- Docker and Docker Compose (optional)
- Solobase backend (see setup instructions)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sortedstorage.git
cd sortedstorage
```

2. Run the setup script:
```bash
./scripts/setup.sh
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Start Solobase backend (in separate terminal):
```bash
cd ../go/solobase
./solobase
```

6. Open http://localhost:5173 in your browser

## Docker Deployment

### Local Development with Docker

```bash
docker-compose up -d
```

### Production Deployment

1. Configure production environment:
```bash
cp .env.example .env.production
# Edit .env.production with production values
```

2. Deploy to production:
```bash
./scripts/deploy.sh production deploy
```

### Using Pre-built Images

```bash
docker run -d \
  -p 3000:3000 \
  -e VITE_API_URL=http://your-backend:8090 \
  --name sortedstorage \
  sortedstorage:latest
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8080` |
| `VITE_APP_URL` | Frontend application URL | `http://localhost:5173` |
| `VITE_MAX_FILE_SIZE` | Maximum upload size (bytes) | `104857600` (100MB) |
| `VITE_ENABLE_OAUTH` | Enable OAuth providers | `false` |
| `VITE_ENABLE_PAYMENTS` | Enable payment features | `false` |

See `.env.example` for complete configuration options.

### Storage Providers

SortedStorage supports multiple storage backends:

- **Local Filesystem**: Default for development
- **Amazon S3**: Production-ready cloud storage
- **MinIO**: Self-hosted S3-compatible storage
- **Google Cloud Storage**: Via S3-compatible API
- **Backblaze B2**: Cost-effective cloud storage

Configure in Solobase backend settings.

## Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Deployment
```bash
./scripts/deploy.sh [environment] [action]
# Environments: local, staging, production
# Actions: deploy, build, push, rollback, cleanup
```

### Maintenance
```bash
./scripts/backup.sh backup    # Create backup
./scripts/backup.sh restore   # Restore from backup
./scripts/health-check.sh     # Check system health
```

## API Integration

SortedStorage uses a comprehensive API client for Solobase integration:

```typescript
import { storageAPI } from '$lib/api/storage';

// Upload file
const file = await storageAPI.uploadFile(fileObject, {
  path: '/documents',
  onProgress: (progress) => console.log(progress)
});

// Share file
const shareLink = await sharingAPI.createShareLink({
  itemId: file.id,
  expiresIn: '7d',
  password: 'optional'
});
```

## Testing

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

## Performance

- **Lazy Loading**: Components and routes are lazy-loaded
- **Virtual Scrolling**: Efficiently handle large file lists
- **Image Optimization**: Automatic image compression and responsive loading
- **CDN Support**: Static assets can be served from CDN
- **Caching**: Intelligent caching strategies for API responses

## Security Considerations

- All API requests use secure authentication tokens
- File uploads are scanned for malware (when configured)
- Rate limiting prevents abuse
- Content Security Policy (CSP) headers
- SQL injection protection
- XSS prevention
- CORS properly configured

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

SortedStorage is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Support

- **Documentation**: [https://docs.sortedstorage.com](https://docs.sortedstorage.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/sortedstorage/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sortedstorage/discussions)
- **Email**: support@sortedstorage.com

## Roadmap

- [ ] Mobile applications (iOS/Android)
- [ ] Desktop sync client
- [ ] Advanced collaboration features
- [ ] AI-powered file organization
- [ ] Blockchain-based file verification
- [ ] Plugin system for extensions

## Acknowledgments

- Built on [Solobase](https://github.com/yourusername/solobase) backend platform
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

Made with ❤️ by the SortedStorage team