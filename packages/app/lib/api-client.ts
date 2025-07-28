import type { Database } from "@suppers/shared/generated/database-types";

export type User = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  aud: string;
  created_at?: string;
  updated_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
};

export type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: User;
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Get API base URL from environment
    if (typeof globalThis.Deno !== "undefined") {
      // Server-side
      this.baseUrl = Deno.env.get("API_BASE_URL") || "http://localhost:54321/functions/v1";
    } else {
      // Browser-side
      this.baseUrl = (globalThis as any).API_BASE_URL || "http://localhost:54321/functions/v1";
      // Load token from localStorage on browser
      this.loadTokenFromStorage();
    }
  }

  private loadTokenFromStorage() {
    if (typeof globalThis.localStorage !== "undefined") {
      this.token = globalThis.localStorage.getItem("access_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    
    // Persist token to localStorage on browser
    if (typeof globalThis.localStorage !== "undefined") {
      if (token) {
        globalThis.localStorage.setItem("access_token", token);
      } else {
        globalThis.localStorage.removeItem("access_token");
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  }

  // Auth methods
  auth = {
    getUser: async (): Promise<{ data: { user: User | null }; error: Error | null }> => {
      const result = await this.request<{ user: User }>("/api/v1/auth/me");
      return {
        data: { user: result.data?.user || null },
        error: result.error,
      };
    },

    signInWithPassword: async (credentials: {
      email: string;
      password: string;
    }): Promise<{ data: { user: User | null; session: Session | null }; error: Error | null }> => {
      const result = await this.request<{ user: User; session: Session }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (result.data?.session?.access_token) {
        this.setToken(result.data.session.access_token);
      }

      return {
        data: {
          user: result.data?.user || null,
          session: result.data?.session || null,
        },
        error: result.error,
      };
    },

    signUp: async (credentials: {
      email: string;
      password: string;
    }): Promise<{ data: { user: User | null; session: Session | null }; error: Error | null }> => {
      const result = await this.request<{ user: User; session: Session }>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (result.data?.session?.access_token) {
        this.setToken(result.data.session.access_token);
      }

      return {
        data: {
          user: result.data?.user || null,
          session: result.data?.session || null,
        },
        error: result.error,
      };
    },

    signOut: async (): Promise<{ error: Error | null }> => {
      const result = await this.request("/api/v1/auth/logout", {
        method: "POST",
      });

      if (!result.error) {
        this.setToken(null);
      }

      return { error: result.error };
    },

    refreshSession: async (refreshToken: string): Promise<{
      data: { session: Session | null };
      error: Error | null;
    }> => {
      const result = await this.request<{ session: Session }>("/api/v1/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (result.data?.session?.access_token) {
        this.setToken(result.data.session.access_token);
      }

      return {
        data: { session: result.data?.session || null },
        error: result.error,
      };
    },
  };

  // Database table methods
  from<T extends keyof Database["public"]["Tables"]>(table: T) {
    return new TableClient<T>(this, table);
  }
}

class TableClient<T extends keyof Database["public"]["Tables"]> {
  constructor(private client: ApiClient, private table: T) {}

  async select(
    columns = "*"
  ): Promise<{ data: Tables<T>[] | null; error: Error | null }> {
    const result = await this.client.request<Tables<T>[]>(`/api/v1/${this.table}?select=${columns}`);
    return result;
  }

  async insert(
    data: TablesInsert<T>
  ): Promise<{ data: Tables<T> | null; error: Error | null }> {
    const result = await this.client.request<Tables<T>>(`/api/v1/${this.table}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result;
  }

  async update(
    data: TablesUpdate<T>
  ): Promise<{ data: Tables<T> | null; error: Error | null }> {
    const result = await this.client.request<Tables<T>>(`/api/v1/${this.table}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return result;
  }

  async delete(): Promise<{ data: null; error: Error | null }> {
    const result = await this.client.request(`/api/v1/${this.table}`, {
      method: "DELETE",
    });
    return { data: null, error: result.error };
  }

  // Filtering methods (simplified)
  eq(column: string, value: any) {
    // In a real implementation, this would build query parameters
    // For now, return this to maintain chainability
    return this;
  }

  single() {
    // In a real implementation, this would modify the query to return single result
    return this;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export { apiClient };
export type { Database };