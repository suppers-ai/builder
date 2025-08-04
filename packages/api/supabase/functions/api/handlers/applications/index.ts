import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getApplications } from "./get-applications.ts";
import { createApplication } from "./post-applications.ts";
import { updateApplication } from "./put-applications.ts";
import { deleteApplication } from "./delete-applications.ts";

export async function handleApplications(
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
        return await getApplications(supabase, url);
      case "POST":
        return await createApplication(request, supabase);
      case "PUT":
        return await updateApplication(request, supabase);
      case "DELETE":
        return await deleteApplication(request, supabase);
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
