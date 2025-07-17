// Enhanced error handling for the compiler with advanced recovery strategies
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
import { CompilerErrorHandler, ErrorHandlingOptions } from "./compiler-error-handling.ts";
import { registerEnhancedRecoveryStrategies } from "./error-recovery-enhanced.ts";
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
 * Error recovery modes
 */
export enum ErrorRecoveryMode {
  /** Only attempt recovery for low-severity errors */
  CONSERVATIVE = 'conservative',
  /** Attempt recovery for low and medium severity errors (default) */
  SMART = 'smart',
  /** Attempt recovery for all errors, including high severity ones */
  AGGRESSIVE = 'aggressive'
}

/**
 * Error classification modes
 */
export enum ErrorClassification {
  /** Classify errors based on standard rules */
  STANDARD = 'standard',
  /** Classify errors more strictly, treating more errors as high severity */
  STRICT = 'strict',
  /** Classify errors more leniently, treating more errors as low severity */
  LENIENT = 'lenient'
}

/**
 * Error severity levels
 */
export enum ErrorSeverityLevel {
  /** Critical errors that should never be recovered from */
  CRITICAL = 'critical',
  /** High severity errors that should generally not be recovered from */
  HIGH = 'high',
  /** Medium severity errors that can be recovered from in some cases */
  MEDIUM = 'medium',
  /** Low severity errors that can usually be recovered from */
  LOW = 'low'
}

/**
 * Enhanced error handling options
 */
export interface EnhancedErrorHandlingOptions extends ErrorHandlingOptions {
  /** Error recovery mode */
  recoveryMode?: ErrorRecoveryMode;
  /** Error classification mode */
  errorClassification?: ErrorClassification;
  /** Maximum number of recovery attempts per compilation phase */
  maxRecoveryAttemptsPerPhase?: number;
  /** Whether to collect error metrics */
  collectErrorMetrics?: boolean;
  /** Whether to use phase-specific recovery strategies */
  usePhaseSpecificStrategies?: boolean;
  /** Whether to automatically retry failed recoveries with different strategies */
  autoRetryWithFallbacks?: boolean;
  /** Whether to generate detailed error reports */
  generateDetailedReports?: boolean;
  /** Whether to track error patterns */
  trackErrorPatterns?: boolean;
}

/**
 * Error history entry
 */
export interface ErrorHistoryEntry {
  /** The error that occurred */
  error: CompilerError;
  /** The compilation phase when the error occurred */
  phase: ErrorRecoveryContext['phase'];
  /** Whether the error was recovered from */
  recovered: boolean;
  /** The recovery strategy used, if any */
  recoveryStrategy?: string;
  /** The time when the error occurred */
  timestamp: Date;
  /** The severity level of the error */
  severityLevel: ErrorSeverityLevel;
  /** Additional context about the error */
  context?: {
    /** The file being processed when the error occurred */
    file?: string;
    /** The component being processed when the error occurred */
    component?: string;
    /** The route being processed when the error occurred */
    route?: string;
    /** The API endpoint being processed when the error occurred */
    apiEndpoint?: string;
  };
}

/**
 * Error metrics
 */
export interface ErrorMetrics {
  /** Total number of errors */
  totalErrors: number;
  /** Number of errors by type */
  errorCountByType: Record<string, number>;
  /** Number of errors by phase */
  errorCountByPhase: Record<string, number>;
  /** Number of errors by severity level */
  errorCountBySeverity: Record<string, number>;
  /** Number of recovery attempts */
  recoveryAttempts: number;
  /** Number of successful recoveries */
  successfulRecoveries: number;
  /** Average time spent on recovery attempts (ms) */
  averageRecoveryTime: number;
  /** Most common error types */
  mostCommonErrors: Array<{
    type: string;
    code?: string;
    count: number;
  }>;
  /** Error patterns detected */
  errorPatterns?: Array<{
    pattern: string;
    count: number;
    description: string;
  }>;
}

/**
 * Error summary
 */
export interface ErrorSummary {
  /** Total number of errors */
  totalErrors: number;
  /** Number of recovered errors */
  recoveredErrors: number;
  /** Number of errors by type */
  byType: Record<string, number>;
  /** Number of errors by phase */
  byPhase: Record<string, number>;
  /** Number of errors by severity level */
  bySeverity: Record<string, number>;
  /** Most common error codes */
  mostCommonCodes: Array<{
    code: string;
    count: number;
  }>;
}

/**
 * Custom error classifier function
 */
export type ErrorClassifierFn = (error: CompilerError) => ErrorSeverityLevel | null;

/**
 * Enhanced error handling manager for the compiler
 */
export class EnhancedCompilerErrorHandler extends CompilerErrorHandler {
  private enhancedOptions: EnhancedErrorHandlingOptions;
  private errorHistory: ErrorHistoryEntry[] = [];
  private recoveryAttemptsByPhase: Map<string, number> = new Map();
  private recoveryTimeTotal = 0;
  private recoveryAttemptCount = 0;
  private successfulRecoveryCount = 0;
  private phaseSpecificStrategies: Map<string, Map<string, RecoveryStrategy>> = new Map();
  private customErrorClassifiers: ErrorClassifierFn[] = [];
  
  /**
   * Create a new enhanced error handler
   * 
   * @param options Enhanced error handling options
   */
  constructor(options: EnhancedErrorHandlingOptions = {}) {
    // Initialize base class with standard options
    super(options);
    
    // Set enhanced options with defaults
    this.enhancedOptions = {
      recoveryMode: ErrorRecoveryMode.SMART,
      errorClassification: ErrorClassification.STANDARD,
      maxRecoveryAttemptsPerPhase: 5,
      collectErrorMetrics: false,
      usePhaseSpecificStrategies: true,
      autoRetryWithFallbacks: true,
      generateDetailedReports: false,
      trackErrorPatterns: false,
      ...options
    };
    
    // Register enhanced recovery strategies
    registerEnhancedRecoveryStrategies();
    
    // Initialize phase-specific strategies for each phase
    for (const phase of ['parse', 'plan', 'generate', 'integrate', 'optimize'] as const) {
      this.phaseSpecificStrategies.set(phase, new Map());
    }
  }
  
  /**
   * Get the current options
   */
  getOptions(): EnhancedErrorHandlingOptions {
    return this.enhancedOptions;
  }
  
  /**
   * Set enhanced error handling options
   * 
   * @param options Enhanced error handling options
   */
  setOptions(options: Partial<EnhancedErrorHandlingOptions>): void {
    // Update base class options
    super.setOptions(options);
    
    // Update enhanced options
    this.enhancedOptions = {
      ...this.enhancedOptions,
      ...options
    };
  }
  
  /**
   * Handle an error with enhanced recovery strategies
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
          details: this.enhancedOptions.showStackTraces ? error.stack : undefined,
          recoverable: false,
          originalError: error
        });
    
    // Get the recovery context
    const recoveryContext = context as ErrorRecoveryContext;
    
    // Classify the error
    const severityLevel = this.classifyError(compilerError);
    
    // Add to error history
    this.addToErrorHistory(compilerError, recoveryContext, severityLevel);
    
    // Downgrade to warning if configured and error is recoverable
    if (this.enhancedOptions.downgradeRecoverableErrors && compilerError.recoverable) {
      errorLogger.warn(compilerError);
    } else {
      // Log the error
      errorLogger.error(compilerError);
    }
    
    // Check if we should attempt recovery
    if (this.shouldAttemptRecovery(compilerError, recoveryContext)) {
      // Track recovery attempt
      this.trackRecoveryAttempt(recoveryContext.phase);
      
      // Try phase-specific recovery first if enabled
      if (this.enhancedOptions.usePhaseSpecificStrategies) {
        const phaseStrategies = this.phaseSpecificStrategies.get(recoveryContext.phase);
        if (phaseStrategies && phaseStrategies.has(compilerError.code)) {
          const strategy = phaseStrategies.get(compilerError.code)!;
          const startTime = performance.now();
          const result = this.executeRecoveryStrategy(strategy, compilerError, context);
          this.trackRecoveryTime(performance.now() - startTime);
          
          if (result) {
            this.updateErrorHistoryWithRecovery(compilerError, `phase-specific:${compilerError.code}`);
            return true;
          }
        }
      }
      
      // Try standard recovery
      const startTime = performance.now();
      const recovered = errorRecoveryManager.tryRecover(compilerError, context);
      this.trackRecoveryTime(performance.now() - startTime);
      
      if (recovered) {
        this.updateErrorHistoryWithRecovery(compilerError, compilerError.code);
        return true;
      }
      
      // If auto-retry with fallbacks is enabled and the error is recoverable
      if (this.enhancedOptions.autoRetryWithFallbacks && compilerError.recoverable) {
        // Try with generic fallback strategies based on error type
        const fallbackResult = this.tryFallbackRecovery(compilerError, context);
        if (fallbackResult) {
          this.updateErrorHistoryWithRecovery(compilerError, `fallback:${compilerError.type}`);
          return true;
        }
      }
    }
    
    // Throw if configured to do so
    if (this.enhancedOptions.throwOnError) {
      throw compilerError;
    }
    
    return false;
  }
  
  /**
   * Handle multiple errors with enhanced recovery strategies
   * 
   * @param errors Array of errors to handle
   * @param context The context in which the errors occurred
   * @returns Number of errors successfully handled
   */
  handleMultipleErrors(errors: (Error | CompilerError)[], context: unknown): number {
    let handledCount = 0;
    
    // Sort errors by severity to handle less severe errors first
    const sortedErrors = [...errors].sort((a, b) => {
      const errorA = a instanceof CompilerError ? a : new CompilerError(a.message);
      const errorB = b instanceof CompilerError ? b : new CompilerError(b.message);
      
      const severityA = this.classifyError(errorA);
      const severityB = this.classifyError(errorB);
      
      // Sort by severity level (LOW first, CRITICAL last)
      return this.getSeverityValue(severityA) - this.getSeverityValue(severityB);
    });
    
    for (const error of sortedErrors) {
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
   * Classify an error by severity level
   * 
   * @param error The error to classify
   * @returns The severity level of the error
   */
  classifyError(error: CompilerError): ErrorSeverityLevel {
    // Try custom classifiers first
    for (const classifier of this.customErrorClassifiers) {
      const result = classifier(error);
      if (result !== null) {
        return result;
      }
    }
    
    // If the error is explicitly marked as non-recoverable, it's critical
    if (error.recoverable === false) {
      return ErrorSeverityLevel.HIGH;
    }
    
    // Classification based on error type and classification mode
    switch (error.type) {
      case 'validation':
      case 'compilation':
        // Validation and compilation errors are generally high severity
        return ErrorSeverityLevel.HIGH;
        
      case 'component':
      case 'template':
      case 'route':
      case 'api':
      case 'dependency':
        // These are medium severity by default
        if (this.enhancedOptions.errorClassification === ErrorClassification.STRICT) {
          return ErrorSeverityLevel.HIGH;
        } else if (this.enhancedOptions.errorClassification === ErrorClassification.LENIENT) {
          return ErrorSeverityLevel.LOW;
        }
        return ErrorSeverityLevel.MEDIUM;
        
      case 'file':
      case 'general':
        // These are low severity by default
        if (this.enhancedOptions.errorClassification === ErrorClassification.STRICT) {
          return ErrorSeverityLevel.MEDIUM;
        }
        return ErrorSeverityLevel.LOW;
        
      default:
        // Unknown error types are medium severity
        return ErrorSeverityLevel.MEDIUM;
    }
  }
  
  /**
   * Determine if recovery should be attempted for an error
   * 
   * @param error The error to check
   * @param context The recovery context
   * @returns Whether recovery should be attempted
   */
  shouldAttemptRecovery(error: CompilerError, context: ErrorRecoveryContext): boolean {
    // If recovery is disabled, don't attempt
    if (!this.enhancedOptions.attemptRecovery) {
      return false;
    }
    
    // If the error is explicitly marked as non-recoverable, don't attempt
    if (error.recoverable === false) {
      return false;
    }
    
    // Check if we've exceeded the maximum number of recovery attempts for this phase
    const phase = context.phase;
    const attempts = this.recoveryAttemptsByPhase.get(phase) || 0;
    if (attempts >= (this.enhancedOptions.maxRecoveryAttemptsPerPhase || 5)) {
      errorLogger.warn(`Maximum recovery attempts (${this.enhancedOptions.maxRecoveryAttemptsPerPhase}) exceeded for phase ${phase}`);
      return false;
    }
    
    // Determine if we should attempt recovery based on the recovery mode and error severity
    const severityLevel = this.classifyError(error);
    
    switch (this.enhancedOptions.recoveryMode) {
      case ErrorRecoveryMode.CONSERVATIVE:
        // Only attempt recovery for low severity errors
        return severityLevel === ErrorSeverityLevel.LOW;
        
      case ErrorRecoveryMode.SMART:
        // Attempt recovery for low and medium severity errors
        return severityLevel === ErrorSeverityLevel.LOW || severityLevel === ErrorSeverityLevel.MEDIUM;
        
      case ErrorRecoveryMode.AGGRESSIVE:
        // Attempt recovery for all errors
        return true;
        
      default:
        // Default to smart mode
        return severityLevel === ErrorSeverityLevel.LOW || severityLevel === ErrorSeverityLevel.MEDIUM;
    }
  }  /*
*
   * Try to recover from an error using fallback strategies
   * 
   * @param error The error to recover from
   * @param context The context in which the error occurred
   * @returns Whether recovery was successful
   */
  private tryFallbackRecovery(error: CompilerError, context: unknown): boolean {
    // Create a fallback strategy based on the error type
    const fallbackStrategy: RecoveryStrategy = {
      recover: (err: CompilerError, ctx: unknown): RecoveryResult => {
        const recoveryContext = ctx as ErrorRecoveryContext;
        const phase = recoveryContext.phase;
        
        // Different fallback strategies based on error type and phase
        switch (err.type) {
          case 'component':
            return {
              success: true,
              message: `Applied fallback recovery for component error in ${phase} phase`,
              data: {
                fallbackComponent: {
                  id: `fallback_${Date.now().toString(36)}`,
                  type: 'FallbackComponent',
                  props: {
                    originalError: err.message,
                    showError: true
                  }
                }
              },
              downgradeToWarning: true
            };
            
          case 'template':
            return {
              success: true,
              message: `Applied fallback recovery for template error in ${phase} phase`,
              data: {
                fallbackTemplate: 'default',
                skipProcessing: true
              },
              downgradeToWarning: true
            };
            
          case 'route':
            return {
              success: true,
              message: `Applied fallback recovery for route error in ${phase} phase`,
              data: {
                fallbackRoute: {
                  path: recoveryContext.currentRoute?.path || '/fallback',
                  component: 'ErrorBoundary'
                }
              },
              downgradeToWarning: true
            };
            
          case 'api':
            return {
              success: true,
              message: `Applied fallback recovery for API error in ${phase} phase`,
              data: {
                fallbackEndpoint: {
                  path: recoveryContext.currentApiEndpoint?.path || '/api/fallback',
                  methods: ['GET'],
                  handler: 'defaultErrorHandler'
                }
              },
              downgradeToWarning: true
            };
            
          case 'file':
            return {
              success: true,
              message: `Applied fallback recovery for file error in ${phase} phase`,
              data: {
                skipFile: true,
                fallbackContent: '// This file was generated as a fallback due to an error\n'
              },
              downgradeToWarning: true
            };
            
          default:
            return { success: false };
        }
      }
    };
    
    // Execute the fallback strategy
    return this.executeRecoveryStrategy(fallbackStrategy, error, context);
  }
  
  /**
   * Execute a recovery strategy
   * 
   * @param strategy The recovery strategy to execute
   * @param error The error to recover from
   * @param context The context in which the error occurred
   * @returns Whether recovery was successful
   */
  private executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    error: CompilerError,
    context: unknown
  ): boolean {
    try {
      const result = strategy.recover(error, context);
      
      if (result.success) {
        // Log recovery message
        if (result.message) {
          errorLogger.warn(result.message);
        } else {
          errorLogger.warn(`Recovered from error: ${error.message}`);
        }
        
        // If the strategy provided a downgraded error, add it as a warning
        if (result.downgradeToWarning) {
          const warningMessage = `[DOWNGRADED] ${error.format()}`;
          errorLogger.warn(warningMessage);
        }
        
        // Track successful recovery
        this.successfulRecoveryCount++;
        
        return true;
      } else {
        // If the strategy failed but provided a different error, use that instead
        if (result.alternativeError) {
          errorLogger.error(result.alternativeError);
        }
        
        return false;
      }
    } catch (e) {
      // Recovery strategy threw an exception
      errorLogger.error(`Recovery strategy failed with exception: ${e instanceof Error ? e.message : String(e)}`);
      return false;
    }
  }
  
  /**
   * Add an error to the error history
   * 
   * @param error The error to add
   * @param context The context in which the error occurred
   * @param severityLevel The severity level of the error
   */
  private addToErrorHistory(
    error: CompilerError,
    context: ErrorRecoveryContext,
    severityLevel: ErrorSeverityLevel
  ): void {
    this.errorHistory.push({
      error,
      phase: context.phase,
      recovered: false,
      timestamp: new Date(),
      severityLevel,
      context: {
        file: context.currentFile,
        component: context.currentComponent?.id,
        route: context.currentRoute?.path,
        apiEndpoint: context.currentApiEndpoint?.path
      }
    });
  }
  
  /**
   * Update the error history with recovery information
   * 
   * @param error The error that was recovered from
   * @param strategyName The name of the recovery strategy used
   */
  private updateErrorHistoryWithRecovery(error: CompilerError, strategyName: string): void {
    // Find the error in the history
    const entry = this.errorHistory.find(e => e.error === error);
    if (entry) {
      entry.recovered = true;
      entry.recoveryStrategy = strategyName;
    }
  }
  
  /**
   * Track a recovery attempt for a phase
   * 
   * @param phase The compilation phase
   */
  private trackRecoveryAttempt(phase: string): void {
    const attempts = this.recoveryAttemptsByPhase.get(phase) || 0;
    this.recoveryAttemptsByPhase.set(phase, attempts + 1);
    this.recoveryAttemptCount++;
  }
  
  /**
   * Track recovery time
   * 
   * @param time The time spent on recovery (ms)
   */
  private trackRecoveryTime(time: number): void {
    this.recoveryTimeTotal += time;
  }
  
  /**
   * Get the numeric value of a severity level for sorting
   * 
   * @param severity The severity level
   * @returns The numeric value
   */
  private getSeverityValue(severity: ErrorSeverityLevel): number {
    switch (severity) {
      case ErrorSeverityLevel.LOW:
        return 0;
      case ErrorSeverityLevel.MEDIUM:
        return 1;
      case ErrorSeverityLevel.HIGH:
        return 2;
      case ErrorSeverityLevel.CRITICAL:
        return 3;
      default:
        return 1;
    }
  }
  
  /**
   * Get the error history
   * 
   * @returns The error history
   */
  getErrorHistory(): ErrorHistoryEntry[] {
    return [...this.errorHistory];
  }
  
  /**
   * Clear the error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.recoveryAttemptsByPhase.clear();
    this.recoveryAttemptCount = 0;
    this.successfulRecoveryCount = 0;
    this.recoveryTimeTotal = 0;
  }
  
  /**
   * Get errors by phase
   * 
   * @param phase The compilation phase
   * @returns Errors that occurred during the specified phase
   */
  getErrorsByPhase(phase: ErrorRecoveryContext['phase']): ErrorHistoryEntry[] {
    return this.errorHistory.filter(entry => entry.phase === phase);
  }
  
  /**
   * Get errors by type
   * 
   * @param type The error type
   * @returns Errors of the specified type
   */
  getErrorsByType(type: string): ErrorHistoryEntry[] {
    return this.errorHistory.filter(entry => entry.error.type === type);
  }
  
  /**
   * Get errors by severity level
   * 
   * @param severityLevel The severity level
   * @returns Errors with the specified severity level
   */
  getErrorsBySeverity(severityLevel: ErrorSeverityLevel): ErrorHistoryEntry[] {
    return this.errorHistory.filter(entry => entry.severityLevel === severityLevel);
  }  /
**
   * Get a summary of errors
   * 
   * @returns Error summary
   */
  getErrorSummary(): ErrorSummary {
    const byType: Record<string, number> = {};
    const byPhase: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const codeCounts: Record<string, number> = {};
    
    for (const entry of this.errorHistory) {
      // Count by type
      byType[entry.error.type] = (byType[entry.error.type] || 0) + 1;
      
      // Count by phase
      byPhase[entry.phase] = (byPhase[entry.phase] || 0) + 1;
      
      // Count by severity
      bySeverity[entry.severityLevel] = (bySeverity[entry.severityLevel] || 0) + 1;
      
      // Count by code
      if (entry.error.code) {
        codeCounts[entry.error.code] = (codeCounts[entry.error.code] || 0) + 1;
      }
    }
    
    // Get most common error codes
    const mostCommonCodes = Object.entries(codeCounts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalErrors: this.errorHistory.length,
      recoveredErrors: this.errorHistory.filter(entry => entry.recovered).length,
      byType,
      byPhase,
      bySeverity,
      mostCommonCodes
    };
  }
  
  /**
   * Get error metrics
   * 
   * @returns Error metrics
   */
  getErrorMetrics(): ErrorMetrics {
    // Only collect metrics if enabled
    if (!this.enhancedOptions.collectErrorMetrics) {
      return {
        totalErrors: this.errorHistory.length,
        errorCountByType: {},
        errorCountByPhase: {},
        errorCountBySeverity: {},
        recoveryAttempts: this.recoveryAttemptCount,
        successfulRecoveries: this.successfulRecoveryCount,
        averageRecoveryTime: 0,
        mostCommonErrors: []
      };
    }
    
    const errorCountByType: Record<string, number> = {};
    const errorCountByPhase: Record<string, number> = {};
    const errorCountBySeverity: Record<string, number> = {};
    const errorTypeCounts: Record<string, number> = {};
    
    for (const entry of this.errorHistory) {
      // Count by type
      errorCountByType[entry.error.type] = (errorCountByType[entry.error.type] || 0) + 1;
      
      // Count by phase
      errorCountByPhase[entry.phase] = (errorCountByPhase[entry.phase] || 0) + 1;
      
      // Count by severity
      errorCountBySeverity[entry.severityLevel] = (errorCountBySeverity[entry.severityLevel] || 0) + 1;
      
      // Count by type and code
      const typeCode = `${entry.error.type}:${entry.error.code || 'unknown'}`;
      errorTypeCounts[typeCode] = (errorTypeCounts[typeCode] || 0) + 1;
    }
    
    // Get most common error types
    const mostCommonErrors = Object.entries(errorTypeCounts)
      .map(([typeCode, count]) => {
        const [type, code] = typeCode.split(':');
        return { type, code, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate average recovery time
    const averageRecoveryTime = this.recoveryAttemptCount > 0
      ? this.recoveryTimeTotal / this.recoveryAttemptCount
      : 0;
    
    // Detect error patterns if enabled
    let errorPatterns;
    if (this.enhancedOptions.trackErrorPatterns) {
      errorPatterns = this.detectErrorPatterns();
    }
    
    return {
      totalErrors: this.errorHistory.length,
      errorCountByType,
      errorCountByPhase,
      errorCountBySeverity,
      recoveryAttempts: this.recoveryAttemptCount,
      successfulRecoveries: this.successfulRecoveryCount,
      averageRecoveryTime,
      mostCommonErrors,
      errorPatterns
    };
  }
  
  /**
   * Detect error patterns
   * 
   * @returns Detected error patterns
   */
  private detectErrorPatterns(): Array<{
    pattern: string;
    count: number;
    description: string;
  }> {
    const patterns: Array<{
      pattern: string;
      count: number;
      description: string;
    }> = [];
    
    // Check for consecutive errors of the same type
    let consecutiveCount = 1;
    let previousType = '';
    let previousPhase = '';
    
    for (let i = 1; i < this.errorHistory.length; i++) {
      const current = this.errorHistory[i];
      const previous = this.errorHistory[i - 1];
      
      if (current.error.type === previous.error.type && current.phase === previous.phase) {
        consecutiveCount++;
        previousType = current.error.type;
        previousPhase = current.phase;
      } else {
        if (consecutiveCount >= 3) {
          patterns.push({
            pattern: `consecutive_${previousType}_errors`,
            count: consecutiveCount,
            description: `${consecutiveCount} consecutive ${previousType} errors in ${previousPhase} phase`
          });
        }
        consecutiveCount = 1;
      }
    }
    
    // Check for the final sequence
    if (consecutiveCount >= 3) {
      patterns.push({
        pattern: `consecutive_${previousType}_errors`,
        count: consecutiveCount,
        description: `${consecutiveCount} consecutive ${previousType} errors in ${previousPhase} phase`
      });
    }
    
    // Check for errors that always occur together
    const phaseCounts: Record<string, Record<string, number>> = {};
    
    for (const entry of this.errorHistory) {
      if (!phaseCounts[entry.phase]) {
        phaseCounts[entry.phase] = {};
      }
      
      phaseCounts[entry.phase][entry.error.type] = (phaseCounts[entry.phase][entry.error.type] || 0) + 1;
    }
    
    for (const [phase, typeCounts] of Object.entries(phaseCounts)) {
      const types = Object.keys(typeCounts);
      
      if (types.length >= 2) {
        // Check if all types have the same count
        const counts = Object.values(typeCounts);
        const allSameCount = counts.every(count => count === counts[0]);
        
        if (allSameCount && counts[0] >= 2) {
          patterns.push({
            pattern: `correlated_errors_${phase}`,
            count: counts[0],
            description: `Correlated errors in ${phase} phase: ${types.join(', ')}`
          });
        }
      }
    }
    
    return patterns;
  }
  
  /**
   * Format error summary as a string
   * 
   * @returns Formatted error summary
   */
  formatErrorSummary(): string {
    const summary = this.getErrorSummary();
    
    let result = `Error Summary\n`;
    result += `============\n\n`;
    result += `Total Errors: ${summary.totalErrors}\n`;
    result += `Recovered Errors: ${summary.recoveredErrors}\n\n`;
    
    result += `By Type:\n`;
    for (const [type, count] of Object.entries(summary.byType)) {
      result += `  ${type}: ${count}\n`;
    }
    result += `\n`;
    
    result += `By Phase:\n`;
    for (const [phase, count] of Object.entries(summary.byPhase)) {
      result += `  ${phase}: ${count}\n`;
    }
    result += `\n`;
    
    result += `By Severity:\n`;
    for (const [severity, count] of Object.entries(summary.bySeverity)) {
      result += `  ${severity}: ${count}\n`;
    }
    result += `\n`;
    
    if (summary.mostCommonCodes.length > 0) {
      result += `Most Common Error Codes:\n`;
      for (const { code, count } of summary.mostCommonCodes) {
        result += `  ${code}: ${count}\n`;
      }
    }
    
    return result;
  }
  
  /**
   * Generate a detailed error report
   * 
   * @returns Detailed error report
   */
  generateDetailedReport(): string {
    if (!this.enhancedOptions.generateDetailedReports) {
      return this.formatErrorSummary();
    }
    
    const summary = this.getErrorSummary();
    const metrics = this.getErrorMetrics();
    
    let report = `Detailed Error Report\n`;
    report += `====================\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += `Summary\n`;
    report += `-------\n`;
    report += `Total Errors: ${summary.totalErrors}\n`;
    report += `Recovered Errors: ${summary.recoveredErrors}\n`;
    report += `Recovery Rate: ${summary.totalErrors > 0 ? Math.round((summary.recoveredErrors / summary.totalErrors) * 100) : 0}%\n`;
    report += `Recovery Attempts: ${metrics.recoveryAttempts}\n`;
    report += `Successful Recoveries: ${metrics.successfulRecoveries}\n`;
    report += `Average Recovery Time: ${metrics.averageRecoveryTime.toFixed(2)}ms\n\n`;
    
    report += `Error Distribution\n`;
    report += `----------------\n`;
    report += `By Type:\n`;
    for (const [type, count] of Object.entries(summary.byType)) {
      const percentage = Math.round((count / summary.totalErrors) * 100);
      report += `  ${type}: ${count} (${percentage}%)\n`;
    }
    report += `\n`;
    
    report += `By Phase:\n`;
    for (const [phase, count] of Object.entries(summary.byPhase)) {
      const percentage = Math.round((count / summary.totalErrors) * 100);
      report += `  ${phase}: ${count} (${percentage}%)\n`;
    }
    report += `\n`;
    
    report += `By Severity:\n`;
    for (const [severity, count] of Object.entries(summary.bySeverity)) {
      const percentage = Math.round((count / summary.totalErrors) * 100);
      report += `  ${severity}: ${count} (${percentage}%)\n`;
    }
    report += `\n`;
    
    if (summary.mostCommonCodes.length > 0) {
      report += `Most Common Error Codes:\n`;
      for (const { code, count } of summary.mostCommonCodes) {
        const percentage = Math.round((count / summary.totalErrors) * 100);
        report += `  ${code}: ${count} (${percentage}%)\n`;
      }
      report += `\n`;
    }
    
    if (metrics.errorPatterns && metrics.errorPatterns.length > 0) {
      report += `Error Patterns\n`;
      report += `-------------\n`;
      for (const pattern of metrics.errorPatterns) {
        report += `  ${pattern.description}\n`;
      }
      report += `\n`;
    }
    
    report += `Error History\n`;
    report += `------------\n`;
    for (let i = 0; i < Math.min(this.errorHistory.length, 10); i++) {
      const entry = this.errorHistory[i];
      report += `[${entry.timestamp.toISOString()}] ${entry.error.type.toUpperCase()}: ${entry.error.message}\n`;
      report += `  Phase: ${entry.phase}\n`;
      report += `  Severity: ${entry.severityLevel}\n`;
      report += `  Recovered: ${entry.recovered ? 'Yes' : 'No'}\n`;
      if (entry.recovered && entry.recoveryStrategy) {
        report += `  Recovery Strategy: ${entry.recoveryStrategy}\n`;
      }
      report += `\n`;
    }
    
    if (this.errorHistory.length > 10) {
      report += `... and ${this.errorHistory.length - 10} more errors\n`;
    }
    
    return report;
  }
  
  /**
   * Register a custom error classifier
   * 
   * @param classifier The classifier function
   */
  registerCustomErrorClassifier(classifier: ErrorClassifierFn): void {
    this.customErrorClassifiers.push(classifier);
  }
  
  /**
   * Register a phase-specific recovery strategy
   * 
   * @param phase The compilation phase
   * @param errorCode The error code
   * @param strategy The recovery strategy
   */
  registerPhaseSpecificRecoveryStrategy(
    phase: ErrorRecoveryContext['phase'],
    errorCode: string,
    strategy: RecoveryStrategy
  ): void {
    const phaseStrategies = this.phaseSpecificStrategies.get(phase);
    if (phaseStrategies) {
      phaseStrategies.set(errorCode, strategy);
    }
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
export const enhancedErrorHandler = new EnhancedCompilerErrorHandler();