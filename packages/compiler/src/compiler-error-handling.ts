// Enhanced error handling for the compiler
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
 * Error handling options
 */
export interface ErrorHandlingOptions {
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
}

/**
 * Error handling manager for the compiler
 */
export class CompilerErrorHandler {
  private options: ErrorHandlingOptions;
  private relatedErrors: Map<string, CompilerError[]> = new Map();
  
  constructor(options: ErrorHandlingOptions = {}) {
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
   * Set error handling options
   */
  setOptions(options: Partial<ErrorHandlingOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
    
    // Update error logger
    if (options.logLevel !== undefined) {
      errorLogger.setLogLevel(options.logLevel);
    }
    
    // Update error recovery manager
    if (options.maxRecoveryAttempts !== undefined) {
      errorRecoveryManager.setMaxRecoveryAttempts(options.maxRecoveryAttempts);
    }
  }
  
  /**
   * Handle an error
   * 
   * @param error The error to handle
   * @param context The context in which the error occurred
   * @returns Whether the error was handled successfully
   */
  handleError(error: Error | CompilerError, context: unknown): boolean {
    // Convert regular Error to CompilerError if needed
    const compilerError = error instanceof CompilerError 
      ? error 
      : new CompilerError(error.message, {
          type: 'general',
          details: this.options.showStackTraces ? error.stack : undefined,
          recoverable: false,
          originalError: error
        });
    
    // Downgrade to warning if configured and error is recoverable
    if (this.options.downgradeRecoverableErrors && compilerError.recoverable) {
      errorLogger.warn(compilerError);
    } else {
      // Log the error
      errorLogger.error(compilerError);
    }
    
    // Collect related errors if enabled
    if (this.options.collectRelatedErrors && compilerError.code) {
      const relatedList = this.relatedErrors.get(compilerError.code) || [];
      relatedList.push(compilerError);
      this.relatedErrors.set(compilerError.code, relatedList);
    }
    
    // Try to recover if enabled
    if (this.options.attemptRecovery && compilerError.recoverable) {
      const recovered = errorRecoveryManager.tryRecover(compilerError, context);
      if (recovered) {
        return true;
      }
    }
    
    // Throw if configured to do so
    if (this.options.throwOnError) {
      throw compilerError;
    }
    
    return false;
  }
  
  /**
   * Handle multiple errors
   * 
   * @param errors Array of errors to handle
   * @param context The context in which the errors occurred
   * @returns Number of errors successfully handled
   */
  handleMultipleErrors(errors: (Error | CompilerError)[], context: unknown): number {
    let handledCount = 0;
    
    for (const error of errors) {
      if (this.handleError(error, context)) {
        handledCount++;
      }
    }
    
    return handledCount;
  }
  
  /**
   * Create an error recovery context from a compilation context
   * 
   * @param compilationContext The compilation context
   * @param phase The current compilation phase
   * @param additionalContext Additional context information
   * @returns An error recovery context
   */
  createErrorRecoveryContext(
    compilationContext: CompilationContext,
    phase: ErrorRecoveryContext['phase'],
    additionalContext: Partial<Omit<ErrorRecoveryContext, 'phase' | 'compilationContext'>> = {}
  ): ErrorRecoveryContext {
    return {
      phase,
      compilationContext,
      ...additionalContext
    };
  }
  
  /**
   * Run diagnostics on a compilation context
   * 
   * @param context The compilation context
   * @param options Diagnostic options
   * @returns Diagnostic result
   */
  async runDiagnostics(
    context: CompilationContext,
    options: DiagnosticOptions = {}
  ): Promise<DiagnosticResult> {
    if (!context.config) {
      return {
        valid: false,
        errors: [{
          type: 'validation',
          message: 'No configuration available for diagnostics'
        }],
        warnings: [],
        suggestions: []
      };
    }
    
    try {
      // Configure diagnostic tool
      diagnosticTool.setLogLevel(this.options.logLevel || LogLevel.ERROR);
      
      // Run diagnostics
      return await diagnosticTool.analyzeConfiguration(context.config, options);
    } catch (error) {
      // Handle diagnostic errors
      this.handleError(error, this.createErrorRecoveryContext(context, 'parse'));
      
      return {
        valid: false,
        errors: [{
          type: 'validation',
          message: `Diagnostics failed: ${error instanceof Error ? error.message : String(error)}`
        }],
        warnings: [],
        suggestions: []
      };
    }
  }
  
  /**
   * Get related errors for a specific error code
   * 
   * @param errorCode The error code to get related errors for
   * @returns Array of related errors
   */
  getRelatedErrors(errorCode: string): CompilerError[] {
    return this.relatedErrors.get(errorCode) || [];
  }
  
  /**
   * Clear related errors
   */
  clearRelatedErrors(): void {
    this.relatedErrors.clear();
  }
  
  /**
   * Get error summary
   * 
   * @returns Summary of errors by type and code
   */
  getErrorSummary(): { byType: Record<string, number>; byCode: Record<string, number> } {
    const byType: Record<string, number> = {};
    const byCode: Record<string, number> = {};
    
    for (const [code, errors] of this.relatedErrors.entries()) {
      byCode[code] = errors.length;
      
      for (const error of errors) {
        byType[error.type] = (byType[error.type] || 0) + 1;
      }
    }
    
    return { byType, byCode };
  }
  
  /**
   * Register a custom recovery strategy
   * 
   * @param errorCode The error code to register the strategy for
   * @param strategy The recovery strategy
   */
  registerRecoveryStrategy(errorCode: string, strategy: RecoveryStrategy): void {
    errorRecoveryManager.registerRecoveryStrategy(errorCode, strategy);
  }
  
  /**
   * Register a fallback recovery strategy
   * 
   * @param strategy The fallback recovery strategy
   */
  registerFallbackStrategy(strategy: RecoveryStrategy): void {
    errorRecoveryManager.registerFallbackStrategy(strategy);
  }
  
  /**
   * Create a validation error
   */
  createValidationError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}): ValidationError {
    return new ValidationError(message, options);
  }
  
  /**
   * Create a component error
   */
  createComponentError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}): ComponentError {
    return new ComponentError(message, options);
  }
  
  /**
   * Create a template error
   */
  createTemplateError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}): TemplateError {
    return new TemplateError(message, options);
  }
  
  /**
   * Create a file error
   */
  createFileError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}): FileError {
    return new FileError(message, options);
  }
  
  /**
   * Create a dependency error
   */
  createDependencyError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}): DependencyError {
    return new DependencyError(message, options);
  }
  
  /**
   * Create a route error
   */
  createRouteError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}): RouteError {
    return new RouteError(message, options);
  }
  
  /**
   * Create an API error
   */
  createApiError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}): ApiError {
    return new ApiError(message, options);
  }
  
  /**
   * Create a compilation process error
   */
  createCompilationError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
    phase?: string;
  } = {}): CompilationProcessError {
    return new CompilationProcessError(message, options);
  }
  
  /**
   * Create a configuration error
   */
  createConfigurationError(message: string, options: {
    details?: string;
    location?: ErrorLocation;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
    severity?: ErrorSeverity;
  } = {}): ConfigurationError {
    return new ConfigurationError(message, options);
  }
}

// Export a default instance
export const errorHandler = new CompilerErrorHandler();