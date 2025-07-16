// Core type definitions for the JSON App Compiler system

import type { HttpMethod } from './enums.ts';

// Common utility types
export type ComponentChildren = string | number | boolean | null | undefined | ComponentChildren[];

// Application metadata interface
export interface AppMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
}

// Theme configuration interface
export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  spacing?: Record<string, string>;
  breakpoints?: Record<string, string>;
  customProperties?: Record<string, string>;
}

// Component definition interface
export interface ComponentDefinition {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: ComponentDefinition[];
  conditions?: ComponentCondition[];
}

// Component condition for conditional rendering
export interface ComponentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'exists';
  value?: unknown;
}

// Route definition interface
export interface RouteDefinition {
  path: string;
  component: string;
  layout?: string;
  middleware?: string[];
  props?: Record<string, unknown>;
  meta?: RouteMeta;
}

// Route metadata
export interface RouteMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  requiresAuth?: boolean;
}

// API endpoint definition
export interface ApiEndpoint {
  path: string;
  methods: HttpMethod[];
  handler: string;
  middleware?: string[];
  validation?: ValidationSchema;
  auth?: AuthConfig;
}

// API definition interface
export interface ApiDefinition {
  endpoints: ApiEndpoint[];
  middleware?: MiddlewareConfig[];
  auth?: GlobalAuthConfig;
  cors?: CorsConfig;
}

// Main application configuration interface
export interface AppConfig {
  metadata: AppMetadata;
  components: ComponentDefinition[];
  routes: RouteDefinition[];
  api: ApiDefinition;
  theme?: ThemeConfig;
  build?: BuildConfig;
}

// HTTP methods enum (imported from enums.ts)
// export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Validation schema interface
export interface ValidationSchema {
  body?: Record<string, FieldValidation>;
  query?: Record<string, FieldValidation>;
  params?: Record<string, FieldValidation>;
  headers?: Record<string, FieldValidation>;
}

// Field validation rules
export interface FieldValidation {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
  custom?: string; // Custom validation function name
}

// Authentication configuration
export interface AuthConfig {
  required: boolean;
  roles?: string[];
  permissions?: string[];
}

// Global authentication configuration
export interface GlobalAuthConfig {
  provider: 'jwt' | 'session' | 'oauth' | 'custom';
  config: Record<string, unknown>;
  routes?: {
    login?: string;
    logout?: string;
    register?: string;
  };
}

// Middleware configuration
export interface MiddlewareConfig {
  name: string;
  config?: Record<string, unknown>;
  order?: number;
}

// CORS configuration
export interface CorsConfig {
  origin: string | string[] | boolean;
  methods?: HttpMethod[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

// Build configuration
export interface BuildConfig {
  target?: 'development' | 'production';
  minify?: boolean;
  sourceMaps?: boolean;
  outputDir?: string;
  publicPath?: string;
}

// Component registry interface
export interface ComponentRegistry {
  [componentType: string]: ComponentRegistryEntry;
}

// Component registry entry
export interface ComponentRegistryEntry {
  component: unknown; // ComponentType - will be defined by UI library
  schema: Record<string, unknown>; // JSON schema for props validation
  dependencies: string[];
  category?: string;
  description?: string;
}

// Compilation context interface
export interface CompilationContext {
  config: AppConfig;
  outputDir: string;
  templateDir: string;
  verbose?: boolean;
  dryRun?: boolean;
}

// Error types for better error handling
export interface CompilationError {
  type: 'validation' | 'template' | 'component' | 'file' | 'dependency';
  message: string;
  details?: string;
  location?: ErrorLocation;
  suggestions?: string[];
}

// Error location information
export interface ErrorLocation {
  file?: string;
  line?: number;
  column?: number;
  path?: string; // JSON path for configuration errors
}

// Template variable interface
export interface TemplateVariable {
  name: string;
  value: unknown;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

// File operation result
export interface FileOperationResult {
  success: boolean;
  path: string;
  error?: string;
  size?: number;
}