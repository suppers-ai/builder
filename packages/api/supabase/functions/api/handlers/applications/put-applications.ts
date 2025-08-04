import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateApplication(
  request: Request,
  supabase: SupabaseClient,
): Promise<Response> {
  const body = await request.json();
  const {
    id,
    name,
    description,
    templateId,
    configuration,
    status,
  } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "Application ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (templateId !== undefined) updateData.template_id = templateId;
  if (configuration !== undefined) updateData.configuration = configuration;
  if (status !== undefined) updateData.status = status;

  const { data: application, error } = await supabase
    .from("applications")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ application }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
