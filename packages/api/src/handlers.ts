// Fresh 2.0 API route handlers with CRUD operations and validation

import type { FreshContext } from "$fresh/server.ts";
import type { HttpMethod } from "@json-app-compiler/shared";
import { HttpStatus } from "@json-app-compiler/shared";
import type { 
  ApiEndpoint, 
  ValidationSchema, 
  FieldValidation 
} from "@json-app-compiler/shared";
import { validator } from "@json-app-compiler/shared";

// Standard API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

// API error interface
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  suggestions?: string[];
}

// Response metadata
export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request context with validation
export interface ValidatedRequest extends Request {
  validatedBody?: Record<string, unknown>;
  validatedQuery?: Record<string, unknown>;
  validatedParams?: Record<string, unknown>;
  validatedHeaders?: Record<string, unknown>;
}

// Handler function type
export type ApiHandler = (
  req: ValidatedRequest,
  ctx: FreshContext
) => Promise<Response> | Response;

// CRUD operation types
export type CrudOperation = 'create' | 'read' | 'update' | 'delete' | 'list';

// CRUD handler configuration
export interface CrudConfig {
  resource: string;
  operations: CrudOperation[];
  validation?: {
    create?: ValidationSchema;
    update?: ValidationSchema;
    query?: ValidationSchema;
  };
  middleware?: string[];
}

// Base API handler class
export class BaseApiHandler {
  protected resource: string;
  protected config: CrudConfig;

  constructor(config: CrudConfig) {
    this.resource = config.resource;
    this.config = config;
  }

  // Create operation (POST)
  async create(req: ValidatedRequest, ctx: FreshContext): Promise<Response> {
    try {
      const body = req.validatedBody;
      
      if (!body) {
        return this.errorResponse(
          HttpStatus.BAD_REQUEST,
          'MISSING_BODY',
          'Request body is required for create operation'
        );
      }

      // Simulate creation - in real implementation, this would interact with a database
      const created = {
        id: crypto.randomUUID(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return this.successResponse(created, HttpStatus.CREATED);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Read operation (GET /:id)
  async read(req: ValidatedRequest, ctx: FreshContext): Promise<Response> {
    try {
      const params = ctx.params;
      const id = params.id;

      if (!id) {
        return this.errorResponse(
          HttpStatus.BAD_REQUEST,
          'MISSING_ID',
          'Resource ID is required'
        );
      }

      // Simulate read - in real implementation, this would query a database
      const resource = {
        id,
        name: `Sample ${this.resource}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return this.successResponse(resource);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Update operation (PUT /:id)
  async update(req: ValidatedRequest, ctx: FreshContext): Promise<Response> {
    try {
      const params = ctx.params;
      const id = params.id;
      const body = req.validatedBody;

      if (!id) {
        return this.errorResponse(
          HttpStatus.BAD_REQUEST,
          'MISSING_ID',
          'Resource ID is required'
        );
      }

      if (!body) {
        return this.errorResponse(
          HttpStatus.BAD_REQUEST,
          'MISSING_BODY',
          'Request body is required for update operation'
        );
      }

      // Simulate update - in real implementation, this would update a database record
      const updated = {
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      return this.successResponse(updated);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Delete operation (DELETE /:id)
  async delete(req: ValidatedRequest, ctx: FreshContext): Promise<Response> {
    try {
      const params = ctx.params;
      const id = params.id;

      if (!id) {
        return this.errorResponse(
          HttpStatus.BAD_REQUEST,
          'MISSING_ID',
          'Resource ID is required'
        );
      }

      // Simulate deletion - in real implementation, this would delete from database
      return this.successResponse(
        { id, deleted: true },
        HttpStatus.NO_CONTENT
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  // List operation (GET)
  async list(req: ValidatedRequest, ctx: FreshContext): Promise<Response> {
    try {
      const query = req.validatedQuery || {};
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const offset = (page - 1) * limit;

      // Simulate list - in real implementation, this would query a database
      const items = Array.from({ length: limit }, (_, i) => ({
        id: crypto.randomUUID(),
        name: `Sample ${this.resource} ${offset + i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const total = 100; // Simulated total count
      const totalPages = Math.ceil(total / limit);

      const meta: ResponseMeta = {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };

      return this.successResponse(items, HttpStatus.OK, meta);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Route handler dispatcher
  async handle(req: ValidatedRequest, ctx: FreshContext): Promise<Response> {
    const method = req.method as HttpMethod;
    const hasId = ctx.params.id !== undefined;

    switch (method) {
      case 'GET':
        return hasId ? this.read(req, ctx) : this.list(req, ctx);
      case 'POST':
        return this.create(req, ctx);
      case 'PUT':
      case 'PATCH':
        return this.update(req, ctx);
      case 'DELETE':
        return this.delete(req, ctx);
      default:
        return this.errorResponse(
          HttpStatus.METHOD_NOT_ALLOWED,
          'METHOD_NOT_ALLOWED',
          `Method ${method} is not allowed for this resource`
        );
    }
  }

  // Success response helper
  protected successResponse<T>(
    data: T,
    status: HttpStatus = HttpStatus.OK,
    meta?: ResponseMeta
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: meta || {
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '1.0',
      },
    });
  }

  // Error response helper
  protected errorResponse(
    status: HttpStatus,
    code: string,
    message: string,
    details?: string,
    field?: string,
    suggestions?: string[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        field,
        suggestions,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '1.0',
      },
    });
  }

  // Error handler
  protected handleError(error: unknown): Response {
    console.error('API Handler Error:', error);

    if (error instanceof Error) {
      return this.errorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'INTERNAL_ERROR',
        'An internal server error occurred',
        error.message
      );
    }

    return this.errorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'UNKNOWN_ERROR',
      'An unknown error occurred'
    );
  }
}

// Factory function to create CRUD handlers
export function createCrudHandler(config: CrudConfig): BaseApiHandler {
  return new BaseApiHandler(config);
}

// Generic handler factory for custom operations
export function createHandler(
  operation: string,
  handler: ApiHandler
): ApiHandler {
  return async (req: ValidatedRequest, ctx: FreshContext) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      console.error(`Handler Error [${operation}]:`, error);
      
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'HANDLER_ERROR',
          message: 'Handler execution failed',
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