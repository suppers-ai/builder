// Comprehensive error handling system for JSON App Compiler
import type { CompilationError, ErrorLocation, ErrorSeverity, ErrorRecoveryContext } from './types.ts';
import { LogLevel } from './enums.ts';

/**
 * Base error class for all JSON App Compiler errors
 */
export class CompilerError extends Error {
  /** The type of error */
  type: string;
  
  /** Additional error details */
  details?: string;
  
  /** Location information for the error */
  location?: ErrorLocation;
  
  /** Suggestions for fixing the error */
  suggestions?: string[];
  
  /** Whether this error is recoverable */
  recoverable: boolean;
  
  /** Error code for programmatic handling */
  code: string;
  
  /** Error severity level */
  severity: ErrorSeverity;
  
  /** Related errors that may have contributed to this error */
  relatedErrors?: CompilerError[];
  
  /** Original error if this is a wrapped error */
  originalError?: Error;
  
  constructor(message: string, options: {
    type?: string;
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
    relatedErrors?: CompilerError[];
    originalError?: Error;
  } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.type = options.type || 'general';
    this.details = options.details;
    this.location = options.location;
    this.suggestions = options.suggestions;
    this.recoverable = options.recoverable ?? false;
    this.code = options.code || 'COMPILER_ERROR';
    this.severity = options.severity || 'error';
    this.relatedErrors = options.relatedErrors;
    this.originalError = options.originalError;
  }
  
  /**
   * Convert this error to a CompilationError object
   */
  toCompilationError(): CompilationError {
    return {
      type: this.type as any, // Type assertion needed due to string vs union type
      message: this.message,
      details: this.details,
      location: this.location,
      suggestions: this.suggestions,
      severity: this.severity,
    };
  }
  
  /**
   * Format the error for display
   */
  format(): string {
    let result = `[${this.type.toUpperCase()}] ${this.message}`;
    
    if (this.severity !== 'error') {
      result = `[${this.severity.toUpperCase()}] ${result}`;
    }
    
    if (this.location) {
      if (this.location.file) {
        result += `\nFile: ${this.location.file}`;
      }
      
      if (this.location.line !== undefined) {
        result += `\nLine: ${this.location.line}`;
        
        if (this.location.column !== undefined) {
          result += `, Column: ${this.location.column}`;
        }
      }
      
      if (this.location.path) {
        result += `\nPath: ${this.location.path}`;
      }
    }
    
    if (this.details) {
      result += `\nDetails: ${this.details}`;
    }
    
    if (this.suggestions && this.suggestions.length > 0) {
      result += '\nSuggestions:';
      this.suggestions.forEach(suggestion => {
        result += `\n  - ${suggestion}`;
      });
    }
    
    if (this.code) {
      result += `\nError Code: ${this.code}`;
    }
    
    return result;
  }
  
  /**
   * Create a new error with the same properties but marked as recoverable
   */
  asRecoverable(): CompilerError {
    return new CompilerError(this.message, {
      type: this.type,
      details: this.details,
      location: this.location,
      suggestions: this.suggestions,
      recoverable: true,
      code: this.code,
      severity: this.severity,
      relatedErrors: this.relatedErrors,
      originalError: this.originalError
    });
  }
  
  /**
   * Create a new error with a different severity level
   */
  withSeverity(severity: ErrorSeverity): CompilerError {
    return new CompilerError(this.message, {
      type: this.type,
      details: this.details,
      location: this.location,
      suggestions: this.suggestions,
      recoverable: this.recoverable,
      code: this.code,
      severity,
      relatedErrors: this.relatedErrors,
      originalError: this.originalError
    });
  }
  
  /**
   * Add related errors to this error
   */
  withRelatedErrors(errors: CompilerError[]): CompilerError {
    return new CompilerError(this.message, {
      type: this.type,
      details: this.details,
      location: this.location,
      suggestions: this.suggestions,
      recoverable: this.recoverable,
      code: this.code,
      severity: this.severity,
      relatedErrors: [...(this.relatedErrors || []), ...errors],
      originalError: this.originalError
    });
  }
}

/**
 * Error thrown when there's an issue with validating configuration
 */
export class ValidationError extends CompilerError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
  } = {}) {
    super(message, {
      ...options,
      type: 'validation',
      code: options.code || 'VALIDATION_ERROR',
    });
  }
}

/**
 * Error thrown when a component is not found or invalid
 */
export class ComponentError extends CompilerError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
  } = {}) {
    super(message, {
      ...options,
      type: 'component',
      code: options.code || 'COMPONENT_ERROR',
    });
  }
}

/**
 * Error thrown when there's an issue with file operations
 */
export class FileError extends CompilerError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
  } = {}) {
    super(message, {
      ...options,
      type: 'file',
      code: options.code || 'FILE_ERROR',
    });
  }
}

/**
 * Error thrown when there's an issue with dependencies
 */
export class DependencyError extends CompilerError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
  } = {}) {
    super(message, {
      ...options,
      type: 'dependency',
      code: options.code || 'DEPENDENCY_ERROR',
    });
  }
}

/**
 * Error thrown when there's an issue with templates
 */
export class TemplateError extends CompilerError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}) {
    super(message, {
      ...options,
      type: 'template',
      code: options.code || 'TEMPLATE_ERROR',
    });
  }
}

/**
 * Error thrown when there's an issue with route generation
 */
export class RouteError extends CompilerError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}) {
    super(message, {
      ...options,
      type: 'route',
      code: options.code || 'ROUTE_ERROR',
    });
  }
}

/**
 * Error thrown when there's an issue with API endpoints
 */
export class ApiError extends CompilerError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}) {
    super(message, {
      ...options,
      type: 'api',
      code: options.code || 'API_ERROR',
    });
  }
}

/**
 * Error thrown when there's an issue with compilation process
 */
export class CompilationProcessError extends CompilerError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
    phase?: string;
  } = {}) {
    super(message, {
      ...options,
      type: 'compilation',
      code: options.code || 'COMPILATION_ERROR',
      details: options.phase ? `Phase: ${options.phase}${options.details ? `\n${options.details}` : ''}` : options.details,
    });
  }
}

/**
 * Error thrown when there's an issue with configuration parsing
 */
export class ConfigurationError extends ValidationError {
  constructor(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}) {
    super(message, {
      ...options,
      code: options.code || 'CONFIG_ERROR',
    });
  }
}

/**
 * Error recovery manager for handling partial failures
 * @export
 */
export class ErrorRecoveryManager {
  private errors: CompilationError[] = [];
  private warnings: string[] = [];
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private fallbackStrategies: RecoveryStrategy[] = [];
  private recoveryAttempts: Map<string, number> = new Map();
  private maxRecoveryAttempts = 3;
  
  /**
   * Register a recovery strategy for a specific error code
   */
  registerRecoveryStrategy(errorCode: string, strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(errorCode, strategy);
  }
  
  /**
   * Register a fallback recovery strategy that will be tried if no specific strategy exists
   */
  registerFallbackStrategy(strategy: RecoveryStrategy): void {
    this.fallbackStrategies.push(strategy);
  }
  
  /**
   * Set the maximum number of recovery attempts for a single error code
   */
  setMaxRecoveryAttempts(attempts: number): void {
    this.maxRecoveryAttempts = attempts;
  }
  
  /**
   * Try to recover from an error
   * 
   * @returns true if recovery was successful, false otherwise
   */
  tryRecover(error: CompilerError, context: unknown): boolean {
    // If the error is not recoverable, don't try
    if (!error.recoverable) {
      this.errors.push(error.toCompilationError());
      return false;
    }
    
    // Check if we've exceeded the maximum number of recovery attempts for this error code
    const attempts = this.recoveryAttempts.get(error.code) || 0;
    if (attempts >= this.maxRecoveryAttempts) {
      this.errors.push(error.toCompilationError());
      this.warnings.push(`Maximum recovery attempts (${this.maxRecoveryAttempts}) exceeded for error code ${error.code}`);
      return false;
    }
    
    // Increment the recovery attempts counter
    this.recoveryAttempts.set(error.code, attempts + 1);
    
    // Look for a specific recovery strategy
    const strategy = this.recoveryStrategies.get(error.code);
    if (strategy) {
      return this.executeRecoveryStrategy(strategy, error, context);
    }
    
    // Try fallback strategies if no specific strategy exists
    for (const fallbackStrategy of this.fallbackStrategies) {
      const recovered = this.executeRecoveryStrategy(fallbackStrategy, error, context);
      if (recovered) {
        return true;
      }
    }
    
    // No strategy worked
    this.errors.push(error.toCompilationError());
    return false;
  }
  
  /**
   * Execute a recovery strategy and handle the result
   */
  private executeRecoveryStrategy(strategy: RecoveryStrategy, error: CompilerError, context: unknown): boolean {
    try {
      const result = strategy.recover(error, context);
      if (result.success) {
        this.warnings.push(result.message || `Recovered from error: ${error.message}`);
        
        // If the strategy provided a downgraded error, add it as a warning
        if (result.downgradeToWarning) {
          const warningMessage = `[DOWNGRADED] ${error.format()}`;
          this.warnings.push(warningMessage);
        }
        
        return true;
      } else {
        // If the strategy failed but provided a different error, use that instead
        if (result.alternativeError) {
          this.errors.push(result.alternativeError instanceof CompilerError 
            ? result.alternativeError.toCompilationError() 
            : result.alternativeError);
        } else {
          this.errors.push(error.toCompilationError());
        }
        return false;
      }
    } catch (e) {
      // Recovery strategy threw an exception
      this.errors.push(error.toCompilationError());
      this.warnings.push(`Recovery strategy failed with exception: ${e instanceof Error ? e.message : String(e)}`);
      return false;
    }
  }
  
  /**
   * Try to recover from multiple errors at once
   * 
   * @returns The number of errors successfully recovered from
   */
  tryRecoverMultiple(errors: CompilerError[], context: unknown): number {
    let recoveredCount = 0;
    
    for (const error of errors) {
      if (this.tryRecover(error, context)) {
        recoveredCount++;
      }
    }
    
    return recoveredCount;
  }
  
  /**
   * Get all errors
   */
  getErrors(): CompilationError[] {
    return [...this.errors];
  }
  
  /**
   * Get all warnings
   */
  getWarnings(): string[] {
    return [...this.warnings];
  }
  
  /**
   * Get errors of a specific type
   */
  getErrorsByType(type: string): CompilationError[] {
    return this.errors.filter(error => error.type === type);
  }
  
  /**
   * Get errors with a specific code
   */
  getErrorsByCode(code: string): CompilationError[] {
    return this.errors.filter(error => 'code' in error && error.code === code);
  }
  
  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
  
  /**
   * Check if there are any warnings
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }
  
  /**
   * Clear all errors and warnings
   */
  clear(): void {
    this.errors = [];
    this.warnings = [];
    this.recoveryAttempts.clear();
  }
  
  /**
   * Add an error
   */
  addError(error: CompilerError | CompilationError): void {
    if (error instanceof CompilerError) {
      this.errors.push(error.toCompilationError());
    } else {
      this.errors.push(error);
    }
  }
  
  /**
   * Add a warning
   */
  addWarning(warning: string): void {
    this.warnings.push(warning);
  }
  
  /**
   * Get a summary of errors and warnings
   */
  getSummary(): { errorCount: number; warningCount: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    
    for (const error of this.errors) {
      byType[error.type] = (byType[error.type] || 0) + 1;
    }
    
    return {
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      byType,
    };
  }
}

/**
 * Interface for error recovery strategies
 */
export interface RecoveryStrategy {
  /**
   * Try to recover from an error
   * 
   * @param error The error to recover from
   * @param context The context in which the error occurred
   * @returns A recovery result
   */
  recover(error: CompilerError, context: unknown): RecoveryResult;
}

/**
 * Result of a recovery attempt
 */
export interface RecoveryResult {
  /** Whether the recovery was successful */
  success: boolean;
  
  /** A message describing the recovery */
  message?: string;
  
  /** Any data resulting from the recovery */
  data?: unknown;
  
  /** Alternative error to use if recovery failed */
  alternativeError?: CompilerError | CompilationError;
  
  /** Whether to downgrade the error to a warning */
  downgradeToWarning?: boolean;
  
  /** Whether partial recovery was achieved */
  partialRecovery?: boolean;
  
  /** Recovery metadata for debugging */
  metadata?: Record<string, unknown>;
}

/**
 * Enhanced logger with error handling capabilities
 * @export
 */
export class ErrorLogger {
  private logLevel: LogLevel;
  
  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }
  
  /**
   * Set the log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
  
  /**
   * Log a debug message
   */
  debug(message: string): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`);
    }
  }
  
  /**
   * Log an info message
   */
  info(message: string): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`);
    }
  }
  
  /**
   * Log a warning message
   */
  warn(message: string): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`);
    }
  }
  
  /**
   * Log an error message
   */
  error(message: string | Error | CompilerError): void {
    if (this.logLevel <= LogLevel.ERROR) {
      if (message instanceof CompilerError) {
        console.error(message.format());
      } else if (message instanceof Error) {
        console.error(`[ERROR] ${message.message}`);
        if (message.stack) {
          console.error(message.stack);
        }
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  }
  
  /**
   * Log a fatal error message
   */
  fatal(message: string | Error | CompilerError): void {
    if (this.logLevel <= LogLevel.FATAL) {
      if (message instanceof CompilerError) {
        console.error(`[FATAL] ${message.format()}`);
      } else if (message instanceof Error) {
        console.error(`[FATAL] ${message.message}`);
        if (message.stack) {
          console.error(message.stack);
        }
      } else {
        console.error(`[FATAL] ${message}`);
      }
    }
  }
}

// Create default instances
export const errorRecoveryManager = new ErrorRecoveryManager();
export const errorLogger = new ErrorLogger();

// Register default recovery strategies
errorRecoveryManager.registerRecoveryStrategy('COMPONENT_NOT_FOUND', {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    // Use a fallback component
    const recoveryContext = context as ErrorRecoveryContext;
    
    return {
      success: true,
      message: `Using fallback component for missing component: ${error.message}`,
      data: {
        type: 'FallbackComponent',
        props: {
          originalType: error.details,
          error: error.message,
          fallbackMessage: `Component '${error.details}' could not be found`,
          showError: true
        },
      },
    };
  },
});

errorRecoveryManager.registerRecoveryStrategy('TEMPLATE_NOT_FOUND', {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Use a default template
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
  },
});

errorRecoveryManager.registerRecoveryStrategy('ROUTE_COMPONENT_NOT_FOUND', {
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
  },
});

errorRecoveryManager.registerRecoveryStrategy('INVALID_ROUTE_PATH', {
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
  },
});

errorRecoveryManager.registerRecoveryStrategy('DUPLICATE_COMPONENT_ID', {
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
  },
});

errorRecoveryManager.registerRecoveryStrategy('INVALID_PROP_TYPE', {
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
  },
});

errorRecoveryManager.registerRecoveryStrategy('FILE_WRITE_ERROR', {
  recover(error: CompilerError, context: unknown): RecoveryResult {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Try an alternative file path
    if (recoveryContext.currentFile) {
      const alternativePath = recoveryContext.currentFile.replace(/\.[^.]+$/, '.backup$&');
      
      return {
        success: true,
        message: `Failed to write to '${recoveryContext.currentFile}', using alternative path '${alternativePath}'`,
        data: {
          alternativePath,
        },
      };
    }
    
    return { success: false };
  },
});

errorRecoveryManager.registerRecoveryStrategy('API_ENDPOINT_CONFLICT', {
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
  },
});

// Register a fallback recovery strategy for any recoverable error
errorRecoveryManager.registerFallbackStrategy({
  recover(error: CompilerError, context: unknown): RecoveryResult {
    // If the error is marked as recoverable but we don't have a specific strategy,
    // we can try a generic approach based on the error type
    
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
        
      default:
        // For other error types, we can't provide a generic recovery
        return {
          success: false,
          message: `No generic recovery available for ${error.type} error: ${error.message}`,
        };
    }
  },
});