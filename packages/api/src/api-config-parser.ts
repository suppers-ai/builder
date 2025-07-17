// API configuration parser for JSON App Compiler
// Parses API endpoint configurations from JSON and validates them

import type { 
  ApiDefinition, 
  ApiEndpoint, 
  ValidationSchema,
  CompilationError
} from "@json-app-compiler/shared";
import { 
  validator, 
  ValidationSeverity,
  HttpMethod,
  HttpStatus
} from "@json-app-compiler/shared";

// API configuration parsing options
export interface ApiConfigParsingOptions {
  strict?: boolean;
  basePath?: string;
  defaultMiddleware?: string[];
}

// Parsed API configuration result
export interface ParsedApiConfig {
  endpoints: ApiEndpoint[];
  globalMiddleware: string[];
  authConfig?: unknown;
  corsConfig?: unknown;
  errors: CompilationError[];
  warnings: CompilationError[];
}

/**
 * Parse and validate API configuration from JSON
 */
export function parseApiConfig(
  config: unknown,
  options: ApiConfigParsingOptions = {}
): ParsedApiConfig {
  const {
    strict = true,
    basePath = '',
    defaultMiddleware = [],
  } = options;

  const result: ParsedApiConfig = {
    endpoints: [],
    globalMiddleware: [...defaultMiddleware],
    errors: [],
    warnings: [],
  };

  // Validate the API configuration against the schema
  const validationResult = validator.validate(config, 'apiDefinition', strict);
  
  // Add warnings if there are any
  result.warnings = validationResult.warnings.map(warning => ({
    type: 'validation',
    message: `API configuration warning: ${warning.message}`,
    details: warning.path ? `At path: ${warning.path}` : undefined,
    location: warning.path ? {
      path: warning.path,
    } : undefined,
    suggestions: warning.suggestions,
  }));
  
  if (!validationResult.valid) {
    if (strict) {
      // In strict mode, validation errors are fatal
      result.errors = validationResult.errors.map(error => ({
        type: 'validation',
        message: `API configuration validation error: ${error.message}`,
        details: error.path ? `At path: ${error.path}` : undefined,
        location: error.path ? {
          path: error.path,
        } : undefined,
        suggestions: error.suggestions,
      }));
      
      return result;
    } else {
      // In non-strict mode, validation errors become warnings
      result.warnings.push(...validationResult.errors.map(error => ({
        type: 'validation' as const,
        message: `API configuration warning (non-strict mode): ${error.message}`,
        details: error.path ? `At path: ${error.path}` : undefined,
        location: error.path ? {
          path: error.path,
        } : undefined,
        suggestions: error.suggestions,
      })));
    }
  }

  try {
    const apiConfig = config as ApiDefinition;
    
    // Process endpoints
    if (Array.isArray(apiConfig.endpoints)) {
      result.endpoints = apiConfig.endpoints.map(endpoint => {
        // Apply base path if provided
        const path = basePath && !endpoint.path.startsWith(basePath)
          ? `${basePath}${endpoint.path}`.replace(/\/+/g, '/')
          : endpoint.path;
        
        return {
          ...endpoint,
          path,
          // Ensure middleware is an array
          middleware: endpoint.middleware || [],
        };
      });
    }
    
    // Process global middleware
    if (Array.isArray(apiConfig.middleware)) {
      // Sort middleware by order if specified
      const sortedMiddleware = [...apiConfig.middleware].sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        return orderA - orderB;
      });
      
      // Add middleware names to the global middleware list
      sortedMiddleware.forEach(middleware => {
        if (middleware.name && !result.globalMiddleware.includes(middleware.name)) {
          result.globalMiddleware.push(middleware.name);
        }
      });
    }
    
    // Process auth configuration
    if (apiConfig.auth) {
      result.authConfig = apiConfig.auth;
    }
    
    // Process CORS configuration
    if (apiConfig.cors) {
      result.corsConfig = apiConfig.cors;
    }
  } catch (error) {
    result.errors.push({
      type: 'validation',
      message: 'Failed to parse API configuration',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
  
  return result;
}

/**
 * Validate an API endpoint configuration
 */
export function validateApiEndpoint(endpoint: ApiEndpoint): CompilationError[] {
  const errors: CompilationError[] = [];
  
  // Validate path format
  if (!endpoint.path.startsWith('/')) {
    errors.push({
      type: 'validation',
      message: 'API endpoint path must start with a forward slash',
      details: `Invalid path: ${endpoint.path}`,
      suggestions: [`/${endpoint.path}`],
    });
  }
  
  // Validate methods
  if (!Array.isArray(endpoint.methods) || endpoint.methods.length === 0) {
    errors.push({
      type: 'validation',
      message: 'API endpoint must have at least one HTTP method',
      details: `No methods defined for endpoint: ${endpoint.path}`,
      suggestions: ['GET', 'POST', 'PUT', 'DELETE'],
    });
  } else {
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    const invalidMethods = endpoint.methods.filter(method => !validMethods.includes(method));
    
    if (invalidMethods.length > 0) {
      errors.push({
        type: 'validation',
        message: 'API endpoint contains invalid HTTP methods',
        details: `Invalid methods for endpoint ${endpoint.path}: ${invalidMethods.join(', ')}`,
        suggestions: validMethods,
      });
    }
  }
  
  // Validate handler
  if (!endpoint.handler) {
    errors.push({
      type: 'validation',
      message: 'API endpoint must have a handler',
      details: `No handler defined for endpoint: ${endpoint.path}`,
    });
  }
  
  // Validate validation schema if present
  if (endpoint.validation) {
    const validationErrors = validateEndpointSchema(endpoint.validation);
    errors.push(...validationErrors);
  }
  
  return errors;
}

/**
 * Validate an endpoint validation schema
 */
function validateEndpointSchema(schema: ValidationSchema): CompilationError[] {
  const errors: CompilationError[] = [];
  
  // Validate schema sections
  const sections = ['body', 'query', 'params', 'headers'];
  
  for (const section of sections) {
    const sectionSchema = schema[section as keyof ValidationSchema];
    
    if (sectionSchema) {
      // Check that each field has a valid type
      const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
      
      for (const [field, fieldSchema] of Object.entries(sectionSchema)) {
        if (!fieldSchema.type) {
          errors.push({
            type: 'validation',
            message: `Field ${field} in ${section} schema is missing a type`,
            details: `Each field in validation schema must have a type`,
            suggestions: validTypes,
          });
        } else if (!validTypes.includes(fieldSchema.type)) {
          errors.push({
            type: 'validation',
            message: `Field ${field} in ${section} schema has invalid type: ${fieldSchema.type}`,
            details: `Valid types are: ${validTypes.join(', ')}`,
            suggestions: validTypes,
          });
        }
      }
    }
  }
  
  return errors;
}