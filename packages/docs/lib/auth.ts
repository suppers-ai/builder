import { OAuthAuthClient } from "@suppers/auth-client";
import config from "../../../config.ts";

// Create singleton OAuth client for the docs package
let oauthClient: OAuthAuthClient | null = null;

/**
 * Get the singleton OAuth auth client for the docs package
 */
export function getAuthClient(): OAuthAuthClient {
  if (!oauthClient) {
    oauthClient = new OAuthAuthClient(
      config.profileUrl, // http://localhost:8001
      "docs" // client ID for the docs package
    );
  }
  return oauthClient;
}
