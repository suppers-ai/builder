import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../../api/lib/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Authorized OAuth clients (in production, store in database)
const authorizedClients = new Map([
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
  ["partner-integration", {
    name: "Partner Integration",
    redirectUris: ["https://partner.com/oauth/callback"],
    allowedScopes: ["openid", "email", "profile", "applications:read", "applications:write"],
  }],
]);

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
  const client = authorizedClients.get(clientId as string);
  if (!client) {
    return createErrorResponse("invalid_client", "Unknown client_id");
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