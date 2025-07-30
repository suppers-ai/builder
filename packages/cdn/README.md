# CDN Package

A simple static asset server for serving shared assets across the monorepo.

## Features

- 🚀 **Simple & Fast**: Lightweight Deno server
- 📁 **Static Assets**: Serves files from `./static/` directory
- 🌐 **CORS Enabled**: Cross-origin requests supported
- 🏷️ **ETag Support**: Conditional requests with caching
- 📋 **Asset Listing**: Home page shows all available assets

## Quick Start

```bash
# Development (with hot reload)
deno task dev:cdn

# Production
deno task start:cdn

# From CDN directory
cd packages/cdn
deno task dev    # Development
deno task start  # Production
```

## Directory Structure

```
packages/cdn/
├── lib/
│   ├── asset-handler.ts           # Core asset serving logic
│   ├── asset-handler.test.ts      # Unit tests
│   ├── asset-handler.integration.test.ts  # Integration tests
│   └── route-handler.test.ts      # Route handler tests
├── static/
│   ├── logos/                     # Logo assets
│   ├── backgrounds/               # Background images
│   └── favicons/                  # Favicon assets
├── main.ts                        # Server entry point
├── dev.ts                         # Development server
└── mod.ts                         # Package exports
```

## API

### GET /
Returns an HTML page listing all available assets.

### GET /{asset-path}
Serves the requested asset with proper headers:
- `Content-Type`: Appropriate MIME type
- `Cache-Control`: Long-term caching (1 year)
- `ETag`: File-based ETag for conditional requests
- `Access-Control-Allow-Origin`: `*`

### HEAD /{asset-path}
Returns asset metadata without the body.

### OPTIONS /{asset-path}
CORS preflight request handler.

## Examples

```bash
# Get asset listing
curl http://localhost:8080/

# Get a logo
curl http://localhost:8080/logos/deno.svg

# Get asset metadata
curl -I http://localhost:8080/logos/deno.svg

# Conditional request
curl -H "If-None-Match: \"1234-567890\"" http://localhost:8080/logos/deno.svg
```

## Supported File Types

- PNG, JPG, JPEG (images)
- WebP (modern images)
- SVG (vector graphics)
- ICO (icons)

## Security

- Path validation prevents directory traversal
- Only whitelisted file extensions are served
- Files must be in organized folders (no root-level files)

## Development

```bash
# Run tests
deno task test:cdn

# Type checking
deno task check:cdn

# Linting
cd packages/cdn && deno task lint

# Formatting
cd packages/cdn && deno task fmt
```

## Deployment

The CDN can be deployed to any platform that supports Deno:

- **Deno Deploy**: `deno deploy --app=your-cdn main.ts`
- **Docker**: Use official Deno Docker image
- **VPS**: Run with PM2 or systemd

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `CDN_PORT` | `8080` | Alternative port variable |