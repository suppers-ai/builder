// Unit tests for the enhanced compiler error handling system
import { assertEquals, assertStringIncludes, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { 
  CompilerErrorHandler,
  ErrorHandlingOptions
} from "./compiler-error-handling.ts";
import {
  CompilerError,
  ValidationError,
  ComponentError,
  RouteError,
  ApiError,
  CompilationProcessError,
  ConfigurationError,
  RecoveryStrategy,
  RecoveryResult
} from "../../shared/src/errors.ts";
import { LogLevel } from "../../shared/src/enums.ts";
import type { ErrorRecoveryContext, CompilationContext } from "../../shared/src/types.ts";

// Mock compilation context for testing
const mockCompilationContext: CompilationContext = {
  outputDir: "/output",
  templateDir: "/templates",
  config: {
    metadata: {
      name: "test-app",
      version: "1.0.0"
    },
    components: [],
    routes: [],
    api: {
      endpoints: []
    }
  }
};

Deno.test("CompilerErrorHandler - basic functionality", () => {
  const errorHandler = new CompilerErrorHandler();
  
  // Create a test error
  const error = new ComponentError("Test component error", {
    code: "TEST_ERROR",
    recoverable: false
  });
  
  // Mock console.error to prevent output during tests
  const originalConsoleError = console.error;
  let errorCalled = false;
  console.error = () => { errorCalled = true; };
  
  try {
    // Handle the error
    const handled = errorHandler.handleError(error, {});
    
    // Check that error was logged
    assertEquals(errorCalled, true);
    
    // Check that error was not handled (since it's not recoverable)
    assertEquals(handled, false);
  } finally {
    // Restore console.error
    console.error = originalConsoleError;
  }
});

Deno.test("CompilerErrorHandler - error recovery", () => {
  const errorHandler = new CompilerErrorHandler();
  
  // Register a test recovery strategy
  errorHandler.registerRecoveryStrategy("RECOVERABLE_ERROR", {
    recover(error: CompilerError, context: unknown): RecoveryResult {
      return {
        success: true,
        message: "Recovered from test error"
      };
    }
  });
  
  // Create a recoverable error
  const error = new ComponentError("Recoverable error", {
    code: "RECOVERABLE_ERROR",
    recoverable: true
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
    const handled = errorHandler.handleError(error, {});
    
    // Check that error was logged
    assertEquals(errorCalled, true);
    
    // Check that error was handled
    assertEquals(handled, true);
  } finally {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});

Deno.test("CompilerErrorHandler - downgrade recoverable errors", () => {
  const errorHandler = new CompilerErrorHandler({
    downgradeRecoverableErrors: true
  });
  
  // Create a recoverable error
  const error = new ComponentError("Recoverable error", {
    recoverable: true
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
    errorHandler.handleError(error, {});
    
    // Check that warn was called instead of error
    assertEquals(errorCalled, false);
    assertEquals(warnCalled, true);
  } finally {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});

Deno.test("CompilerErrorHandler - throw on error", () => {
  const errorHandler = new CompilerErrorHandler({
    throwOnError: true
  });
  
  // Create a test error
  const error = new ComponentError("Test error");
  
  // Mock console.error to prevent output during tests
  const originalConsoleError = console.error;
  console.error = () => {};
  
  try {
    // Check that handling the error throws
    let thrown = false;
    try {
      errorHandler.handleError(error, {});
    } catch (e) {
      thrown = true;
      assertEquals(e.message, "Test error");
    }
    
    assertEquals(thrown, true);
  } finally {
    // Restore console.error
    console.error = originalConsoleError;
  }
});

Deno.test("CompilerErrorHandler - handle multiple errors", () => {
  const errorHandler = new CompilerErrorHandler();
  
  // Register a recovery strategy for one error type
  errorHandler.registerRecoveryStrategy("RECOVERABLE_ERROR", {
    recover(error: CompilerError, context: unknown): RecoveryResult {
      return {
        success: true,
        message: "Recovered from test error"
      };
    }
  });
  
  // Create test errors
  const errors = [
    new ComponentError("Error 1", { code: "RECOVERABLE_ERROR", recoverable: true }),
    new ValidationError("Error 2"),
    new RouteError("Error 3", { code: "RECOVERABLE_ERROR", recoverable: true })
  ];
  
  // Mock console.error to prevent output during tests
  const originalConsoleError = console.error;
  console.error = () => {};
  
  try {
    // Handle multiple errors
    const handledCount = errorHandler.handleMultipleErrors(errors, {});
    
    // Check that two errors were handled (the recoverable ones)
    assertEquals(handledCount, 2);
  } finally {
    // Restore console.error
    console.error = originalConsoleError;
  }
});

Deno.test("CompilerErrorHandler - create error recovery context", () => {
  const errorHandler = new CompilerErrorHandler();
  
  // Create a recovery context
  const context = errorHandler.createErrorRecoveryContext(
    mockCompilationContext,
    'generate',
    {
      currentFile: "test.tsx",
      currentComponent: { id: "test", type: "Button", props: {} }
    }
  );
  
  // Check that context was created correctly
  assertEquals(context.phase, "generate");
  assertEquals(context.compilationContext, mockCompilationContext);
  assertEquals(context.currentFile, "test.tsx");
  assertEquals(context.currentComponent?.id, "test");
});

Deno.test("CompilerErrorHandler - related errors tracking", () => {
  const errorHandler = new CompilerErrorHandler({
    collectRelatedErrors: true
  });
  
  // Create errors with the same code
  const error1 = new ComponentError("Error 1", { code: "DUPLICATE_CODE" });
  const error2 = new ComponentError("Error 2", { code: "DUPLICATE_CODE" });
  const error3 = new ValidationError("Error 3", { code: "DIFFERENT_CODE" });
  
  // Mock console.error to prevent output during tests
  const originalConsoleError = console.error;
  console.error = () => {};
  
  try {
    // Handle the errors
    errorHandler.handleError(error1, {});
    errorHandler.handleError(error2, {});
    errorHandler.handleError(error3, {});
    
    // Check related errors
    const duplicateErrors = errorHandler.getRelatedErrors("DUPLICATE_CODE");
    assertEquals(duplicateErrors.length, 2);
    assertEquals(duplicateErrors[0].message, "Error 1");
    assertEquals(duplicateErrors[1].message, "Error 2");
    
    const differentErrors = errorHandler.getRelatedErrors("DIFFERENT_CODE");
    assertEquals(differentErrors.length, 1);
    assertEquals(differentErrors[0].message, "Error 3");
    
    // Check error summary
    const summary = errorHandler.getErrorSummary();
    assertEquals(summary.byCode["DUPLICATE_CODE"], 2);
    assertEquals(summary.byCode["DIFFERENT_CODE"], 1);
    assertEquals(summary.byType["component"], 2);
    assertEquals(summary.byType["validation"], 1);
    
    // Clear related errors
    errorHandler.clearRelatedErrors();
    assertEquals(errorHandler.getRelatedErrors("DUPLICATE_CODE").length, 0);
  } finally {
    // Restore console.error
    console.error = originalConsoleError;
  }
});

Deno.test("CompilerErrorHandler - create specialized errors", () => {
  const errorHandler = new CompilerErrorHandler();
  
  // Create different types of errors
  const validationError = errorHandler.createValidationError("Validation error", {
    code: "VALIDATION_ERROR",
    severity: "warning"
  });
  
  const componentError = errorHandler.createComponentError("Component error", {
    code: "COMPONENT_ERROR",
    recoverable: true
  });
  
  const routeError = errorHandler.createRouteError("Route error", {
    code: "ROUTE_ERROR"
  });
  
  const apiError = errorHandler.createApiError("API error", {
    code: "API_ERROR"
  });
  
  const compilationError = errorHandler.createCompilationError("Compilation error", {
    code: "COMPILATION_ERROR",
    phase: "generate"
  });
  
  const configError = errorHandler.createConfigurationError("Config error", {
    code: "CONFIG_ERROR"
  });
  
  // Check error types
  assertEquals(validationError.type, "validation");
  assertEquals(componentError.type, "component");
  assertEquals(routeError.type, "route");
  assertEquals(apiError.type, "api");
  assertEquals(compilationError.type, "compilation");
  assertEquals(configError.type, "validation"); // ConfigurationError extends ValidationError
  
  // Check error codes
  assertEquals(validationError.code, "VALIDATION_ERROR");
  assertEquals(componentError.code, "COMPONENT_ERROR");
  assertEquals(routeError.code, "ROUTE_ERROR");
  assertEquals(apiError.code, "API_ERROR");
  assertEquals(compilationError.code, "COMPILATION_ERROR");
  assertEquals(configError.code, "CONFIG_ERROR");
  
  // Check other properties
  assertEquals(validationError.severity, "warning");
  assertEquals(componentError.recoverable, true);
  assertStringIncludes(compilationError.details || "", "Phase: generate");
});

Deno.test("CompilerErrorHandler - run diagnostics", async () => {
  const errorHandler = new CompilerErrorHandler();
  
  // Create a context with no config
  const emptyContext: CompilationContext = {
    outputDir: "/output",
    templateDir: "/templates"
  };
  
  // Run diagnostics on empty context
  const emptyResult = await errorHandler.runDiagnostics(emptyContext);
  
  // Check that diagnostics failed
  assertEquals(emptyResult.valid, false);
  assertEquals(emptyResult.errors.length, 1);
  assertStringIncludes(emptyResult.errors[0].message, "No configuration available");
  
  // Mock diagnosticTool.analyzeConfiguration to return a successful result
  const originalAnalyzeConfiguration = (errorHandler as any).diagnosticTool?.analyzeConfiguration;
  (errorHandler as any).diagnosticTool = {
    setLogLevel: () => {},
    analyzeConfiguration: async () => ({
      valid: true,
      errors: [],
      warnings: ["Test warning"],
      suggestions: ["Test suggestion"]
    })
  };
  
  try {
    // Run diagnostics on mock context
    const result = await errorHandler.runDiagnostics(mockCompilationContext);
    
    // Check that diagnostics succeeded
    assertEquals(result.valid, true);
    assertEquals(result.errors.length, 0);
    assertEquals(result.warnings.length, 1);
    assertEquals(result.warnings[0], "Test warning");
    assertEquals(result.suggestions.length, 1);
    assertEquals(result.suggestions[0], "Test suggestion");
  } finally {
    // Restore original method if it exists
    if (originalAnalyzeConfiguration) {
      (errorHandler as any).diagnosticTool.analyzeConfiguration = originalAnalyzeConfiguration;
    }
  }
});

Deno.test("CompilerErrorHandler - fallback strategy", () => {
  const errorHandler = new CompilerErrorHandler();
  
  // Register a fallback strategy
  errorHandler.registerFallbackStrategy({
    recover(error: CompilerError, context: unknown): RecoveryResult {
      if (error.type === "component") {
        return {
          success: true,
          message: "Recovered with fallback strategy"
        };
      }
      return { success: false };
    }
  });
  
  // Create a recoverable error with no specific strategy
  const error = new ComponentError("Component error", {
    recoverable: true,
    code: "NO_SPECIFIC_STRATEGY"
  });
  
  // Mock console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  let errorCalled = false;
  console.error = () => { errorCalled = true; };
  console.warn = () => {};
  
  try {
    // Handle the error
    const handled = errorHandler.handleError(error, {});
    
    // Check that error was handled by fallback strategy
    assertEquals(handled, true);
  } finally {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});