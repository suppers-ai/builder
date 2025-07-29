import { createClient } from "@supabase/supabase-js";
import type { Database } from "@suppers/shared/generated/database-types";

// Initialize environment variables
let supabaseUrl = "";
let supabaseAnonKey = "";

if (typeof globalThis.Deno !== "undefined") {
  // Server-side: Environment variables should already be loaded by dev.ts
  supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

  console.log("🔍 Profile package - Supabase client initialization (Server):");
  console.log("  SUPABASE_URL:", supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "❌ MISSING");
  console.log(
    "  SUPABASE_ANON_KEY:",
    supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "❌ MISSING",
  );
} else {
  // Browser-side: Get from global variables (injected by server)
  supabaseUrl = (globalThis as any).SUPABASE_URL || "";
  supabaseAnonKey = (globalThis as any).SUPABASE_ANON_KEY || "";

  console.log("🔍 Profile package - Supabase client initialization (Browser):");
  console.log("  SUPABASE_URL:", supabaseUrl ? "✓ Set" : "❌ Missing");
  console.log("  SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "❌ Missing");
}

// Validate required environment variables (only on server-side)
if (typeof globalThis.Deno !== "undefined") {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️  Supabase environment variables not found, they should be loaded by dev.ts");
    console.warn("  SUPABASE_URL:", supabaseUrl ? "✓ Set" : "❌ Missing");
    console.warn("  SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "❌ Missing");
  } else {
    console.log("✅ Environment variables loaded");
  }
}

// Function to get or create Supabase client (lazy initialization)
let _supabase: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseClient() {
  if (!_supabase) {
    // Get latest environment variables
    let url = supabaseUrl;
    let key = supabaseAnonKey;

    try {
      // Try to access Deno environment variables (server-side)
      if (typeof globalThis.Deno !== "undefined") {
        url = Deno.env.get("SUPABASE_URL") || url;
        key = Deno.env.get("SUPABASE_ANON_KEY") || key;
      }
    } catch (e) {
      // Fallback to browser globals
      url = (globalThis as any).SUPABASE_URL || url;
      key = (globalThis as any).SUPABASE_ANON_KEY || key;
    }

    // Final fallback to browser globals if not set above
    if (!url || !key) {
      url = (globalThis as any).SUPABASE_URL || url;
      key = (globalThis as any).SUPABASE_ANON_KEY || key;
    }

    if (!url || !key) {
      console.error("❌ Supabase client cannot be initialized without URL and key");
      console.error("  URL:", url ? "✓ Set" : "❌ Missing");
      console.error("  Key:", key ? "✓ Set" : "❌ Missing");
      console.error(
        "  Browser globals - URL:",
        (globalThis as any).SUPABASE_URL ? "✓ Set" : "❌ Missing",
      );
      console.error(
        "  Browser globals - Key:",
        (globalThis as any).SUPABASE_ANON_KEY ? "✓ Set" : "❌ Missing",
      );
      // Return a mock client to prevent errors
      return null as any;
    }

    _supabase = createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      // Disable realtime to avoid WebSocket dependencies
      realtime: {
        params: {
          eventsPerSecond: 0,
        },
      },
    });
  }

  return _supabase;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) return undefined;
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// Export types for convenience
export type { Database } from "@suppers/shared/generated/database-types";
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
