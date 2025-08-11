import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createApplication(
  request: Request,
  supabase: SupabaseClient,
): Promise<Response> {
  const body = await request.json();
  const {
    id,
    slug,
    ownerId,
    name,
    description,
    templateId,
    configuration,
    status = "draft",
  } = body;

  if (!ownerId || !name || !slug) {
    return new Response(
      JSON.stringify({
        error: "ownerId, name, and slug are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Check if application with this slug already exists for this user
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("slug", slug)
    .single();

  if (existingApp) {
    return new Response(
      JSON.stringify({
        error: "An application with this ID already exists",
      }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Prepare insert data
  const insertData: any = {
    owner_id: ownerId,
    slug,
    name,
    description: description || null,
    template_id: templateId || null, // Optional template
    configuration: configuration || {},
    status,
  };

  const { data: application, error } = await supabase
    .from("applications")
    .insert(insertData)
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
