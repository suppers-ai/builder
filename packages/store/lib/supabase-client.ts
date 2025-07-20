import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database-types.ts";
import { loadSync } from "@std/dotenv";

console.log("🔍 Store package - Current working directory:", Deno.cwd());
const cwd = Deno.cwd();
const envLocalPath = `${cwd}/../../.env.local`;
const envPath = `${cwd}/../../.env`;

console.log("🔍 Store package - Environment variables:");
console.log("  envLocalPath:", envLocalPath);
console.log("  envPath:", envPath);

loadSync({
  envPath: envLocalPath,
  defaultsPath: envPath,
  export: true,
});

// Get environment variables
const supabaseUrl = globalThis.Deno?.env?.get("SUPABASE_URL") || "";
const supabaseAnonKey = globalThis.Deno?.env?.get("SUPABASE_ANON_KEY") || "";

// Debug environment variables
console.log("🔍 Store package - Supabase client initialization:");
console.log("  SUPABASE_URL:", supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "❌ MISSING");
console.log(
  "  SUPABASE_ANON_KEY:",
  supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "❌ MISSING",
);

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(`
❌ SUPABASE_URL environment variable is required!

Please make sure you have a .env.local file in packages/store/ with:
SUPABASE_URL=https://your-project.supabase.co

Current working directory: ${globalThis.Deno?.cwd?.() || "unknown"}
  `);
}

if (!supabaseAnonKey) {
  throw new Error(`
❌ SUPABASE_ANON_KEY environment variable is required!

Please make sure you have a .env.local file in packages/store/ with:
SUPABASE_ANON_KEY=your-anon-key
  `);
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Export types for convenience
export type { Database } from "./database-types.ts";
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];