// Unit tests for enhanced diagnostic tools
import { assertEquals, assertStringIncludes } from "https://deno.land/std/testing/asserts.ts";
import { 
  EnhancedDiagnosticTool, 
  EnhancedDiagnosticOptions, 
  EnhancedDiagnosticResult 
} from "./diagnostics-enhanced.ts";
import { LogLevel } from "../../shared/src/enums.ts";
import type { AppConfig, ComponentDefinition, RouteDefinition, ApiEndpoint } from "../../shared/src/types.ts";

// Mock component registry for testing
const mockComponentRegistry = {
  Button: {
    component: {},
    schema: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        variant: { type: 'string', enum: ['primary', 'secondary', 'danger'] },
        size: { type: 'string', enum: ['sm', 'md', 'lg'] },
        disabled: { type: 'boolean' }
      },
      required: ['label']
    },
    dependencies: []
  },
  Card: {
    component: {},
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        bordered: { type: 'boolean' }
      },
      required: ['title']
    },
    dependencies: []
  },
  Image: {
    component: {},
    schema: {
      type: 'object',
      properties: {
        src: { type: 'string' },
        alt: { type: 'string' },
        width: { type: 'number' },
        height: { type: 'number' }
      },
      required: ['src', 'alt']
    },
    dependencies: []
  }
};

// Mock app configuration for testing
const mockAppConfig: AppConfig = {
  metadata: {
    name: 'test-app',
    version: '1.0.0',
    description: 'Test application'
  },
  components: [
    {
      id: 'header',
      type: 'Card',
      props: {
        title: 'Test App',
        bordered: true
      }
    },
    {
      id: 'submitButton',
      type: 'Button',
      props: {
        label: 'Submit',
        variant: 'primary',
        size: 'md'
      }
    },
    {
      id: 'cancelButton',
      type: 'Button',
      props: {
        label: 'Cancel',
        variant: 'secondary',
        size: 'md'
      }
    },
    {
      id: 'logo',
      type: 'Image',
      props: {
        src: '/logo.png',
        width: 100,
        height: 100
      }
    }
  ],
  routes: [
    {
      path: '/',
      component: 'header',
      meta: {
        title: 'Home Page'
      }
    },
    {
      path: '/about',
      component: 'header',
      meta: {
        title: 'About Page'
      }
    },
    {
      path: '/user/:id',
      component: 'header'
    }
  ],
  api: {
    endpoints: [
      {
        path: '/api/users',
        methods: ['GET', 'POST'],
        handler: 'userHandler',
        auth: {
          required: true
        }
      },
      {
        path: '/api/products',
        methods: ['GET'],
        handler: 'productHandler'
      }
    ]
  }
};

Deno.test("EnhancedDiagnosticTool - constructor", () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Check that the tool was created
  assertEquals(typeof tool.analyzeConfigurationEnhanced, 'function');
});

Deno.test("EnhancedDiagnosticTool - analyzeConfigurationEnhanced basic functionality", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager to avoid actual file system operations
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  const result = await tool.analyzeConfigurationEnhanced(mockAppConfig);
  
  // Check that the result has the expected structure
  assertEquals(typeof result.valid, 'boolean');
  assertEquals(Array.isArray(result.errors), true);
  assertEquals(Array.isArray(result.warnings), true);
  assertEquals(Array.isArray(result.suggestions), true);
  
  // Check that enhanced analysis fields are present
  assertEquals(typeof result.componentAnalysis, 'object');
  assertEquals(typeof result.routeAnalysis, 'object');
  assertEquals(typeof result.apiAnalysis, 'object');
});

Deno.test("EnhancedDiagnosticTool - analyzeComponentsEnhanced", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with component issues
  const configWithIssues: AppConfig = {
    ...mockAppConfig,
    components: [
      ...mockAppConfig.components,
      {
        id: 'missingAltImage',
        type: 'Image',
        props: {
          src: '/image.png',
          // Missing alt prop
          width: 200,
          height: 200
        }
      },
      {
        id: 'unknownComponent',
        type: 'UnknownType',
        props: {}
      }
    ]
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithIssues, {
    detailedPropAnalysis: true
  });
  
  // Check component analysis
  assertEquals(result.componentAnalysis?.problematicComponents.length >= 2, true);
  
  // Check for missing alt prop issue
  const missingAltImage = result.componentAnalysis?.problematicComponents.find(c => c.id === 'missingAltImage');
  assertEquals(missingAltImage !== undefined, true);
  assertEquals(missingAltImage?.issues.some(issue => issue.includes('alt')), true);
  
  // Check for unknown component issue
  const unknownComponent = result.componentAnalysis?.problematicComponents.find(c => c.id === 'unknownComponent');
  assertEquals(unknownComponent !== undefined, true);
  assertEquals(unknownComponent?.issues.some(issue => issue.includes('not found')), true);
  
  // Check for complexity metrics
  assertEquals(typeof result.componentAnalysis?.complexityMetrics, 'object');
});

Deno.test("EnhancedDiagnosticTool - analyzeRoutesEnhanced", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with route issues
  const configWithIssues: AppConfig = {
    ...mockAppConfig,
    routes: [
      ...mockAppConfig.routes,
      {
        path: '/products/:id/reviews/:reviewId/comments/:commentId',
        component: 'header'
        // Missing meta
      },
      {
        path: '/nested/route/without/parent',
        component: 'unknownComponent'
      }
    ]
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithIssues, {
    analyzeRouteParams: true
  });
  
  // Check route analysis
  assertEquals(result.routeAnalysis?.problematicRoutes.length >= 2, true);
  
  // Check for excessive parameters issue
  const routeWithManyParams = result.routeAnalysis?.problematicRoutes.find(r => 
    r.path === '/products/:id/reviews/:reviewId/comments/:commentId'
  );
  assertEquals(routeWithManyParams !== undefined, true);
  assertEquals(routeWithManyParams?.issues.some(issue => issue.includes('parameters')), true);
  
  // Check for missing parent route issue
  const nestedRoute = result.routeAnalysis?.problematicRoutes.find(r => 
    r.path === '/nested/route/without/parent'
  );
  assertEquals(nestedRoute !== undefined, true);
  assertEquals(nestedRoute?.issues.some(issue => issue.includes('parent')), true);
  
  // Check for dynamic parameters
  assertEquals(typeof result.routeAnalysis?.dynamicParameters, 'object');
  assertEquals(Array.isArray(result.routeAnalysis?.dynamicParameters['/user/:id']), true);
});

Deno.test("EnhancedDiagnosticTool - analyzeApiEnhanced", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with API issues
  const configWithIssues: AppConfig = {
    ...mockAppConfig,
    api: {
      endpoints: [
        ...mockAppConfig.api.endpoints,
        {
          path: '/api/orders',
          methods: ['POST', 'PUT'],
          handler: 'orderHandler'
          // Missing auth and validation
        },
        {
          path: '/api/payments',
          methods: ['POST'],
          handler: 'paymentHandler',
          auth: {
            required: true
          }
          // Missing validation
        }
      ]
    }
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithIssues, {
    analyzeApiSchemas: true
  });
  
  // Check API analysis
  assertEquals(result.apiAnalysis?.problematicEndpoints.length >= 2, true);
  
  // Check for missing auth issue
  const orderEndpoint = result.apiAnalysis?.problematicEndpoints.find(e => 
    e.path === '/api/orders'
  );
  assertEquals(orderEndpoint !== undefined, true);
  assertEquals(orderEndpoint?.issues.some(issue => issue.includes('authentication')), true);
  
  // Check for missing validation issue
  const paymentEndpoint = result.apiAnalysis?.problematicEndpoints.find(e => 
    e.path === '/api/payments'
  );
  assertEquals(paymentEndpoint !== undefined, true);
  assertEquals(paymentEndpoint?.issues.some(issue => issue.includes('validation')), true);
  
  // Check for security analysis
  assertEquals(typeof result.apiAnalysis?.security, 'object');
  assertEquals(Array.isArray(result.apiAnalysis?.security?.missingValidation), true);
});

Deno.test("EnhancedDiagnosticTool - checkCircularDependencies", async () => {
  const tool = new EnhancedDiagnosticTool({
    ...mockComponentRegistry,
    Header: {
      component: {},
      schema: {},
      dependencies: ['Footer']
    },
    Footer: {
      component: {},
      schema: {},
      dependencies: ['Header']
    }
  }, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with circular dependencies
  const configWithCircularDeps: AppConfig = {
    ...mockAppConfig,
    components: [
      {
        id: 'header',
        type: 'Header',
        props: {}
      },
      {
        id: 'footer',
        type: 'Footer',
        props: {}
      }
    ]
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithCircularDeps, {
    checkCircularDependencies: true
  });
  
  // Check for circular dependency errors
  assertEquals(result.errors.some(e => e.message.includes('Circular dependency')), true);
});

Deno.test("EnhancedDiagnosticTool - analyzePerformanceBottlenecks", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with many components
  const manyComponents: ComponentDefinition[] = [];
  for (let i = 0; i < 60; i++) {
    manyComponents.push({
      id: `component${i}`,
      type: 'Button',
      props: {
        label: `Button ${i}`
      }
    });
  }
  
  const configWithManyComponents: AppConfig = {
    ...mockAppConfig,
    components: manyComponents
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithManyComponents, {
    checkPerformanceBottlenecks: true
  });
  
  // Check performance analysis
  assertEquals(typeof result.performanceAnalysis, 'object');
  assertEquals(Array.isArray(result.performanceAnalysis?.bottlenecks), true);
  assertEquals(result.performanceAnalysis?.bottlenecks.some(b => b.includes('Large number of components')), true);
  
  // Check for estimated load times
  assertEquals(typeof result.performanceAnalysis?.estimatedLoadTimes, 'object');
});

Deno.test("EnhancedDiagnosticTool - analyzeAccessibility", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with accessibility issues
  const configWithA11yIssues: AppConfig = {
    ...mockAppConfig,
    components: [
      ...mockAppConfig.components,
      {
        id: 'imageWithoutAlt',
        type: 'Image',
        props: {
          src: '/image.png'
          // Missing alt text
        }
      },
      {
        id: 'buttonWithoutLabel',
        type: 'Button',
        props: {
          // Missing label
          variant: 'primary'
        }
      }
    ]
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithA11yIssues, {
    checkAccessibility: true
  });
  
  // Check accessibility analysis
  assertEquals(typeof result.accessibilityAnalysis, 'object');
  assertEquals(Array.isArray(result.accessibilityAnalysis?.complianceIssues), true);
  assertEquals(result.accessibilityAnalysis?.complianceIssues.some(issue => issue.includes('alt text')), true);
  assertEquals(result.accessibilityAnalysis?.complianceIssues.some(issue => issue.includes('accessible name')), true);
});

Deno.test("EnhancedDiagnosticTool - analyzeSeo", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with SEO issues
  const configWithSeoIssues: AppConfig = {
    ...mockAppConfig,
    routes: [
      ...mockAppConfig.routes,
      {
        path: '/products',
        component: 'header'
        // Missing meta title and description
      }
    ]
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithSeoIssues, {
    checkSeo: true
  });
  
  // Check SEO analysis
  assertEquals(typeof result.seoAnalysis, 'object');
  assertEquals(Array.isArray(result.seoAnalysis?.issues), true);
  assertEquals(result.seoAnalysis?.issues.some(issue => issue.includes('meta title')), true);
  assertEquals(Array.isArray(result.seoAnalysis?.suggestions), true);
});

Deno.test("EnhancedDiagnosticTool - analyzeI18n", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with i18n issues
  const configWithI18nIssues: AppConfig = {
    ...mockAppConfig,
    components: [
      ...mockAppConfig.components,
      {
        id: 'hardcodedText',
        type: 'Button',
        props: {
          label: 'Hardcoded Button Text'
        }
      }
    ]
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithI18nIssues, {
    checkI18n: true
  });
  
  // Check i18n analysis
  assertEquals(typeof result.i18nAnalysis, 'object');
  assertEquals(Array.isArray(result.i18nAnalysis?.hardcodedStrings), true);
  assertEquals(result.i18nAnalysis?.hardcodedStrings.some(str => str.includes('Hardcoded Button Text')), true);
});

Deno.test("EnhancedDiagnosticTool - analyzeMobileResponsiveness", async () => {
  const tool = new EnhancedDiagnosticTool(mockComponentRegistry, '/templates', LogLevel.INFO);
  
  // Mock file manager
  (tool as any).fileManager = {
    directoryExists: async () => true,
    fileExists: async () => true
  };
  
  // Create a config with mobile issues
  const configWithMobileIssues: AppConfig = {
    ...mockAppConfig,
    components: [
      ...mockAppConfig.components,
      {
        id: 'fixedWidthComponent',
        type: 'Card',
        props: {
          title: 'Fixed Width',
          style: {
            width: '800px' // Fixed width instead of responsive
          }
        }
      }
    ]
  };
  
  const result = await tool.analyzeConfigurationEnhanced(configWithMobileIssues, {
    checkMobileResponsiveness: true
  });
  
  // Check mobile analysis
  assertEquals(typeof result.mobileAnalysis, 'object');
  assertEquals(Array.isArray(result.mobileAnalysis?.issues), true);
  assertEquals(Array.isArray(result.mobileAnalysis?.suggestions), true);
});