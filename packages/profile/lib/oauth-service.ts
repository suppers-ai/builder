import { apiClient, type Tables, type TablesInsert, type TablesUpdate } from "./api-client.ts";
import { AuthHelpers } from "./auth-helpers.ts";

// TODO: This entire OAuthService needs to be refactored to use API client instead of direct Supabase calls
// Most methods in this class are still using supabase directly and need to be updated

export interface OAuthParams {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  responseType: "code" | "token";
}

export interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface AuthorizationRequest {
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
  responseType: "code";
  userId?: string;
}

export interface ClientRegistrationData {
  name: string;
  description?: string;
  redirectUris: string[];
  allowedScopes: string[];
  createdBy: string;
}

export class OAuthService {
  private static readonly DEFAULT_SCOPES = ["openid", "email", "profile"];
  private static readonly CODE_EXPIRY_MINUTES = 10;
  private static readonly TOKEN_EXPIRY_HOURS = 1;
  private static readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;

  /**
   * Generate OAuth authorization URL
   */
  static generateAuthUrl(params: OAuthParams): string {
    const { clientId, redirectUri, scope, state, responseType } = params;

    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      response_type: responseType,
    });

    return `${globalThis.location?.origin}/oauth/authorize?${authParams.toString()}`;
  }

  /**
   * Create authorization code for OAuth flow
   */
  static async createAuthorizationCode(request: AuthorizationRequest): Promise<string> {
    const { clientId, redirectUri, scope, state, userId } = request;

    // Validate client exists and redirect URI is allowed
    const client = await this.getOAuthClient(clientId);
    if (!client) {
      throw new Error("Invalid client_id");
    }

    if (!client.redirect_uris.includes(redirectUri)) {
      throw new Error("Invalid redirect_uri");
    }

    // Validate scopes
    const requestedScopes = scope.split(" ");
    const invalidScopes = requestedScopes.filter((s) => !client.allowed_scopes.includes(s));
    if (invalidScopes.length > 0) {
      throw new Error(`Invalid scopes: ${invalidScopes.join(", ")}`);
    }

    // Generate authorization code
    const code = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Store authorization code
    const { error } = await apiClient.from("oauth_codes").insert({
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state: state || null,
      expires_at: expiresAt,
    });

    if (error) {
      throw new Error(`Failed to create authorization code: ${error.message}`);
    }

    return code;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<TokenResponse> {
    // Validate client credentials
    const client = await this.validateClientCredentials(clientId, clientSecret);
    if (!client) {
      throw new Error("Invalid client credentials");
    }

    // Get and validate authorization code
    // TODO: Implement proper query filtering in API client
    const { data: authCode, error: codeError } = await apiClient.from("oauth_codes").select("*");

    if (codeError || !authCode) {
      throw new Error("Invalid authorization code");
    }

    // Check if code has expired
    if (new Date(authCode.expires_at) < new Date()) {
      // Clean up expired code
      await apiClient.from("oauth_codes").delete();
      throw new Error("Authorization code has expired");
    }

    // Get current user session
    const session = await AuthHelpers.getCurrentSession();
    if (!session) {
      throw new Error("No active user session");
    }

    const user = session.user;

    // Generate tokens
    const accessToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();
    const expiresIn = this.TOKEN_EXPIRY_HOURS * 3600;

    // Create token record
    const tokenData = await this.createOAuthToken(
      user.id,
      clientId,
      accessToken,
      refreshToken,
      expiresIn,
    );

    // Clean up used authorization code
    await apiClient.from("oauth_codes").delete();

    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      refresh_token: refreshToken,
      scope: authCode.scope,
      user: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.display_name || user.user_metadata?.full_name || "",
        avatar_url: user.user_metadata?.avatar_url,
      },
    };
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  static async handleCallback(code: string, state: string): Promise<TokenResponse> {
    // This method is kept for backward compatibility
    // In practice, the token endpoint should be used for code exchange
    const session = await AuthHelpers.getCurrentSession();
    if (!session) {
      throw new Error("No active session found");
    }

    const user = session.user;

    return {
      access_token: session.access_token,
      token_type: "Bearer",
      expires_in: session.expires_in || 3600,
      refresh_token: session.refresh_token,
      scope: "openid email profile",
      user: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.display_name || user.user_metadata?.full_name || "",
        avatar_url: user.user_metadata?.avatar_url,
      },
    };
  }

  /**
   * Validate OAuth token and return user data
   */
  static async validateToken(token: string): Promise<Tables<"users">> {
    // Get token record from database
    const { data: tokenData, error: tokenError } = await supabase
      .from("oauth_tokens")
      .select("*")
      .eq("access_token", token)
      .single();

    if (tokenError || !tokenData) {
      throw new Error("Invalid token");
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      // Clean up expired token
      await supabase.from("oauth_tokens").delete().eq("access_token", token);
      throw new Error("Token has expired");
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", tokenData.user_id!)
      .single();

    if (userError || !userData) {
      throw new Error("User not found");
    }

    return userData;
  }

  /**
   * Refresh OAuth token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    // Get token record using refresh token
    const { data: tokenData, error: tokenError } = await supabase
      .from("oauth_tokens")
      .select("*")
      .eq("refresh_token", refreshToken)
      .single();

    if (tokenError || !tokenData) {
      throw new Error("Invalid refresh token");
    }

    // Check if refresh token is still valid (30 days from creation)
    const refreshExpiryDate = new Date(tokenData.created_at);
    refreshExpiryDate.setDate(refreshExpiryDate.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    if (refreshExpiryDate < new Date()) {
      // Clean up expired refresh token
      await supabase.from("oauth_tokens").delete().eq("refresh_token", refreshToken);
      throw new Error("Refresh token has expired");
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", tokenData.user_id!)
      .single();

    if (userError || !userData) {
      throw new Error("User not found");
    }

    // Generate new tokens
    const newAccessToken = crypto.randomUUID();
    const newRefreshToken = crypto.randomUUID();
    const expiresIn = this.TOKEN_EXPIRY_HOURS * 3600;

    // Update token record with new tokens
    const { data: updatedToken, error: updateError } = await supabase
      .from("oauth_tokens")
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      })
      .eq("refresh_token", refreshToken)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to refresh token: ${updateError.message}`);
    }

    return {
      access_token: newAccessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      refresh_token: newRefreshToken,
      scope: tokenData.scope,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.display_name ||
          `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
        avatar_url: userData.avatar_url,
      },
    };
  }

  /**
   * Validate client credentials
   */
  static async validateClientCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<Tables<"oauth_clients"> | null> {
    const { data, error } = await supabase
      .from("oauth_clients")
      .select("*")
      .eq("client_id", clientId)
      .eq("client_secret", clientSecret)
      .single();

    if (error) {
      console.error("Error validating client credentials:", error);
      return null;
    }

    return data;
  }

  /**
   * Get OAuth client information
   */
  static async getOAuthClient(clientId: string): Promise<Tables<"oauth_clients"> | null> {
    const { data, error } = await supabase
      .from("oauth_clients")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (error) {
      console.error("Error fetching OAuth client:", error);
      return null;
    }

    return data;
  }

  /**
   * Create OAuth token record
   */
  static async createOAuthToken(
    userId: string,
    clientId: string,
    accessToken: string,
    refreshToken?: string,
    expiresIn: number = 3600,
  ): Promise<Tables<"oauth_tokens">> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { data, error } = await supabase
      .from("oauth_tokens")
      .insert({
        user_id: userId,
        client_id: clientId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        scope: "openid email profile",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create OAuth token: ${error.message}`);
    }

    return data;
  }

  /**
   * Revoke OAuth token
   */
  static async revokeToken(token: string): Promise<void> {
    const { error } = await supabase
      .from("oauth_tokens")
      .delete()
      .eq("access_token", token);

    if (error) {
      throw new Error(`Failed to revoke token: ${error.message}`);
    }
  }

  /**
   * Register a new OAuth client
   */
  static async registerClient(data: ClientRegistrationData): Promise<Tables<"oauth_clients">> {
    // Generate client credentials
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();

    // Validate scopes
    const validScopes = [...this.DEFAULT_SCOPES, "admin", "read", "write"];
    const invalidScopes = data.allowedScopes.filter((scope) => !validScopes.includes(scope));
    if (invalidScopes.length > 0) {
      throw new Error(`Invalid scopes: ${invalidScopes.join(", ")}`);
    }

    // Validate redirect URIs
    for (const uri of data.redirectUris) {
      try {
        new URL(uri);
      } catch {
        throw new Error(`Invalid redirect URI: ${uri}`);
      }
    }

    const clientData: TablesInsert<"oauth_clients"> = {
      client_id: clientId,
      client_secret: clientSecret,
      name: data.name,
      description: data.description || null,
      redirect_uris: data.redirectUris,
      allowed_scopes: data.allowedScopes,
      created_by: data.createdBy,
    };

    const { data: client, error } = await supabase
      .from("oauth_clients")
      .insert(clientData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register client: ${error.message}`);
    }

    return client;
  }

  /**
   * Update OAuth client
   */
  static async updateClient(
    clientId: string,
    updates: Partial<
      Pick<ClientRegistrationData, "name" | "description" | "redirectUris" | "allowedScopes">
    >,
    updatedBy: string,
  ): Promise<Tables<"oauth_clients">> {
    // Get existing client
    const existingClient = await this.getOAuthClient(clientId);
    if (!existingClient) {
      throw new Error("Client not found");
    }

    // Validate scopes if provided
    if (updates.allowedScopes) {
      const validScopes = [...this.DEFAULT_SCOPES, "admin", "read", "write"];
      const invalidScopes = updates.allowedScopes.filter((scope) => !validScopes.includes(scope));
      if (invalidScopes.length > 0) {
        throw new Error(`Invalid scopes: ${invalidScopes.join(", ")}`);
      }
    }

    // Validate redirect URIs if provided
    if (updates.redirectUris) {
      for (const uri of updates.redirectUris) {
        try {
          new URL(uri);
        } catch {
          throw new Error(`Invalid redirect URI: ${uri}`);
        }
      }
    }

    const updateData: TablesUpdate<"oauth_clients"> = {
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.redirectUris && { redirect_uris: updates.redirectUris }),
      ...(updates.allowedScopes && { allowed_scopes: updates.allowedScopes }),
      updated_at: new Date().toISOString(),
    };

    const { data: client, error } = await supabase
      .from("oauth_clients")
      .update(updateData)
      .eq("client_id", clientId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update client: ${error.message}`);
    }

    return client;
  }

  /**
   * Delete OAuth client and all associated tokens
   */
  static async deleteClient(clientId: string): Promise<void> {
    // First, delete all tokens associated with this client
    await supabase
      .from("oauth_tokens")
      .delete()
      .eq("client_id", clientId);

    // Delete all authorization codes associated with this client
    await supabase
      .from("oauth_codes")
      .delete()
      .eq("client_id", clientId);

    // Finally, delete the client
    const { error } = await supabase
      .from("oauth_clients")
      .delete()
      .eq("client_id", clientId);

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }

  /**
   * List OAuth clients for a user
   */
  static async listClients(userId: string): Promise<Tables<"oauth_clients">[]> {
    const { data, error } = await supabase
      .from("oauth_clients")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list clients: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get client statistics (token count, active tokens, etc.)
   */
  static async getClientStats(clientId: string): Promise<{
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
  }> {
    const { data: tokens, error } = await supabase
      .from("oauth_tokens")
      .select("expires_at")
      .eq("client_id", clientId);

    if (error) {
      throw new Error(`Failed to get client stats: ${error.message}`);
    }

    const now = new Date();
    const activeTokens = tokens?.filter((token) => new Date(token.expires_at) > now).length || 0;
    const totalTokens = tokens?.length || 0;
    const expiredTokens = totalTokens - activeTokens;

    return {
      totalTokens,
      activeTokens,
      expiredTokens,
    };
  }

  /**
   * Regenerate client secret
   */
  static async regenerateClientSecret(clientId: string): Promise<string> {
    const newClientSecret = crypto.randomUUID();

    const { error } = await supabase
      .from("oauth_clients")
      .update({
        client_secret: newClientSecret,
        updated_at: new Date().toISOString(),
      })
      .eq("client_id", clientId);

    if (error) {
      throw new Error(`Failed to regenerate client secret: ${error.message}`);
    }

    // Revoke all existing tokens for this client for security
    await supabase
      .from("oauth_tokens")
      .delete()
      .eq("client_id", clientId);

    return newClientSecret;
  }

  /**
   * Validate state parameter for CSRF protection
   */
  static validateState(providedState: string, expectedState: string): boolean {
    if (!providedState || !expectedState) {
      return false;
    }
    return providedState === expectedState;
  }

  /**
   * Generate secure state parameter with timestamp for expiration
   */
  static generateState(): string {
    return crypto.randomUUID();
  }

  /**
   * Enhanced state validation with timing attack protection
   */
  static secureValidateState(providedState: string, expectedState: string): boolean {
    if (!providedState || !expectedState) {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    if (providedState.length !== expectedState.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < providedState.length; i++) {
      result |= providedState.charCodeAt(i) ^ expectedState.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Validate state parameter format for security
   */
  static isValidStateFormat(state: string): boolean {
    if (!state) return false;

    // State should be a UUID for security
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(state);
  }

  /**
   * Generate cryptographically secure random string
   */
  static generateSecureRandomString(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
}
