import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ValidateRequest {
  access_token: string;
  client_id?: string;
}

interface ValidateResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  };
  error?: string;
}

export async function handleValidateRequest(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const body: ValidateRequest = await req.json();

    if (!body.access_token) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Missing access token",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Validate the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(body.access_token);

    if (error || !user) {
      return new Response(
        JSON.stringify({
          valid: false,
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

    // Token is valid, return user info
    const response: ValidateResponse = {
      valid: true,
      user: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.display_name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);

    return new Response(
      JSON.stringify({
        valid: false,
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
}
