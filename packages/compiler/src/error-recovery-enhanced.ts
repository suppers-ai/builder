// Enhanced error recovery strategies for different types of compilation failures
import { 
  CompilerError, 
  RecoveryStrategy, 
  RecoveryResult,
  errorRecoveryManager,
  ValidationError,
  ComponentError,
  TemplateError,
  RouteError,
  ApiError,
  FileError,
  DependencyError,
  CompilationProcessError,
  ConfigurationError
} from "../../shared/src/errors.ts";
import type { ErrorRecoveryContext, ComponentDefinition, RouteDefinition, ApiEndpoint } from "../../shared/src/types.ts";
import { fileManager } from "./file-manager.ts";
import { LogLevel } from "../../shared/src/enums.ts";

/**
 * Enhanced recovery strategy for partial compilation failures
 */
export const partialCompilationFailureStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Only attempt recovery during generate or integrate phases
    if (recoveryContext.phase !== 'generate' && recoveryContext.phase !== 'integrate') {
      return { success: false };
    }
    
    return {
      success: true,
      message: `Continuing with partial compilation after error: ${error.message}`,
      data: {
        partialCompilation: true,
        skippedItem: error.type === 'component' ? recoveryContext.currentComponent?.id :
                     error.type === 'route' ? recoveryContext.currentRoute?.path :
                     error.type === 'api' ? recoveryContext.currentApiEndpoint?.path :
                     error.type === 'file' ? recoveryContext.currentFile :
                     'unknown'
      },
      partialRecovery: true,
      downgradeToWarning: true,
      metadata: {
        phase: recoveryContext.phase,
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Enhanced recovery strategy for schema validation errors
 */
export const schemaValidationErrorStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Extract the path from the error location
    const path = error.location?.path;
    if (!path) {
      return { success: false };
    }
    
    // Try to determine what kind of schema validation error this is
    const pathParts = path.split('.');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Handle different types of schema validation errors
    if (path.startsWith('components')) {
      // Component validation error
      return handleComponentSchemaError(error, recoveryContext, pathParts, lastPart);
    } else if (path.startsWith('routes')) {
      // Route validation error
      return handleRouteSchemaError(error, recoveryContext, pathParts, lastPart);
    } else if (path.startsWith('api.endpoints')) {
      // API endpoint validation error
      return handleApiSchemaError(error, recoveryContext, pathParts, lastPart);
    } else {
      // General schema validation error
      return {
        success: true,
        message: `Applied default value for invalid schema at path: ${path}`,
        data: {
          path,
          defaultValue: getDefaultValueForType(error.details || 'string')
        },
        downgradeToWarning: true
      };
    }
  }
};

/**
 * Handle component schema validation errors
 */
function handleComponentSchemaError(
  error: CompilerError,
  context: ErrorRecoveryContext,
  pathParts: string[],
  lastPart: string
): RecoveryResult {
  const component = context.currentComponent;
  if (!component) {
    return { success: false };
  }
  
  // Handle different component properties
  if (pathParts.includes('props')) {
    // Prop validation error
    return {
      success: true,
      message: `Applied default value for invalid prop '${lastPart}' in component '${component.id}'`,
      data: {
        component,
        propName: lastPart,
        defaultValue: getDefaultValueForType(error.details || 'string')
      },
      downgradeToWarning: true
    };
  } else if (pathParts.includes('children')) {
    // Children validation error
    return {
      success: true,
      message: `Removed invalid child component in '${component.id}'`,
      data: {
        component,
        removeChild: true,
        childIndex: parseInt(pathParts[pathParts.indexOf('children') + 1], 10)
      },
      downgradeToWarning: true
    };
  } else {
    // Other component property
    return {
      success: true,
      message: `Applied default value for invalid component property '${lastPart}' in '${component.id}'`,
      data: {
        component,
        propertyName: lastPart,
        defaultValue: getDefaultValueForType(error.details || 'string')
      },
      downgradeToWarning: true
    };
  }
}

/**
 * Handle route schema validation errors
 */
function handleRouteSchemaError(
  error: CompilerError,
  context: ErrorRecoveryContext,
  pathParts: string[],
  lastPart: string
): RecoveryResult {
  const route = context.currentRoute;
  if (!route) {
    return { success: false };
  }
  
  // Handle different route properties
  if (lastPart === 'path') {
    // Path validation error
    return {
      success: true,
      message: `Sanitized invalid route path for route to component '${route.component}'`,
      data: {
        route,
        sanitizedPath: '/invalid-path-' + Date.now().toString(36)
      },
      downgradeToWarning: true
    };
  } else if (lastPart === 'component') {
    // Component reference error
    return {
      success: true,
      message: `Using ErrorBoundary component for invalid component reference in route '${route.path}'`,
      data: {
        route,
        fallbackComponent: 'ErrorBoundary'
      },
      downgradeToWarning: true
    };
  } else if (pathParts.includes('meta')) {
    // Meta validation error
    return {
      success: true,
      message: `Applied default value for invalid route metadata '${lastPart}' in route '${route.path}'`,
      data: {
        route,
        metaProperty: lastPart,
        defaultValue: getDefaultValueForType(error.details || 'string')
      },
      downgradeToWarning: true
    };
  } else {
    // Other route property
    return {
      success: true,
      message: `Applied default value for invalid route property '${lastPart}' in route '${route.path}'`,
      data: {
        route,
        propertyName: lastPart,
        defaultValue: getDefaultValueForType(error.details || 'string')
      },
      downgradeToWarning: true
    };
  }
}

/**
 * Handle API endpoint schema validation errors
 */
function handleApiSchemaError(
  error: CompilerError,
  context: ErrorRecoveryContext,
  pathParts: string[],
  lastPart: string
): RecoveryResult {
  const endpoint = context.currentApiEndpoint;
  if (!endpoint) {
    return { success: false };
  }
  
  // Handle different API endpoint properties
  if (lastPart === 'path') {
    // Path validation error
    return {
      success: true,
      message: `Sanitized invalid API endpoint path '${endpoint.path}'`,
      data: {
        endpoint,
        sanitizedPath: '/api/invalid-endpoint-' + Date.now().toString(36)
      },
      downgradeToWarning: true
    };
  } else if (lastPart === 'methods') {
    // Methods validation error
    return {
      success: true,
      message: `Applied default HTTP method for invalid methods in API endpoint '${endpoint.path}'`,
      data: {
        endpoint,
        defaultMethods: ['GET']
      },
      downgradeToWarning: true
    };
  } else if (pathParts.includes('validation')) {
    // Validation schema error
    return {
      success: true,
      message: `Removed invalid validation schema in API endpoint '${endpoint.path}'`,
      data: {
        endpoint,
        removeValidation: true
      },
      downgradeToWarning: true
    };
  } else {
    // Other API endpoint property
    return {
      success: true,
      message: `Applied default value for invalid API endpoint property '${lastPart}' in '${endpoint.path}'`,
      data: {
        endpoint,
        propertyName: lastPart,
        defaultValue: getDefaultValueForType(error.details || 'string')
      },
      downgradeToWarning: true
    };
  }
}

/**
 * Get a default value for a given type
 */
function getDefaultValueForType(type: string): unknown {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

/**
 * Enhanced recovery strategy for missing dependencies
 */
export const missingDependencyEnhancedStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const dependency = error.details || '';
    
    // Check if this is a known dependency type
    if (dependency.includes('component')) {
      return {
        success: true,
        message: `Created mock component implementation for missing dependency: ${dependency}`,
        data: {
          mockComponent: {
            id: `mock_${dependency.replace(/[^a-zA-Z0-9]/g, '_')}`,
            type: 'MockComponent',
            props: {
              originalType: dependency,
              message: `Mock implementation of ${dependency}`,
              showMessage: true
            }
          }
        }
      };
    } else if (dependency.includes('api') || dependency.includes('handler')) {
      return {
        success: true,
        message: `Created mock API handler for missing dependency: ${dependency}`,
        data: {
          mockHandler: {
            name: `mock_${dependency.replace(/[^a-zA-Z0-9]/g, '_')}`,
            code: `// Mock handler for ${dependency}
export function handler(req) {
  return new Response(JSON.stringify({ 
    success: true, 
    message: "Mock implementation", 
    mockFor: "${dependency}" 
  }), {
    headers: { "Content-Type": "application/json" }
  });
}`
          }
        }
      };
    } else if (dependency.includes('template')) {
      return {
        success: true,
        message: `Created mock template for missing dependency: ${dependency}`,
        data: {
          mockTemplate: {
            path: `mock_${dependency.replace(/[^a-zA-Z0-9]/g, '_')}.tsx`,
            content: `// Mock template for ${dependency}
export default function MockTemplate() {
  return (
    <div className="mock-template">
      <h1>Mock Template</h1>
      <p>This is a mock implementation for: ${dependency}</p>
    </div>
  );
}`
          }
        }
      };
    } else {
      // Generic mock implementation
      return {
        success: true,
        message: `Created generic mock implementation for missing dependency: ${dependency}`,
        data: {
          mockImplementation: true,
          dependency,
          mockCode: `// Mock implementation for ${dependency}
export default function mock${dependency.replace(/[^a-zA-Z0-9]/g, '')}() {
  console.warn("Using mock implementation for ${dependency}");
  return null;
}`
        }
      };
    }
  }
};

/**
 * Enhanced recovery strategy for template processing errors
 */
export const templateProcessingEnhancedStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const currentFile = recoveryContext.currentFile;
    
    if (!currentFile) {
      return { success: false };
    }
    
    // Extract the placeholder from the error message if possible
    const placeholderMatch = error.message.match(/\{\{([^}]+)\}\}/);
    const placeholder = placeholderMatch ? placeholderMatch[0] : null;
    
    if (placeholder) {
      return {
        success: true,
        message: `Replaced problematic placeholder ${placeholder} with default value in ${currentFile}`,
        data: {
          file: currentFile,
          placeholder,
          replacement: '/* Placeholder could not be processed */'
        },
        downgradeToWarning: true
      };
    } else {
      return {
        success: true,
        message: `Skipped problematic template processing in ${currentFile}`,
        data: {
          file: currentFile,
          skipProcessing: true
        },
        downgradeToWarning: true
      };
    }
  }
};

/**
 * Enhanced recovery strategy for file system errors
 */
export const fileSystemEnhancedStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const currentFile = recoveryContext.currentFile;
    
    if (!currentFile) {
      return { success: false };
    }
    
    // Determine the type of file system error
    if (error.message.includes('permission') || error.message.includes('access')) {
      // Permission error
      const alternativePath = `${recoveryContext.compilationContext.outputDir}/safe_${currentFile.split('/').pop()}`;
      
      return {
        success: true,
        message: `Using alternative path due to permission error: ${alternativePath}`,
        data: {
          originalFile: currentFile,
          alternativePath
        }
      };
    } else if (error.message.includes('exist')) {
      // File or directory doesn't exist
      return {
        success: true,
        message: `Creating missing directory for file: ${currentFile}`,
        data: {
          createDirectory: true,
          file: currentFile
        }
      };
    } else if (error.message.includes('space') || error.message.includes('quota')) {
      // Disk space or quota issue
      return {
        success: false,
        message: `Cannot recover from disk space or quota issue`,
        alternativeError: new FileError(`Insufficient disk space or quota exceeded: ${error.message}`, {
          recoverable: false,
          code: 'DISK_SPACE_ERROR',
          suggestions: [
            'Free up disk space',
            'Check your quota limits',
            'Use a different output directory with more space'
          ]
        })
      };
    } else {
      // Generic file system error
      const timestamp = Date.now().toString(36);
      const alternativePath = currentFile.replace(/(\.[^.]+)?$/, `.backup_${timestamp}$1`);
      
      return {
        success: true,
        message: `Using alternative path due to file system error: ${alternativePath}`,
        data: {
          originalFile: currentFile,
          alternativePath
        }
      };
    }
  }
};

/**
 * Enhanced recovery strategy for component integration errors
 */
export const componentIntegrationStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const component = recoveryContext.currentComponent;
    
    if (!component) {
      return { success: false };
    }
    
    // Create a simplified version of the component
    const simplifiedComponent: ComponentDefinition = {
      id: component.id,
      type: 'ErrorBoundary',
      props: {
        originalType: component.type,
        message: `Failed to integrate component: ${error.message}`,
        fallback: true,
        showError: true
      }
    };
    
    return {
      success: true,
      message: `Replaced problematic component '${component.id}' with error boundary`,
      data: {
        originalComponent: component,
        simplifiedComponent
      }
    };
  }
};

/**
 * Enhanced recovery strategy for route integration errors
 */
export const routeIntegrationStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const route = recoveryContext.currentRoute;
    
    if (!route) {
      return { success: false };
    }
    
    // Create a simplified version of the route
    const simplifiedRoute: RouteDefinition = {
      path: route.path,
      component: 'ErrorBoundary',
      props: {
        originalComponent: route.component,
        message: `Failed to integrate route: ${error.message}`,
        showError: true
      }
    };
    
    return {
      success: true,
      message: `Created simplified route for '${route.path}'`,
      data: {
        originalRoute: route,
        simplifiedRoute
      }
    };
  }
};

/**
 * Enhanced recovery strategy for API integration errors
 */
export const apiIntegrationStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const endpoint = recoveryContext.currentApiEndpoint;
    
    if (!endpoint) {
      return { success: false };
    }
    
    // Create a simplified version of the API endpoint
    const simplifiedEndpoint: ApiEndpoint = {
      path: endpoint.path,
      methods: endpoint.methods,
      handler: 'defaultErrorHandler'
    };
    
    // Create a default error handler
    const defaultHandler = `// Default error handler for ${endpoint.path}
export function defaultErrorHandler(req) {
  return new Response(JSON.stringify({
    error: true,
    message: "This endpoint could not be properly integrated",
    originalError: "${error.message.replace(/"/g, '\\"')}"
  }), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
}`;
    
    return {
      success: true,
      message: `Created simplified API endpoint for '${endpoint.path}'`,
      data: {
        originalEndpoint: endpoint,
        simplifiedEndpoint,
        defaultHandler
      }
    };
  }
};

/**
 * Enhanced recovery strategy for compilation phase errors
 */
export const compilationPhaseStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const phase = recoveryContext.phase;
    
    // Different recovery strategies based on the compilation phase
    switch (phase) {
      case 'parse':
        return {
          success: false,
          message: `Cannot recover from parse phase error: ${error.message}`,
          alternativeError: new CompilationProcessError(`Configuration parsing failed: ${error.message}`, {
            phase: 'parse',
            recoverable: false,
            severity: 'error',
            code: 'PARSE_PHASE_ERROR',
            suggestions: [
              'Check your JSON configuration for syntax errors',
              'Validate your configuration against the schema',
              'Ensure all required fields are present'
            ]
          })
        };
        
      case 'plan':
        // Try to continue with a partial plan
        return {
          success: true,
          message: `Continuing with partial compilation plan after error: ${error.message}`,
          data: {
            partialPlan: true,
            skipOptionalFeatures: true
          },
          partialRecovery: true,
          downgradeToWarning: true
        };
        
      case 'generate':
        // Try to continue with generation, skipping the problematic part
        return {
          success: true,
          message: `Skipping problematic generation step after error: ${error.message}`,
          data: {
            skipCurrentStep: true,
            continueGeneration: true
          },
          partialRecovery: true,
          downgradeToWarning: true
        };
        
      case 'integrate':
        // Try to continue with integration, using fallbacks
        return {
          success: true,
          message: `Using fallbacks for integration after error: ${error.message}`,
          data: {
            useFallbacks: true,
            skipProblematicIntegration: true
          },
          partialRecovery: true,
          downgradeToWarning: true
        };
        
      case 'optimize':
        // Skip optimization and continue
        return {
          success: true,
          message: `Skipping optimization after error: ${error.message}`,
          data: {
            skipOptimization: true
          },
          downgradeToWarning: true
        };
        
      default:
        return { success: false };
    }
  }
};

/**
 * Enhanced recovery strategy for configuration validation errors
 */
export const configValidationEnhancedStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Only attempt recovery during parse phase
    if (recoveryContext.phase !== 'parse') {
      return { success: false };
    }
    
    // Extract the path from the error location
    const path = error.location?.path;
    if (!path) {
      return { success: false };
    }
    
    // Apply default values based on the path
    if (path === 'metadata') {
      return {
        success: true,
        message: `Applied default metadata for missing or invalid metadata section`,
        data: {
          defaultMetadata: {
            name: 'default-app',
            version: '1.0.0',
            description: 'Generated application with default metadata'
          }
        },
        downgradeToWarning: true
      };
    } else if (path === 'components' || path.startsWith('components.')) {
      return {
        success: true,
        message: `Applied minimal component structure for invalid components section`,
        data: {
          defaultComponents: [
            {
              id: 'defaultPage',
              type: 'DefaultPage',
              props: {
                title: 'Default Page',
                content: 'This page was generated as a fallback due to configuration errors.'
              }
            }
          ]
        },
        downgradeToWarning: true
      };
    } else if (path === 'routes' || path.startsWith('routes.')) {
      return {
        success: true,
        message: `Applied minimal route structure for invalid routes section`,
        data: {
          defaultRoutes: [
            {
              path: '/',
              component: 'defaultPage'
            }
          ]
        },
        downgradeToWarning: true
      };
    } else if (path === 'api' || path.startsWith('api.')) {
      return {
        success: true,
        message: `Applied minimal API structure for invalid API section`,
        data: {
          defaultApi: {
            endpoints: []
          }
        },
        downgradeToWarning: true
      };
    } else {
      // Other configuration sections
      return {
        success: true,
        message: `Skipped invalid configuration section: ${path}`,
        data: {
          skipSection: path
        },
        downgradeToWarning: true
      };
    }
  }
};

/**
 * Register all enhanced recovery strategies with the error recovery manager
 */
export function registerEnhancedRecoveryStrategies(): void {
  // Register enhanced strategies
  errorRecoveryManager.registerRecoveryStrategy('PARTIAL_COMPILATION_FAILURE', partialCompilationFailureStrategy);
  errorRecoveryManager.registerRecoveryStrategy('SCHEMA_VALIDATION_ERROR', schemaValidationErrorStrategy);
  errorRecoveryManager.registerRecoveryStrategy('MISSING_DEPENDENCY_ENHANCED', missingDependencyEnhancedStrategy);
  errorRecoveryManager.registerRecoveryStrategy('TEMPLATE_PROCESSING_ERROR_ENHANCED', templateProcessingEnhancedStrategy);
  errorRecoveryManager.registerRecoveryStrategy('FILE_SYSTEM_ERROR', fileSystemEnhancedStrategy);
  errorRecoveryManager.registerRecoveryStrategy('COMPONENT_INTEGRATION_ERROR', componentIntegrationStrategy);
  errorRecoveryManager.registerRecoveryStrategy('ROUTE_INTEGRATION_ERROR', routeIntegrationStrategy);
  errorRecoveryManager.registerRecoveryStrategy('API_INTEGRATION_ERROR', apiIntegrationStrategy);
  errorRecoveryManager.registerRecoveryStrategy('COMPILATION_PHASE_ERROR', compilationPhaseStrategy);
  errorRecoveryManager.registerRecoveryStrategy('CONFIG_VALIDATION_ERROR_ENHANCED', configValidationEnhancedStrategy);
}

// Register all enhanced strategies by default
registerEnhancedRecoveryStrategies();