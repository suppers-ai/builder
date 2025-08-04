import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../../api/lib/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function handleOAuthCallbackRequest(req: Request): Promise<Response> {
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
      return handleOAuthError(redirectUri, error, errorDescription || undefined, state);
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
    // Extract access token from the OAuth flow
    const authHeader = req.headers.get("Authorization");
    const cookieHeader = req.headers.get("Cookie");
    let user = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser }, error: _userError } = await supabase.auth.getUser(token);
      user = authUser;
    }

    // Try to get user from session cookie
    if (!user && cookieHeader) {
      // Extract session from cookie
      const sessionMatch = cookieHeader.match(/sb-access-token=([^;]+)/);
      if (sessionMatch) {
        const sessionToken = sessionMatch[1];
        const { data: { user: sessionUser }, error: _sessionError } = await supabase.auth.getUser(
          sessionToken,
        );
        user = sessionUser;
      }
    }

    // If still no user, this is an error - OAuth flow should have authenticated user
    if (!user) {
      return handleOAuthError(
        redirectUri,
        "access_denied",
        "User not authenticated",
        state,
      );
    }

    // Create authorization response
    const _authResponse = {
      code: code,
      state: state,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.display_name || "OAuth User",
        avatar_url: user.user_metadata?.avatar_url,
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
        user_id: user.id, // Store the authenticated user ID
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
        name: user.user_metadata?.display_name || "OAuth User",
        avatar_url: user.user_metadata?.avatar_url,
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
}

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
