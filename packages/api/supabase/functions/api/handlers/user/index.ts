import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "./get-user.ts";
import { createUser } from "./post-user.ts";
import { updateUser } from "./put-user.ts";

export async function handleUserRequest(
  request: Request,
  context: {
    supabase: SupabaseClient;
  },
): Promise<Response> {
  const { supabase } = context;
  const url = new URL(request.url);
  const method = request.method;

  try {
    switch (method) {
      case "GET":
        return await getUser(supabase, url);
      case "PUT":
        return await updateUser(request, supabase);
      case "POST":
        return await createUser(request, supabase);
      default:
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("User handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}
