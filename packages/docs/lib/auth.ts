import { SSOAuthClient } from "@suppers/auth-client";
import config from "../../../config.ts";

// Create singleton SSOAuthClient for the docs package
let ssoAuthClient: SSOAuthClient | null = null;

/**
 * Get the singleton SSOAuthClient instance for the docs package
 */
export function getAuthClient(): SSOAuthClient {
  if (!ssoAuthClient) {
    // Docs package connects to profile service for SSO
    ssoAuthClient = new SSOAuthClient(config.profileUrl, config.docsUrl);
  }
  return ssoAuthClient;
}