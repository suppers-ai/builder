import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { TypeMappers, type UserResponse } from "../../../shared/utils/type-mappers.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    // Get the access token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Missing or invalid authorization header",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Get user info from Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return new Response(
        JSON.stringify({
          error: error?.message || "Invalid token",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Get additional user data from database
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbError) {
      console.error("Database error fetching user data:", dbError);
      // Continue without database data - we can still return basic user info
    }

    try {
      // Convert Supabase user to canonical database user format
      const canonicalUser = TypeMappers.supabaseUserToUser(user, userData || undefined);
      
      // Convert to API response format using type mapper
      const response = TypeMappers.userToApiResponse(canonicalUser);
      
      if (!response) {
        throw new Error("Failed to convert user to API response format");
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (typeConversionError) {
      console.error("Type conversion error:", typeConversionError);
      
      // Fallback: try safe conversion
      const safeResponse = TypeMappers.safeUserToApiResponse({
        id: user.id,
        email: user.email || "",
        first_name: userData?.first_name || user.user_metadata?.first_name,
        last_name: userData?.last_name || user.user_metadata?.last_name,
        display_name: userData?.display_name || user.user_metadata?.display_name,
        avatar_url: userData?.avatar_url || user.user_metadata?.avatar_url,
        role: userData?.role || 'user',
        created_at: userData?.created_at || user.created_at,
        updated_at: userData?.updated_at || user.updated_at || user.created_at,
      });

      if (safeResponse) {
        return new Response(JSON.stringify(safeResponse), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // If safe conversion also fails, return error
      return new Response(
        JSON.stringify({
          error: "Failed to process user data",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
  } catch (error) {
    console.error("Get user error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
