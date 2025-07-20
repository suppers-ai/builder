/**
 * Data Service Generator
 * Generates data service templates for API calls and Supabase integration
 */

import { FileSystem } from "../utils/mod.ts";
import { substituteVariables } from "../utils/variables.ts";
import type { ApplicationSpec, ComponentDefinition, DataConfig, Variables } from "../types/mod.ts";

/**
 * Generate data services in the generated application
 */
export async function generateDataServices(
  destinationRoot: string,
  spec: ApplicationSpec,
): Promise<void> {
  console.log("🔌 Generating data services...");

  const servicesDir = FileSystem.join(destinationRoot, "services");
  await FileSystem.ensureDir(servicesDir);

  // Generate main data service
  await generateMainDataService(servicesDir, spec);

  // Generate Supabase service if needed
  await generateSupabaseService(servicesDir, spec);

  console.log("  📄 Generated data services");
}

/**
 * Generate main data service with API call functionality
 */
async function generateMainDataService(
  servicesDir: string,
  spec: ApplicationSpec,
): Promise<void> {
  const variables = spec.variables || {};
  const defaultApiUrl = variables.SUPPERS_API_URL || "http://localhost:5000/api";

  const dataServiceContent = `/**
 * Data Service
 * Handles API calls and data fetching for the application
 */

export interface DataServiceConfig {
  baseUrl?: string;
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  status: number;
}

export class DataService {
  private static instance: DataService;
  private defaultBaseUrl: string;

  private constructor() {
    this.defaultBaseUrl = "${defaultApiUrl}";
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Make an API call with the given configuration
   */
  async call<T = any>(config: DataServiceConfig): Promise<ApiResponse<T>> {
    const {
      baseUrl = this.defaultBaseUrl,
      endpoint,
      method = "GET",
      headers = {},
      body,
    } = config;

    const url = \`\${baseUrl}\${endpoint}\`;
    
    const requestConfig: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body && method !== "GET") {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      return {
        data,
        status: response.status,
        error: response.ok ? undefined : data.message || "Request failed",
      };
    } catch (error) {
      return {
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * GET request helper
   */
  async get<T = any>(endpoint: string, baseUrl?: string): Promise<ApiResponse<T>> {
    return this.call<T>({ endpoint, method: "GET", baseUrl });
  }

  /**
   * POST request helper
   */
  async post<T = any>(
    endpoint: string,
    body: any,
    baseUrl?: string,
  ): Promise<ApiResponse<T>> {
    return this.call<T>({ endpoint, method: "POST", body, baseUrl });
  }

  /**
   * PUT request helper
   */
  async put<T = any>(
    endpoint: string,
    body: any,
    baseUrl?: string,
  ): Promise<ApiResponse<T>> {
    return this.call<T>({ endpoint, method: "PUT", body, baseUrl });
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(endpoint: string, baseUrl?: string): Promise<ApiResponse<T>> {
    return this.call<T>({ endpoint, method: "DELETE", baseUrl });
  }

  /**
   * PATCH request helper
   */
  async patch<T = any>(
    endpoint: string,
    body: any,
    baseUrl?: string,
  ): Promise<ApiResponse<T>> {
    return this.call<T>({ endpoint, method: "PATCH", body, baseUrl });
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();

// Export helper functions for direct use
export const api = {
  get: <T = any>(endpoint: string, baseUrl?: string) => 
    dataService.get<T>(endpoint, baseUrl),
  post: <T = any>(endpoint: string, body: any, baseUrl?: string) => 
    dataService.post<T>(endpoint, body, baseUrl),
  put: <T = any>(endpoint: string, body: any, baseUrl?: string) => 
    dataService.put<T>(endpoint, body, baseUrl),
  delete: <T = any>(endpoint: string, baseUrl?: string) => 
    dataService.delete<T>(endpoint, baseUrl),
  patch: <T = any>(endpoint: string, body: any, baseUrl?: string) => 
    dataService.patch<T>(endpoint, body, baseUrl),
};
`;

  const dataServicePath = FileSystem.join(servicesDir, "data.ts");
  await FileSystem.writeText(dataServicePath, dataServiceContent);
}

/**
 * Generate Supabase service for authentication and database operations
 */
async function generateSupabaseService(
  servicesDir: string,
  spec: ApplicationSpec,
): Promise<void> {
  const supabaseServiceContent = `/**
 * Supabase Service
 * Handles authentication and database operations
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export class SupabaseService {
  private static instance: SupabaseService;
  private client: any;

  private constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
  }

  static getInstance(config?: SupabaseConfig): SupabaseService {
    if (!SupabaseService.instance) {
      if (!config) {
        throw new Error("Supabase configuration is required for first initialization");
      }
      SupabaseService.instance = new SupabaseService(config);
    }
    return SupabaseService.instance;
  }

  /**
   * Get authenticated user
   */
  async getUser() {
    const { data: { user }, error } = await this.client.auth.getUser();
    return { user, error };
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await this.client.auth.signOut();
    return { error };
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  /**
   * Query data from a table
   */
  async query(table: string, options: {
    select?: string;
    filter?: { column: string; operator: string; value: any }[];
    limit?: number;
    offset?: number;
  } = {}) {
    let query = this.client.from(table).select(options.select || "*");

    if (options.filter) {
      for (const filter of options.filter) {
        query = query.filter(filter.column, filter.operator, filter.value);
      }
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    return { data, error };
  }

  /**
   * Insert data into a table
   */
  async insert(table: string, data: any) {
    const { data: result, error } = await this.client
      .from(table)
      .insert(data);
    return { data: result, error };
  }

  /**
   * Update data in a table
   */
  async update(table: string, data: any, filter: { column: string; value: any }) {
    const { data: result, error } = await this.client
      .from(table)
      .update(data)
      .eq(filter.column, filter.value);
    return { data: result, error };
  }

  /**
   * Delete data from a table
   */
  async delete(table: string, filter: { column: string; value: any }) {
    const { data: result, error } = await this.client
      .from(table)
      .delete()
      .eq(filter.column, filter.value);
    return { data: result, error };
  }

  /**
   * Get raw Supabase client for advanced operations
   */
  getClient() {
    return this.client;
  }
}

// Configuration should be provided by the application
export function initializeSupabase(config: SupabaseConfig) {
  return SupabaseService.getInstance(config);
}
`;

  const supabaseServicePath = FileSystem.join(servicesDir, "supabase.ts");
  await FileSystem.writeText(supabaseServicePath, supabaseServiceContent);
}

/**
 * Generate data configuration for components
 */
export function generateDataConfig(
  component: ComponentDefinition,
  variables: Variables = {},
  defaultApiUrl = "http://localhost:5000/api",
): DataConfig | null {
  const dataProps = component.props?.data;

  if (!dataProps) {
    return null;
  }

  // Substitute variables in data configuration
  const processedData = substituteVariables(dataProps, variables);

  return {
    url: processedData.url || defaultApiUrl,
    endpoint: processedData.endpoint || "/data",
    method: processedData.method || "GET",
  };
}

/**
 * Extract all data configurations from components
 */
export function extractDataConfigurations(
  components: ComponentDefinition[],
  variables: Variables = {},
): DataConfig[] {
  const configs: DataConfig[] = [];

  function extractFromComponents(comps: ComponentDefinition[]): void {
    for (const component of comps) {
      const config = generateDataConfig(component, variables);
      if (config) {
        configs.push(config);
      }

      if (component.components) {
        extractFromComponents(component.components);
      }
    }
  }

  extractFromComponents(components);
  return configs;
}

/**
 * Generate server-side data fetching for Fresh islands
 */
export function generateServerDataFetching(
  components: ComponentDefinition[],
  variables: Variables = {},
): string {
  const dataConfigs = extractDataConfigurations(components, variables);

  if (dataConfigs.length === 0) {
    return "";
  }

  const fetchFunctions = dataConfigs.map((config, index) => {
    const processedUrl = substituteVariables(config.url || "", variables);
    const processedEndpoint = substituteVariables(config.endpoint, variables);

    return `
  // Data fetch ${index + 1}
  const response${index + 1} = await fetch("\${processedUrl}\${processedEndpoint}");
  const data${index + 1} = await response${index + 1}.json();`;
  }).join("");

  return `
// Server-side data fetching
export const handler: Handlers = {
  async GET(req, ctx) {${fetchFunctions}
    
    return ctx.render({
      ${dataConfigs.map((_, index) => `data${index + 1}`).join(",\n      ")}
    });
  },
};
`;
}
