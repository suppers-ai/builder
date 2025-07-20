/**
 * Shared Database Types
 * Common database schema types and table definitions
 */

// Base table interfaces
export interface BaseTable {
  id: string;
  created_at: string;
  updated_at: string;
}

// Users table
export interface UsersTable extends BaseTable {
  email: string;
  first_name?: string;
  middle_names?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  role: "user" | "admin" | "moderator";
}

export interface UsersInsert {
  id?: string;
  email: string;
  first_name?: string;
  middle_names?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  role?: "user" | "admin" | "moderator";
  created_at?: string;
  updated_at?: string;
}

export interface UsersUpdate {
  email?: string;
  first_name?: string;
  middle_names?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  role?: "user" | "admin" | "moderator";
  updated_at?: string;
}

// Applications table
export interface ApplicationsTable extends BaseTable {
  name: string;
  description?: string;
  template_id: string;
  configuration: Record<string, unknown>;
  status: "draft" | "pending" | "published" | "archived";
  owner_id: string;
}

export interface ApplicationsInsert {
  id?: string;
  name: string;
  description?: string;
  template_id: string;
  configuration: Record<string, unknown>;
  status?: "draft" | "pending" | "published" | "archived";
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationsUpdate {
  name?: string;
  description?: string;
  template_id?: string;
  configuration?: Record<string, unknown>;
  status?: "draft" | "pending" | "published" | "archived";
  updated_at?: string;
}

// User Access table
export interface UserAccessTable extends BaseTable {
  application_id: string;
  user_id: string;
  access_level: "read" | "write" | "admin";
  granted_by: string;
  granted_at: string;
}

export interface UserAccessInsert {
  id?: string;
  application_id: string;
  user_id: string;
  access_level: "read" | "write" | "admin";
  granted_by: string;
  granted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAccessUpdate {
  access_level?: "read" | "write" | "admin";
  updated_at?: string;
}

// Application Reviews table
export interface ApplicationReviewsTable extends BaseTable {
  application_id: string;
  reviewer_id: string;
  action: "approved" | "rejected";
  feedback?: string;
  reviewed_at: string;
}

export interface ApplicationReviewsInsert {
  id?: string;
  application_id: string;
  reviewer_id: string;
  action: "approved" | "rejected";
  feedback?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationReviewsUpdate {
  action?: "approved" | "rejected";
  feedback?: string;
  updated_at?: string;
}

// Custom Themes table
export interface CustomThemesTable extends BaseTable {
  name: string;
  label: string;
  description?: string;
  variables: Record<string, string | number>;
  is_public: boolean;
  created_by: string;
}

export interface CustomThemesInsert {
  id?: string;
  name: string;
  label: string;
  description?: string;
  variables: Record<string, string | number>;
  is_public?: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomThemesUpdate {
  name?: string;
  label?: string;
  description?: string;
  variables?: Record<string, string | number>;
  is_public?: boolean;
  updated_at?: string;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersTable;
        Insert: UsersInsert;
        Update: UsersUpdate;
      };
      applications: {
        Row: ApplicationsTable;
        Insert: ApplicationsInsert;
        Update: ApplicationsUpdate;
      };
      user_access: {
        Row: UserAccessTable;
        Insert: UserAccessInsert;
        Update: UserAccessUpdate;
      };
      application_reviews: {
        Row: ApplicationReviewsTable;
        Insert: ApplicationReviewsInsert;
        Update: ApplicationReviewsUpdate;
      };
      custom_themes: {
        Row: CustomThemesTable;
        Insert: CustomThemesInsert;
        Update: CustomThemesUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "user" | "admin" | "moderator";
      application_status: "draft" | "pending" | "published" | "archived";
      access_level: "read" | "write" | "admin";
      review_action: "approved" | "rejected";
    };
  };
}

// Helper types for table operations
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

// Query builder types
export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  filters?: Array<{
    column: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "is";
    value: any;
  }>;
}

// Relationship types
export interface UserWithApplications extends UsersTable {
  applications: ApplicationsTable[];
}

export interface ApplicationWithOwner extends ApplicationsTable {
  owner: UsersTable;
}

export interface ApplicationWithReviews extends ApplicationsTable {
  reviews: ApplicationReviewsTable[];
}

export interface UserAccessWithUser extends UserAccessTable {
  user: UsersTable;
}

export interface UserAccessWithApplication extends UserAccessTable {
  application: ApplicationsTable;
}