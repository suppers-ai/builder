import { errorResponses, jsonResponse } from "../../_common/index.ts";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUser(supabase: SupabaseClient, url: URL): Promise<Response> {
  const userId = url.searchParams.get("user_id");
  const origin = undefined; // Called internally, no direct request context

  if (!userId) {
    return errorResponses.badRequest("User ID is required", origin);
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return errorResponses.notFound("User not found", origin);
    }

    return errorResponses.internalServerError(error.message, origin);
  }

  return jsonResponse({ user }, { status: 200, origin });
}
