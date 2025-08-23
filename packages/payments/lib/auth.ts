import { OAuthAuthClient } from "@suppers/auth-client";
import config from "../../../config.ts";

// Create singleton OAuth client for the payments package
let oauthClient: OAuthAuthClient | null = null;

/**
 * Get the singleton OAuth auth client for the payments package
 */
export function getAuthClient(): OAuthAuthClient {
  if (!oauthClient) {
    oauthClient = new OAuthAuthClient(
      config.profileUrl, // http://localhost:8001
      "payments", // client ID for the payments package
    );
  }
  return oauthClient;
}
