import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateUser(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const {
    id,
    email,
    firstName,
    middleNames,
    lastName,
    displayName,
    avatarUrl,
  } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (email !== undefined) updateData.email = email;
  if (firstName !== undefined) updateData.first_name = firstName;
  if (middleNames !== undefined) updateData.middle_names = middleNames;
  if (lastName !== undefined) updateData.last_name = lastName;
  if (displayName !== undefined) updateData.display_name = displayName;
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

  const { data: user, error } = await supabase
    .from("users")
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

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}