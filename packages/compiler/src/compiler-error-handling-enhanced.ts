// Enhanced error handling for the compiler with graceful degradation
import { 
  CompilerError, 
  ValidationError, 
  ComponentError, 
  DependencyError,
  TemplateError,
  FileError,
  RouteError,
  ApiError,
  CompilationProcessError,
  ConfigurationError,
  errorRecoveryManager,
  errorLogger,
  RecoveryStrategy,
  RecoveryResult
} from "../../shared/src/errors.ts";
import { LogLevel } from "../../shared/src/enums.ts";
import { diagnosticTool, type DiagnosticOptions, type DiagnosticResult } from "./diagnostics.ts";
import type { 
  CompilationContext, 
  CompilationError, 
  ErrorRecoveryContext,
  ErrorSeverity,
  ErrorLocation,
  ComponentDefinition,
  RouteDefinition,
  ApiEndpoint
} from "../../shared/src/types.ts";

/**
 * Enhanced error handling options with graceful degradation
 */
export interface EnhancedErrorHandlingOptions {
  /** Whether to throw errors (default: false) */
  throwOnError?: boolean;
  /** Whether to attempt recovery from errors (default: true) */
  attemptRecovery?: boolean;
  /** Log level for error output (default: ERROR) */
  logLevel?: LogLevel;
  /** Whether to include suggestions in error messages (default: true) */
  includeSuggestions?: boolean;
  /** Whether to include line numbers in error messages (default: true) */
  includeLineNumbers?: boolean;
  /** Maximum number of recovery attempts for a single error code (default: 3) */
  maxRecoveryAttempts?: number;
  /** Whether to downgrade recoverable errors to warnings (default: false) */
  downgradeRecoverableErrors?: boolean;
  /** Whether to collect related errors (default: true) */
  collectRelatedErrors?: boolean;
  /** Whether to show stack traces for errors (default: false) */
  showStackTraces?: boolean;
  /** Whether to enable graceful degradation (default: true) */
  enableGracefulDegradation?: boolean;
  /** Whether to continue compilation after critical errors (default: false) */
  continueAfterCriticalErrors?: boolean;
  /** Maximum number of errors before stopping compilation (default: 50) */
  maxErrorsBeforeStop?: number;
  /** Whether to create fallback implementations for missing components (default: true) */
  createFallbackImplementations?: boolean;
  /** Whether to validate recovery results (default: true) */
  validateRecoveryResults?: boolean;
}

/**
 * Enhanced error handling manager with graceful degradation capabilities
 */
export class EnhancedCompilerErrorHandler {
  private options: EnhancedErrorHandlingOptions;
  private relatedErrors: Map<string, CompilerError[]> = new Map();
  private errorCount = 0;
  private criticalErrorCount = 0;
  private recoveryAttempts: Map<string, number> = new Map();
  private fallbackImplementations: Map<string, unknown> = new Map();
  private compilationStopped = false;
  
  constructor(options: EnhancedErrorHandlingOptions = {}) {
    this.options = {
      throwOnError: false,
      attemptRecovery: true,
      logLevel: LogLevel.ERROR,
      includeSuggestions: true,
      includeLineNumbers: true,
      maxRecoveryAttempts: 3,
      downgradeRecoverableErrors: false,
      collectRelatedErrors: true,
      showStackTraces: false,
      enableGracefulDegradation: true,
      continueAfterCriticalErrors: false,
      maxErrorsBeforeStop: 50,
      createFallbackImplementations: true,
      validateRecoveryResults: true,
      ...options
    };
    
    // Configure error logger
    errorLogger.setLogLevel(this.options.logLevel || LogLevel.ERROR);
    
    // Configure error recovery manager
    if (this.options.maxRecoveryAttempts !== undefined) {
      errorRecoveryManager.setMaxRecoveryAttempts(this.options.maxRecoveryAttempts);
    }
  }
  
  /**
   * Handle an error with enhanced recovery and graceful degradation
   */
  handleError(error: Error | CompilerError, context: unknown): boolean {
    // Check if compilation should be stopped
    if (this.compilationStopped) {
      errorLogger.warn("Compilation stopped due to too many errors. Ignoring additional errors.");
      return false;
    }
    
    // Convert regular Error to CompilerError if needed
    const compilerError = error instanceof CompilerError 
      ? error 
      : new CompilerError(error.message, {
          type: 'general',
          details: this.options.showStackTraces ? error.stack : undefined,
          recoverable: false,
          originalError: error
        });
    
    // Increment error count
    this.errorCount++;
    
    // Check if this is a critical error
    const isCritical = this.isCriticalError(compilerError);
    if (isCritical) {
      this.criticalErrorCount++;
    }
    
    // Check if we should stop compilation
    if (this.shouldStopCompilation(compilerError)) {
      this.compilationStopped = true;
      errorLogger.fatal(`Compilation stopped after ${this.errorCount} errors (${this.criticalErrorCount} critical)`);
      
      if (this.options.throwOnError) {
        throw new CompilationProcessError("Compilation stopped due to too many errors", {
          code: "COMPILATION_STOPPED",
          severity: "error",
          recoverable: false,
          details: `Total errors: ${this.errorCount}, Critical errors: ${this.criticalErrorCount}`
        });
      }
      
      return false;
    }
    
    // Log the error with appropriate level
    this.logError(compilerError, isCritical);
    
    // Collect related errors if enabled
    if (this.options.collectRelatedErrors && compilerError.code) {
      const relatedList = this.relatedErrors.get(compilerError.code) || [];
      relatedList.push(compilerError);
      this.relatedErrors.set(compilerError.code, relatedList);
    }
    
    // Try graceful degradation first if enabled
    if (this.options.enableGracefulDegradation) {
      const degraded = this.attemptGracefulDegradation(compilerError, context);
      if (degraded) {
        return true;
      }
    }
    
    // Try to recover if enabled
    if (this.options.attemptRecovery && compilerError.recoverable) {
      const recovered = this.attemptRecovery(compilerError, context);
      if (recovered) {
        return true;
      }
    }
    
    // Create fallback implementation if enabled
    if (this.options.createFallbackImplementations) {
      const fallback = this.createFallbackImplementation(compilerError, context);
      if (fallback) {
        return true;
      }
    }
    
    // Throw if configured to do so and this is a critical error
    if (this.options.throwOnError && (isCritical || !this.options.continueAfterCriticalErrors)) {
      throw compilerError;
    }
    
    return false;
  }
  
  /**
   * Determine if an error is critical
   */
  private isCriticalError(error: CompilerError): boolean {
    // Critical error types that should stop compilation
    const criticalTypes = ['compilation', 'file', 'dependency'];
    const criticalCodes = [
      'PARSE_PHASE_ERROR',
      'DISK_SPACE_ERROR',
      'PERMISSION_DENIED',
      'CIRCULAR_DEPENDENCY',
      'MISSING_REQUIRED_DEPENDENCY'
    ];
    
    return criticalTypes.includes(error.type) || 
           criticalCodes.includes(error.code) ||
           error.severity === 'error' && !error.recoverable;
  }
  
  /**
   * Determine if compilation should be stopped
   */
  private shouldStopCompilation(error: CompilerError): boolean {
    // Stop if we've reached the maximum number of errors
    if (this.errorCount >= (this.options.maxErrorsBeforeStop || 50)) {
      return true;
    }
    
    // Stop if we have too many critical errors and not configured to continue
    if (this.criticalErrorCount >= 5 && !this.options.continueAfterCriticalErrors) {
      return true;
    }
    
    // Stop for specific critical error codes (only if not configured to continue)
    const stopCodes = ['PARSE_PHASE_ERROR', 'DISK_SPACE_ERROR', 'PERMISSION_DENIED'];
    if (stopCodes.includes(error.code) && !this.options.continueAfterCriticalErrors) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Log an error with appropriate level and formatting
   */
  private logError(error: CompilerError, isCritical: boolean): void {
    if (isCritical) {
      errorLogger.fatal(error);
    } else if (this.options.downgradeRecoverableErrors && error.recoverable) {
      errorLogger.warn(error.format());
    } else {
      errorLogger.error(error);
    }
  }
  
  /**
   * Attempt graceful degradation for an error
   */
  private attemptGracefulDegradation(error: CompilerError, context: unknown): boolean {
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Different degradation strategies based on error type
    switch (error.type) {
      case 'component':
        return this.degradeComponentError(error, recoveryContext);
      case 'template':
        return this.degradeTemplateError(error, recoveryContext);
      case 'route':
        return this.degradeRouteError(error, recoveryContext);
      case 'api':
        return this.degradeApiError(error, recoveryContext);
      case 'validation':
        return this.degradeValidationError(error, recoveryContext);
      default:
        return false;
    }
  }
  
  /**
   * Gracefully degrade component errors
   */
  private degradeComponentError(error: CompilerError, context: ErrorRecoveryContext): boolean {
    if (!context.currentComponent) {
      return false;
    }
    
    // Create a simplified component that shows an error message
    const fallbackComponent = {
      id: context.currentComponent.id,
      type: 'ErrorBoundary',
      props: {
        originalType: context.currentComponent.type,
        error: error.message,
        showError: true,
        fallback: true
      }
    };
    
    this.fallbackImplementations.set(`component_${context.currentComponent.id}`, fallbackComponent);
    
    errorLogger.warn(`Gracefully degraded component '${context.currentComponent.id}' to error boundary`);
    return true;
  }
  
  /**
   * Gracefully degrade template errors
   */
  private degradeTemplateError(error: CompilerError, context: ErrorRecoveryContext): boolean {
    if (context.phase !== 'generate') {
      return false;
    }
    
    // Use a minimal template
    const fallbackTemplate = `
// Fallback template due to error: ${error.message}
export default function FallbackTemplate() {
  return (
    <div className="error-fallback">
      <h1>Template Error</h1>
      <p>The original template could not be loaded.</p>
      <details>
        <summary>Error Details</summary>
        <pre>{JSON.stringify({ error: "${error.message}" }, null, 2)}</pre>
      </details>
    </div>
  );
}`;
    
    this.fallbackImplementations.set(`template_${context.currentFile || 'unknown'}`, fallbackTemplate);
    
    errorLogger.warn(`Gracefully degraded template to fallback implementation`);
    return true;
  }
  
  /**
   * Gracefully degrade route errors
   */
  private degradeRouteError(error: CompilerError, context: ErrorRecoveryContext): boolean {
    if (!context.currentRoute) {
      return false;
    }
    
    // Create a simplified route that shows an error page
    const fallbackRoute = {
      path: context.currentRoute.path,
      component: 'ErrorPage',
      props: {
        originalComponent: context.currentRoute.component,
        error: error.message,
        showError: true
      }
    };
    
    this.fallbackImplementations.set(`route_${context.currentRoute.path}`, fallbackRoute);
    
    errorLogger.warn(`Gracefully degraded route '${context.currentRoute.path}' to error page`);
    return true;
  }
  
  /**
   * Gracefully degrade API errors
   */
  private degradeApiError(error: CompilerError, context: ErrorRecoveryContext): boolean {
    if (!context.currentApiEndpoint) {
      return false;
    }
    
    // Create a simplified API endpoint that returns an error response
    const fallbackHandler = `
// Fallback API handler due to error: ${error.message}
export function fallbackHandler(req) {
  return new Response(JSON.stringify({
    error: true,
    message: "This API endpoint is temporarily unavailable",
    details: "${error.message.replace(/"/g, '\\"')}",
    fallback: true
  }), {
    status: 503,
    headers: { "Content-Type": "application/json" }
  });
}`;
    
    this.fallbackImplementations.set(`api_${context.currentApiEndpoint.path}`, fallbackHandler);
    
    errorLogger.warn(`Gracefully degraded API endpoint '${context.currentApiEndpoint.path}' to fallback handler`);
    return true;
  }
  
  /**
   * Gracefully degrade validation errors
   */
  private degradeValidationError(error: CompilerError, context: ErrorRecoveryContext): boolean {
    // For validation errors, we can often continue with default values
    if (error.location?.path) {
      const defaultValue = this.getDefaultValueForPath(error.location.path);
      this.fallbackImplementations.set(`validation_${error.location.path}`, defaultValue);
      
      errorLogger.warn(`Applied default value for validation error at path: ${error.location.path}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get a default value for a configuration path
   */
  private getDefaultValueForPath(path: string): unknown {
    if (path.includes('metadata')) {
      return { name: 'default-app', version: '1.0.0', description: 'Generated application' };
    } else if (path.includes('components')) {
      return [];
    } else if (path.includes('routes')) {
      return [{ path: '/', component: 'DefaultPage' }];
    } else if (path.includes('api')) {
      return { endpoints: [] };
    } else {
      return null;
    }
  }
  
  /**
   * Attempt recovery using the error recovery manager
   */
  private attemptRecovery(error: CompilerError, context: unknown): boolean {
    const attempts = this.recoveryAttempts.get(error.code) || 0;
    
    if (attempts >= (this.options.maxRecoveryAttempts || 3)) {
      errorLogger.warn(`Maximum recovery attempts exceeded for error code: ${error.code}`);
      return false;
    }
    
    this.recoveryAttempts.set(error.code, attempts + 1);
    
    const recovered = errorRecoveryManager.tryRecover(error, context);
    
    if (recovered && this.options.validateRecoveryResults) {
      // Validate that the recovery actually worked
      const isValid = this.validateRecoveryResult(error, context);
      if (!isValid) {
        errorLogger.warn(`Recovery validation failed for error: ${error.message}`);
        return false;
      }
    }
    
    return recovered;
  }
  
  /**
   * Validate that a recovery result is valid
   */
  private validateRecoveryResult(error: CompilerError, context: unknown): boolean {
    // Basic validation - check if the recovery context has been updated appropriately
    const recoveryContext = context as ErrorRecoveryContext;
    
    switch (error.type) {
      case 'component':
        // Check if a fallback component was created
        return recoveryContext.currentComponent !== undefined;
      case 'route':
        // Check if a fallback route was created
        return recoveryContext.currentRoute !== undefined;
      case 'api':
        // Check if a fallback API endpoint was created
        return recoveryContext.currentApiEndpoint !== undefined;
      default:
        return true; // Assume valid for other types
    }
  }
  
  /**
   * Create a fallback implementation for an error
   */
  private createFallbackImplementation(error: CompilerError, context: unknown): boolean {
    const recoveryContext = context as ErrorRecoveryContext;
    const fallbackKey = `fallback_${error.type}_${Date.now()}`;
    
    let fallbackImplementation: unknown;
    
    switch (error.type) {
      case 'component':
        fallbackImplementation = {
          type: 'div',
          props: {
            className: 'error-fallback',
            children: `Error: ${error.message}`
          }
        };
        break;
      case 'template':
        fallbackImplementation = `// Fallback template\nexport default function Fallback() { return <div>Template Error</div>; }`;
        break;
      case 'api':
        fallbackImplementation = `export function handler() { return new Response('{"error": "API Error"}', {status: 500}); }`;
        break;
      default:
        fallbackImplementation = { error: error.message, fallback: true };
    }
    
    this.fallbackImplementations.set(fallbackKey, fallbackImplementation);
    
    errorLogger.info(`Created fallback implementation for ${error.type} error: ${fallbackKey}`);
    return true;
  }
  
  /**
   * Get all fallback implementations
   */
  getFallbackImplementations(): Map<string, unknown> {
    return new Map(this.fallbackImplementations);
  }
  
  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    criticalErrors: number;
    recoveredErrors: number;
    fallbackImplementations: number;
    compilationStopped: boolean;
  } {
    const recoveredErrors = Array.from(this.recoveryAttempts.values()).reduce((sum, attempts) => sum + attempts, 0);
    
    return {
      totalErrors: this.errorCount,
      criticalErrors: this.criticalErrorCount,
      recoveredErrors,
      fallbackImplementations: this.fallbackImplementations.size,
      compilationStopped: this.compilationStopped
    };
  }
  
  /**
   * Reset error handler state
   */
  reset(): void {
    this.errorCount = 0;
    this.criticalErrorCount = 0;
    this.recoveryAttempts.clear();
    this.fallbackImplementations.clear();
    this.compilationStopped = false;
    this.relatedErrors.clear();
  }
  
  /**
   * Check if compilation should continue
   */
  canContinueCompilation(): boolean {
    return !this.compilationStopped;
  }
  
  /**
   * Force stop compilation
   */
  stopCompilation(reason: string): void {
    this.compilationStopped = true;
    errorLogger.fatal(`Compilation forcibly stopped: ${reason}`);
  }
}

// Export a default instance
export const enhancedErrorHandler = new EnhancedCompilerErrorHandler();