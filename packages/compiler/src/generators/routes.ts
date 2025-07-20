/**
 * Enhanced Route Generation
 * Generates routes with overrides, custom sources, and nested component support
 */

import { FileSystem } from "../utils/mod.ts";
import { generateHeadOverrides } from "./layout.ts";
import { 
  generateComponentImports, 
  generateComponentElements, 
  generatePageWithComponents,
  generateServiceImports,
} from "./components.ts";
import { generateServerDataFetching } from "./data.ts";
import type { 
  ApplicationSpec, 
  Route, 
  ComponentDefinition,
  Variables,
} from "../types/mod.ts";

/**
 * Generate all routes from the application specification
 */
export async function generateRoutes(
  destinationRoot: string,
  spec: ApplicationSpec,
): Promise<void> {
  console.log("📄 Generating routes...");
  
  const routes = spec.data.routes;
  const variables = spec.variables || {};
  
  for (const route of routes) {
    await generateRoute(destinationRoot, route, spec, variables);
  }
  
  console.log("  ✅ All routes generated");
}

/**
 * Generate a single route
 */
async function generateRoute(
  destinationRoot: string,
  route: Route,
  spec: ApplicationSpec,
  variables: Variables,
): Promise<void> {
  const routePath = route.path === "/" ? "" : route.path;
  const routeDir = FileSystem.join(destinationRoot, "routes", routePath);
  
  await FileSystem.ensureDir(routeDir);
  
  if (route.source) {
    // Handle custom source routes (static files)
    await generateCustomSourceRoute(destinationRoot, route);
  } else if (route.components) {
    // Handle component-based routes
    await generateComponentRoute(routeDir, route, spec, variables);
  } else {
    console.warn(`⚠️  Route ${route.path} has no components or source, skipping`);
  }
  
  console.log(`  📄 Generated route: ${route.path}`);
}

/**
 * Generate a custom source route (static files)
 */
async function generateCustomSourceRoute(
  destinationRoot: string,
  route: Route,
): Promise<void> {
  const sourcePath = route.source!;
  const routePath = route.path === "/" ? "" : route.path;
  const routeDir = FileSystem.join(destinationRoot, "routes", routePath);
  
  // Check if source path exists
  if (!(await FileSystem.exists(sourcePath))) {
    console.warn(`⚠️  Source path ${sourcePath} does not exist for route ${route.path}`);
    return;
  }
  
  if (await FileSystem.isDirectory(sourcePath)) {
    // Copy entire directory content
    await FileSystem.copy(sourcePath, routeDir);
    
    // If there's an index.html, create a Fresh handler for it
    const indexHtmlPath = FileSystem.join(routeDir, "index.html");
    if (await FileSystem.exists(indexHtmlPath)) {
      await generateStaticHtmlHandler(routeDir, indexHtmlPath);
    }
  } else {
    // Copy single file
    const filename = FileSystem.basename(sourcePath);
    const destPath = FileSystem.join(routeDir, filename);
    await FileSystem.copy(sourcePath, destPath);
    
    // If it's an HTML file, create a Fresh handler for it
    if (filename.endsWith(".html")) {
      await generateStaticHtmlHandler(routeDir, destPath);
    }
  }
}

/**
 * Generate a static HTML handler for Fresh
 */
async function generateStaticHtmlHandler(
  routeDir: string,
  htmlPath: string,
): Promise<void> {
  const htmlContent = await FileSystem.readText(htmlPath);
  
  const handlerContent = `/**
 * Static HTML Route Handler
 * Serves custom HTML content
 */

import { HandlerContext } from "$fresh/server.ts";

export async function handler(
  req: Request,
  ctx: HandlerContext,
): Promise<Response> {
  const html = \`${htmlContent.replace(/`/g, "\\`")}\`;
  
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}`;

  const handlerPath = FileSystem.join(routeDir, "index.ts");
  await FileSystem.writeText(handlerPath, handlerContent);
  
  // Remove the original HTML file since we're serving it through the handler
  await FileSystem.remove(htmlPath);
}

/**
 * Generate a component-based route
 */
async function generateComponentRoute(
  routeDir: string,
  route: Route,
  spec: ApplicationSpec,
  variables: Variables,
): Promise<void> {
  const components = route.components || [];
  const globalConfig = spec.data.global;
  
  // Generate route content
  const routeContent = generateRouteContent(route, components, spec, variables);
  
  const routePath = FileSystem.join(routeDir, "index.tsx");
  await FileSystem.writeText(routePath, routeContent);
}

/**
 * Generate the content for a component-based route
 */
function generateRouteContent(
  route: Route,
  components: ComponentDefinition[],
  spec: ApplicationSpec,
  variables: Variables,
): string {
  const imports: string[] = [];
  const elements: string[] = [];
  
  // Add Fresh imports
  imports.push('import { PageProps } from "$fresh/server.ts";');
  imports.push('import { Head } from "$fresh/runtime.ts";');
  
  // Add Handlers import if needed for server-side data fetching
  const hasDataComponents = hasDataConfiguration(components);
  if (hasDataComponents) {
    imports.push('import { Handlers } from "$fresh/server.ts";');
  }
  
  // Generate component imports
  const componentImports = generateComponentImports(components);
  imports.push(...componentImports);
  
  // Generate service imports if needed
  const serviceImports = generateServiceImports(components);
  imports.push(...serviceImports);
  
  // Generate component elements
  const componentElements = generateComponentElements(components, variables, undefined, 2);
  elements.push(...componentElements);
  
  // Generate head overrides
  const headOverrides = generateHeadOverrides(route.override, spec.data.global?.head);
  
  // Generate server-side data fetching if needed
  const serverDataFetching = hasDataComponents 
    ? generateServerDataFetching(components, variables)
    : "";
  
  // Generate route structure
  return `${imports.join("\n")}
${serverDataFetching}
export default function Page(props: PageProps) {
  return (
    <>
      <Head>
        ${headOverrides}
      </Head>
      <div class="container mx-auto px-4 py-8">
${elements.join("\n")}
      </div>
    </>
  );
}
`;
}

/**
 * Check if components have data configuration
 */
function hasDataConfiguration(components: ComponentDefinition[]): boolean {
  for (const component of components) {
    if (component.props?.data) {
      return true;
    }
    
    if (component.components && hasDataConfiguration(component.components)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate API routes for data endpoints
 */
export async function generateApiRoutes(
  destinationRoot: string,
  spec: ApplicationSpec,
): Promise<void> {
  const routes = spec.data.routes;
  const apiRoutes = extractApiRoutes(routes);
  
  if (apiRoutes.length === 0) {
    return;
  }
  
  console.log("🔌 Generating API routes...");
  
  const apiDir = FileSystem.join(destinationRoot, "routes", "api");
  await FileSystem.ensureDir(apiDir);
  
  for (const apiRoute of apiRoutes) {
    await generateApiRoute(apiDir, apiRoute, spec);
  }
  
  console.log("  ✅ API routes generated");
}

/**
 * Extract API routes from component data configurations
 */
function extractApiRoutes(routes: Route[]): Array<{
  endpoint: string;
  method: string;
  component: ComponentDefinition;
}> {
  const apiRoutes: Array<{
    endpoint: string;
    method: string;
    component: ComponentDefinition;
  }> = [];
  
  function extractFromComponents(components: ComponentDefinition[]): void {
    for (const component of components) {
      if (component.props?.data?.endpoint) {
        apiRoutes.push({
          endpoint: component.props.data.endpoint,
          method: component.props.data.method || "GET",
          component,
        });
      }
      
      if (component.components) {
        extractFromComponents(component.components);
      }
    }
  }
  
  for (const route of routes) {
    if (route.components) {
      extractFromComponents(route.components);
    }
  }
  
  return apiRoutes;
}

/**
 * Generate a single API route
 */
async function generateApiRoute(
  apiDir: string,
  apiRoute: {
    endpoint: string;
    method: string;
    component: ComponentDefinition;
  },
  spec: ApplicationSpec,
): Promise<void> {
  const { endpoint, method, component } = apiRoute;
  
  // Clean endpoint path for file system
  const cleanEndpoint = endpoint.replace(/^\//, "").replace(/\//g, "_");
  const routePath = FileSystem.join(apiDir, `${cleanEndpoint}.ts`);
  
  const apiContent = `/**
 * API Route: ${endpoint}
 * Method: ${method}
 * Generated for component: ${component.id}
 */

import { HandlerContext } from "$fresh/server.ts";
import { dataService } from "../../services/data.ts";

export async function handler(
  req: Request,
  ctx: HandlerContext,
): Promise<Response> {
  const method = req.method;
  
  if (method !== "${method}") {
    return new Response("Method not allowed", { status: 405 });
  }
  
  try {
    // This is a proxy to the actual data service
    const response = await dataService.${method.toLowerCase()}("${endpoint}");
    
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}`;

  await FileSystem.writeText(routePath, apiContent);
}

/**
 * Generate route manifest for Fresh
 */
export async function generateRouteManifest(
  destinationRoot: string,
  spec: ApplicationSpec,
): Promise<void> {
  const routes = spec.data.routes;
  const routeEntries: string[] = [];
  
  for (const route of routes) {
    const routePath = route.path === "/" ? "" : route.path;
    const routeKey = route.path === "/" ? "/" : route.path;
    const filePath = routePath ? `./routes${routePath}/index.tsx` : "./routes/index.tsx";
    
    routeEntries.push(`  "${routeKey}": {
    component: () => import("${filePath}"),
    pattern: "${routeKey}",
  }`);
  }
  
  const manifestContent = `/**
 * Route Manifest
 * Generated route configuration for Fresh
 */

export const manifest = {
  routes: {
${routeEntries.join(",\n")}
  },
};`;

  const manifestPath = FileSystem.join(destinationRoot, "fresh.gen.ts");
  await FileSystem.writeText(manifestPath, manifestContent);
}