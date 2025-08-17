# Image Tools API

This module provides image processing capabilities using FFmpeg for high-quality, efficient image manipulation.

## Features

- **Thumbnail Generation**: Create thumbnails with custom dimensions
- **Image Resizing**: Resize images while maintaining aspect ratio
- **Format Conversion**: Convert between image formats (JPEG, PNG, WebP)
- **Quality Control**: Adjustable compression quality
- **Batch Processing Ready**: Designed for easy extension with additional tools

## API Endpoints

### Get Available Tools
```bash
GET /api/v1/tools/image/tools
```

Response:
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "thumbnail",
        "description": "Creates a thumbnail image with specified dimensions",
        "supportedFormats": ["jpeg", "png", "webp", "gif", "bmp", "tiff"],
        "defaultOptions": {
          "width": 150,
          "height": 150,
          "format": "jpeg",
          "quality": 80,
          "maintainAspectRatio": true
        }
      }
    ]
  }
}
```

### Check System Status
```bash
GET /api/v1/tools/image/status
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "dependencies": {
      "ffmpeg": true,
      "allReady": true,
      "missing": []
    },
    "availableTools": 3
  }
}
```

### Process Image
```bash
POST /api/v1/tools/image/process
Content-Type: multipart/form-data
```

Form fields:
- `tool`: Tool name ("thumbnail", "resize", "convert")
- `image`: Image file
- `options`: JSON string with tool options

Example with curl:
```bash
curl -X POST \
  -F "tool=thumbnail" \
  -F "image=@input.jpg" \
  -F "options={\"width\":200,\"height\":200,\"format\":\"webp\",\"quality\":85}" \
  "http://localhost:54321/functions/v1/api/v1/tools/image/process"
```

Alternative JSON API:
```bash
POST /api/v1/tools/image/process
Content-Type: application/json

{
  "tool": "thumbnail",
  "image": "base64_encoded_image_data",
  "options": {
    "width": 200,
    "height": 200,
    "format": "jpeg",
    "quality": 85
  },
  "outputFormat": "base64"
}
```

## Tool Options

### Thumbnail Tool
```json
{
  "width": 150,              // Required: thumbnail width in pixels
  "height": 150,             // Required: thumbnail height in pixels
  "format": "jpeg",          // Output format: "jpeg", "png", "webp"
  "quality": 80,             // Quality 1-100 (JPEG/WebP only)
  "maintainAspectRatio": true // Maintain original aspect ratio
}
```

### Resize Tool
```json
{
  "width": 800,              // Target width (optional if height provided)
  "height": 600,             // Target height (optional if width provided)
  "format": "jpeg",          // Output format
  "quality": 80,             // Quality 1-100
  "maintainAspectRatio": true // Maintain aspect ratio
}
```

### Convert Tool
```json
{
  "format": "webp",          // Required: target format
  "quality": 80              // Quality 1-100 (format dependent)
}
```

## Response Format

Success response:
```json
{
  "success": true,
  "tool": "thumbnail",
  "data": "base64_encoded_result", // or binary data if outputFormat=buffer
  "metadata": {
    "originalSize": 1024000,
    "processedSize": 25600,
    "originalDimensions": {"width": 1920, "height": 1080},
    "processedDimensions": {"width": 200, "height": 200},
    "processingTime": 150
  }
}
```

Error response:
```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

## Adding New Tools

To add a new image processing tool:

1. Create the tool implementation in `ffmpeg-processor.ts`
2. Define the tool in `tools-registry.ts`:

```typescript
export const newTool: ImageTool = {
  name: "new-tool",
  description: "Description of what the tool does",
  supportedFormats: ["jpeg", "png", "webp"],
  defaultOptions: {
    // Default options
  },
  process: async (input, options) => {
    // Implementation
    return await newToolFunction(input, options);
  }
};

// Register the tool
imageToolsRegistry.set(newTool.name, newTool);
```

3. Export the new function from `index.ts`

## Dependencies

- **FFmpeg**: Required for all image processing operations
- **Deno**: Runtime environment
- **Standard Library**: File system operations

## Installation

FFmpeg must be available in the system PATH:

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## Error Handling

The API handles various error conditions:
- Missing FFmpeg installation
- Invalid image formats
- Processing failures
- Invalid options
- File system errors

All errors are returned with appropriate HTTP status codes and descriptive messages.