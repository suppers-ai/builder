// Component import generation for Fresh 2.0 islands
import { 
  type ComponentDefinition,
  type ComponentRegistry as ComponentRegistryType
} from "../../shared/src/types.ts";
import { ComponentResolver } from "./component-resolver.ts";
import { logger } from "../../shared/src/utils.ts";

/**
 * Options for import generation
 */
export interface ImportGenerationOptions {
  /** Whether to use relative imports (default: true) */
  useRelativeImports?: boolean;
  /** Base path for imports (default: '@/') */
  importBasePath?: string;
  /** Whether to include island imports (default: true) */
  includeIslands?: boolean;
  /** Whether to include component dependencies (default: true) */
  includeDependencies?: boolean;
}

/**
 * Result of import generation
 */
export interface ImportGenerationResult {
  /** Import statements */
  imports: string[];
  /** Island imports for Fresh 2.0 */
  islandImports: string[];
  /** Component types used */
  componentTypes: string[];
  /** Whether the generation was successful */
  success: boolean;
  /** Any errors that occurred during generation */
  errors: string[];
}

/**
 * Component import generator for Fresh 2.0 islands
 */
export class ComponentImportGenerator {
  private resolver: ComponentResolver;
  
  /**
   * Create a new component import generator
   * 
   * @param registry Component registry or resolver
   */
  constructor(registryOrResolver: ComponentRegistryType | ComponentResolver) {
    if (registryOrResolver instanceof ComponentResolver) {
      this.resolver = registryOrResolver;
    } else {
      this.resolver = new ComponentResolver(registryOrResolver);
    }
  }
  
  /**
   * Generate import statements for components in a definition
   * 
   * @param definition Component definition or array of definitions
   * @param options Import generation options
   * @returns Import generation result
   */
  generateImports(
    definition: ComponentDefinition | ComponentDefinition[],
    options: ImportGenerationOptions = {}
  ): ImportGenerationResult {
    const {
      useRelativeImports = true,
      importBasePath = '@/',
      includeIslands = true,
      includeDependencies = true
    } = options;
    
    const errors: string[] = [];
    const componentTypes = new Set<string>();
    
    try {
      // Extract all component types from the definition(s)
      if (Array.isArray(definition)) {
        this.extractComponentTypes(definition, componentTypes);
      } else {
        this.extractComponentTypes([definition], componentTypes);
      }
      
      // Generate imports using the resolver
      const imports = this.resolver.generateImportStatements(Array.from(componentTypes));
      
      // Modify import paths based on options
      const processedImports = imports.map(imp => {
        if (!useRelativeImports) {
          // Replace relative paths with absolute paths
          return imp.replace(/from "\.\.\//, `from "${importBasePath}`);
        }
        return imp;
      });
      
      // Generate island imports for Fresh 2.0
      const islandImports = this.generateIslandImports(Array.from(componentTypes), includeIslands);
      
      return {
        imports: processedImports,
        islandImports,
        componentTypes: Array.from(componentTypes),
        success: true,
        errors
      };
    } catch (error) {
      const errorMessage = `Failed to generate imports: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      errors.push(errorMessage);
      
      return {
        imports: [],
        islandImports: [],
        componentTypes: Array.from(componentTypes),
        success: false,
        errors
      };
    }
  }
  
  /**
   * Generate Fresh 2.0 island imports
   * 
   * @param componentTypes Component types
   * @param includeIslands Whether to include island imports
   * @returns Island import statements
   */
  private generateIslandImports(componentTypes: string[], includeIslands: boolean): string[] {
    if (!includeIslands) {
      return [];
    }
    
    // Get imports from resolver
    const imports = this.resolver.generateImports(componentTypes);
    
    // Filter for island components
    const islandImports = imports.filter(imp => imp.isIsland);
    
    // Generate Fresh 2.0 island import statements
    return islandImports.map(imp => {
      return `import "${imp.path}";`;
    });
  }
  
  /**
   * Extract all component types from definitions recursively
   * 
   * @param definitions Component definitions
   * @param componentTypes Set to collect component types
   */
  private extractComponentTypes(
    definitions: ComponentDefinition[],
    componentTypes: Set<string>
  ): void {
    for (const def of definitions) {
      // Add the component type
      componentTypes.add(def.type);
      
      // Process children recursively
      if (def.children && def.children.length > 0) {
        this.extractComponentTypes(def.children, componentTypes);
      }
    }
  }
  
  /**
   * Generate component prop mapping code
   * 
   * @param definition Component definition
   * @returns JavaScript code for prop mapping
   */
  generatePropMapping(definition: ComponentDefinition): string {
    const { id, type, props } = definition;
    
    // Start with component ID and type
    let code = `const ${id}Props = {\n`;
    
    // Add props
    for (const [key, value] of Object.entries(props)) {
      code += `  ${key}: ${this.stringifyPropValue(value)},\n`;
    }
    
    code += '};\n\n';
    
    return code;
  }
  
  /**
   * Convert a prop value to a string representation for JavaScript
   * 
   * @param value Prop value
   * @returns String representation of the value
   */
  private stringifyPropValue(value: unknown): string {
    if (value === undefined || value === null) {
      return 'undefined';
    }
    
    if (typeof value === 'string') {
      // Check if it's a reference to a variable
      if (value.startsWith('$') && /^\$[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
        return value.substring(1); // Remove $ prefix for variable references
      }
      return JSON.stringify(value);
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    if (Array.isArray(value)) {
      return `[${value.map(item => this.stringifyPropValue(item)).join(', ')}]`;
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  }
}

/**
 * Create a component import generator with the given registry or resolver
 * 
 * @param registryOrResolver Component registry or resolver
 * @returns Component import generator instance
 */
export function createImportGenerator(
  registryOrResolver: ComponentRegistryType | ComponentResolver
): ComponentImportGenerator {
  return new ComponentImportGenerator(registryOrResolver);
}