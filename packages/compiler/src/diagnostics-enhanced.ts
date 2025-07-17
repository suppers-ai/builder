// Enhanced diagnostic tools for analyzing JSON configurations and troubleshooting compilation issues
import { 
  AppConfig, 
  CompilationError, 
  ComponentDefinition, 
  RouteDefinition,
  ApiEndpoint,
  ComponentRegistry,
  ErrorSeverity
} from "../../shared/src/types.ts";
import { 
  CompilerError, 
  ValidationError, 
  ComponentError, 
  DependencyError,
  TemplateError,
  RouteError,
  ApiError,
  ConfigurationError,
  errorLogger
} from "../../shared/src/errors.ts";
import { LogLevel, RESERVED_COMPONENT_NAMES, RESERVED_ROUTE_PATHS } from "../../shared/src/enums.ts";
import { fileManager } from "./file-manager.ts";
import { DiagnosticTool, DiagnosticOptions, DiagnosticResult } from "./diagnostics.ts";

/**
 * Enhanced diagnostic options
 */
export interface EnhancedDiagnosticOptions extends DiagnosticOptions {
  /** Whether to check for circular dependencies */
  checkCircularDependencies?: boolean;
  /** Whether to check for unused imports */
  checkUnusedImports?: boolean;
  /** Whether to check for file size issues */
  checkFileSizes?: boolean;
  /** Whether to check for naming conventions */
  checkNamingConventions?: boolean;
  /** Whether to check for accessibility issues */
  checkAccessibility?: boolean;
  /** Whether to check for internationalization issues */
  checkI18n?: boolean;
  /** Whether to check for SEO issues */
  checkSeo?: boolean;
  /** Whether to check for mobile responsiveness */
  checkMobileResponsiveness?: boolean;
  /** Maximum depth to analyze */
  maxAnalysisDepth?: number;
  /** Whether to analyze component props in detail */
  detailedPropAnalysis?: boolean;
  /** Whether to analyze route parameters */
  analyzeRouteParams?: boolean;
  /** Whether to analyze API request/response schemas */
  analyzeApiSchemas?: boolean;
  /** Whether to check for potential memory leaks */
  checkMemoryLeaks?: boolean;
  /** Whether to check for potential performance bottlenecks */
  checkPerformanceBottlenecks?: boolean;
}

/**
 * Enhanced diagnostic result
 */
export interface EnhancedDiagnosticResult extends DiagnosticResult {
  /** Detailed component analysis */
  componentAnalysis?: {
    /** Components with potential issues */
    problematicComponents: Array<{
      id: string;
      type: string;
      issues: string[];
    }>;
    /** Component dependency graph */
    dependencyGraph?: Record<string, string[]>;
    /** Component complexity metrics */
    complexityMetrics?: Record<string, {
      propsCount: number;
      nestingDepth: number;
      childrenCount: number;
      complexity: 'low' | 'medium' | 'high';
    }>;
  };
  
  /** Detailed route analysis */
  routeAnalysis?: {
    /** Routes with potential issues */
    problematicRoutes: Array<{
      path: string;
      issues: string[];
    }>;
    /** Dynamic route parameters */
    dynamicParameters?: Record<string, string[]>;
    /** Route coverage analysis */
    coverage?: {
      missingRoutes: string[];
      suggestedRoutes: string[];
    };
  };
  
  /** Detailed API analysis */
  apiAnalysis?: {
    /** API endpoints with potential issues */
    problematicEndpoints: Array<{
      path: string;
      methods: string[];
      issues: string[];
    }>;
    /** API security analysis */
    security?: {
      unprotectedEndpoints: string[];
      missingValidation: string[];
      missingRateLimiting: string[];
    };
  };
  
  /** Performance analysis */
  performanceAnalysis?: {
    /** Potential bottlenecks */
    bottlenecks: string[];
    /** Optimization suggestions */
    optimizationSuggestions: string[];
    /** Estimated load times */
    estimatedLoadTimes?: Record<string, number>;
  };
  
  /** Accessibility analysis */
  accessibilityAnalysis?: {
    /** WCAG compliance issues */
    complianceIssues: string[];
    /** Suggestions for improving accessibility */
    suggestions: string[];
  };
  
  /** SEO analysis */
  seoAnalysis?: {
    /** SEO issues */
    issues: string[];
    /** Suggestions for improving SEO */
    suggestions: string[];
  };
  
  /** Internationalization analysis */
  i18nAnalysis?: {
    /** Missing translations */
    missingTranslations: string[];
    /** Hardcoded strings */
    hardcodedStrings: string[];
  };
  
  /** Mobile responsiveness analysis */
  mobileAnalysis?: {
    /** Responsiveness issues */
    issues: string[];
    /** Suggestions for improving mobile experience */
    suggestions: string[];
  };
}