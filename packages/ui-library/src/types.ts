// Component registry types and interfaces

import type { ComponentChildren, JSONSchema } from '@json-app-compiler/shared';
import type { ComponentCategory } from '@json-app-compiler/shared/enums';

// Fresh component type (generic for now, will be refined with actual Fresh types)
export type FreshComponent<P = Record<string, unknown>> = (props: P) => JSX.Element;

// Component metadata for registry
export interface ComponentMetadata {
  name: string;
  category: ComponentCategory;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
  deprecated?: boolean;
  experimental?: boolean;
}

// Component prop schema definition
export interface ComponentPropSchema {
  [propName: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function' | 'node' | 'element';
    required?: boolean;
    default?: unknown;
    description?: string;
    enum?: unknown[];
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    items?: ComponentPropSchema;
    properties?: ComponentPropSchema;
    validation?: (value: unknown) => boolean | string;
  };
}

// Component registry entry with enhanced metadata
export interface ComponentRegistryEntry {
  component: FreshComponent;
  metadata: ComponentMetadata;
  propSchema: ComponentPropSchema;
  jsonSchema: JSONSchema;
  dependencies: string[];
  examples?: ComponentExample[];
  documentation?: ComponentDocumentation;
}

// Component example for documentation
export interface ComponentExample {
  name: string;
  description: string;
  props: Record<string, unknown>;
  code?: string;
}

// Component documentation
export interface ComponentDocumentation {
  overview?: string;
  usage?: string;
  accessibility?: string;
  styling?: string;
  notes?: string[];
}

// Component registry interface
export interface IComponentRegistry {
  // Registration methods
  register(name: string, entry: ComponentRegistryEntry): void;
  registerBulk(entries: Record<string, ComponentRegistryEntry>): void;
  
  // Retrieval methods
  get(name: string): ComponentRegistryEntry | undefined;
  getAll(): Record<string, ComponentRegistryEntry>;
  getByCategory(category: ComponentCategory): Record<string, ComponentRegistryEntry>;
  
  // Query methods
  has(name: string): boolean;
  list(): string[];
  listByCategory(category: ComponentCategory): string[];
  search(query: string): string[];
  
  // Validation methods
  validateProps(componentName: string, props: Record<string, unknown>): ValidationResult;
  validateComponent(name: string, entry: ComponentRegistryEntry): ValidationResult;
  
  // Utility methods
  getSchema(name: string): JSONSchema | undefined;
  getDependencies(name: string): string[];
  getMetadata(name: string): ComponentMetadata | undefined;
  
  // Discovery methods
  discover(directory: string): Promise<string[]>;
  autoRegister(directory: string): Promise<void>;
}

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Validation error
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  expected?: string;
  code?: string;
}

// Validation warning
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Component discovery options
export interface ComponentDiscoveryOptions {
  recursive?: boolean;
  pattern?: RegExp;
  exclude?: string[];
  includeMetadata?: boolean;
  validateOnDiscovery?: boolean;
}

// Component registration options
export interface ComponentRegistrationOptions {
  override?: boolean;
  validate?: boolean;
  generateSchema?: boolean;
  autoDiscoverDependencies?: boolean;
}

// Registry configuration
export interface RegistryConfig {
  strict?: boolean;
  allowOverrides?: boolean;
  autoValidation?: boolean;
  cacheSchemas?: boolean;
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
}

// Component props base interface
export interface BaseComponentProps {
  id?: string;
  className?: string;
  style?: Record<string, string | number>;
  children?: ComponentChildren;
  'data-testid'?: string;
}

// Theme-aware component props
export interface ThemedComponentProps extends BaseComponentProps {
  theme?: string;
  variant?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

// Event handler types
export interface ComponentEventHandlers {
  onClick?: (event: Event) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onChange?: (event: Event) => void;
  onSubmit?: (event: SubmitEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
}

// Component state management
export interface ComponentState {
  [key: string]: unknown;
}

// Component lifecycle hooks (for Fresh islands)
export interface ComponentLifecycle {
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: (prevProps: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
}