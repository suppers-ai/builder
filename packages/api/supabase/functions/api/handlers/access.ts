import { corsHeaders } from "../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function handleAccess(request: Request, context: { user: any, supabase: SupabaseClient, supabaseAdmin: SupabaseClient, pathSegments: string[] }): Promise<Response> {
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function getAccess(supabase: SupabaseClient, url: URL): Promise<Response> {
  const applicationId = url.searchParams.get("application_id");
  const userId = url.searchParams.get("user_id");

  if (!applicationId) {
    return new Response(JSON.stringify({ error: "Application ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let query = supabase
    .from("user_access")
    .select(`
      *,
      users!user_access_user_id_fkey (*)
    `)
    .eq("application_id", applicationId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const accessRecords = data?.map((record) => ({
    ...record,
    user: record.users,
  })) || [];

  return new Response(
    JSON.stringify({
      access: userId ? accessRecords[0] || null : accessRecords,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function grantAccess(request: Request, supabase: SupabaseClient): Promise<Response> {
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

async function revokeAccess(request: Request, supabase: SupabaseClient): Promise<Response> {
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
