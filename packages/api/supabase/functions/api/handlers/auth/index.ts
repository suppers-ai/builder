import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUser } from "./get-current-user.ts";
import { registerUser } from "./register.ts";
import { loginUser } from "./login.ts";
import { logoutUser } from "./logout.ts";
import { refreshToken } from "./refresh.ts";

export async function handleAuth(request: Request, context: { user: any, supabase: SupabaseClient, supabaseAdmin: SupabaseClient, pathSegments: string[] }): Promise<Response> {
  const { supabase } = context;
  const url = new URL(request.url);
  const path = url.pathname.split("/").pop();

  try {
    switch (path) {
      case "me":
        return await getCurrentUser(request, supabase);
      case "register":
        return await registerUser(request, supabase);
      case "login":
        return await loginUser(request, supabase);
      case "logout":
        return await logoutUser(request, supabase);
      case "refresh":
        return await refreshToken(request, supabase);
      default:
        return new Response("Not found", {
          status: 404,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Auth handler error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}