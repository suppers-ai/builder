import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getApplications(supabase: SupabaseClient, url: URL): Promise<Response> {
  const ownerId = url.searchParams.get("owner_id");
  const applicationId = url.searchParams.get("application_id");

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
  } else if (ownerId) {
    // Get applications by owner
    const { data: applications, error } = await supabase
      .from("applications")
      .select("*")
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false });

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
  } else {
    return new Response(
      JSON.stringify({ error: "owner_id or application_id parameter is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}