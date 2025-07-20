/**
 * Application generators module
 */

// Re-export types and functions for generators
export { generateApplication } from "./application.ts";
export type { SiteGeneratorOptions } from "../types/mod.ts";

// Export application generators
export { generateGlobalLayout, generateHeadOverrides } from "./layout.ts";
export { 
  generateComponentImports, 
  generateComponentElements, 
  generatePageWithComponents,
  generateServiceImports,
  generateComponentRegistry,
  validateComponents,
} from "./components.ts";
export { 
  generateDataServices, 
  generateDataConfig, 
  extractDataConfigurations,
  generateServerDataFetching,
} from "./data.ts";
export { 
  generateAuthSystem, 
  generateLoginPage, 
  getProtectedRoutes,
  getAllRequiredPermissions,
} from "./auth.ts";
export { 
  generateRoutes, 
  generateApiRoutes, 
  generateRouteManifest,
} from "./routes.ts";
