import { corsHeaders } from "../../lib/cors.ts";
import { createSupabaseServiceRoleClient } from "../../lib/supabase.ts";

export async function handleUserSubscriptions(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = req.headers.get("X-User-ID");

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  switch (req.method) {
    case "GET":
      return await getUserSubscriptions(userId);
    default:
      return new Response(JSON.stringify({ error: `Method ${req.method} not allowed` }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
  }
}

async function getUserSubscriptions(userId: string): Promise<Response> {
  const supabase = createSupabaseServiceRoleClient();

  try {
    // Get user's general subscription
    const { data: generalData, error: generalError } = await supabase
      .rpc('get_user_general_subscription', { user_uuid: userId });

    if (generalError) {
      console.error("Error fetching general subscription:", generalError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch general subscription",
        details: generalError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get user's application subscriptions
    const { data: appData, error: appError } = await supabase
      .rpc('get_user_application_subscriptions', { user_uuid: userId });

    if (appError) {
      console.error("Error fetching application subscriptions:", appError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch application subscriptions",
        details: appError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Format the response
    const generalSubscription = generalData && generalData.length > 0 ? {
      subscriptionId: generalData[0].subscription_id,
      planId: generalData[0].plan_id,
      planName: generalData[0].plan_name,
      storageLimit: generalData[0].storage_limit,
      bandwidthLimit: generalData[0].bandwidth_limit,
      storageUsed: generalData[0].storage_used,
      bandwidthUsed: generalData[0].bandwidth_used,
      currentPeriodEnd: generalData[0].current_period_end
    } : null;

    const applicationSubscriptions = appData?.map((app: any) => ({
      subscriptionId: app.subscription_id,
      planId: app.plan_id,
      planName: app.plan_name,
      applicationId: app.application_id,
      applicationName: app.application_name,
      currentPeriodEnd: app.current_period_end,
      features: app.features || []
    })) || [];

    return new Response(JSON.stringify({
      success: true,
      generalSubscription,
      applicationSubscriptions
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Unexpected error fetching user subscriptions:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}