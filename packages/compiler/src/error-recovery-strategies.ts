// Error recovery strategies for different types of compilation failures
import { 
  CompilerError, 
  RecoveryStrategy, 
  RecoveryResult,
  errorRecoveryManager
} from "../../shared/src/errors.ts";
import type { ErrorRecoveryContext } from "../../shared/src/types.ts";
import { fileManager } from "./file-manager.ts";

/**
 * Recovery strategy for missing component errors
 */
export const componentNotFoundStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const componentType = error.details || "unknown";
    
    return {
      success: true,
      message: `Using fallback component for missing component type: ${componentType}`,
      data: {
        type: "FallbackComponent",
        props: {
          originalType: componentType,
          error: error.message,
          fallbackMessage: `Component '${componentType}' could not be found`,
          showError: true
        },
      },
    };
  }
};

/**
 * Recovery strategy for missing template files
 */
export const templateNotFoundStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Use a default template based on the phase
    if (recoveryContext.phase === 'generate') {
      return {
        success: true,
        message: `Using default template for missing template: ${error.message}`,
        data: {
          templatePath: 'base/default.tsx',
        },
      };
    }
    
    return {
      success: false,
      message: `Cannot recover from missing template in ${recoveryContext.phase} phase`,
    };
  }
};

/**
 * Recovery strategy for missing route components
 */
export const routeComponentNotFoundStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Create a placeholder route component
    return {
      success: true,
      message: `Created placeholder component for missing route component: ${error.message}`,
      data: {
        component: {
          id: recoveryContext.currentRoute?.component || 'placeholder',
          type: 'ErrorBoundary',
          props: {
            message: `Route component '${recoveryContext.currentRoute?.component}' not found`,
            fallback: true,
          },
        },
      },
    };
  }
};

/**
 * Recovery strategy for invalid route paths
 */
export const invalidRoutePathStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const currentRoute = recoveryContext.currentRoute;
    
    if (!currentRoute) {
      return { success: false };
    }
    
    // Sanitize the route path
    const sanitizedPath = currentRoute.path
      .replace(/[^a-zA-Z0-9\-_\/\:]/g, '') // Remove invalid characters
      .replace(/\/+/g, '/') // Replace multiple slashes with a single one
      .replace(/^\/*/, '/'); // Ensure path starts with a single slash
    
    return {
      success: true,
      message: `Sanitized invalid route path '${currentRoute.path}' to '${sanitizedPath}'`,
      data: {
        sanitizedPath,
      },
      downgradeToWarning: true,
    };
  }
};

/**
 * Recovery strategy for duplicate component IDs
 */
export const duplicateComponentIdStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const currentComponent = recoveryContext.currentComponent;
    
    if (!currentComponent) {
      return { success: false };
    }
    
    // Generate a unique ID by appending a suffix
    const duplicateId = currentComponent.id;
    const uniqueId = `${duplicateId}_${Date.now().toString(36)}`;
    
    return {
      success: true,
      message: `Renamed duplicate component ID '${duplicateId}' to '${uniqueId}'`,
      data: {
        uniqueId,
      },
    };
  }
};

/**
 * Recovery strategy for invalid prop types
 */
export const invalidPropTypeStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const currentComponent = recoveryContext.currentComponent;
    
    if (!currentComponent || !error.location?.path) {
      return { success: false };
    }
    
    // Extract the prop name from the path
    const propPath = error.location.path;
    const propName = propPath.split('.').pop() || '';
    
    // Remove the invalid prop
    return {
      success: true,
      message: `Removed invalid prop '${propName}' from component '${currentComponent.id}'`,
      data: {
        removedProp: propName,
      },
      downgradeToWarning: true,
    };
  }
};

/**
 * Recovery strategy for file write errors
 */
export const fileWriteErrorStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Try an alternative file path
    if (recoveryContext.currentFile) {
      const alternativePath = recoveryContext.currentFile.replace(/\.[^.]+$/, '.backup$1');
      
      return {
        success: true,
        message: `Failed to write to '${recoveryContext.currentFile}', using alternative path '${alternativePath}'`,
        data: {
          alternativePath,
        },
      };
    }
    
    return { success: false };
  }
};

/**
 * Recovery strategy for API endpoint conflicts
 */
export const apiEndpointConflictStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const endpoint = recoveryContext.currentApiEndpoint;
    
    if (!endpoint) {
      return { success: false };
    }
    
    // Modify the endpoint path to avoid conflict
    const modifiedPath = `${endpoint.path}_alternative`;
    
    return {
      success: true,
      message: `Modified conflicting API endpoint path '${endpoint.path}' to '${modifiedPath}'`,
      data: {
        modifiedPath,
      },
    };
  }
};

/**
 * Recovery strategy for missing layout components
 */
export const layoutNotFoundStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    return {
      success: true,
      message: `Using default layout for missing layout component: ${error.message}`,
      data: {
        component: {
          id: 'defaultLayout',
          type: 'DefaultLayout',
          props: {
            message: `Layout component '${recoveryContext.currentRoute?.layout}' not found`,
            showMessage: false,
          },
        },
      },
    };
  }
};

/**
 * Recovery strategy for invalid configuration
 */
export const invalidConfigurationStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // If we're in the parse phase, we can try to fix some common configuration issues
    if (recoveryContext.phase === 'parse') {
      return {
        success: true,
        message: `Applied default values for invalid configuration: ${error.message}`,
        data: {
          useDefaults: true,
        },
        partialRecovery: true,
      };
    }
    
    return { success: false };
  }
};

/**
 * Recovery strategy for missing dependencies
 */
export const missingDependencyStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const dependency = error.details || '';
    
    return {
      success: true,
      message: `Using mock implementation for missing dependency: ${dependency}`,
      data: {
        mockImplementation: true,
        dependency,
      },
    };
  }
};

/**
 * Recovery strategy for template processing errors
 */
export const templateProcessingErrorStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Skip the problematic placeholder
    return {
      success: true,
      message: `Skipped problematic placeholder in template: ${error.message}`,
      data: {
        skipPlaceholder: true,
      },
      downgradeToWarning: true,
    };
  }
};

/**
 * Recovery strategy for invalid HTTP methods
 */
export const invalidHttpMethodStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const endpoint = recoveryContext.currentApiEndpoint;
    
    if (!endpoint) {
      return { success: false };
    }
    
    // Filter out invalid methods
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    const filteredMethods = endpoint.methods.filter(method => validMethods.includes(method));
    
    // If no valid methods remain, use GET as a fallback
    if (filteredMethods.length === 0) {
      filteredMethods.push('GET');
    }
    
    return {
      success: true,
      message: `Filtered invalid HTTP methods from endpoint '${endpoint.path}'`,
      data: {
        filteredMethods,
      },
    };
  }
};

/**
 * Recovery strategy for missing API handlers
 */
export const missingApiHandlerStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const endpoint = recoveryContext.currentApiEndpoint;
    
    if (!endpoint) {
      return { success: false };
    }
    
    return {
      success: true,
      message: `Created default handler for API endpoint '${endpoint.path}'`,
      data: {
        defaultHandler: true,
      },
    };
  }
};

/**
 * Recovery strategy for circular dependencies
 */
export const circularDependencyStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    return {
      success: true,
      message: `Breaking circular dependency: ${error.message}`,
      data: {
        breakCircularDependency: true,
      },
    };
  }
};

/**
 * Recovery strategy for reserved component names
 */
export const reservedComponentNameStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const currentComponent = recoveryContext.currentComponent;
    
    if (!currentComponent) {
      return { success: false };
    }
    
    // Prefix the component type with "Custom"
    const newType = `Custom${currentComponent.type}`;
    
    return {
      success: true,
      message: `Renamed reserved component type '${currentComponent.type}' to '${newType}'`,
      data: {
        newType,
      },
    };
  }
};

/**
 * Recovery strategy for reserved route paths
 */
export const reservedRoutePathStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    const currentRoute = recoveryContext.currentRoute;
    
    if (!currentRoute) {
      return { success: false };
    }
    
    // Modify the route path to avoid using reserved prefix
    const modifiedPath = `/custom${currentRoute.path}`;
    
    return {
      success: true,
      message: `Modified reserved route path '${currentRoute.path}' to '${modifiedPath}'`,
      data: {
        modifiedPath,
      },
    };
  }
};

/**
 * Generic fallback recovery strategy
 */
export const genericFallbackStrategy: RecoveryStrategy = {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    // Try to recover based on error type
    switch (error.type) {
      case 'component':
        return {
          success: true,
          message: `Applied generic recovery for component error: ${error.message}`,
          downgradeToWarning: true,
        };
        
      case 'template':
        return {
          success: true,
          message: `Applied generic recovery for template error: ${error.message}`,
          downgradeToWarning: true,
        };
        
      case 'validation':
        return {
          success: true,
          message: `Skipped validation error: ${error.message}`,
          downgradeToWarning: true,
        };
        
      case 'file':
        return {
          success: true,
          message: `Applied generic recovery for file error: ${error.message}`,
          downgradeToWarning: true,
        };
        
      case 'route':
        return {
          success: true,
          message: `Applied generic recovery for route error: ${error.message}`,
          downgradeToWarning: true,
        };
        
      case 'api':
        return {
          success: true,
          message: `Applied generic recovery for API error: ${error.message}`,
          downgradeToWarning: true,
        };
        
      default:
        // For other error types, we can't provide a generic recovery
        return {
          success: false,
          message: `No generic recovery available for ${error.type} error: ${error.message}`,
        };
    }
  }
};

/**
 * Register all recovery strategies with the error recovery manager
 */
export function registerRecoveryStrategies(): void {
  // Register specific strategies
  errorRecoveryManager.registerRecoveryStrategy('COMPONENT_NOT_FOUND', componentNotFoundStrategy);
  errorRecoveryManager.registerRecoveryStrategy('TEMPLATE_NOT_FOUND', templateNotFoundStrategy);
  errorRecoveryManager.registerRecoveryStrategy('ROUTE_COMPONENT_NOT_FOUND', routeComponentNotFoundStrategy);
  errorRecoveryManager.registerRecoveryStrategy('INVALID_ROUTE_PATH', invalidRoutePathStrategy);
  errorRecoveryManager.registerRecoveryStrategy('DUPLICATE_COMPONENT_ID', duplicateComponentIdStrategy);
  errorRecoveryManager.registerRecoveryStrategy('INVALID_PROP_TYPE', invalidPropTypeStrategy);
  errorRecoveryManager.registerRecoveryStrategy('FILE_WRITE_ERROR', fileWriteErrorStrategy);
  errorRecoveryManager.registerRecoveryStrategy('API_ENDPOINT_CONFLICT', apiEndpointConflictStrategy);
  errorRecoveryManager.registerRecoveryStrategy('ROUTE_LAYOUT_NOT_FOUND', layoutNotFoundStrategy);
  errorRecoveryManager.registerRecoveryStrategy('INVALID_CONFIGURATION', invalidConfigurationStrategy);
  errorRecoveryManager.registerRecoveryStrategy('MISSING_DEPENDENCY', missingDependencyStrategy);
  errorRecoveryManager.registerRecoveryStrategy('TEMPLATE_PROCESSING_ERROR', templateProcessingErrorStrategy);
  errorRecoveryManager.registerRecoveryStrategy('INVALID_HTTP_METHOD', invalidHttpMethodStrategy);
  errorRecoveryManager.registerRecoveryStrategy('MISSING_API_HANDLER', missingApiHandlerStrategy);
  errorRecoveryManager.registerRecoveryStrategy('CIRCULAR_DEPENDENCY', circularDependencyStrategy);
  errorRecoveryManager.registerRecoveryStrategy('RESERVED_COMPONENT_NAME', reservedComponentNameStrategy);
  errorRecoveryManager.registerRecoveryStrategy('RESERVED_ROUTE_PATH', reservedRoutePathStrategy);
  
  // Register fallback strategy
  errorRecoveryManager.registerFallbackStrategy(genericFallbackStrategy);
}

// Register all strategies by default
registerRecoveryStrategies();