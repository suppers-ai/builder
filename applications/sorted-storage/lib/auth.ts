/**
 * Authentication utilities for the sorted-storage application
 */

import { OAuthAuthClient } from "@suppers/auth-client";
import config from "../../../config.ts";

// Profile service URL - this should be the URL where the profile app is running
const PROFILE_SERVICE_URL = config.profileUrl;
const CLIENT_ID = "sorted-storage-app";

// Create a singleton auth client instance
let authClientInstance: OAuthAuthClient | null = null;

export function getAuthClient(): OAuthAuthClient {
  if (!authClientInstance) {
    authClientInstance = new OAuthAuthClient(PROFILE_SERVICE_URL, CLIENT_ID);
  }
  return authClientInstance;
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const authClient = getAuthClient();
  return authClient.isAuthenticated();
}

// Helper function to get current user ID
export function getCurrentUserId(): string | null {
  const authClient = getAuthClient();
  return authClient.getUserId();
}

// Helper function to get current user info
export async function getCurrentUser() {
  const authClient = getAuthClient();
  return authClient.getUser();
}

// Helper function to sign out
export async function signOut(): Promise<void> {
  const authClient = getAuthClient();
  await authClient.signOut();
}

// Client-side authentication guard for components
export async function requireAuthClient(): Promise<boolean> {
  const authClient = getAuthClient();
  return await authClient.isAuthenticated();
}
