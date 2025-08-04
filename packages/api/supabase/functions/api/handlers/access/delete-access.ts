import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function revokeAccess(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const { applicationId, userId } = body;

  if (!applicationId || !userId) {
    return new Response(
      JSON.stringify({
        error: "Application ID and user ID are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { error } = await supabase
    .from("user_access")
    .delete()
    .eq("application_id", applicationId)
    .eq("user_id", userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      message: "Access revoked successfully",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
