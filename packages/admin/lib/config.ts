/**
 * Admin configuration
 */

// Get the API base URL from environment or use local Supabase default
export const API_BASE_URL = Deno.env.get("API_BASE_URL") || 
  "http://127.0.0.1:54321/functions/v1/api/v1/admin";

// For public/browser-side usage, we might need a different URL
export const getApiBaseUrl = () => {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    // In browser, check if we have a custom API URL set
    const customUrl = (window as any).__API_BASE_URL__;
    if (customUrl) return customUrl;
  }
  
  // Default to the configured URL
  return API_BASE_URL;
};