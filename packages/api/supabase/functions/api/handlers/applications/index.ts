import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getApplications } from "./get-applications.ts";

export async function handleApplications(
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
        return await getApplications(supabase, url);
      default:
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Applications handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}
