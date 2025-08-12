import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "./lib/cors.ts";
import { handleApplications } from "./handlers/applications/index.ts";
import { handleUserRequest } from "./handlers/user/index.ts";
import { handleAccess } from "./handlers/access/index.ts";
import { handleStorage } from "./handlers/storage/index.ts";

console.log("🚀 API Edge Function loaded");

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req: Request) => {
  console.log("---------------------------", req);
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    console.log("url", url);
    const pathSegments = url.pathname.split("/").filter((segment) => segment);

    // Extract API version and resource from path
    // Expected format: /api/v1/{resource}/{...}
    const [api, version, resource, ...rest] = pathSegments;

    if (api !== "api" || version !== "v1") {
      return new Response(
        JSON.stringify({ error: "Invalid API path. Expected /api/v1/{resource}" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get authentication from either Authorization header or X-User-ID header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let user = null;
    let supabase = supabaseAdmin; // Default to admin client

    // Try JWT token first (DirectAuthClient)
    if (token) {
      console.log("🔑 Verifying JWT token for endpoint:", resource, rest);

      // Verify JWT and get user
      const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(
        token,
      );

      if (authError || !authUser) {
        console.log("❌ Token verification failed:", authError);
        return new Response(
          JSON.stringify({ error: "Invalid or expired token" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      console.log("✅ JWT token verified for user:", authUser.email);
      user = authUser;
    }
    // No authentication provided
    else {
      console.log("❌ No authentication provided for protected endpoint:", resource, rest);
      return new Response(
        JSON.stringify({ error: "Authentication required (Bearer token or X-User-ID)" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Use admin client for all operations, but pass user context
    supabase = supabaseAdmin;

    // Route to appropriate handler based on resource
    let response: Response;

    console.log("🎯 Routing request to resource:", resource, "with rest:", rest);

    switch (resource) {
      case "applications":
        response = await handleApplications(req, {
          user,
          supabase,
          supabaseAdmin,
          pathSegments: rest,
        });
        break;

      case "user":
        response = await handleUserRequest(req, supabase);
        break;

      case "access":
        response = await handleAccess(req, { user, supabase, supabaseAdmin, pathSegments: rest });
        break;

      case "storage":
        response = await handleStorage(req, { user, supabase, supabaseAdmin, pathSegments: rest });
        break;

      default:
        response = new Response(
          JSON.stringify({
            error:
              `Unknown resource: ${resource}. Available resources: applications, user, access, storage. Auth is handled directly by Supabase.`,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
    }

    return response;
  } catch (error) {
    console.error("API Error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
