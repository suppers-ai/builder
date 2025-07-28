import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "./lib/cors.ts";
import { handleAuth } from "./handlers/auth/index.ts";
import { handleApplications } from "./handlers/applications/index.ts";
import { handleUserRequest } from "./handlers/user/index.ts";
import { handleAccess } from "./handlers/access/index.ts";

console.log("🚀 API Edge Function loaded");

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
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

    // Get JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authorization token required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create user-scoped Supabase client
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: {
        headers: { Authorization: authHeader! },
      },
    });

    // Route to appropriate handler based on resource
    let response: Response;

    switch (resource) {
      case "auth":
        response = await handleAuth(req, { user, supabase, supabaseAdmin, pathSegments: rest });
        break;

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

      default:
        response = new Response(
          JSON.stringify({ error: `Unknown resource: ${resource}` }),
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
