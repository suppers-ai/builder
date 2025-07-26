import { Handlers, PageProps } from "$fresh/server.ts";
import { OAuthService, type AuthorizationRequest } from "../../lib/oauth-service.ts";
import { AuthHelpers } from "../../lib/auth-helpers.ts";
import { Button, Card, Input, Alert } from "@suppers/ui-lib";

interface AuthorizeData {
  client?: {
    name: string;
    description?: string;
  };
  request: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state?: string;
    responseType: string;
  };
  user?: {
    email: string;
    name: string;
  };
  error?: string;
}

export const handler: Handlers<AuthorizeData> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const clientId = url.searchParams.get("client_id");
    const redirectUri = url.searchParams.get("redirect_uri");
    const scope = url.searchParams.get("scope") || "openid email profile";
    const state = url.searchParams.get("state");
    const responseType = url.searchParams.get("response_type") || "code";

    // Validate required parameters
    if (!clientId || !redirectUri) {
      return ctx.render({
        request: { clientId: "", redirectUri: "", scope, state, responseType },
        error: "Missing required parameters: client_id and redirect_uri are required",
      });
    }

    if (responseType !== "code") {
      return ctx.render({
        request: { clientId, redirectUri, scope, state, responseType },
        error: "Only authorization code flow (response_type=code) is supported",
      });
    }

    try {
      // Get client information
      const client = await OAuthService.getOAuthClient(clientId);
      if (!client) {
        return ctx.render({
          request: { clientId, redirectUri, scope, state, responseType },
          error: "Invalid client_id",
        });
      }

      // Validate redirect URI
      if (!client.redirect_uris.includes(redirectUri)) {
        return ctx.render({
          request: { clientId, redirectUri, scope, state, responseType },
          error: "Invalid redirect_uri",
        });
      }

      // Validate scopes
      const requestedScopes = scope.split(" ");
      const invalidScopes = requestedScopes.filter(s => !client.allowed_scopes.includes(s));
      if (invalidScopes.length > 0) {
        return ctx.render({
          request: { clientId, redirectUri, scope, state, responseType },
          error: `Invalid scopes: ${invalidScopes.join(", ")}`,
        });
      }

      // Check if user is authenticated
      const user = await AuthHelpers.getCurrentUser();
      if (!user) {
        // Redirect to login with return URL
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", req.url);
        return Response.redirect(loginUrl.toString());
      }

      return ctx.render({
        client: {
          name: client.name,
          description: client.description,
        },
        request: { clientId, redirectUri, scope, state, responseType },
        user: {
          email: user.email || "",
          name: user.user_metadata?.display_name || user.user_metadata?.full_name || "",
        },
      });
    } catch (error) {
      return ctx.render({
        request: { clientId, redirectUri, scope, state, responseType },
        error: error instanceof Error ? error.message : "An error occurred",
      });
    }
  },

  async POST(req, ctx) {
    const url = new URL(req.url);
    const formData = await req.formData();
    
    const clientId = formData.get("client_id")?.toString() || "";
    const redirectUri = formData.get("redirect_uri")?.toString() || "";
    const scope = formData.get("scope")?.toString() || "openid email profile";
    const state = formData.get("state")?.toString();
    const action = formData.get("action")?.toString();

    if (action === "deny") {
      // User denied authorization
      const errorUrl = new URL(redirectUri);
      errorUrl.searchParams.set("error", "access_denied");
      errorUrl.searchParams.set("error_description", "User denied the request");
      if (state) {
        errorUrl.searchParams.set("state", state);
      }
      return Response.redirect(errorUrl.toString());
    }

    try {
      // Get current user
      const user = await AuthHelpers.getCurrentUser();
      if (!user) {
        return Response.redirect("/login");
      }

      // Create authorization code
      const authRequest: AuthorizationRequest = {
        clientId,
        redirectUri,
        scope,
        state,
        responseType: "code",
        userId: user.id,
      };

      const code = await OAuthService.createAuthorizationCode(authRequest);

      // Redirect back to client with authorization code
      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set("code", code);
      if (state) {
        callbackUrl.searchParams.set("state", state);
      }

      return Response.redirect(callbackUrl.toString());
    } catch (error) {
      // Redirect with error
      const errorUrl = new URL(redirectUri);
      errorUrl.searchParams.set("error", "server_error");
      errorUrl.searchParams.set("error_description", error instanceof Error ? error.message : "An error occurred");
      if (state) {
        errorUrl.searchParams.set("state", state);
      }
      return Response.redirect(errorUrl.toString());
    }
  },
};

export default function AuthorizePage({ data }: PageProps<AuthorizeData>) {
  if (data.error) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <Card class="w-full max-w-md">
          <div class="card-body">
            <h2 class="card-title text-error">Authorization Error</h2>
            <Alert type="error" message={data.error} />
            <div class="card-actions justify-end">
              <Button href="/profile" variant="outline">
                Back to Profile
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { client, request, user } = data;

  return (
    <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <Card class="w-full max-w-md">
        <div class="card-body">
          <h2 class="card-title">Authorize Application</h2>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm text-base-content/70">
                <strong>{client?.name}</strong> is requesting access to your account.
              </p>
              {client?.description && (
                <p class="text-sm text-base-content/60 mt-1">
                  {client.description}
                </p>
              )}
            </div>

            <div class="bg-base-100 p-3 rounded-lg">
              <p class="text-sm font-medium mb-2">Requested permissions:</p>
              <ul class="text-sm space-y-1">
                {request.scope.split(" ").map((scope) => (
                  <li key={scope} class="flex items-center gap-2">
                    <span class="w-2 h-2 bg-primary rounded-full"></span>
                    {scope === "openid" && "Basic profile information"}
                    {scope === "email" && "Email address"}
                    {scope === "profile" && "Profile information"}
                    {scope === "read" && "Read access to your data"}
                    {scope === "write" && "Write access to your data"}
                    {scope === "admin" && "Administrative access"}
                  </li>
                ))}
              </ul>
            </div>

            <div class="bg-base-100 p-3 rounded-lg">
              <p class="text-sm">
                <strong>Account:</strong> {user?.name} ({user?.email})
              </p>
            </div>

            <form method="POST" class="space-y-4">
              <input type="hidden" name="client_id" value={request.clientId} />
              <input type="hidden" name="redirect_uri" value={request.redirectUri} />
              <input type="hidden" name="scope" value={request.scope} />
              {request.state && <input type="hidden" name="state" value={request.state} />}
              
              <div class="card-actions justify-between">
                <Button
                  type="submit"
                  name="action"
                  value="deny"
                  variant="outline"
                  color="error"
                >
                  Deny
                </Button>
                <Button
                  type="submit"
                  name="action"
                  value="authorize"
                  variant="solid"
                  color="primary"
                >
                  Authorize
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}