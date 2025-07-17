// Unit tests for the diagnostic tools
import { assertEquals, assertStringIncludes } from "https://deno.land/std/testing/asserts.ts";
import { DiagnosticTool } from "./diagnostics.ts";
import { LogLevel } from "../../shared/src/enums.ts";
import type { AppConfig, ComponentRegistry } from "../../shared/src/types.ts";

// Mock component registry for testing
const mockComponentRegistry: ComponentRegistry = {
  "Button": {
    component: {},
    schema: {
      type: "object",
      required: ["label"],
      properties: {
        label: { type: "string" },
        onClick: { type: "function" }
      }
    },
    dependencies: []
  },
  "Card": {
    component: {},
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        content: { type: "string" }
      }
    },
    dependencies: []
  },
  "Layout": {
    component: {},
    schema: {
      type: "object",
      properties: {
        children: { type: "array" }
      }
    },
    dependencies: []
  }
};

// Valid test configuration
const validConfig: AppConfig = {
  metadata: {
    name: "test-app",
    version: "1.0.0",
    description: "Test application"
  },
  components: [
    {
      id: "header",
      type: "Layout",
      props: {}
    },
    {
      id: "mainButton",
      type: "Button",
      props: {
        label: "Click me"
      }
    }
  ],
  routes: [
    {
      path: "/",
      component: "header"
    }
  ],
  api: {
    endpoints: [
      {
        path: "/api/test",
        methods: ["GET"],
        handler: "testHandler"
      }
    ]
  }
};

// Invalid test configuration
const invalidConfig: AppConfig = {
  metadata: {
    name: "test app", // Invalid name (contains space)
    version: "1.0" // Invalid version (missing patch)
  },
  components: [
    {
      id: "header",
      type: "Layout",
      props: {}
    },
    {
      id: "header", // Duplicate ID
      type: "Button",
      props: {} // Missing required prop 'label'
    },
    {
      id: "card",
      type: "NonExistentComponent", // Component type doesn't exist
      props: {}
    }
  ],
  routes: [
    {
      path: "/",
      component: "header"
    },
    {
      path: "/", // Duplicate path
      component: "nonexistent" // Component doesn't exist
    },
    {
      path: "/about",
      component: "card",
      layout: "nonexistent" // Layout doesn't exist
    }
  ],
  api: {
    endpoints: [
      {
        path: "/api/test",
        methods: ["GET", "INVALID"], // Invalid method
        handler: "testHandler"
      },
      {
        path: "/api/test", // Duplicate path
        methods: ["GET"],
        handler: "anotherHandler"
      }
    ]
  }
};

Deno.test("DiagnosticTool - analyze valid configuration", async () => {
  const diagnosticTool = new DiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock fileManager.directoryExists to always return true
  const originalDirectoryExists = (diagnosticTool as any).fileManager?.directoryExists;
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  try {
    const result = await diagnosticTool.analyzeConfiguration(validConfig);
    
    assertEquals(result.valid, true);
    assertEquals(result.errors.length, 0);
    
    // Should have performance metrics
    assertEquals(typeof result.performance?.componentCount, "number");
    assertEquals(typeof result.performance?.routeCount, "number");
    assertEquals(typeof result.performance?.apiEndpointCount, "number");
    assertEquals(typeof result.performance?.estimatedCompilationTime, "number");
    
    // Check specific values
    assertEquals(result.performance?.componentCount, 2);
    assertEquals(result.performance?.routeCount, 1);
    assertEquals(result.performance?.apiEndpointCount, 1);
  } finally {
    // Restore original method if it exists
    if (originalDirectoryExists) {
      (diagnosticTool as any).fileManager.directoryExists = originalDirectoryExists;
    }
  }
});

Deno.test("DiagnosticTool - analyze invalid configuration", async () => {
  const diagnosticTool = new DiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock fileManager.directoryExists to always return true
  const originalDirectoryExists = (diagnosticTool as any).fileManager?.directoryExists;
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  try {
    const result = await diagnosticTool.analyzeConfiguration(invalidConfig);
    
    assertEquals(result.valid, false);
    
    // Should have errors
    assertEquals(result.errors.length > 0, true);
    
    // Check for specific error types
    const errorTypes = result.errors.map(e => e.type);
    assertEquals(errorTypes.includes("validation"), true);
    assertEquals(errorTypes.includes("component"), true);
    
    // Check for specific error messages
    const errorMessages = result.errors.map(e => e.message);
    const hasComponentNotFound = errorMessages.some(msg => msg.includes("not found in registry"));
    assertEquals(hasComponentNotFound, true);
    
    const hasDuplicateId = errorMessages.some(msg => msg.includes("Duplicate component ID"));
    assertEquals(hasDuplicateId, true);
    
    const hasDuplicatePath = errorMessages.some(msg => msg.includes("Duplicate route path"));
    assertEquals(hasDuplicatePath, true);
    
    // Should have suggestions
    assertEquals(result.suggestions.length > 0, true);
  } finally {
    // Restore original method if it exists
    if (originalDirectoryExists) {
      (diagnosticTool as any).fileManager.directoryExists = originalDirectoryExists;
    }
  }
});

Deno.test("DiagnosticTool - check component availability", async () => {
  const diagnosticTool = new DiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Create a test configuration with unused component
  const configWithUnusedComponent: AppConfig = {
    ...validConfig,
    components: [
      ...validConfig.components,
      {
        id: "unusedComponent",
        type: "Button",
        props: {
          label: "Unused"
        }
      }
    ]
  };
  
  // Mock fileManager methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfiguration(configWithUnusedComponent);
  
  // Should have warnings about unused component
  const hasUnusedWarning = result.warnings.some(warning => 
    warning.includes("unusedComponent") && warning.includes("not used")
  );
  
  assertEquals(hasUnusedWarning, true);
  
  // Should have suggestion about unused component
  const hasUnusedSuggestion = result.suggestions.some(suggestion => 
    suggestion.includes("unusedComponent") && suggestion.includes("use")
  );
  
  assertEquals(hasUnusedSuggestion, true);
});

Deno.test("DiagnosticTool - check template availability", async () => {
  const diagnosticTool = new DiagnosticTool(mockComponentRegistry, "/nonexistent-templates", LogLevel.INFO);
  
  // Mock fileManager.directoryExists to return false
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => false,
    fileExists: async () => false
  };
  
  const result = await diagnosticTool.analyzeConfiguration(validConfig);
  
  // Should have template directory error
  const hasTemplateError = result.errors.some(error => 
    error.type === "template" && error.message.includes("Template directory not found")
  );
  
  assertEquals(hasTemplateError, true);
  
  // Should have suggestion about template directory
  const hasTemplateSuggestion = result.errors.some(error => 
    error.suggestions?.some(suggestion => suggestion.includes("Create the template directory"))
  );
  
  assertEquals(hasTemplateSuggestion, true);
});

Deno.test("DiagnosticTool - check security issues", async () => {
  const diagnosticTool = new DiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Create a test configuration with auth routes but no auth provider
  const configWithAuthRoutes: AppConfig = {
    ...validConfig,
    routes: [
      {
        path: "/protected",
        component: "header",
        meta: {
          requiresAuth: true
        }
      }
    ],
    api: {
      endpoints: [
        {
          path: "/api/protected",
          methods: ["POST"],
          handler: "protectedHandler",
          auth: {
            required: true
          }
        }
      ]
    }
  };
  
  // Mock fileManager methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfiguration(configWithAuthRoutes, {
    checkSecurity: true
  });
  
  // Should have warning about missing auth provider
  const hasAuthWarning = result.warnings.some(warning => 
    warning.includes("authentication") && warning.includes("provider")
  );
  
  assertEquals(hasAuthWarning, true);
  
  // Should have warning about POST endpoint without validation
  const hasValidationWarning = result.warnings.some(warning => 
    warning.includes("data mutation") && warning.includes("without body validation")
  );
  
  assertEquals(hasValidationWarning, true);
});