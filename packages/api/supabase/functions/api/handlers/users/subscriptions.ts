import { errorResponses, jsonResponse, getSupabaseClient } from "../../_common/index.ts";

async function getUserSubscriptions(userId: string): Promise<Response> {
  const origin = undefined; // Internal function, no direct request context
  const supabase = getSupabaseClient();
  
  try {
    // Get user data from the users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("storage_used, storage_limit, bandwidth_used, bandwidth_limit")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return errorResponses.internalServerError(userError.message, origin);
    }

    if (!user) {
      return errorResponses.notFound("User not found", origin);
    }

    // Create a mock general subscription based on user's current limits
    const generalSubscription = {
      subscriptionId: "default-free-tier",
      planId: "free-tier",
      planName: "Free Tier",
      storageLimit: (user as any).storage_limit || 0,
      bandwidthLimit: (user as any).bandwidth_limit || 0,
      storageUsed: (user as any).storage_used || 0,
      bandwidthUsed: (user as any).bandwidth_used || 0,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    return jsonResponse({
      success: true,
      generalSubscription,
      applicationSubscriptions: [], // No application subscriptions yet
    }, { status: 200, origin });
  } catch (error) {
    console.error("Error in getUserSubscriptions:", error);
    return errorResponses.internalServerError(
      error instanceof Error ? error.message : String(error),
      origin
    );
  }
}

export async function handleUserSubscriptions(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: { "Access-Control-Allow-Origin": origin || "*" },
    });
  }

  const url = new URL(req.url);
  const userId = req.headers.get("X-User-ID");

  if (!userId) {
    return errorResponses.badRequest("User ID is required", origin || undefined);
  }

  switch (req.method) {
    case "GET":
      return await getUserSubscriptions(userId);
    default:
      return errorResponses.methodNotAllowed(`Method ${req.method} not allowed`, origin || undefined);
  }
}
