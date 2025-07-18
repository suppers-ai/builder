// Enhanced diagnostic tools with verbose logging and advanced troubleshooting capabilities
import { 
  AppConfig, 
  CompilationError, 
  ComponentDefinition, 
  RouteDefinition,
  ApiEndpoint,
  ComponentRegistry,
  ErrorSeverity,
  CompilationContext
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
import { DiagnosticTool, type DiagnosticOptions, type DiagnosticResult } from "./diagnostics.ts";
import { fileManager } from "./file-manager.ts";

/**
 * Enhanced diagnostic options with verbose logging capabilities
 */
export interface EnhancedDiagnosticOptions extends DiagnosticOptions {
  /** Enable verbose logging mode */
  verbose?: boolean;
  /** Enable debug mode with detailed output */
  debug?: boolean;
  /** Enable performance profiling */
  enableProfiling?: boolean;
  /** Check for circular dependencies */
  checkCircularDependencies?: boolean;
  /** Check for accessibility issues */
  checkAccessibility?: boolean;
  /** Check for SEO best practices */
  checkSEO?: boolean;
  /** Check for internationalization readiness */
  checkI18n?: boolean;
  /** Maximum depth for dependency analysis */
  maxDependencyDepth?: number;
  /** Enable memory usage analysis */
  analyzeMemoryUsage?: boolean;
  /** Enable bundle size estimation */
  estimateBundleSize?: boolean;
}

/**
 * Enhanced diagnostic result with additional metrics and insights
 */
export interface EnhancedDiagnosticResult extends DiagnosticResult {
  /** Detailed analysis metrics */
  metrics?: {
    analysisTime: number;
    memoryUsage?: number;
    bundleSizeEstimate?: number;
    complexityScore: number;
    maintainabilityIndex: number;
  };
  /** Dependency analysis results */
  dependencies?: {
    componentDependencies: Map<string, string[]>;
    circularDependencies: string[][];
    unusedDependencies: string[];
    missingDependencies: string[];
  };
  /** Accessibility analysis */
  accessibility?: {
    issues: string[];
    score: number;
    recommendations: string[];
  };
  /** SEO analysis */
  seo?: {
    issues: string[];
    score: number;
    recommendations: string[];
  };
  /** Internationalization analysis */
  i18n?: {
    hardcodedStrings: string[];
    missingTranslations: string[];
    recommendations: string[];
  };
}

/**
 * Enhanced diagnostic tool with advanced analysis capabilities
 */
export class EnhancedDiagnosticTool extends DiagnosticTool {
  private startTime: number = 0;
  private verboseMode: boolean = false;
  private debugMode: boolean = false;
  
  constructor(componentRegistry: ComponentRegistry, templateDir: string, logLevel: LogLevel = LogLevel.INFO) {
    super(componentRegistry, templateDir, logLevel);
  }
  
  /**
   * Analyze a configuration with enhanced diagnostics
   */
  async analyzeConfigurationEnhanced(
    config: AppConfig, 
    options: EnhancedDiagnosticOptions = {}
  ): Promise<EnhancedDiagnosticResult> {
    this.startTime = Date.now();
    this.verboseMode = options.verbose || false;
    this.debugMode = options.debug || false;
    
    if (this.verboseMode) {
      errorLogger.info("Starting enhanced diagnostic analysis...");
    }
    
    // Start with basic diagnostic analysis
    const basicResult = await super.analyzeConfiguration(config, options);
    
    // Enhance the result with additional analysis
    const enhancedResult: EnhancedDiagnosticResult = {
      ...basicResult,
      metrics: await this.analyzeMetrics(config, options),
      dependencies: await this.analyzeDependencies(config, options),
      accessibility: options.checkAccessibility ? this.analyzeAccessibility(config) : undefined,
      seo: options.checkSEO ? this.analyzeSEO(config) : undefined,
      i18n: options.checkI18n ? this.analyzeI18n(config) : undefined,
    };
    
    // Add enhanced suggestions based on analysis
    this.addEnhancedSuggestions(enhancedResult, config, options);
    
    const analysisTime = Date.now() - this.startTime;
    if (this.verboseMode) {
      errorLogger.info(`Enhanced diagnostic analysis completed in ${analysisTime}ms`);
    }
    
    return enhancedResult;
  }
  
  /**
   * Analyze metrics and performance characteristics
   */
  private async analyzeMetrics(
    config: AppConfig, 
    options: EnhancedDiagnosticOptions
  ): Promise<EnhancedDiagnosticResult['metrics']> {
    if (this.verboseMode) {
      errorLogger.info("Analyzing metrics and performance characteristics...");
    }
    
    const analysisTime = Date.now() - this.startTime;
    let memoryUsage: number | undefined;
    let bundleSizeEstimate: number | undefined;
    
    // Analyze memory usage if requested
    if (options.analyzeMemoryUsage) {
      memoryUsage = this.estimateMemoryUsage(config);
      if (this.debugMode) {
        errorLogger.debug(`Estimated memory usage: ${memoryUsage} bytes`);
      }
    }
    
    // Estimate bundle size if requested
    if (options.estimateBundleSize) {
      bundleSizeEstimate = this.estimateBundleSize(config);
      if (this.debugMode) {
        errorLogger.debug(`Estimated bundle size: ${bundleSizeEstimate} bytes`);
      }
    }
    
    // Calculate complexity score
    const complexityScore = this.calculateComplexityScore(config);
    if (this.debugMode) {
      errorLogger.debug(`Complexity score: ${complexityScore}`);
    }
    
    // Calculate maintainability index
    const maintainabilityIndex = this.calculateMaintainabilityIndex(config);
    if (this.debugMode) {
      errorLogger.debug(`Maintainability index: ${maintainabilityIndex}`);
    }
    
    return {
      analysisTime,
      memoryUsage,
      bundleSizeEstimate,
      complexityScore,
      maintainabilityIndex,
    };
  }
  
  /**
   * Analyze dependencies and relationships
   */
  private async analyzeDependencies(
    config: AppConfig, 
    options: EnhancedDiagnosticOptions
  ): Promise<EnhancedDiagnosticResult['dependencies']> {
    if (this.verboseMode) {
      errorLogger.info("Analyzing component dependencies and relationships...");
    }
    
    const componentDependencies = this.buildComponentDependencyMap(config);
    const circularDependencies = options.checkCircularDependencies 
      ? this.findCircularDependencies(componentDependencies)
      : [];
    const unusedDependencies = this.findUnusedDependencies(config, componentDependencies);
    const missingDependencies = this.findMissingDependencies(config, componentDependencies);
    
    if (this.debugMode) {
      errorLogger.debug(`Found ${componentDependencies.size} component dependencies`);
      errorLogger.debug(`Found ${circularDependencies.length} circular dependencies`);
      errorLogger.debug(`Found ${unusedDependencies.length} unused dependencies`);
      errorLogger.debug(`Found ${missingDependencies.length} missing dependencies`);
    }
    
    return {
      componentDependencies,
      circularDependencies,
      unusedDependencies,
      missingDependencies,
    };
  }
  
  /**
   * Analyze accessibility issues
   */
  private analyzeAccessibility(config: AppConfig): EnhancedDiagnosticResult['accessibility'] {
    if (this.verboseMode) {
      errorLogger.info("Analyzing accessibility compliance...");
    }
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Get all components including nested ones
    const allComponents = this.getAllComponents(config);
    
    // Check for missing alt text on images
    const imageComponents = allComponents.filter(c => 
      c.type.toLowerCase().includes('image') || 
      c.type.toLowerCase().includes('img')
    );
    
    for (const component of imageComponents) {
      if (!component.props.alt && !component.props.altText) {
        issues.push(`Image component '${component.id}' is missing alt text`);
        recommendations.push(`Add alt text to image component '${component.id}' for screen readers`);
      }
    }
    
    // Check for missing form labels
    const formComponents = allComponents.filter(c => 
      c.type.toLowerCase().includes('input') || 
      c.type.toLowerCase().includes('form') ||
      c.type.toLowerCase().includes('field')
    );
    
    for (const component of formComponents) {
      if (!component.props.label && !component.props.ariaLabel && !component.props['aria-label']) {
        issues.push(`Form component '${component.id}' is missing accessible label`);
        recommendations.push(`Add a label or aria-label to form component '${component.id}'`);
      }
    }
    
    // Check for missing heading hierarchy
    const headingComponents = config.components?.filter(c => 
      c.type.toLowerCase().includes('heading') || 
      c.type.toLowerCase().includes('title')
    ) || [];
    
    if (headingComponents.length === 0) {
      issues.push("No heading components found - page structure may not be accessible");
      recommendations.push("Add heading components to create a proper document outline");
    }
    
    // Check for missing focus management
    const interactiveComponents = config.components?.filter(c => 
      c.type.toLowerCase().includes('button') || 
      c.type.toLowerCase().includes('link') ||
      c.type.toLowerCase().includes('input')
    ) || [];
    
    for (const component of interactiveComponents) {
      if (!component.props.tabIndex && component.props.tabIndex !== 0) {
        recommendations.push(`Consider adding explicit tab order to interactive component '${component.id}'`);
      }
    }
    
    // Calculate accessibility score (0-100)
    const totalChecks = imageComponents.length + formComponents.length + 1; // +1 for heading check
    const passedChecks = totalChecks - issues.length;
    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
    
    if (this.debugMode) {
      errorLogger.debug(`Accessibility score: ${score}/100`);
      errorLogger.debug(`Found ${issues.length} accessibility issues`);
    }
    
    return {
      issues,
      score,
      recommendations,
    };
  }
  
  /**
   * Analyze SEO best practices
   */
  private analyzeSEO(config: AppConfig): EnhancedDiagnosticResult['seo'] {
    if (this.verboseMode) {
      errorLogger.info("Analyzing SEO best practices...");
    }
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for missing meta tags
    if (!config.metadata?.description) {
      issues.push("Missing application description for meta tags");
      recommendations.push("Add a description to metadata for better search engine visibility");
    }
    
    // Check for missing title components
    const titleComponents = config.components?.filter(c => 
      c.type.toLowerCase().includes('title') || 
      c.type.toLowerCase().includes('head')
    ) || [];
    
    if (titleComponents.length === 0) {
      issues.push("No title components found");
      recommendations.push("Add title components to set page titles for SEO");
    }
    
    // Check for missing structured data
    const hasStructuredData = config.components?.some(c => 
      c.props.schema || c.props.jsonLd || c.type.toLowerCase().includes('schema')
    );
    
    if (!hasStructuredData) {
      recommendations.push("Consider adding structured data (JSON-LD) for better search engine understanding");
    }
    
    // Check for image optimization
    const imageComponents = config.components?.filter(c => 
      c.type.toLowerCase().includes('image') || 
      c.type.toLowerCase().includes('img')
    ) || [];
    
    for (const component of imageComponents) {
      if (!component.props.loading || component.props.loading !== 'lazy') {
        recommendations.push(`Consider adding lazy loading to image component '${component.id}' for better performance`);
      }
    }
    
    // Check for sitemap route
    const hasSitemap = config.routes?.some(route => 
      route.path.includes('sitemap') || route.path.includes('robots')
    );
    
    if (!hasSitemap) {
      recommendations.push("Consider adding sitemap and robots.txt routes for better SEO");
    }
    
    // Calculate SEO score (0-100)
    const totalChecks = 3; // Description, title, structured data
    const passedChecks = totalChecks - issues.length;
    const score = Math.round((passedChecks / totalChecks) * 100);
    
    if (this.debugMode) {
      errorLogger.debug(`SEO score: ${score}/100`);
      errorLogger.debug(`Found ${issues.length} SEO issues`);
    }
    
    return {
      issues,
      score,
      recommendations,
    };
  }
  
  /**
   * Analyze internationalization readiness
   */
  private analyzeI18n(config: AppConfig): EnhancedDiagnosticResult['i18n'] {
    if (this.verboseMode) {
      errorLogger.info("Analyzing internationalization readiness...");
    }
    
    const hardcodedStrings: string[] = [];
    const missingTranslations: string[] = [];
    const recommendations: string[] = [];
    
    // Check for hardcoded strings in component props
    for (const component of config.components || []) {
      for (const [key, value] of Object.entries(component.props)) {
        if (typeof value === 'string' && value.length > 0) {
          // Check if it looks like user-facing text (not a class name, ID, etc.)
          if (!key.toLowerCase().includes('class') && 
              !key.toLowerCase().includes('id') && 
              !key.toLowerCase().includes('name') &&
              !value.startsWith('http') &&
              !value.startsWith('/') &&
              !value.startsWith('#') &&
              !value.startsWith('.')) {
            hardcodedStrings.push(`Component '${component.id}' has hardcoded text in prop '${key}': "${value}"`);
          }
        }
      }
    }
    
    // Check for i18n configuration
    const hasI18nConfig = config.i18n !== undefined;
    if (!hasI18nConfig) {
      recommendations.push("Add i18n configuration to support multiple languages");
    }
    
    // Check for translation functions in component props
    const hasTranslationFunctions = config.components?.some(c => 
      Object.values(c.props).some(value => 
        typeof value === 'string' && (value.includes('t(') || value.includes('translate('))
      )
    );
    
    if (!hasTranslationFunctions && hardcodedStrings.length > 0) {
      recommendations.push("Replace hardcoded strings with translation functions");
    }
    
    // Check for locale-specific routes
    const hasLocaleRoutes = config.routes?.some(route => 
      route.path.includes(':locale') || route.path.startsWith('/en/') || route.path.startsWith('/es/')
    );
    
    if (!hasLocaleRoutes && hasI18nConfig) {
      recommendations.push("Consider adding locale-specific routes for better i18n support");
    }
    
    if (this.debugMode) {
      errorLogger.debug(`Found ${hardcodedStrings.length} hardcoded strings`);
      errorLogger.debug(`Found ${missingTranslations.length} missing translations`);
    }
    
    return {
      hardcodedStrings,
      missingTranslations,
      recommendations,
    };
  }
  
  /**
   * Get all components including nested ones
   */
  private getAllComponents(config: AppConfig): ComponentDefinition[] {
    const allComponents: ComponentDefinition[] = [];
    
    const collectComponents = (component: ComponentDefinition): void => {
      allComponents.push(component);
      if (component.children && Array.isArray(component.children)) {
        for (const child of component.children) {
          collectComponents(child);
        }
      }
    };
    
    for (const component of config.components || []) {
      collectComponents(component);
    }
    
    return allComponents;
  }
  
  /**
   * Build a map of component dependencies
   */
  private buildComponentDependencyMap(config: AppConfig): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    
    for (const component of config.components || []) {
      const deps: string[] = [];
      
      // Check for child components
      if (component.children && Array.isArray(component.children)) {
        for (const child of component.children) {
          deps.push(child.id);
        }
      }
      
      // Check for layout dependencies in routes
      for (const route of config.routes || []) {
        if (route.component === component.id && route.layout) {
          deps.push(route.layout);
        }
      }
      
      dependencies.set(component.id, deps);
    }
    
    return dependencies;
  }
  
  /**
   * Find circular dependencies in component relationships
   */
  private findCircularDependencies(dependencies: Map<string, string[]>): string[][] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];
    
    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), node]);
        }
        return;
      }
      
      if (visited.has(node)) {
        return;
      }
      
      visited.add(node);
      recursionStack.add(node);
      
      const deps = dependencies.get(node) || [];
      for (const dep of deps) {
        dfs(dep, [...path, node]);
      }
      
      recursionStack.delete(node);
    };
    
    for (const node of dependencies.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }
    
    return cycles;
  }
  
  /**
   * Find unused dependencies
   */
  private findUnusedDependencies(config: AppConfig, dependencies: Map<string, string[]>): string[] {
    const usedComponents = new Set<string>();
    
    // Components used in routes
    for (const route of config.routes || []) {
      usedComponents.add(route.component);
      if (route.layout) {
        usedComponents.add(route.layout);
      }
    }
    
    // Components used as children
    for (const deps of dependencies.values()) {
      for (const dep of deps) {
        usedComponents.add(dep);
      }
    }
    
    // Find components that are defined but not used
    const unusedComponents: string[] = [];
    for (const component of config.components || []) {
      if (!usedComponents.has(component.id)) {
        unusedComponents.push(component.id);
      }
    }
    
    return unusedComponents;
  }
  
  /**
   * Find missing dependencies
   */
  private findMissingDependencies(config: AppConfig, dependencies: Map<string, string[]>): string[] {
    const definedComponents = new Set(config.components?.map(c => c.id) || []);
    const missingDependencies: string[] = [];
    
    for (const deps of dependencies.values()) {
      for (const dep of deps) {
        if (!definedComponents.has(dep)) {
          missingDependencies.push(dep);
        }
      }
    }
    
    // Check route components
    for (const route of config.routes || []) {
      if (!definedComponents.has(route.component)) {
        missingDependencies.push(route.component);
      }
      if (route.layout && !definedComponents.has(route.layout)) {
        missingDependencies.push(route.layout);
      }
    }
    
    return [...new Set(missingDependencies)]; // Remove duplicates
  }
  
  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(config: AppConfig): number {
    // Rough estimation based on component count and complexity
    const baseMemory = 1024 * 1024; // 1MB base
    const memoryPerComponent = 50 * 1024; // 50KB per component
    const memoryPerRoute = 10 * 1024; // 10KB per route
    const memoryPerEndpoint = 5 * 1024; // 5KB per API endpoint
    
    const componentCount = config.components?.length || 0;
    const routeCount = config.routes?.length || 0;
    const endpointCount = config.api?.endpoints?.length || 0;
    
    return baseMemory + 
           (componentCount * memoryPerComponent) + 
           (routeCount * memoryPerRoute) + 
           (endpointCount * memoryPerEndpoint);
  }
  
  /**
   * Estimate bundle size
   */
  private estimateBundleSize(config: AppConfig): number {
    // Rough estimation based on component count and complexity
    const baseSize = 100 * 1024; // 100KB base (framework overhead)
    const sizePerComponent = 5 * 1024; // 5KB per component
    const sizePerRoute = 2 * 1024; // 2KB per route
    const sizePerEndpoint = 1 * 1024; // 1KB per API endpoint
    
    const componentCount = config.components?.length || 0;
    const routeCount = config.routes?.length || 0;
    const endpointCount = config.api?.endpoints?.length || 0;
    
    return baseSize + 
           (componentCount * sizePerComponent) + 
           (routeCount * sizePerRoute) + 
           (endpointCount * sizePerEndpoint);
  }
  
  /**
   * Calculate complexity score (0-100, higher is more complex)
   */
  private calculateComplexityScore(config: AppConfig): number {
    let score = 0;
    
    // Component complexity
    const componentCount = config.components?.length || 0;
    score += Math.min(componentCount * 2, 30); // Max 30 points for components
    
    // Route complexity
    const routeCount = config.routes?.length || 0;
    score += Math.min(routeCount * 3, 30); // Max 30 points for routes
    
    // API complexity
    const endpointCount = config.api?.endpoints?.length || 0;
    score += Math.min(endpointCount * 2, 20); // Max 20 points for API endpoints
    
    // Nesting complexity
    const maxNestingDepth = this.getMaxNestingDepth(config);
    score += Math.min(maxNestingDepth * 5, 20); // Max 20 points for nesting
    
    return Math.min(score, 100);
  }
  
  /**
   * Calculate maintainability index (0-100, higher is more maintainable)
   */
  private calculateMaintainabilityIndex(config: AppConfig): number {
    let score = 100;
    
    // Reduce score for high complexity
    const complexityScore = this.calculateComplexityScore(config);
    score -= complexityScore * 0.3;
    
    // Reduce score for missing documentation
    if (!config.metadata?.description) {
      score -= 10;
    }
    
    // Reduce score for inconsistent naming
    const hasInconsistentNaming = this.hasInconsistentNaming(config);
    if (hasInconsistentNaming) {
      score -= 15;
    }
    
    // Reduce score for excessive nesting
    const maxNestingDepth = this.getMaxNestingDepth(config);
    if (maxNestingDepth > 5) {
      score -= (maxNestingDepth - 5) * 5;
    }
    
    return Math.max(score, 0);
  }
  
  /**
   * Get maximum nesting depth of components
   */
  private getMaxNestingDepth(config: AppConfig): number {
    const findMaxDepth = (component: ComponentDefinition, depth = 0): number => {
      if (!component.children || component.children.length === 0) {
        return depth;
      }
      
      return Math.max(...component.children.map(child => findMaxDepth(child, depth + 1)));
    };
    
    return Math.max(...(config.components?.map(c => findMaxDepth(c)) || [0]));
  }
  
  /**
   * Check for inconsistent naming conventions
   */
  private hasInconsistentNaming(config: AppConfig): boolean {
    const componentTypes = config.components?.map(c => c.type) || [];
    const pascalCasePattern = /^[A-Z][a-zA-Z0-9]*$/;
    
    return componentTypes.some(type => !pascalCasePattern.test(type));
  }
  
  /**
   * Add enhanced suggestions based on analysis results
   */
  private addEnhancedSuggestions(
    result: EnhancedDiagnosticResult, 
    config: AppConfig, 
    options: EnhancedDiagnosticOptions
  ): void {
    // Performance suggestions
    if (result.metrics?.complexityScore && result.metrics.complexityScore > 70) {
      result.suggestions.push("Consider breaking down complex components into smaller, reusable pieces");
    }
    
    if (result.metrics?.bundleSizeEstimate && result.metrics.bundleSizeEstimate > 1024 * 1024) {
      result.suggestions.push("Bundle size is large - consider code splitting and lazy loading");
    }
    
    // Dependency suggestions
    if (result.dependencies?.circularDependencies.length) {
      result.suggestions.push("Resolve circular dependencies to improve maintainability");
    }
    
    if (result.dependencies?.unusedDependencies.length) {
      result.suggestions.push("Remove unused components to reduce bundle size");
    }
    
    // Accessibility suggestions
    if (result.accessibility?.score && result.accessibility.score < 80) {
      result.suggestions.push("Improve accessibility compliance for better user experience");
    }
    
    // SEO suggestions
    if (result.seo?.score && result.seo.score < 80) {
      result.suggestions.push("Implement SEO best practices for better search engine visibility");
    }
    
    // I18n suggestions
    if (result.i18n?.hardcodedStrings.length) {
      result.suggestions.push("Replace hardcoded strings with translation functions for internationalization");
    }
  }
  
  /**
   * Validate component and template availability with detailed reporting
   */
  async validateAvailability(
    config: AppConfig,
    compilationContext: CompilationContext
  ): Promise<{
    componentAvailability: Map<string, boolean>;
    templateAvailability: Map<string, boolean>;
    missingComponents: string[];
    missingTemplates: string[];
    recommendations: string[];
  }> {
    if (this.verboseMode) {
      errorLogger.info("Validating component and template availability...");
    }
    
    const componentAvailability = new Map<string, boolean>();
    const templateAvailability = new Map<string, boolean>();
    const missingComponents: string[] = [];
    const missingTemplates: string[] = [];
    const recommendations: string[] = [];
    
    // Check component availability
    for (const component of config.components || []) {
      const isAvailable = await this.checkComponentAvailability(component.type);
      componentAvailability.set(component.type, isAvailable);
      
      if (!isAvailable) {
        missingComponents.push(component.type);
        recommendations.push(`Create or import component type '${component.type}'`);
      }
      
      if (this.debugMode) {
        errorLogger.debug(`Component '${component.type}': ${isAvailable ? 'available' : 'missing'}`);
      }
    }
    
    // Check template availability
    const requiredTemplates = [
      'main.ts',
      'deno.json',
      'routes/index.tsx',
      'islands/ErrorBoundary.tsx'
    ];
    
    for (const template of requiredTemplates) {
      const templatePath = `${compilationContext.templateDir}/${template}`;
      const isAvailable = await fileManager.fileExists(templatePath);
      templateAvailability.set(template, isAvailable);
      
      if (!isAvailable) {
        missingTemplates.push(template);
        recommendations.push(`Create template file '${template}' in template directory`);
      }
      
      if (this.debugMode) {
        errorLogger.debug(`Template '${template}': ${isAvailable ? 'available' : 'missing'}`);
      }
    }
    
    return {
      componentAvailability,
      templateAvailability,
      missingComponents,
      missingTemplates,
      recommendations,
    };
  }
  
  /**
   * Check if a component type is available
   */
  private async checkComponentAvailability(componentType: string): Promise<boolean> {
    // This would check the component registry or file system
    // For now, we'll use a simple check
    return (this as any).componentRegistry[componentType] !== undefined;
  }
  
  /**
   * Generate a comprehensive diagnostic report
   */
  generateReport(result: EnhancedDiagnosticResult): string {
    const lines: string[] = [];
    
    lines.push("=".repeat(60));
    lines.push("ENHANCED DIAGNOSTIC REPORT");
    lines.push("=".repeat(60));
    lines.push("");
    
    // Summary
    lines.push("SUMMARY");
    lines.push("-".repeat(20));
    lines.push(`Status: ${result.valid ? "VALID" : "INVALID"}`);
    lines.push(`Errors: ${result.errors.length}`);
    lines.push(`Warnings: ${result.warnings.length}`);
    lines.push(`Suggestions: ${result.suggestions.length}`);
    lines.push("");
    
    // Metrics
    if (result.metrics) {
      lines.push("METRICS");
      lines.push("-".repeat(20));
      lines.push(`Analysis Time: ${result.metrics.analysisTime}ms`);
      lines.push(`Complexity Score: ${result.metrics.complexityScore}/100`);
      lines.push(`Maintainability Index: ${result.metrics.maintainabilityIndex}/100`);
      
      if (result.metrics.memoryUsage) {
        lines.push(`Estimated Memory Usage: ${Math.round(result.metrics.memoryUsage / 1024)}KB`);
      }
      
      if (result.metrics.bundleSizeEstimate) {
        lines.push(`Estimated Bundle Size: ${Math.round(result.metrics.bundleSizeEstimate / 1024)}KB`);
      }
      
      lines.push("");
    }
    
    // Performance
    if (result.performance) {
      lines.push("PERFORMANCE");
      lines.push("-".repeat(20));
      lines.push(`Components: ${result.performance.componentCount}`);
      lines.push(`Routes: ${result.performance.routeCount}`);
      lines.push(`API Endpoints: ${result.performance.apiEndpointCount}`);
      lines.push(`Estimated Compilation Time: ${result.performance.estimatedCompilationTime}ms`);
      lines.push("");
    }
    
    // Dependencies
    if (result.dependencies) {
      lines.push("DEPENDENCIES");
      lines.push("-".repeat(20));
      lines.push(`Component Dependencies: ${result.dependencies.componentDependencies.size}`);
      lines.push(`Circular Dependencies: ${result.dependencies.circularDependencies.length}`);
      lines.push(`Unused Dependencies: ${result.dependencies.unusedDependencies.length}`);
      lines.push(`Missing Dependencies: ${result.dependencies.missingDependencies.length}`);
      
      if (result.dependencies.circularDependencies.length > 0) {
        lines.push("");
        lines.push("Circular Dependencies:");
        for (const cycle of result.dependencies.circularDependencies) {
          lines.push(`  ${cycle.join(" -> ")}`);
        }
      }
      
      lines.push("");
    }
    
    // Accessibility
    if (result.accessibility) {
      lines.push("ACCESSIBILITY");
      lines.push("-".repeat(20));
      lines.push(`Score: ${result.accessibility.score}/100`);
      lines.push(`Issues: ${result.accessibility.issues.length}`);
      
      if (result.accessibility.issues.length > 0) {
        lines.push("");
        lines.push("Issues:");
        for (const issue of result.accessibility.issues) {
          lines.push(`  - ${issue}`);
        }
      }
      
      lines.push("");
    }
    
    // SEO
    if (result.seo) {
      lines.push("SEO");
      lines.push("-".repeat(20));
      lines.push(`Score: ${result.seo.score}/100`);
      lines.push(`Issues: ${result.seo.issues.length}`);
      
      if (result.seo.issues.length > 0) {
        lines.push("");
        lines.push("Issues:");
        for (const issue of result.seo.issues) {
          lines.push(`  - ${issue}`);
        }
      }
      
      lines.push("");
    }
    
    // Errors
    if (result.errors.length > 0) {
      lines.push("ERRORS");
      lines.push("-".repeat(20));
      for (const error of result.errors) {
        lines.push(`[${error.type.toUpperCase()}] ${error.message}`);
        if (error.suggestions) {
          for (const suggestion of error.suggestions) {
            lines.push(`  Suggestion: ${suggestion}`);
          }
        }
      }
      lines.push("");
    }
    
    // Warnings
    if (result.warnings.length > 0) {
      lines.push("WARNINGS");
      lines.push("-".repeat(20));
      for (const warning of result.warnings) {
        lines.push(`- ${warning}`);
      }
      lines.push("");
    }
    
    // Suggestions
    if (result.suggestions.length > 0) {
      lines.push("SUGGESTIONS");
      lines.push("-".repeat(20));
      for (const suggestion of result.suggestions) {
        lines.push(`- ${suggestion}`);
      }
      lines.push("");
    }
    
    lines.push("=".repeat(60));
    
    return lines.join("\n");
  }
}

// Export a default instance
export const enhancedDiagnosticTool = new EnhancedDiagnosticTool({}, '');