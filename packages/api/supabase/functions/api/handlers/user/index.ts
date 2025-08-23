import { errorResponses, getSupabaseClient } from "../../_common/index.ts";
import { getUser } from "./get-user.ts";
import { createUser } from "./post-user.ts";
import { updateUser } from "./put-user.ts";

export async function handleUserRequest(request: Request): Promise<Response> {
  const supabase = getSupabaseClient();
  const url = new URL(request.url);
  const method = request.method;
  const origin = request.headers.get('origin');

  try {
    switch (method) {
      case "GET":
        return await getUser(supabase, url);
      case "PUT":
        return await updateUser(request, supabase);
      case "POST":
        return await createUser(request, supabase);
      default:
        return errorResponses.methodNotAllowed("Method not allowed", origin || undefined);
    }
  } catch (error) {
    console.error("User handler error:", error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : String(error),
      origin || undefined
    );
  }
}
