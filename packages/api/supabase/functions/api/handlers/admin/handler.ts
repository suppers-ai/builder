import type { SupabaseClient } from "@supabase/supabase-js";
import { corsHeaders } from "../../lib/cors.ts";
import { getAdminDashboard } from "./dashboard.ts";
import { handleAdminApplications } from "./applications.ts";

/**
 * Admin handler context
 */
export interface AdminContext {
  userId: string;
  supabase: SupabaseClient;
  pathSegments: string[];
}

/**
 * Main admin request handler
 * Routes admin requests to appropriate handlers
 */
export async function handleAdmin(req: Request, context: AdminContext): Promise<Response> {
  const { userId, supabase, pathSegments } = context;
  const method = req.method;
  const url = new URL(req.url);

  console.log("🔧 Admin handler - method:", method, "pathSegments:", pathSegments);
  if (!userId) {
    console.log("❌ Admin access denied: No user provided");
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get the user role from the users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
    
  if (userError) {
    console.error("Error fetching user role:", userError);
  }
  
  const userRole = userData?.role;
  console.log("🔍 User role:", userRole);
  
  if (userRole !== "admin") {
    console.log("❌ Admin access denied: User is not an admin");
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Route based on the first path segment
    const [endpoint, ...rest] = pathSegments;
    
    console.log("🎯 Routing admin request to endpoint:", endpoint, "with rest:", rest);

    switch (endpoint) {
      case "dashboard":
        if (method === "GET") {
          return await getAdminDashboard(supabase, url, userRole);
        }
        break;

      case "applications":
        return await handleAdminApplications(req, supabase, rest);

      case "users":
        // TODO: Implement admin user management endpoints
        return new Response(JSON.stringify({ error: "Admin user management endpoints not yet implemented" }), {
          status: 501,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "subscriptions":
        // TODO: Implement admin subscription management endpoints
        return new Response(JSON.stringify({ error: "Admin subscription endpoints not yet implemented" }), {
          status: 501,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      default:
        return new Response(
          JSON.stringify({
            error: `Unknown admin endpoint: ${endpoint}. Available endpoints: dashboard, applications, users, subscriptions`,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify({ error: `Method ${method} not allowed for endpoint ${endpoint}` }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}