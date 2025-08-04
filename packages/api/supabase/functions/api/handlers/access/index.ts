import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAccess } from "./get-access.ts";
import { grantAccess } from "./post-access.ts";
import { revokeAccess } from "./delete-access.ts";

export async function handleAccess(
  request: Request,
  context: {
    user: any;
    supabase: SupabaseClient;
    supabaseAdmin: SupabaseClient;
    pathSegments: string[];
  },
): Promise<Response> {
  const { supabase } = context;
  const url = new URL(request.url);
  const method = request.method;

  try {
    switch (method) {
      case "GET":
        return await getAccess(supabase, url);
      case "POST":
        return await grantAccess(request, supabase);
      case "DELETE":
        return await revokeAccess(request, supabase);
      default:
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Access handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}
