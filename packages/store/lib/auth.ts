import { OAuthAuthClient } from "@suppers/auth-client";
import config from "../../../config.ts";

// Create singleton OAuthAuthClient for the store package
let oauthAuthClient: OAuthAuthClient | null = null;

/**
 * Get the singleton OAuthAuthClient instance for the store package
 */
export function getAuthClient(): OAuthAuthClient {
  if (!oauthAuthClient) {
    // Store package connects to profile service for OAuth SSO
    oauthAuthClient = new OAuthAuthClient(
      config.profileUrl,
      "store",
    );
  }
  return oauthAuthClient;
}
