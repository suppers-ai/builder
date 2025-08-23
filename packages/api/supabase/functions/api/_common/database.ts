/**
 * Database utilities for API handlers
 * Standalone Supabase client without external dependencies
 */

import { config } from './config.ts';
import { InternalServerError } from './errors.ts';

export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, unknown>;
}

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

/**
 * Simple Supabase client implementation
 */
export class DatabaseClient {
  private baseUrl: string;
  private headers: Headers;

  constructor(token?: string) {
    const supabaseConfig = config.supabase;
    
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      throw new InternalServerError('Database configuration missing');
    }

    this.baseUrl = `${supabaseConfig.url}/rest/v1`;
    this.headers = new Headers({
      'apikey': supabaseConfig.anonKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    });

    if (token) {
      this.headers.set('Authorization', `Bearer ${token}`);
    } else if (supabaseConfig.serviceRoleKey) {
      this.headers.set('Authorization', `Bearer ${supabaseConfig.serviceRoleKey}`);
    }
  }

  /**
   * Build query string from options
   */
  private buildQueryString(options?: QueryOptions): string {
    const params = new URLSearchParams();

    if (options?.select) {
      params.append('select', options.select);
    }

    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }

    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }

    if (options?.orderBy) {
      const order = `${options.orderBy.column}.${options.orderBy.ascending ? 'asc' : 'desc'}`;
      params.append('order', order);
    }

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, `eq.${value}`);
        }
      });
    }

    return params.toString();
  }

  /**
   * Execute a database query
   */
  private async execute<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    headers?: Headers
  ): Promise<DatabaseResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const requestHeaders = new Headers(this.headers);
      
      if (headers) {
        headers.forEach((value, key) => {
          requestHeaders.set(key, value);
        });
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const contentType = response.headers.get('content-type');
      let data = null;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        const errorMessage = data?.message || `Database error: ${response.statusText}`;
        return {
          data: null,
          error: new Error(errorMessage),
        };
      }

      // Get count from headers if available
      const contentRange = response.headers.get('content-range');
      let count: number | undefined;
      if (contentRange) {
        const match = contentRange.match(/\d+$/);
        if (match) {
          count = parseInt(match[0], 10);
        }
      }

      return {
        data: data as T,
        error: null,
        count,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown database error'),
      };
    }
  }

  /**
   * SELECT query
   */
  async select<T>(
    table: string,
    options?: QueryOptions
  ): Promise<DatabaseResponse<T[]>> {
    const queryString = this.buildQueryString(options);
    const endpoint = `/${table}${queryString ? `?${queryString}` : ''}`;
    
    const headers = new Headers();
    if (options?.limit !== undefined || options?.offset !== undefined) {
      headers.set('Prefer', 'count=exact');
    }

    return this.execute<T[]>('GET', endpoint, undefined, headers);
  }

  /**
   * SELECT single record
   */
  async selectSingle<T>(
    table: string,
    id: string | number,
    options?: { select?: string }
  ): Promise<DatabaseResponse<T>> {
    const params = new URLSearchParams();
    if (options?.select) {
      params.append('select', options.select);
    }
    
    const queryString = params.toString();
    const endpoint = `/${table}?id=eq.${id}${queryString ? `&${queryString}` : ''}`;
    
    const response = await this.execute<T[]>('GET', endpoint);
    
    if (response.error) {
      return { data: null, error: response.error };
    }

    return {
      data: response.data?.[0] || null,
      error: null,
    };
  }

  /**
   * INSERT query
   */
  async insert<T>(
    table: string,
    data: Partial<T> | Partial<T>[]
  ): Promise<DatabaseResponse<T>> {
    const endpoint = `/${table}`;
    const headers = new Headers();
    headers.set('Prefer', 'return=representation');

    return this.execute<T>('POST', endpoint, data, headers);
  }

  /**
   * UPDATE query
   */
  async update<T>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<DatabaseResponse<T>> {
    const endpoint = `/${table}?id=eq.${id}`;
    const headers = new Headers();
    headers.set('Prefer', 'return=representation');

    const response = await this.execute<T[]>('PATCH', endpoint, data, headers);
    
    if (response.error) {
      return { data: null, error: response.error };
    }

    return {
      data: response.data?.[0] || null,
      error: null,
    };
  }

  /**
   * DELETE query
   */
  async delete(
    table: string,
    id: string | number
  ): Promise<DatabaseResponse<void>> {
    const endpoint = `/${table}?id=eq.${id}`;
    return this.execute<void>('DELETE', endpoint);
  }

  /**
   * RPC call
   */
  async rpc<T>(
    functionName: string,
    params?: Record<string, unknown>
  ): Promise<DatabaseResponse<T>> {
    const endpoint = `/rpc/${functionName}`;
    return this.execute<T>('POST', endpoint, params);
  }

  /**
   * Batch operations
   */
  async batch<T>(
    operations: Array<{
      method: 'select' | 'insert' | 'update' | 'delete';
      table: string;
      data?: unknown;
      id?: string | number;
      options?: QueryOptions;
    }>
  ): Promise<DatabaseResponse<T>[]> {
    const results = await Promise.all(
      operations.map(async (op) => {
        switch (op.method) {
          case 'select':
            return this.select(op.table, op.options);
          case 'insert':
            return this.insert(op.table, op.data as any);
          case 'update':
            return this.update(op.table, op.id!, op.data as any);
          case 'delete':
            return this.delete(op.table, op.id!);
          default:
            return { data: null, error: new Error('Invalid operation') };
        }
      })
    );

    return results as DatabaseResponse<T>[];
  }
}

/**
 * Create a database client with user token
 */
export function createClient(token?: string): DatabaseClient {
  return new DatabaseClient(token);
}

/**
 * Create a service role client (admin access)
 */
export function createServiceClient(): DatabaseClient {
  return new DatabaseClient();
}

/**
 * Transaction helper (pseudo-transaction using batch)
 */
export async function transaction<T>(
  fn: (client: DatabaseClient) => Promise<T>,
  token?: string
): Promise<T> {
  const client = createClient(token);
  try {
    return await fn(client);
  } catch (error) {
    // In a real implementation, you would rollback here
    throw error;
  }
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export function getPaginationOptions(params: PaginationParams): {
  limit: number;
  offset: number;
} {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 10));
  
  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}

/**
 * Build filter object from query parameters
 */
export function buildFilters(
  searchParams: URLSearchParams,
  allowedFields: string[]
): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  
  allowedFields.forEach(field => {
    const value = searchParams.get(field);
    if (value !== null) {
      filters[field] = value;
    }
  });

  return filters;
}