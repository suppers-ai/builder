import { apiClient, type Session, type User } from "./api-client.ts";
import type { OAuthProvider } from "@suppers/shared";
import type {
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
  AuthState,
} from "@suppers/shared";

export class AuthHelpers {
  /**
   * Sign up a new user
   */
  static async signUp(data: SignUpData) {
    const { email, password, firstName, middleNames, lastName, displayName } = data;

    const { data: authData, error } = await apiClient.auth.signUp({
      email,
      password,
      // TODO: Handle additional user metadata in API
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData) {
    const { email, password } = data;

    const { data: authData, error } = await apiClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    const { error } = await apiClient.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Sign in with OAuth provider
   * TODO: Implement OAuth flow through API endpoints
   */
  static async signInWithOAuth(provider: OAuthProvider, redirectTo?: string) {
    // OAuth flow needs to be handled through the API package OAuth endpoints
    throw new Error("OAuth sign-in should use API package OAuth endpoints");
  }

  /**
   * Send password reset email
   * TODO: Implement password reset through API endpoints
   */
  static async resetPassword(data: ResetPasswordData) {
    // Password reset needs to be implemented in API package
    throw new Error("Password reset should use API package endpoints");
  }

  /**
   * Update user password
   * TODO: Implement password update through API endpoints
   */
  static async updatePassword(newPassword: string) {
    // Password update needs to be implemented in API package
    throw new Error("Password update should use API package endpoints");
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await apiClient.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  /**
   * Get current session
   * TODO: Implement session retrieval through API endpoints
   */
  static async getCurrentSession() {
    // Session retrieval needs to be implemented in API package
    throw new Error("Session retrieval should use API package endpoints");
  }

  /**
   * Update user metadata
   * TODO: Implement user update through API endpoints
   */
  static async updateUser(data: UpdateUserData) {
    // User metadata updates need to be implemented in API package
    throw new Error("User update should use API package endpoints");
  }

  /**
   * Upload user avatar
   * TODO: Implement file upload through API endpoints
   */
  static async uploadAvatar(file: File, userId: string) {
    // File uploads need to be implemented in API package
    throw new Error("File upload should use API package endpoints");
  }

  /**
   * Listen to auth state changes
   * TODO: Implement auth state changes through API endpoints or WebSocket
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // Auth state changes need to be implemented using API polling or WebSocket
    throw new Error("Auth state changes should use API package endpoints");
  }

  /**
   * Generate OAuth authorization URL for external apps
   */
  static generateOAuthUrl(provider: OAuthProvider, redirectTo: string, state?: string) {
    const params = new URLSearchParams({
      provider,
      redirect_to: redirectTo,
    });

    if (state) {
      params.set("state", state);
    }

    return `${globalThis.location?.origin}/auth/oauth?${params.toString()}`;
  }

  /**
   * Validate OAuth state parameter
   */
  static validateOAuthState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  /**
   * Create JWT token for external app
   * TODO: Implement JWT token creation through API endpoints
   */
  static async createJWTToken(
    user: User,
    clientId: string,
    scope: string = "openid email profile",
  ) {
    // JWT token creation needs to be handled by API package
    throw new Error("JWT token creation should use API package endpoints");
  }
}