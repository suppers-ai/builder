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
  const client = authorizedClients.get(clientId);
  if (!client) {
    return createErrorResponse("invalid_client", "Unknown client_id");
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