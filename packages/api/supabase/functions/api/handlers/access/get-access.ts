import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAccess(supabase: SupabaseClient, url: URL): Promise<Response> {
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
