# JSON App Compiler - Shared Package

The shared package provides common types, utilities, validation schemas, and error handling used across all packages in the JSON App Compiler monorepo. This package ensures consistency and reduces code duplication throughout the system.

## 📦 Installation

This package is part of the JSON App Compiler monorepo and is typically used internally by other packages.

```typescript
import { 
  type AppConfig, 
  type ComponentDefinition,
  validateAppConfig,
  logger,
  fs
} from "@json-app-compiler/shared";
```

## 🏗 Architecture

### Core Modules

- **types.ts** - TypeScript interfaces and type definitions
- **schemas.ts** - JSON schema definitions for validation
- **validators.ts** - Input validation functions with detailed error reporting
- **utils.ts** - Common utility functions for file operations and logging
- **errors.ts** - Error classes and error handling utilities
- **enums.ts** - Shared enumerations and constants

## 📚 API Reference

### Types (`types.ts`)

#### Core Configuration Types

```typescript
interface AppConfig {
  metadata: AppMetadata;
  components: ComponentDefinition[];
  routes: RouteDefinition[];
  api: ApiDefinition;
  theme?: ThemeConfig;
  build?: BuildConfig;
}

interface AppMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
}

interface ComponentDefinition {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: ComponentDefinition[];
}

interface RouteDefinition {
  path: string;
  component: string;
  layout?: string;
  middleware?: string[];
  meta?: RouteMeta;
}

interface ApiDefinition {
  endpoints: ApiEndpoint[];
  middleware?: ApiMiddleware[];
  auth?: AuthConfig;
  cors?: CorsConfig;
}
```

#### Component System Types

```typescript
interface ComponentRegistryEntry {
  component: ComponentType;
  schema: JSONSchema;
  dependencies: string[];
  category?: string;
  description?: string;
}

interface ComponentRegistry {
  [componentType: string]: ComponentRegistryEntry;
}

interface PropValidation {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
  custom?: string;
}
```

#### API Types

```typescript
interface ApiEndpoint {
  path: string;
  methods: HttpMethod[];
  handler: string;
  middleware?: string[];
  validation?: ValidationSchema;
  auth?: EndpointAuth;
}

interface ValidationSchema {
  body?: Record<string, PropValidation>;
  query?: Record<string, PropValidation>;
  params?: Record<string, PropValidation>;
  headers?: Record<string, PropValidation>;
}

interface CrudConfig {
  resource: string;
  operations: CrudOperation[];
  validation?: Record<string, ValidationSchema>;
  middleware?: string[];
}
```

#### Theme and Styling Types

```typescript
interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  spacing: Record<string, string>;
  breakpoints?: Record<string, string>;
  customProperties?: Record<string, string>;
}

interface BuildConfig {
  target: 'development' | 'production';
  minify: boolean;
  sourceMaps: boolean;
  outputDir?: string;
  publicPath?: string;
}
```

### Schemas (`schemas.ts`)

#### JSON Schema Definitions

```typescript
const AppConfigSchema: JSONSchema = {
  type: 'object',
  required: ['metadata', 'components', 'routes', 'api'],
  properties: {
    metadata: { $ref: '#/definitions/AppMetadata' },
    components: {
      type: 'array',
      items: { $ref: '#/definitions/ComponentDefinition' }
    },
    routes: {
      type: 'array', 
      items: { $ref: '#/definitions/RouteDefinition' }
    },
    api: { $ref: '#/definitions/ApiDefinition' }
  }
};

const ComponentDefinitionSchema: JSONSchema = {
  type: 'object',
  required: ['id', 'type', 'props'],
  properties: {
    id: { type: 'string', minLength: 1 },
    type: { type: 'string', minLength: 1 },
    props: { type: 'object' },
    children: {
      type: 'array',
      items: { $ref: '#/definitions/ComponentDefinition' }
    }
  }
};
```

#### Schema Utilities

```typescript
function validateSchema(data: unknown, schema: JSONSchema): ValidationResult;
function createSchemaValidator(schema: JSONSchema): (data: unknown) => ValidationResult;
function mergeSchemas(base: JSONSchema, extension: JSONSchema): JSONSchema;
```

### Validators (`validators.ts`)

#### Configuration Validation

```typescript
function validateAppConfig(config: unknown): ValidationResult<AppConfig> {
  // Validates complete application configuration
  // Returns detailed error information for invalid configs
}

function validateComponentDefinition(component: unknown): ValidationResult<ComponentDefinition> {
  // Validates individual component definitions
  // Checks required fields, prop types, and nested structure
}

function validateRouteDefinition(route: unknown): ValidationResult<RouteDefinition> {
  // Validates route configuration
  // Ensures valid paths, component references, and middleware
}

function validateApiDefinition(api: unknown): ValidationResult<ApiDefinition> {
  // Validates API configuration
  // Checks endpoint definitions, validation schemas, and auth config
}
```

#### Validation Result Types

```typescript
interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  code: string;
  message: string;
  path: string;
  value?: unknown;
  suggestions?: string[];
}

interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  suggestion?: string;
}
```

### Utilities (`utils.ts`)

#### File System Operations

```typescript
const fs = {
  async readFile(path: string): Promise<string>;
  async writeFile(path: string, content: string): Promise<void>;
  async copyFile(src: string, dest: string): Promise<void>;
  async ensureDir(path: string): Promise<void>;
  async exists(path: string): Promise<boolean>;
  async readDir(path: string): Promise<Deno.DirEntry[]>;
  async remove(path: string): Promise<void>;
};
```

#### Logging Utilities

```typescript
const logger = {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  setLevel(level: LogLevel): void;
};

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}
```

#### String and Path Utilities

```typescript
function toCamelCase(str: string): string;
function toPascalCase(str: string): string;
function toKebabCase(str: string): string;
function sanitizeFileName(name: string): string;
function resolvePath(...segments: string[]): string;
function relativePath(from: string, to: string): string;
```

### Errors (`errors.ts`)

#### Error Classes

```typescript
class CompilationError extends Error {
  code: string;
  details?: string;
  suggestions?: string[];
  location?: ErrorLocation;
  
  constructor(message: string, code: string, options?: ErrorOptions);
}

class ValidationError extends CompilationError {
  field: string;
  value: unknown;
  
  constructor(message: string, field: string, value: unknown);
}

class ComponentError extends CompilationError {
  componentId: string;
  componentType: string;
  
  constructor(message: string, componentId: string, componentType: string);
}

class ApiError extends CompilationError {
  endpoint: string;
  method: string;
  
  constructor(message: string, endpoint: string, method: string);
}
```

#### Error Handling Utilities

```typescript
function createError(type: ErrorType, message: string, options?: ErrorOptions): CompilationError;
function formatError(error: CompilationError): string;
function collectErrors(results: ValidationResult[]): CompilationError[];
function isRecoverableError(error: CompilationError): boolean;
```

### Enums (`enums.ts`)

#### Common Enumerations

```typescript
enum ComponentType {
  BUTTON = 'Button',
  INPUT = 'Input', 
  CARD = 'Card',
  LAYOUT = 'Layout'
}

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

enum CrudOperation {
  CREATE = 'create',
  READ = 'read', 
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list'
}

enum ValidationErrorCode {
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_TYPE = 'INVALID_TYPE',
  PATTERN_VIOLATION = 'PATTERN_VIOLATION',
  OUT_OF_RANGE = 'OUT_OF_RANGE'
}
```

## 🧪 Usage Examples

### Basic Configuration Validation

```typescript
import { validateAppConfig, type AppConfig } from "@json-app-compiler/shared";

const config = {
  metadata: {
    name: "my-app",
    version: "1.0.0",
    description: "My application"
  },
  components: [
    {
      id: "header",
      type: "Layout",
      props: { padding: "md" }
    }
  ],
  routes: [
    {
      path: "/",
      component: "header"
    }
  ],
  api: {
    endpoints: []
  }
};

const result = validateAppConfig(config);
if (result.success) {
  console.log("Configuration is valid!");
  const validConfig: AppConfig = result.data!;
} else {
  console.error("Validation errors:", result.errors);
}
```

### File Operations

```typescript
import { fs, logger } from "@json-app-compiler/shared";

async function processConfigFile(path: string) {
  try {
    if (await fs.exists(path)) {
      const content = await fs.readFile(path);
      const config = JSON.parse(content);
      logger.info(`Loaded configuration from ${path}`);
      return config;
    } else {
      logger.warn(`Configuration file not found: ${path}`);
      return null;
    }
  } catch (error) {
    logger.error(`Failed to read configuration: ${error.message}`);
    throw error;
  }
}
```

### Error Handling

```typescript
import { CompilationError, ValidationError, formatError } from "@json-app-compiler/shared";

function handleCompilationError(error: unknown) {
  if (error instanceof ValidationError) {
    console.error(`Validation error in field '${error.field}':`, error.message);
    if (error.suggestions) {
      console.log("Suggestions:", error.suggestions.join(", "));
    }
  } else if (error instanceof CompilationError) {
    console.error("Compilation error:", formatError(error));
  } else {
    console.error("Unknown error:", error);
  }
}
```

## 🔧 Development

### Running Tests

```bash
deno test packages/shared/ --allow-all
```

### Type Checking

```bash
deno check packages/shared/src/*.ts
```

## 🤝 Integration

This package is designed to be used by all other packages in the monorepo:

- **Compiler** - Uses types, validation, and utilities for configuration processing
- **API** - Uses API types, validation schemas, and error handling
- **UI Library** - Uses component types, validation, and registry interfaces
- **Templates** - Uses utility functions and error handling

## 📄 License

Part of the JSON App Compiler project. See the main project LICENSE for details.