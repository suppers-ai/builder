import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentUser(_request: Request, supabase: SupabaseClient): Promise<Response> {
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

  if (userError || !authUser) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get user from users table
  const { data: user, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (dbError && dbError.code !== "PGRST116") {
    return new Response(JSON.stringify({ error: dbError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      user: user || authUser,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}