// Diagnostic tools for analyzing JSON configurations and troubleshooting compilation issues
import { 
  AppConfig, 
  CompilationError, 
  ComponentDefinition, 
  RouteDefinition,
  ApiEndpoint,
  ComponentRegistry,
  ErrorSeverity
} from "../../shared/src/types.ts";
import { 
  CompilerError, 
  ValidationError, 
  ComponentError, 
  DependencyError,
  TemplateError,
  RouteError,
  ApiError,
  ConfigurationError,
  errorLogger
} from "../../shared/src/errors.ts";
import { LogLevel, RESERVED_COMPONENT_NAMES, RESERVED_ROUTE_PATHS } from "../../shared/src/enums.ts";
import { fileManager } from "./file-manager.ts";

/**
 * Options for diagnostic analysis
 */
export interface DiagnosticOptions {
  /** Whether to check for component availability */
  checkComponents?: boolean;
  /** Whether to check for template availability */
  checkTemplates?: boolean;
  /** Whether to check for route conflicts */
  checkRoutes?: boolean;
  /** Whether to check for API endpoint conflicts */
  checkApiEndpoints?: boolean;
  /** Whether to check for performance issues */
  checkPerformance?: boolean;
  /** Whether to check for security issues */
  checkSecurity?: boolean;
  /** Whether to check for best practices */
  checkBestPractices?: boolean;
  /** Log level for diagnostic output */
  logLevel?: LogLevel;
}

/**
 * Result of a diagnostic analysis
 */
export interface DiagnosticResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** Any errors found during analysis */
  errors: CompilationError[];
  /** Any warnings found during analysis */
  warnings: string[];
  /** Suggestions for improving the configuration */
  suggestions: string[];
  /** Performance metrics */
  performance?: {
    componentCount: number;
    routeCount: number;
    apiEndpointCount: number;
    estimatedCompilationTime: number;
  };
}

/**
 * Diagnostic tool for analyzing JSON configurations
 */
export class DiagnosticTool {
  private componentRegistry: ComponentRegistry;
  private templateDir: string;
  private logLevel: LogLevel;
  
  constructor(componentRegistry: ComponentRegistry, templateDir: string, logLevel: LogLevel = LogLevel.INFO) {
    this.componentRegistry = componentRegistry;
    this.templateDir = templateDir;
    this.logLevel = logLevel;
    errorLogger.setLogLevel(logLevel);
  }
  
  /**
   * Set the log level for diagnostic output
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    errorLogger.setLogLevel(level);
  }
  
  /**
   * Analyze a configuration for issues
   * 
   * @param config The configuration to analyze
   * @param options Diagnostic options
   * @returns The diagnostic result
   */
  async analyzeConfiguration(config: AppConfig, options: DiagnosticOptions = {}): Promise<DiagnosticResult> {
    const errors: CompilationError[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Start with basic validation
    this.validateBasicStructure(config, errors, warnings, suggestions);
    
    // Check components if requested
    if (options.checkComponents !== false) {
      await this.checkComponentAvailability(config, errors, warnings, suggestions);
    }
    
    // Check templates if requested
    if (options.checkTemplates !== false) {
      await this.checkTemplateAvailability(config, errors, warnings, suggestions);
    }
    
    // Check routes if requested
    if (options.checkRoutes !== false) {
      this.checkRouteConflicts(config, errors, warnings, suggestions);
    }
    
    // Check API endpoints if requested
    if (options.checkApiEndpoints !== false) {
      this.checkApiEndpointConflicts(config, errors, warnings, suggestions);
    }
    
    // Check performance if requested
    let performance;
    if (options.checkPerformance !== false) {
      performance = this.analyzePerformance(config);
    }
    
    // Check security if requested
    if (options.checkSecurity !== false) {
      this.checkSecurityIssues(config, errors, warnings, suggestions);
    }
    
    // Check best practices if requested
    if (options.checkBestPractices !== false) {
      this.checkBestPractices(config, errors, warnings, suggestions);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      performance,
    };
  }
  
  /**
   * Validate the basic structure of the configuration
   */
  private validateBasicStructure(
    config: AppConfig,
    errors: CompilationError[],
    warnings: string[],
    suggestions: string[]
  ): void {
    // Check metadata
    if (!config.metadata) {
      errors.push(new ValidationError("Missing metadata section").toCompilationError());
      suggestions.push("Add a metadata section with name and version");
    } else {
      if (!config.metadata.name) {
        errors.push(new ValidationError("Missing application name in metadata").toCompilationError());
        suggestions.push("Add a name property to the metadata section");
      } else if (!/^[a-z0-9-]+$/.test(config.metadata.name)) {
        warnings.push("Application name should only contain lowercase letters, numbers, and hyphens");
        suggestions.push("Use kebab-case for the application name (e.g., 'my-app')");
      }
      
      if (!config.metadata.version) {
        errors.push(new ValidationError("Missing application version in metadata").toCompilationError());
        suggestions.push("Add a version property to the metadata section (e.g., '1.0.0')");
      } else if (!/^\d+\.\d+\.\d+$/.test(config.metadata.version)) {
        warnings.push("Application version should follow semantic versioning (e.g., '1.0.0')");
      }
    }
    
    // Check components
    if (!config.components || !Array.isArray(config.components)) {
      errors.push(new ValidationError("Missing or invalid components array").toCompilationError());
      suggestions.push("Add a components array to the configuration");
    } else if (config.components.length === 0) {
      warnings.push("Components array is empty");
      suggestions.push("Add at least one component to the components array");
    }
    
    // Check routes
    if (!config.routes || !Array.isArray(config.routes)) {
      errors.push(new ValidationError("Missing or invalid routes array").toCompilationError());
      suggestions.push("Add a routes array to the configuration");
    } else if (config.routes.length === 0) {
      warnings.push("Routes array is empty");
      suggestions.push("Add at least one route to the routes array");
    }
    
    // Check API
    if (!config.api) {
      warnings.push("Missing API configuration");
      suggestions.push("Add an api section with endpoints array");
    } else if (!config.api.endpoints || !Array.isArray(config.api.endpoints)) {
      warnings.push("Missing or invalid API endpoints array");
      suggestions.push("Add an endpoints array to the api section");
    }
  }
  
  /**
   * Check component availability
   */
  private async checkComponentAvailability(
    config: AppConfig,
    errors: CompilationError[],
    warnings: string[],
    suggestions: string[]
  ): Promise<void> {
    if (!config.components || !Array.isArray(config.components)) {
      return;
    }
    
    // Check for duplicate component IDs
    const componentIds = new Set<string>();
    const duplicateIds = new Set<string>();
    
    for (const component of config.components) {
      if (componentIds.has(component.id)) {
        duplicateIds.add(component.id);
      } else {
        componentIds.add(component.id);
      }
    }
    
    for (const id of duplicateIds) {
      errors.push(new ComponentError(`Duplicate component ID: ${id}`, {
        code: 'DUPLICATE_COMPONENT_ID',
        recoverable: false,
      }).toCompilationError());
    }
    
    // Check for reserved component names
    for (const component of config.components) {
      if (RESERVED_COMPONENT_NAMES.includes(component.type as any)) {
        errors.push(new ComponentError(`Component type '${component.type}' is a reserved name`, {
          code: 'RESERVED_COMPONENT_NAME',
          recoverable: true,
          suggestions: ["Choose a different component type name"],
        }).toCompilationError());
      }
    }
    
    // Check if component types exist in registry
    for (const component of config.components) {
      if (!this.componentRegistry[component.type]) {
        errors.push(new ComponentError(`Component type '${component.type}' not found in registry`, {
          code: 'COMPONENT_NOT_FOUND',
          recoverable: true,
          suggestions: [
            `Check for typos in component type '${component.type}'`,
            `Available component types: ${Object.keys(this.componentRegistry).join(', ')}`,
          ],
        }).toCompilationError());
      } else {
        // Check component props against schema
        const registryEntry = this.componentRegistry[component.type];
        if (registryEntry.schema) {
          // This would use the validator to check props against schema
          // For now, just check for required props as an example
          const requiredProps = this.getRequiredProps(registryEntry.schema);
          for (const prop of requiredProps) {
            if (!(prop in component.props)) {
              warnings.push(`Component '${component.id}' of type '${component.type}' is missing required prop '${prop}'`);
              suggestions.push(`Add the required prop '${prop}' to component '${component.id}'`);
            }
          }
        }
      }
    }
    
    // Check for unused components
    const usedComponentIds = new Set<string>();
    
    // Components used in routes
    for (const route of config.routes || []) {
      usedComponentIds.add(route.component);
      if (route.layout) {
        usedComponentIds.add(route.layout);
      }
    }
    
    // Components used as children of other components
    const findChildComponents = (component: ComponentDefinition): void => {
      if (component.children && Array.isArray(component.children)) {
        for (const child of component.children) {
          usedComponentIds.add(child.id);
          findChildComponents(child);
        }
      }
    };
    
    for (const component of config.components) {
      findChildComponents(component);
    }
    
    // Find unused components
    for (const component of config.components) {
      if (!usedComponentIds.has(component.id)) {
        warnings.push(`Component '${component.id}' is not used anywhere in the configuration`);
        suggestions.push(`Either use component '${component.id}' in a route or as a child of another component, or remove it`);
      }
    }
  }
  
  /**
   * Check template availability
   */
  private async checkTemplateAvailability(
    config: AppConfig,
    errors: CompilationError[],
    warnings: string[],
    suggestions: string[]
  ): Promise<void> {
    // Check if template directory exists
    try {
      const templateExists = await fileManager.directoryExists(this.templateDir);
      if (!templateExists) {
        errors.push(new TemplateError(`Template directory not found: ${this.templateDir}`, {
          code: 'TEMPLATE_DIR_NOT_FOUND',
          recoverable: false,
          location: { file: this.templateDir },
          suggestions: [
            `Create the template directory at ${this.templateDir}`,
            `Check the template directory path in your configuration`,
          ],
        }).toCompilationError());
        return;
      }
      
      // Check for required template files
      const requiredFiles = [
        'routes/index.tsx',
        'islands/ErrorBoundary.tsx',
        'main.ts',
        'deno.json',
      ];
      
      for (const file of requiredFiles) {
        const filePath = `${this.templateDir}/${file}`;
        const fileExists = await fileManager.fileExists(filePath);
        if (!fileExists) {
          errors.push(new TemplateError(`Required template file not found: ${file}`, {
            code: 'TEMPLATE_FILE_NOT_FOUND',
            recoverable: true,
            location: { file: filePath },
            suggestions: [
              `Create the missing template file at ${filePath}`,
              `Check the template directory structure`,
            ],
          }).toCompilationError());
        }
      }
    } catch (error) {
      errors.push(new TemplateError(`Error checking template availability: ${error instanceof Error ? error.message : String(error)}`, {
        code: 'TEMPLATE_CHECK_ERROR',
        recoverable: false,
      }).toCompilationError());
    }
  }
  
  /**
   * Check for route conflicts
   */
  private checkRouteConflicts(
    config: AppConfig,
    errors: CompilationError[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!config.routes || !Array.isArray(config.routes)) {
      return;
    }
    
    // Check for duplicate route paths
    const routePaths = new Map<string, RouteDefinition>();
    const duplicatePaths = new Set<string>();
    
    for (const route of config.routes) {
      if (routePaths.has(route.path)) {
        duplicatePaths.add(route.path);
      } else {
        routePaths.set(route.path, route);
      }
    }
    
    for (const path of duplicatePaths) {
      errors.push(new ValidationError(`Duplicate route path: ${path}`, {
        code: 'DUPLICATE_ROUTE_PATH',
        recoverable: false,
        suggestions: ["Each route path must be unique"],
      }).toCompilationError());
    }
    
    // Check for reserved route paths
    for (const route of config.routes) {
      if (RESERVED_ROUTE_PATHS.some(reserved => route.path.startsWith(reserved))) {
        errors.push(new ValidationError(`Route path '${route.path}' uses a reserved prefix`, {
          code: 'RESERVED_ROUTE_PATH',
          recoverable: true,
          suggestions: [
            `Choose a different route path that doesn't start with a reserved prefix`,
            `Reserved prefixes: ${RESERVED_ROUTE_PATHS.join(', ')}`,
          ],
        }).toCompilationError());
      }
    }
    
    // Check for route components that don't exist
    for (const route of config.routes) {
      const component = config.components?.find(c => c.id === route.component);
      if (!component) {
        errors.push(new ComponentError(`Component '${route.component}' referenced in route '${route.path}' not found`, {
          code: 'ROUTE_COMPONENT_NOT_FOUND',
          recoverable: false,
          suggestions: [
            `Create a component with ID '${route.component}'`,
            `Update the route to use an existing component ID`,
          ],
        }).toCompilationError());
      }
      
      if (route.layout) {
        const layout = config.components?.find(c => c.id === route.layout);
        if (!layout) {
          errors.push(new ComponentError(`Layout component '${route.layout}' referenced in route '${route.path}' not found`, {
            code: 'ROUTE_LAYOUT_NOT_FOUND',
            recoverable: true,
            suggestions: [
              `Create a component with ID '${route.layout}'`,
              `Update the route to use an existing component ID for layout`,
              `Remove the layout property from the route`,
            ],
          }).toCompilationError());
        }
      }
    }
    
    // Check for potential route conflicts (dynamic routes)
    const dynamicRoutes = config.routes.filter(route => route.path.includes(':'));
    const staticRoutes = config.routes.filter(route => !route.path.includes(':'));
    
    for (const dynamicRoute of dynamicRoutes) {
      const dynamicPathParts = dynamicRoute.path.split('/');
      
      for (const staticRoute of staticRoutes) {
        const staticPathParts = staticRoute.path.split('/');
        
        if (dynamicPathParts.length !== staticPathParts.length) {
          continue;
        }
        
        let potentialConflict = true;
        for (let i = 0; i < dynamicPathParts.length; i++) {
          if (!dynamicPathParts[i].startsWith(':') && dynamicPathParts[i] !== staticPathParts[i]) {
            potentialConflict = false;
            break;
          }
        }
        
        if (potentialConflict) {
          warnings.push(`Potential route conflict between dynamic route '${dynamicRoute.path}' and static route '${staticRoute.path}'`);
          suggestions.push(`Ensure that the dynamic route '${dynamicRoute.path}' is defined after the static route '${staticRoute.path}' in the routes array`);
        }
      }
    }
  }
  
  /**
   * Check for API endpoint conflicts
   */
  private checkApiEndpointConflicts(
    config: AppConfig,
    errors: CompilationError[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!config.api || !config.api.endpoints || !Array.isArray(config.api.endpoints)) {
      return;
    }
    
    // Check for duplicate API endpoint paths with same method
    const endpointMap = new Map<string, ApiEndpoint>();
    const duplicateEndpoints = new Set<string>();
    
    for (const endpoint of config.api.endpoints) {
      for (const method of endpoint.methods) {
        const key = `${method}:${endpoint.path}`;
        if (endpointMap.has(key)) {
          duplicateEndpoints.add(key);
        } else {
          endpointMap.set(key, endpoint);
        }
      }
    }
    
    for (const key of duplicateEndpoints) {
      const [method, path] = key.split(':');
      errors.push(new ValidationError(`Duplicate API endpoint: ${method} ${path}`, {
        code: 'DUPLICATE_API_ENDPOINT',
        recoverable: false,
        suggestions: ["Each API endpoint path and method combination must be unique"],
      }).toCompilationError());
    }
    
    // Check for API endpoints with invalid methods
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    for (const endpoint of config.api.endpoints) {
      for (const method of endpoint.methods) {
        if (!validMethods.includes(method)) {
          errors.push(new ValidationError(`Invalid HTTP method '${method}' for API endpoint '${endpoint.path}'`, {
            code: 'INVALID_HTTP_METHOD',
            recoverable: true,
            suggestions: [
              `Use one of the valid HTTP methods: ${validMethods.join(', ')}`,
            ],
          }).toCompilationError());
        }
      }
    }
    
    // Check for API endpoints with no methods
    for (const endpoint of config.api.endpoints) {
      if (!endpoint.methods || endpoint.methods.length === 0) {
        errors.push(new ValidationError(`API endpoint '${endpoint.path}' has no HTTP methods defined`, {
          code: 'NO_HTTP_METHODS',
          recoverable: true,
          suggestions: [
            `Add at least one HTTP method to the endpoint`,
            `Example: "methods": ["GET"]`,
          ],
        }).toCompilationError());
      }
    }
    
    // Check for potential conflicts with dynamic endpoints
    const dynamicEndpoints = config.api.endpoints.filter(endpoint => endpoint.path.includes(':'));
    const staticEndpoints = config.api.endpoints.filter(endpoint => !endpoint.path.includes(':'));
    
    for (const dynamicEndpoint of dynamicEndpoints) {
      const dynamicPathParts = dynamicEndpoint.path.split('/');
      
      for (const staticEndpoint of staticEndpoints) {
        const staticPathParts = staticEndpoint.path.split('/');
        
        if (dynamicPathParts.length !== staticPathParts.length) {
          continue;
        }
        
        let potentialConflict = true;
        for (let i = 0; i < dynamicPathParts.length; i++) {
          if (!dynamicPathParts[i].startsWith(':') && dynamicPathParts[i] !== staticPathParts[i]) {
            potentialConflict = false;
            break;
          }
        }
        
        if (potentialConflict) {
          // Check if they share any methods
          const sharedMethods = dynamicEndpoint.methods.filter(method => 
            staticEndpoint.methods.includes(method)
          );
          
          if (sharedMethods.length > 0) {
            warnings.push(`Potential API endpoint conflict between dynamic endpoint '${dynamicEndpoint.path}' and static endpoint '${staticEndpoint.path}' for methods: ${sharedMethods.join(', ')}`);
            suggestions.push(`Ensure that the dynamic endpoint '${dynamicEndpoint.path}' is defined after the static endpoint '${staticEndpoint.path}' in the endpoints array`);
          }
        }
      }
    }
  }
  
  /**
   * Analyze performance characteristics
   */
  private analyzePerformance(config: AppConfig): DiagnosticResult['performance'] {
    const componentCount = config.components?.length || 0;
    const routeCount = config.routes?.length || 0;
    const apiEndpointCount = config.api?.endpoints?.length || 0;
    
    // Estimate compilation time based on complexity
    // This is a very rough estimate and would need to be calibrated
    const baseTime = 500; // Base compilation time in ms
    const timePerComponent = 50; // ms per component
    const timePerRoute = 30; // ms per route
    const timePerEndpoint = 20; // ms per API endpoint
    
    const estimatedCompilationTime = 
      baseTime + 
      (componentCount * timePerComponent) + 
      (routeCount * timePerRoute) + 
      (apiEndpointCount * timePerEndpoint);
    
    return {
      componentCount,
      routeCount,
      apiEndpointCount,
      estimatedCompilationTime,
    };
  }
  
  /**
   * Check for security issues
   */
  private checkSecurityIssues(
    config: AppConfig,
    errors: CompilationError[],
    warnings: string[],
    suggestions: string[]
  ): void {
    // Check for routes that require authentication
    const authRoutes = config.routes.filter(route => route.meta?.requiresAuth);
    if (authRoutes.length > 0 && (!config.api?.auth || !config.api.auth.provider)) {
      warnings.push("Routes require authentication, but no authentication provider is configured");
      suggestions.push("Configure an authentication provider in the api.auth section");
    }
    
    // Check for API endpoints that require authentication
    const authEndpoints = config.api?.endpoints.filter(endpoint => endpoint.auth?.required) || [];
    if (authEndpoints.length > 0 && (!config.api?.auth || !config.api.auth.provider)) {
      warnings.push("API endpoints require authentication, but no authentication provider is configured");
      suggestions.push("Configure an authentication provider in the api.auth section");
    }
    
    // Check for CORS configuration if API endpoints exist
    if (config.api?.endpoints.length > 0 && !config.api.cors) {
      warnings.push("API endpoints defined without CORS configuration");
      suggestions.push("Add a cors configuration to the api section to control cross-origin requests");
    }
    
    // Check for validation on POST/PUT/PATCH endpoints
    const mutationEndpoints = config.api?.endpoints.filter(endpoint => 
      endpoint.methods.some(method => ['POST', 'PUT', 'PATCH'].includes(method))
    ) || [];
    
    for (const endpoint of mutationEndpoints) {
      if (!endpoint.validation || !endpoint.validation.body) {
        warnings.push(`API endpoint '${endpoint.path}' allows data mutation without body validation`);
        suggestions.push(`Add validation schema to the '${endpoint.path}' endpoint to validate request body`);
      }
    }
  }
  
  /**
   * Check for best practices
   */
  private checkBestPractices(
    config: AppConfig,
    errors: CompilationError[],
    warnings: string[],
    suggestions: string[]
  ): void {
    // Check for descriptive metadata
    if (!config.metadata?.description) {
      warnings.push("Application is missing a description in metadata");
      suggestions.push("Add a description to the metadata section to improve documentation");
    }
    
    // Check for root route
    if (!config.routes.some(route => route.path === '/')) {
      warnings.push("No root route (/) defined");
      suggestions.push("Add a route with path '/' to serve as the application's home page");
    }
    
    // Check for error handling routes
    if (!config.routes.some(route => route.path === '/_404' || route.path === '/404')) {
      warnings.push("No 404 error route defined");
      suggestions.push("Add a route with path '/_404' or '/404' to handle not found errors");
    }
    
    // Check for consistent naming conventions
    const componentTypes = new Set(config.components?.map(c => c.type));
    const pascalCasePattern = /^[A-Z][a-zA-Z0-9]*$/;
    const nonPascalCaseComponents = config.components?.filter(c => !pascalCasePattern.test(c.type)) || [];
    
    if (nonPascalCaseComponents.length > 0) {
      warnings.push("Some component types do not follow PascalCase naming convention");
      suggestions.push("Use PascalCase for all component types (e.g., 'Button', 'UserProfile')");
    }
    
    // Check for theme configuration
    if (!config.theme) {
      warnings.push("No theme configuration defined");
      suggestions.push("Add a theme configuration to customize the application's appearance");
    }
    
    // Check for excessive nesting of components
    const findMaxNestingDepth = (component: ComponentDefinition, depth = 0): number => {
      if (!component.children || component.children.length === 0) {
        return depth;
      }
      
      return Math.max(...component.children.map(child => findMaxNestingDepth(child, depth + 1)));
    };
    
    const maxNestingDepth = Math.max(...(config.components?.map(c => findMaxNestingDepth(c)) || [0]));
    if (maxNestingDepth > 5) {
      warnings.push(`Excessive component nesting detected (depth: ${maxNestingDepth})`);
      suggestions.push("Consider flattening your component hierarchy to improve performance and maintainability");
    }
  }
  
  /**
   * Get required props from a component schema
   */
  private getRequiredProps(schema: Record<string, unknown>): string[] {
    if (typeof schema !== 'object' || schema === null) {
      return [];
    }
    
    // Look for required props in the schema
    if (Array.isArray(schema.required)) {
      return schema.required as string[];
    }
    
    return [];
  }
}

// Export a default instance
export const diagnosticTool = new DiagnosticTool({}, '');