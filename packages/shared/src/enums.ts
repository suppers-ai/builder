// Common enums and constants for the JSON App Compiler system

// HTTP methods type
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Log levels for the logging system
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

// Component categories for organization
export enum ComponentCategory {
  LAYOUT = 'layout',
  FORM = 'form',
  NAVIGATION = 'navigation',
  DATA_DISPLAY = 'data-display',
  FEEDBACK = 'feedback',
  INPUT = 'input',
  MEDIA = 'media',
  UTILITY = 'utility',
}

// Compilation phases
export enum CompilationPhase {
  PARSE = 'parse',
  VALIDATE = 'validate',
  PLAN = 'plan',
  GENERATE = 'generate',
  INTEGRATE = 'integrate',
  OPTIMIZE = 'optimize',
  COMPLETE = 'complete',
}

// File operation types
export enum FileOperationType {
  CREATE = 'create',
  COPY = 'copy',
  MODIFY = 'modify',
  DELETE = 'delete',
  MOVE = 'move',
}

// Template processing modes
export enum TemplateMode {
  REPLACE = 'replace',
  MERGE = 'merge',
  APPEND = 'append',
  PREPEND = 'prepend',
}

// Validation severity levels
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// Component prop types for validation
export enum PropType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  FUNCTION = 'function',
  NODE = 'node',
  ELEMENT = 'element',
}

// HTTP status codes commonly used
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  SERVICE_UNAVAILABLE = 503,
}

// Default configuration values
export const DEFAULT_CONFIG = {
  BUILD: {
    TARGET: 'development' as const,
    MINIFY: false,
    SOURCE_MAPS: true,
    OUTPUT_DIR: './dist',
    PUBLIC_PATH: '/',
  },
  THEME: {
    PRIMARY_COLOR: '#3b82f6',
    SECONDARY_COLOR: '#64748b',
    FONT_FAMILY: 'system-ui, sans-serif',
  },
  API: {
    BASE_PATH: '/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
  },
  LOGGING: {
    LEVEL: LogLevel.INFO,
    FORMAT: 'json' as const,
  },
} as const;

// File extensions and patterns
export const FILE_PATTERNS = {
  TYPESCRIPT: /\.tsx?$/,
  JAVASCRIPT: /\.jsx?$/,
  JSON: /\.json$/,
  CSS: /\.css$/,
  SCSS: /\.scss$/,
  MARKDOWN: /\.md$/,
  TEMPLATE: /\.template\./,
} as const;

// Reserved component names that cannot be used
export const RESERVED_COMPONENT_NAMES = [
  'Fragment',
  'Component',
  'Element',
  'Node',
  'Props',
  'State',
  'Context',
  'Provider',
  'Consumer',
] as const;

// Reserved route paths
export const RESERVED_ROUTE_PATHS = [
  '/api',
  '/_fresh',
  '/static',
  '/assets',
  '/_app',
  '/_error',
] as const;