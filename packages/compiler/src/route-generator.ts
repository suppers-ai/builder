// Route generation system for Fresh 2.0
import { 
  type RouteDefinition, 
  type ComponentDefinition,
  type CompilationError,
  type RouteMeta
} from "../../shared/src/types.ts";
import { logger } from "../../shared/src/utils.ts";
import { fileManager, type FileOperationOptions } from "./file-manager.ts";
import { ComponentResolver } from "./component-resolver.ts";
import { ComponentImportGenerator } from "./component-import-generator.ts";
import { templateProcessor, type TemplateProcessingOptions } from "./template-processor.ts";
import { fs } from "../../shared/src/utils.ts";

/**
 * Options for route generation
 */
export interface RouteGenerationOptions extends FileOperationOptions {
  /** Base path for routes (default: 'routes') */
  routesBasePath?: string;
  /** Whether to validate component props (default: true) */
  validateProps?: boolean;
  /** Whether to generate layout files (default: true) */
  generateLayouts?: boolean;
  /** Whether to generate middleware files (default: true) */
  generateMiddleware?: boolean;
  /** Whether to use TypeScript (default: true) */
  useTypeScript?: boolean;
  /** Template directory for route templates */
  templateDir?: string;
}

/**
 * Result of route generation
 */
export interface RouteGenerationResult {
  /** Whether the generation was successful */
  success: boolean;
  /** Path to the generated route file */
  routePath: string;
  /** Original route definition */
  routeDefinition: RouteDefinition;
  /** Any errors that occurred during generation */
  errors: CompilationError[];
}

/**
 * Route generator for Fresh 2.0 applications
 */
export class RouteGenerator {
  private resolver: ComponentResolver;
  private importGenerator: ComponentImportGenerator;
  
  /**
   * Create a new route generator
   * 
   * @param resolver Component resolver
   * @param importGenerator Component import generator
   */
  constructor(resolver: ComponentResolver, importGenerator: ComponentImportGenerator) {
    this.resolver = resolver;
    this.importGenerator = importGenerator;
  }
  
  /**
   * Generate a route file from a route definition
   * 
   * @param outputDir Output directory
   * @param route Route definition
   * @param components Available components
   * @param options Route generation options
   * @returns Result of the route generation
   */
  async generateRoute(
    outputDir: string,
    route: RouteDefinition,
    components: ComponentDefinition[],
    options: RouteGenerationOptions = {}
  ): Promise<RouteGenerationResult> {
    const {
      routesBasePath = 'routes',
      validateProps = true,
      generateLayouts = true,
      generateMiddleware = true,
      useTypeScript = true,
      templateDir,
      ...fileOptions
    } = options;
    
    const errors: CompilationError[] = [];
    const normalizedOutputDir = fs.normalizePath(outputDir);
    
    try {
      // Determine route file path
      const routePath = this.normalizeRoutePath(route.path);
      const fileExt = useTypeScript ? '.tsx' : '.jsx';
      const routeFilePath = fs.joinPath(normalizedOutputDir, routesBasePath, `${routePath}${fileExt}`);
      
      // Create directory for the route file
      const routeDir = fs.getDirname(routeFilePath);
      await fileManager.createDirectory(routeDir, fileOptions);
      
      // Find the main component for this route
      const mainComponent = components.find(c => c.id === route.component);
      if (!mainComponent) {
        const error: CompilationError = {
          type: 'component',
          message: `Main component '${route.component}' not found for route '${route.path}'`,
          location: { path: route.path }
        };
        errors.push(error);
        
        return {
          success: false,
          routePath: routeFilePath,
          routeDefinition: route,
          errors
        };
      }
      
      // Find layout component if specified
      let layoutComponent: ComponentDefinition | undefined;
      if (route.layout) {
        layoutComponent = components.find(c => c.id === route.layout);
        if (!layoutComponent && generateLayouts) {
          const error: CompilationError = {
            type: 'component',
            message: `Layout component '${route.layout}' not found for route '${route.path}'`,
            location: { path: route.path }
          };
          errors.push(error);
        }
      }
      
      // Generate route content
      const routeContent = await this.generateRouteContent(
        route,
        mainComponent,
        layoutComponent,
        components,
        templateDir,
        options
      );
      
      // Write route file
      const writeResult = await fileManager.createFile(
        routeFilePath,
        routeContent,
        { ...fileOptions, createDirs: true }
      );
      
      if (!writeResult.success) {
        const error: CompilationError = {
          type: 'file',
          message: writeResult.error || `Failed to write route file: ${routeFilePath}`,
          location: { file: routeFilePath }
        };
        errors.push(error);
      }
      
      // Generate middleware file if needed
      if (generateMiddleware && route.middleware && route.middleware.length > 0) {
        await this.generateMiddlewareFile(
          normalizedOutputDir,
          route,
          options
        );
      }
      
      // Generate layout file if needed
      if (generateLayouts && route.layout && layoutComponent) {
        const layoutResult = await this.generateLayoutFile(
          normalizedOutputDir,
          route,
          layoutComponent,
          components,
          options
        );
        
        if (!layoutResult) {
          const error: CompilationError = {
            type: 'file',
            message: `Failed to generate layout file for route '${route.path}'`,
            location: { path: route.path }
          };
          errors.push(error);
        }
      }
      
      return {
        success: errors.length === 0,
        routePath: routeFilePath,
        routeDefinition: route,
        errors
      };
    } catch (error) {
      const errorMessage = `Failed to generate route for '${route.path}': ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      errors.push({
        type: 'component', // Using 'component' type instead of 'route' to match CompilationError type
        message: errorMessage,
        location: { path: route.path }
      });
      
      return {
        success: false,
        routePath: '',
        routeDefinition: route,
        errors
      };
    }
  }
  
  /**
   * Generate multiple route files from route definitions
   * 
   * @param outputDir Output directory
   * @param routes Route definitions
   * @param components Available components
   * @param options Route generation options
   * @returns Results of the route generation
   */
  async generateRoutes(
    outputDir: string,
    routes: RouteDefinition[],
    components: ComponentDefinition[],
    options: RouteGenerationOptions = {}
  ): Promise<RouteGenerationResult[]> {
    const results: RouteGenerationResult[] = [];
    
    // Sort routes to ensure parent routes are generated before nested routes
    const sortedRoutes = this.sortRoutesByHierarchy(routes);
    
    for (const route of sortedRoutes) {
      const result = await this.generateRoute(outputDir, route, components, options);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Sort routes by hierarchy to ensure parent routes are generated before nested routes
   * 
   * @param routes Route definitions
   * @returns Sorted route definitions
   */
  private sortRoutesByHierarchy(routes: RouteDefinition[]): RouteDefinition[] {
    return [...routes].sort((a, b) => {
      // Root path always comes first
      if (a.path === '/' || a.path === '') return -1;
      if (b.path === '/' || b.path === '') return 1;
      
      // Sort by path segments (shorter paths come first)
      const aSegments = a.path.split('/').filter(Boolean).length;
      const bSegments = b.path.split('/').filter(Boolean).length;
      
      if (aSegments !== bSegments) {
        return aSegments - bSegments;
      }
      
      // If same number of segments, sort alphabetically
      return a.path.localeCompare(b.path);
    });
  }
  
  /**
   * Generate route content from a template or from scratch
   * 
   * @param route Route definition
   * @param mainComponent Main component for the route
   * @param layoutComponent Layout component for the route (optional)
   * @param allComponents All available components
   * @param templateDir Template directory (optional)
   * @param options Route generation options
   * @returns Generated route content
   */
  private async generateRouteContent(
    route: RouteDefinition,
    mainComponent: ComponentDefinition,
    layoutComponent: ComponentDefinition | undefined,
    allComponents: ComponentDefinition[],
    templateDir?: string,
    options: RouteGenerationOptions = {}
  ): Promise<string> {
    // If template directory is provided, try to use a template
    if (templateDir) {
      const templatePath = fs.joinPath(templateDir, 'routes', 'template.tsx');
      
      // Check if template exists
      if (await fileManager.fileExists(templatePath)) {
        // Process template with route data
        const context = {
          route,
          component: mainComponent,
          layout: layoutComponent,
          meta: route.meta || {},
          props: route.props || {}
        };
        
        const templateOptions: TemplateProcessingOptions = {
          overwrite: true,
          ...options
        };
        
        // Create a temporary file to store the processed template
        const tempFile = await Deno.makeTempFile({ suffix: '.tsx' });
        
        try {
          const result = await templateProcessor.processFile(
            templatePath,
            tempFile,
            context,
            templateOptions
          );
          
          if (result.success) {
            // Read the processed template
            const content = await Deno.readTextFile(tempFile);
            return content;
          }
        } finally {
          // Clean up temp file
          try {
            await Deno.remove(tempFile);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    }
    
    // If template processing failed or no template was provided, generate from scratch
    return this.generateRouteContentFromScratch(
      route,
      mainComponent,
      layoutComponent,
      allComponents
    );
  }
  
  /**
   * Generate route content from scratch without using a template
   * 
   * @param route Route definition
   * @param mainComponent Main component for the route
   * @param layoutComponent Layout component for the route (optional)
   * @param allComponents All available components
   * @returns Generated route content
   */
  private generateRouteContentFromScratch(
    route: RouteDefinition,
    mainComponent: ComponentDefinition,
    layoutComponent: ComponentDefinition | undefined,
    allComponents: ComponentDefinition[]
  ): string {
    // Collect all components used in this route
    const usedComponents = new Set<string>();
    usedComponents.add(mainComponent.type);
    
    if (layoutComponent) {
      usedComponents.add(layoutComponent.type);
    }
    
    // Find child components that might be used in this route
    const childComponents = this.findChildComponents(mainComponent, allComponents);
    childComponents.forEach(component => usedComponents.add(component.type));
    
    // Generate imports
    const importResult = this.importGenerator.generateImports(
      Array.from(usedComponents).map(type => {
        return { id: type, type, props: {} } as ComponentDefinition;
      }),
      { useRelativeImports: true }
    );
    
    // Start building the route file content
    let content = `// Generated route for ${route.path}\n`;
    content += `import { PageProps } from "$fresh/server.ts";\n`;
    content += `import { Head } from "$fresh/runtime.ts";\n`;
    
    // Add component imports
    for (const importStatement of importResult.imports) {
      content += `${importStatement}\n`;
    }
    
    // Add island imports if any
    for (const islandImport of importResult.islandImports) {
      content += `${islandImport}\n`;
    }
    
    // Add middleware import if needed
    if (route.middleware && route.middleware.length > 0) {
      const middlewarePath = this.getMiddlewarePath(route.path);
      content += `import { middleware } from "${middlewarePath}";\n`;
    }
    
    content += '\n';
    
    // Add route props
    if (route.props && Object.keys(route.props).length > 0) {
      content += `// Route props\n`;
      content += `const routeProps = ${JSON.stringify(route.props, null, 2)};\n\n`;
    }
    
    // Add route metadata
    if (route.meta) {
      content += `// Route metadata\n`;
      content += `const meta = ${JSON.stringify(route.meta, null, 2)};\n\n`;
    }
    
    // Add data handler for Fresh 2.0 if needed
    if (this.shouldGenerateDataHandler(route)) {
      content += this.generateDataHandler(route);
    }
    
    // Start the route component
    content += `export default function ${this.getRouteComponentName(route.path)}(props: PageProps) {\n`;
    
    // Add data extraction from props if we have a data handler
    if (this.shouldGenerateDataHandler(route)) {
      content += `  const data = props.data;\n\n`;
    }
    
    content += `  return (\n`;
    
    // Add Head component with metadata
    content += `    <>\n`;
    content += `      <Head>\n`;
    content += `        <title>${route.meta?.title || `Route: ${route.path}`}</title>\n`;
    
    if (route.meta?.description) {
      content += `        <meta name="description" content="${route.meta.description}" />\n`;
    }
    
    if (route.meta?.keywords && route.meta.keywords.length > 0) {
      content += `        <meta name="keywords" content="${route.meta.keywords.join(', ')}" />\n`;
    }
    
    content += `      </Head>\n\n`;
    
    // Add layout component if specified
    if (layoutComponent) {
      content += `      <${layoutComponent.type}`;
      
      // Add layout props
      if (Object.keys(layoutComponent.props).length > 0) {
        content += ` {...${JSON.stringify(layoutComponent.props)}}`;
      }
      
      // Pass page props to layout if needed
      content += ` {...props}`;
      
      content += `>\n`;
      
      // Indent the main component
      content += `        <${mainComponent.type}`;
      
      // Add main component props
      if (Object.keys(mainComponent.props).length > 0) {
        content += ` {...${JSON.stringify(mainComponent.props)}}`;
      }
      
      // Add route props if any
      if (route.props && Object.keys(route.props).length > 0) {
        content += ` {...routeProps}`;
      }
      
      // Pass page props and data to component
      content += ` {...props}`;
      if (this.shouldGenerateDataHandler(route)) {
        content += ` data={data}`;
      }
      
      content += ` />\n`;
      content += `      </${layoutComponent.type}>\n`;
    } else {
      // No layout, just add the main component
      content += `      <${mainComponent.type}`;
      
      // Add main component props
      if (Object.keys(mainComponent.props).length > 0) {
        content += ` {...${JSON.stringify(mainComponent.props)}}`;
      }
      
      // Add route props if any
      if (route.props && Object.keys(route.props).length > 0) {
        content += ` {...routeProps}`;
      }
      
      // Pass page props and data to component
      content += ` {...props}`;
      if (this.shouldGenerateDataHandler(route)) {
        content += ` data={data}`;
      }
      
      content += ` />\n`;
    }
    
    content += `    </>\n`;
    content += `  );\n`;
    content += `}\n`;
    
    // Add middleware handler if needed
    if (route.middleware && route.middleware.length > 0) {
      content += `\n// Apply middleware\n`;
      content += `export const handler = middleware;\n`;
    }
    
    // Add config export for Fresh 2.0 if needed
    if (this.shouldGenerateRouteConfig(route)) {
      content += this.generateRouteConfig(route);
    }
    
    return content;
  }
  
  /**
   * Find child components that might be used in a component
   * 
   * @param component Component definition
   * @param allComponents All available components
   * @returns Array of child components
   */
  private findChildComponents(
    component: ComponentDefinition,
    allComponents: ComponentDefinition[]
  ): ComponentDefinition[] {
    const result: ComponentDefinition[] = [];
    
    // Check if component has children
    if (component.children && component.children.length > 0) {
      // Add direct children
      result.push(...component.children);
      
      // Recursively add children of children
      for (const child of component.children) {
        result.push(...this.findChildComponents(child, allComponents));
      }
    }
    
    // Check if component has dependencies in its props
    for (const [key, value] of Object.entries(component.props)) {
      if (typeof value === 'string' && value.startsWith('component:')) {
        // Extract component ID from reference
        const componentId = value.substring('component:'.length);
        const referencedComponent = allComponents.find(c => c.id === componentId);
        
        if (referencedComponent) {
          result.push(referencedComponent);
          result.push(...this.findChildComponents(referencedComponent, allComponents));
        }
      }
    }
    
    return result;
  }
  
  /**
   * Check if a route should have a data handler
   * 
   * @param route Route definition
   * @returns Whether to generate a data handler
   */
  private shouldGenerateDataHandler(route: RouteDefinition): boolean {
    // Generate data handler if route has a meta.dataHandler property
    // or if it's a dynamic route (has parameters)
    return !!(route.meta?.dataHandler) || route.path.includes(':');
  }
  
  /**
   * Generate a data handler for a route
   * 
   * @param route Route definition
   * @returns Generated data handler code
   */
  private generateDataHandler(route: RouteDefinition): string {
    let content = `// Data handler for route\n`;
    content += `export const handler = {\n`;
    
    if (route.meta?.dataHandler) {
      // Use custom data handler from meta
      content += `  async GET(req: Request, ctx: PageProps["params"]) {\n`;
      content += `    // Custom data handler implementation\n`;
      content += `    try {\n`;
      content += `      // Fetch data based on route parameters\n`;
      content += `      const data = { params: ctx, timestamp: new Date().toISOString() };\n`;
      content += `      return Response.json(data);\n`;
      content += `    } catch (error) {\n`;
      content += `      console.error("Error fetching data:", error);\n`;
      content += `      return Response.json({ error: "Failed to load data" }, { status: 500 });\n`;
      content += `    }\n`;
      content += `  },\n`;
    } else if (route.path.includes(':')) {
      // Generate a basic data handler for dynamic routes
      content += `  async GET(req: Request, ctx: PageProps["params"]) {\n`;
      content += `    // Extract route parameters\n`;
      content += `    const params = ctx;\n`;
      content += `    \n`;
      content += `    // Return route parameters as data\n`;
      content += `    return Response.json({\n`;
      content += `      params,\n`;
      content += `      timestamp: new Date().toISOString()\n`;
      content += `    });\n`;
      content += `  },\n`;
    }
    
    content += `};\n\n`;
    return content;
  }
  
  /**
   * Check if a route should have a config export
   * 
   * @param route Route definition
   * @returns Whether to generate a config export
   */
  private shouldGenerateRouteConfig(route: RouteDefinition): boolean {
    // Generate config if route has specific meta properties
    return !!(route.meta?.requiresAuth || route.meta?.cacheControl);
  }
  
  /**
   * Generate a route config export
   * 
   * @param route Route definition
   * @returns Generated config code
   */
  private generateRouteConfig(route: RouteDefinition): string {
    let content = `\n// Route configuration\n`;
    content += `export const config = {\n`;
    
    if (route.meta?.requiresAuth) {
      content += `  authRequired: true,\n`;
    }
    
    if (route.meta?.cacheControl) {
      content += `  cacheControl: "${route.meta.cacheControl}",\n`;
    }
    
    content += `};\n`;
    return content;
  }
  
  /**
   * Generate middleware file for a route
   * 
   * @param outputDir Output directory
   * @param route Route definition
   * @param options Route generation options
   * @returns Result of the middleware file generation
   */
  private async generateMiddlewareFile(
    outputDir: string,
    route: RouteDefinition,
    options: RouteGenerationOptions = {}
  ): Promise<boolean> {
    const {
      routesBasePath = 'routes',
      useTypeScript = true,
      ...fileOptions
    } = options;
    
    try {
      // Determine middleware file path
      const routePath = this.normalizeRoutePath(route.path);
      const routeDir = fs.joinPath(outputDir, routesBasePath, fs.getDirname(routePath));
      const fileExt = useTypeScript ? '.ts' : '.js';
      const middlewareFilePath = fs.joinPath(routeDir, `_middleware${fileExt}`);
      
      // Create directory for the middleware file
      await fileManager.createDirectory(routeDir, fileOptions);
      
      // Generate middleware content
      const middlewareContent = this.generateMiddlewareContent(route);
      
      // Write middleware file
      const writeResult = await fileManager.createFile(
        middlewareFilePath,
        middlewareContent,
        { ...fileOptions, createDirs: true }
      );
      
      return writeResult.success;
    } catch (error) {
      logger.error(`Failed to generate middleware for '${route.path}': ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  /**
   * Generate middleware content for a route
   * 
   * @param route Route definition
   * @returns Generated middleware content
   */
  private generateMiddlewareContent(route: RouteDefinition): string {
    let content = `// Generated middleware for ${route.path}\n`;
    content += `import { MiddlewareHandler } from "$fresh/server.ts";\n`;
    content += `import { FreshContext } from "$fresh/server.ts";\n\n`;
    
    // Import middleware functions
    for (const middlewareName of route.middleware || []) {
      content += `import { ${middlewareName} } from "../../middleware/${middlewareName}.ts";\n`;
    }
    
    content += `\n// Middleware chain\n`;
    content += `export const middleware: MiddlewareHandler[] = [\n`;
    
    // Add middleware functions
    for (const middlewareName of route.middleware || []) {
      content += `  ${middlewareName},\n`;
    }
    
    content += `];\n\n`;
    
    // Add middleware handler function for Fresh 2.0
    content += `// Fresh 2.0 middleware handler\n`;
    content += `export async function handler(req: Request, ctx: FreshContext) {\n`;
    content += `  // Apply middleware chain\n`;
    content += `  for (const mw of middleware) {\n`;
    content += `    const result = await mw(req, ctx);\n`;
    content += `    if (result) return result;\n`;
    content += `  }\n\n`;
    content += `  // Continue to the route handler if all middleware pass\n`;
    content += `  return await ctx.next();\n`;
    content += `};\n`;
    
    return content;
  }
  
  /**
   * Normalize route path for Fresh 2.0 conventions
   * 
   * @param path Route path
   * @returns Normalized path
   */
  private normalizeRoutePath(path: string): string {
    // Handle root path
    if (path === '/' || path === '') {
      return 'index';
    }
    
    // Remove leading slash
    let normalizedPath = path.replace(/^\//, '');
    
    // Convert path parameters to Fresh 2.0 format
    // e.g., /users/:id -> /users/[id]
    normalizedPath = normalizedPath.replace(/:([a-zA-Z0-9_]+)/g, '[$1]');
    
    // Handle catch-all routes
    normalizedPath = normalizedPath.replace(/\*$/, '[...path]');
    
    // Handle optional parameters
    normalizedPath = normalizedPath.replace(/\?$/, '');
    
    return normalizedPath;
  }
  
  /**
   * Get a component name for a route
   * 
   * @param path Route path
   * @returns Component name
   */
  private getRouteComponentName(path: string): string {
    // Remove leading slash
    let name = path.replace(/^\//, '');
    
    // Replace slashes with underscores
    name = name.replace(/\//g, '_');
    
    // Replace path parameters
    name = name.replace(/:([a-zA-Z0-9_]+)/g, '$1');
    
    // Replace special characters
    name = name.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Capitalize first letter of each word
    name = name.split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    // Handle empty name (root path)
    if (!name) {
      name = 'Home';
    }
    
    // Add 'Page' suffix
    return `${name}Page`;
  }
  
  /**
   * Get the relative path to the middleware file
   * 
   * @param routePath Route path
   * @returns Relative path to middleware
   */
  private getMiddlewarePath(routePath: string): string {
    // For root path, middleware is in the same directory
    if (routePath === '/' || routePath === '') {
      return './_middleware';
    }
    
    // For nested paths, calculate relative path
    const depth = routePath.split('/').filter(Boolean).length;
    const relativePath = depth > 0 ? './' : '../'.repeat(depth);
    
    return `${relativePath}_middleware`;
  }
  
  /**
   * Generate a layout file for a route
   * 
   * @param outputDir Output directory
   * @param route Route definition
   * @param layoutComponent Layout component definition
   * @param allComponents All available components
   * @param options Route generation options
   * @returns Whether the layout file was generated successfully
   */
  private async generateLayoutFile(
    outputDir: string,
    route: RouteDefinition,
    layoutComponent: ComponentDefinition,
    allComponents: ComponentDefinition[],
    options: RouteGenerationOptions = {}
  ): Promise<boolean> {
    const {
      routesBasePath = 'routes',
      useTypeScript = true,
      ...fileOptions
    } = options;
    
    try {
      // Determine layout file path
      const routePath = this.normalizeRoutePath(route.path);
      const routeDir = fs.joinPath(outputDir, routesBasePath, fs.getDirname(routePath));
      const fileExt = useTypeScript ? '.tsx' : '.jsx';
      const layoutFilePath = fs.joinPath(routeDir, `_layout${fileExt}`);
      
      // Check if layout file already exists
      const layoutExists = await fileManager.fileExists(layoutFilePath);
      if (layoutExists && !options.overwrite) {
        // Layout already exists and we're not overwriting
        return true;
      }
      
      // Create directory for the layout file
      await fileManager.createDirectory(routeDir, fileOptions);
      
      // Generate layout content
      const layoutContent = this.generateLayoutContent(route, layoutComponent, allComponents);
      
      // Write layout file
      const writeResult = await fileManager.createFile(
        layoutFilePath,
        layoutContent,
        { ...fileOptions, createDirs: true }
      );
      
      return writeResult.success;
    } catch (error) {
      logger.error(`Failed to generate layout for '${route.path}': ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  /**
   * Generate layout content for a route
   * 
   * @param route Route definition
   * @param layoutComponent Layout component definition
   * @param allComponents All available components
   * @returns Generated layout content
   */
  private generateLayoutContent(
    route: RouteDefinition,
    layoutComponent: ComponentDefinition,
    allComponents: ComponentDefinition[]
  ): string {
    // Collect all components used in this layout
    const usedComponents = new Set<string>();
    usedComponents.add(layoutComponent.type);
    
    // Find child components that might be used in this layout
    const childComponents = this.findChildComponents(layoutComponent, allComponents);
    childComponents.forEach(component => usedComponents.add(component.type));
    
    // Generate imports
    const importResult = this.importGenerator.generateImports(
      Array.from(usedComponents).map(type => {
        return { id: type, type, props: {} } as ComponentDefinition;
      }),
      { useRelativeImports: true }
    );
    
    // Start building the layout file content
    let content = `// Generated layout for routes under ${route.path}\n`;
    content += `import { PageProps } from "$fresh/server.ts";\n`;
    
    // Add component imports
    for (const importStatement of importResult.imports) {
      content += `${importStatement}\n`;
    }
    
    // Add island imports if any
    for (const islandImport of importResult.islandImports) {
      content += `${islandImport}\n`;
    }
    
    content += '\n';
    
    // Add layout props
    if (Object.keys(layoutComponent.props).length > 0) {
      content += `// Layout props\n`;
      content += `const layoutProps = ${JSON.stringify(layoutComponent.props, null, 2)};\n\n`;
    }
    
    // Start the layout component
    content += `export default function Layout({ Component, state }: PageProps) {\n`;
    content += `  return (\n`;
    content += `    <${layoutComponent.type}`;
    
    // Add layout props
    if (Object.keys(layoutComponent.props).length > 0) {
      content += ` {...layoutProps}`;
    }
    
    content += `>\n`;
    content += `      <Component />\n`;
    content += `    </${layoutComponent.type}>\n`;
    content += `  );\n`;
    content += `}\n`;
    
    // Add config export for Fresh 2.0 if needed
    if (route.meta?.requiresAuth) {
      content += `\n// Layout configuration\n`;
      content += `export const config = {\n`;
      content += `  authRequired: true,\n`;
      content += `};\n`;
    }
    
    return content;
  }
}

/**
 * Create a route generator with the given resolver and import generator
 * 
 * @param resolver Component resolver
 * @param importGenerator Component import generator (optional)
 * @returns Route generator instance
 */
export function createRouteGenerator(
  resolver: ComponentResolver,
  importGenerator?: ComponentImportGenerator
): RouteGenerator {
  const generator = importGenerator || new ComponentImportGenerator(resolver);
  return new RouteGenerator(resolver, generator);
}