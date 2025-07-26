/**
 * Compiler Service
 * Service wrapper for interfacing with the compiler package
 */

import type {
  ApplicationSpec,
  SiteGeneratorOptions,
  GenerationResult,
  ComponentValidationResult,
  VariableValidationResult,
} from "@suppers/shared";
import { ApplicationSpecSchema } from "@suppers/shared";

// Placeholder implementations for compiler functions
// These will be replaced with actual compiler imports when integration is ready
async function generateApplication(options: SiteGeneratorOptions): Promise<void> {
  // Simulate application generation
  console.log(`Generating application: ${options.name}`);
  
  // Create output directory structure
  const outputPath = `apps/generated/${options.name}`;
  try {
    await Deno.mkdir(outputPath, { recursive: true });
    
    // Create basic files
    await Deno.writeTextFile(
      `${outputPath}/README.md`,
      `# ${options.name}\n\nGenerated application with Suppers AI Builder\n`
    );
    
    await Deno.writeTextFile(
      `${outputPath}/deno.json`,
      JSON.stringify({
        name: options.name,
        version: "1.0.0",
        tasks: {
          start: "deno run --allow-all main.ts",
          dev: "deno run --allow-all --watch main.ts"
        }
      }, null, 2)
    );
    
    await Deno.writeTextFile(
      `${outputPath}/main.ts`,
      `// Generated application: ${options.name}\nconsole.log("Hello from ${options.name}!");\n`
    );
    
  } catch (error) {
    throw new Error(`Failed to generate application: ${error}`);
  }
}

function validateVariableReferences(
  data: any,
  variables: Record<string, string>
): VariableValidationResult {
  // Simple variable validation - check for ${{VARIABLE}} patterns
  const missingVariables: string[] = [];
  const variablePattern = /\$\{\{([A-Z_][A-Z0-9_]*)\}\}/g;
  
  function checkValue(value: any): void {
    if (typeof value === "string") {
      let match;
      while ((match = variablePattern.exec(value)) !== null) {
        const variableName = match[1];
        if (!variables[variableName]) {
          missingVariables.push(variableName);
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(checkValue);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(checkValue);
    }
  }
  
  checkValue(data);
  
  return {
    valid: missingVariables.length === 0,
    missingVariables: [...new Set(missingVariables)], // Remove duplicates
  };
}

export interface ProgressCallback {
  (progress: number, step: string): void;
}

export interface CompilerService {
  generateApplication(spec: ApplicationSpec, onProgress?: ProgressCallback): Promise<GenerationResult>;
  validateSpec(spec: ApplicationSpec): Promise<ValidationResult>;
  getAvailableTemplates(): Promise<ApplicationTemplate[]>;
  getComponentRegistry(): Promise<ComponentRegistry>;
  createDownloadUrl(result: GenerationResult): Promise<string>;
  cleanupApplication(applicationName: string): Promise<boolean>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  variableValidation: VariableValidationResult;
  componentValidation: ComponentValidationResult;
}

export interface ApplicationTemplate {
  id: string;
  name: string;
  description: string;
  category: "business" | "portfolio" | "blog" | "ecommerce" | "dashboard";
  preview: {
    image: string;
    demoUrl?: string;
  };
  spec: Partial<ApplicationSpec>;
  features: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
}

export interface ComponentRegistry {
  [componentId: string]: {
    source: string;
    type: "ui-lib" | "custom" | "html";
    imports: string[];
  };
}

export class CompilerServiceImpl implements CompilerService {
  private readonly outputBasePath = "apps/generated";

  /**
   * Generate application from specification
   */
  async generateApplication(spec: ApplicationSpec, onProgress?: ProgressCallback): Promise<GenerationResult> {
    try {
      // Step 1: Validation (0-25%)
      onProgress?.(0, "Validating application specification...");
      const validation = await this.validateSpec(spec);
      if (!validation.valid) {
        return {
          success: false,
          applicationName: spec.application.name,
          outputPath: "",
          errors: validation.errors,
          warnings: validation.warnings,
        };
      }
      onProgress?.(25, "Validation completed successfully");

      // Step 2: Setup (25-50%)
      onProgress?.(25, "Setting up project structure...");
      const specFileName = `${spec.application.name}.json`;
      const specPath = `sites/${specFileName}`;
      
      // Ensure sites directory exists
      try {
        await Deno.mkdir("sites", { recursive: true });
      } catch (error) {
        if (!(error instanceof Deno.errors.AlreadyExists)) {
          throw error;
        }
      }

      // Write the spec to a temporary file
      await Deno.writeTextFile(specPath, JSON.stringify(spec, null, 2));
      onProgress?.(40, "Project structure created");

      // Convert ApplicationSpec to SiteGeneratorOptions
      const options: SiteGeneratorOptions = {
        name: spec.application.name,
        withSupabase: this.hasSupabaseFeatures(spec),
        enableSSO: this.hasAuthFeatures(spec),
        authProviders: this.extractAuthProviders(spec),
      };
      onProgress?.(50, "Configuration prepared");

      // Step 3: Generation (50-75%)
      onProgress?.(50, "Generating application files...");
      await this.generateApplicationWithProgress(options, (progress) => {
        // Map internal progress (0-100) to our range (50-75)
        const mappedProgress = 50 + (progress * 0.25);
        onProgress?.(mappedProgress, "Generating application files...");
      });
      onProgress?.(75, "Application files generated");

      // Step 4: Finalization (75-100%)
      onProgress?.(75, "Finalizing application...");
      const outputPath = `${this.outputBasePath}/${spec.application.name}`;
      
      // Clean up temporary spec file
      try {
        await Deno.remove(specPath);
      } catch {
        // Ignore cleanup errors
      }
      onProgress?.(90, "Cleaning up temporary files");

      // Verify output
      try {
        const stat = await Deno.stat(outputPath);
        if (!stat.isDirectory) {
          throw new Error("Output directory not created");
        }
      } catch (error) {
        throw new Error(`Failed to verify generated application: ${error}`);
      }
      
      onProgress?.(100, "Application generation completed!");

      return {
        success: true,
        applicationName: spec.application.name,
        outputPath,
        warnings: validation.warnings,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        applicationName: spec.application.name,
        outputPath: "",
        errors: [this.formatUserFriendlyError(errorMessage)],
      };
    }
  }

  /**
   * Validate application specification
   */
  async validateSpec(spec: ApplicationSpec): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate against schema
      ApplicationSpecSchema.parse(spec);
    } catch (error) {
      if (error instanceof Error) {
        errors.push(`Schema validation failed: ${error.message}`);
      }
    }

    // Validate variable references
    const variableValidation = validateVariableReferences(
      spec.data,
      spec.variables || {}
    );

    if (!variableValidation.valid) {
      warnings.push(
        `Missing variables: ${variableValidation.missingVariables.join(", ")}`
      );
    }

    // Validate component references
    const componentValidation = await this.validateComponents(spec);
    
    if (!componentValidation.valid) {
      errors.push(
        `Unknown components: ${componentValidation.missingComponents.join(", ")}`
      );
    }

    // Validate routes
    const routeErrors = this.validateRoutes(spec);
    errors.push(...routeErrors);

    // Validate application info
    const appErrors = this.validateApplicationInfo(spec);
    errors.push(...appErrors);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      variableValidation,
      componentValidation,
    };
  }

  /**
   * Get available application templates
   */
  async getAvailableTemplates(): Promise<ApplicationTemplate[]> {
    // For now, return a basic template. In the future, this could read from
    // a templates directory or configuration file
    return [
      {
        id: "fresh-basic",
        name: "Fresh Basic",
        description: "A basic Fresh application with modern UI components",
        category: "business",
        preview: {
          image: "/templates/fresh-basic-preview.png",
        },
        spec: {
          application: {
            name: "my-app",
            version: "1.0.0",
            description: "A Fresh application",
            id: "fresh-basic-template",
          },
          compiler: {
            id: "suppers-compiler",
            version: "1.0.0",
          },
          data: {
            routes: [
              {
                path: "/",
                type: "page" as const,
                components: [
                  {
                    id: "hero-section",
                    props: {
                      title: "Welcome to My App",
                      subtitle: "Built with Fresh and Suppers UI",
                    },
                  },
                ],
              },
            ],
          },
        },
        features: ["Fresh Framework", "TailwindCSS", "daisyUI", "TypeScript"],
        complexity: "beginner",
        estimatedTime: "5 minutes",
      },
    ];
  }

  /**
   * Get component registry
   */
  async getComponentRegistry(): Promise<ComponentRegistry> {
    // This would typically be loaded from the UI library or a configuration file
    return {
      "hero-section": {
        source: "@suppers/ui-lib/components/sections/hero",
        type: "ui-lib",
        imports: ["Hero"],
      },
      "card": {
        source: "@suppers/ui-lib/components/display/card",
        type: "ui-lib",
        imports: ["Card"],
      },
      "button": {
        source: "@suppers/ui-lib/components/action/button",
        type: "ui-lib",
        imports: ["Button"],
      },
      "navbar": {
        source: "@suppers/ui-lib/components/navigation/navbar",
        type: "ui-lib",
        imports: ["Navbar"],
      },
    };
  }

  /**
   * Check if spec has Supabase features
   */
  private hasSupabaseFeatures(spec: ApplicationSpec): boolean {
    // Check if any routes have permissions (indicating auth)
    return spec.data.routes.some(route => route.permissions && route.permissions.length > 0);
  }

  /**
   * Check if spec has authentication features
   */
  private hasAuthFeatures(spec: ApplicationSpec): boolean {
    return this.hasSupabaseFeatures(spec);
  }

  /**
   * Extract auth providers from spec
   */
  private extractAuthProviders(spec: ApplicationSpec): string[] {
    // For now, return default providers. This could be enhanced to read from spec
    return this.hasAuthFeatures(spec) ? ["google", "github"] : [];
  }

  /**
   * Validate component references
   */
  private async validateComponents(spec: ApplicationSpec): Promise<ComponentValidationResult> {
    const registry = await this.getComponentRegistry();
    const missingComponents: string[] = [];

    const checkComponents = (components: any[]): void => {
      for (const component of components) {
        if (!registry[component.id]) {
          missingComponents.push(component.id);
        }
        if (component.components) {
          checkComponents(component.components);
        }
      }
    };

    // Check global components
    if (spec.data.global?.header?.component) {
      checkComponents([spec.data.global.header.component]);
    }
    if (spec.data.global?.footer?.component) {
      checkComponents([spec.data.global.footer.component]);
    }
    if (spec.data.global?.menu?.component) {
      checkComponents([spec.data.global.menu.component]);
    }

    // Check route components
    for (const route of spec.data.routes) {
      if (route.components) {
        checkComponents(route.components);
      }
    }

    return {
      valid: missingComponents.length === 0,
      missingComponents: [...new Set(missingComponents)], // Remove duplicates
    };
  }

  /**
   * Validate routes
   */
  private validateRoutes(spec: ApplicationSpec): string[] {
    const errors: string[] = [];
    const paths = new Set<string>();

    for (const route of spec.data.routes) {
      // Check for duplicate paths
      if (paths.has(route.path)) {
        errors.push(`Duplicate route path: ${route.path}`);
      }
      paths.add(route.path);

      // Validate path format
      if (!route.path.startsWith("/")) {
        errors.push(`Route path must start with '/': ${route.path}`);
      }

      // Validate route type
      if (route.type !== "page") {
        errors.push(`Invalid route type '${route.type}' for path: ${route.path}`);
      }
    }

    return errors;
  }

  /**
   * Validate application info
   */
  private validateApplicationInfo(spec: ApplicationSpec): string[] {
    const errors: string[] = [];

    // Check for valid application name (no spaces, special chars)
    if (!/^[a-zA-Z0-9-_]+$/.test(spec.application.name)) {
      errors.push(
        "Application name must contain only letters, numbers, hyphens, and underscores"
      );
    }

    // Check version format
    if (!/^\d+\.\d+\.\d+/.test(spec.application.version)) {
      errors.push("Version must follow semantic versioning (e.g., 1.0.0)");
    }

    return errors;
  }

  /**
   * Generate application with progress tracking
   */
  private async generateApplicationWithProgress(
    options: SiteGeneratorOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    onProgress?.(0);
    
    // Simulate the generation process with progress updates
    await generateApplication(options);
    
    // Simulate progress steps
    const steps = [
      { progress: 20, delay: 100 },
      { progress: 40, delay: 200 },
      { progress: 60, delay: 150 },
      { progress: 80, delay: 100 },
      { progress: 100, delay: 50 },
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      onProgress?.(step.progress);
    }
  }

  /**
   * Create download URL for generated application
   */
  async createDownloadUrl(result: GenerationResult): Promise<string> {
    if (!result.success || !result.outputPath) {
      throw new Error("Cannot create download URL for failed generation");
    }

    try {
      // Verify the application directory exists
      const stat = await Deno.stat(result.outputPath);
      if (!stat.isDirectory) {
        throw new Error("Generated application directory not found");
      }

      // For now, return a simple file:// URL to the directory
      // In a real implementation, this would create a ZIP file and return a download URL
      const absolutePath = await Deno.realPath(result.outputPath);
      return `file://${absolutePath}`;
    } catch (error) {
      throw new Error(`Failed to create download URL: ${error}`);
    }
  }

  /**
   * Clean up generated application
   */
  async cleanupApplication(applicationName: string): Promise<boolean> {
    try {
      const outputPath = `${this.outputBasePath}/${applicationName}`;
      
      // Check if directory exists
      try {
        const stat = await Deno.stat(outputPath);
        if (!stat.isDirectory) {
          return false; // Not a directory, nothing to clean up
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return true; // Already doesn't exist, consider it cleaned up
        }
        throw error;
      }

      // Remove the directory and all its contents
      await Deno.remove(outputPath, { recursive: true });
      return true;
    } catch (error) {
      console.error(`Failed to cleanup application ${applicationName}:`, error);
      return false;
    }
  }

  /**
   * Format error messages to be user-friendly
   */
  private formatUserFriendlyError(error: string): string {
    // Common error patterns and their user-friendly messages
    const errorMappings: Record<string, string> = {
      "Application specification file not found": 
        "Could not find the application specification. Please ensure the app configuration is valid.",
      "Invalid application specification": 
        "The application configuration is invalid. Please check your form inputs.",
      "Template not found": 
        "The selected template is not available. Please choose a different template.",
      "Permission denied": 
        "Unable to create application files. Please check file system permissions.",
      "ENOENT": 
        "Required files or directories are missing. Please try again.",
      "EACCES": 
        "Permission denied. Please check file system permissions.",
    };

    for (const [pattern, message] of Object.entries(errorMappings)) {
      if (error.includes(pattern)) {
        return message;
      }
    }

    // Return original error if no mapping found, but make it more user-friendly
    return `Generation failed: ${error}. Please try again or contact support if the problem persists.`;
  }
}

// Export singleton instance
export const compilerService = new CompilerServiceImpl();