/**
 * Type Mapping Utilities
 * Functions to convert between database types and API/auth formats
 */

import type { Database } from "../generated/database-types.ts";

// Database table types
type UsersTable = Database["public"]["Tables"]["users"]["Row"];
type ApplicationsTable = Database["public"]["Tables"]["applications"]["Row"];
type UserAccessTable = Database["public"]["Tables"]["user_access"]["Row"];
type ApplicationReviewsTable = Database["public"]["Tables"]["application_reviews"]["Row"];
type CustomThemesTable = Database["public"]["Tables"]["custom_themes"]["Row"];
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Re-export database types as canonical types
export type User = UsersTable;
export type Application = ApplicationsTable;
export type UserAccess = UserAccessTable;
export type ApplicationReview = ApplicationReviewsTable;
export type CustomTheme = CustomThemesTable;

// API Response Types (derived from database types)
export type UserResponse = Pick<
  User,
  "id" | "email" | "display_name" | "avatar_url" | "created_at"
>;

export interface UserResponseExtended extends UserResponse {
  full_name: string;
  initials: string;
}

export type ApplicationResponse = Pick<
  Application,
  "id" | "name" | "description" | "status" | "created_at" | "updated_at"
>;

export interface ApplicationResponseExtended extends ApplicationResponse {
  owner_name?: string;
  review_count?: number;
}

// Auth Types (derived from database types)
export type AuthUser = Pick<
  User,
  "id" | "email" | "first_name" | "last_name" | "display_name" | "avatar_url" | "role"
>;

export interface AuthSession {
  user: AuthUser;
  session: any; // Will be typed with actual session type
  supabaseUser: SupabaseUser;
}

// AuthState is defined in packages/shared/types/auth.ts
export type { AuthState } from "../types/auth.ts";

// Update operation types (derived from database types)
export type UserUpdateData = Pick<
  User,
  "first_name" | "middle_names" | "last_name" | "display_name" | "avatar_url"
>;
export type ApplicationUpdateData = Pick<
  Application,
  "name" | "description" | "configuration" | "status"
>;

/**
 * Type Mapping Utilities Class
 */
export class TypeMappers {
  /**
   * Convert database user to API response format
   */
  static userToApiResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    };
  }

  /**
   * Convert database user to extended API response
   */
  static userToExtendedApiResponse(user: User): UserResponseExtended {
    const baseResponse = this.userToApiResponse(user);
    return {
      ...baseResponse,
      full_name: this.getFullName(user),
      initials: this.getInitials(user),
    };
  }

  /**
   * Convert database user to auth user format
   */
  static userToAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      role: user.role,
    };
  }

  /**
   * Convert Supabase user directly to AuthUser format
   */
  static supabaseUserToAuthUser(supabaseUser: SupabaseUser, dbUser?: any): AuthUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      first_name: dbUser?.first_name || supabaseUser.user_metadata?.first_name || undefined,
      last_name: dbUser?.last_name || supabaseUser.user_metadata?.last_name || undefined,
      display_name: dbUser?.display_name ||
        supabaseUser.user_metadata?.display_name ||
        supabaseUser.user_metadata?.full_name || undefined,
      avatar_url: dbUser?.avatar_url || supabaseUser.user_metadata?.avatar_url || undefined,
      role: dbUser?.role || "user",
    };
  }

  /**
   * Convert Supabase user to our database user format
   */
  static supabaseUserToUser(supabaseUser: SupabaseUser, dbUser?: Partial<User>): User {
    const now = new Date().toISOString();

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      first_name: dbUser?.first_name || supabaseUser.user_metadata?.first_name,
      middle_names: dbUser?.middle_names ?? null,
      last_name: dbUser?.last_name || supabaseUser.user_metadata?.last_name,
      display_name: dbUser?.display_name ||
        supabaseUser.user_metadata?.display_name ||
        supabaseUser.user_metadata?.full_name,
      avatar_url: dbUser?.avatar_url || supabaseUser.user_metadata?.avatar_url,
      role: dbUser?.role || "user",
      created_at: dbUser?.created_at || supabaseUser.created_at || now,
      updated_at: dbUser?.updated_at || supabaseUser.updated_at || supabaseUser.created_at || now,
    };
  }

  /**
   * Convert database application to API response format
   */
  static applicationToApiResponse(application: Application): ApplicationResponse {
    return {
      id: application.id,
      name: application.name,
      description: application.description,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
    };
  }

  /**
   * Convert database application to extended API response
   */
  static applicationToExtendedApiResponse(
    application: Application,
    ownerName?: string,
    reviewCount?: number,
  ): ApplicationResponseExtended {
    const baseResponse = this.applicationToApiResponse(application);
    return {
      ...baseResponse,
      owner_name: ownerName,
      review_count: reviewCount,
    };
  }

  /**
   * Safe conversion with error handling
   */
  static safeUserToApiResponse(user: unknown): UserResponse | null {
    try {
      if (!user || typeof user !== "object") return null;

      const u = user as User;
      if (!u.id || !u.email) return null;

      return this.userToApiResponse(u);
    } catch (error) {
      console.error("Failed to convert user to API response:", error);
      return null;
    }
  }

  /**
   * Safe conversion with error handling
   */
  static safeUserToAuthUser(user: unknown): AuthUser | null {
    try {
      if (!user || typeof user !== "object") return null;

      const u = user as User;
      if (!u.id || !u.email) return null;

      return this.userToAuthUser(u);
    } catch (error) {
      console.error("Failed to convert user to auth user:", error);
      return null;
    }
  }

  /**
   * Helper: Get full name from user
   */
  static getFullName(user: User): string {
    if (user.display_name?.trim()) return user.display_name.trim();

    const parts = [user.first_name, user.middle_names, user.last_name]
      .filter((part) => part && part.trim().length > 0)
      .map((part) => part!.trim());

    if (parts.length > 0) return parts.join(" ");

    // Fallback to email local part
    if (user.email) {
      return user.email.split("@")[0];
    }
    
    // Final fallback
    return "Anonymous User";
  }

  /**
   * Helper: Get initials from user
   */
  static getInitials(user: User): string {
    const name = this.getFullName(user);
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }

  /**
   * Helper: Check if user has admin role
   */
  static isAdmin(user: User | AuthUser): boolean {
    return user.role === "admin";
  }

  /**
   * Helper: Check if user has admin role (moderator role removed from schema)
   */
  static isModerator(user: User | AuthUser): boolean {
    return user.role === "admin";
  }

  /**
   * Helper: Get user display name with fallback
   */
  static getDisplayName(user: User | AuthUser): string {
    return user.display_name || this.getFullName(user as User) || user.email || "Anonymous User";
  }

  /**
   * Batch convert users to API responses
   */
  static usersToApiResponses(users: User[]): UserResponse[] {
    return users.map((user) => this.userToApiResponse(user));
  }

  /**
   * Batch convert users to extended API responses
   */
  static usersToExtendedApiResponses(users: User[]): UserResponseExtended[] {
    return users.map((user) => this.userToExtendedApiResponse(user));
  }

  /**
   * Batch convert applications to API responses
   */
  static applicationsToApiResponses(applications: Application[]): ApplicationResponse[] {
    return applications.map((app) => this.applicationToApiResponse(app));
  }
}
