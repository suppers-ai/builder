// Template processing engine with placeholder replacement
import { 
  processTemplate, 
  validateTemplate, 
  extractVariables,
  shouldProcessFile,
  type TemplateContext,
  type TemplateOptions,
  type FileProcessingOptions
} from "../../templates/src/template-engine.ts";
import { fileManager, type FileOperationOptions } from "./file-manager.ts";
import { fs, logger, type CompilationError } from "../../shared/src/utils.ts";
import type { AppConfig } from "../../shared/src/types.ts";
import { performanceCache } from "./performance-cache.ts";

/**
 * Options for template processing
 */
export interface TemplateProcessingOptions extends FileOperationOptions, TemplateOptions {
  /** File extensions to process (default: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css']) */
  extensions?: string[];
  /** Whether to process binary files (default: false) */
  processBinary?: boolean;
  /** Whether to validate templates before processing (default: true) */
  validateTemplates?: boolean;
  /** Whether to skip files that match certain patterns */
  skipPatterns?: RegExp[];
  /** Whether to include files that match certain patterns (overrides skipPatterns) */
  includePatterns?: RegExp[];
}

/**
 * Template processing result
 */
export interface TemplateProcessingResult {
  /** Whether the processing was successful */
  success: boolean;
  /** Path to the processed file */
  sourcePath: string;
  /** Path to the output file */
  outputPath: string;
  /** Any errors that occurred during processing */
  errors: CompilationError[];
}

/**
 * Configuration for template processing based on file patterns
 */
export interface TemplateFileConfig {
  /** Pattern to match files */
  pattern: RegExp;
  /** Template context overrides for matched files */
  contextOverrides?: Record<string, unknown>;
  /** Whether to process the file as a template */
  process: boolean;
  /** Custom template options for matched files */
  options?: TemplateOptions;
}

/**
 * Template processor for generating files from templates
 */
export class TemplateProcessor {
  /**
   * Process a template file and write the result to the output path
   * 
   * @param templatePath Path to the template file
   * @param outputPath Path to write the processed file
   * @param context Template context with variables for replacement
   * @param options Template processing options
   * @returns Result of the processing
   */
  async processFile(
    templatePath: string,
    outputPath: string,
    context: TemplateContext,
    options: TemplateProcessingOptions = {}
  ): Promise<TemplateProcessingResult> {
    const {
      validateTemplates = true,
      skipPatterns = [],
      includePatterns = [],
      ...fileOptions
    } = options;
    
    const normalizedTemplatePath = fs.normalizePath(templatePath);
    const normalizedOutputPath = fs.normalizePath(outputPath);
    const errors: CompilationError[] = [];
    
    try {
      // Check if file should be skipped
      if (this.shouldSkipFile(normalizedTemplatePath, skipPatterns, includePatterns)) {
        return {
          success: true,
          sourcePath: normalizedTemplatePath,
          outputPath: normalizedOutputPath,
          errors: []
        };
      }
      
      // Check if template file exists
      if (!await fileManager.fileExists(normalizedTemplatePath)) {
        const error: CompilationError = {
          type: 'template',
          message: `Template file not found: ${normalizedTemplatePath}`,
          location: { file: normalizedTemplatePath }
        };
        errors.push(error);
        
        return {
          success: false,
          sourcePath: normalizedTemplatePath,
          outputPath: normalizedOutputPath,
          errors
        };
      }
      
      // Read template file
      const templateContent = await Deno.readTextFile(normalizedTemplatePath);
      
      // Validate template if requested
      if (validateTemplates) {
        const validationErrors = validateTemplate(templateContent);
        if (validationErrors.length > 0) {
          for (const errorMessage of validationErrors) {
            const error: CompilationError = {
              type: 'template',
              message: `Template validation error: ${errorMessage}`,
              location: { file: normalizedTemplatePath }
            };
            errors.push(error);
          }
          
          return {
            success: false,
            sourcePath: normalizedTemplatePath,
            outputPath: normalizedOutputPath,
            errors
          };
        }
      }
      
      // Check if file should be processed or copied as-is
      if (!shouldProcessFile(normalizedTemplatePath, fileOptions)) {
        // Copy file without processing
        const copyResult = await fileManager.copyFile(
          normalizedTemplatePath,
          normalizedOutputPath,
          fileOptions
        );
        
        return {
          success: copyResult.success,
          sourcePath: normalizedTemplatePath,
          outputPath: normalizedOutputPath,
          errors: copyResult.success ? [] : [{
            type: 'file',
            message: copyResult.error || 'Unknown error copying file',
            location: { file: normalizedOutputPath }
          }]
        };
      }
      
      // Check cache for processed template
      const cachedContent = await performanceCache.getCachedTemplate(normalizedTemplatePath, context);
      let processedContent: string;
      
      if (cachedContent) {
        logger.debug(`Using cached template: ${normalizedTemplatePath}`);
        processedContent = cachedContent;
      } else {
        // Process template
        processedContent = processTemplate(templateContent, context, options);
        
        // Cache the processed content
        await performanceCache.cacheTemplate(normalizedTemplatePath, context, processedContent);
      }
      
      // Write processed file
      const writeResult = await fileManager.createFile(
        normalizedOutputPath,
        processedContent,
        fileOptions
      );
      
      if (!writeResult.success) {
        const error: CompilationError = {
          type: 'file',
          message: writeResult.error || 'Unknown error writing file',
          location: { file: normalizedOutputPath }
        };
        errors.push(error);
      }
      
      return {
        success: writeResult.success,
        sourcePath: normalizedTemplatePath,
        outputPath: normalizedOutputPath,
        errors
      };
    } catch (error) {
      const errorMessage = `Failed to process template ${normalizedTemplatePath}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      errors.push({
        type: 'template',
        message: errorMessage,
        location: { file: normalizedTemplatePath }
      });
      
      return {
        success: false,
        sourcePath: normalizedTemplatePath,
        outputPath: normalizedOutputPath,
        errors
      };
    }
  }
  
  /**
   * Process a directory of templates recursively
   * 
   * @param templateDir Path to the template directory
   * @param outputDir Path to the output directory
   * @param context Template context with variables for replacement
   * @param options Template processing options
   * @returns Results of the processing
   */
  async processDirectory(
    templateDir: string,
    outputDir: string,
    context: TemplateContext,
    options: TemplateProcessingOptions = {}
  ): Promise<TemplateProcessingResult[]> {
    const normalizedTemplateDir = fs.normalizePath(templateDir);
    const normalizedOutputDir = fs.normalizePath(outputDir);
    const results: TemplateProcessingResult[] = [];
    
    try {
      // Check if template directory exists
      if (!await fileManager.directoryExists(normalizedTemplateDir)) {
        results.push({
          success: false,
          sourcePath: normalizedTemplateDir,
          outputPath: normalizedOutputDir,
          errors: [{
            type: 'template',
            message: `Template directory not found: ${normalizedTemplateDir}`,
            location: { file: normalizedTemplateDir }
          }]
        });
        return results;
      }
      
      // Create output directory
      await fileManager.createDirectory(normalizedOutputDir, options);
      
      // Read template directory
      const entries = [];
      for await (const entry of Deno.readDir(normalizedTemplateDir)) {
        entries.push(entry);
      }
      
      // Process all entries
      for (const entry of entries) {
        const templatePath = fs.joinPath(normalizedTemplateDir, entry.name);
        const outputPath = fs.joinPath(normalizedOutputDir, entry.name);
        
        if (entry.isDirectory) {
          const dirResults = await this.processDirectory(templatePath, outputPath, context, options);
          results.push(...dirResults);
        } else {
          const fileResult = await this.processFile(templatePath, outputPath, context, options);
          results.push(fileResult);
        }
      }
      
      return results;
    } catch (error) {
      const errorMessage = `Failed to process template directory ${normalizedTemplateDir}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      results.push({
        success: false,
        sourcePath: normalizedTemplateDir,
        outputPath: normalizedOutputDir,
        errors: [{
          type: 'template',
          message: errorMessage,
          location: { file: normalizedTemplateDir }
        }]
      });
      
      return results;
    }
  }
  
  /**
   * Create a template context from an app configuration
   * 
   * @param config App configuration
   * @returns Template context
   */
  createContextFromConfig(config: AppConfig): TemplateContext {
    return {
      app: {
        name: config.metadata.name,
        version: config.metadata.version,
        description: config.metadata.description || '',
        author: config.metadata.author || '',
        license: config.metadata.license || ''
      },
      metadata: config.metadata,
      theme: config.theme || {},
      build: config.build || {}
    };
  }
  
  /**
   * Extract all variables used in a template file
   * 
   * @param templatePath Path to the template file
   * @returns Array of variable names
   */
  async extractTemplateVariables(templatePath: string): Promise<string[]> {
    const normalizedPath = fs.normalizePath(templatePath);
    
    try {
      const content = await Deno.readTextFile(normalizedPath);
      return extractVariables(content);
    } catch (error) {
      logger.error(`Failed to extract variables from ${normalizedPath}: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
  
  /**
   * Check if a file should be skipped based on patterns
   * 
   * @param filePath Path to the file
   * @param skipPatterns Patterns to skip
   * @param includePatterns Patterns to include (overrides skip patterns)
   * @returns Whether the file should be skipped
   */
  private shouldSkipFile(
    filePath: string,
    skipPatterns: RegExp[],
    includePatterns: RegExp[]
  ): boolean {
    // Check include patterns first (they override skip patterns)
    if (includePatterns.length > 0) {
      return !includePatterns.some(pattern => pattern.test(filePath));
    }
    
    // Then check skip patterns
    return skipPatterns.some(pattern => pattern.test(filePath));
  }
  
  /**
   * Process templates with file-specific configurations
   * 
   * @param templateDir Path to the template directory
   * @param outputDir Path to the output directory
   * @param context Base template context with variables for replacement
   * @param fileConfigs Array of file-specific template configurations
   * @param options Global template processing options
   * @returns Results of the processing
   */
  async processDirectoryWithFileConfigs(
    templateDir: string,
    outputDir: string,
    context: TemplateContext,
    fileConfigs: TemplateFileConfig[],
    options: TemplateProcessingOptions = {}
  ): Promise<TemplateProcessingResult[]> {
    const normalizedTemplateDir = fs.normalizePath(templateDir);
    const normalizedOutputDir = fs.normalizePath(outputDir);
    const results: TemplateProcessingResult[] = [];
    
    try {
      // Check if template directory exists
      if (!await fileManager.directoryExists(normalizedTemplateDir)) {
        results.push({
          success: false,
          sourcePath: normalizedTemplateDir,
          outputPath: normalizedOutputDir,
          errors: [{
            type: 'template',
            message: `Template directory not found: ${normalizedTemplateDir}`,
            location: { file: normalizedTemplateDir }
          }]
        });
        return results;
      }
      
      // Create output directory
      await fileManager.createDirectory(normalizedOutputDir, options);
      
      // Read template directory
      const entries = [];
      for await (const entry of Deno.readDir(normalizedTemplateDir)) {
        entries.push(entry);
      }
      
      // Process all entries
      for (const entry of entries) {
        const templatePath = fs.joinPath(normalizedTemplateDir, entry.name);
        const outputPath = fs.joinPath(normalizedOutputDir, entry.name);
        
        if (entry.isDirectory) {
          const dirResults = await this.processDirectoryWithFileConfigs(
            templatePath, 
            outputPath, 
            context, 
            fileConfigs, 
            options
          );
          results.push(...dirResults);
        } else {
          // Find matching file config
          const matchingConfig = fileConfigs.find(config => config.pattern.test(templatePath));
          
          if (matchingConfig) {
            // Apply file-specific configuration
            const fileContext = matchingConfig.contextOverrides 
              ? { ...context, ...matchingConfig.contextOverrides }
              : context;
            
            const fileOptions = matchingConfig.options
              ? { ...options, ...matchingConfig.options }
              : options;
            
            if (matchingConfig.process) {
              // Process as template
              const fileResult = await this.processFile(templatePath, outputPath, fileContext, fileOptions);
              results.push(fileResult);
            } else {
              // Copy without processing
              const copyResult = await fileManager.copyFile(templatePath, outputPath, options);
              
              results.push({
                success: copyResult.success,
                sourcePath: templatePath,
                outputPath,
                errors: copyResult.success ? [] : [{
                  type: 'file',
                  message: copyResult.error || 'Unknown error copying file',
                  location: { file: outputPath }
                }]
              });
            }
          } else {
            // Use default processing
            const fileResult = await this.processFile(templatePath, outputPath, context, options);
            results.push(fileResult);
          }
        }
      }
      
      return results;
    } catch (error) {
      const errorMessage = `Failed to process template directory ${normalizedTemplateDir}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      results.push({
        success: false,
        sourcePath: normalizedTemplateDir,
        outputPath: normalizedOutputDir,
        errors: [{
          type: 'template',
          message: errorMessage,
          location: { file: normalizedTemplateDir }
        }]
      });
      
      return results;
    }
  }
  
  /**
   * Process templates based on app configuration
   * 
   * @param templateDir Path to the template directory
   * @param outputDir Path to the output directory
   * @param config App configuration
   * @param options Template processing options
   * @returns Results of the processing
   */
  async processTemplatesFromConfig(
    templateDir: string,
    outputDir: string,
    config: AppConfig,
    options: TemplateProcessingOptions = {}
  ): Promise<TemplateProcessingResult[]> {
    // Create context from config
    const context = this.createContextFromConfig(config);
    
    // Create file-specific configurations based on app config
    const fileConfigs: TemplateFileConfig[] = [];
    
    // Add configuration for deno.json
    fileConfigs.push({
      pattern: /deno\.json$/,
      process: true,
      options: { strict: true }
    });
    
    // Add configuration for README.md
    fileConfigs.push({
      pattern: /README\.md$/,
      process: true,
      contextOverrides: {
        readme: {
          title: config.metadata.name,
          description: config.metadata.description || 'A Fresh application',
          year: new Date().getFullYear(),
          author: config.metadata.author || ''
        }
      }
    });
    
    // Add configuration for static assets
    fileConfigs.push({
      pattern: /\.(jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/i,
      process: false
    });
    
    // Add configuration for route files
    if (config.routes && config.routes.length > 0) {
      fileConfigs.push({
        pattern: /routes\/.*\.(tsx|jsx)$/,
        process: true,
        contextOverrides: {
          routes: config.routes
        }
      });
    }
    
    // Add configuration for API routes
    if (config.api && config.api.endpoints && config.api.endpoints.length > 0) {
      fileConfigs.push({
        pattern: /routes\/api\/.*\.(ts|js)$/,
        process: true,
        contextOverrides: {
          api: config.api
        }
      });
    }
    
    // Add configuration for theme files
    if (config.theme) {
      fileConfigs.push({
        pattern: /styles\.css$/,
        process: true,
        contextOverrides: {
          theme: config.theme
        }
      });
    }
    
    // Process templates with file-specific configurations
    return this.processDirectoryWithFileConfigs(templateDir, outputDir, context, fileConfigs, options);
  }
  
  /**
   * Generate a complete project from templates and configuration
   * 
   * @param config App configuration
   * @param templateRoot Path to the template root directory
   * @param outputRoot Path to the output root directory
   * @param options Template processing options
   * @returns Results of the processing
   */
  async generateProject(
    config: AppConfig,
    templateRoot: string,
    outputRoot: string,
    options: TemplateProcessingOptions = {}
  ): Promise<TemplateProcessingResult[]> {
    const normalizedTemplateRoot = fs.normalizePath(templateRoot);
    const normalizedOutputRoot = fs.normalizePath(outputRoot);
    const results: TemplateProcessingResult[] = [];
    
    try {
      // First, generate the project structure
      const projectDir = fs.joinPath(normalizedOutputRoot, config.metadata.name);
      const structureResult = await fileManager.generateProjectStructure(
        normalizedOutputRoot,
        config,
        normalizedTemplateRoot,
        options
      );
      
      // Convert structure results to template results
      for (const result of structureResult.results) {
        results.push({
          success: result.success,
          sourcePath: normalizedTemplateRoot,
          outputPath: result.path,
          errors: result.success ? [] : [{
            type: 'file',
            message: result.error || 'Unknown error creating project structure',
            location: { file: result.path }
          }]
        });
      }
      
      if (!structureResult.success) {
        return results;
      }
      
      // Then, process templates
      const templateResults = await this.processTemplatesFromConfig(
        fs.joinPath(normalizedTemplateRoot, 'base'),
        projectDir,
        config,
        options
      );
      
      results.push(...templateResults);
      
      return results;
    } catch (error) {
      const errorMessage = `Failed to generate project: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      results.push({
        success: false,
        sourcePath: normalizedTemplateRoot,
        outputPath: normalizedOutputRoot,
        errors: [{
          type: 'template',
          message: errorMessage,
          location: { file: normalizedOutputRoot }
        }]
      });
      
      return results;
    }
  }
}

// Export a default instance
export const templateProcessor = new TemplateProcessor();