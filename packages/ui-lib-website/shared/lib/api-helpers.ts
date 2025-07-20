import { supabase } from "./supabase-client.ts";
import type { Tables, TablesInsert, TablesUpdate } from "./supabase-client.ts";

export type User = Tables<"users">;
export type Application = Tables<"applications">;
export type UserAccess = Tables<"user_access">;
export type ApplicationReview = Tables<"application_reviews">;
export type CustomTheme = Tables<"custom_themes">;

export interface CreateApplicationData {
  name: string;
  description?: string;
  templateId: string;
  configuration: Record<string, unknown>;
  status?: "draft" | "pending" | "published" | "archived";
}

export interface UpdateApplicationData {
  name?: string;
  description?: string;
  templateId?: string;
  configuration?: Record<string, unknown>;
  status?: "draft" | "pending" | "published" | "archived";
}

export interface CreateReviewData {
  applicationId: string;
  action: "approved" | "rejected";
  feedback?: string;
}

export interface GrantAccessData {
  applicationId: string;
  userId: string;
  accessLevel: "read" | "write" | "admin";
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  middleNames?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface CreateCustomThemeData {
  name: string;
  label: string;
  description?: string;
  variables: Record<string, string | number>;
  is_public?: boolean;
}

export interface UpdateCustomThemeData {
  name?: string;
  label?: string;
  description?: string;
  variables?: Record<string, string | number>;
  is_public?: boolean;
}

/**
 * Helper functions for user name handling
 */
export class UserNameHelpers {
  /**
   * Get full name from user object
   */
  static getFullName(user: User): string {
    if (user.display_name) {
      return user.display_name;
    }

    const parts = [user.first_name, user.middle_names, user.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.email;
  }

  /**
   * Get display name or fallback to computed name
   */
  static getDisplayName(user: User): string {
    return user.display_name || this.getFullName(user) || user.email;
  }

  /**
   * Get first and last name combined
   */
  static getFirstLastName(user: User): string {
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.email;
  }

  /**
   * Get initials from user name
   */
  static getInitials(user: User): string {
    const name = this.getDisplayName(user);
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }

  /**
   * Parse full name into components
   */
  static parseFullName(
    fullName: string,
  ): { firstName?: string; middleNames?: string; lastName?: string } {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 0) return {};
    if (parts.length === 1) return { firstName: parts[0] };
    if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };

    return {
      firstName: parts[0],
      middleNames: parts.slice(1, -1).join(" "),
      lastName: parts[parts.length - 1],
    };
  }
}

export class ApiHelpers {
  /**
   * Get user information
   */
  static async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No user found
      }
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Create or update user information
   */
  static async upsertUser(userData: TablesInsert<"users">): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .upsert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update user information
   */
  static async updateUser(userId: string, updates: UpdateUserData): Promise<User> {
    const updateData: TablesUpdate<"users"> = {};

    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.middleNames !== undefined) updateData.middle_names = updates.middleNames;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get user applications
   */
  static async getUserApplications(userId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Get application by ID
   */
  static async getApplication(applicationId: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No application found
      }
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Create new application
   */
  static async createApplication(
    userId: string,
    applicationData: CreateApplicationData,
  ): Promise<Application> {
    const { name, description, templateId, configuration, status = "draft" } = applicationData;

    const { data, error } = await supabase
      .from("applications")
      .insert({
        owner_id: userId,
        name,
        description,
        template_id: templateId,
        configuration: configuration as any,
        status,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update application
   */
  static async updateApplication(
    applicationId: string,
    updates: UpdateApplicationData,
  ): Promise<Application> {
    const updateData: TablesUpdate<"applications"> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.templateId !== undefined) updateData.template_id = updates.templateId;
    if (updates.configuration !== undefined) {
      updateData.configuration = updates.configuration as any;
    }
    if (updates.status !== undefined) updateData.status = updates.status;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Delete application
   */
  static async deleteApplication(applicationId: string): Promise<void> {
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Grant user access to application
   */
  static async grantAccess(grantData: GrantAccessData, grantedBy: string): Promise<UserAccess> {
    const { applicationId, userId, accessLevel } = grantData;

    const { data, error } = await supabase
      .from("user_access")
      .insert({
        application_id: applicationId,
        user_id: userId,
        access_level: accessLevel,
        granted_by: grantedBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Revoke user access to application
   */
  static async revokeAccess(applicationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("user_access")
      .delete()
      .eq("application_id", applicationId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get user access for application
   */
  static async getUserAccess(applicationId: string, userId: string): Promise<UserAccess | null> {
    const { data, error } = await supabase
      .from("user_access")
      .select("*")
      .eq("application_id", applicationId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No access found
      }
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Get all users with access to application
   */
  static async getApplicationUsers(
    applicationId: string,
  ): Promise<(UserAccess & { user: User })[]> {
    const { data, error } = await supabase
      .from("user_access")
      .select(`
        *,
        users!user_access_user_id_fkey (*)
      `)
      .eq("application_id", applicationId);

    if (error) {
      throw new Error(error.message);
    }

    return data?.map((item) => ({
      ...item,
      user: item.users as User,
    })) || [];
  }

  /**
   * Check if user has access to application
   */
  static async hasAccess(
    applicationId: string,
    userId: string,
    requiredLevel: "read" | "write" | "admin" = "read",
  ): Promise<boolean> {
    const access = await this.getUserAccess(applicationId, userId);

    if (!access) {
      return false;
    }

    const levels = ["read", "write", "admin"];
    const userLevel = levels.indexOf(access.access_level);
    const requiredLevelIndex = levels.indexOf(requiredLevel);

    return userLevel >= requiredLevelIndex;
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data?.role === "admin";
  }

  /**
   * Get all published applications (public API) with performance optimizations
   */
  static async getPublishedApplications(
    searchQuery?: string,
    filters?: Record<string, string>,
  ): Promise<Application[]> {
    let query = supabase
      .from("applications")
      .select(`
        *,
        users!applications_owner_id_fkey (
          id,
          display_name,
          first_name,
          last_name,
          email
        )
      `)
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    // Apply search if provided
    if (searchQuery && searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Apply filters if provided
    if (filters?.template) {
      query = query.eq("template_id", filters.template);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Get pending applications (admin only)
   */
  static async getPendingApplications(): Promise<Application[]> {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        users!applications_owner_id_fkey (
          id,
          display_name,
          first_name,
          last_name,
          email
        )
      `)
      .eq("status", "pending")
      .order("updated_at", { ascending: true }); // Oldest first for review queue

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Submit application for review
   */
  static async submitForReview(applicationId: string): Promise<Application> {
    const { data, error } = await supabase
      .from("applications")
      .update({ status: "pending" })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Approve application (admin only)
   */
  static async approveApplication(
    applicationId: string,
    reviewerId: string,
    feedback?: string,
  ): Promise<Application> {
    // Update application status to published
    const { data: application, error: appError } = await supabase
      .from("applications")
      .update({ status: "published" })
      .eq("id", applicationId)
      .select()
      .single();

    if (appError) {
      throw new Error(appError.message);
    }

    // Create review record
    const { error: reviewError } = await supabase
      .from("application_reviews")
      .insert({
        application_id: applicationId,
        reviewer_id: reviewerId,
        action: "approved",
        feedback: feedback || null,
      });

    if (reviewError) {
      console.error("Error creating review record:", reviewError);
    }

    return application;
  }

  /**
   * Reject application (admin only)
   */
  static async rejectApplication(
    applicationId: string,
    reviewerId: string,
    feedback: string,
  ): Promise<Application> {
    // Update application status back to draft
    const { data: application, error: appError } = await supabase
      .from("applications")
      .update({ status: "draft" })
      .eq("id", applicationId)
      .select()
      .single();

    if (appError) {
      throw new Error(appError.message);
    }

    // Create review record
    const { error: reviewError } = await supabase
      .from("application_reviews")
      .insert({
        application_id: applicationId,
        reviewer_id: reviewerId,
        action: "rejected",
        feedback,
      });

    if (reviewError) {
      console.error("Error creating review record:", reviewError);
    }

    return application;
  }

  /**
   * Get application reviews
   */
  static async getApplicationReviews(applicationId: string): Promise<ApplicationReview[]> {
    const { data, error } = await supabase
      .from("application_reviews")
      .select(`
        *,
        users!application_reviews_reviewer_id_fkey (
          id,
          display_name,
          first_name,
          last_name,
          email
        )
      `)
      .eq("application_id", applicationId)
      .order("reviewed_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Get all applications (admin only)
   */
  static async getAllApplicationsAdmin(filters?: Record<string, string>): Promise<Application[]> {
    let query = supabase
      .from("applications")
      .select(`
        *,
        users!applications_owner_id_fkey (
          id,
          display_name,
          first_name,
          last_name,
          email
        )
      `)
      .order("updated_at", { ascending: false });

    // Apply filters if provided
    if (filters?.status && ["draft", "pending", "published", "archived"].includes(filters.status)) {
      query = query.eq("status", filters.status as "draft" | "pending" | "published" | "archived");
    }

    if (filters?.template) {
      query = query.eq("template_id", filters.template);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // =============================================
  // CUSTOM THEMES
  // =============================================

  /**
   * Get all custom themes (own + public)
   */
  static async getCustomThemes(): Promise<CustomTheme[]> {
    const { data, error } = await supabase
      .from("custom_themes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch custom themes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get user's own custom themes
   */
  static async getUserCustomThemes(): Promise<CustomTheme[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("custom_themes")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user custom themes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get public custom themes
   */
  static async getPublicCustomThemes(): Promise<CustomTheme[]> {
    const { data, error } = await supabase
      .from("custom_themes")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch public custom themes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific custom theme by ID
   */
  static async getCustomTheme(id: string): Promise<CustomTheme> {
    const { data, error } = await supabase
      .from("custom_themes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch custom theme: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new custom theme
   */
  static async createCustomTheme(themeData: CreateCustomThemeData): Promise<CustomTheme> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("custom_themes")
      .insert([{
        ...themeData,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create custom theme: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a custom theme
   */
  static async updateCustomTheme(id: string, updates: UpdateCustomThemeData): Promise<CustomTheme> {
    const { data, error } = await supabase
      .from("custom_themes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update custom theme: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a custom theme
   */
  static async deleteCustomTheme(id: string): Promise<void> {
    const { error } = await supabase
      .from("custom_themes")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete custom theme: ${error.message}`);
    }
  }
}
