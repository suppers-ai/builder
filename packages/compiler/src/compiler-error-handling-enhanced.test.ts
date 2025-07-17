// Unit tests for enhanced compiler error handling
import { assertEquals, assertStringIncludes, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
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
  errorLogger
} from "../../shared/src/errors.ts";
import { LogLevel } from "../../shared/src/enums.ts";
import { 
  CompilerErrorHandler, 
  ErrorHandlingOptions 
} from "./compiler-error-handling.ts";
import { 
  EnhancedCompilerErrorHandler, 
  EnhancedErrorHandlingOptions,
  ErrorClassification,
  ErrorSeverityLevel,
  ErrorRecoveryMode
} from "./compiler-error-handling-enhanced.ts";
import type { 
  CompilationContext, 
  ErrorRecoveryContext 
} from "../../shared/src/types.ts";

// Mock compilation context for testing
const mockCompilationContext: CompilationContext = {
  outputDir: '/output',
  templateDir: '/templates',
  configPath: '/config/app-config.json',
  verbose: false,
  dryRun: false
};

// Mock error recovery context for testing
const mockErrorRecoveryContext: ErrorRecoveryContext = {
  phase: 'generate',
  compilationContext: mockCompilationContext,
  currentComponent: {
    id: 'testComponent',
    type: 'Button',
    props: {
      label: 'Test Button'
    }
  },
  currentRoute: {
    path: '/test-route',
    component: 'testComponent'
  },
  currentApiEndpoint: {
    path: '/api/test',
    methods: ['GET', 'POST'],
    handler: 'testHandler'
  },
  currentFile: '/output/routes/test-route.tsx'
};

Deno.test("EnhancedCompilerErrorHandler - constructor with default options", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Check that default options were set
  assertEquals(handler.getOptions().throwOnError, false);
  assertEquals(handler.getOptions().attemptRecovery, true);
  assertEquals(handler.getOptions().logLevel, LogLevel.ERROR);
  assertEquals(handler.getOptions().recoveryMode, ErrorRecoveryMode.SMART);
});

Deno.test("EnhancedCompilerErrorHandler - constructor with custom options", () => {
  const options: EnhancedErrorHandlingOptions = {
    throwOnError: true,
    attemptRecovery: false,
    logLevel: LogLevel.DEBUG,
    includeSuggestions: false,
    recoveryMode: ErrorRecoveryMode.AGGRESSIVE,
    errorClassification: ErrorClassification.STRICT,
    maxRecoveryAttemptsPerPhase: 5,
    collectErrorMetrics: true
  };
  
  const handler = new EnhancedCompilerErrorHandler(options);
  
  // Check that custom options were set
  assertEquals(handler.getOptions().throwOnError, true);
  assertEquals(handler.getOptions().attemptRecovery, false);
  assertEquals(handler.getOptions().logLevel, LogLevel.DEBUG);
  assertEquals(handler.getOptions().includeSuggestions, false);
  assertEquals(handler.getOptions().recoveryMode, ErrorRecoveryMode.AGGRESSIVE);
  assertEquals(handler.getOptions().errorClassification, ErrorClassification.STRICT);
  assertEquals(handler.getOptions().maxRecoveryAttemptsPerPhase, 5);
  assertEquals(handler.getOptions().collectErrorMetrics, true);
});

Deno.test("EnhancedCompilerErrorHandler - setOptions", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Initial options
  assertEquals(handler.getOptions().throwOnError, false);
  assertEquals(handler.getOptions().recoveryMode, ErrorRecoveryMode.SMART);
  
  // Update options
  handler.setOptions({
    throwOnError: true,
    recoveryMode: ErrorRecoveryMode.CONSERVATIVE
  });
  
  // Check that options were updated
  assertEquals(handler.getOptions().throwOnError, true);
  assertEquals(handler.getOptions().recoveryMode, ErrorRecoveryMode.CONSERVATIVE);
  
  // Check that other options were not changed
  assertEquals(handler.getOptions().attemptRecovery, true);
  assertEquals(handler.getOptions().logLevel, LogLevel.ERROR);
});

Deno.test("EnhancedCompilerErrorHandler - handleError with non-recoverable error", () => {
  const handler = new EnhancedCompilerErrorHandler({
    throwOnError: false
  });
  
  // Create a non-recoverable error
  const error = new ValidationError("Invalid configuration", {
    recoverable: false
  });
  
  // Mock console.error to prevent output during test
  const originalConsoleError = console.error;
  let errorCalled = false;
  console.error = () => { errorCalled = true; };
  
  try {
    // Handle the error
    const handled = handler.handleError(error, mockErrorRecoveryContext);
    
    // Check that error was logged
    assertEquals(errorCalled, true);
    
    // Check that error was not handled (since it's not recoverable)
    assertEquals(handled, false);
    
    // Check that error was added to error history
    const errorHistory = handler.getErrorHistory();
    assertEquals(errorHistory.length, 1);
    assertEquals(errorHistory[0].error.message, "Invalid configuration");
    assertEquals(errorHistory[0].phase, "generate");
  } finally {
    // Restore console.error
    console.error = originalConsoleError;
  }
});

Deno.test("EnhancedCompilerErrorHandler - handleError with recoverable error", () => {
  const handler = new EnhancedCompilerErrorHandler({
    throwOnError: false
  });
  
  // Register a test recovery strategy
  errorRecoveryManager.registerRecoveryStrategy("TEST_RECOVERABLE_ERROR", {
    recover: () => ({
      success: true,
      message: "Recovered from test error"
    })
  });
  
  // Create a recoverable error
  const error = new ComponentError("Recoverable component error", {
    recoverable: true,
    code: "TEST_RECOVERABLE_ERROR"
  });
  
  // Mock console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  let errorCalled = false;
  let warnCalled = false;
  console.error = () => { errorCalled = true; };
  console.warn = () => { warnCalled = true; };
  
  try {
    // Handle the error
    const handled = handler.handleError(error, mockErrorRecoveryContext);
    
    // Check that error was logged
    assertEquals(errorCalled, true);
    
    // Check that warning was logged for recovery
    assertEquals(warnCalled, true);
    
    // Check that error was handled
    assertEquals(handled, true);
    
    // Check that error was added to error history
    const errorHistory = handler.getErrorHistory();
    assertEquals(errorHistory.length, 1);
    assertEquals(errorHistory[0].error.message, "Recoverable component error");
    assertEquals(errorHistory[0].recovered, true);
  } finally {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - handleError with throwOnError", () => {
  const handler = new EnhancedCompilerErrorHandler({
    throwOnError: true
  });
  
  // Create an error
  const error = new ValidationError("Invalid configuration");
  
  // Check that error is thrown
  try {
    handler.handleError(error, mockErrorRecoveryContext);
    // Should not reach here
    assertEquals(true, false, "Error should have been thrown");
  } catch (e) {
    assertEquals(e instanceof ValidationError, true);
    assertEquals(e.message, "Invalid configuration");
  }
});

Deno.test("EnhancedCompilerErrorHandler - handleMultipleErrors", () => {
  const handler = new EnhancedCompilerErrorHandler({
    throwOnError: false
  });
  
  // Register a test recovery strategy
  errorRecoveryManager.registerRecoveryStrategy("RECOVERABLE_TEST_ERROR", {
    recover: () => ({
      success: true,
      message: "Recovered from test error"
    })
  });
  
  // Create errors
  const error1 = new ValidationError("Invalid configuration", {
    recoverable: false
  });
  
  const error2 = new ComponentError("Recoverable component error", {
    recoverable: true,
    code: "RECOVERABLE_TEST_ERROR"
  });
  
  const error3 = new RouteError("Invalid route", {
    recoverable: false
  });
  
  // Mock console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  let errorCount = 0;
  let warnCount = 0;
  console.error = () => { errorCount++; };
  console.warn = () => { warnCount++; };
  
  try {
    // Handle multiple errors
    const handledCount = handler.handleMultipleErrors([error1, error2, error3], mockErrorRecoveryContext);
    
    // Check that errors were logged
    assertEquals(errorCount, 3);
    
    // Check that warning was logged for recovery
    assertEquals(warnCount >= 1, true);
    
    // Check that one error was handled
    assertEquals(handledCount, 1);
    
    // Check that errors were added to error history
    const errorHistory = handler.getErrorHistory();
    assertEquals(errorHistory.length, 3);
    assertEquals(errorHistory[0].error.message, "Invalid configuration");
    assertEquals(errorHistory[0].recovered, false);
    assertEquals(errorHistory[1].error.message, "Recoverable component error");
    assertEquals(errorHistory[1].recovered, true);
    assertEquals(errorHistory[2].error.message, "Invalid route");
    assertEquals(errorHistory[2].recovered, false);
  } finally {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - createErrorRecoveryContext", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Create error recovery context
  const context = handler.createErrorRecoveryContext(
    mockCompilationContext,
    'parse',
    {
      currentFile: '/config/app-config.json'
    }
  );
  
  // Check that context was created correctly
  assertEquals(context.phase, 'parse');
  assertEquals(context.compilationContext, mockCompilationContext);
  assertEquals(context.currentFile, '/config/app-config.json');
});

Deno.test("EnhancedCompilerErrorHandler - classifyError", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Test classification of different error types
  const validationError = new ValidationError("Invalid configuration");
  assertEquals(handler.classifyError(validationError), ErrorSeverityLevel.HIGH);
  
  const componentError = new ComponentError("Component error", { recoverable: true });
  assertEquals(handler.classifyError(componentError), ErrorSeverityLevel.MEDIUM);
  
  const templateError = new TemplateError("Template error", { recoverable: true });
  assertEquals(handler.classifyError(templateError), ErrorSeverityLevel.MEDIUM);
  
  const fileError = new FileError("File error", { recoverable: true });
  assertEquals(handler.classifyError(fileError), ErrorSeverityLevel.LOW);
});

Deno.test("EnhancedCompilerErrorHandler - shouldAttemptRecovery", () => {
  // Test with CONSERVATIVE mode
  const conservativeHandler = new EnhancedCompilerErrorHandler({
    recoveryMode: ErrorRecoveryMode.CONSERVATIVE
  });
  
  const highSeverityError = new ValidationError("Invalid configuration");
  assertEquals(conservativeHandler.shouldAttemptRecovery(highSeverityError, mockErrorRecoveryContext), false);
  
  const mediumSeverityError = new ComponentError("Component error", { recoverable: true });
  assertEquals(conservativeHandler.shouldAttemptRecovery(mediumSeverityError, mockErrorRecoveryContext), false);
  
  const lowSeverityError = new FileError("File error", { recoverable: true });
  assertEquals(conservativeHandler.shouldAttemptRecovery(lowSeverityError, mockErrorRecoveryContext), true);
  
  // Test with SMART mode
  const smartHandler = new EnhancedCompilerErrorHandler({
    recoveryMode: ErrorRecoveryMode.SMART
  });
  
  assertEquals(smartHandler.shouldAttemptRecovery(highSeverityError, mockErrorRecoveryContext), false);
  assertEquals(smartHandler.shouldAttemptRecovery(mediumSeverityError, mockErrorRecoveryContext), true);
  assertEquals(smartHandler.shouldAttemptRecovery(lowSeverityError, mockErrorRecoveryContext), true);
  
  // Test with AGGRESSIVE mode
  const aggressiveHandler = new EnhancedCompilerErrorHandler({
    recoveryMode: ErrorRecoveryMode.AGGRESSIVE
  });
  
  assertEquals(aggressiveHandler.shouldAttemptRecovery(highSeverityError, mockErrorRecoveryContext), true);
  assertEquals(aggressiveHandler.shouldAttemptRecovery(mediumSeverityError, mockErrorRecoveryContext), true);
  assertEquals(aggressiveHandler.shouldAttemptRecovery(lowSeverityError, mockErrorRecoveryContext), true);
});

Deno.test("EnhancedCompilerErrorHandler - getErrorSummary", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Add some errors
  handler.handleError(new ValidationError("Invalid configuration"), mockErrorRecoveryContext);
  handler.handleError(new ComponentError("Component error"), mockErrorRecoveryContext);
  handler.handleError(new ComponentError("Another component error"), mockErrorRecoveryContext);
  handler.handleError(new RouteError("Route error"), mockErrorRecoveryContext);
  
  // Get error summary
  const summary = handler.getErrorSummary();
  
  // Check summary
  assertEquals(summary.totalErrors, 4);
  assertEquals(summary.recoveredErrors, 0);
  assertEquals(summary.byType.validation, 1);
  assertEquals(summary.byType.component, 2);
  assertEquals(summary.byType.route, 1);
  assertEquals(summary.byPhase.generate, 4);
  assertEquals(summary.bySeverity[ErrorSeverityLevel.HIGH], 1);
  assertEquals(summary.bySeverity[ErrorSeverityLevel.MEDIUM], 3);
});

Deno.test("EnhancedCompilerErrorHandler - getErrorMetrics", () => {
  const handler = new EnhancedCompilerErrorHandler({
    collectErrorMetrics: true
  });
  
  // Add some errors
  handler.handleError(new ValidationError("Invalid configuration"), {
    ...mockErrorRecoveryContext,
    phase: 'parse'
  });
  
  handler.handleError(new ComponentError("Component error", {
    recoverable: true,
    code: "RECOVERABLE_TEST_ERROR"
  }), {
    ...mockErrorRecoveryContext,
    phase: 'generate'
  });
  
  handler.handleError(new RouteError("Route error"), {
    ...mockErrorRecoveryContext,
    phase: 'integrate'
  });
  
  // Get error metrics
  const metrics = handler.getErrorMetrics();
  
  // Check metrics
  assertEquals(metrics.errorCountByPhase.parse, 1);
  assertEquals(metrics.errorCountByPhase.generate, 1);
  assertEquals(metrics.errorCountByPhase.integrate, 1);
  assertEquals(metrics.errorCountByType.validation, 1);
  assertEquals(metrics.errorCountByType.component, 1);
  assertEquals(metrics.errorCountByType.route, 1);
  assertEquals(metrics.recoveryAttempts >= 0, true);
  assertEquals(metrics.successfulRecoveries >= 0, true);
  assertEquals(typeof metrics.averageRecoveryTime, "number");
});

Deno.test("EnhancedCompilerErrorHandler - clearErrorHistory", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Add some errors
  handler.handleError(new ValidationError("Invalid configuration"), mockErrorRecoveryContext);
  handler.handleError(new ComponentError("Component error"), mockErrorRecoveryContext);
  
  // Check that errors were added
  assertEquals(handler.getErrorHistory().length, 2);
  
  // Clear error history
  handler.clearErrorHistory();
  
  // Check that error history was cleared
  assertEquals(handler.getErrorHistory().length, 0);
});

Deno.test("EnhancedCompilerErrorHandler - getErrorsByPhase", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Add errors in different phases
  handler.handleError(new ValidationError("Parse error"), {
    ...mockErrorRecoveryContext,
    phase: 'parse'
  });
  
  handler.handleError(new ComponentError("Generate error 1"), {
    ...mockErrorRecoveryContext,
    phase: 'generate'
  });
  
  handler.handleError(new RouteError("Generate error 2"), {
    ...mockErrorRecoveryContext,
    phase: 'generate'
  });
  
  handler.handleError(new ApiError("Integrate error"), {
    ...mockErrorRecoveryContext,
    phase: 'integrate'
  });
  
  // Get errors by phase
  const parseErrors = handler.getErrorsByPhase('parse');
  const generateErrors = handler.getErrorsByPhase('generate');
  const integrateErrors = handler.getErrorsByPhase('integrate');
  const optimizeErrors = handler.getErrorsByPhase('optimize');
  
  // Check errors by phase
  assertEquals(parseErrors.length, 1);
  assertEquals(parseErrors[0].error.message, "Parse error");
  
  assertEquals(generateErrors.length, 2);
  assertEquals(generateErrors[0].error.message, "Generate error 1");
  assertEquals(generateErrors[1].error.message, "Generate error 2");
  
  assertEquals(integrateErrors.length, 1);
  assertEquals(integrateErrors[0].error.message, "Integrate error");
  
  assertEquals(optimizeErrors.length, 0);
});

Deno.test("EnhancedCompilerErrorHandler - getErrorsByType", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Add errors of different types
  handler.handleError(new ValidationError("Validation error"), mockErrorRecoveryContext);
  handler.handleError(new ComponentError("Component error 1"), mockErrorRecoveryContext);
  handler.handleError(new ComponentError("Component error 2"), mockErrorRecoveryContext);
  handler.handleError(new RouteError("Route error"), mockErrorRecoveryContext);
  
  // Get errors by type
  const validationErrors = handler.getErrorsByType('validation');
  const componentErrors = handler.getErrorsByType('component');
  const routeErrors = handler.getErrorsByType('route');
  const apiErrors = handler.getErrorsByType('api');
  
  // Check errors by type
  assertEquals(validationErrors.length, 1);
  assertEquals(validationErrors[0].error.message, "Validation error");
  
  assertEquals(componentErrors.length, 2);
  assertEquals(componentErrors[0].error.message, "Component error 1");
  assertEquals(componentErrors[1].error.message, "Component error 2");
  
  assertEquals(routeErrors.length, 1);
  assertEquals(routeErrors[0].error.message, "Route error");
  
  assertEquals(apiErrors.length, 0);
});

Deno.test("EnhancedCompilerErrorHandler - getErrorsBySeverity", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Add errors of different severities
  handler.handleError(new ValidationError("High severity error"), mockErrorRecoveryContext);
  handler.handleError(new ComponentError("Medium severity error"), mockErrorRecoveryContext);
  handler.handleError(new FileError("Low severity error", { recoverable: true }), mockErrorRecoveryContext);
  
  // Get errors by severity
  const highSeverityErrors = handler.getErrorsBySeverity(ErrorSeverityLevel.HIGH);
  const mediumSeverityErrors = handler.getErrorsBySeverity(ErrorSeverityLevel.MEDIUM);
  const lowSeverityErrors = handler.getErrorsBySeverity(ErrorSeverityLevel.LOW);
  
  // Check errors by severity
  assertEquals(highSeverityErrors.length, 1);
  assertEquals(highSeverityErrors[0].error.message, "High severity error");
  
  assertEquals(mediumSeverityErrors.length, 1);
  assertEquals(mediumSeverityErrors[0].error.message, "Medium severity error");
  
  assertEquals(lowSeverityErrors.length, 1);
  assertEquals(lowSeverityErrors[0].error.message, "Low severity error");
});

Deno.test("EnhancedCompilerErrorHandler - formatErrorSummary", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Add some errors
  handler.handleError(new ValidationError("Invalid configuration"), {
    ...mockErrorRecoveryContext,
    phase: 'parse'
  });
  
  handler.handleError(new ComponentError("Component error", {
    recoverable: true,
    code: "RECOVERABLE_TEST_ERROR"
  }), {
    ...mockErrorRecoveryContext,
    phase: 'generate'
  });
  
  handler.handleError(new RouteError("Route error"), {
    ...mockErrorRecoveryContext,
    phase: 'integrate'
  });
  
  // Format error summary
  const summary = handler.formatErrorSummary();
  
  // Check summary format
  assertStringIncludes(summary, "Error Summary");
  assertStringIncludes(summary, "Total Errors: 3");
  assertStringIncludes(summary, "By Type:");
  assertStringIncludes(summary, "validation: 1");
  assertStringIncludes(summary, "component: 1");
  assertStringIncludes(summary, "route: 1");
  assertStringIncludes(summary, "By Phase:");
  assertStringIncludes(summary, "parse: 1");
  assertStringIncludes(summary, "generate: 1");
  assertStringIncludes(summary, "integrate: 1");
});

Deno.test("EnhancedCompilerErrorHandler - createError methods", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Test createValidationError
  const validationError = handler.createValidationError("Invalid value", {
    details: "Value must be a string",
    recoverable: true
  });
  
  assertEquals(validationError instanceof ValidationError, true);
  assertEquals(validationError.message, "Invalid value");
  assertEquals(validationError.details, "Value must be a string");
  assertEquals(validationError.recoverable, true);
  
  // Test createComponentError
  const componentError = handler.createComponentError("Component not found", {
    details: "Button component",
    code: "COMPONENT_NOT_FOUND"
  });
  
  assertEquals(componentError instanceof ComponentError, true);
  assertEquals(componentError.message, "Component not found");
  assertEquals(componentError.details, "Button component");
  assertEquals(componentError.code, "COMPONENT_NOT_FOUND");
  
  // Test createRouteError
  const routeError = handler.createRouteError("Invalid route path", {
    details: "/invalid/path",
    severity: "warning"
  });
  
  assertEquals(routeError instanceof RouteError, true);
  assertEquals(routeError.message, "Invalid route path");
  assertEquals(routeError.details, "/invalid/path");
  assertEquals(routeError.severity, "warning");
});

Deno.test("EnhancedCompilerErrorHandler - registerCustomErrorClassifier", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Register custom classifier
  handler.registerCustomErrorClassifier((error) => {
    if (error.message.includes("critical")) {
      return ErrorSeverityLevel.CRITICAL;
    }
    return null; // Use default classification
  });
  
  // Test classification with custom classifier
  const criticalError = new CompilerError("This is a critical error");
  assertEquals(handler.classifyError(criticalError), ErrorSeverityLevel.CRITICAL);
  
  const normalError = new CompilerError("This is a normal error");
  assertNotEquals(handler.classifyError(normalError), ErrorSeverityLevel.CRITICAL);
});

Deno.test("EnhancedCompilerErrorHandler - registerPhaseSpecificRecoveryStrategy", () => {
  const handler = new EnhancedCompilerErrorHandler();
  
  // Register phase-specific strategy
  handler.registerPhaseSpecificRecoveryStrategy('generate', "PHASE_SPECIFIC_ERROR", {
    recover: () => ({
      success: true,
      message: "Recovered in generate phase"
    })
  });
  
  // Create error
  const error = new CompilerError("Phase-specific error", {
    recoverable: true,
    code: "PHASE_SPECIFIC_ERROR"
  });
  
  // Test in generate phase
  const generateContext: ErrorRecoveryContext = {
    ...mockErrorRecoveryContext,
    phase: 'generate'
  };
  
  // Mock console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  
  try {
    // Handle error in generate phase
    const handledInGenerate = handler.handleError(error, generateContext);
    assertEquals(handledInGenerate, true);
    
    // Test in different phase
    const parseContext: ErrorRecoveryContext = {
      ...mockErrorRecoveryContext,
      phase: 'parse'
    };
    
    // Handle error in parse phase
    const handledInParse = handler.handleError(error, parseContext);
    assertEquals(handledInParse, false);
  } finally {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});