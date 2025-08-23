import { errorResponses, jsonResponse } from "../../_common/index.ts";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function createUser(request: Request, supabase: SupabaseClient): Promise<Response> {
  const origin = request.headers.get('origin');
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
    return errorResponses.badRequest("ID and email are required", origin || undefined);
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
    role: role || "user",
  };

  const { data: user, error } = await supabase
    .from("users")
    .insert(userData)
    .select()
    .single();

  if (error) {
    return errorResponses.internalServerError(error.message, origin || undefined);
  }

  return jsonResponse({ user }, { status: 201, origin: origin || undefined });
}
