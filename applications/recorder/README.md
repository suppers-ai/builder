# Screen Recorder Application

A modern screen recording application built with Fresh 2 (canary), Suppers AI UI components, and
integrated cloud storage.

## 🎬 Features

- **High-Quality Recording**: Record your screen in up to 4K resolution
- **Cloud Storage**: Automatic saving to Supabase storage with the `userId/applicationSlug/filename`
  structure
- **Easy Sharing**: Share recordings with secure, customizable links
- **Modern UI**: Built with Suppers AI UI components and daisyUI theming
- **Authentication**: Secure login/logout using the shared auth system
- **Cross-Platform**: Works in modern browsers (Chrome, Firefox, Edge, Safari)

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

2. **Install Dependencies**
   ```bash
   deno task dev
   ```

3. **Open Browser**
   ```
   http://localhost:8002
   ```

## 📁 Project Structure

```
recorder/
├── components/          # Reusable UI components
├── islands/            # Fresh interactive components
├── routes/             # Application pages
├── lib/                # Utilities and helpers
├── types/              # TypeScript type definitions
├── static/             # Static assets
└── IMPLEMENTATION_CHECKLIST.md  # Comprehensive development guide
```

## 🔧 Technology Stack

- **Framework**: Fresh 2 (alpha.52) with Deno runtime
- **UI Components**: Suppers AI UI Library
- **Styling**: TailwindCSS + daisyUI (via Fresh plugin)
- **Authentication**: DirectAuthClient (shared)
- **Storage**: Supabase Storage with RLS
- **Recording**: MediaRecorder API + Screen Capture API

## 📋 Implementation Progress

### ✅ Completed Features

- [x] **Project Setup**: Fresh 2 alpha.52 application structure (no config file needed)
- [x] **Authentication**: Login/logout with SimpleAuthButton
- [x] **Core Recording**: Screen capture with MediaRecorder API
- [x] **Storage Integration**: Upload recordings to cloud storage
- [x] **Recordings Management**: List, download, and delete recordings
- [x] **UI Components**: Consistent theming with ui-lib components
- [x] **Basic Sharing**: Copy share links to clipboard

### 🚧 Next Steps (from Implementation Checklist)

- [ ] **Enhanced Sharing**: Public/private settings, expiration dates
- [ ] **Video Player**: Custom player with controls and fullscreen
- [ ] **Recording Metadata**: Duration, thumbnails, better file info
- [ ] **Advanced Features**: Trim videos, compression options
- [ ] **Collaboration**: Share with specific users, comments
- [ ] **Mobile Optimization**: Better responsive design
- [ ] **Testing**: Comprehensive unit and integration tests

## 🎯 Core Workflows

### Recording a Screen

1. Click "Start Recording" on the home page
2. Select screen/window to record
3. Choose audio settings (optional)
4. Click "Share" to begin recording
5. Click "Stop" when finished
6. Save to cloud or download locally

### Managing Recordings

1. Go to "My Recordings" page
2. View all your saved recordings
3. Download, share, or delete recordings
4. Copy share links to clipboard

### File Organization

Files are stored using the structure: `userId/recorder/filename.webm`

Example: `550e8400-e29b-41d4-a716-446655440000/recorder/recording_2024-01-15_14-30-25.webm`

## 🔐 Security Features

- **Authentication Required**: Must be logged in to record and save
- **User Isolation**: Each user's recordings are private by default
- **Access Control**: Row Level Security enforced at database level
- **Secure Upload**: Chunked upload with progress tracking
- **File Validation**: MIME type and size validation

## 🌐 Browser Compatibility

### Fully Supported

- Chrome 60+
- Firefox 55+
- Edge 79+

### Limited Support

- Safari 14+ (some features may not work)

### Requirements

- MediaRecorder API support
- Screen Capture API support
- Modern JavaScript (ES2020+)

## 📖 API Integration

The application integrates with the shared storage API:

- `POST /api/v1/storage/recorder/{filename}` - Upload recording
- `GET /api/v1/storage/recorder?list=true` - List recordings
- `GET /api/v1/storage/recorder/{filename}` - Get recording info
- `GET /api/v1/storage/recorder/{filename}?content=true` - Download recording
- `DELETE /api/v1/storage/recorder/{filename}` - Delete recording

## 🐛 Troubleshooting

### Recording Won't Start

- Check browser permissions for screen recording
- Ensure you're using HTTPS (required for MediaRecorder)
- Verify browser compatibility

### Upload Fails

- Check authentication status
- Verify Supabase connection and storage bucket setup
- Check network connectivity

### Poor Recording Quality

- Adjust quality settings in the recorder settings
- Check available system resources
- Consider reducing frame rate for better performance

## 📚 Documentation

- **Implementation Guide**: See `IMPLEMENTATION_CHECKLIST.md` for detailed development roadmap
- **UI Components**: Refer to `packages/ui-lib/` documentation
- **Storage System**: Check `packages/api/STORAGE_README.md`
- **Authentication**: See `packages/auth-client/` documentation

## 🤝 Contributing

1. Follow the implementation checklist for new features
2. Use existing UI components from the ui-lib package
3. Maintain TypeScript type safety
4. Test across supported browsers
5. Update documentation as needed

## 📄 License

Part of the Suppers AI Builder project.
