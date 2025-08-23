import { corsHeaders } from "../../_common/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getApplications(supabase: SupabaseClient, url: URL): Promise<Response> {
  const applicationId = url.searchParams.get("application_id");
  const status = url.searchParams.get("status");

  if (applicationId) {
    // Get specific application
    const { data: application, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Application not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ application }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } else {
    // Get all applications or filter by status
    let query = supabase
      .from("applications")
      .select("*")
      .order("updated_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: applications, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ applications: applications || [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
