import { supabase, type Tables, type TablesInsert, type TablesUpdate } from "./supabase-client.ts";

export interface TokenInfo {
  token: Tables<"oauth_tokens">;
  isExpired: boolean;
  expiresIn: number; // seconds until expiration
  canRefresh: boolean;
}

export class TokenManager {
  private static readonly TOKEN_EXPIRY_HOURS = 1;
  private static readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;
  private static readonly CLEANUP_BATCH_SIZE = 100;

  /**
   * Get token information including expiration status
   */
  static async getTokenInfo(accessToken: string): Promise<TokenInfo | null> {
    const { data: token, error } = await supabase
      .from("oauth_tokens")
      .select("*")
      .eq("access_token", accessToken)
      .single();

    if (error || !token) {
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(token.expires_at);
    const createdAt = new Date(token.created_at);
    
    const isExpired = expiresAt <= now;
    const expiresIn = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    
    // Check if refresh token is still valid (30 days from creation)
    const refreshExpiryDate = new Date(createdAt);
    refreshExpiryDate.setDate(refreshExpiryDate.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);
    const canRefresh = refreshExpiryDate > now && token.refresh_token !== null;

    return {
      token,
      isExpired,
      expiresIn,
      canRefresh,
    };
  }

  /**
   * Extend token expiration (for active sessions)
   */
  static async extendToken(accessToken: string, extensionHours: number = 1): Promise<Tables<"oauth_tokens"> | null> {
    const tokenInfo = await this.getTokenInfo(accessToken);
    if (!tokenInfo || tokenInfo.isExpired) {
      return null;
    }

    const newExpiresAt = new Date(Date.now() + extensionHours * 60 * 60 * 1000);

    const { data: updatedToken, error } = await supabase
      .from("oauth_tokens")
      .update({
        expires_at: newExpiresAt.toISOString(),
      })
      .eq("access_token", accessToken)
      .select()
      .single();

    if (error) {
      console.error("Failed to extend token:", error);
      return null;
    }

    return updatedToken;
  }

  /**
   * Revoke all tokens for a user
   */
  static async revokeUserTokens(userId: string): Promise<void> {
    const { error } = await supabase
      .from("oauth_tokens")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to revoke user tokens: ${error.message}`);
    }
  }

  /**
   * Revoke all tokens for a client
   */
  static async revokeClientTokens(clientId: string): Promise<void> {
    const { error } = await supabase
      .from("oauth_tokens")
      .delete()
      .eq("client_id", clientId);

    if (error) {
      throw new Error(`Failed to revoke client tokens: ${error.message}`);
    }
  }

  /**
   * Clean up expired tokens and authorization codes
   */
  static async cleanupExpiredTokens(): Promise<{
    tokensDeleted: number;
    codesDeleted: number;
  }> {
    const now = new Date().toISOString();
    
    // Clean up expired tokens in batches
    let tokensDeleted = 0;
    let hasMoreTokens = true;
    
    while (hasMoreTokens) {
      const { data: expiredTokens, error: tokenSelectError } = await supabase
        .from("oauth_tokens")
        .select("id")
        .lt("expires_at", now)
        .limit(this.CLEANUP_BATCH_SIZE);

      if (tokenSelectError || !expiredTokens || expiredTokens.length === 0) {
        hasMoreTokens = false;
        break;
      }

      const tokenIds = expiredTokens.map(token => token.id);
      const { error: tokenDeleteError } = await supabase
        .from("oauth_tokens")
        .delete()
        .in("id", tokenIds);

      if (tokenDeleteError) {
        console.error("Failed to delete expired tokens:", tokenDeleteError);
        break;
      }

      tokensDeleted += expiredTokens.length;
      hasMoreTokens = expiredTokens.length === this.CLEANUP_BATCH_SIZE;
    }

    // Clean up expired authorization codes
    let codesDeleted = 0;
    let hasMoreCodes = true;
    
    while (hasMoreCodes) {
      const { data: expiredCodes, error: codeSelectError } = await supabase
        .from("oauth_codes")
        .select("id")
        .lt("expires_at", now)
        .limit(this.CLEANUP_BATCH_SIZE);

      if (codeSelectError || !expiredCodes || expiredCodes.length === 0) {
        hasMoreCodes = false;
        break;
      }

      const codeIds = expiredCodes.map(code => code.id);
      const { error: codeDeleteError } = await supabase
        .from("oauth_codes")
        .delete()
        .in("id", codeIds);

      if (codeDeleteError) {
        console.error("Failed to delete expired codes:", codeDeleteError);
        break;
      }

      codesDeleted += expiredCodes.length;
      hasMoreCodes = expiredCodes.length === this.CLEANUP_BATCH_SIZE;
    }

    return { tokensDeleted, codesDeleted };
  }

  /**
   * Get token statistics for monitoring
   */
  static async getTokenStats(): Promise<{
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    totalCodes: number;
    expiredCodes: number;
  }> {
    const now = new Date().toISOString();

    // Get token counts
    const { count: totalTokens } = await supabase
      .from("oauth_tokens")
      .select("*", { count: "exact", head: true });

    const { count: activeTokens } = await supabase
      .from("oauth_tokens")
      .select("*", { count: "exact", head: true })
      .gt("expires_at", now);

    const expiredTokens = (totalTokens || 0) - (activeTokens || 0);

    // Get code counts
    const { count: totalCodes } = await supabase
      .from("oauth_codes")
      .select("*", { count: "exact", head: true });

    const { count: activeCodes } = await supabase
      .from("oauth_codes")
      .select("*", { count: "exact", head: true })
      .gt("expires_at", now);

    const expiredCodes = (totalCodes || 0) - (activeCodes || 0);

    return {
      totalTokens: totalTokens || 0,
      activeTokens: activeTokens || 0,
      expiredTokens,
      totalCodes: totalCodes || 0,
      expiredCodes,
    };
  }

  /**
   * List active tokens for a user
   */
  static async getUserTokens(userId: string): Promise<Tables<"oauth_tokens">[]> {
    const now = new Date().toISOString();

    const { data: tokens, error } = await supabase
      .from("oauth_tokens")
      .select("*")
      .eq("user_id", userId)
      .gt("expires_at", now)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get user tokens: ${error.message}`);
    }

    return tokens || [];
  }

  /**
   * List active tokens for a client
   */
  static async getClientTokens(clientId: string): Promise<Tables<"oauth_tokens">[]> {
    const now = new Date().toISOString();

    const { data: tokens, error } = await supabase
      .from("oauth_tokens")
      .select("*")
      .eq("client_id", clientId)
      .gt("expires_at", now)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get client tokens: ${error.message}`);
    }

    return tokens || [];
  }

  /**
   * Validate token and return remaining time
   */
  static async validateTokenWithTiming(accessToken: string): Promise<{
    valid: boolean;
    user?: Tables<"users">;
    expiresIn?: number;
    shouldRefresh?: boolean;
  }> {
    const tokenInfo = await this.getTokenInfo(accessToken);
    
    if (!tokenInfo || tokenInfo.isExpired) {
      return { valid: false };
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", tokenInfo.token.user_id!)
      .single();

    if (userError || !user) {
      return { valid: false };
    }

    // Suggest refresh if token expires in less than 5 minutes
    const shouldRefresh = tokenInfo.expiresIn < 300 && tokenInfo.canRefresh;

    return {
      valid: true,
      user,
      expiresIn: tokenInfo.expiresIn,
      shouldRefresh,
    };
  }

  /**
   * Schedule automatic cleanup (call this periodically)
   */
  static async scheduleCleanup(): Promise<void> {
    try {
      const stats = await this.cleanupExpiredTokens();
      if (stats.tokensDeleted > 0 || stats.codesDeleted > 0) {
        console.log(`Cleaned up ${stats.tokensDeleted} expired tokens and ${stats.codesDeleted} expired codes`);
      }
    } catch (error) {
      console.error("Failed to run scheduled cleanup:", error);
    }
  }

  /**
   * Create a new token with proper expiration
   */
  static async createToken(
    userId: string,
    clientId: string,
    scope: string,
    expiresInHours: number = this.TOKEN_EXPIRY_HOURS
  ): Promise<Tables<"oauth_tokens">> {
    const accessToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const tokenData: TablesInsert<"oauth_tokens"> = {
      user_id: userId,
      client_id: clientId,
      access_token: accessToken,
      refresh_token: refreshToken,
      scope,
      expires_at: expiresAt.toISOString(),
    };

    const { data: token, error } = await supabase
      .from("oauth_tokens")
      .insert(tokenData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create token: ${error.message}`);
    }

    return token;
  }
}