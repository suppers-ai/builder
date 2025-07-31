# @suppers/store - Application Marketplace & Generator

A web-based marketplace and generator interface for creating applications using the Suppers
compiler. This package provides a visual interface for building, configuring, and managing
applications without command-line tools.

## Features

- 🏪 **Application Marketplace**: Browse and select from pre-built application templates
- 🎨 **Visual App Builder**: Form-based application configuration with live preview
- ⚡ **Compiler Integration**: Direct integration with @suppers/compiler for app generation
- 📱 **Template Gallery**: Curated collection of application templates and examples
- 🔧 **App Management**: View, download, and manage generated applications
- 🎯 **Modern UI**: Built with Tailwind CSS and daisyUI components from @suppers/ui-lib

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) 1.40+
- [@suppers/compiler](../compiler/) package available in workspace

### Installation

1. Clone the repository and navigate to the store package:
   ```bash
   cd packages/store
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   COMPILER_OUTPUT_DIR=./apps/generated
   ```

4. Start the development server:
   ```bash
   deno task dev
   ```

The store will be available at `http://localhost:8000`.

## Development

### Available Scripts

- `deno task dev` - Start development server with hot reload
- `deno task start` - Start production server
- `deno task build` - Build the application
- `deno task test` - Run tests
- `deno task test:watch` - Run tests in watch mode
- `deno task check` - Type check the code
- `deno task fmt` - Format code
- `deno task lint` - Lint code

### Project Structure

```
packages/store/
├── islands/              # Interactive client-side components
│   ├── AppGeneratorForm.tsx
│   ├── ApplicationManager.tsx
│   ├── GenerationProgress.tsx
│   ├── MarketplaceHomepage.tsx
│   └── TemplateGallery.tsx
├── lib/                  # Server-side utilities and services
│   ├── compiler-service.ts
│   ├── supabase-client.ts
│   └── mod.ts
├── routes/               # API and page routes
│   ├── api/             # API endpoints
│   ├── create.tsx       # App creation page
│   ├── templates.tsx    # Template gallery page
│   └── index.tsx        # Homepage
├── apps/                # Generated applications
│   └── generated/       # Output directory for generated apps
├── static/              # Static assets
├── types/               # TypeScript type definitions
├── main.ts              # Application entry point
└── deno.json            # Deno configuration
```

## Using the Application Generator

### Creating a New Application

1. **Visit the Marketplace**: Navigate to `http://localhost:8000`
2. **Choose a Template**: Browse the template gallery or start from scratch
3. **Configure Your App**: Use the visual form builder to specify:
   - Application name and description
   - Features (authentication, database, API)
   - Routes and pages
   - Styling and theme
4. **Generate**: Click "Generate Application" to create your app
5. **Download**: Once generation is complete, download your application

### Template Categories

- **Business**: CRM, inventory management, project management
- **Portfolio**: Personal websites, portfolios, landing pages
- **Blog**: Content management, news sites, documentation
- **E-commerce**: Online stores, product catalogs, shopping carts
- **Dashboard**: Analytics, admin panels, monitoring tools

### Application Configuration

The generator supports comprehensive application configuration:

```typescript
interface ApplicationConfig {
  application: {
    name: string;
    description: string;
    version: string;
    author?: string;
  };
  template: {
    type: "fresh-basic" | "business" | "portfolio" | "blog" | "ecommerce";
    variant?: string;
  };
  features: {
    authentication: boolean;
    database: boolean;
    api: boolean;
    fileUpload: boolean;
    realtime: boolean;
  };
  routes: RouteConfig[];
  styling: {
    theme: string;
    primaryColor: string;
    customCSS?: string;
  };
  deployment: {
    platform: "deno-deploy" | "docker" | "static";
    domain?: string;
  };
}
```

## Compiler Integration

The store package integrates directly with the [@suppers/compiler](../compiler/) to generate
applications:

### Compiler Service

```typescript
import { CompilerService } from "./lib/compiler-service.ts";

const compiler = new CompilerService();

// Generate an application
const result = await compiler.generateApplication({
  name: "my-awesome-app",
  template: "fresh-basic",
  features: ["authentication", "database"],
  routes: [
    { path: "/", component: "HomePage" },
    { path: "/about", component: "AboutPage" },
  ],
});

// Check generation status
const status = await compiler.getGenerationStatus(result.id);

// Download generated application
const downloadUrl = await compiler.getDownloadUrl(result.id);
```

### Generation Process

1. **Validation**: Application specification is validated
2. **Template Processing**: Base template is prepared
3. **Code Generation**: Components and routes are generated
4. **File System**: Application files are written to disk
5. **Packaging**: Application is packaged for download

## Template Development

### Creating Custom Templates

1. Create a new template directory in `packages/templates/`:
   ```
   packages/templates/my-template/
   ├── deno.json
   ├── main.ts
   ├── routes/
   └── static/
   ```

2. Define template metadata:
   ```typescript
   // template.config.ts
   export const templateConfig = {
     name: "My Custom Template",
     description: "A custom application template",
     category: "business",
     features: ["authentication", "database"],
     preview: "/static/preview.png",
     complexity: "intermediate",
     estimatedTime: "15 minutes",
   };
   ```

3. Register the template in the store:
   ```typescript
   // Add to templates registry
   const templates = [
     // ... existing templates
     {
       id: "my-template",
       ...templateConfig,
       spec: {
         template: "my-template",
         // ... default configuration
       },
     },
   ];
   ```

### Template Variables

Templates support variable substitution:

```typescript
// In template files
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to {{ APP_NAME }}</h1>
      <p>{{ APP_DESCRIPTION }}</p>
    </div>
  );
}
```

Variables are replaced during generation:

- `{{APP_NAME}}` - Application name
- `{{APP_DESCRIPTION}}` - Application description
- `{{AUTHOR}}` - Application author
- `{{VERSION}}` - Application version

## API Reference

### Compiler Service API

#### `generateApplication(spec: ApplicationSpec): Promise<GenerationResult>`

Generates a new application based on the provided specification.

#### `validateSpec(spec: ApplicationSpec): Promise<ValidationResult>`

Validates an application specification without generating.

#### `getGenerationStatus(id: string): Promise<GenerationStatus>`

Gets the current status of an application generation.

#### `getAvailableTemplates(): Promise<ApplicationTemplate[]>`

Returns all available application templates.

#### `downloadApplication(id: string): Promise<Blob>`

Downloads a generated application as a ZIP file.

### REST API Endpoints

- `GET /api/templates` - List available templates
- `POST /api/generate` - Generate new application
- `GET /api/generate/:id` - Get generation status
- `GET /api/download/:id` - Download generated application
- `DELETE /api/applications/:id` - Delete generated application

## Environment Variables

| Variable              | Description                  | Default            |
| --------------------- | ---------------------------- | ------------------ |
| `SUPABASE_URL`        | Supabase project URL         | Required           |
| `SUPABASE_ANON_KEY`   | Supabase anonymous key       | Required           |
| `COMPILER_OUTPUT_DIR` | Directory for generated apps | `./apps/generated` |
| `MAX_GENERATION_TIME` | Max generation time (ms)     | `300000`           |
| `CLEANUP_INTERVAL`    | Cleanup interval (ms)        | `3600000`          |
| `MAX_STORAGE_SIZE`    | Max storage size (bytes)     | `1073741824`       |

## Deployment

### Deno Deploy

```bash
# Deploy to Deno Deploy
deployctl deploy --project=suppers-store main.ts
```

### Docker

```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app
COPY . .
RUN deno cache main.ts

# Create output directory
RUN mkdir -p apps/generated

EXPOSE 8000
CMD ["deno", "run", "--allow-all", "main.ts"]
```

### Environment Setup

For production deployment, ensure:

1. **File Permissions**: Write access to output directory
2. **Storage Limits**: Configure appropriate storage limits
3. **Cleanup Jobs**: Set up periodic cleanup of old applications
4. **Monitoring**: Monitor generation success rates and performance

## Troubleshooting

### Common Issues

**Generation Fails**

- Check compiler package is available
- Verify output directory permissions
- Check application specification validity

**Templates Not Loading**

- Ensure template files are accessible
- Check template configuration syntax
- Verify template registry registration

**Performance Issues**

- Monitor generation queue length
- Check available disk space
- Review cleanup configuration

### Debug Mode

Enable debug logging:

```bash
DEBUG=true deno task dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add new templates or improve existing functionality
4. Write tests for new features
5. Submit a pull request

### Adding New Templates

1. Create template in `packages/templates/`
2. Add template configuration
3. Register in template registry
4. Add preview images and documentation
5. Test generation process

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

For questions and support:

- Create an issue in the repository
- Check the [documentation](../../docs/)
- Join our community discussions
