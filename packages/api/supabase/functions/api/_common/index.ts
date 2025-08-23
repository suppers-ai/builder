/**
 * Common utilities for API handlers
 * Central export point for all common functionality
 */

// Configuration
export { config, configManager, type ApiConfig } from './config.ts';

// CORS
export { 
  getCorsHeaders, 
  handleOptionsRequest, 
  addCorsHeaders,
  corsHeaders 
} from './cors.ts';

// Authentication
export {
  type JWTPayload,
  type AuthContext,
  extractToken,
  decodeJWT,
  verifyToken,
  getAuthContext,
  isAdmin,
  requireAuth,
  requireAdmin,
  hasPermission,
  generateApiKey,
  validateApiKey,
  extractUserId,
} from './auth.ts';

// Database
export {
  type QueryOptions,
  type DatabaseResponse,
  DatabaseClient,
  createClient,
  createServiceClient,
  transaction,
  type PaginationParams,
  getPaginationOptions,
  buildFilters,
} from './database.ts';

// Response utilities
export {
  type ApiResponse,
  type PaginatedResponse,
  successResponse,
  errorResponse,
  errorResponses,
  jsonResponse,
  paginatedResponse,
  noContentResponse,
  redirectResponse,
  streamResponse,
} from './response.ts';

// Error handling
export {
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  handleAsync,
  toApiError,
  logError,
} from './errors.ts';

// Validation
export {
  type ValidationRule,
  type ValidationResult,
  validate,
  validateOrThrow,
  commonRules,
  sanitize,
  parseJsonBody,
  parseQueryParams,
} from './validation.ts';

// Handler utilities
export {
  type HttpMethod,
  type HandlerContext,
  type RouteHandler,
  type Route,
  type Middleware,
  createHandler,
  extractPathParams,
  createRouter,
  withMiddleware,
  middleware,
} from './handler.ts';

// Supabase client utilities
export {
  getSupabaseClient,
  getUserSupabaseClient,
} from './supabase.ts';