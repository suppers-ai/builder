/**
 * Application generators module
 */

// Re-export types and functions for generators
export { generateApplication } from "./application.ts";
export type { SiteGeneratorOptions } from "../types/mod.ts";

// Export application generators
export { generateGlobalLayout, generateHeadOverrides } from "./layout.ts";
export {
  generateComponentElements,
  generateComponentImports,
  generateComponentRegistry,
  generatePageWithComponents,
  generateServiceImports,
  validateComponents,
} from "./components.ts";
export {
  extractDataConfigurations,
  generateDataConfig,
  generateDataServices,
  generateServerDataFetching,
} from "./data.ts";
export {
  generateAuthSystem,
  generateLoginPage,
  getAllRequiredPermissions,
  getProtectedRoutes,
} from "./auth.ts";
export { generateApiRoutes, generateRouteManifest, generateRoutes } from "./routes.ts";
