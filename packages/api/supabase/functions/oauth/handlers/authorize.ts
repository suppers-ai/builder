import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../../api/lib/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get authorized OAuth clients from database
async function getAuthorizedClient(clientId: string) {
  const { data: client, error } = await supabase
    .from("oauth_clients")
    .select("*")
    .eq("client_id", clientId)
    .single();

  if (error || !client) {
    return null;
  }

  return {
    name: client.name,
    redirectUris: client.redirect_uris,
    allowedScopes: client.allowed_scopes,
    clientSecret: client.client_secret,
  };
}

// Fallback authorized clients for development
const fallbackClients = new Map([
  ["mobile-app-client", {
    name: "Mobile App",
    redirectUris: ["com.yourapp://callback", "http://localhost:3000/callback"],
    allowedScopes: ["openid", "email", "profile"],
  }],
  ["external-web-app", {
    name: "External Web App",
    redirectUris: ["https://external-app.com/auth/callback", "http://localhost:8080/callback"],
    allowedScopes: ["openid", "email", "profile", "applications:read"],
  }],
  ["suppers-store", {
    name: "Suppers Store",
    redirectUris: [
      "http://localhost:8001/auth/callback",
      "https://store.yourdomain.com/auth/callback",
    ],
    allowedScopes: ["openid", "email", "profile", "applications:read", "applications:write"],
  }],
  ["suppers-docs-app", {
    name: "Suppers Docs App",
    redirectUris: [
      "http://localhost:8002/auth/callback",
      "https://docs.yourdomain.com/auth/callback",
    ],
    allowedScopes: ["openid", "email", "profile"],
  }],
]);

export async function handleAuthorizeRequest(url: URL) {
  const clientId = url.searchParams.get("client_id");
  const redirectUri = url.searchParams.get("redirect_uri");
  const responseType = url.searchParams.get("response_type") || "code";
  const scope = url.searchParams.get("scope") || "openid email";
  const state = url.searchParams.get("state");
  const provider = url.searchParams.get("provider") || "google";

  // Validate required parameters
  if (!clientId) {
    return createErrorResponse("invalid_request", "Missing client_id parameter");
  }

  if (!redirectUri) {
    return createErrorResponse("invalid_request", "Missing redirect_uri parameter");
  }

  // Validate client
  let client = await getAuthorizedClient(clientId);
  if (!client) {
    // Fallback to hardcoded clients for development
    const fallbackClient = fallbackClients.get(clientId);
    if (!fallbackClient) {
      return createErrorResponse("invalid_client", "Unknown client_id");
    }
    client = { ...fallbackClient, clientSecret: null };
  }

  // Validate redirect URI
  if (!client.redirectUris.includes(redirectUri)) {
    return createErrorResponse("invalid_request", "Invalid redirect_uri");
  }

  // Validate response type
  if (responseType !== "code") {
    return createErrorResponse("unsupported_response_type", "Only code flow is supported");
  }

  // Validate scopes
  const requestedScopes = scope.split(" ");
  const invalidScopes = requestedScopes.filter((s) => !client.allowedScopes.includes(s));
  if (invalidScopes.length > 0) {
    return createErrorResponse("invalid_scope", `Invalid scopes: ${invalidScopes.join(", ")}`);
  }

  // Generate authorization code and store it
  const authCode = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store authorization code in database (simplified - use proper storage)
  await supabase.from("oauth_codes").insert({
    code: authCode,
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    state: state,
    expires_at: expiresAt.toISOString(),
  });

  // Create authorization URL
  const authUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authUrl.searchParams.set("provider", provider);
  authUrl.searchParams.set(
    "redirect_to",
    `${url.origin}/oauth/callback?code=${authCode}&state=${state || ""}&redirect_uri=${
      encodeURIComponent(redirectUri)
    }`,
  );

  // Redirect to Supabase OAuth
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      "Location": authUrl.toString(),
    },
  });
}

export async function handleTokenRequest(req: Request) {
  const body = await req.formData();
  const grantType = body.get("grant_type");
  const code = body.get("code");
  const redirectUri = body.get("redirect_uri");
  const clientId = body.get("client_id");

  if (grantType !== "authorization_code") {
    return createErrorResponse(
      "unsupported_grant_type",
      "Only authorization_code grant is supported",
    );
  }

  if (!code || !redirectUri || !clientId) {
    return createErrorResponse("invalid_request", "Missing required parameters");
  }

  // Validate client
  let client = await getAuthorizedClient(clientId as string);
  if (!client) {
    // Fallback to hardcoded clients for development
    const fallbackClient = fallbackClients.get(clientId as string);
    if (!fallbackClient) {
      return createErrorResponse("invalid_client", "Unknown client_id");
    }
    client = { ...fallbackClient, clientSecret: null };
  }

  // Retrieve and validate authorization code
  const { data: authCodeData, error } = await supabase
    .from("oauth_codes")
    .select("*")
    .eq("code", code)
    .eq("client_id", clientId)
    .eq("redirect_uri", redirectUri)
    .single();

  if (error || !authCodeData) {
    return createErrorResponse("invalid_grant", "Invalid authorization code");
  }

  // Check if code is expired
  if (new Date(authCodeData.expires_at) < new Date()) {
    return createErrorResponse("invalid_grant", "Authorization code expired");
  }

  // Delete used authorization code
  await supabase.from("oauth_codes").delete().eq("code", code);

  // Create access token (in production, use proper JWT signing)
  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();
  const expiresIn = 3600; // 1 hour

  // Store tokens (simplified - use proper token storage)
  await supabase.from("oauth_tokens").insert({
    access_token: accessToken,
    refresh_token: refreshToken,
    client_id: clientId,
    scope: authCodeData.scope,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  });

  return new Response(
    JSON.stringify({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      refresh_token: refreshToken,
      scope: authCodeData.scope,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

function createErrorResponse(error: string, description?: string) {
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