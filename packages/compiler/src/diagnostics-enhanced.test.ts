// Unit tests for enhanced diagnostic tools
import { assertEquals, assertStringIncludes, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { EnhancedDiagnosticTool, type EnhancedDiagnosticOptions } from "./diagnostics-enhanced.ts";
import { LogLevel } from "../../shared/src/enums.ts";
import type { AppConfig, ComponentRegistry, CompilationContext } from "../../shared/src/types.ts";

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
  },
  "Image": {
    component: {},
    schema: {
      type: "object",
      required: ["src"],
      properties: {
        src: { type: "string" },
        alt: { type: "string" }
      }
    },
    dependencies: []
  },
  "Input": {
    component: {},
    schema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        label: { type: "string" },
        type: { type: "string" }
      }
    },
    dependencies: []
  }
};

// Mock compilation context
const mockCompilationContext: CompilationContext = {
  outputDir: "/output",
  templateDir: "/templates"
};

// Test configuration with various issues for comprehensive testing
const testConfig: AppConfig = {
  metadata: {
    name: "test-app",
    version: "1.0.0",
    description: "Test application for diagnostics"
  },
  components: [
    {
      id: "header",
      type: "Layout",
      props: {},
      children: [
        {
          id: "logo",
          type: "Image",
          props: {
            src: "/logo.png"
            // Missing alt text - accessibility issue
          }
        }
      ]
    },
    {
      id: "mainButton",
      type: "Button",
      props: {
        label: "Click me",
        onClick: "handleClick"
      }
    },
    {
      id: "contactForm",
      type: "Input",
      props: {
        name: "email",
        type: "email"
        // Missing label - accessibility issue
      }
    },
    {
      id: "unusedCard",
      type: "Card",
      props: {
        title: "Unused Card",
        content: "This card is not used anywhere"
      }
    }
  ],
  routes: [
    {
      path: "/",
      component: "header"
    },
    {
      path: "/contact",
      component: "contactForm"
    }
  ],
  api: {
    endpoints: [
      {
        path: "/api/contact",
        methods: ["POST"],
        handler: "contactHandler"
        // Missing validation - security issue
      }
    ]
  }
};

// Configuration with circular dependencies
const circularDependencyConfig: AppConfig = {
  metadata: {
    name: "circular-test",
    version: "1.0.0"
  },
  components: [
    {
      id: "componentA",
      type: "Layout",
      props: {},
      children: [
        {
          id: "componentB",
          type: "Card",
          props: {}
        }
      ]
    },
    {
      id: "componentB",
      type: "Card",
      props: {},
      children: [
        {
          id: "componentA", // Circular dependency
          type: "Layout",
          props: {}
        }
      ]
    }
  ],
  routes: [
    {
      path: "/",
      component: "componentA"
    }
  ],
  api: {
    endpoints: []
  }
};

Deno.test("EnhancedDiagnosticTool - basic enhanced analysis", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig, {
    verbose: true,
    debug: true
  });
  
  // Should have basic diagnostic results
  assertEquals(typeof result.valid, "boolean");
  assertEquals(Array.isArray(result.errors), true);
  assertEquals(Array.isArray(result.warnings), true);
  assertEquals(Array.isArray(result.suggestions), true);
  
  // Should have enhanced metrics
  assertEquals(typeof result.metrics?.analysisTime, "number");
  assertEquals(typeof result.metrics?.complexityScore, "number");
  assertEquals(typeof result.metrics?.maintainabilityIndex, "number");
  
  // Should have dependency analysis
  assertEquals(result.dependencies?.componentDependencies instanceof Map, true);
  assertEquals(Array.isArray(result.dependencies?.circularDependencies), true);
  assertEquals(Array.isArray(result.dependencies?.unusedDependencies), true);
  assertEquals(Array.isArray(result.dependencies?.missingDependencies), true);
});

Deno.test("EnhancedDiagnosticTool - accessibility analysis", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig, {
    checkAccessibility: true
  });
  
  // Should have accessibility analysis
  assertEquals(typeof result.accessibility?.score, "number");
  assertEquals(Array.isArray(result.accessibility?.issues), true);
  assertEquals(Array.isArray(result.accessibility?.recommendations), true);
  
  // Should detect missing alt text
  const hasAltTextIssue = result.accessibility?.issues.some(issue => 
    issue.includes("logo") && issue.includes("alt text")
  );
  assertEquals(hasAltTextIssue, true);
  
  // Should detect missing form label
  const hasLabelIssue = result.accessibility?.issues.some(issue => 
    issue.includes("contactForm") && issue.includes("label")
  );
  assertEquals(hasLabelIssue, true);
  
  // Should have recommendations
  assertEquals(result.accessibility?.recommendations.length > 0, true);
});

Deno.test("EnhancedDiagnosticTool - SEO analysis", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig, {
    checkSEO: true
  });
  
  // Should have SEO analysis
  assertEquals(typeof result.seo?.score, "number");
  assertEquals(Array.isArray(result.seo?.issues), true);
  assertEquals(Array.isArray(result.seo?.recommendations), true);
  
  // Should have recommendations for SEO improvements
  assertEquals(result.seo?.recommendations.length > 0, true);
});

Deno.test("EnhancedDiagnosticTool - i18n analysis", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig, {
    checkI18n: true
  });
  
  // Should have i18n analysis
  assertEquals(Array.isArray(result.i18n?.hardcodedStrings), true);
  assertEquals(Array.isArray(result.i18n?.missingTranslations), true);
  assertEquals(Array.isArray(result.i18n?.recommendations), true);
  
  // Should detect hardcoded strings
  const hasHardcodedStrings = result.i18n?.hardcodedStrings.some(str => 
    str.includes("Click me") || str.includes("Unused Card")
  );
  assertEquals(hasHardcodedStrings, true);
  
  // Should have recommendations
  assertEquals(result.i18n?.recommendations.length > 0, true);
});

Deno.test("EnhancedDiagnosticTool - circular dependency detection", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(circularDependencyConfig, {
    checkCircularDependencies: true
  });
  
  // Should detect circular dependencies
  assertEquals(result.dependencies?.circularDependencies.length > 0, true);
  
  // Should have suggestions about circular dependencies
  const hasCircularDependencySuggestion = result.suggestions.some(suggestion => 
    suggestion.includes("circular dependencies")
  );
  assertEquals(hasCircularDependencySuggestion, true);
});

Deno.test("EnhancedDiagnosticTool - unused dependency detection", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig);
  
  // Should detect unused components
  assertEquals(result.dependencies?.unusedDependencies.includes("unusedCard"), true);
  
  // Should have suggestions about unused dependencies
  const hasUnusedDependencySuggestion = result.suggestions.some(suggestion => 
    suggestion.includes("unused components")
  );
  assertEquals(hasUnusedDependencySuggestion, true);
});

Deno.test("EnhancedDiagnosticTool - performance analysis", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig, {
    analyzeMemoryUsage: true,
    estimateBundleSize: true,
    enableProfiling: true
  });
  
  // Should have performance metrics
  assertEquals(typeof result.metrics?.memoryUsage, "number");
  assertEquals(typeof result.metrics?.bundleSizeEstimate, "number");
  assertEquals(typeof result.metrics?.complexityScore, "number");
  assertEquals(typeof result.metrics?.maintainabilityIndex, "number");
  
  // Memory usage should be reasonable
  assertEquals(result.metrics?.memoryUsage > 0, true);
  assertEquals(result.metrics?.bundleSizeEstimate > 0, true);
  
  // Complexity score should be within range
  assertEquals(result.metrics?.complexityScore >= 0, true);
  assertEquals(result.metrics?.complexityScore <= 100, true);
  
  // Maintainability index should be within range
  assertEquals(result.metrics?.maintainabilityIndex >= 0, true);
  assertEquals(result.metrics?.maintainabilityIndex <= 100, true);
});

Deno.test("EnhancedDiagnosticTool - validate availability", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async (path: string) => {
      // Simulate some missing templates
      return !path.includes("missing-template");
    }
  };
  
  const availability = await diagnosticTool.validateAvailability(testConfig, mockCompilationContext);
  
  // Should have component availability results
  assertEquals(availability.componentAvailability instanceof Map, true);
  assertEquals(availability.templateAvailability instanceof Map, true);
  assertEquals(Array.isArray(availability.missingComponents), true);
  assertEquals(Array.isArray(availability.missingTemplates), true);
  assertEquals(Array.isArray(availability.recommendations), true);
  
  // Should detect available components
  assertEquals(availability.componentAvailability.get("Button"), true);
  assertEquals(availability.componentAvailability.get("Card"), true);
  assertEquals(availability.componentAvailability.get("Layout"), true);
  
  // Should have recommendations if there are missing items
  if (availability.missingComponents.length > 0 || availability.missingTemplates.length > 0) {
    assertEquals(availability.recommendations.length > 0, true);
  }
});

Deno.test("EnhancedDiagnosticTool - generate report", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig, {
    checkAccessibility: true,
    checkSEO: true,
    checkI18n: true,
    analyzeMemoryUsage: true,
    estimateBundleSize: true
  });
  
  const report = diagnosticTool.generateReport(result);
  
  // Should be a string
  assertEquals(typeof report, "string");
  
  // Should contain key sections
  assertStringIncludes(report, "ENHANCED DIAGNOSTIC REPORT");
  assertStringIncludes(report, "SUMMARY");
  assertStringIncludes(report, "METRICS");
  assertStringIncludes(report, "PERFORMANCE");
  assertStringIncludes(report, "DEPENDENCIES");
  
  // Should contain analysis results
  if (result.accessibility) {
    assertStringIncludes(report, "ACCESSIBILITY");
  }
  
  if (result.seo) {
    assertStringIncludes(report, "SEO");
  }
  
  if (result.errors.length > 0) {
    assertStringIncludes(report, "ERRORS");
  }
  
  if (result.warnings.length > 0) {
    assertStringIncludes(report, "WARNINGS");
  }
  
  if (result.suggestions.length > 0) {
    assertStringIncludes(report, "SUGGESTIONS");
  }
});

Deno.test("EnhancedDiagnosticTool - verbose and debug modes", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.DEBUG);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Mock console methods to capture verbose/debug output
  const originalConsoleInfo = console.info;
  const originalConsoleDebug = console.debug;
  let infoMessages: string[] = [];
  let debugMessages: string[] = [];
  
  console.info = (message: string) => {
    infoMessages.push(message);
  };
  
  console.debug = (message: string) => {
    debugMessages.push(message);
  };
  
  try {
    const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig, {
      verbose: true,
      debug: true,
      analyzeMemoryUsage: true,
      estimateBundleSize: true
    });
    
    // Should have completed analysis
    assertEquals(typeof result.valid, "boolean");
    
    // Should have generated verbose output (info messages)
    const hasVerboseOutput = infoMessages.some(msg => 
      msg.includes("Starting enhanced diagnostic") || 
      msg.includes("Analyzing")
    );
    assertEquals(hasVerboseOutput, true);
    
    // Should have generated debug output
    const hasDebugOutput = debugMessages.some(msg => 
      msg.includes("score") || 
      msg.includes("Found") ||
      msg.includes("Estimated")
    );
    assertEquals(hasDebugOutput, true);
  } finally {
    // Restore console methods
    console.info = originalConsoleInfo;
    console.debug = originalConsoleDebug;
  }
});

Deno.test("EnhancedDiagnosticTool - complex configuration analysis", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Create a complex configuration with many components and deep nesting
  const complexConfig: AppConfig = {
    metadata: {
      name: "complex-app",
      version: "2.0.0",
      description: "Complex application for testing"
    },
    components: Array.from({ length: 20 }, (_, i) => ({
      id: `component${i}`,
      type: i % 2 === 0 ? "Button" : "Card",
      props: {
        label: `Component ${i}`,
        title: `Title ${i}`
      },
      children: i < 5 ? [{
        id: `child${i}`,
        type: "Layout",
        props: {},
        children: [{
          id: `grandchild${i}`,
          type: "Button",
          props: { label: `Grandchild ${i}` }
        }]
      }] : undefined
    })),
    routes: Array.from({ length: 10 }, (_, i) => ({
      path: `/route${i}`,
      component: `component${i}`
    })),
    api: {
      endpoints: Array.from({ length: 15 }, (_, i) => ({
        path: `/api/endpoint${i}`,
        methods: ["GET", "POST"],
        handler: `handler${i}`
      }))
    }
  };
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await diagnosticTool.analyzeConfigurationEnhanced(complexConfig, {
    analyzeMemoryUsage: true,
    estimateBundleSize: true,
    checkCircularDependencies: true
  });
  
  // Should handle complex configuration
  assertEquals(typeof result.valid, "boolean");
  
  // Should have higher complexity score due to many components
  assertEquals(result.metrics?.complexityScore > 30, true);
  
  // Should have reasonable performance estimates
  assertEquals(result.performance?.componentCount, 20);
  assertEquals(result.performance?.routeCount, 10);
  assertEquals(result.performance?.apiEndpointCount, 15);
  
  // Should have higher memory and bundle size estimates
  assertEquals(result.metrics?.memoryUsage > 1000000, true); // > 1MB
  assertEquals(result.metrics?.bundleSizeEstimate > 200000, true); // > 200KB
});

Deno.test("EnhancedDiagnosticTool - error handling", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods to simulate missing templates
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => false, // Template directory doesn't exist
    fileExists: async () => false // Template files don't exist
  };
  
  // Should handle missing templates gracefully
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig);
  
  // Should still return a result even with missing templates
  assertEquals(typeof result.valid, "boolean");
  assertEquals(Array.isArray(result.errors), true);
  
  // Should have errors related to missing template directory
  const hasTemplateError = result.errors.some(error => 
    error.type === "template" && (error.message.includes("not found") || error.message.includes("missing"))
  );
  assertEquals(hasTemplateError, true);
});

Deno.test("EnhancedDiagnosticTool - selective analysis options", async () => {
  const diagnosticTool = new EnhancedDiagnosticTool(mockComponentRegistry, "/templates", LogLevel.INFO);
  
  // Mock file system methods
  (diagnosticTool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Test with only specific analysis enabled
  const result = await diagnosticTool.analyzeConfigurationEnhanced(testConfig, {
    checkAccessibility: true,
    checkSEO: false,
    checkI18n: false,
    analyzeMemoryUsage: false,
    estimateBundleSize: false
  });
  
  // Should have accessibility analysis
  assertEquals(typeof result.accessibility?.score, "number");
  
  // Should not have SEO or i18n analysis
  assertEquals(result.seo, undefined);
  assertEquals(result.i18n, undefined);
  
  // Should not have memory or bundle size estimates
  assertEquals(result.metrics?.memoryUsage, undefined);
  assertEquals(result.metrics?.bundleSizeEstimate, undefined);
  
  // Should still have basic metrics
  assertEquals(typeof result.metrics?.analysisTime, "number");
  assertEquals(typeof result.metrics?.complexityScore, "number");
  assertEquals(typeof result.metrics?.maintainabilityIndex, "number");
});