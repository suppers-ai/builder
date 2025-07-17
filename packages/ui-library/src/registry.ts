// Component registry implementation

import type { JSONSchema } from '@json-app-compiler/shared';
import { ComponentCategory } from '@json-app-compiler/shared';
import type {
  IComponentRegistry,
  ComponentRegistryEntry,
  ComponentMetadata,
  ValidationResult,
  ComponentDiscoveryOptions,
  ComponentRegistrationOptions,
  RegistryConfig
} from './types.ts';
import { 
  validateRegistryEntry, 
  validateComponentProps as validateProps,
  propSchemaToJsonSchema 
} from './validation.ts';

/**
 * Component registry implementation with schema validation and automatic discovery
 */
export class ComponentRegistry implements IComponentRegistry {
  private components: Map<string, ComponentRegistryEntry> = new Map();
  private config: RegistryConfig;

  constructor(config: RegistryConfig = {}) {
    this.config = {
      strict: true,
      allowOverrides: false,
      autoValidation: true,
      cacheSchemas: true,
      logLevel: 'warn',
      ...config
    };
  }

  /**
   * Register a single component
   */
  register(name: string, entry: ComponentRegistryEntry): void {
    // Validate component entry if auto-validation is enabled
    if (this.config.autoValidation) {
      const validation = validateRegistryEntry(name, entry);
      if (!validation.valid) {
        const errorMessages = validation.errors.map(e => e.message).join(', ');
        throw new Error(`Component registration failed for '${name}': ${errorMessages}`);
      }
    }

    // Check for existing component
    if (this.components.has(name) && !this.config.allowOverrides) {
      throw new Error(`Component '${name}' is already registered. Set allowOverrides to true to replace.`);
    }

    // Generate JSON schema from prop schema if not provided
    if (!entry.jsonSchema && entry.propSchema) {
      entry.jsonSchema = propSchemaToJsonSchema(entry.propSchema);
    }

    this.components.set(name, entry);
    this.log('info', `Registered component: ${name}`);
  }

  /**
   * Register multiple components at once
   */
  registerBulk(entries: Record<string, ComponentRegistryEntry>): void {
    const errors: string[] = [];

    for (const [name, entry] of Object.entries(entries)) {
      try {
        this.register(name, entry);
      } catch (error) {
        errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Bulk registration failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Get a component by name
   */
  get(name: string): ComponentRegistryEntry | undefined {
    return this.components.get(name);
  }

  /**
   * Get all registered components
   */
  getAll(): Record<string, ComponentRegistryEntry> {
    const result: Record<string, ComponentRegistryEntry> = {};
    for (const [name, entry] of this.components.entries()) {
      result[name] = entry;
    }
    return result;
  }

  /**
   * Get components by category
   */
  getByCategory(category: ComponentCategory): Record<string, ComponentRegistryEntry> {
    const result: Record<string, ComponentRegistryEntry> = {};
    for (const [name, entry] of this.components.entries()) {
      if (entry.metadata.category === category) {
        result[name] = entry;
      }
    }
    return result;
  }

  /**
   * Check if a component is registered
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * List all component names
   */
  list(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * List component names by category
   */
  listByCategory(category: ComponentCategory): string[] {
    const names: string[] = [];
    for (const [name, entry] of this.components.entries()) {
      if (entry.metadata.category === category) {
        names.push(name);
      }
    }
    return names;
  }

  /**
   * Search components by name or metadata
   */
  search(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    const matches: string[] = [];

    for (const [name, entry] of this.components.entries()) {
      // Search in component name
      if (name.toLowerCase().includes(lowerQuery)) {
        matches.push(name);
        continue;
      }

      // Search in metadata
      const metadata = entry.metadata;
      if (
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.description.toLowerCase().includes(lowerQuery) ||
        metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        matches.push(name);
      }
    }

    return matches;
  }

  /**
   * Validate component props against schema
   */
  validateProps(componentName: string, props: Record<string, unknown>): ValidationResult {
    const entry = this.components.get(componentName);
    if (!entry) {
      return {
        valid: false,
        errors: [{
          field: 'component',
          message: `Component '${componentName}' not found in registry`,
          code: 'COMPONENT_NOT_FOUND'
        }],
        warnings: []
      };
    }

    return validateProps(props, entry.propSchema);
  }

  /**
   * Validate a component registry entry
   */
  validateComponent(name: string, entry: ComponentRegistryEntry): ValidationResult {
    return validateRegistryEntry(name, entry);
  }

  /**
   * Get JSON schema for a component
   */
  getSchema(name: string): JSONSchema | undefined {
    const entry = this.components.get(name);
    return entry?.jsonSchema;
  }

  /**
   * Get component dependencies
   */
  getDependencies(name: string): string[] {
    const entry = this.components.get(name);
    return entry?.dependencies || [];
  }

  /**
   * Get component metadata
   */
  getMetadata(name: string): ComponentMetadata | undefined {
    const entry = this.components.get(name);
    return entry?.metadata;
  }

  /**
   * Discover components in a directory
   */
  async discover(directory: string, options: ComponentDiscoveryOptions = {}): Promise<string[]> {
    const {
      recursive = true,
      pattern = /\.tsx?$/,
      exclude = ['node_modules', '.git', 'dist', 'build'],
      includeMetadata = true,
      validateOnDiscovery = false
    } = options;

    const discoveredComponents: string[] = [];

    try {
      const entries = Deno.readDir(directory);
      
      for await (const entry of entries) {
        const fullPath = `${directory}/${entry.name}`;

        // Skip excluded directories
        if (exclude.includes(entry.name)) {
          continue;
        }

        if (entry.isDirectory && recursive) {
          const subComponents = await this.discover(fullPath, options);
          discoveredComponents.push(...subComponents);
        } else if (entry.isFile && pattern.test(entry.name)) {
          try {
            const componentName = this.extractComponentName(entry.name);
            if (componentName) {
              discoveredComponents.push(componentName);
              this.log('debug', `Discovered component: ${componentName} at ${fullPath}`);
            }
          } catch (error) {
            this.log('warn', `Failed to process component file ${fullPath}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    } catch (error) {
      this.log('error', `Failed to discover components in ${directory}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }

    return discoveredComponents;
  }

  /**
   * Auto-register components from a directory
   */
  async autoRegister(directory: string, options: ComponentDiscoveryOptions = {}): Promise<void> {
    const componentNames = await this.discover(directory, options);
    
    for (const componentName of componentNames) {
      try {
        // This is a simplified auto-registration
        // In a real implementation, you would dynamically import and analyze the component
        this.log('info', `Auto-registering component: ${componentName}`);
        
        // For now, we'll create a placeholder entry
        // Real implementation would analyze the component file
        const entry: ComponentRegistryEntry = {
          component: () => null as any, // Placeholder
          metadata: {
            name: componentName,
            category: ComponentCategory.LAYOUT, // Default category
            description: `Auto-discovered component: ${componentName}`,
            version: '1.0.0'
          },
          propSchema: {},
          jsonSchema: { type: 'object', properties: {}, additionalProperties: false },
          dependencies: []
        };

        this.register(componentName, entry);
      } catch (error) {
        this.log('warn', `Failed to auto-register component ${componentName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
    this.log('info', 'Registry cleared');
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalComponents: number;
    categoryCounts: Record<ComponentCategory, number>;
    deprecatedCount: number;
    experimentalCount: number;
  } {
    const stats = {
      totalComponents: this.components.size,
      categoryCounts: {} as Record<ComponentCategory, number>,
      deprecatedCount: 0,
      experimentalCount: 0
    };

    // Initialize category counts
    for (const category of Object.values(ComponentCategory)) {
      stats.categoryCounts[category] = 0;
    }

    // Count components by category and flags
    for (const entry of this.components.values()) {
      stats.categoryCounts[entry.metadata.category]++;
      
      if (entry.metadata.deprecated) {
        stats.deprecatedCount++;
      }
      
      if (entry.metadata.experimental) {
        stats.experimentalCount++;
      }
    }

    return stats;
  }

  /**
   * Export registry as JSON
   */
  export(): string {
    const components = this.getAll();
    const exportableComponents: Record<string, Omit<ComponentRegistryEntry, 'component'> & { component: string }> = {};
    
    // Convert components to exportable format (excluding actual component functions)
    for (const [name, entry] of Object.entries(components)) {
      exportableComponents[name] = {
        ...entry,
        component: '[Function]' // Placeholder for function
      };
    }

    const exportData = {
      config: this.config,
      components: exportableComponents,
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import registry from JSON
   */
  import(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.components) {
        // Temporarily disable validation for import since component functions are placeholders
        const originalAutoValidation = this.config.autoValidation;
        this.config.autoValidation = false;
        
        // Convert imported components back to registry entries with placeholder functions
        const importableComponents: Record<string, ComponentRegistryEntry> = {};
        for (const [name, entry] of Object.entries(data.components)) {
          importableComponents[name] = {
            ...(entry as any),
            component: () => null as any // Placeholder function
          };
        }
        
        this.registerBulk(importableComponents);
        
        // Restore original validation setting
        this.config.autoValidation = originalAutoValidation;
      }
      
      this.log('info', `Imported ${Object.keys(data.components || {}).length} components`);
    } catch (error) {
      throw new Error(`Failed to import registry: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract component name from filename
   */
  private extractComponentName(filename: string): string | null {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.(tsx?|jsx?)$/, '');
    
    // Check if it looks like a component (starts with uppercase)
    if (/^[A-Z][a-zA-Z0-9]*$/.test(nameWithoutExt)) {
      return nameWithoutExt;
    }
    
    return null;
  }

  /**
   * Internal logging method
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const levels = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
    const currentLevel = levels[this.config.logLevel || 'warn'];
    const messageLevel = levels[level];

    if (messageLevel <= currentLevel) {
      console[level](`[ComponentRegistry] ${message}`);
    }
  }
}

/**
 * Default component registry instance
 */
export const defaultRegistry = new ComponentRegistry();

/**
 * Create a new component registry with custom configuration
 */
export function createRegistry(config?: RegistryConfig): ComponentRegistry {
  return new ComponentRegistry(config);
}

/**
 * Helper function to register a component with the default registry
 */
export function registerComponent(name: string, entry: ComponentRegistryEntry): void {
  defaultRegistry.register(name, entry);
}

/**
 * Helper function to get a component from the default registry
 */
export function getComponent(name: string): ComponentRegistryEntry | undefined {
  return defaultRegistry.get(name);
}

/**
 * Helper function to validate props with the default registry
 */
export function validateComponentProps(
  componentName: string, 
  props: Record<string, unknown>
): ValidationResult {
  return defaultRegistry.validateProps(componentName, props);
}