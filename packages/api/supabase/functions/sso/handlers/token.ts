import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TokenRequest {
  code: string;
  client_id?: string;
  redirect_uri?: string;
  state?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  };
}

export async function handleTokenRequest(req: Request): Promise<Response> {
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
    const body: TokenRequest = await req.json();

    if (!body.code) {
      return new Response(
        JSON.stringify({
          error: "Missing authorization code",
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

    // Exchange authorization code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(body.code);

    if (error || !data.session) {
      return new Response(
        JSON.stringify({
          error: error?.message || "Invalid authorization code",
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

    const { session } = data;

    // Return token response
    const response: TokenResponse = {
      access_token: session.access_token,
      token_type: "Bearer",
      expires_in: session.expires_in || 3600,
      refresh_token: session.refresh_token,
      scope: "openid email profile",
      user: {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name,
        avatar_url: session.user.user_metadata?.avatar_url,
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
    console.error("Token exchange error:", error);

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
}