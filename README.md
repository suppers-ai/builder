# JSON App Compiler

A powerful Deno Fresh monorepo system that transforms JSON configuration files into fully functional web applications. Build complete applications with components, routing, API integration, and modern development practices using simple JSON specifications.

## Features

### Core Capabilities
- **JSON-to-App Generation** - Transform JSON configurations into complete Fresh 2.0 applications
- **Component-Based Architecture** - Reusable UI components with prop validation and theming
- **API Integration** - Automatic API route generation with CRUD operations and validation
- **Multiple Layouts** - Support for different layout structures across pages
- **Fresh 2.0 Alpha** - Built on the latest Fresh framework with enhanced island architecture
- **Deno Native** - Leverages Deno's native package management and performance optimizations

### Development Experience
- **Type Safety** - Full TypeScript support throughout the compilation pipeline
- **Hot Reloading** - Fast development with Fresh 2.0's enhanced development server
- **Error Handling** - Comprehensive error reporting with recovery mechanisms
- **Validation** - JSON schema validation with detailed error messages
- **Testing** - Built-in testing utilities and example configurations

## 📦 Architecture

The JSON App Compiler is organized as a monorepo with five core packages:

```
packages/
├── compiler/           # Core compilation engine
├── api/               # Backend API functionality  
├── ui-library/        # Reusable UI components
├── shared/            # Common types and utilities
└── templates/         # Application templates
```

### Package Overview

- **Compiler** - Orchestrates the compilation process, parsing JSON configs and generating applications
- **API** - Provides Fresh 2.0 compatible API handlers with CRUD operations and validation
- **UI Library** - Component catalog with Fresh islands, theming, and prop validation
- **Shared** - Common types, utilities, and JSON schemas used across packages
- **Templates** - Base application templates with placeholder replacement

## Quick Start

### Prerequisites
- [Deno](https://deno.land/) 1.40.0 or later

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd json-app-compiler
deno task build
```

### Basic Usage

1. **Create a JSON configuration** (see `examples/simple/app-config.json`):

```json
{
  "metadata": {
    "name": "my-app",
    "version": "1.0.0",
    "description": "My generated application"
  },
  "components": [
    {
      "id": "header",
      "type": "Layout",
      "props": { "padding": "md" },
      "children": [
        {
          "id": "title",
          "type": "Card",
          "props": { "title": "Welcome to My App" }
        }
      ]
    }
  ],
  "routes": [
    {
      "path": "/",
      "component": "header",
      "meta": {
        "title": "Home | My App"
      }
    }
  ],
  "api": {
    "endpoints": [
      {
        "path": "/api/hello",
        "methods": ["GET"],
        "handler": "HelloHandler"
      }
    ]
  }
}
```

2. **Compile your application**:

```bash
deno run -A packages/compiler/src/cli.ts --config examples/simple/app-config.json --output ./my-app
```

3. **Run your generated application**:

```bash
cd my-app
deno task dev
```

Your application will be available at `http://localhost:8000`.

## Documentation

### Configuration Guide

The JSON configuration supports the following main sections:

#### Metadata
```json
{
  "metadata": {
    "name": "app-name",
    "version": "1.0.0", 
    "description": "App description",
    "author": "Your Name",
    "license": "MIT"
  }
}
```

#### Components
Define UI components with hierarchical structure:

```json
{
  "components": [
    {
      "id": "unique-id",
      "type": "Button|Input|Card|Layout",
      "props": {
        "variant": "primary|secondary|outline",
        "size": "sm|md|lg",
        "fullWidth": true
      },
      "children": [/* nested components */]
    }
  ]
}
```

#### Routes
Configure application routing:

```json
{
  "routes": [
    {
      "path": "/path",
      "component": "component-id",
      "layout": "layout-component-id",
      "middleware": ["auth", "logging"],
      "meta": {
        "title": "Page Title",
        "description": "Page description"
      }
    }
  ]
}
```

#### API Endpoints
Define backend API routes:

```json
{
  "api": {
    "endpoints": [
      {
        "path": "/api/users",
        "methods": ["GET", "POST"],
        "handler": "UserHandler",
        "validation": {
          "body": {
            "name": { "type": "string", "required": true },
            "email": { "type": "string", "required": true }
          }
        }
      }
    ]
  }
}
```

### Available Components

The UI library provides these components:

- **Button** - Interactive buttons with variants and sizes
- **Input** - Form inputs with validation and labels  
- **Card** - Content containers with titles and styling
- **Layout** - Flexible layout containers with responsive design

Each component supports:
- **Props validation** - Type-safe property configuration
- **Theming** - Consistent styling with CSS custom properties
- **Accessibility** - WCAG compliant with proper ARIA attributes
- **Responsive design** - Mobile-first responsive behavior

### API Handlers

The API package provides:

- **CRUD Operations** - Create, Read, Update, Delete, List handlers
- **Request Validation** - JSON schema validation for requests
- **Error Handling** - Consistent error responses with proper HTTP status codes
- **Middleware Support** - Authentication, logging, CORS, rate limiting

## 📖 Examples

The `examples/` directory contains complete example configurations:

- **Simple App** (`examples/simple/`) - Basic components and routing
- **Complex App** (`examples/complex/`) - Multiple layouts, API integration, authentication
- **Blog** (`examples/blog/`) - Content-focused application with posts and pages
- **E-commerce** (`examples/ecommerce/`) - Product catalog with shopping cart functionality

Each example includes:
- Complete JSON configuration
- Generated application output
- Documentation explaining the features demonstrated

## 🧪 Development

### Running Tests

```bash
# Run all tests
deno task test

# Run tests for specific package
deno test packages/compiler/ --allow-all

# Run with watch mode
deno task test:watch
```

### Building

```bash
# Build all packages
deno task build

# Check types
deno task check

# Format code
deno task fmt

# Lint code  
deno task lint
```

### Package Development

Each package can be developed independently:

```bash
# Work on compiler
cd packages/compiler
deno test --allow-all

# Work on UI library
cd packages/ui-library  
deno test --allow-all

# Work on API package
cd packages/api
deno test --allow-all
```

## 🏗 Architecture Deep Dive

### Compilation Pipeline

The compiler follows a five-phase pipeline:

1. **Parse Phase** - JSON validation and configuration parsing
2. **Plan Phase** - Dependency analysis and generation planning
3. **Generate Phase** - File generation from templates
4. **Integrate Phase** - Component and API route integration
5. **Optimize Phase** - Performance optimizations and cleanup

### Component System

Components are Fresh 2.0 islands with:
- **Type-safe props** - TypeScript interfaces with runtime validation
- **Composition support** - Nested component hierarchies
- **Theme integration** - CSS custom properties for consistent styling
- **Error boundaries** - Graceful error handling and recovery

### Template System

Templates use placeholder replacement:
- `{{app.name}}` - Application name
- `{{app.version}}` - Application version  
- `{{app.description}}` - Application description
- Conditional inclusion based on configuration flags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the test suite: `deno task test`
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all packages work together

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Fresh 2.0 Documentation](https://fresh.deno.dev/)
- [Deno Manual](https://deno.land/manual)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Built with Fresh 2.0 Alpha & Deno** | **Transforming JSON into Applications**