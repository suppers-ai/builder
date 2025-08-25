import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SignInData,
  SignUpData,
  ResetPasswordData,
  AuthMethodResult,
  AuthMethodsInterface,
  ManagerDependencies,
  SessionManagerInterface,
} from "./types.ts";
import {
  withSupabaseTimeout,
  handleSupabaseError,
  logError,
  logInfo,
  isValidEmail,
  isValidPassword,
  sanitizeUserInput,
} from "./utils.ts";

/**
 * Authentication methods manager
 * Handles sign in, sign up, password reset, OAuth, and sign out functionality
 */
export class AuthMethods implements AuthMethodsInterface {
  private supabase!: SupabaseClient;
  private dependencies!: ManagerDependencies;
  private sessionManager?: SessionManagerInterface;

  /**
   * Initialize the auth methods manager
   */
  initialize(dependencies: ManagerDependencies): void {
    this.dependencies = dependencies;
    this.supabase = dependencies.supabase;
    logInfo("AuthMethods", "Initialized successfully");
  }

  /**
   * Set session manager reference for storage operations
   */
  setSessionManager(sessionManager: SessionManagerInterface): void {
    this.sessionManager = sessionManager;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // No cleanup needed for auth methods
    logInfo("AuthMethods", "Destroyed");
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthMethodResult> {
    try {
      logInfo("AuthMethods", "Starting sign in process");

      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      // Validate input data
      const validationError = this.validateSignInData(data);
      if (validationError) {
        return { error: validationError };
      }

      // Sanitize email input
      const sanitizedEmail = sanitizeUserInput(data.email.toLowerCase().trim());

      // Perform sign in with timeout
      const signInOperation = this.supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: data.password,
      });

      const { error } = await withSupabaseTimeout(
        signInOperation,
        10000,
        "Sign in operation"
      );

      if (error) {
        const userFriendlyError = handleSupabaseError(error);
        logError("AuthMethods", "Sign in failed", { error: error.message });
        return { error: userFriendlyError };
      }

      logInfo("AuthMethods", "Sign in successful");
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      logError("AuthMethods", "Sign in error", { error: errorMessage });
      return { error: errorMessage };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<AuthMethodResult> {
    try {
      logInfo("AuthMethods", "Starting sign up process");

      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      // Validate input data
      const validationError = this.validateSignUpData(data);
      if (validationError) {
        return { error: validationError };
      }

      // Sanitize input data
      const sanitizedEmail = sanitizeUserInput(data.email.toLowerCase().trim());
      const sanitizedFirstName = data.first_name ? sanitizeUserInput(data.first_name) : "";
      const sanitizedLastName = data.last_name ? sanitizeUserInput(data.last_name) : "";
      const sanitizedDisplayName = data.display_name ? sanitizeUserInput(data.display_name) : "";

      // Perform sign up with timeout
      const signUpOperation = this.supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          data: {
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
            display_name: sanitizedDisplayName,
          },
        },
      });

      const { error } = await withSupabaseTimeout(
        signUpOperation,
        10000,
        "Sign up operation"
      );

      if (error) {
        const userFriendlyError = handleSupabaseError(error);
        logError("AuthMethods", "Sign up failed", { error: error.message });
        return { error: userFriendlyError };
      }

      logInfo("AuthMethods", "Sign up successful");
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      logError("AuthMethods", "Sign up error", { error: errorMessage });
      return { error: errorMessage };
    }
  }

  /**
   * Reset password for email
   */
  async resetPassword(data: ResetPasswordData): Promise<AuthMethodResult> {
    try {
      logInfo("AuthMethods", "Starting password reset process");

      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      // Validate email
      if (!data.email || !isValidEmail(data.email)) {
        return { error: "Please enter a valid email address" };
      }

      // Sanitize email input
      const sanitizedEmail = sanitizeUserInput(data.email.toLowerCase().trim());

      // Perform password reset with timeout
      const resetOperation = this.supabase.auth.resetPasswordForEmail(sanitizedEmail);

      const { error } = await withSupabaseTimeout(
        resetOperation,
        10000,
        "Password reset operation"
      );

      if (error) {
        const userFriendlyError = handleSupabaseError(error);
        logError("AuthMethods", "Password reset failed", { error: error.message });
        return { error: userFriendlyError };
      }

      logInfo("AuthMethods", "Password reset email sent successfully");
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      logError("AuthMethods", "Password reset error", { error: errorMessage });
      return { error: errorMessage };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      logInfo("AuthMethods", "Starting sign out process");

      if (this.supabase) {
        // Perform sign out with timeout
        const signOutOperation = this.supabase.auth.signOut();

        await withSupabaseTimeout(
          signOutOperation,
          5000,
          "Sign out operation"
        );
      }

      // Handle sign out via session manager (clears storage and emits logout event)
      if (this.sessionManager) {
        this.sessionManager.handleSignOut();
      }

      logInfo("AuthMethods", "Sign out successful");
    } catch (error) {
      // Don't throw error for sign out - just log it and still clear storage
      const errorMessage = error instanceof Error ? error.message : "Sign out error";
      logError("AuthMethods", "Sign out error (continuing anyway)", { error: errorMessage });
      
      // Still try to handle sign out even if Supabase sign out failed
      if (this.sessionManager) {
        this.sessionManager.handleSignOut();
      }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: string, redirectTo?: string): Promise<AuthMethodResult> {
    try {
      logInfo("AuthMethods", "Starting OAuth sign in", { provider });

      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      // Validate provider
      const validProviders = ["google", "github", "discord", "facebook"];
      if (!validProviders.includes(provider.toLowerCase())) {
        return { error: `Unsupported OAuth provider: ${provider}` };
      }

      // Determine redirect URL
      const redirectUrl = redirectTo || (typeof globalThis !== "undefined" && globalThis.location?.origin) || "";
      
      if (!redirectUrl) {
        return { error: "No redirect URL available for OAuth" };
      }

      // Perform OAuth sign in with timeout
      const oauthOperation = this.supabase.auth.signInWithOAuth({
        provider: provider as "google" | "github" | "discord" | "facebook",
        options: {
          redirectTo: redirectUrl,
        },
      });

      const { error } = await withSupabaseTimeout(
        oauthOperation,
        10000,
        "OAuth sign in operation"
      );

      if (error) {
        const userFriendlyError = handleSupabaseError(error);
        logError("AuthMethods", "OAuth sign in failed", { provider, error: error.message });
        return { error: userFriendlyError };
      }

      logInfo("AuthMethods", "OAuth sign in initiated successfully", { provider });
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      logError("AuthMethods", "OAuth sign in error", { provider, error: errorMessage });
      return { error: errorMessage };
    }
  }

  /**
   * Validate sign in data
   */
  private validateSignInData(data: SignInData): string | null {
    if (!data.email || !data.password) {
      return "Email and password are required";
    }

    if (!isValidEmail(data.email)) {
      return "Please enter a valid email address";
    }

    if (data.password.length < 1) {
      return "Password is required";
    }

    return null;
  }

  /**
   * Validate sign up data
   */
  private validateSignUpData(data: SignUpData): string | null {
    if (!data.email || !data.password) {
      return "Email and password are required";
    }

    if (!isValidEmail(data.email)) {
      return "Please enter a valid email address";
    }

    const passwordValidation = isValidPassword(data.password);
    if (!passwordValidation.valid) {
      return passwordValidation.message || "Invalid password";
    }

    // Validate optional name fields if provided
    if (data.first_name && data.first_name.length > 100) {
      return "First name must be less than 100 characters";
    }

    if (data.last_name && data.last_name.length > 100) {
      return "Last name must be less than 100 characters";
    }

    if (data.display_name && data.display_name.length > 100) {
      return "Display name must be less than 100 characters";
    }

    return null;
  }
}