import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../api/lib/cors.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Extract parameters from URL
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const redirectUri = url.searchParams.get("redirect_uri");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      return handleOAuthError(redirectUri, error, errorDescription, state);
    }

    // Validate required parameters
    if (!code || !redirectUri) {
      return handleOAuthError(
        redirectUri,
        "invalid_request",
        "Missing code or redirect_uri parameter",
        state,
      );
    }

    // Get authorization code details
    const { data: authCodeData, error: codeError } = await supabase
      .from("oauth_codes")
      .select("*")
      .eq("code", code)
      .eq("state", state || "")
      .single();

    if (codeError || !authCodeData) {
      return handleOAuthError(
        redirectUri,
        "invalid_grant",
        "Invalid authorization code",
        state,
      );
    }

    // Check if code is expired
    if (new Date(authCodeData.expires_at) < new Date()) {
      return handleOAuthError(
        redirectUri,
        "invalid_grant",
        "Authorization code expired",
        state,
      );
    }

    // Get user session from Supabase auth
    // This would typically come from the OAuth flow
    const authHeader = req.headers.get("Authorization");
    let user = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
      user = authUser;
    }

    // If no user from auth header, try to get from session
    if (!user) {
      // In a real scenario, you'd have the session from the OAuth flow
      // For now, we'll create a mock user response
      user = {
        id: crypto.randomUUID(),
        email: "oauth-user@external.app",
        first_name: "OAuth",
        middle_names: null,
        last_name: "User",
        display_name: "OAuth User",
        avatar_url: null,
      };
    }

    // Create authorization response
    const authResponse = {
      code: code,
      state: state,
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name || "OAuth User",
        avatar_url: user.avatar_url,
      },
    };

    // Redirect back to external app with authorization code
    const finalRedirectUrl = new URL(redirectUri);
    finalRedirectUrl.searchParams.set("code", code);
    if (state) {
      finalRedirectUrl.searchParams.set("state", state);
    }

    // Generate access token
    const accessToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store the access token
    const { error: tokenError } = await supabase
      .from("oauth_tokens")
      .insert({
        access_token: accessToken,
        refresh_token: refreshToken,
        client_id: authCodeData.client_id,
        user_id: null, // OAuth user, not tied to our users table
        scope: authCodeData.scope,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      return new Response(
        JSON.stringify({
          error: "Failed to create access token",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Clean up the authorization code
    await supabase
      .from("oauth_codes")
      .delete()
      .eq("code", code);

    // Return token response with user info
    const tokenResponse = {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: authCodeData.scope,
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name || "OAuth User",
        avatar_url: user.avatar_url,
      },
    };

    return new Response(JSON.stringify(tokenResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);

    const url = new URL(req.url);
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state");

    return handleOAuthError(
      redirectUri,
      "server_error",
      "Internal server error",
      state,
    );
  }
});

function handleOAuthError(
  redirectUri: string | null,
  error: string,
  description?: string,
  state?: string | null,
) {
  if (!redirectUri) {
    // If no redirect URI, return error directly
    return new Response(
      JSON.stringify({
        error,
        error_description: description,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Redirect to external app with error
  const errorRedirectUrl = new URL(redirectUri);
  errorRedirectUrl.searchParams.set("error", error);
  if (description) {
    errorRedirectUrl.searchParams.set("error_description", description);
  }
  if (state) {
    errorRedirectUrl.searchParams.set("state", state);
  }

  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      "Location": errorRedirectUrl.toString(),
    },
  });
}
