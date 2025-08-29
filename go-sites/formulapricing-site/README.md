# Formula Pricing Site - Go Implementation

A Go-based rewrite of the Formula Pricing documentation site, featuring pixel-perfect replication of the original Deno/Fresh application.

## Features

- **Interactive Professor Gopher**: Eye-tracking functionality that follows mouse cursor
- **Responsive Design**: Pixel-perfect responsive layout matching the original
- **Static Asset Serving**: Efficient serving of CSS, JavaScript, and images
- **Templ Templates**: Type-safe HTML generation using the templ library
- **Graceful Shutdown**: Proper server lifecycle management
- **Structured Logging**: Configurable logging with different levels

## Architecture

This application follows the dufflebagbase project patterns:

- **Configuration**: Environment-based configuration management
- **Routing**: Gorilla Mux for HTTP routing
- **Templates**: Templ for type-safe HTML generation
- **Static Assets**: Standard Go http.FileServer
- **Logging**: Custom logger with configurable levels

## Directory Structure

```
├── config/          # Configuration management
├── handlers/        # HTTP request handlers
├── logger/          # Logging infrastructure
├── static/          # Static assets (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── images/
├── templates/       # Templ HTML templates
├── main.go          # Application entry point
├── go.mod           # Go module definition
└── README.md        # This file
```

## Getting Started

### Prerequisites

- Go 1.23.0 or later
- Templ CLI tool for template generation

### Installation

1. Install templ CLI:
```bash
go install github.com/a-h/templ/cmd/templ@latest
```

2. Generate templates:
```bash
templ generate
```

3. Install dependencies:
```bash
go mod tidy
```

4. Run the application:
```bash
go run main.go
```

The application will start on http://localhost:8080

### Development

For development with auto-reload:

```bash
# Generate templates and run
templ generate && go run main.go
```

### Environment Variables

Copy `.env.example` to `.env` and configure as needed:

- `PORT`: Server port (default: 8080)
- `ENVIRONMENT`: Environment mode (development/production)
- `LOG_LEVEL`: Logging level (DEBUG/INFO/WARN/ERROR/FATAL)
- `STATIC_PATH`: Path to static assets directory

## Building

To build a production binary:

```bash
templ generate
go build -o formulapricing-site main.go
```

## Deployment

The application compiles to a single binary with no external dependencies except for the static assets directory.

### Quick Deployment Options

#### Using Docker Compose (Recommended)
```bash
# Build and deploy
./deploy.sh deploy

# View logs
./deploy.sh logs

# Check health
./deploy.sh health
```

#### Using Docker
```bash
# Build Docker image
./deploy.sh docker

# Deploy standalone container
./deploy.sh deploy-docker
```

#### Production Binary
```bash
# Build optimized binary
./deploy.sh production

# Run directly
./formulapricing-site
```

For comprehensive deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Comprehensive deployment guide for all environments
- **[ENVIRONMENT.md](ENVIRONMENT.md)**: Complete environment variables documentation
- **[ERROR_HANDLING.md](ERROR_HANDLING.md)**: Error handling and troubleshooting guide
- **[PERFORMANCE_OPTIMIZATIONS.md](PERFORMANCE_OPTIMIZATIONS.md)**: Performance optimization guide
- **[TEST_SUMMARY.md](TEST_SUMMARY.md)**: Testing strategy and results

## Testing

Run tests with:

```bash
go test ./...
```

## License

This project follows the same license as the parent dufflebagbase project.