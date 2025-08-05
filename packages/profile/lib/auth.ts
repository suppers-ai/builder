import { DirectAuthClient } from "@suppers/auth-client";
import config from "../../../config.ts";

// Create singleton DirectAuthClient for the profile package
let directAuthClient: DirectAuthClient | null = null;

/**
 * Get the singleton DirectAuthClient instance for the profile package
 */
export function getAuthClient(): DirectAuthClient {
  if (!directAuthClient) {
    directAuthClient = new DirectAuthClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
    );
  }
  return directAuthClient;
}