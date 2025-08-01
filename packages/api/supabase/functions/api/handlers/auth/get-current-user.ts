import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentUser(request: Request, supabase: SupabaseClient): Promise<Response> {
  // Get token from request headers
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return new Response(JSON.stringify({ error: "No token provided" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get user using the token
  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);

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

  // Return auth user with metadata, but also include database user data if available
  const responseUser = {
    ...authUser,
    // Include database user fields if they exist
    ...(user && {
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      theme_id: user.theme_id,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }),
  };

  return new Response(
    JSON.stringify({
      user: responseUser,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}