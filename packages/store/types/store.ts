export interface StoreConfig {
  appName: string;
  appIcon: string;
  domain: string;
  allowedOrigins: string[];
  oauthProviders: OAuthProvider[];
}

export interface CallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
  redirect_to?: string;
}

export interface SSORequest {
  client_id: string;
  redirect_uri: string;
  state?: string;
  scope?: string;
}

import type { OAuthProvider } from "./auth.ts";
