// API functionality - Fresh 2.0 route handlers and middleware

// Export handlers
export {
  BaseApiHandler,
  createCrudHandler,
  createHandler,
  type ApiHandler,
  type ApiResponse,
  type ApiError,
  type ResponseMeta,
  type PaginationMeta,
  type ValidatedRequest,
  type CrudOperation,
  type CrudConfig,
} from "./handlers.ts";

// Export middleware
export {
  createValidationMiddleware,
  createCorsMiddleware,
  createRateLimitMiddleware,
  type ValidationMiddlewareOptions,
  type ValidationErrorDetail,
} from "./middleware.ts";

// Export route generator
export {
  generateRouteHandler,
  generateRouteHandlers,
  generateApiRoutes,
  createMiddlewareChain,
  type RouteGenerationOptions,
  type GeneratedRouteHandler,
  type RouteGenerationResult,
} from "./route-generator.ts";

// Export API config parser
export {
  parseApiConfig,
  validateApiEndpoint,
  type ApiConfigParsingOptions,
  type ParsedApiConfig,
} from "./api-config-parser.ts";

// Re-export shared types that are commonly used with API
export type {
  ApiEndpoint,
  ApiDefinition,
  ValidationSchema,
  FieldValidation,
  HttpMethod,
} from "@json-app-compiler/shared";

export { HttpStatus } from "@json-app-compiler/shared";
