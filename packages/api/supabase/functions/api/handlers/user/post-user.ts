import { corsHeaders } from "../../lib/cors.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createUser(request: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await request.json();
  const {
    id,
    email,
    firstName,
    lastName,
    displayName,
    avatarUrl,
    themeId,
    stripeCustomerId,
    role,
  } = body;

  if (!id || !email) {
    return new Response(JSON.stringify({ error: "ID and email are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userData = {
    id,
    email,
    first_name: firstName || null,
    last_name: lastName || null,
    display_name: displayName || null,
    avatar_url: avatarUrl || null,
    theme_id: themeId || null,
    stripe_customer_id: stripeCustomerId || null,
    role: role || 'user',
  };

  const { data: user, error } = await supabase
    .from("users")
    .insert(userData)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ user }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
