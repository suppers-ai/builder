import { corsHeaders, errorResponse, getSupabaseClient } from "../../_common/index.ts";
import { getApplications } from "./get-applications.ts";

export async function handleApplications(request: Request): Promise<Response> {
  const supabase = getSupabaseClient();
  const url = new URL(request.url);
  const method = request.method;

  try {
    switch (method) {
      case "GET":
        return await getApplications(supabase, url);
      default:
        return errorResponse("Method not allowed", { status: 405 });
    }
  } catch (error) {
    console.error("Applications handler error:", error);
    return errorResponse(
      error instanceof Error ? error.message : String(error),
      { status: 500 }
    );
  }
}
