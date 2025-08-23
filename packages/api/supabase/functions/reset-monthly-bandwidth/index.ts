import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

console.log("🔄 Monthly Bandwidth Reset Function loaded");

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req: Request) => {
  // This function should only be called internally or via cron
  // Optionally add API key verification here for security

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    console.log("🔄 Starting monthly bandwidth reset...");

    // Get current count of users before reset
    const { count: totalUsers, error: countError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Failed to count users:", countError.message);
    }

    // Call the database function to reset all users' bandwidth usage
    const { error } = await supabaseAdmin.rpc("reset_monthly_bandwidth");

    if (error) {
      console.error("❌ Failed to reset monthly bandwidth:", error.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to reset monthly bandwidth",
          message: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const resetTime = new Date().toISOString();
    console.log(
      `✅ Monthly bandwidth reset completed at ${resetTime} for ${totalUsers || "all"} users`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Monthly bandwidth usage reset successfully",
        resetTime,
        usersAffected: totalUsers || "unknown",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Monthly bandwidth reset error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error during bandwidth reset",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
