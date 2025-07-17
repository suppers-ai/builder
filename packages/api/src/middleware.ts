// Request validation middleware using shared schemas

import type { FreshContext, MiddlewareHandler } from "$fresh/server.ts";
import type { 
  ValidationSchema, 
  FieldValidation 
} from "@json-app-compiler/shared";
import { validator, ValidationSeverity } from "@json-app-compiler/shared";
import { HttpStatus } from "@json-app-compiler/shared";
import type { ApiResponse, ValidatedRequest } from "./handlers.ts";

// Validation middleware options
export interface ValidationMiddlewareOptions {
  schema: ValidationSchema;
  strict?: boolean;
  allowUnknown?: boolean;
}

// Validation error details
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
  code: string;
}

// Create validation middleware
export function createValidationMiddleware(
  options: ValidationMiddlewareOptions
): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
    const validatedReq = req as ValidatedRequest;
    const errors: ValidationErrorDetail[] = [];

    try {
      // Validate request body
      if (options.schema.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        const body = await parseRequestBody(req);
        const bodyValidation = validateFields(body, options.schema.body, 'body');
        
        if (bodyValidation.errors.length > 0) {
          errors.push(...bodyValidation.errors);
        } else {
          validatedReq.validatedBody = bodyValidation.data;
        }
      }

      // Validate query parameters
      if (options.schema.query) {
        const url = new URL(req.url);
        const query = Object.fromEntries(url.searchParams.entries());
        const queryValidation = validateFields(query, options.schema.query, 'query');
        
        if (queryValidation.errors.length > 0) {
          errors.push(...queryValidation.errors);
        } else {
          validatedReq.validatedQuery = queryValidation.data;
        }
      }

      // Validate URL parameters
      if (options.schema.params) {
        const params = ctx.params || {};
        const paramsValidation = validateFields(params, options.schema.params, 'params');
        
        if (paramsValidation.errors.length > 0) {
          errors.push(...paramsValidation.errors);
        } else {
          validatedReq.validatedParams = paramsValidation.data;
        }
      }

      // Validate headers
      if (options.schema.headers) {
        const headers = Object.fromEntries(req.headers.entries());
        const headersValidation = validateFields(headers, options.schema.headers, 'headers');
        
        if (headersValidation.errors.length > 0) {
          errors.push(...headersValidation.errors);
        } else {
          validatedReq.validatedHeaders = headersValidation.data;
        }
      }

      // Return validation errors if any
      if (errors.length > 0) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: `${errors.length} validation error(s) found`,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        };

        // Add detailed validation errors
        const detailedErrors = errors.map(error => ({
          field: error.field,
          message: error.message,
          code: error.code,
          value: error.value,
        }));

        return new Response(JSON.stringify({
          ...response,
          validationErrors: detailedErrors,
        }), {
          status: HttpStatus.BAD_REQUEST,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Version': '1.0',
          },
        });
      }

      // Continue to next middleware/handler
      return await ctx.next();
    } catch (error) {
      console.error('Validation Middleware Error:', error);
      
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_MIDDLEWARE_ERROR',
          message: 'Validation middleware failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return new Response(JSON.stringify(response), {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
        },
      });
    }
  };
}

// Field validation result
interface FieldValidationResult {
  data: Record<string, unknown>;
  errors: ValidationErrorDetail[];
}

// Validate fields against schema
function validateFields(
  data: Record<string, unknown>,
  schema: Record<string, FieldValidation>,
  context: string
): FieldValidationResult {
  const result: FieldValidationResult = {
    data: {},
    errors: [],
  };

  const schemaKeys = Object.keys(schema);
  const dataKeys = Object.keys(data);

  // Check required fields
  for (const key of schemaKeys) {
    const fieldSchema = schema[key];
    const value = data[key];

    if (fieldSchema.required && (value === undefined || value === null || value === '')) {
      result.errors.push({
        field: `${context}.${key}`,
        message: `Field '${key}' is required`,
        code: 'REQUIRED_FIELD_MISSING',
        value,
      });
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      const fieldValidation = validateField(key, value, fieldSchema, context);
      if (fieldValidation.error) {
        result.errors.push(fieldValidation.error);
      } else {
        result.data[key] = fieldValidation.value;
      }
    }
  }

  return result;
}

// Single field validation result
interface SingleFieldValidationResult {
  value: unknown;
  error?: ValidationErrorDetail;
}

// Validate a single field
function validateField(
  key: string,
  value: unknown,
  schema: FieldValidation,
  context: string
): SingleFieldValidationResult {
  const fieldPath = `${context}.${key}`;

  // Type validation
  const typeValidation = validateFieldType(value, schema.type);
  if (!typeValidation.valid) {
    return {
      value,
      error: {
        field: fieldPath,
        message: `Field '${key}' must be of type ${schema.type}, got ${typeof value}`,
        code: 'INVALID_TYPE',
        value,
      },
    };
  }

  let processedValue = typeValidation.value;

  // String validations
  if (schema.type === 'string' && typeof processedValue === 'string') {
    if (schema.min !== undefined && processedValue.length < schema.min) {
      return {
        value,
        error: {
          field: fieldPath,
          message: `Field '${key}' must be at least ${schema.min} characters long`,
          code: 'MIN_LENGTH_VIOLATION',
          value,
        },
      };
    }

    if (schema.max !== undefined && processedValue.length > schema.max) {
      return {
        value,
        error: {
          field: fieldPath,
          message: `Field '${key}' must be at most ${schema.max} characters long`,
          code: 'MAX_LENGTH_VIOLATION',
          value,
        },
      };
    }

    if (schema.pattern) {
      try {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(processedValue)) {
          return {
            value,
            error: {
              field: fieldPath,
              message: `Field '${key}' does not match required pattern`,
              code: 'PATTERN_VIOLATION',
              value,
            },
          };
        }
      } catch (e) {
        return {
          value,
          error: {
            field: fieldPath,
            message: `Invalid pattern for field '${key}'`,
            code: 'INVALID_PATTERN',
            value,
          },
        };
      }
    }
  }

  // Number validations
  if (schema.type === 'number' && typeof processedValue === 'number') {
    if (schema.min !== undefined && processedValue < schema.min) {
      return {
        value,
        error: {
          field: fieldPath,
          message: `Field '${key}' must be at least ${schema.min}`,
          code: 'MIN_VALUE_VIOLATION',
          value,
        },
      };
    }

    if (schema.max !== undefined && processedValue > schema.max) {
      return {
        value,
        error: {
          field: fieldPath,
          message: `Field '${key}' must be at most ${schema.max}`,
          code: 'MAX_VALUE_VIOLATION',
          value,
        },
      };
    }
  }

  // Array validations
  if (schema.type === 'array' && Array.isArray(processedValue)) {
    if (schema.min !== undefined && processedValue.length < schema.min) {
      return {
        value,
        error: {
          field: fieldPath,
          message: `Field '${key}' must have at least ${schema.min} items`,
          code: 'MIN_ITEMS_VIOLATION',
          value,
        },
      };
    }

    if (schema.max !== undefined && processedValue.length > schema.max) {
      return {
        value,
        error: {
          field: fieldPath,
          message: `Field '${key}' must have at most ${schema.max} items`,
          code: 'MAX_ITEMS_VIOLATION',
          value,
        },
      };
    }
  }

  // Enum validation
  if (schema.enum && schema.enum.length > 0) {
    if (!schema.enum.includes(processedValue)) {
      return {
        value,
        error: {
          field: fieldPath,
          message: `Field '${key}' must be one of: ${schema.enum.join(', ')}`,
          code: 'ENUM_VIOLATION',
          value,
        },
      };
    }
  }

  return { value: processedValue };
}

// Type validation result
interface TypeValidationResult {
  valid: boolean;
  value: unknown;
}

// Validate and convert field type
function validateFieldType(value: unknown, expectedType: string): TypeValidationResult {
  switch (expectedType) {
    case 'string':
      if (typeof value === 'string') {
        return { valid: true, value };
      }
      // Try to convert to string
      if (value !== null && value !== undefined) {
        return { valid: true, value: String(value) };
      }
      return { valid: false, value };

    case 'number':
      if (typeof value === 'number' && !isNaN(value)) {
        return { valid: true, value };
      }
      // Try to convert to number
      if (typeof value === 'string') {
        const num = Number(value);
        if (!isNaN(num)) {
          return { valid: true, value: num };
        }
      }
      return { valid: false, value };

    case 'boolean':
      if (typeof value === 'boolean') {
        return { valid: true, value };
      }
      // Try to convert to boolean
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1') {
          return { valid: true, value: true };
        }
        if (lower === 'false' || lower === '0') {
          return { valid: true, value: false };
        }
      }
      if (typeof value === 'number') {
        return { valid: true, value: Boolean(value) };
      }
      return { valid: false, value };

    case 'array':
      return { valid: Array.isArray(value), value };

    case 'object':
      return { 
        valid: value !== null && typeof value === 'object' && !Array.isArray(value), 
        value 
      };

    default:
      return { valid: true, value };
  }
}

// Parse request body
async function parseRequestBody(req: Request): Promise<Record<string, unknown>> {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await req.json();
    } catch (error) {
      throw new Error('Invalid JSON in request body');
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const formData = await req.formData();
      const result: Record<string, unknown> = {};
      for (const [key, value] of formData.entries()) {
        result[key] = value;
      }
      return result;
    } catch (error) {
      throw new Error('Invalid form data in request body');
    }
  }

  // Default to empty object for other content types
  return {};
}

// CORS middleware
export function createCorsMiddleware(options: {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
} = {}): MiddlewareHandler {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
  } = options;

  return async (req: Request, ctx: FreshContext) => {
    const response = await ctx.next();
    
    // Set CORS headers
    const headers = new Headers(response.headers);
    
    if (typeof origin === 'string') {
      headers.set('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      const requestOrigin = req.headers.get('origin');
      if (requestOrigin && origin.includes(requestOrigin)) {
        headers.set('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (origin === true) {
      const requestOrigin = req.headers.get('origin');
      if (requestOrigin) {
        headers.set('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    headers.set('Access-Control-Allow-Methods', methods.join(', '));
    headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    
    if (credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// Rate limiting middleware (basic implementation)
export function createRateLimitMiddleware(options: {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
} = {}): MiddlewareHandler {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req: Request) => {
      const url = new URL(req.url);
      return url.hostname;
    },
  } = options;

  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (req: Request, ctx: FreshContext) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [k, v] of requests.entries()) {
      if (v.resetTime < windowStart) {
        requests.delete(k);
      }
    }

    // Get or create request info
    let requestInfo = requests.get(key);
    if (!requestInfo || requestInfo.resetTime < windowStart) {
      requestInfo = { count: 0, resetTime: now + windowMs };
      requests.set(key, requestInfo);
    }

    // Check rate limit
    if (requestInfo.count >= maxRequests) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          details: `Rate limit of ${maxRequests} requests per ${windowMs}ms exceeded`,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return new Response(JSON.stringify(response), {
        status: HttpStatus.TOO_MANY_REQUESTS,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': requestInfo.resetTime.toString(),
        },
      });
    }

    // Increment request count
    requestInfo.count++;

    const response = await ctx.next();
    
    // Add rate limit headers to response
    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Limit', maxRequests.toString());
    headers.set('X-RateLimit-Remaining', (maxRequests - requestInfo.count).toString());
    headers.set('X-RateLimit-Reset', requestInfo.resetTime.toString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}