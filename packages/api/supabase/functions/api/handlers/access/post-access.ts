import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function grantAccess(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const { applicationId, userId, accessLevel, grantedBy } = body;

  if (!applicationId || !userId || !accessLevel || !grantedBy) {
    return new Response(
      JSON.stringify({
        error: "Application ID, user ID, access level, and granted by are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!["read", "write", "admin"].includes(accessLevel)) {
    return new Response(
      JSON.stringify({
        error: "Access level must be read, write, or admin",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { data: accessRecord, error } = await supabase
    .from("user_access")
    .insert({
      application_id: applicationId,
      user_id: userId,
      access_level: accessLevel,
      granted_by: grantedBy,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") { // Unique constraint violation
      return new Response(
        JSON.stringify({
          error: "User already has access to this application",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ access: accessRecord }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
