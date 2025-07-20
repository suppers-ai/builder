/**
 * Shared Application Types
 * Types related to application specifications, components, and generation
 */

// Application Info
export interface ApplicationInfo {
  name: string;
  version: string;
  description?: string;
  id: string;
}

// Variables for substitution
export type Variables = Record<string, string>;

// Compiler Info
export interface CompilerInfo {
  id: string;
  version: string;
}

// Head Meta
export interface HeadMeta {
  title?: string;
  description?: string;
}

// Head
export interface Head {
  meta?: HeadMeta;
}

// Component Definition (recursive)
export interface ComponentDefinition {
  id: string;
  props?: Record<string, any>;
  components?: ComponentDefinition[];
}

// Layout Component
export interface LayoutComponent {
  component: ComponentDefinition;
}

// Global Config
export interface GlobalConfig {
  head?: Head;
  menu?: LayoutComponent;
  header?: LayoutComponent;
  footer?: LayoutComponent;
}

// Data Configuration
export interface DataConfig {
  url?: string;
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
}

// Route Override
export interface RouteOverride {
  head?: Head;
}

// Route
export interface Route {
  path: string;
  type: "page";
  source?: string;
  permissions?: string[];
  override?: RouteOverride;
  components?: ComponentDefinition[];
}

// Data Schema (wrapper for global and routes)
export interface Data {
  global?: GlobalConfig;
  routes: Route[];
}

// Application Specification (new format)
export interface ApplicationSpec {
  application: ApplicationInfo;
  variables?: Variables;
  compiler: CompilerInfo;
  data: Data;
}

// Template types
export type TemplateType = "fresh-basic";

// File operation types for Deno
export interface FileOperation {
  path: string;
  content: string | Uint8Array;
}

export interface DirectoryCopyOptions {
  source: string;
  destination: string;
  exclude?: string[];
}

// Component Registry
export interface ComponentRegistry {
  [componentId: string]: {
    source: string;
    type: "ui-lib" | "custom" | "html";
    imports?: string[];
  };
}

// Site Generator Options
export interface SiteGeneratorOptions {
  name: string;
  withSupabase?: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  enableSSO?: boolean;
  authProviders?: string[];
}

// Variable Validation Result
export interface VariableValidationResult {
  valid: boolean;
  missingVariables: string[];
}

// Component Validation Result
export interface ComponentValidationResult {
  valid: boolean;
  missingComponents: string[];
}

// Generation Result
export interface GenerationResult {
  success: boolean;
  applicationName: string;
  outputPath: string;
  errors?: string[];
  warnings?: string[];
}

// Library Schema for component resolution
export interface Library {
  name: string;
  priority?: number;
  type?: string;
}
