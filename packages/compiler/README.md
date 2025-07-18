# JSON App Compiler - Compiler Package

The compiler package is the core engine of the JSON App Compiler system. It orchestrates the transformation of JSON configuration files into fully functional Fresh 2.0 applications by coordinating parsing, validation, generation, and integration phases.

## 📦 Installation

This package is part of the JSON App Compiler monorepo and can be used both as a library and CLI tool.

```typescript
import { Compiler, type CompilerOptions } from "@json-app-compiler/compiler";
```

## 🏗 Architecture

### Core Modules

- **compiler.ts** - Main compiler orchestration and pipeline management
- **cli.ts** - Command-line interface for the compiler
- **config-parser.ts** - JSON configuration parsing and validation
- **component-resolver.ts** - Component resolution and integration
- **route-generator.ts** - Fresh route generation from JSON definitions
- **template-processor.ts** - Template processing and placeholder replacement
- **file-manager.ts** - File system operations and project structure creation
- **error-handling.ts** - Comprehensive error handling and recovery
- **diagnostics.ts** - Debugging and diagnostic tools

## 🚀 Quick Start

### CLI Usage

```bash
# Basic compilation
deno run -A packages/compiler/src/cli.ts --config app-config.json --output ./my-app

# With custom template directory
deno run -A packages/compiler/src/cli.ts --config app-config.json --output ./my-app --template ./custom-template

# Verbose output for debugging
deno run -A packages/compiler/src/cli.ts --config app-config.json --output ./my-app --verbose

# Dry run (validate without generating)
deno run -A packages/compiler/src/cli.ts --config app-config.json --dry-run
```

### Programmatic Usage

```typescript
import { Compiler } from "@json-app-compiler/compiler";

const compiler = new Compiler({
  templateDir: "./packages/templates/base",
  outputDir: "./generated-app",
  verbose: true
});

const result = await compiler.compile("./app-config.json");
if (result.success) {
  console.log("Application generated successfully!");
} else {
  console.error("Compilation failed:", result.errors);
}
```

## 📚 API Reference

### Compiler Class

#### Constructor

```typescript
class Compiler {
  constructor(options: CompilerOptions);
}

interface CompilerOptions {
  templateDir?: string;        // Template directory path
  outputDir?: string;          // Output directory path
  verbose?: boolean;           // Enable verbose logging
  dryRun?: boolean;           // Validate without generating files
  overwrite?: boolean;        // Overwrite existing output directory
  skipValidation?: boolean;   // Skip JSON schema validation
  parallel?: boolean;         // Enable parallel processing
}
```

#### Main Methods

```typescript
// Compile a JSON configuration file
async compile(configPath: string): Promise<CompilationResult>;

// Compile from configuration object
async compileFromConfig(config: AppConfig, options?: CompileOptions): Promise<CompilationResult>;

// Validate configuration without generating
async validate(configPath: string): Promise<ValidationResult>;

// Get available components from UI library
getAvailableComponents(): ComponentRegistry;
```

#### Compilation Result

```typescript
interface CompilationResult {
  success: boolean;
  errors: CompilationError[];
  warnings: CompilationWarning[];
  generatedFiles: string[];
  outputDir: string;
  duration: number;
}

interface CompilationError {
  code: string;
  message: string;
  details?: string;
  location?: ErrorLocation;
  suggestions?: string[];
}
```

### Configuration Parser

#### ConfigParser Class

```typescript
class ConfigParser {
  async parseFile(path: string): Promise<ParseResult<AppConfig>>;
  async parseString(content: string): Promise<ParseResult<AppConfig>>;
  validate(config: unknown): ValidationResult<AppConfig>;
}

interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: ParseError[];
  warnings: ParseWarning[];
}
```

### Component Resolver

#### ComponentResolver Class

```typescript
class ComponentResolver {
  constructor(componentRegistry: ComponentRegistry);
  
  resolveComponent(definition: ComponentDefinition): ComponentResolution;
  validateProps(componentType: string, props: Record<string, unknown>): ValidationResult;
  generateImports(components: ComponentDefinition[]): ImportStatement[];
}

interface ComponentResolution {
  success: boolean;
  componentPath: string;
  imports: string[];
  errors: ComponentError[];
  warnings: ComponentWarning[];
}
```

### Route Generator

#### RouteGenerator Class

```typescript
class RouteGenerator {
  constructor(options: RouteGeneratorOptions);
  
  generateRoutes(
    routes: RouteDefinition[], 
    components: ComponentDefinition[]
  ): RouteGenerationResult;
  
  generateRouteFile(route: RouteDefinition): string;
  generateLayoutFile(layout: ComponentDefinition): string;
}

interface RouteGenerationResult {
  success: boolean;
  generatedRoutes: GeneratedRoute[];
  errors: RouteError[];
}

interface GeneratedRoute {
  path: string;
  filePath: string;
  content: string;
  imports: string[];
}
```

### Template Processor

#### TemplateProcessor Class

```typescript
class TemplateProcessor {
  constructor(templateDir: string);
  
  processTemplate(templatePath: string, context: TemplateContext): string;
  createContextFromConfig(config: AppConfig): TemplateContext;
  copyTemplateFiles(outputDir: string, context: TemplateContext): Promise<void>;
}

interface TemplateContext {
  app: {
    name: string;
    version: string;
    description: string;
  };
  components: ComponentDefinition[];
  routes: RouteDefinition[];
  api: ApiDefinition;
  theme?: ThemeConfig;
}
```

### File Manager

#### FileManager Class

```typescript
class FileManager {
  constructor(outputDir: string);
  
  async createProjectStructure(): Promise<void>;
  async writeFile(path: string, content: string): Promise<void>;
  async copyFile(src: string, dest: string): Promise<void>;
  async ensureDirectory(path: string): Promise<void>;
  async cleanOutputDirectory(): Promise<void>;
}
```

## 🔄 Compilation Pipeline

The compiler follows a five-phase pipeline:

### 1. Parse Phase
- Load and parse JSON configuration file
- Validate against JSON schema
- Report syntax and structure errors
- Create internal configuration representation

### 2. Plan Phase  
- Analyze component dependencies
- Create generation plan and task order
- Validate component and route references
- Build dependency graph for optimization

### 3. Generate Phase
- Copy base template files to output directory
- Process template placeholders with configuration values
- Generate component files from UI library
- Create project structure and configuration files

### 4. Integrate Phase
- Generate Fresh route files from route definitions
- Wire components with proper imports and props
- Generate API route handlers from endpoint definitions
- Integrate middleware and authentication

### 5. Optimize Phase
- Apply performance optimizations
- Minimize generated code if configured
- Generate source maps for debugging
- Clean up temporary files and optimize assets

## 🛠 CLI Reference

### Commands

```bash
# Compile command (default)
deno run -A packages/compiler/src/cli.ts [options] <config-file>

# Validate command
deno run -A packages/compiler/src/cli.ts validate <config-file>

# List components command
deno run -A packages/compiler/src/cli.ts list-components

# Version command
deno run -A packages/compiler/src/cli.ts --version
```

### Options

```bash
-c, --config <path>      Path to JSON configuration file
-o, --output <path>      Output directory for generated application
-t, --template <path>    Custom template directory
-v, --verbose            Enable verbose logging
-d, --dry-run           Validate configuration without generating files
-f, --force             Overwrite existing output directory
-p, --parallel          Enable parallel processing
-s, --skip-validation   Skip JSON schema validation
-h, --help              Show help information
```

### Examples

```bash
# Basic usage
deno run -A packages/compiler/src/cli.ts -c examples/simple/app-config.json -o ./my-app

# With custom template
deno run -A packages/compiler/src/cli.ts -c app-config.json -o ./my-app -t ./custom-template

# Verbose output for debugging
deno run -A packages/compiler/src/cli.ts -c app-config.json -o ./my-app --verbose

# Validate only
deno run -A packages/compiler/src/cli.ts validate app-config.json

# Force overwrite existing directory
deno run -A packages/compiler/src/cli.ts -c app-config.json -o ./existing-app --force
```

## 🔧 Error Handling

### Error Types

The compiler provides comprehensive error handling with specific error types:

```typescript
enum CompilerErrorCode {
  CONFIG_PARSE_ERROR = 'CONFIG_PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR', 
  COMPONENT_NOT_FOUND = 'COMPONENT_NOT_FOUND',
  ROUTE_GENERATION_ERROR = 'ROUTE_GENERATION_ERROR',
  TEMPLATE_PROCESSING_ERROR = 'TEMPLATE_PROCESSING_ERROR',
  FILE_OPERATION_ERROR = 'FILE_OPERATION_ERROR',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR'
}
```

### Error Recovery

The compiler includes recovery mechanisms for common errors:

- **Missing Components** - Graceful degradation with placeholder components
- **Invalid Props** - Default prop values with warnings
- **Template Errors** - Fallback to basic templates
- **File Operation Failures** - Retry logic with exponential backoff

### Diagnostic Tools

```typescript
class DiagnosticTool {
  analyzeConfiguration(config: AppConfig): DiagnosticReport;
  checkComponentAvailability(components: ComponentDefinition[]): ComponentAvailabilityReport;
  validateRouteStructure(routes: RouteDefinition[]): RouteValidationReport;
  generateHealthReport(): SystemHealthReport;
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all compiler tests
deno test packages/compiler/ --allow-all

# Run specific test files
deno test packages/compiler/src/compiler.test.ts --allow-all
deno test packages/compiler/src/integration.test.ts --allow-all

# Run with coverage
deno test packages/compiler/ --allow-all --coverage=coverage/
```

### Test Categories

- **Unit Tests** - Individual module testing
- **Integration Tests** - End-to-end compilation testing
- **Performance Tests** - Compilation speed and memory usage
- **Error Handling Tests** - Error scenarios and recovery

## 🚀 Performance

### Optimization Features

- **Parallel Processing** - Concurrent component and route generation
- **Incremental Compilation** - Only regenerate changed components
- **Template Caching** - Cache processed templates for reuse
- **Dependency Optimization** - Minimize component imports

### Performance Monitoring

```typescript
interface PerformanceMetrics {
  parseTime: number;
  planTime: number;
  generateTime: number;
  integrateTime: number;
  optimizeTime: number;
  totalTime: number;
  memoryUsage: number;
  filesGenerated: number;
}
```

## 🔌 Extensibility

### Custom Templates

Create custom templates by extending the base template structure:

```
custom-template/
├── routes/
├── islands/
├── static/
├── deno.json.template
├── main.ts.template
└── README.md.template
```

### Custom Components

Register custom components with the component resolver:

```typescript
const customRegistry: ComponentRegistry = {
  'CustomButton': {
    component: CustomButtonComponent,
    schema: customButtonSchema,
    dependencies: ['preact']
  }
};

const compiler = new Compiler({
  customComponents: customRegistry
});
```

## 📄 License

Part of the JSON App Compiler project. See the main project LICENSE for details.