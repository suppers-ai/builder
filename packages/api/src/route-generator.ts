// API route generator for Fresh 2.0
// Creates route handlers based on JSON specifications

import type { ApiEndpoint, ValidationSchema, ApiDefinition } from "@json-app-compiler/shared";
import { HttpMethod, HttpStatus } from "@json-app-compiler/shared";
import { 
  createCrudHandler, 
  type CrudConfig,
  type ApiHandler,
  type CrudOperation,
  type ApiResponse
} from "./handlers.ts";
import { 
  createValidationMiddleware, 
  createCorsMiddleware, 
  createRateLimitMiddleware 
} from "./middleware.ts";
import { parseApiConfig, type ParsedApiConfig } from "./api-config-parser.ts";

// Route handler generation options
export interface RouteGenerationOptions {
  basePath?: string;
  defaultMiddleware?: string[];
  enableValidation?: boolean;
  enableErrorHandling?: boolean;
  enableAuthentication?: boolean;
}

// Generated route handler
export interface GeneratedRouteHandler {
  handler: ApiHandler;
  methods: HttpMethod[];
  path: string;
  middleware: string[];
  originalPath: string;
  freshPath: string;
}

// Route generation result
export interface RouteGenerationResult {
  handlers: Record<string, GeneratedRouteHandler>;
  errors: string[];
  warnings: string[];
}

/**
 * Generate a Fresh 2.0 route handler from an API endpoint specification
 */
export function generateRouteHandler(
  endpoint: ApiEndpoint,
  options: RouteGenerationOptions = {}
): GeneratedRouteHandler {
  const {
    basePath = '',
    defaultMiddleware = [],
    enableValidation = true,
    enableErrorHandling = true,
    enableAuthentication = false,
  } = options;

  // Determine if this is a CRUD endpoint based on naming conventions and methods
  const isCrudEndpoint = isCrudPattern(endpoint);
  const fullPath = `${basePath}${endpoint.path}`.replace(/\/+/g, '/');
  const freshPath = normalizeRoutePath(fullPath);
  
  // Combine middleware
  const middleware = [
    ...defaultMiddleware,
    ...(endpoint.middleware || []),
  ];

  // Create the handler
  let handler: ApiHandler;
  
  if (isCrudEndpoint) {
    // Create a CRUD handler
    const resource = extractResourceName(endpoint.path);
    const crudConfig: CrudConfig = {
      resource,
      operations: mapMethodsToCrudOperations(endpoint.methods),
      validation: endpoint.validation,
      middleware: endpoint.middleware,
    };
    
    const crudHandler = createCrudHandler(crudConfig);
    handler = (req, ctx) => crudHandler.handle(req, ctx);
  } else {
    // For non-CRUD endpoints, we'll need to use a custom handler
    // This would typically be implemented by the developer
    handler = createPlaceholderHandler(endpoint);
  }

  // Build middleware chain in reverse order (last middleware applied first)
  // This ensures that middleware executes in the correct order

  // Add authentication middleware if enabled and auth config exists
  if (enableAuthentication && endpoint.auth) {
    const originalHandler = handler;
    handler = async (req, ctx) => {
      // Check if authentication is required
      if (endpoint.auth?.required) {
        // Authentication check would be implemented here
        // For now, we'll just check for an Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          return new Response(JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
            meta: {
              timestamp: new Date().toISOString(),
            },
          }), {
            status: HttpStatus.UNAUTHORIZED,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
        
        // Check roles if specified
        if (endpoint.auth.roles && endpoint.auth.roles.length > 0) {
          // Role checking would be implemented here
          // For now, we'll just log the required roles
          console.log(`Required roles: ${endpoint.auth.roles.join(', ')}`);
        }
      }
      
      return await originalHandler(req, ctx);
    };
  }

  // Add validation middleware if enabled and validation schema exists
  if (enableValidation && endpoint.validation) {
    const originalHandler = handler;
    handler = async (req, ctx) => {
      const validationMiddleware = createValidationMiddleware({
        schema: endpoint.validation!,
      });
      
      const validationResult = await validationMiddleware(req, ctx);
      if (validationResult.status !== 200) {
        return validationResult;
      }
      
      return await originalHandler(req, ctx);
    };
  }

  // Add error handling if enabled
  if (enableErrorHandling) {
    const originalHandler = handler;
    handler = async (req, ctx) => {
      try {
        return await originalHandler(req, ctx);
      } catch (error) {
        console.error(`API Error [${endpoint.path}]:`, error);
        return createErrorResponse(error);
      }
    };
  }

  return {
    handler,
    methods: endpoint.methods,
    path: fullPath,
    middleware,
    originalPath: endpoint.path,
    freshPath,
  };
}

/**
 * Generate multiple route handlers from API endpoints
 */
export function generateRouteHandlers(
  endpoints: ApiEndpoint[],
  options: RouteGenerationOptions = {}
): Record<string, GeneratedRouteHandler> {
  const handlers: Record<string, GeneratedRouteHandler> = {};
  
  for (const endpoint of endpoints) {
    const routeHandler = generateRouteHandler(endpoint, options);
    handlers[routeHandler.freshPath] = routeHandler;
  }
  
  return handlers;
}

/**
 * Generate route handlers from an API definition
 */
export function generateApiRoutes(
  apiConfig: ApiDefinition | unknown,
  options: RouteGenerationOptions = {}
): RouteGenerationResult {
  const result: RouteGenerationResult = {
    handlers: {},
    errors: [],
    warnings: [],
  };
  
  // For testing purposes, if apiConfig is already an ApiDefinition with endpoints
  if (apiConfig && typeof apiConfig === 'object' && 'endpoints' in apiConfig && Array.isArray(apiConfig.endpoints)) {
    try {
      result.handlers = generateRouteHandlers(apiConfig.endpoints as ApiEndpoint[], options);
      return result;
    } catch (error) {
      result.errors.push(`Failed to generate route handlers: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }
  
  // Parse the API configuration
  const parsedConfig = parseApiConfig(apiConfig, {
    basePath: options.basePath,
    defaultMiddleware: options.defaultMiddleware,
  });
  
  // Add any parsing errors and warnings
  result.errors = parsedConfig.errors.map(error => error.message);
  result.warnings = parsedConfig.warnings.map(warning => warning.message);
  
  // If there are errors, return early
  if (parsedConfig.errors.length > 0) {
    return result;
  }
  
  // Update options with global middleware from the parsed config
  const updatedOptions: RouteGenerationOptions = {
    ...options,
    defaultMiddleware: parsedConfig.globalMiddleware,
  };
  
  // Generate route handlers for each endpoint
  try {
    result.handlers = generateRouteHandlers(parsedConfig.endpoints, updatedOptions);
  } catch (error) {
    result.errors.push(`Failed to generate route handlers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return result;
}

/**
 * Create middleware chain for an API endpoint
 */
export function createMiddlewareChain(
  endpoint: ApiEndpoint,
  globalMiddleware: string[] = [],
  authConfig?: Record<string, unknown>,
  corsConfig?: Record<string, unknown>
): ApiHandler {
  // Start with the base handler
  let handler: ApiHandler;
  
  // Determine if this is a CRUD endpoint
  const isCrudEndpoint = isCrudPattern(endpoint);
  
  if (isCrudEndpoint) {
    // Create a CRUD handler
    const resource = extractResourceName(endpoint.path);
    const crudConfig: CrudConfig = {
      resource,
      operations: mapMethodsToCrudOperations(endpoint.methods),
      validation: endpoint.validation,
      middleware: endpoint.middleware,
    };
    
    const crudHandler = createCrudHandler(crudConfig);
    handler = (req, ctx) => crudHandler.handle(req, ctx);
  } else {
    // For non-CRUD endpoints, use a placeholder handler
    handler = createPlaceholderHandler(endpoint);
  }
  
  // Build middleware chain in reverse order (last middleware applied first)
  
  // Add endpoint-specific middleware
  if (endpoint.middleware && endpoint.middleware.length > 0) {
    for (let i = endpoint.middleware.length - 1; i >= 0; i--) {
      const middlewareName = endpoint.middleware[i];
      const originalHandler = handler;
      
      // Apply middleware based on name
      switch (middlewareName) {
        case 'validation':
          if (endpoint.validation) {
            handler = async (req, ctx) => {
              const validationMiddleware = createValidationMiddleware({
                schema: endpoint.validation!,
              });
              
              const validationResult = await validationMiddleware(req, ctx);
              if (validationResult.status !== 200) {
                return validationResult;
              }
              
              return await originalHandler(req, ctx);
            };
          }
          break;
          
        case 'auth':
          if (endpoint.auth?.required) {
            handler = async (req, ctx) => {
              // Authentication check
              const authHeader = req.headers.get('Authorization');
              if (!authHeader) {
                return new Response(JSON.stringify({
                  success: false,
                  error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                  },
                  meta: {
                    timestamp: new Date().toISOString(),
                  },
                }), {
                  status: HttpStatus.UNAUTHORIZED,
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
              }
              
              return await originalHandler(req, ctx);
            };
          }
          break;
          
        case 'cors':
          handler = async (req, ctx) => {
            const corsMiddleware = createCorsMiddleware(corsConfig);
            ctx.next = () => originalHandler(req, ctx);
            return await corsMiddleware(req, ctx);
          };
          break;
          
        case 'rateLimit':
          handler = async (req, ctx) => {
            const rateLimitMiddleware = createRateLimitMiddleware();
            ctx.next = () => originalHandler(req, ctx);
            return await rateLimitMiddleware(req, ctx);
          };
          break;
          
        default:
          // For custom middleware, we'll just log and continue
          console.log(`Custom middleware: ${middlewareName}`);
          break;
      }
    }
  }
  
  // Add global middleware
  for (let i = globalMiddleware.length - 1; i >= 0; i--) {
    const middlewareName = globalMiddleware[i];
    const originalHandler = handler;
    
    // Apply global middleware based on name
    switch (middlewareName) {
      case 'cors':
        handler = async (req, ctx) => {
          const corsMiddleware = createCorsMiddleware(corsConfig);
          ctx.next = () => originalHandler(req, ctx);
          return await corsMiddleware(req, ctx);
        };
        break;
        
      case 'rateLimit':
        handler = async (req, ctx) => {
          const rateLimitMiddleware = createRateLimitMiddleware();
          ctx.next = () => originalHandler(req, ctx);
          return await rateLimitMiddleware(req, ctx);
        };
        break;
        
      default:
        // For custom middleware, we'll just log and continue
        console.log(`Custom global middleware: ${middlewareName}`);
        break;
    }
  }
  
  // Add error handling as the outermost middleware
  const finalHandler = handler;
  handler = async (req, ctx) => {
    try {
      return await finalHandler(req, ctx);
    } catch (error) {
      console.error(`API Error [${endpoint.path}]:`, error);
      return createErrorResponse(error);
    }
  };
  
  return handler;
}

/**
 * Check if an endpoint follows CRUD patterns
 */
function isCrudPattern(endpoint: ApiEndpoint): boolean {
  // Check if the endpoint path follows RESTful patterns
  // e.g., /users, /users/:id, /posts, /posts/:id
  const pathPattern = /^\/[a-zA-Z0-9-_]+(\/:id)?$/;
  
  // Check if methods include standard CRUD operations
  const hasCrudMethods = endpoint.methods.some(method => 
    ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
  );
  
  return pathPattern.test(endpoint.path) && hasCrudMethods;
}

/**
 * Extract resource name from path
 */
function extractResourceName(path: string): string {
  // Remove leading slash and any parameters
  const cleanPath = path.replace(/^\//, '').split('/')[0];
  return cleanPath;
}

/**
 * Map HTTP methods to CRUD operations
 */
function mapMethodsToCrudOperations(methods: HttpMethod[]): CrudOperation[] {
  const operationMap: Record<HttpMethod, CrudOperation[]> = {
    'GET': ['read', 'list'],
    'POST': ['create'],
    'PUT': ['update'],
    'PATCH': ['update'],
    'DELETE': ['delete'],
    'HEAD': [],
    'OPTIONS': [],
  } as Record<HttpMethod, CrudOperation[]>;
  
  return methods.flatMap(method => operationMap[method]);
}

/**
 * Create a placeholder handler for non-CRUD endpoints
 */
function createPlaceholderHandler(endpoint: ApiEndpoint): ApiHandler {
  return async (req, ctx) => {
    const method = req.method as HttpMethod;
    
    // Return a placeholder response
    return new Response(JSON.stringify({
      success: true,
      data: {
        message: `Handler for ${endpoint.path} with method ${method} not implemented`,
        endpoint: endpoint.path,
        method,
        handler: endpoint.handler,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
}

/**
 * Create an error response
 */
function createErrorResponse(error: unknown): Response {
  return new Response(JSON.stringify({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
      details: error instanceof Error ? error.message : 'Unknown error',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Normalize route path for Fresh 2.0 conventions
 */
function normalizeRoutePath(path: string): string {
  // Convert Express-style paths (/users/:id) to Fresh 2.0 style (/users/[id])
  return path.replace(/:([a-zA-Z0-9_]+)/g, '[$1]');
}