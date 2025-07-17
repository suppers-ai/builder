// Unit tests for the error handling system
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
  errorLogger,
  RecoveryStrategy,
  RecoveryResult,
  ErrorRecoveryManager,
  ErrorLogger
} from "./errors.ts";
import { LogLevel } from "./enums.ts";
import type { ErrorRecoveryContext } from "./types.ts";

Deno.test("CompilerError - basic functionality", () => {
  const error = new CompilerError("Test error", {
    type: "test",
    details: "Test details",
    location: { file: "test.json", line: 10, column: 5 },
    suggestions: ["Fix this", "Try that"],
    recoverable: true,
    code: "TEST_ERROR",
    severity: "warning"
  });
  
  assertEquals(error.message, "Test error");
  assertEquals(error.type, "test");
  assertEquals(error.details, "Test details");
  assertEquals(error.location?.file, "test.json");
  assertEquals(error.location?.line, 10);
  assertEquals(error.location?.column, 5);
  assertEquals(error.suggestions?.length, 2);
  assertEquals(error.suggestions?.[0], "Fix this");
  assertEquals(error.recoverable, true);
  assertEquals(error.code, "TEST_ERROR");
  assertEquals(error.severity, "warning");
});

Deno.test("CompilerError - toCompilationError", () => {
  const error = new CompilerError("Test error", {
    type: "test",
    details: "Test details",
    location: { file: "test.json", line: 10 },
    suggestions: ["Fix this"],
    severity: "info"
  });
  
  const compilationError = error.toCompilationError();
  
  assertEquals(compilationError.type, "test");
  assertEquals(compilationError.message, "Test error");
  assertEquals(compilationError.details, "Test details");
  assertEquals(compilationError.location?.file, "test.json");
  assertEquals(compilationError.suggestions?.[0], "Fix this");
  assertEquals(compilationError.severity, "info");
});

Deno.test("CompilerError - format", () => {
  const error = new CompilerError("Test error", {
    type: "test",
    details: "Test details",
    location: { file: "test.json", line: 10, column: 5 },
    suggestions: ["Fix this", "Try that"],
    code: "TEST_ERROR",
    severity: "warning"
  });
  
  const formatted = error.format();
  
  assertStringIncludes(formatted, "[WARNING]");
  assertStringIncludes(formatted, "[TEST]");
  assertStringIncludes(formatted, "Test error");
  assertStringIncludes(formatted, "File: test.json");
  assertStringIncludes(formatted, "Line: 10");
  assertStringIncludes(formatted, "Column: 5");
  assertStringIncludes(formatted, "Details: Test details");
  assertStringIncludes(formatted, "Suggestions:");
  assertStringIncludes(formatted, "- Fix this");
  assertStringIncludes(formatted, "- Try that");
  assertStringIncludes(formatted, "Error Code: TEST_ERROR");
});

Deno.test("CompilerError - asRecoverable", () => {
  const error = new CompilerError("Test error", {
    recoverable: false
  });
  
  assertEquals(error.recoverable, false);
  
  const recoverableError = error.asRecoverable();
  
  assertEquals(recoverableError.recoverable, true);
  assertEquals(recoverableError.message, error.message);
  assertEquals(recoverableError.type, error.type);
});

Deno.test("CompilerError - withSeverity", () => {
  const error = new CompilerError("Test error", {
    severity: "error"
  });
  
  assertEquals(error.severity, "error");
  
  const warningError = error.withSeverity("warning");
  
  assertEquals(warningError.severity, "warning");
  assertEquals(warningError.message, error.message);
  assertEquals(warningError.type, error.type);
});

Deno.test("CompilerError - withRelatedErrors", () => {
  const error = new CompilerError("Primary error");
  const relatedError1 = new CompilerError("Related error 1");
  const relatedError2 = new CompilerError("Related error 2");
  
  const errorWithRelated = error.withRelatedErrors([relatedError1, relatedError2]);
  
  assertEquals(errorWithRelated.relatedErrors?.length, 2);
  assertEquals(errorWithRelated.relatedErrors?.[0].message, "Related error 1");
  assertEquals(errorWithRelated.relatedErrors?.[1].message, "Related error 2");
});

Deno.test("ValidationError - creation", () => {
  const error = new ValidationError("Invalid value", {
    details: "Value must be a string",
    location: { path: "config.name" },
    code: "INVALID_TYPE"
  });
  
  assertEquals(error.type, "validation");
  assertEquals(error.message, "Invalid value");
  assertEquals(error.details, "Value must be a string");
  assertEquals(error.location?.path, "config.name");
  assertEquals(error.code, "INVALID_TYPE");
});

Deno.test("ComponentError - creation", () => {
  const error = new ComponentError("Component not found", {
    details: "Component 'Button' does not exist",
    code: "COMPONENT_NOT_FOUND"
  });
  
  assertEquals(error.type, "component");
  assertEquals(error.message, "Component not found");
  assertEquals(error.details, "Component 'Button' does not exist");
  assertEquals(error.code, "COMPONENT_NOT_FOUND");
});

Deno.test("RouteError - creation", () => {
  const error = new RouteError("Invalid route path", {
    details: "Route path contains invalid characters",
    code: "INVALID_ROUTE_PATH",
    severity: "warning"
  });
  
  assertEquals(error.type, "route");
  assertEquals(error.message, "Invalid route path");
  assertEquals(error.details, "Route path contains invalid characters");
  assertEquals(error.code, "INVALID_ROUTE_PATH");
  assertEquals(error.severity, "warning");
});

Deno.test("ApiError - creation", () => {
  const error = new ApiError("Duplicate API endpoint", {
    details: "Endpoint '/api/users' already exists",
    code: "API_ENDPOINT_CONFLICT"
  });
  
  assertEquals(error.type, "api");
  assertEquals(error.message, "Duplicate API endpoint");
  assertEquals(error.details, "Endpoint '/api/users' already exists");
  assertEquals(error.code, "API_ENDPOINT_CONFLICT");
});

Deno.test("CompilationProcessError - creation", () => {
  const error = new CompilationProcessError("Compilation failed", {
    details: "Failed to generate route files",
    phase: "generate",
    code: "COMPILATION_PHASE_ERROR"
  });
  
  assertEquals(error.type, "compilation");
  assertEquals(error.message, "Compilation failed");
  assertStringIncludes(error.details || "", "Phase: generate");
  assertStringIncludes(error.details || "", "Failed to generate route files");
  assertEquals(error.code, "COMPILATION_PHASE_ERROR");
});

Deno.test("ConfigurationError - creation", () => {
  const error = new ConfigurationError("Invalid configuration", {
    details: "Missing required field 'metadata'",
    code: "MISSING_REQUIRED_FIELD"
  });
  
  assertEquals(error.type, "validation");
  assertEquals(error.message, "Invalid configuration");
  assertEquals(error.details, "Missing required field 'metadata'");
  assertEquals(error.code, "MISSING_REQUIRED_FIELD");
});

Deno.test("ErrorRecoveryManager - basic functionality", () => {
  // Create a new recovery manager
  const recoveryManager = new ErrorRecoveryManager();
  
  // Add an error
  const error = new ComponentError("Component not found", {
    code: "TEST_ERROR",
    recoverable: true
  });
  
  recoveryManager.addError(error);
  
  // Check that the error was added
  const errors = recoveryManager.getErrors();
  assertEquals(errors.length, 1);
  assertEquals(errors[0].message, "Component not found");
  
  // Add a warning
  recoveryManager.addWarning("Test warning");
  
  // Check that the warning was added
  const warnings = recoveryManager.getWarnings();
  assertEquals(warnings.length, 1);
  assertEquals(warnings[0], "Test warning");
  
  // Clear errors and warnings
  recoveryManager.clear();
  
  // Check that errors and warnings were cleared
  assertEquals(recoveryManager.getErrors().length, 0);
  assertEquals(recoveryManager.getWarnings().length, 0);
});

Deno.test("ErrorRecoveryManager - recovery strategy", () => {
  // Create a new recovery manager
  const recoveryManager = new ErrorRecoveryManager();
  
  // Create a test recovery strategy
  const testStrategy: RecoveryStrategy = {
    recover(error: CompilerError, context: unknown): RecoveryResult {
      return {
        success: true,
        message: "Recovered from error",
        data: { fixed: true }
      };
    }
  };
  
  // Register the strategy
  recoveryManager.registerRecoveryStrategy("TEST_ERROR", testStrategy);
  
  // Create a recoverable error
  const error = new ComponentError("Component not found", {
    code: "TEST_ERROR",
    recoverable: true
  });
  
  // Try to recover
  const recovered = recoveryManager.tryRecover(error, {});
  
  // Check that recovery was successful
  assertEquals(recovered, true);
  assertEquals(recoveryManager.getErrors().length, 0);
  assertEquals(recoveryManager.getWarnings().length, 1);
  assertStringIncludes(recoveryManager.getWarnings()[0], "Recovered from error");
  
  // Try with an error that has no recovery strategy
  const unrecoverableError = new ComponentError("Another error", {
    code: "NO_STRATEGY",
    recoverable: true
  });
  
  const unrecovered = recoveryManager.tryRecover(unrecoverableError, {});
  
  // Check that recovery failed
  assertEquals(unrecovered, false);
  assertEquals(recoveryManager.getErrors().length, 1);
  assertEquals(recoveryManager.getErrors()[0].message, "Another error");
});

Deno.test("ErrorRecoveryManager - fallback strategy", () => {
  // Create a new recovery manager
  const recoveryManager = new ErrorRecoveryManager();
  
  // Create a fallback strategy
  const fallbackStrategy: RecoveryStrategy = {
    recover(error: CompilerError, context: unknown): RecoveryResult {
      if (error.type === 'component') {
        return {
          success: true,
          message: "Recovered with fallback strategy",
          downgradeToWarning: true
        };
      }
      return { success: false };
    }
  };
  
  // Register the fallback strategy
  recoveryManager.registerFallbackStrategy(fallbackStrategy);
  
  // Create a recoverable error with no specific strategy
  const error = new ComponentError("Component error", {
    recoverable: true,
    code: "NO_SPECIFIC_STRATEGY"
  });
  
  // Try to recover
  const recovered = recoveryManager.tryRecover(error, {});
  
  // Check that recovery was successful using the fallback strategy
  assertEquals(recovered, true);
  assertEquals(recoveryManager.getErrors().length, 0);
  assertEquals(recoveryManager.getWarnings().length, 2); // One for recovery message, one for downgraded error
  assertStringIncludes(recoveryManager.getWarnings()[0], "Recovered with fallback strategy");
  assertStringIncludes(recoveryManager.getWarnings()[1], "[DOWNGRADED]");
  
  // Try with an error type that the fallback strategy doesn't handle
  const unhandledError = new ValidationError("Validation error", {
    recoverable: true,
    code: "NO_SPECIFIC_STRATEGY"
  });
  
  const unrecovered = recoveryManager.tryRecover(unhandledError, {});
  
  // Check that recovery failed
  assertEquals(unrecovered, false);
  assertEquals(recoveryManager.getErrors().length, 1);
  assertEquals(recoveryManager.getErrors()[0].message, "Validation error");
});

Deno.test("ErrorRecoveryManager - max recovery attempts", () => {
  // Create a new recovery manager
  const recoveryManager = new ErrorRecoveryManager();
  
  // Set max recovery attempts
  recoveryManager.setMaxRecoveryAttempts(2);
  
  // Create a test recovery strategy that always succeeds but doesn't actually fix the issue
  const testStrategy: RecoveryStrategy = {
    recover(error: CompilerError, context: unknown): RecoveryResult {
      return {
        success: true,
        message: "Attempted recovery"
      };
    }
  };
  
  // Register the strategy
  recoveryManager.registerRecoveryStrategy("REPEATED_ERROR", testStrategy);
  
  // Create a recoverable error
  const error = new ComponentError("Repeated error", {
    code: "REPEATED_ERROR",
    recoverable: true
  });
  
  // First attempt should succeed
  const firstAttempt = recoveryManager.tryRecover(error, {});
  assertEquals(firstAttempt, true);
  
  // Second attempt should succeed
  const secondAttempt = recoveryManager.tryRecover(error, {});
  assertEquals(secondAttempt, true);
  
  // Third attempt should fail due to max attempts
  const thirdAttempt = recoveryManager.tryRecover(error, {});
  assertEquals(thirdAttempt, false);
  
  // Check that the error was added and a warning about max attempts was added
  assertEquals(recoveryManager.getErrors().length, 1);
  assertEquals(recoveryManager.getErrors()[0].message, "Repeated error");
  
  const maxAttemptsWarning = recoveryManager.getWarnings().some(warning => 
    warning.includes("Maximum recovery attempts") && warning.includes("REPEATED_ERROR")
  );
  assertEquals(maxAttemptsWarning, true);
});

Deno.test("ErrorRecoveryManager - tryRecoverMultiple", () => {
  // Create a new recovery manager
  const recoveryManager = new ErrorRecoveryManager();
  
  // Create test recovery strategies
  recoveryManager.registerRecoveryStrategy("ERROR_1", {
    recover: () => ({ success: true, message: "Recovered error 1" })
  });
  
  recoveryManager.registerRecoveryStrategy("ERROR_2", {
    recover: () => ({ success: false, message: "Failed to recover error 2" })
  });
  
  // Create errors
  const error1 = new ComponentError("Error 1", { code: "ERROR_1", recoverable: true });
  const error2 = new ComponentError("Error 2", { code: "ERROR_2", recoverable: true });
  const error3 = new ComponentError("Error 3", { code: "ERROR_3", recoverable: true });
  
  // Try to recover multiple errors
  const recoveredCount = recoveryManager.tryRecoverMultiple([error1, error2, error3], {});
  
  // Check that only one error was recovered
  assertEquals(recoveredCount, 1);
  assertEquals(recoveryManager.getErrors().length, 2);
  assertEquals(recoveryManager.getWarnings().length, 1);
});

Deno.test("ErrorRecoveryManager - getErrorsByType and getErrorsByCode", () => {
  // Create a new recovery manager
  const recoveryManager = new ErrorRecoveryManager();
  
  // Add errors of different types and codes
  recoveryManager.addError(new ComponentError("Component error 1", { code: "CODE_1" }));
  recoveryManager.addError(new ComponentError("Component error 2", { code: "CODE_2" }));
  recoveryManager.addError(new ValidationError("Validation error", { code: "CODE_1" }));
  
  // Get errors by type
  const componentErrors = recoveryManager.getErrorsByType("component");
  assertEquals(componentErrors.length, 2);
  
  const validationErrors = recoveryManager.getErrorsByType("validation");
  assertEquals(validationErrors.length, 1);
  
  // Get errors by code
  const code1Errors = recoveryManager.getErrorsByCode("CODE_1");
  assertEquals(code1Errors.length, 2);
  
  const code2Errors = recoveryManager.getErrorsByCode("CODE_2");
  assertEquals(code2Errors.length, 1);
});

Deno.test("ErrorRecoveryManager - getSummary", () => {
  // Create a new recovery manager
  const recoveryManager = new ErrorRecoveryManager();
  
  // Add errors and warnings
  recoveryManager.addError(new ComponentError("Component error"));
  recoveryManager.addError(new ComponentError("Another component error"));
  recoveryManager.addError(new ValidationError("Validation error"));
  recoveryManager.addWarning("Warning 1");
  recoveryManager.addWarning("Warning 2");
  
  // Get summary
  const summary = recoveryManager.getSummary();
  
  assertEquals(summary.errorCount, 3);
  assertEquals(summary.warningCount, 2);
  assertEquals(summary.byType.component, 2);
  assertEquals(summary.byType.validation, 1);
});

Deno.test("ErrorLogger - log levels", () => {
  // Create a new logger
  const logger = new ErrorLogger(LogLevel.INFO);
  
  // Mock console methods
  const originalConsoleDebug = console.debug;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  let debugCalled = false;
  let infoCalled = false;
  let warnCalled = false;
  let errorCalled = false;
  
  console.debug = () => { debugCalled = true; };
  console.info = () => { infoCalled = true; };
  console.warn = () => { warnCalled = true; };
  console.error = () => { errorCalled = true; };
  
  try {
    // Test log levels
    logger.debug("Debug message");
    assertEquals(debugCalled, false); // Should not log at INFO level
    
    logger.info("Info message");
    assertEquals(infoCalled, true);
    
    logger.warn("Warning message");
    assertEquals(warnCalled, true);
    
    logger.error("Error message");
    assertEquals(errorCalled, true);
    
    // Change log level
    logger.setLogLevel(LogLevel.WARN);
    
    // Reset flags
    debugCalled = false;
    infoCalled = false;
    warnCalled = false;
    errorCalled = false;
    
    // Test again
    logger.debug("Debug message");
    assertEquals(debugCalled, false);
    
    logger.info("Info message");
    assertEquals(infoCalled, false); // Should not log at WARN level
    
    logger.warn("Warning message");
    assertEquals(warnCalled, true);
    
    logger.error("Error message");
    assertEquals(errorCalled, true);
  } finally {
    // Restore console methods
    console.debug = originalConsoleDebug;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  }
});

// Test the specific recovery strategies
Deno.test("Recovery Strategy - COMPONENT_NOT_FOUND", () => {
  const strategy = errorRecoveryManager["recoveryStrategies"].get("COMPONENT_NOT_FOUND");
  
  if (!strategy) {
    throw new Error("COMPONENT_NOT_FOUND strategy not found");
  }
  
  const error = new ComponentError("Component not found", {
    details: "Button",
    code: "COMPONENT_NOT_FOUND"
  });
  
  const context: ErrorRecoveryContext = {
    phase: "integrate",
    compilationContext: { outputDir: "/output", templateDir: "/templates" }
  };
  
  const result = strategy.recover(error, context);
  
  assertEquals(result.success, true);
  assertStringIncludes(result.message || "", "Using fallback component");
  assertEquals((result.data as any).type, "FallbackComponent");
  assertEquals((result.data as any).props.originalType, "Button");
  assertEquals((result.data as any).props.showError, true);
});

Deno.test("Recovery Strategy - TEMPLATE_NOT_FOUND", () => {
  const strategy = errorRecoveryManager["recoveryStrategies"].get("TEMPLATE_NOT_FOUND");
  
  if (!strategy) {
    throw new Error("TEMPLATE_NOT_FOUND strategy not found");
  }
  
  const error = new TemplateError("Template not found", {
    details: "page.tsx",
    code: "TEMPLATE_NOT_FOUND"
  });
  
  // Test with generate phase
  const generateContext: ErrorRecoveryContext = {
    phase: "generate",
    compilationContext: { outputDir: "/output", templateDir: "/templates" }
  };
  
  const generateResult = strategy.recover(error, generateContext);
  
  assertEquals(generateResult.success, true);
  assertStringIncludes(generateResult.message || "", "Using default template");
  assertEquals((generateResult.data as any).templatePath, "base/default.tsx");
  
  // Test with different phase
  const parseContext: ErrorRecoveryContext = {
    phase: "parse",
    compilationContext: { outputDir: "/output", templateDir: "/templates" }
  };
  
  const parseResult = strategy.recover(error, parseContext);
  
  assertEquals(parseResult.success, false);
  assertStringIncludes(parseResult.message || "", "Cannot recover from missing template in parse phase");
});

Deno.test("Recovery Strategy - INVALID_ROUTE_PATH", () => {
  const strategy = errorRecoveryManager["recoveryStrategies"].get("INVALID_ROUTE_PATH");
  
  if (!strategy) {
    throw new Error("INVALID_ROUTE_PATH strategy not found");
  }
  
  const error = new RouteError("Invalid route path", {
    code: "INVALID_ROUTE_PATH"
  });
  
  // Test with valid context
  const context: ErrorRecoveryContext = {
    phase: "generate",
    compilationContext: { outputDir: "/output", templateDir: "/templates" },
    currentRoute: {
      path: "/user/profile!@#$%",
      component: "UserProfile"
    }
  };
  
  const result = strategy.recover(error, context);
  
  assertEquals(result.success, true);
  assertStringIncludes(result.message || "", "Sanitized invalid route path");
  assertEquals((result.data as any).sanitizedPath, "/user/profile");
  assertEquals(result.downgradeToWarning, true);
  
  // Test with invalid context (no currentRoute)
  const invalidContext: ErrorRecoveryContext = {
    phase: "generate",
    compilationContext: { outputDir: "/output", templateDir: "/templates" }
  };
  
  const invalidResult = strategy.recover(error, invalidContext);
  
  assertEquals(invalidResult.success, false);
});

Deno.test("Recovery Strategy - Fallback", () => {
  // Get the fallback strategy
  const fallbackStrategy = errorRecoveryManager["fallbackStrategies"][0];
  
  if (!fallbackStrategy) {
    throw new Error("Fallback strategy not found");
  }
  
  // Test with component error
  const componentError = new ComponentError("Generic component error", {
    code: "GENERIC_ERROR",
    recoverable: true
  });
  
  const componentResult = fallbackStrategy.recover(componentError, {});
  
  assertEquals(componentResult.success, true);
  assertStringIncludes(componentResult.message || "", "Applied generic recovery for component error");
  assertEquals(componentResult.downgradeToWarning, true);
  
  // Test with unsupported error type
  const unsupportedError = new CompilationProcessError("Compilation error", {
    code: "GENERIC_ERROR",
    recoverable: true
  });
  
  const unsupportedResult = fallbackStrategy.recover(unsupportedError, {});
  
  assertEquals(unsupportedResult.success, false);
  assertStringIncludes(unsupportedResult.message || "", "No generic recovery available for compilation error");
});