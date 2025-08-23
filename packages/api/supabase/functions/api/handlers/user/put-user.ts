import { errorResponses, jsonResponse } from "../../_common/index.ts";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateUser(request: Request, supabase: SupabaseClient): Promise<Response> {
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

  console.log(body);

  if (!id) {
    return errorResponses.badRequest("User ID is required", origin || undefined);
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (email !== undefined) updateData.email = email;
  if (firstName !== undefined) updateData.first_name = firstName;
  if (lastName !== undefined) updateData.last_name = lastName;
  if (displayName !== undefined) updateData.display_name = displayName;
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
  if (themeId !== undefined) updateData.theme_id = themeId;
  if (stripeCustomerId !== undefined) updateData.stripe_customer_id = stripeCustomerId;
  if (role !== undefined) updateData.role = role;

  const { data: user, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return errorResponses.internalServerError(error.message, origin || undefined);
  }

  return jsonResponse({ user }, { status: 200, origin: origin || undefined });
}
