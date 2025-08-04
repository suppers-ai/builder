import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createApplication(
  request: Request,
  supabase: SupabaseClient,
): Promise<Response> {
  const body = await request.json();
  const {
    ownerId,
    name,
    description,
    templateId,
    configuration,
    status = "draft",
  } = body;

  if (!ownerId || !name || !templateId) {
    return new Response(
      JSON.stringify({
        error: "ownerId, name, and templateId are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      owner_id: ownerId,
      name,
      description,
      template_id: templateId,
      configuration: configuration || {},
      status,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ application }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
