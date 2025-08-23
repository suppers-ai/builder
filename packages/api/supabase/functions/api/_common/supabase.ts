/**
 * Supabase client utilities
 * Provides consistent access to Supabase client across the API
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Get a Supabase client with service role privileges
 * Uses singleton pattern to reuse the same client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  
  cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  return cachedClient;
}

/**
 * Get a Supabase client with user's token
 * Each user gets their own client instance for RLS
 */
export function getUserSupabaseClient(token: string): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}