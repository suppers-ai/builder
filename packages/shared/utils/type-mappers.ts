/**
 * Type Mapping Utilities
 * Functions to convert between database types and API/auth formats
 */

import type { Database } from "../generated/database-types.ts";

// Database table types
type UsersTable = Database["public"]["Tables"]["users"]["Row"];
type ApplicationsTable = Database["public"]["Tables"]["applications"]["Row"];
type ApplicationReviewsTable = Database["public"]["Tables"]["application_reviews"]["Row"];
type CustomThemesTable = Database["public"]["Tables"]["custom_themes"]["Row"];
type EntitiesTable = Database["public"]["Tables"]["entities"]["Row"];
type ProductsTable = Database["public"]["Tables"]["products"]["Row"];
type VariablesTable = Database["public"]["Tables"]["variables"]["Row"];
type PricingProductsTable = Database["public"]["Tables"]["pricing_products"]["Row"];
type PricingPricesTable = Database["public"]["Tables"]["pricing_prices"]["Row"];
type PricingFormulasTable = Database["public"]["Tables"]["pricing_formulas"]["Row"];
type BillingConfigsTable = Database["public"]["Tables"]["billing_configs"]["Row"];
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Re-export database types as canonical types
export type User = UsersTable;
export type Application = ApplicationsTable;
export type ApplicationReview = ApplicationReviewsTable;
export type CustomTheme = CustomThemesTable;
export type Entity = EntitiesTable;
export type Product = ProductsTable;
export type Variable = VariablesTable;
export type PricingProduct = PricingProductsTable;
export type PricingPrice = PricingPricesTable;
export type PricingFormula = PricingFormulasTable;
export type BillingConfig = BillingConfigsTable;

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

export type EntityResponse = Pick<
  Entity,
  "id" | "name" | "description" | "status" | "verified" | "created_at" | "updated_at"
>;

export interface EntityResponseExtended extends EntityResponse {
  owner_name?: string;
  product_count?: number;
  application_count?: number;
}

export type ProductResponse = Pick<
  Product,
  "id" | "name" | "description" | "status" | "created_at" | "updated_at"
>;

export interface ProductResponseExtended extends ProductResponse {
  seller_name?: string;
  entity_name?: string;
  category_name?: string;
}

// Update operation types (derived from database types)
export type UserUpdateData = Pick<
  User,
  | "first_name"
  | "last_name"
  | "display_name"
  | "avatar_url"
  | "theme_id"
  | "stripe_customer_id"
  | "role"
>;
export type ApplicationUpdateData = Pick<
  Application,
  "name" | "description" | "status" | "slug" | "thumbnail_url" | "website_url"
>;
export type EntityUpdateData = Pick<
  Entity,
  "name" | "description" | "type" | "sub_type" | "status" | "verified" | "connected_application_ids" | "metadata" | "location"
>;
export type ProductUpdateData = Pick<
  Product,
  "name" | "description" | "type" | "sub_type" | "status" | "entity_id" | "metadata"
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
   * Convert Supabase user to our database user format
   */
  static supabaseUserToUser(supabaseUser: SupabaseUser, existingUser?: Partial<User>): User {
    const now = new Date().toISOString();

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      first_name: existingUser?.first_name || supabaseUser.user_metadata?.first_name || null,
      last_name: existingUser?.last_name || supabaseUser.user_metadata?.last_name || null,
      display_name: existingUser?.display_name ||
        supabaseUser.user_metadata?.display_name ||
        supabaseUser.user_metadata?.full_name || null,
      avatar_url: existingUser?.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
      theme_id: existingUser?.theme_id || supabaseUser.user_metadata?.theme_id || null,
      stripe_customer_id: existingUser?.stripe_customer_id || null,
      role: (existingUser?.role as "user" | "admin") || "user",
      status: existingUser?.status || "active",
      bandwidth_limit: existingUser?.bandwidth_limit || 1073741824, // 1GB default
      bandwidth_used: existingUser?.bandwidth_used || 0,
      storage_limit: existingUser?.storage_limit || 1073741824, // 1GB default
      storage_used: existingUser?.storage_used || 0,
      created_at: existingUser?.created_at || supabaseUser.created_at || now,
      updated_at: existingUser?.updated_at || supabaseUser.updated_at || supabaseUser.created_at ||
        now,
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
   * Convert database place to API response format
   */
  static entityToApiResponse(entity: Entity): EntityResponse {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      verified: entity.verified,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  /**
   * Convert database place to extended API response
   */
  static entityToExtendedApiResponse(
    entity: Entity,
    ownerName?: string,
    productCount?: number,
    applicationCount?: number,
  ): EntityResponseExtended {
    const baseResponse = this.entityToApiResponse(entity);
    return {
      ...baseResponse,
      owner_name: ownerName,
      product_count: productCount,
      application_count: applicationCount,
    };
  }

  /**
   * Convert database product to API response format
   */
  static productToApiResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      status: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }

  /**
   * Convert database product to extended API response
   */
  static productToExtendedApiResponse(
    product: Product,
    sellerName?: string,
    entityName?: string,
    categoryName?: string,
  ): ProductResponseExtended {
    const baseResponse = this.productToApiResponse(product);
    return {
      ...baseResponse,
      seller_name: sellerName,
      entity_name: entityName,
      category_name: categoryName,
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
   * Safe conversion for places
   */
  static safeEntityToApiResponse(entity: Entity): EntityResponse | null {
    try {
      if (!entity || typeof entity !== "object") return null;

      if (!entity.id || !entity.name) return null;

      return this.entityToApiResponse(entity);
    } catch (error) {
      console.error("Failed to convert entity to API response:", error);
      return null;
    }
  }

  /**
   * Safe conversion for products
   */
  static safeProductToApiResponse(product: unknown): ProductResponse | null {
    try {
      if (!product || typeof product !== "object") return null;

      const p = product as Product;
      if (!p.id || !p.name) return null;

      return this.productToApiResponse(p);
    } catch (error) {
      console.error("Failed to convert product to API response:", error);
      return null;
    }
  }

  /**
   * Helper: Get full name from user
   */
  static getFullName(user: User): string {
    if (user.display_name?.trim()) return user.display_name.trim();

    const parts = [user.first_name, user.last_name]
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
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  /**
   * Helper: Check if user has admin role
   */
  static isAdmin(user: User): boolean {
    return user.role === "admin";
  }

  /**
   * Helper: Get user display name with fallback
   */
  static getDisplayName(user: User): string {
    return user.display_name || this.getFullName(user) || user.email || "Unknown User";
  }
}
