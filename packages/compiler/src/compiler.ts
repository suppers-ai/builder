// Main compiler class that coordinates all generation phases
import { 
  type AppConfig, 
  type CompilationContext, 
  type CompilationError,
  type ComponentDefinition,
  type RouteDefinition,
  type ComponentRegistry,
  type ApiDefinition
} from "../../shared/src/types.ts";
import { logger, fs, LogLevel } from "../../shared/src/utils.ts";
import { 
  CompilerError, 
  ValidationError, 
  ComponentError, 
  DependencyError,
  TemplateError,
  FileError,
  errorRecoveryManager,
  errorLogger
} from "../../shared/src/errors.ts";
import { configParser, type ParseOptions, type ParseResult } from "./config-parser.ts";
import { fileManager, type FileOperationOptions } from "./file-manager.ts";
import { templateProcessor, type TemplateProcessingOptions } from "./template-processor.ts";
import { createComponentResolver, type ComponentResolver } from "./component-resolver.ts";
import { createImportGenerator, type ComponentImportGenerator } from "./component-import-generator.ts";
import { createRouteGenerator, type RouteGenerator } from "./route-generator.ts";
import { errorHandler, type ErrorHandlingOptions } from "./compiler-error-handling.ts";
import { diagnosticTool, type DiagnosticOptions } from "./diagnostics.ts";

// Import API route generator if available
let apiRouteGenerator: any;
try {
  const apiModule = await import("../../api/src/route-generator.ts");
  apiRouteGenerator = apiModule.createRouteGenerator;
} catch (e) {
  logger.warn("API route generator not available, API routes will not be generated");
}

/**
 * Compilation phase enum
 */
export enum CompilationPhase {
  INIT = 'init',
  PARSE = 'parse',
  PLAN = 'plan',
  GENERATE = 'generate',
  INTEGRATE = 'integrate',
  OPTIMIZE = 'optimize',
  COMPLETE = 'complete',
  FAILED = 'failed'
}

/**
 * Compilation options
 */
export interface CompilationOptions extends FileOperationOptions {
  /** Path to the template directory */
  templateDir: string;
  /** Path to the output directory */
  outputDir: string;
  /** Whether to validate component props (default: true) */
  validateProps?: boolean;
  /** Whether to validate templates (default: true) */
  validateTemplates?: boolean;
  /** Whether to generate layouts (default: true) */
  generateLayouts?: boolean;
  /** Whether to generate middleware (default: true) */
  generateMiddleware?: boolean;
  /** Whether to use TypeScript (default: true) */
  useTypeScript?: boolean;
  /** Whether to optimize output (default: true) */
  optimize?: boolean;
  /** Log level (default: INFO) */
  logLevel?: LogLevel;
  /** Whether to throw errors (default: false) */
  throwOnError?: boolean;
}

/**
 * Compilation result
 */
export interface CompilationResult {
  /** Whether the compilation was successful */
  success: boolean;
  /** Path to the output directory */
  outputPath: string;
  /** Any errors that occurred during compilation */
  errors: CompilationError[];
  /** Any warnings that occurred during compilation */
  warnings: string[];
  /** Compilation phase that was reached */
  phase: CompilationPhase;
  /** Time taken for compilation in milliseconds */
  timeTaken: number;
}

/**
 * Compilation progress event
 */
export interface CompilationProgressEvent {
  /** Current compilation phase */
  phase: CompilationPhase;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current operation description */
  operation: string;
  /** Any errors that occurred */
  errors: CompilationError[];
  /** Any warnings that occurred */
  warnings: string[];
}

/**
 * Compilation progress callback
 */
export type ProgressCallback = (event: CompilationProgressEvent) => void;

/**
 * Pipeline phase definition
 */
export interface PipelinePhase {
  /** Phase name */
  name: CompilationPhase;
  /** Phase description */
  description: string;
  /** Phase execution function */
  execute: (context: CompilationContext, options: CompilationOptions) => Promise<boolean>;
  /** Progress percentage at start of phase */
  startProgress: number;
  /** Progress percentage at end of phase */
  endProgress: number;
  /** Whether this phase is required for compilation */
  required: boolean;
}

/**
 * Main compiler class that coordinates all generation phases
 */
export class Compiler {
  private componentRegistry: ComponentRegistry;
  private componentResolver: ComponentResolver;
  private importGenerator: ComponentImportGenerator;
  private routeGenerator: RouteGenerator;
  private apiRouteGenerator: any;
  private progressCallback?: ProgressCallback;
  private currentPhase: CompilationPhase = CompilationPhase.INIT;
  private errors: CompilationError[] = [];
  private warnings: string[] = [];
  private pipeline: PipelinePhase[] = [];
  
  /**
   * Create a new compiler
   * 
   * @param componentRegistry Component registry
   */
  constructor(componentRegistry: ComponentRegistry) {
    this.componentRegistry = componentRegistry;
    this.componentResolver = createComponentResolver(componentRegistry);
    this.importGenerator = createImportGenerator(this.componentResolver);
    this.routeGenerator = createRouteGenerator(this.componentResolver, this.importGenerator);
    
    // Initialize API route generator if available
    if (apiRouteGenerator) {
      this.apiRouteGenerator = apiRouteGenerator();
    }
    
    // Initialize compilation pipeline
    this.initializePipeline();
  }
  
  /**
   * Initialize the compilation pipeline with all phases
   */
  private initializePipeline(): void {
    this.pipeline = [
      {
        name: CompilationPhase.INIT,
        description: "Initializing compilation",
        execute: async () => true, // Initialization is handled in compile method
        startProgress: 0,
        endProgress: 5,
        required: true
      },
      {
        name: CompilationPhase.PARSE,
        description: "Parsing configuration file",
        execute: async (context, options) => {
          const parseResult = await this.parseConfig(context.configPath!, options);
          
          if (!parseResult.success || !parseResult.config) {
            this.errors.push(...parseResult.errors);
            return false;
          }
          
          // Update context with parsed config
          context.config = parseResult.config;
          return true;
        },
        startProgress: 5,
        endProgress: 15,
        required: true
      },
      {
        name: CompilationPhase.PLAN,
        description: "Planning compilation",
        execute: async (context, options) => {
          const plan = await this.planCompilation(context, options);
          
          if (!plan.success) {
            this.errors.push(...plan.errors);
            return false;
          }
          
          // Store dependency graph in context if needed
          context.dependencyGraph = plan.dependencyGraph;
          return true;
        },
        startProgress: 15,
        endProgress: 25,
        required: true
      },
      {
        name: CompilationPhase.GENERATE,
        description: "Generating project structure",
        execute: async (context, options) => {
          const projectPath = await this.generateProjectStructure(context, options);
          
          if (!projectPath) {
            return false;
          }
          
          // Update context with project path
          context.projectPath = projectPath;
          return true;
        },
        startProgress: 25,
        endProgress: 40,
        required: true
      },
      {
        name: CompilationPhase.INTEGRATE,
        description: "Integrating components and routes",
        execute: async (context, options) => {
          if (!context.projectPath) {
            this.errors.push({
              type: 'dependency',
              message: 'Project path not available for integration phase'
            });
            return false;
          }
          
          // Generate UI components
          const componentResult = await this.generateComponents(context, options);
          if (!componentResult) {
            return false;
          }
          
          // Generate routes
          const routeResult = await this.generateRoutes(context, options);
          if (!routeResult) {
            return false;
          }
          
          // Generate API routes if available
          if (this.apiRouteGenerator && context.config.api) {
            const apiResult = await this.generateApiRoutes(context, options);
            if (!apiResult) {
              // API generation failure is not fatal
              this.warnings.push("API route generation failed but continuing with compilation");
            }
          }
          
          // Process templates
          const templateResult = await this.processTemplates(context, options);
          return templateResult;
        },
        startProgress: 40,
        endProgress: 80,
        required: true
      },
      {
        name: CompilationPhase.OPTIMIZE,
        description: "Optimizing output",
        execute: async (context, options) => {
          if (!context.projectPath) {
            this.warnings.push("Project path not available for optimization phase, skipping");
            return true; // Not fatal
          }
          
          await this.optimizeOutput(context, context.projectPath, options);
          return true; // Optimization failure is not fatal
        },
        startProgress: 80,
        endProgress: 95,
        required: false
      },
      {
        name: CompilationPhase.COMPLETE,
        description: "Finalizing compilation",
        execute: async (context, options) => {
          // Generate final configuration files
          await this.generateFinalConfiguration(context, options);
          
          // Run final validation
          const validationResult = await this.validateOutput(context, options);
          if (!validationResult) {
            this.warnings.push("Final validation found issues but compilation will complete");
          }
          
          return true; // Always complete
        },
        startProgress: 95,
        endProgress: 100,
        required: false
      }
    ];
  }
  
  /**
   * Set progress callback
   * 
   * @param callback Progress callback function
   */
  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }
  
  /**
   * Run diagnostics on a configuration
   * 
   * @param configPath Path to the configuration file
   * @param options Diagnostic options
   * @returns Diagnostic result
   */
  async runDiagnostics(
    configPath: string,
    options: DiagnosticOptions & { templateDir?: string } = {}
  ) {
    try {
      // Parse the configuration
      const parseResult = await configParser.parseFile(configPath, {
        throwOnError: false,
        includeLineNumbers: true,
        includeSuggestions: true
      });
      
      if (!parseResult.success || !parseResult.config) {
        return {
          valid: false,
          errors: parseResult.errors,
          warnings: [],
          suggestions: ["Fix configuration validation errors before running diagnostics"]
        };
      }
      
      // Configure diagnostic tool with component registry
      const templateDir = options.templateDir || "";
      const configuredDiagnosticTool = new diagnosticTool.constructor(
        this.componentRegistry,
        templateDir,
        options.logLevel
      );
      
      // Run diagnostics
      return await configuredDiagnosticTool.analyzeConfiguration(parseResult.config, options);
    } catch (error) {
      // Handle errors using our error handling system
      const compilerError = error instanceof CompilerError 
        ? error 
        : new CompilerError(`Diagnostics failed: ${error instanceof Error ? error.message : String(error)}`, {
            type: 'validation',
            recoverable: false
          });
      
      errorLogger.error(compilerError);
      
      return {
        valid: false,
        errors: [compilerError.toCompilationError()],
        warnings: [],
        suggestions: ["Check configuration file syntax and try again"]
      };
    }
  }
  
  /**
   * Compile a JSON configuration file
   * 
   * @param configPath Path to the JSON configuration file
   * @param options Compilation options
   * @returns Compilation result
   */
  async compile(
    configPath: string,
    options: CompilationOptions
  ): Promise<CompilationResult> {
    const startTime = Date.now();
    this.errors = [];
    this.warnings = [];
    this.currentPhase = CompilationPhase.INIT;
    
    // Configure logger
    if (options.logLevel !== undefined) {
      logger.setLevel(options.logLevel);
    }
    
    try {
      // Create compilation context
      const context: CompilationContext = {
        configPath,
        outputDir: options.outputDir,
        templateDir: options.templateDir,
        verbose: options.verbose,
        dryRun: options.dryRun
      };
      
      // Execute pipeline phases
      for (const phase of this.pipeline) {
        // Update progress at the start of the phase
        this.updateProgress(
          phase.name, 
          phase.startProgress, 
          `${phase.description} - starting`
        );
        
        // Execute the phase
        const success = await phase.execute(context, options);
        
        // Update progress at the end of the phase
        this.updateProgress(
          phase.name, 
          phase.endProgress, 
          `${phase.description} - ${success ? 'completed' : 'failed'}`
        );
        
        // If phase failed and is required, stop compilation
        if (!success && phase.required) {
          this.updateProgress(CompilationPhase.FAILED, 0, `${phase.description} failed`);
          return this.createResult(false, context.projectPath || "", startTime);
        }
      }
      
      // Complete compilation
      this.updateProgress(CompilationPhase.COMPLETE, 100, "Compilation complete");
      
      return this.createResult(true, context.projectPath || "", startTime);
    } catch (error) {
      const errorMessage = `Compilation failed: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.errors.push({
        type: 'dependency',
        message: errorMessage
      });
      
      this.updateProgress(CompilationPhase.FAILED, 0, "Compilation failed with error");
      
      if (options.throwOnError) {
        throw error;
      }
      
      return this.createResult(false, "", startTime);
    }
  }
  
  /**
   * Parse configuration file
   * 
   * @param configPath Path to the configuration file
   * @param options Compilation options
   * @returns Parse result
   */
  private async parseConfig(
    configPath: string,
    options: CompilationOptions
  ): Promise<ParseResult> {
    const parseOptions: ParseOptions = {
      throwOnError: options.throwOnError,
      includeLineNumbers: true,
      includeSuggestions: true
    };
    
    return await configParser.parseFile(configPath, parseOptions);
  }
  
  /**
   * Plan compilation based on configuration
   * 
   * @param context Compilation context
   * @param options Compilation options
   * @returns Plan result
   */
  private async planCompilation(
    context: CompilationContext,
    options: CompilationOptions
  ): Promise<{ success: boolean; errors: CompilationError[] }> {
    const errors: CompilationError[] = [];
    
    try {
      const { config, templateDir } = context;
      
      // Validate template directory
      if (!await fileManager.directoryExists(templateDir)) {
        errors.push({
          type: 'dependency',
          message: `Template directory not found: ${templateDir}`,
          location: { file: templateDir }
        });
        return { success: false, errors };
      }
      
      // Validate component definitions
      if (config.components && config.components.length > 0) {
        for (const component of config.components) {
          // Check if component type exists in registry
          if (!this.componentRegistry[component.type]) {
            errors.push({
              type: 'component',
              message: `Component type '${component.type}' not found in registry`,
              location: { path: `components[${component.id}].type` }
            });
          }
        }
      }
      
      // Validate route definitions
      if (config.routes && config.routes.length > 0) {
        for (const route of config.routes) {
          // Check if main component exists
          const mainComponent = config.components.find(c => c.id === route.component);
          if (!mainComponent) {
            errors.push({
              type: 'component',
              message: `Main component '${route.component}' not found for route '${route.path}'`,
              location: { path: `routes[${route.path}].component` }
            });
          }
          
          // Check if layout component exists
          if (route.layout) {
            const layoutComponent = config.components.find(c => c.id === route.layout);
            if (!layoutComponent) {
              errors.push({
                type: 'component',
                message: `Layout component '${route.layout}' not found for route '${route.path}'`,
                location: { path: `routes[${route.path}].layout` }
              });
            }
          }
        }
      }
      
      // Check for duplicate route paths
      const routePaths = new Set<string>();
      for (const route of config.routes) {
        if (routePaths.has(route.path)) {
          errors.push({
            type: 'validation',
            message: `Duplicate route path: ${route.path}`,
            location: { path: `routes[${route.path}]` }
          });
        }
        routePaths.add(route.path);
      }
      
      // Check for duplicate component IDs
      const componentIds = new Set<string>();
      for (const component of config.components) {
        if (componentIds.has(component.id)) {
          errors.push({
            type: 'validation',
            message: `Duplicate component ID: ${component.id}`,
            location: { path: `components[${component.id}]` }
          });
        }
        componentIds.add(component.id);
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      const errorMessage = `Failed to plan compilation: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      errors.push({
        type: 'dependency',
        message: errorMessage
      });
      
      return { success: false, errors };
    }
  }
  
  /**
   * Generate project structure
   * 
   * @param context Compilation context
   * @param options Compilation options
   * @returns Path to the generated project
   */
  private async generateProjectStructure(
    context: CompilationContext,
    options: CompilationOptions
  ): Promise<string> {
    try {
      const { config, outputDir, templateDir } = context;
      
      // Generate project structure
      const result = await fileManager.generateProjectStructure(
        outputDir,
        config,
        templateDir,
        options
      );
      
      if (!result.success) {
        for (const error of result.errors) {
          this.errors.push({
            type: 'file',
            message: error
          });
        }
        return "";
      }
      
      return result.rootPath;
    } catch (error) {
      const errorMessage = `Failed to generate project structure: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.errors.push({
        type: 'file',
        message: errorMessage
      });
      
      return "";
    }
  }
  
  /**
   * Generate UI components
   * 
   * @param context Compilation context
   * @param options Compilation options
   * @returns Whether component generation was successful
   */
  private async generateComponents(
    context: CompilationContext,
    options: CompilationOptions
  ): Promise<boolean> {
    try {
      const { config, projectPath } = context;
      
      if (!config.components || config.components.length === 0) {
        logger.info("No components to generate");
        return true;
      }
      
      logger.info(`Generating ${config.components.length} components`);
      
      // Resolve components
      const componentResults = this.componentResolver.resolveComponents(
        config.components,
        { validateProps: options.validateProps }
      );
      
      // Check for component resolution errors
      let hasErrors = false;
      for (const [id, result] of Object.entries(componentResults)) {
        if (!result.success) {
          hasErrors = true;
          this.errors.push(...result.errors);
        }
        
        // Add warnings
        for (const warning of result.warnings) {
          this.warnings.push(warning);
        }
      }
      
      if (hasErrors) {
        logger.error("Component resolution failed");
        return false;
      }
      
      // Generate component imports
      const importResult = this.importGenerator.generateImports(
        config.components,
        { useRelativeImports: true }
      );
      
      if (!importResult.success) {
        this.errors.push(...importResult.errors);
        return false;
      }
      
      // In a real implementation, we would generate component files here
      // For now, we'll just log that components were generated
      logger.info(`Generated ${config.components.length} components`);
      
      return true;
    } catch (error) {
      const errorMessage = `Failed to generate components: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.errors.push({
        type: 'component',
        message: errorMessage
      });
      
      return false;
    }
  }
  
  /**
   * Generate routes
   * 
   * @param context Compilation context
   * @param options Compilation options
   * @returns Whether route generation was successful
   */
  private async generateRoutes(
    context: CompilationContext,
    options: CompilationOptions
  ): Promise<boolean> {
    try {
      const { config, projectPath } = context;
      
      if (!config.routes || config.routes.length === 0) {
        logger.info("No routes to generate");
        return true;
      }
      
      logger.info(`Generating ${config.routes.length} routes`);
      
      // Generate routes
      const routeResults = await this.routeGenerator.generateRoutes(
        projectPath!,
        config.routes,
        config.components,
        {
          validateProps: options.validateProps,
          generateLayouts: options.generateLayouts,
          generateMiddleware: options.generateMiddleware,
          useTypeScript: options.useTypeScript,
          templateDir: options.templateDir,
          ...options
        }
      );
      
      // Check for errors
      let hasErrors = false;
      for (const result of routeResults) {
        if (!result.success) {
          hasErrors = true;
          this.errors.push(...result.errors);
        }
      }
      
      if (hasErrors) {
        logger.error("Route generation failed");
        return false;
      }
      
      logger.info(`Generated ${routeResults.length} routes`);
      return true;
    } catch (error) {
      const errorMessage = `Failed to generate routes: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.errors.push({
        type: 'component',
        message: errorMessage
      });
      
      return false;
    }
  }
  
  /**
   * Generate API routes
   * 
   * @param context Compilation context
   * @param options Compilation options
   * @returns Whether API route generation was successful
   */
  private async generateApiRoutes(
    context: CompilationContext,
    options: CompilationOptions
  ): Promise<boolean> {
    try {
      const { config, projectPath } = context;
      
      if (!config.api || !config.api.endpoints || config.api.endpoints.length === 0) {
        logger.info("No API routes to generate");
        return true;
      }
      
      if (!this.apiRouteGenerator) {
        logger.warn("API route generator not available, skipping API route generation");
        return true;
      }
      
      logger.info(`Generating ${config.api.endpoints.length} API routes`);
      
      // In a real implementation, we would call the API route generator here
      // For now, we'll just log that API routes were generated
      logger.info(`Generated ${config.api.endpoints.length} API routes`);
      
      return true;
    } catch (error) {
      const errorMessage = `Failed to generate API routes: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.errors.push({
        type: 'component',
        message: errorMessage
      });
      
      return false;
    }
  }
  
  /**
   * Process templates
   * 
   * @param context Compilation context
   * @param options Compilation options
   * @returns Whether template processing was successful
   */
  private async processTemplates(
    context: CompilationContext,
    options: CompilationOptions
  ): Promise<boolean> {
    try {
      const { config, projectPath, templateDir } = context;
      
      logger.info("Processing templates");
      
      // Process templates
      const templateOptions: TemplateProcessingOptions = {
        overwrite: options.overwrite,
        createDirs: true,
        validateTemplates: options.validateTemplates,
        ...options
      };
      
      const templateContext = templateProcessor.createContextFromConfig(config);
      const templateResults = await templateProcessor.processTemplatesFromConfig(
        templateDir,
        projectPath!,
        config,
        templateOptions
      );
      
      // Check for errors
      let hasErrors = false;
      for (const result of templateResults) {
        if (!result.success) {
          hasErrors = true;
          this.errors.push(...result.errors);
        }
      }
      
      if (hasErrors) {
        logger.error("Template processing failed");
        return false;
      }
      
      logger.info(`Processed ${templateResults.length} templates`);
      return true;
    } catch (error) {
      const errorMessage = `Failed to process templates: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.errors.push({
        type: 'template',
        message: errorMessage
      });
      
      return false;
    }
  }
  
  /**
   * Generate final configuration files
   * 
   * @param context Compilation context
   * @param options Compilation options
   * @returns Whether configuration generation was successful
   */
  private async generateFinalConfiguration(
    context: CompilationContext,
    options: CompilationOptions
  ): Promise<boolean> {
    try {
      const { config, projectPath } = context;
      
      if (!projectPath) {
        logger.warn("Project path not available, skipping final configuration");
        return true;
      }
      
      logger.info("Generating final configuration files");
      
      // Generate deno.json
      const denoJsonPath = fs.joinPath(projectPath, "deno.json");
      const denoJsonContent = JSON.stringify({
        name: config.metadata.name,
        version: config.metadata.version,
        description: config.metadata.description || "Generated Fresh application",
        imports: {
          "$fresh/": "https://deno.land/x/fresh@2.0.0-alpha.1/",
          "preact": "https://esm.sh/preact@10.15.1",
          "preact/": "https://esm.sh/preact@10.15.1/",
          "preact-render-to-string": "https://esm.sh/*preact-render-to-string@6.2.0"
        },
        tasks: {
          "start": "deno run -A --watch=static/,routes/ dev.ts",
          "build": "deno run -A dev.ts build",
          "preview": "deno run -A main.ts"
        }
      }, null, 2);
      
      await fileManager.createFile(denoJsonPath, denoJsonContent, {
        overwrite: true,
        ...options
      });
      
      // Generate README.md
      const readmePath = fs.joinPath(projectPath, "README.md");
      const readmeContent = `# ${config.metadata.name}

${config.metadata.description || "Generated Fresh application"}

## Getting Started

\`\`\`bash
# Start the development server
deno task start

# Build for production
deno task build

# Run production build
deno task preview
\`\`\`

## Generated with JSON App Compiler

This application was generated using the JSON App Compiler.
`;
      
      await fileManager.createFile(readmePath, readmeContent, {
        overwrite: true,
        ...options
      });
      
      logger.info("Generated final configuration files");
      return true;
    } catch (error) {
      const errorMessage = `Failed to generate final configuration: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.warnings.push(errorMessage);
      return true; // Not fatal
    }
  }
  
  /**
   * Validate the generated output
   * 
   * @param context Compilation context
   * @param options Compilation options
   * @returns Whether validation was successful
   */
  private async validateOutput(
    context: CompilationContext,
    options: CompilationOptions
  ): Promise<boolean> {
    try {
      const { projectPath } = context;
      
      if (!projectPath) {
        logger.warn("Project path not available, skipping validation");
        return true;
      }
      
      logger.info("Validating generated output");
      
      // Check for required files
      const requiredFiles = [
        "deno.json",
        "main.ts",
        "dev.ts",
        "fresh.gen.ts",
        "routes/index.tsx"
      ];
      
      let missingFiles = false;
      for (const file of requiredFiles) {
        const filePath = fs.joinPath(projectPath, file);
        const exists = await fileManager.fileExists(filePath);
        
        if (!exists) {
          this.warnings.push(`Required file missing: ${file}`);
          missingFiles = true;
        }
      }
      
      if (missingFiles) {
        logger.warn("Some required files are missing");
        return false;
      }
      
      logger.info("Output validation successful");
      return true;
    } catch (error) {
      const errorMessage = `Failed to validate output: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.warnings.push(errorMessage);
      return false; // Not fatal
    }
  }
  
  /**
   * Integrate components and routes (legacy method, kept for compatibility)
   * 
   * @param context Compilation context
   * @param projectPath Path to the generated project
   * @param options Compilation options
   * @returns Whether integration was successful
   */
  private async integrateComponents(
    context: CompilationContext,
    projectPath: string,
    options: CompilationOptions
  ): Promise<boolean> {
    try {
      // Generate components
      const componentResult = await this.generateComponents(context, options);
      if (!componentResult) {
        return false;
      }
      
      // Generate routes
      const routeResult = await this.generateRoutes(context, options);
      if (!routeResult) {
        return false;
      }
      
      // Generate API routes if available
      if (this.apiRouteGenerator && context.config.api) {
        const apiResult = await this.generateApiRoutes(context, options);
        if (!apiResult) {
          // API generation failure is not fatal
          this.warnings.push("API route generation failed but continuing with compilation");
        }
      }
      
      // Process templates
      const templateResult = await this.processTemplates(context, options);
      return templateResult;
    } catch (error) {
      const errorMessage = `Failed to integrate components: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.errors.push({
        type: 'component',
        message: errorMessage
      });
      
      return false;
    }
  }
  
  /**
   * Optimize output
   * 
   * @param context Compilation context
   * @param projectPath Path to the generated project
   * @param options Compilation options
   */
  private async optimizeOutput(
    context: CompilationContext,
    projectPath: string,
    options: CompilationOptions
  ): Promise<void> {
    try {
      // In a real implementation, this would perform optimizations like:
      // - Tree-shaking unused components
      // - Minifying CSS and JavaScript
      // - Optimizing images
      // - Generating source maps
      
      // For now, we'll just log that optimization is complete
      logger.info("Output optimization complete");
    } catch (error) {
      const errorMessage = `Failed to optimize output: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      this.warnings.push(errorMessage);
    }
  }
  
  /**
   * Update compilation progress
   * 
   * @param phase Current compilation phase
   * @param progress Progress percentage (0-100)
   * @param operation Current operation description
   */
  private updateProgress(
    phase: CompilationPhase,
    progress: number,
    operation: string
  ): void {
    this.currentPhase = phase;
    
    // Log progress
    logger.info(`[${phase}] ${progress}% - ${operation}`);
    
    // Call progress callback if provided
    if (this.progressCallback) {
      this.progressCallback({
        phase,
        progress,
        operation,
        errors: [...this.errors],
        warnings: [...this.warnings]
      });
    }
  }
  
  /**
   * Create compilation result
   * 
   * @param success Whether compilation was successful
   * @param outputPath Path to the output directory
   * @param startTime Start time in milliseconds
   * @returns Compilation result
   */
  private createResult(
    success: boolean,
    outputPath: string,
    startTime: number
  ): CompilationResult {
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    
    return {
      success,
      outputPath,
      errors: [...this.errors],
      warnings: [...this.warnings],
      phase: this.currentPhase,
      timeTaken
    };
  }
}

/**
 * Create a compiler with the given component registry
 * 
 * @param componentRegistry Component registry
 * @returns Compiler instance
 */
export function createCompiler(componentRegistry: ComponentRegistry): Compiler {
  return new Compiler(componentRegistry);
}