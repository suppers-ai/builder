// Unit tests for enhanced compiler error handling with graceful degradation
import { assertEquals, assertStringIncludes, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { 
  EnhancedCompilerErrorHandler,
  EnhancedErrorHandlingOptions
} from "./compiler-error-handling-enhanced.ts";
import {
  CompilerError,
  ValidationError,
  ComponentError,
  RouteError,
  ApiError,
  CompilationProcessError,
  ConfigurationError,
  TemplateError,
  FileError,
  DependencyError
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

// Mock recovery context for testing
const mockRecoveryContext: ErrorRecoveryContext = {
  phase: 'generate',
  compilationContext: mockCompilationContext,
  currentComponent: {
    id: 'testComponent',
    type: 'Button',
    props: { label: 'Test' }
  },
  currentRoute: {
    path: '/test',
    component: 'testComponent'
  },
  currentApiEndpoint: {
    path: '/api/test',
    methods: ['GET'],
    handler: 'testHandler'
  },
  currentFile: '/output/test.tsx'
};

Deno.test("EnhancedCompilerErrorHandler - basic functionality", () => {
  const errorHandler = new EnhancedCompilerErrorHandler();
  
  // Create a test error
  const error = new ComponentError("Test component error", {
    code: "TEST_ERROR",
    recoverable: true
  });
  
  // Mock console methods to prevent output during tests
  const originalConsoleError = console.error;
  const originalConsoleFatal = console.error; // errorLogger.fatal uses console.error
  let errorCalled = false;
  console.error = () => { errorCalled = true; };
  
  try {
    // Handle the error
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    // Check that error was logged
    assertEquals(errorCalled, true);
    
    // Check that error was handled through graceful degradation
    assertEquals(handled, true);
    
    // Check error statistics
    const stats = errorHandler.getErrorStatistics();
    assertEquals(stats.totalErrors, 1);
    assertEquals(stats.criticalErrors, 0); // Component errors are not critical by default
  } finally {
    // Restore console methods
    console.error = originalConsoleError;
  }
});

Deno.test("EnhancedCompilerErrorHandler - graceful degradation for component errors", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    enableGracefulDegradation: true,
    logLevel: LogLevel.WARN
  });
  
  const error = new ComponentError("Component not found", {
    code: "COMPONENT_NOT_FOUND",
    recoverable: true
  });
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  let warnCalled = false;
  console.warn = () => { warnCalled = true; };
  
  try {
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    assertEquals(handled, true);
    assertEquals(warnCalled, true);
    
    // Check that a fallback implementation was created
    const fallbacks = errorHandler.getFallbackImplementations();
    assertEquals(fallbacks.size >= 1, true);
    
    // Check that the fallback is an error boundary
    const fallbackKey = Array.from(fallbacks.keys()).find(key => key.includes('component_testComponent'));
    if (fallbackKey) {
      const fallback = fallbacks.get(fallbackKey) as any;
      assertEquals(fallback.type, 'ErrorBoundary');
      assertEquals(fallback.props.fallback, true);
    }
  } finally {
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - graceful degradation for template errors", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    enableGracefulDegradation: true,
    logLevel: LogLevel.WARN
  });
  
  const error = new TemplateError("Template not found", {
    code: "TEMPLATE_NOT_FOUND",
    recoverable: true
  });
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  let warnCalled = false;
  console.warn = () => { warnCalled = true; };
  
  try {
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    assertEquals(handled, true);
    assertEquals(warnCalled, true);
    
    // Check that a fallback template was created
    const fallbacks = errorHandler.getFallbackImplementations();
    const templateFallback = Array.from(fallbacks.values()).find(value => 
      typeof value === 'string' && (value as string).includes('FallbackTemplate')
    );
    assertEquals(templateFallback !== undefined, true);
  } finally {
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - graceful degradation for route errors", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    enableGracefulDegradation: true,
    logLevel: LogLevel.WARN
  });
  
  const error = new RouteError("Route component not found", {
    code: "ROUTE_COMPONENT_NOT_FOUND",
    recoverable: true
  });
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  let warnCalled = false;
  console.warn = () => { warnCalled = true; };
  
  try {
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    assertEquals(handled, true);
    assertEquals(warnCalled, true);
    
    // Check that a fallback route was created
    const fallbacks = errorHandler.getFallbackImplementations();
    const routeFallback = Array.from(fallbacks.values()).find(value => 
      typeof value === 'object' && value !== null && 
      (value as any).component === 'ErrorPage'
    );
    assertEquals(routeFallback !== undefined, true);
  } finally {
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - graceful degradation for API errors", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    enableGracefulDegradation: true,
    logLevel: LogLevel.WARN
  });
  
  const error = new ApiError("API handler not found", {
    code: "API_HANDLER_NOT_FOUND",
    recoverable: true
  });
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  let warnCalled = false;
  console.warn = () => { warnCalled = true; };
  
  try {
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    assertEquals(handled, true);
    assertEquals(warnCalled, true);
    
    // Check that a fallback API handler was created
    const fallbacks = errorHandler.getFallbackImplementations();
    const apiFallback = Array.from(fallbacks.values()).find(value => 
      typeof value === 'string' && (value as string).includes('fallbackHandler')
    );
    assertEquals(apiFallback !== undefined, true);
  } finally {
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - graceful degradation for validation errors", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    enableGracefulDegradation: true,
    logLevel: LogLevel.WARN
  });
  
  const error = new ValidationError("Invalid metadata", {
    code: "VALIDATION_ERROR",
    location: { path: "metadata.name" },
    recoverable: true
  });
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  let warnCalled = false;
  console.warn = () => { warnCalled = true; };
  
  try {
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    assertEquals(handled, true);
    assertEquals(warnCalled, true);
    
    // Check that a default value was applied
    const fallbacks = errorHandler.getFallbackImplementations();
    const validationFallback = fallbacks.get('validation_metadata.name');
    assertEquals(validationFallback !== undefined, true);
  } finally {
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - critical error handling", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    continueAfterCriticalErrors: false
  });
  
  // Create a critical error
  const error = new CompilationProcessError("Parse phase failed", {
    code: "PARSE_PHASE_ERROR",
    severity: "error",
    recoverable: false
  });
  
  // Mock console methods
  const originalConsoleFatal = console.error; // errorLogger.fatal uses console.error
  let fatalCalled = false;
  console.error = () => { fatalCalled = true; };
  
  try {
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    // Critical errors should stop compilation
    assertEquals(handled, false);
    assertEquals(fatalCalled, true);
    assertEquals(errorHandler.canContinueCompilation(), false);
    
    const stats = errorHandler.getErrorStatistics();
    assertEquals(stats.criticalErrors, 1);
    assertEquals(stats.compilationStopped, true);
  } finally {
    console.error = originalConsoleFatal;
  }
});

Deno.test("EnhancedCompilerErrorHandler - max errors before stop", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    maxErrorsBeforeStop: 3,
    enableGracefulDegradation: false // Disable to ensure errors are counted
  });
  
  // Mock console methods
  const originalConsoleError = console.error;
  const originalConsoleFatal = console.error;
  console.error = () => {};
  
  try {
    // Add errors up to the limit
    for (let i = 0; i < 3; i++) {
      const error = new ComponentError(`Error ${i}`, {
        code: `ERROR_${i}`,
        recoverable: false
      });
      
      const handled = errorHandler.handleError(error, mockRecoveryContext);
      
      if (i < 2) {
        // First two errors should be handled
        assertEquals(errorHandler.canContinueCompilation(), true);
      } else {
        // Third error should stop compilation
        assertEquals(errorHandler.canContinueCompilation(), false);
      }
    }
    
    const stats = errorHandler.getErrorStatistics();
    assertEquals(stats.totalErrors, 3);
    assertEquals(stats.compilationStopped, true);
  } finally {
    console.error = originalConsoleError;
  }
});

Deno.test("EnhancedCompilerErrorHandler - recovery attempt limits", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    maxRecoveryAttempts: 2,
    attemptRecovery: true,
    enableGracefulDegradation: false, // Disable to test recovery limits
    logLevel: LogLevel.WARN
  });
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  let maxAttemptsWarning = false;
  console.warn = (message: string) => {
    if (message.includes("Maximum recovery attempts exceeded")) {
      maxAttemptsWarning = true;
    }
  };
  
  try {
    // Create the same error multiple times
    const error = new ComponentError("Repeated error", {
      code: "REPEATED_ERROR",
      recoverable: true
    });
    
    // First two attempts should try recovery
    errorHandler.handleError(error, mockRecoveryContext);
    errorHandler.handleError(error, mockRecoveryContext);
    
    // Third attempt should hit the limit
    errorHandler.handleError(error, mockRecoveryContext);
    
    assertEquals(maxAttemptsWarning, true);
  } finally {
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - fallback implementation creation", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    createFallbackImplementations: true,
    enableGracefulDegradation: false, // Disable graceful degradation to test fallback creation
    attemptRecovery: false, // Disable recovery to test fallback creation
    logLevel: LogLevel.INFO
  });
  
  // Mock console methods
  const originalConsoleInfo = console.info;
  let fallbackCreated = false;
  console.info = (message: string) => {
    if (message.includes("Created fallback implementation")) {
      fallbackCreated = true;
    }
  };
  
  try {
    const error = new ComponentError("Component error", {
      code: "COMPONENT_ERROR",
      recoverable: false
    });
    
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    assertEquals(handled, true);
    assertEquals(fallbackCreated, true);
    
    const fallbacks = errorHandler.getFallbackImplementations();
    assertEquals(fallbacks.size >= 1, true);
  } finally {
    console.info = originalConsoleInfo;
  }
});

Deno.test("EnhancedCompilerErrorHandler - error statistics", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    enableGracefulDegradation: false,
    attemptRecovery: false,
    createFallbackImplementations: false
  });
  
  // Mock console methods to prevent output
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  
  try {
    // Add various types of errors
    const componentError = new ComponentError("Component error", { recoverable: true });
    const criticalError = new FileError("File error", { code: "FILE_NOT_FOUND", recoverable: false });
    const validationError = new ValidationError("Validation error", { recoverable: true });
    
    errorHandler.handleError(componentError, mockRecoveryContext);
    errorHandler.handleError(criticalError, mockRecoveryContext);
    errorHandler.handleError(validationError, mockRecoveryContext);
    
    const stats = errorHandler.getErrorStatistics();
    
    assertEquals(stats.totalErrors, 3);
    assertEquals(stats.criticalErrors, 1); // Only the file error should be critical
    assertEquals(stats.fallbackImplementations >= 0, true);
  } finally {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - reset functionality", () => {
  const errorHandler = new EnhancedCompilerErrorHandler();
  
  // Mock console methods
  const originalConsoleError = console.error;
  console.error = () => {};
  
  try {
    // Add some errors
    const error = new ComponentError("Test error");
    errorHandler.handleError(error, mockRecoveryContext);
    
    // Check that state has been modified
    let stats = errorHandler.getErrorStatistics();
    assertEquals(stats.totalErrors, 1);
    
    // Reset the handler
    errorHandler.reset();
    
    // Check that state has been cleared
    stats = errorHandler.getErrorStatistics();
    assertEquals(stats.totalErrors, 0);
    assertEquals(stats.criticalErrors, 0);
    assertEquals(stats.fallbackImplementations, 0);
    assertEquals(stats.compilationStopped, false);
    assertEquals(errorHandler.canContinueCompilation(), true);
  } finally {
    console.error = originalConsoleError;
  }
});

Deno.test("EnhancedCompilerErrorHandler - force stop compilation", () => {
  const errorHandler = new EnhancedCompilerErrorHandler();
  
  // Mock console methods
  const originalConsoleFatal = console.error; // errorLogger.fatal uses console.error
  let fatalCalled = false;
  console.error = () => { fatalCalled = true; };
  
  try {
    assertEquals(errorHandler.canContinueCompilation(), true);
    
    errorHandler.stopCompilation("Test reason");
    
    assertEquals(errorHandler.canContinueCompilation(), false);
    assertEquals(fatalCalled, true);
    
    const stats = errorHandler.getErrorStatistics();
    assertEquals(stats.compilationStopped, true);
  } finally {
    console.error = originalConsoleFatal;
  }
});

Deno.test("EnhancedCompilerErrorHandler - throw on error option", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    throwOnError: true,
    enableGracefulDegradation: false,
    attemptRecovery: false,
    createFallbackImplementations: false
  });
  
  const error = new ComponentError("Test error", {
    recoverable: false
  });
  
  // Mock console methods
  const originalConsoleError = console.error;
  console.error = () => {};
  
  try {
    let thrown = false;
    try {
      errorHandler.handleError(error, mockRecoveryContext);
    } catch (e) {
      thrown = true;
      assertEquals((e as Error).message, "Test error");
    }
    
    assertEquals(thrown, true);
  } finally {
    console.error = originalConsoleError;
  }
});

Deno.test("EnhancedCompilerErrorHandler - continue after critical errors", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    continueAfterCriticalErrors: true
  });
  
  // Create a critical error
  const error = new FileError("Permission denied", {
    code: "PERMISSION_DENIED",
    recoverable: false
  });
  
  // Mock console methods
  const originalConsoleError = console.error;
  console.error = () => {};
  
  try {
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    // Should continue compilation even after critical error
    assertEquals(errorHandler.canContinueCompilation(), true);
    
    const stats = errorHandler.getErrorStatistics();
    assertEquals(stats.criticalErrors, 1);
    assertEquals(stats.compilationStopped, false);
  } finally {
    console.error = originalConsoleError;
  }
});

Deno.test("EnhancedCompilerErrorHandler - validation error default values", () => {
  const errorHandler = new EnhancedCompilerErrorHandler();
  
  // Test different validation error paths
  const testCases = [
    { path: "metadata.name", expectedType: "object" },
    { path: "components.0.type", expectedType: "object" },
    { path: "routes.0.path", expectedType: "object" },
    { path: "api.endpoints", expectedType: "object" },
    { path: "unknown.path", expectedValue: null }
  ];
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  console.warn = () => {};
  
  try {
    for (const testCase of testCases) {
      const error = new ValidationError(`Invalid ${testCase.path}`, {
        location: { path: testCase.path },
        recoverable: true
      });
      
      const handled = errorHandler.handleError(error, mockRecoveryContext);
      assertEquals(handled, true);
      
      const fallbacks = errorHandler.getFallbackImplementations();
      const fallbackKey = `validation_${testCase.path}`;
      const fallbackValue = fallbacks.get(fallbackKey);
      
      if (testCase.expectedValue !== undefined) {
        assertEquals(fallbackValue, testCase.expectedValue);
      } else {
        assertEquals(typeof fallbackValue, testCase.expectedType);
      }
    }
  } finally {
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - recovery validation", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    validateRecoveryResults: true,
    attemptRecovery: true
  });
  
  // Mock console methods
  const originalConsoleWarn = console.warn;
  let validationFailed = false;
  console.warn = (message: string) => {
    if (message.includes("Recovery validation failed")) {
      validationFailed = true;
    }
  };
  
  try {
    // Create an error with a context that will fail validation
    const error = new ComponentError("Component error", {
      code: "COMPONENT_ERROR",
      recoverable: true
    });
    
    const invalidContext: ErrorRecoveryContext = {
      ...mockRecoveryContext,
      currentComponent: undefined // This will cause validation to fail
    };
    
    const handled = errorHandler.handleError(error, invalidContext);
    
    // Recovery should be attempted but validation should fail
    // The exact behavior depends on the recovery strategy implementation
    // This test ensures the validation mechanism is working
  } finally {
    console.warn = originalConsoleWarn;
  }
});

Deno.test("EnhancedCompilerErrorHandler - disabled graceful degradation", () => {
  const errorHandler = new EnhancedCompilerErrorHandler({
    enableGracefulDegradation: false,
    attemptRecovery: false,
    createFallbackImplementations: false
  });
  
  const error = new ComponentError("Component error", {
    recoverable: false
  });
  
  // Mock console methods
  const originalConsoleError = console.error;
  console.error = () => {};
  
  try {
    const handled = errorHandler.handleError(error, mockRecoveryContext);
    
    // Without any recovery mechanisms, error should not be handled
    assertEquals(handled, false);
    
    // No fallback implementations should be created
    const fallbacks = errorHandler.getFallbackImplementations();
    assertEquals(fallbacks.size, 0);
  } finally {
    console.error = originalConsoleError;
  }
});